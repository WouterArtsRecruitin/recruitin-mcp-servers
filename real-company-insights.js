#!/usr/bin/env node
// Real Company Insights - Alleen echte data van Brave Search
// Port 3008

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3008;

// Brave API configuration
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSAW_h04juedQeMi6BwPvPLlfST4vC3';
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

// Middleware
app.use(cors());
app.use(express.json());

// Helper function for Brave Search
async function braveSearch(query, count = 10) {
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

// Company insights endpoint
app.post('/api/company-insights', async (req, res) => {
    const { company } = req.body;

    console.log('\n🏢 REAL COMPANY INSIGHTS REQUEST');
    console.log('Company:', company);

    try {
        // Alle zoekopdrachten parallel uitvoeren
        const [
            profileData,
            vacancyData,
            newsData,
            kvkData,
            glassdoorData,
            linkedinData
        ] = await Promise.all([
            // 1. Bedrijfsprofiel
            braveSearch(`${company} bedrijfsinformatie profiel site:kvk.nl OR site:companyinfo.nl`, 5),

            // 2. Actuele vacatures
            braveSearch(`${company} vacatures werken bij site:indeed.nl OR site:linkedin.com/jobs`, 10),

            // 3. Recent nieuws
            braveSearch(`${company} nieuws uitbreiding groei 2024 2025`, 10),

            // 4. KvK informatie
            braveSearch(`${company} kvk nummer medewerkers omzet`, 5),

            // 5. Glassdoor reviews
            braveSearch(`${company} site:glassdoor.nl reviews salaris`, 5),

            // 6. LinkedIn bedrijfsinfo
            braveSearch(`${company} site:linkedin.com/company employees`, 5)
        ]);

        // Process real data
        const insights = {
            profile: extractCompanyProfile(profileData, kvkData),
            vacancies: extractVacancies(vacancyData),
            news: extractNews(newsData),
            reviews: extractReviews(glassdoorData),
            employees: extractEmployeeData(linkedinData),
            sources: {
                kvk: kvkData?.web?.results?.[0]?.url || null,
                linkedin: linkedinData?.web?.results?.[0]?.url || null,
                glassdoor: glassdoorData?.web?.results?.[0]?.url || null
            }
        };

        // Voeg echte statistieken toe
        insights.statistics = {
            totalVacancies: insights.vacancies.length,
            newsArticles: insights.news.length,
            hasGlassdoorReviews: insights.reviews.rating ? true : false,
            dataCompleteness: calculateDataCompleteness(insights)
        };

        res.json({
            success: true,
            company: company,
            timestamp: new Date().toISOString(),
            insights: insights,
            dataSource: 'Brave Search API (Real-time)'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Extract company profile from search results
function extractCompanyProfile(profileData, kvkData) {
    const profile = {
        found: false,
        name: null,
        description: null,
        industry: null,
        location: null,
        kvkNumber: null,
        website: null
    };

    // Extract from profile search
    if (profileData?.web?.results?.length > 0) {
        const firstResult = profileData.web.results[0];
        profile.found = true;
        profile.description = firstResult.description || null;

        // Extract KVK number if in URL or description
        const kvkMatch = firstResult.description?.match(/KVK:?\s*(\d{8})/i) ||
                        firstResult.url?.match(/kvk\/(\d{8})/);
        if (kvkMatch) {
            profile.kvkNumber = kvkMatch[1];
        }
    }

    // Extract from KVK search
    if (kvkData?.web?.results?.length > 0) {
        kvkData.web.results.forEach(result => {
            // Extract location
            if (!profile.location && result.description) {
                const locationMatch = result.description.match(/(Amsterdam|Rotterdam|Utrecht|Den Haag|Eindhoven|Groningen|Tilburg|Almere|Breda|Nijmegen|Arnhem|Apeldoorn|Haarlem|Enschede|Haarlemmermeer|Amersfoort|Zaanstad|'s-Hertogenbosch|Zwolle|Zoetermeer|Leeuwarden|Leiden|Dordrecht|Maastricht|Ede|Alphen aan den Rijn|Alkmaar|Emmen|Westland|Venlo|Delft)/i);
                if (locationMatch) {
                    profile.location = locationMatch[1];
                }
            }

            // Extract industry
            if (!profile.industry && result.description) {
                const industryKeywords = [
                    'technologie', 'software', 'IT', 'consultancy', 'logistiek',
                    'productie', 'manufacturing', 'retail', 'financieel', 'bank',
                    'verzekering', 'bouw', 'energie', 'zorg', 'onderwijs'
                ];

                for (const keyword of industryKeywords) {
                    if (result.description.toLowerCase().includes(keyword)) {
                        profile.industry = keyword.charAt(0).toUpperCase() + keyword.slice(1);
                        break;
                    }
                }
            }
        });
    }

    return profile;
}

// Extract vacancy information
function extractVacancies(vacancyData) {
    const vacancies = [];

    if (vacancyData?.web?.results) {
        vacancyData.web.results.forEach(result => {
            // Check if it's a vacancy
            if (result.url?.includes('indeed.nl') ||
                result.url?.includes('linkedin.com/jobs') ||
                result.title?.toLowerCase().includes('vacature')) {

                vacancies.push({
                    title: result.title,
                    url: result.url,
                    description: result.description,
                    source: extractDomain(result.url),
                    published: result.age || 'Unknown'
                });
            }
        });
    }

    return vacancies;
}

// Extract news articles
function extractNews(newsData) {
    const news = [];

    if (newsData?.web?.results) {
        newsData.web.results.forEach(result => {
            news.push({
                title: result.title,
                url: result.url,
                description: result.description,
                source: extractDomain(result.url),
                published: result.age || 'Recent'
            });
        });
    }

    return news;
}

// Extract Glassdoor reviews
function extractReviews(glassdoorData) {
    const reviews = {
        found: false,
        rating: null,
        reviewCount: null,
        url: null
    };

    if (glassdoorData?.web?.results?.length > 0) {
        const glassdoorResult = glassdoorData.web.results.find(r =>
            r.url?.includes('glassdoor.nl')
        );

        if (glassdoorResult) {
            reviews.found = true;
            reviews.url = glassdoorResult.url;

            // Try to extract rating from description
            const ratingMatch = glassdoorResult.description?.match(/(\d[.,]\d)\s*(sterren|\/5|rating)/i);
            if (ratingMatch) {
                reviews.rating = parseFloat(ratingMatch[1].replace(',', '.'));
            }

            // Try to extract review count
            const countMatch = glassdoorResult.description?.match(/(\d+)\s*(reviews|beoordelingen)/i);
            if (countMatch) {
                reviews.reviewCount = parseInt(countMatch[1]);
            }
        }
    }

    return reviews;
}

// Extract employee data
function extractEmployeeData(linkedinData) {
    const employees = {
        found: false,
        count: null,
        linkedinUrl: null
    };

    if (linkedinData?.web?.results?.length > 0) {
        const linkedinResult = linkedinData.web.results.find(r =>
            r.url?.includes('linkedin.com/company')
        );

        if (linkedinResult) {
            employees.found = true;
            employees.linkedinUrl = linkedinResult.url;

            // Try to extract employee count
            const employeeMatch = linkedinResult.description?.match(/(\d+[.,]?\d*)\s*(employees|medewerkers|werknemers)/i);
            if (employeeMatch) {
                employees.count = employeeMatch[1].replace('.', '').replace(',', '');
            }
        }
    }

    return employees;
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

// Calculate data completeness percentage
function calculateDataCompleteness(insights) {
    let score = 0;
    let total = 0;

    // Check profile completeness
    total += 4;
    if (insights.profile.found) score++;
    if (insights.profile.location) score++;
    if (insights.profile.industry) score++;
    if (insights.profile.kvkNumber) score++;

    // Check other data
    total += 4;
    if (insights.vacancies.length > 0) score++;
    if (insights.news.length > 0) score++;
    if (insights.reviews.found) score++;
    if (insights.employees.found) score++;

    return Math.round((score / total) * 100);
}

// Start server
app.listen(PORT, () => {
    console.log(`\n✅ Real Company Insights Agent gestart op http://localhost:${PORT}`);
    console.log('📊 Gebruikt alleen echte data van Brave Search API');
    console.log('🔍 Endpoint: POST /api/company-insights');
    console.log('📝 Body: { "company": "bedrijfsnaam" }');
});