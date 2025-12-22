#!/usr/bin/env node
// Vacancy Analysis Agent - Backend for Dutch Technical Job Search
// Port 3007 - Integrates with Brave Search API

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3007;

// Brave API configuration
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSARdxCQWTc2qwf41D9nweSyzfBzf6B';
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

// Middleware
app.use(cors());
app.use(express.json());

// Dutch job boards to prioritize
const DUTCH_JOB_BOARDS = [
  'indeed.nl',
  'monsterboard.nl',
  'nationalevacaturebank.nl',
  'jobbird.nl',
  'intermediair.nl',
  'techniekwerkt.nl',
  'werkenbijbam.nl',
  'werkenbijasml.nl',
  'imtech.com',
  'technischwerken.nl',
  'engineersonline.nl',
  'youngcapital.nl',
  'randstad.nl',
  'tempo-team.nl',
  'manpower.nl',
  'adecco.nl',
  'olympiauitzendbureau.nl',
  'unique.nl',
  'start-people.nl'
];

// Recruitment agency indicators to filter
const RECRUITMENT_AGENCIES = [
  'uitzendbureau', 'uitzend', 'detachering', 'detacheer',
  'werving', 'selectie', 'recruitment', 'staffing',
  'interim', 'zzp', 'freelance', 'bemiddeling',
  'randstad', 'manpower', 'adecco', 'tempo-team',
  'olympia', 'unique', 'start people', 'youngcapital',
  'brunel', 'yacht', 'hays', 'michael page'
];

