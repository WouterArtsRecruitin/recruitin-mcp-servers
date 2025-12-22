#!/usr/bin/env node
// Company Insights Agent - LinkedIn Talent Insights Alternative
// Port 3008 - Comprehensive company analysis and market data

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3008;

// Brave API configuration
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSARdxCQWTc2qwf41D9nweSyzfBzf6B';
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

// Middleware
app.use(cors());
app.use(express.json());

// Dutch company databases and sources
const COMPANY_SOURCES = [
  'kvk.nl',           // Kamer van Koophandel
  'linkedin.com',     // LinkedIn company pages
  'glassdoor.nl',     // Reviews and salaries
  'indeed.nl',        // Job postings
  'fd.nl',            // Financial news
  'rtlz.nl',          // Business news
  'nu.nl/economie',   // Economic news
  'companyinfo.nl',   // Company information
  'cbs.nl'            // Statistics Netherlands
];

// Major Dutch companies for reference
const MAJOR_DUTCH_COMPANIES = {
  'ASML': { industry: 'High Tech & Semiconductors', employees: 39000, location: 'Veldhoven' },
  'Philips': { industry: 'Healthcare Technology', employees: 77000, location: 'Amsterdam' },
  'Shell': { industry: 'Energy & Oil', employees: 86000, location: 'Den Haag' },
  'ING': { industry: 'Banking & Finance', employees: 57000, location: 'Amsterdam' },
  'KPN': { industry: 'Telecommunications', employees: 10000, location: 'Rotterdam' },
  'Randstad': { industry: 'Recruitment & HR Services', employees: 38000, location: 'Diemen' },
  'Heineken': { industry: 'Food & Beverage', employees: 85000, location: 'Amsterdam' },
  'AkzoNobel': { industry: 'Chemicals & Coatings', employees: 35000, location: 'Amsterdam' },
  'BAM': { industry: 'Construction & Infrastructure', employees: 18000, location: 'Bunnik' },
  'DSM': { industry: 'Nutrition & Materials', employees: 23000, location: 'Heerlen' },
  'ABN AMRO': { industry: 'Banking & Finance', employees: 19000, location: 'Amsterdam' },
  'Rabobank': { industry: 'Banking & Finance', employees: 43000, location: 'Utrecht' },
  'Ahold Delhaize': { industry: 'Retail & Supermarkets', employees: 413000, location: 'Zaandam' },
  'Unilever': { industry: 'Consumer Goods', employees: 148000, location: 'Rotterdam' },
  'PostNL': { industry: 'Logistics & Postal', employees: 34000, location: 'Den Haag' }
};

// Company insights endpoint
app.post('/api/company-insights', async (req, res) => {
  const { company } = req.body;

  console.log('\n🏢 COMPANY INSIGHTS REQUEST');
  console.log('Company:', company);

  try {
    // Gather comprehensive company data
    const searchPromises = [];

    // 1. Company profile and general info
    searchPromises.push(searchCompanyProfile(company));

    // 2. Current vacancies
    searchPromises.push(searchVacancies(company));

    // 3. News and developments
    searchPromises.push(searchCompanyNews(company));

    // 4. Employee insights
    searchPromises.push(searchEmployeeData(company));

    // 5. Salary information
    searchPromises.push(searchSalaryData(company));

    // 6. Competitors
    searchPromises.push(searchCompetitors(company));

    // Execute all searches in parallel
    const results = await Promise.all(searchPromises);

    // Process and combine results
    const insights = processInsights(company, results);

    // Add market position analysis
    insights.marketPosition = analyzeMarketPosition(insights);

    // Generate vacancy trends (simulated for now)
    insights.vacancyTrends = generateVacancyTrends();

    res.json({
      success: true,
      company: company,
      insights: insights
    });

  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to gather insights',
      message: error.message
    });
  }
});

// Search company profile
async function searchCompanyProfile(company) {
  const query = `"${company}" bedrijfsprofiel Nederland site:kvk.nl OR site:linkedin.com OR site:companyinfo.nl`;

  try {
    const response = await searchBrave(query, 'profile');
    return { type: 'profile', data: response };
  } catch (error) {
    console.error('Profile search error:', error);
    return { type: 'profile', data: null };
  }
}

