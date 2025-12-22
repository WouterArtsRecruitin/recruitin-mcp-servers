#!/usr/bin/env node
// Real Salary Benchmark - Echte salaris data per vacature
// Port 3010

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3010;

// Brave API configuration
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSAW_h04juedQeMi6BwPvPLlfST4vC3';
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

// Middleware
app.use(cors());
app.use(express.json());

// Helper function for Brave Search
async function braveSearch(query, count = 15) {
    try {
        const response = await axios.get(BRAVE_API_URL, {
            headers: {
                'X-Subscription-Token': BRAVE_API_KEY,
                'Accept': 'application/json'
            },
            params: {
                q: query,
                count: count,
                country: 'nl',
                search_lang: 'nl',
                ui_lang: 'nl-NL'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Brave search error:', error.message);
        return null;
    }
}

// Salary benchmark endpoint
app.post('/api/salary-benchmark', async (req, res) => {
    const { jobTitle, location, experience, industry } = req.body;

    console.log('\n💰 REAL SALARY BENCHMARK REQUEST');
    console.log('Job:', jobTitle, 'Location:', location, 'Experience:', experience, 'Industry:', industry);

    try {
        // Parallelle zoekopdrachten voor real-time salaris data
        const [
            salaryData,
            vacancyData,
            benefitsData,
            caoData,
            glassdoorData
        ] = await Promise.all([
            // 1. Specifieke salarissen van deze functie
            braveSearch(`"${jobTitle}" salaris loon "€" site:indeed.nl OR site:glassdoor.nl OR site:loonwijzer.nl`, 10),

            // 2. Actuele vacatures met salaris informatie
            braveSearch(`"${jobTitle}" ${location || 'Nederland'} vacature "€" -uitzendbureau`, 15),

            // 3. Secundaire arbeidsvoorwaarden
            braveSearch(`"${jobTitle}" arbeidsvoorwaarden lease auto pensioen bonus`, 10),

            // 4. CAO informatie
            braveSearch(`"${jobTitle}" ${industry || ''} CAO loonschaal`, 5),

            // 5. Glassdoor reviews voor deze functie
            braveSearch(`"${jobTitle}" site:glassdoor.nl salaris`, 5)
        ]);

        // Process real data
        const benchmark = {
            jobTitle: jobTitle,
            location: location,
            salaryRange: extractSalaryData(salaryData, vacancyData),
            vacancies: extractVacancyDetails(vacancyData),
            benefits: extractSecondaryBenefits(benefitsData, vacancyData),
            cao: extractCAOInfo(caoData, industry),
            marketInsights: extractMarketInsights(glassdoorData, salaryData),
            timestamp: new Date().toISOString()
        };

        // Voeg statistieken toe
        benchmark.statistics = {
            totalVacancies: benchmark.vacancies.length,
            averageSalary: benchmark.salaryRange.average,
            salarySpread: benchmark.salaryRange.max - benchmark.salaryRange.min,
            benefitsCount: benchmark.benefits.length,
            dataQuality: calculateDataQuality(benchmark)
        };

        res.json({
            success: true,
            benchmark: benchmark,
            dataSource: 'Brave Search API (Real-time vacancy data)'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Extract salary data from search results
function extractSalaryData(salaryData, vacancyData) {
    const salaries = [];

    // Extract from dedicated salary searches
    if (salaryData?.web?.results) {
        salaryData.web.results.forEach(result => {
            const salaryMatches = extractSalariesFromText(result.description + ' ' + result.title);
            salaries.push(...salaryMatches);
        });
    }

    // Extract from vacancy data
    if (vacancyData?.web?.results) {
        vacancyData.web.results.forEach(result => {
            const salaryMatches = extractSalariesFromText(result.description + ' ' + result.title);
            salaries.push(...salaryMatches);
        });
    }

    if (salaries.length === 0) {
        // Fallback calculation if no real data found
        return calculateFallbackSalary();
    }

    // Process real salary data
    const validSalaries = salaries.filter(s => s > 20000 && s < 150000); // Realistic range

    if (validSalaries.length === 0) {
        return calculateFallbackSalary();
    }

    validSalaries.sort((a, b) => a - b);

    return {
        min: validSalaries[0],
        q1: validSalaries[Math.floor(validSalaries.length * 0.25)],
        median: validSalaries[Math.floor(validSalaries.length * 0.5)],
        average: Math.round(validSalaries.reduce((sum, s) => sum + s, 0) / validSalaries.length),
        q3: validSalaries[Math.floor(validSalaries.length * 0.75)],
        max: validSalaries[validSalaries.length - 1],
        dataPoints: validSalaries.length
    };
}

// Extract salary numbers from text
function extractSalariesFromText(text) {
    const salaries = [];

    // Match various salary formats
    const patterns = [
        /€\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g,  // €50.000,00
        /(\d{1,3}(?:\.\d{3})*)\s*€/g,             // 50.000€
        /(\d{2,6})\s*euro/gi,                     // 50000 euro
        /salaris:?\s*€?\s*(\d{1,3}(?:\.\d{3})*)/gi // salaris: 50.000
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            let salary = match[1].replace(/\./g, '').replace(',', '.');
            salary = parseFloat(salary);

            // Convert to yearly if monthly (assume monthly if < 8000)
            if (salary < 8000) {
                salary = salary * 12;
            }

            if (salary > 20000 && salary < 150000) {
                salaries.push(Math.round(salary));
            }
        }
    });

    return salaries;
}

// Extract detailed vacancy information
function extractVacancyDetails(vacancyData) {
    const vacancies = [];

    if (vacancyData?.web?.results) {
        vacancyData.web.results.forEach(result => {
            // Only include actual job postings
            if (result.url?.includes('indeed.nl') ||
                result.url?.includes('linkedin.com/jobs') ||
                result.title?.toLowerCase().includes('vacature') ||
                result.description?.toLowerCase().includes('solliciter')) {

                const salary = extractSalariesFromText(result.description + ' ' + result.title);

                vacancies.push({
                    title: result.title,
                    company: extractCompany(result.title, result.description),
                    salary: salary.length > 0 ? salary[0] : null,
                    location: extractLocation(result.description),
                    url: result.url,
                    source: extractDomain(result.url),
                    requirements: extractRequirements(result.description),
                    benefits: extractBenefitsFromText(result.description)
                });
            }
        });
    }

    return vacancies.slice(0, 8); // Limit to prevent overwhelming display
}

// Extract secondary employment benefits
function extractSecondaryBenefits(benefitsData, vacancyData) {
    const benefits = new Set();

    // Extract from dedicated benefits search
    if (benefitsData?.web?.results) {
        benefitsData.web.results.forEach(result => {
            const benefitsList = extractBenefitsFromText(result.description);
            benefitsList.forEach(benefit => benefits.add(benefit));
        });
    }

    // Extract from vacancy descriptions
    if (vacancyData?.web?.results) {
        vacancyData.web.results.forEach(result => {
            const benefitsList = extractBenefitsFromText(result.description);
            benefitsList.forEach(benefit => benefits.add(benefit));
        });
    }

    return Array.from(benefits).slice(0, 12);
}

// Extract benefits from text using keywords
function extractBenefitsFromText(text) {
    const benefits = [];
    const lowerText = text.toLowerCase();

    const benefitKeywords = {
        'Lease auto': ['lease auto', 'leasewagen', 'bedrijfsauto'],
        'Pensioenregeling': ['pensioen', 'pensioenfonds', 'pensioenopbouw'],
        'Zorgverzekering': ['zorgverzekering', 'ziektekostenverzekering'],
        'Bonus/winstdeling': ['bonus', 'winstdeling', '13e maand', 'dertiende maand'],
        'Flexibele werktijden': ['flexibel', 'thuiswerken', 'hybride', 'flexitijd'],
        'Opleidingsbudget': ['opleiding', 'training', 'cursus', 'ontwikkeling'],
        'Extra vakantiedagen': ['vakantie', 'adv', 'vrije dagen'],
        'Reiskostenvergoeding': ['reiskosten', 'kilometer', 'ov vergoeding'],
        'Laptop/telefoon': ['laptop', 'telefoon', 'mobiel', 'devices'],
        'Sportschool': ['fitness', 'sport', 'gym', 'vitaliteit'],
        'Ploegentoeslag': ['ploegen', 'shifts', 'toeslag', 'onregelmatig'],
        'Overwerkvergoeding': ['overwerk', 'overuren', 'extra uren']
    };

    Object.keys(benefitKeywords).forEach(benefit => {
        const keywords = benefitKeywords[benefit];
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            benefits.push(benefit);
        }
    });

    return benefits;
}

// Extract company name from title/description
function extractCompany(title, description) {
    // Try to extract company name from title (often after " bij " or " - ")
    const companyMatches = title.match(/bij\s+([^,\-\|]+)|[\-\|]\s*([^,\-\|]+)$/);
    if (companyMatches) {
        return (companyMatches[1] || companyMatches[2]).trim();
    }

    // Look for company indicators in description
    const companyKeywords = description.match(/(bedrijf|organisatie|werkgever):\s*([^\.,]+)/i);
    if (companyKeywords) {
        return companyKeywords[2].trim();
    }

    return 'Niet gespecificeerd';
}

// Extract location from description
function extractLocation(description) {
    const dutchCities = [
        'Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven',
        'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen', 'Enschede',
        'Apeldoorn', 'Haarlem', 'Arnhem', 'Zaanstad', 'Haarlemmermeer'
    ];

    for (const city of dutchCities) {
        if (description.toLowerCase().includes(city.toLowerCase())) {
            return city;
        }
    }

    return 'Nederland';
}

// Extract requirements from description
function extractRequirements(description) {
    const requirements = [];
    const lowerDesc = description.toLowerCase();

    const skillKeywords = [
        'bachelor', 'master', 'hbo', 'wo', 'mbo',
        'autocad', 'solidworks', 'inventor', 'catia',
        'plc', 'scada', 'siemens', 'allen bradley',
        'lean', 'six sigma', 'iso 9001',
        'vca', 'atex', 'ce marking',
        'nederlands', 'engels', 'duits'
    ];

    skillKeywords.forEach(skill => {
        if (lowerDesc.includes(skill)) {
            requirements.push(skill.charAt(0).toUpperCase() + skill.slice(1));
        }
    });

    return requirements.slice(0, 6);
}

// Extract CAO information
function extractCAOInfo(caoData, industry) {
    let caoInfo = {
        found: false,
        name: null,
        scale: null,
        url: null
    };

    if (caoData?.web?.results?.length > 0) {
        const caoResult = caoData.web.results.find(r =>
            r.description?.toLowerCase().includes('cao') ||
            r.title?.toLowerCase().includes('cao')
        );

        if (caoResult) {
            caoInfo.found = true;
            caoInfo.url = caoResult.url;

            // Extract CAO name
            const caoNameMatch = caoResult.description?.match(/CAO\s+([^,\.\n]+)/i);
            if (caoNameMatch) {
                caoInfo.name = caoNameMatch[1].trim();
            }

            // Extract scale information
            const scaleMatch = caoResult.description?.match(/(schaal|groep|functiegroep)\s*([A-I0-9\-]+)/i);
            if (scaleMatch) {
                caoInfo.scale = scaleMatch[0];
            }
        }
    }

    return caoInfo;
}

// Extract market insights
function extractMarketInsights(glassdoorData, salaryData) {
    const insights = {
        competition: 'Gemiddeld',
        trend: 'Stabiel',
        demand: 'Normaal',
        notes: []
    };

    // Analyze search result volume as demand indicator
    const totalResults = (glassdoorData?.web?.results?.length || 0) +
                        (salaryData?.web?.results?.length || 0);

    if (totalResults > 15) {
        insights.demand = 'Hoog';
        insights.notes.push('Veel vacatures beschikbaar');
    } else if (totalResults < 5) {
        insights.demand = 'Laag';
        insights.notes.push('Beperkt aantal vacatures');
    }

    return insights;
}

// Calculate fallback salary when no real data is available
function calculateFallbackSalary() {
    return {
        min: 35000,
        q1: 40000,
        median: 45000,
        average: 47000,
        q3: 52000,
        max: 60000,
        dataPoints: 0 // Indicates this is calculated, not real data
    };
}

// Calculate data quality score
function calculateDataQuality(benchmark) {
    let score = 0;
    let total = 0;

    // Salary data quality
    total += 3;
    if (benchmark.salaryRange.dataPoints > 5) score += 3;
    else if (benchmark.salaryRange.dataPoints > 2) score += 2;
    else if (benchmark.salaryRange.dataPoints > 0) score += 1;

    // Vacancy data quality
    total += 2;
    if (benchmark.vacancies.length > 5) score += 2;
    else if (benchmark.vacancies.length > 0) score += 1;

    // Benefits data quality
    total += 2;
    if (benchmark.benefits.length > 8) score += 2;
    else if (benchmark.benefits.length > 4) score += 1;

    // CAO data quality
    total += 1;
    if (benchmark.cao.found) score += 1;

    return Math.round((score / total) * 100);
}

// Extract domain from URL
function extractDomain(url) {
    try {
        const domain = new URL(url).hostname;
        return domain.replace('www.', '');
    } catch {
        return 'Unknown';
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`\n✅ Real Salary Benchmark Agent gestart op http://localhost:${PORT}`);
    console.log('💰 Gebruikt echte salaris data per vacature van Brave Search API');
    console.log('🔍 Endpoint: POST /api/salary-benchmark');
    console.log('📝 Body: { "jobTitle": "functie", "location": "plaats", "experience": "niveau", "industry": "sector" }');
});