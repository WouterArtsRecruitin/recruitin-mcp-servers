// Zapier Code Step - Fixed Pipedrive Integration
// Copy this code into a Zapier "Code by Zapier" step

// Input from webhook or previous step
const inputData = {
  company: input.company || '',
  source: input.source || 'manual',
  priority: input.priority || 'medium',
  pipedrive_api_token: input.pipedrive_api_token || '', // Add your token in Zapier
  timestamp: new Date().toISOString()
};

// Clean company name for better matching
const cleanCompanyName = inputData.company
  .trim()
  .replace(/\s+/g, ' ')
  .replace(/[^\w\s-]/g, '');

// Function to search Pipedrive with proper API endpoint
async function searchPipedriveOrganization(companyName, apiToken) {
  try {
    // Correct Pipedrive API endpoint
    const searchUrl = `https://api.pipedrive.com/v1/organizations/search`;

    // Build query parameters
    const params = new URLSearchParams({
      term: companyName,
      api_token: apiToken,
      limit: 5,
      exact_match: false
    });

    const response = await fetch(`${searchUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Pipedrive API error: ${response.status} ${response.statusText}`);
      return { success: false, error: response.statusText, organizations: [] };
    }

    const data = await response.json();

    if (data.success && data.data && data.data.items && data.data.items.length > 0) {
      // Return the best match
      const organizations = data.data.items.map(item => ({
        id: item.item.id,
        name: item.item.name,
        address: item.item.address,
        owner_id: item.item.owner_id,
        match_score: item.result_score || 0
      }));

      // Sort by match score
      organizations.sort((a, b) => b.match_score - a.match_score);

      return {
        success: true,
        found: true,
        organization: organizations[0],
        all_matches: organizations
      };
    }

    return {
      success: true,
      found: false,
      message: `No organization found for: ${companyName}`
    };

  } catch (error) {
    console.error('Pipedrive search error:', error.message);
    return {
      success: false,
      error: error.message,
      found: false
    };
  }
}

// Function to get Company Insights from local agent
async function getCompanyInsights(companyName) {
  try {
    const response = await fetch('http://localhost:3008/api/company-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ company: companyName })
    });

    if (!response.ok) {
      return { success: false, error: 'Company insights API error' };
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Company insights error:', error.message);
    return { success: false, error: error.message };
  }
}

// Main execution
async function processCompany() {
  const results = {
    company_clean: cleanCompanyName,
    research_id: `RES-${Date.now()}`,
    timestamp: inputData.timestamp,
    source: inputData.source,
    priority: inputData.priority
  };

  // Parallel execution for better performance
  const [pipedriveResult, insightsResult] = await Promise.all([
    searchPipedriveOrganization(cleanCompanyName, inputData.pipedrive_api_token),
    getCompanyInsights(cleanCompanyName)
  ]);

  // Add Pipedrive results
  if (pipedriveResult.success && pipedriveResult.found) {
    results.pipedrive = {
      found: true,
      organization_id: pipedriveResult.organization.id,
      organization_name: pipedriveResult.organization.name,
      owner_id: pipedriveResult.organization.owner_id,
      match_score: pipedriveResult.organization.match_score
    };
  } else {
    results.pipedrive = {
      found: false,
      message: pipedriveResult.message || 'No organization found',
      error: pipedriveResult.error
    };
  }

  // Add company insights
  if (insightsResult.success) {
    results.insights = {
      profile: insightsResult.insights.profile,
      vacancies_count: insightsResult.insights.statistics.totalVacancies,
      news_count: insightsResult.insights.statistics.newsArticles,
      has_glassdoor: insightsResult.insights.statistics.hasGlassdoorReviews,
      data_completeness: insightsResult.insights.statistics.dataCompleteness,
      sources: insightsResult.insights.sources
    };
  } else {
    results.insights = {
      error: insightsResult.error || 'Failed to get insights'
    };
  }

  // Calculate quality score
  results.quality_score = calculateQualityScore(results);

  // Flag for manual review if needed
  results.needs_review = results.quality_score < 40;

  return results;
}

// Calculate data quality score
function calculateQualityScore(data) {
  let score = 0;
  let total = 0;

  // Pipedrive match
  total += 20;
  if (data.pipedrive?.found) {
    score += 20;
  }

  // Company profile
  total += 20;
  if (data.insights?.profile?.found) {
    score += 10;
    if (data.insights?.profile?.industry) score += 5;
    if (data.insights?.profile?.location) score += 5;
  }

  // Vacancies
  total += 20;
  if (data.insights?.vacancies_count > 0) {
    score += Math.min(20, data.insights.vacancies_count * 4);
  }

  // News & presence
  total += 20;
  if (data.insights?.news_count > 0) {
    score += Math.min(20, data.insights.news_count * 2);
  }

  // Reviews
  total += 20;
  if (data.insights?.has_glassdoor) {
    score += 20;
  }

  return Math.round((score / total) * 100);
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
      pipedrive_found: results.pipedrive.found,
      pipedrive_org_id: results.pipedrive.organization_id || null,
      pipedrive_org_name: results.pipedrive.organization_name || null,
      pipedrive_owner_id: results.pipedrive.owner_id || null,

      // Company insights
      industry: results.insights.profile?.industry || 'Unknown',
      location: results.insights.profile?.location || 'Netherlands',
      vacancies_count: results.insights.vacancies_count || 0,
      news_count: results.insights.news_count || 0,
      has_glassdoor: results.insights.has_glassdoor || false,

      // Sources
      linkedin_url: results.insights.sources?.linkedin || '',
      glassdoor_url: results.insights.sources?.glassdoor || '',
      kvk_url: results.insights.sources?.kvk || '',

      // Quality metrics
      data_quality: results.quality_score,
      needs_review: results.needs_review,

      // Original input
      source: results.source,
      priority: results.priority,

      // Status
      status: results.quality_score > 60 ? 'Complete' : 'Needs Review',
      processing_success: true
    };
  })
  .catch(error => {
    // Error handling - return partial data
    return {
      company_name: cleanCompanyName,
      research_id: `RES-${Date.now()}`,
      timestamp: inputData.timestamp,
      error: error.message,
      status: 'Error',
      processing_success: false,
      needs_review: true
    };
  });