// Search current vacancies
async function searchVacancies(company) {
  const query = `"${company}" vacatures Nederland site:indeed.nl OR site:linkedin.com OR site:nationalevacaturebank.nl`;

  try {
    const response = await searchBrave(query, 'vacancies');
    return { type: 'vacancies', data: response };
  } catch (error) {
    console.error('Vacancies search error:', error);
    return { type: 'vacancies', data: null };
  }
}

// Search company news
async function searchCompanyNews(company) {
  const query = `"${company}" nieuws Nederland`;

  try {
    const response = await searchBrave(query, 'news', 'pd'); // Past day for fresh news
    return { type: 'news', data: response };
  } catch (error) {
    console.error('News search error:', error);
    return { type: 'news', data: null };
  }
}

// Search employee data
async function searchEmployeeData(company) {
  const query = `"${company}" werknemers employees aantal groei Nederland`;

  try {
    const response = await searchBrave(query, 'employees');
    return { type: 'employees', data: response };
  } catch (error) {
    console.error('Employee search error:', error);
    return { type: 'employees', data: null };
  }
}

// Search salary data
async function searchSalaryData(company) {
  const query = `"${company}" salaris salary gemiddeld Nederland site:glassdoor.nl OR site:indeed.nl`;

  try {
    const response = await searchBrave(query, 'salary');
    return { type: 'salary', data: response };
  } catch (error) {
    console.error('Salary search error:', error);
    return { type: 'salary', data: null };
  }
}

// Search competitors
async function searchCompetitors(company) {
  const query = `"${company}" concurrenten competitors vergelijking Nederland`;

  try {
    const response = await searchBrave(query, 'competitors');
    return { type: 'competitors', data: response };
  } catch (error) {
    console.error('Competitors search error:', error);
    return { type: 'competitors', data: null };
  }
}

// Search Brave API
async function searchBrave(query, type, freshness = 'pm') {
  try {
    console.log(`  🔎 Searching (${type}):`, query);

    const response = await axios.get(BRAVE_API_URL, {
      headers: {
        'X-Subscription-Token': BRAVE_API_KEY,
        'Accept': 'application/json'
      },
      params: {
        q: query,
        count: 20,
        country: 'nl',
        search_lang: 'nl',
        freshness: freshness,
        ui_lang: 'nl-NL'
      }
    });

    return response.data.web?.results || [];

  } catch (error) {
    console.error(`  ❌ Search error (${type}):`, error.message);
    return [];
  }
}

// Process all insights into structured data
function processInsights(companyName, results) {
  const insights = {
    name: companyName,
    industry: null,
    location: null,
    employeeCount: null,
    employeeGrowth: null,
    openVacancies: 0,
    vacancyTrend: null,
    avgSalary: null,
    salaryTrend: null,
    hiringRate: null,
    hiringTrend: null,
    talentPool: [],
    topSkills: [],
    competitors: [],
    news: [],
    description: null
  };

  // Check if it's a known company
  const knownCompany = MAJOR_DUTCH_COMPANIES[companyName.toUpperCase()];
  if (knownCompany) {
    insights.industry = knownCompany.industry;
    insights.employeeCount = knownCompany.employees;
    insights.location = knownCompany.location;
  }

  // Process each result type
  results.forEach(result => {
    switch(result.type) {
      case 'profile':
        processProfileData(insights, result.data);
        break;
      case 'vacancies':
        processVacancyData(insights, result.data);
        break;
      case 'news':
        processNewsData(insights, result.data);
        break;
      case 'employees':
        processEmployeeData(insights, result.data);
        break;
      case 'salary':
        processSalaryData(insights, result.data);
        break;
      case 'competitors':
        processCompetitorData(insights, result.data);
        break;
    }
  });

  // Generate additional insights
  generateAdditionalInsights(insights);

  return insights;
}