// Search endpoint
app.post('/api/search-vacancies', async (req, res) => {
  const { query, filters } = req.body;

  console.log('\n🔍 VACANCY SEARCH REQUEST');
  console.log('Query:', query);
  console.log('Filters:', filters);

  try {
    // Build enhanced query with date freshness
    let enhancedQuery = query;

    // Map date filter to Brave freshness parameter
    let freshness = 'pw'; // Default: past week
    switch(filters.date) {
      case '24h': freshness = 'pd'; break;  // Past day
      case '3d': freshness = 'pd'; break;    // Use past day (closest option)
      case '7d': freshness = 'pw'; break;    // Past week
      case '14d': freshness = 'pm'; break;   // Past month (closest option)
      case '30d': freshness = 'pm'; break;   // Past month
    }

    // Search multiple job boards
    const searchPromises = [];

    // Search general Dutch sites
    searchPromises.push(searchBrave(enhancedQuery, freshness, 'general'));

    // Search specific job boards
    if (filters.sector || filters.specialization) {
      const specializedQuery = buildSpecializedQuery(filters);
      searchPromises.push(searchBrave(specializedQuery, freshness, 'specialized'));
    }

    // Execute all searches
    const searchResults = await Promise.all(searchPromises);

    // Combine and process results
    const allVacancies = [];
    searchResults.forEach(result => {
      if (result.results) {
        allVacancies.push(...result.results);
      }
    });

    // Filter and enhance vacancies
    const processedVacancies = await processVacancies(allVacancies, filters);

    // Sort by relevance and date
    processedVacancies.sort((a, b) => {
      // Prioritize today's vacancies
      if (a.date.includes('vandaag') && !b.date.includes('vandaag')) return -1;
      if (!a.date.includes('vandaag') && b.date.includes('vandaag')) return 1;
      return 0;
    });

    res.json({
      success: true,
      query: query,
      filters: filters,
      total: processedVacancies.length,
      vacancies: processedVacancies.slice(0, 50) // Limit to 50 results
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

// Search Brave API
async function searchBrave(query, freshness, type) {
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

    return {
      type: type,
      results: response.data.web?.results || []
    };

  } catch (error) {
    console.error(`  ❌ Search error (${type}):`, error.message);
    return { type, results: [] };
  }
}

// Build specialized query based on filters
function buildSpecializedQuery(filters) {
  let parts = [];

  // Add specialization keywords
  if (filters.specialization) {
    const specializations = {
      'Elektrotechniek': 'elektrotechniek elektricien "electrical engineer" installatie',
      'Werktuigbouw': 'werktuigbouw "mechanical engineer" constructie machinebouw',
      'Installatietechniek': 'installatietechniek installateur W-installatie E-installatie',
      'Mechatronica': 'mechatronica "mechatronics engineer" robotica automatisering',
      'Industriële Automatisering': 'PLC SCADA "industrial automation" automatisering',
      'Civiele Techniek': 'civiele techniek "civil engineer" infrastructuur wegenbouw',
      'Bouwkunde': 'bouwkunde bouwkundig "construction engineer" architect',
      'Procestechniek': 'procestechniek "process engineer" chemie productie',
      'Maintenance': 'maintenance onderhoud storingsmonteur "maintenance engineer"',
      'Quality Control': 'quality control kwaliteit QA "quality engineer"'
    };

    if (specializations[filters.specialization]) {
      parts.push(specializations[filters.specialization]);
    }
  }

  // Add sector keywords
  if (filters.sector) {
    const sectors = {
      'Productie': 'productie manufacturing fabriek industrie',
      'Engineering': 'engineering consultancy adviesbureau ingenieursbureau',
      'High Tech': 'high tech semiconductor ASML Philips NXP',
      'Bouw': 'bouw BAM Heijmans VolkerWessels Ballast Nedam',
      'Installatie': 'installatie Imtech Kuijpers Unica Croon',
      'Energie': 'energie Eneco Essent Tennet Gasunie',
      'Automotive': 'automotive DAF VDL Bosch mobility',
      'Aerospace': 'aerospace Fokker GKN "defence industry"',
      'Maritiem': 'maritiem offshore scheepsbouw Damen IHC',
      'Chemie': 'chemie pharma DSM BASF AkzoNobel',
      'Food': 'food FMCG Unilever FrieslandCampina Heineken',
      'Logistiek': 'logistiek transport supply chain warehouse',
      'Metaal': 'metaal staal aluminium Tata Steel'
    };

    if (sectors[filters.sector]) {
      parts.push(sectors[filters.sector]);
    }
  }

  // Always add vacature context
  parts.push('vacature Nederland');

  return parts.join(' ');
}

// Process and enhance vacancy results
async function processVacancies(vacancies, filters) {
  const processed = [];
  const seenUrls = new Set();

  for (const vacancy of vacancies) {
    // Skip duplicates
    if (seenUrls.has(vacancy.url)) continue;
    seenUrls.add(vacancy.url);

    // Check if it's a recruitment agency (if filter is set to direct employers)
    if (filters.employerType === 'direct') {
      const isAgency = RECRUITMENT_AGENCIES.some(agency =>
        vacancy.title.toLowerCase().includes(agency) ||
        vacancy.description.toLowerCase().includes(agency) ||
        vacancy.url.includes(agency.replace(' ', ''))
      );
      if (isAgency) continue;
    }

    // Extract vacancy details
    const processedVacancy = {
      id: generateId(),
      title: cleanTitle(vacancy.title),
      company: extractCompany(vacancy),
      location: extractLocation(vacancy, filters),
      salary: extractSalary(vacancy),
      type: extractEmploymentType(vacancy),
      experience: extractExperience(vacancy),
      date: extractDate(vacancy),
      description: cleanDescription(vacancy.description),
      url: vacancy.url,
      source: extractSource(vacancy.url),
      employerType: detectEmployerType(vacancy)
    };

    // Apply location filter if specified
    if (filters.province || filters.city) {
      const matchesLocation = checkLocationMatch(processedVacancy.location, filters);
      if (!matchesLocation) continue;
    }

    processed.push(processedVacancy);
  }

  return processed;
}

// Helper functions for data extraction
function generateId() {
  return 'vac_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function cleanTitle(title) {
  // Remove common prefixes/suffixes
  let clean = title.replace(/vacature[:\s-]*/gi, '')
                   .replace(/\s*-\s*indeed.*/gi, '')
                   .replace(/\s*-\s*monsterboard.*/gi, '')
                   .replace(/\s*\|.*$/g, '')
                   .trim();

  // Capitalize first letter
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function extractCompany(vacancy) {
  // Try to extract from title or description
  const patterns = [
    /bij\s+([A-Z][A-Za-z0-9\s&]+)/,
    /voor\s+([A-Z][A-Za-z0-9\s&]+)/,
    /\|\s*([A-Z][A-Za-z0-9\s&]+)/,
    /-\s*([A-Z][A-Za-z0-9\s&]+)$/
  ];

  for (const pattern of patterns) {
    const match = vacancy.title.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // Extract from URL domain
  const domain = vacancy.url.split('/')[2];
  if (domain && !domain.includes('indeed') && !domain.includes('monsterboard')) {
    return domain.replace('www.', '').split('.')[0];
  }

  return 'Onbekend bedrijf';
}

function extractLocation(vacancy, filters) {
  // Common Dutch cities and regions
  const locations = [
    'Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven',
    'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen',
    'Arnhem', 'Apeldoorn', 'Haarlem', 'Enschede', 'Amersfoort',
    'Zaanstad', 'Haarlemmermeer', 'Den Bosch', 'Zwolle', 'Leiden',
    'Maastricht', 'Dordrecht', 'Zoetermeer', 'Deventer', 'Delft'
  ];

  const text = (vacancy.title + ' ' + vacancy.description).toLowerCase();

  for (const location of locations) {
    if (text.includes(location.toLowerCase())) {
      return location;
    }
  }

  // Check for province mentions
  const provinces = [
    'Noord-Holland', 'Zuid-Holland', 'Utrecht', 'Noord-Brabant',
    'Gelderland', 'Limburg', 'Overijssel', 'Groningen',
    'Friesland', 'Drenthe', 'Zeeland', 'Flevoland'
  ];

  for (const province of provinces) {
    if (text.includes(province.toLowerCase())) {
      return province;
    }
  }

  return filters.city || filters.province || 'Nederland';
}

function extractSalary(vacancy) {
  const text = (vacancy.title + ' ' + vacancy.description);

  // Look for salary patterns
  const patterns = [
    /€\s*(\d+\.?\d*)\s*-\s*€?\s*(\d+\.?\d*)/,
    /EUR\s*(\d+\.?\d*)\s*-\s*EUR?\s*(\d+\.?\d*)/,
    /salaris.*?€\s*(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*euro/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;
      if (min < 10000) {
        // Likely monthly salary
        return `€${min} - €${max} /maand`;
      } else {
        // Likely yearly salary
        return `€${min} - €${max} /jaar`;
      }
    }
  }

  // Check for salary indicators
  if (text.match(/marktconform/i)) return 'Marktconform';
  if (text.match(/competitief/i)) return 'Competitief';
  if (text.match(/CAO/i)) return 'Volgens CAO';

  return 'Niet gespecificeerd';
}

function extractEmploymentType(vacancy) {
  const text = (vacancy.title + ' ' + vacancy.description).toLowerCase();

  if (text.includes('fulltime') || text.includes('voltijd') || text.includes('40 uur')) {
    return 'Fulltime';
  }
  if (text.includes('parttime') || text.includes('deeltijd')) {
    return 'Parttime';
  }
  if (text.includes('zzp') || text.includes('freelance')) {
    return 'Freelance/ZZP';
  }
  if (text.includes('stage') || text.includes('intern')) {
    return 'Stage';
  }
  if (text.includes('tijdelijk') || text.includes('temporary')) {
    return 'Tijdelijk';
  }

  return 'Vast dienstverband';
}

function extractExperience(vacancy) {
  const text = (vacancy.title + ' ' + vacancy.description).toLowerCase();

  // Look for experience patterns
  if (text.match(/junior|starter|entry level/)) {
    return 'Starter/Junior';
  }
  if (text.match(/medior|ervaring|experienced/)) {
    return 'Medior';
  }
  if (text.match(/senior|lead|expert/)) {
    return 'Senior';
  }

  // Look for year patterns
  const yearMatch = text.match(/(\d+)\+?\s*(jaar|years)\s*(ervaring|experience)/);
  if (yearMatch) {
    return `${yearMatch[1]}+ jaar ervaring`;
  }

  return 'Ervaring gewenst';
}

function extractDate(vacancy) {
  const text = vacancy.age || vacancy.description || '';

  // Check for age indicators
  if (text.includes('vandaag') || text.includes('today')) {
    return 'Vandaag';
  }
  if (text.includes('gisteren') || text.includes('yesterday')) {
    return 'Gisteren';
  }
  if (text.includes('dagen geleden') || text.includes('days ago')) {
    const match = text.match(/(\d+)\s*dagen/);
    if (match) {
      return `${match[1]} dagen geleden`;
    }
  }

  // Try to extract from meta or page age
  const now = new Date();
  const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

  return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
}

function cleanDescription(description) {
  if (!description) return 'Geen beschrijving beschikbaar';

  // Clean up description
  let clean = description
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();

  // Limit to 200 characters
  if (clean.length > 200) {
    clean = clean.substring(0, 197) + '...';
  }

  return clean;
}

function extractSource(url) {
  const domain = url.split('/')[2];
  if (domain) {
    return domain.replace('www.', '').replace('.nl', '').replace('.com', '');
  }
  return 'Onbekend';
}

function detectEmployerType(vacancy) {
  const text = (vacancy.title + ' ' + vacancy.description + ' ' + vacancy.url).toLowerCase();

  // Check for recruitment agency indicators
  const isAgency = RECRUITMENT_AGENCIES.some(agency => text.includes(agency));

  if (isAgency) {
    if (text.includes('detachering')) return 'detachering';
    if (text.includes('uitzend')) return 'uitzend';
    if (text.includes('werving') || text.includes('selectie')) return 'werving';
    return 'uitzend';
  }

  return 'direct';
}

function checkLocationMatch(location, filters) {
  if (!location) return false;

  const loc = location.toLowerCase();

  if (filters.city) {
    return loc.includes(filters.city.toLowerCase());
  }

  if (filters.province) {
    return loc.includes(filters.province.toLowerCase());
  }

  return true;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Vacancy Analysis Agent',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Vacancy Analysis Agent running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/search-vacancies`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('\n✅ Ready to search Dutch technical vacancies!');
});