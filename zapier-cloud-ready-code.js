// Zapier Code Step - Cloud Ready Version (No localhost needed)
// This version works entirely in Zapier's cloud without local dependencies

// Input from webhook or previous step
const company = inputData.company || '';
const source = inputData.source || 'manual';
const priority = inputData.priority || 'medium';
const pipedrive_api_token = inputData.pipedrive_api_token || '';
const brave_api_key = inputData.brave_api_key || 'BSAW_h04juedQeMi6BwPvPLlfST4vC3'; // Your Brave API key
const timestamp = new Date().toISOString();

// Clean company name for better matching
const cleanCompanyName = company
  .trim()
  .replace(/\s+/g, ' ')
  .replace(/[^\w\s-]/g, '');

// Function to search Brave directly (no localhost needed)
async function searchBraveForCompany(companyName, apiKey) {
  try {
    const searchUrl = 'https://api.search.brave.com/res/v1/web/search';

    const params = new URLSearchParams({
      q: `${companyName} bedrijf Nederland site:kvk.nl OR site:linkedin.com/company OR site:glassdoor.nl`,
      count: '10',
      country: 'nl',
      search_lang: 'nl'
    });

    const response = await fetch(`${searchUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey
      }
    });

    if (!response.ok) {
      console.error(`Brave API error: ${response.status}`);
      return { success: false, error: `Brave API error: ${response.status}` };
    }

    const data = await response.json();

    // Extract insights from Brave search results
    const insights = {
      found: false,
      industry: null,
      location: null,
      linkedin_url: null,
      glassdoor_url: null,
      kvk_url: null,
      vacancies_count: 0,
      description: null
    };

    if (data.web && data.web.results) {
      insights.found = true;

      data.web.results.forEach(result => {
        // Extract LinkedIn URL
        if (result.url.includes('linkedin.com/company') && !insights.linkedin_url) {
          insights.linkedin_url = result.url;
        }

        // Extract Glassdoor URL
        if (result.url.includes('glassdoor.nl') && !insights.glassdoor_url) {
          insights.glassdoor_url = result.url;
        }

        // Extract KvK URL
        if (result.url.includes('kvk.nl') && !insights.kvk_url) {
          insights.kvk_url = result.url;
        }

        // Extract location from descriptions
        if (!insights.location && result.description) {
          const cities = ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen'];
          for (const city of cities) {
            if (result.description.includes(city)) {
              insights.location = city;
              break;
            }
          }
        }

        // Extract industry keywords
        if (!insights.industry && result.description) {
          const industries = {
            'Technology': ['technology', 'tech', 'software', 'IT'],
            'Manufacturing': ['manufacturing', 'productie', 'fabriek'],
            'Finance': ['bank', 'finance', 'verzekering', 'insurance'],
            'Healthcare': ['health', 'gezondheid', 'zorg', 'medisch'],
            'Retail': ['retail', 'winkel', 'verkoop'],
            'Logistics': ['logistiek', 'transport', 'distributie']
          };

          for (const [industry, keywords] of Object.entries(industries)) {
            if (keywords.some(keyword => result.description.toLowerCase().includes(keyword))) {
              insights.industry = industry;
              break;
            }
          }
        }

        // Use first description as company description
        if (!insights.description && result.description) {
          insights.description = result.description.substring(0, 200);
        }
      });
    }

    return { success: true, insights };

  } catch (error) {
    console.error('Brave search error:', error.message);
    return { success: false, error: error.message };
  }
}

// Function to search Pipedrive
async function searchPipedriveOrganization(companyName, apiToken) {
  if (!apiToken) {
    return { success: false, message: 'No Pipedrive API token provided' };
  }

  try {
    const searchUrl = `https://api.pipedrive.com/v1/organizations/search`;
    const params = new URLSearchParams({
      term: companyName,
      api_token: apiToken,
      limit: 5,
      exact_match: false
    });

    const response = await fetch(`${searchUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return { success: false, error: `Pipedrive API error: ${response.status}` };
    }

    const data = await response.json();

    if (data.success && data.data && data.data.items && data.data.items.length > 0) {
      const organizations = data.data.items.map(item => ({
        id: item.item.id,
        name: item.item.name,
        owner_id: item.item.owner_id
      }));

      return {
        success: true,
        found: true,
        organization: organizations[0]
      };
    }

    return {
      success: true,
      found: false,
      message: `No organization found for: ${companyName}`
    };

  } catch (error) {
    console.error('Pipedrive error:', error.message);
    return { success: false, error: error.message };
  }
}

// Main execution
async function processCompany() {
  // Check if we have a valid company name
  if (!cleanCompanyName || cleanCompanyName.length < 2) {
    return {
      error: 'Invalid company name provided',
      company_name: company,
      status: 'Error',
      processing_success: false
    };
  }

  // Parallel execution for better performance
  const [braveResult, pipedriveResult] = await Promise.all([
    searchBraveForCompany(cleanCompanyName, brave_api_key),
    searchPipedriveOrganization(cleanCompanyName, pipedrive_api_token)
  ]);

  // Build results object
  const results = {
    company_clean: cleanCompanyName,
    research_id: `RES-${Date.now()}`,
    timestamp: timestamp,
    source: source,
    priority: priority
  };

  // Add Brave/Company insights
  if (braveResult.success && braveResult.insights) {
    results.insights = braveResult.insights;
  } else {
    results.insights = {
      found: false,
      error: braveResult.error || 'No insights found'
    };
  }

  // Add Pipedrive results
  if (pipedriveResult.success && pipedriveResult.found) {
    results.pipedrive = {
      found: true,
      organization_id: pipedriveResult.organization.id,
      organization_name: pipedriveResult.organization.name,
      owner_id: pipedriveResult.organization.owner_id
    };
  } else {
    results.pipedrive = {
      found: false,
      message: pipedriveResult.message || 'No organization found'
    };
  }

  // Calculate quality score
  let qualityScore = 0;
  if (results.insights.found) qualityScore += 30;
  if (results.insights.industry) qualityScore += 15;
  if (results.insights.location) qualityScore += 15;
  if (results.insights.linkedin_url) qualityScore += 15;
  if (results.pipedrive.found) qualityScore += 25;

  results.quality_score = qualityScore;
  results.needs_review = qualityScore < 40;

  return results;
}

// Execute and return results
return processCompany()
  .then(results => {
    // Format output for next Zapier steps
    return {
      // Core identifiers
      company_name: cleanCompanyName,
      research_id: results.research_id,
      timestamp: results.timestamp,

      // Pipedrive data
      pipedrive_found: results.pipedrive.found || false,
      pipedrive_org_id: results.pipedrive.organization_id || '',
      pipedrive_org_name: results.pipedrive.organization_name || '',
      pipedrive_owner_id: results.pipedrive.owner_id || '',

      // Company insights from Brave
      industry: results.insights.industry || 'Unknown',
      location: results.insights.location || 'Netherlands',
      description: results.insights.description || '',

      // URLs
      linkedin_url: results.insights.linkedin_url || '',
      glassdoor_url: results.insights.glassdoor_url || '',
      kvk_url: results.insights.kvk_url || '',

      // Quality metrics
      data_quality: results.quality_score || 0,
      needs_review: results.needs_review || false,

      // Original input
      source: results.source,
      priority: results.priority,

      // Status
      status: results.quality_score > 60 ? 'Complete' : 'Needs Review',
      processing_success: true,

      // Debug info
      brave_search_success: results.insights.found || false,
      pipedrive_search_success: results.pipedrive.found || false
    };
  })
  .catch(error => {
    // Error handling - return partial data
    console.error('Processing error:', error.message);
    return {
      company_name: cleanCompanyName,
      research_id: `RES-${Date.now()}`,
      timestamp: timestamp,
      error: error.message,
      status: 'Error',
      processing_success: false,
      needs_review: true,
      source: source,
      priority: priority
    };
  });