// Process profile data
function processProfileData(insights, data) {
  if (!data || data.length === 0) return;

  // Extract company description and details from search results
  const profileText = data.map(d => (d.title + ' ' + d.description)).join(' ').toLowerCase();

  // Extract industry
  if (!insights.industry) {
    const industries = [
      'technologie', 'software', 'IT', 'consultancy', 'bouw', 'constructie',
      'retail', 'financiën', 'bank', 'verzekering', 'logistiek', 'transport',
      'manufacturing', 'productie', 'energie', 'healthcare', 'zorg', 'pharma'
    ];

    for (const industry of industries) {
      if (profileText.includes(industry)) {
        insights.industry = industry.charAt(0).toUpperCase() + industry.slice(1);
        break;
      }
    }
  }

  // Extract location
  if (!insights.location) {
    const cities = ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen'];
    for (const city of cities) {
      if (profileText.includes(city.toLowerCase())) {
        insights.location = city;
        break;
      }
    }
  }

  // Set description
  if (data[0]) {
    insights.description = data[0].description;
  }
}

// Process vacancy data
function processVacancyData(insights, data) {
  if (!data) return;

  insights.openVacancies = data.length;

  // Extract job roles for talent pool
  const roles = {};
  data.forEach(vacancy => {
    const title = vacancy.title.toLowerCase();

    // Categorize roles
    if (title.includes('engineer')) {
      roles['Engineers'] = (roles['Engineers'] || 0) + 1;
    } else if (title.includes('developer') || title.includes('programmeur')) {
      roles['Developers'] = (roles['Developers'] || 0) + 1;
    } else if (title.includes('manager')) {
      roles['Managers'] = (roles['Managers'] || 0) + 1;
    } else if (title.includes('consultant')) {
      roles['Consultants'] = (roles['Consultants'] || 0) + 1;
    } else if (title.includes('analist') || title.includes('analyst')) {
      roles['Analysts'] = (roles['Analysts'] || 0) + 1;
    } else if (title.includes('monteur') || title.includes('technician')) {
      roles['Technicians'] = (roles['Technicians'] || 0) + 1;
    }
  });

  // Convert to talent pool array
  insights.talentPool = Object.entries(roles)
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate vacancy trend (simulated)
  insights.vacancyTrend = Math.floor(Math.random() * 30) - 10; // -10% to +20%
}

// Process news data
function processNewsData(insights, data) {
  if (!data) return;

  // Extract recent news items
  insights.news = data.slice(0, 5).map(item => ({
    title: item.title,
    description: item.description,
    url: item.url,
    date: item.age || 'Recent'
  }));
}

// Process employee data
function processEmployeeData(insights, data) {
  if (!data || data.length === 0) return;

  const text = data.map(d => (d.title + ' ' + d.description)).join(' ');

  // Try to extract employee count
  const employeeMatch = text.match(/(\d+\.?\d*)\s*(K|k|duizend|thousand)?\s*(werknemers|employees|medewerkers)/);
  if (employeeMatch && !insights.employeeCount) {
    let count = parseFloat(employeeMatch[1]);
    if (employeeMatch[2]) {
      count *= 1000; // Convert K to actual number
    }
    insights.employeeCount = Math.round(count);
  }

  // Calculate growth (simulated for now)
  insights.employeeGrowth = Math.floor(Math.random() * 20) - 5; // -5% to +15%
}

// Process salary data
function processSalaryData(insights, data) {
  if (!data || data.length === 0) return;

  const text = data.map(d => (d.title + ' ' + d.description)).join(' ');

  // Extract salary information
  const salaryMatch = text.match(/€\s*(\d+\.?\d*)\s*(K|k)?/);
  if (salaryMatch) {
    let salary = parseFloat(salaryMatch[1]);
    if (salaryMatch[2]) {
      salary *= 1000; // Convert K to actual amount
    }
    insights.avgSalary = salary;
  }

  // If no specific salary found, use industry average
  if (!insights.avgSalary) {
    insights.avgSalary = 45000; // Default average
  }

  // Calculate salary trend (simulated)
  insights.salaryTrend = Math.floor(Math.random() * 10) + 2; // +2% to +12%
}

// Process competitor data
function processCompetitorData(insights, data) {
  if (!data || data.length === 0) return;

  const competitors = [];
  const text = data.map(d => (d.title + ' ' + d.description)).join(' ');

  // Extract competitor names from text
  Object.keys(MAJOR_DUTCH_COMPANIES).forEach(company => {
    if (company !== insights.name && text.includes(company)) {
      competitors.push({
        name: company,
        employees: MAJOR_DUTCH_COMPANIES[company].employees,
        industry: MAJOR_DUTCH_COMPANIES[company].industry
      });
    }
  });

  insights.competitors = competitors.slice(0, 4);
}

// Generate additional insights
function generateAdditionalInsights(insights) {
  // Calculate hiring rate based on vacancies and employees
  if (insights.employeeCount && insights.openVacancies) {
    insights.hiringRate = Math.round((insights.openVacancies / insights.employeeCount) * 100 * 10) / 10;
  } else {
    insights.hiringRate = 2.5; // Industry average
  }

  // Generate hiring trend
  insights.hiringTrend = Math.floor(Math.random() * 20) - 5; // -5% to +15%

  // Generate top skills based on industry
  insights.topSkills = generateTopSkills(insights.industry);

  // Ensure we have default values
  insights.employeeCount = insights.employeeCount || 1000;
  insights.employeeGrowth = insights.employeeGrowth || 5;
  insights.avgSalary = insights.avgSalary || 45000;
  insights.salaryTrend = insights.salaryTrend || 3;
}

// Generate top skills based on industry
function generateTopSkills(industry) {
  const skillsByIndustry = {
    'High Tech': ['Machine Learning', 'C++', 'Python', 'System Design', 'Semiconductors'],
    'Software': ['Java', 'React', 'Cloud Computing', 'DevOps', 'Agile'],
    'Banking': ['Risk Management', 'Compliance', 'Financial Analysis', 'Excel', 'SQL'],
    'Construction': ['Project Management', 'AutoCAD', 'BIM', 'Safety', 'Planning'],
    'Healthcare': ['Patient Care', 'Medical Knowledge', 'Communication', 'Teamwork', 'Ethics'],
    'Logistics': ['Supply Chain', 'SAP', 'WMS', 'Planning', 'Excel'],
    'Retail': ['Customer Service', 'Sales', 'Merchandising', 'POS Systems', 'Inventory'],
    'Energy': ['Process Engineering', 'Safety', 'Sustainability', 'Project Management', 'Technical']
  };

  let skills = skillsByIndustry[industry] || ['Communication', 'Teamwork', 'Problem Solving', 'Leadership', 'Flexibility'];

  return skills.map((skill, index) => ({
    name: skill,
    demand: 90 - (index * 10) // Decreasing demand percentage
  }));
}

// Analyze market position
function analyzeMarketPosition(insights) {
  const position = {
    marketShare: null,
    growthRank: null,
    totalCompanies: null,
    brandScore: null,
    competitionIndex: null
  };

  // Calculate market share (simulated)
  if (insights.employeeCount) {
    if (insights.employeeCount > 50000) {
      position.marketShare = Math.floor(Math.random() * 20) + 15; // 15-35%
      position.brandScore = 8 + Math.random() * 2; // 8-10
    } else if (insights.employeeCount > 10000) {
      position.marketShare = Math.floor(Math.random() * 15) + 5; // 5-20%
      position.brandScore = 6 + Math.random() * 2; // 6-8
    } else {
      position.marketShare = Math.floor(Math.random() * 5) + 1; // 1-6%
      position.brandScore = 4 + Math.random() * 3; // 4-7
    }
  }

  // Round brand score
  position.brandScore = Math.round(position.brandScore * 10) / 10;

  // Growth rank
  position.growthRank = Math.floor(Math.random() * 20) + 1;
  position.totalCompanies = 100;

  // Competition index
  if (insights.openVacancies > 20) {
    position.competitionIndex = 'Hoog';
  } else if (insights.openVacancies > 10) {
    position.competitionIndex = 'Gemiddeld';
  } else {
    position.competitionIndex = 'Laag';
  }

  return position;
}

// Generate vacancy trends (mock data for demonstration)
function generateVacancyTrends() {
  const months = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  const trends = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    trends.push({
      month: months[monthIndex],
      count: Math.floor(Math.random() * 30) + 10
    });
  }

  return trends;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Company Insights Agent',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🏢 Company Insights Agent running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/company-insights`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('\n✅ Ready to analyze Dutch companies!');
});