// UNIFIED ZAPIER AUTOMATION - Complete Cloud Solution
// Processes: LinkedIn Exports, Company Research, Brave Enrichment, Pipedrive Integration
// No localhost required - works entirely in Zapier cloud

// ==================== CONFIGURATION ====================
const config = {
  brave_api_key: inputData.brave_api_key || 'BSAW_h04juedQeMi6BwPvPLlfST4vC3',
  pipedrive_api_token: inputData.pipedrive_api_token || '',
  google_sheets_id: '1N3R5bH-3KpVBiffpKGy1DOjUntvaldbahW3obTxbeeo',
  notion_database_id: 'cf728bf3655a4b4e9a949322821df861'
};

// ==================== INPUT DETECTION ====================
// Automatically detect what type of input we're processing
function detectInputType() {
  // Check if it's a LinkedIn export email
  if (inputData.email_subject || inputData.subject) {
    const subject = (inputData.email_subject || inputData.subject || '').toLowerCase();
    const body = (inputData.email_body || inputData.body || inputData.text || '').toLowerCase();

    // LinkedIn export detection
    if (subject.includes('linkedin') || subject.includes('export') || body.includes('linkedin.com')) {
      if (subject.includes('sales navigator') || body.includes('lead export')) {
        return { type: 'linkedin', subtype: 'sales_navigator' };
      } else if (subject.includes('recruiter') || body.includes('candidate export')) {
        return { type: 'linkedin', subtype: 'recruiter' };
      } else if (subject.includes('talent insights')) {
        if (body.includes('talent pool')) {
          return { type: 'linkedin', subtype: 'talent_insights_talent' };
        } else if (body.includes('company report')) {
          return { type: 'linkedin', subtype: 'talent_insights_company' };
        }
      }
    }
  }

  // Check if it's a direct company research request
  if (inputData.company) {
    return { type: 'company_research', subtype: 'direct' };
  }

  // Check if it's from a webhook with multiple companies
  if (inputData.companies && Array.isArray(inputData.companies)) {
    return { type: 'company_research', subtype: 'batch' };
  }

  return { type: 'unknown', subtype: null };
}

// ==================== LINKEDIN PROCESSING ====================
function parseLinkedInExport(subtype, emailBody) {
  const lines = (emailBody || '').split('\n');
  const data = {
    feed_type: subtype,
    import_timestamp: new Date().toISOString()
  };

  switch(subtype) {
    case 'sales_navigator':
      lines.forEach(line => {
        if (line.includes('Name:')) data.name = line.split('Name:')[1]?.trim();
        if (line.includes('Title:')) data.title = line.split('Title:')[1]?.trim();
        if (line.includes('Company:')) data.company = line.split('Company:')[1]?.trim();
        if (line.includes('Location:')) data.location = line.split('Location:')[1]?.trim();
        if (line.includes('Email:')) data.email = line.split('Email:')[1]?.trim();
        if (line.includes('linkedin.com/in/')) {
          const urlMatch = line.match(/(https?:\/\/[^\s]+linkedin\.com\/in\/[^\s]+)/);
          if (urlMatch) data.linkedin_url = urlMatch[1];
        }
      });
      break;

    case 'recruiter':
      lines.forEach(line => {
        if (line.includes('Candidate:')) data.candidate_name = line.split('Candidate:')[1]?.trim();
        if (line.includes('Current Company:')) data.current_company = line.split('Current Company:')[1]?.trim();
        if (line.includes('Experience:')) data.years_experience = line.split('Experience:')[1]?.trim();
        if (line.includes('Skills:')) data.skills = line.split('Skills:')[1]?.trim();
        if (line.includes('Education:')) data.education = line.split('Education:')[1]?.trim();
        if (line.includes('linkedin.com/in/')) {
          const urlMatch = line.match(/(https?:\/\/[^\s]+linkedin\.com\/in\/[^\s]+)/);
          if (urlMatch) data.profile_url = urlMatch[1];
        }
      });
      // Parse skills into array
      if (data.skills) {
        data.skills_array = data.skills.split(',').map(s => s.trim());
      }
      break;

    case 'talent_insights_talent':
      lines.forEach(line => {
        if (line.includes('Market:')) data.market = line.split('Market:')[1]?.trim();
        if (line.includes('Talent Pool:')) data.talent_pool_size = line.split('Talent Pool:')[1]?.trim();
        if (line.includes('Growth Rate:')) data.growth_rate = parseFloat(line.split('Growth Rate:')[1]?.replace('%','')?.trim());
        if (line.includes('Top Skills:')) data.top_skills = line.split('Top Skills:')[1]?.trim();
        if (line.includes('Companies Hiring:')) data.companies_hiring = line.split('Companies Hiring:')[1]?.trim();
        if (line.includes('Average Tenure:')) data.avg_tenure = line.split('Average Tenure:')[1]?.trim();
        if (line.includes('Salary Range:')) data.salary_range = line.split('Salary Range:')[1]?.trim();
      });
      break;

    case 'talent_insights_company':
      lines.forEach(line => {
        if (line.includes('Company:')) data.company_name = line.split('Company:')[1]?.trim();
        if (line.includes('Employee Count:')) data.employee_count = line.split('Employee Count:')[1]?.trim();
        if (line.includes('Growth:')) data.growth_rate = parseFloat(line.split('Growth:')[1]?.replace('%','')?.trim());
        if (line.includes('Departments:')) data.top_departments = line.split('Departments:')[1]?.trim();
        if (line.includes('Hiring Trends:')) data.hiring_trends = line.split('Hiring Trends:')[1]?.trim();
        if (line.includes('Top Skills:')) data.top_skills = line.split('Top Skills:')[1]?.trim();
        if (line.includes('Attrition Rate:')) data.attrition_rate = line.split('Attrition Rate:')[1]?.trim();
      });
      break;
  }

  return data;
}

// ==================== BRAVE SEARCH ENRICHMENT ====================
async function enrichWithBraveSearch(searchQuery, searchType = 'company') {
  if (!searchQuery || !config.brave_api_key) {
    return { found: false, error: 'Missing search query or API key' };
  }

  try {
    const searchUrl = 'https://api.search.brave.com/res/v1/web/search';

    // Build search query based on type
    let query = '';
    if (searchType === 'company') {
      query = `${searchQuery} bedrijf Nederland site:linkedin.com/company OR site:kvk.nl OR site:glassdoor.nl`;
    } else if (searchType === 'person') {
      query = `${searchQuery} Nederland site:linkedin.com/in`;
    } else if (searchType === 'news') {
      query = `${searchQuery} Nederland nieuws recruitment vacature`;
    }

    const params = new URLSearchParams({
      q: query,
      count: '15',
      country: 'nl',
      search_lang: 'nl',
      safesearch: 'moderate'
    });

    const response = await fetch(`${searchUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': config.brave_api_key
      }
    });

    if (!response.ok) {
      console.error(`Brave API error: ${response.status}`);
      return { found: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();

    // Process search results
    const insights = {
      found: false,
      query: searchQuery,
      search_type: searchType,
      industry: null,
      location: null,
      linkedin_url: null,
      kvk_url: null,
      glassdoor_url: null,
      glassdoor_rating: null,
      description: null,
      recent_news: [],
      key_facts: [],
      employee_count: null,
      founded_year: null
    };

    if (data.web && data.web.results && data.web.results.length > 0) {
      insights.found = true;

      // Dutch cities for location detection
      const dutchCities = [
        'Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven',
        'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen',
        'Apeldoorn', 'Arnhem', 'Haarlem', 'Zaanstad', 'Haarlemmermeer',
        'Amersfoort', 'Enschede', 's-Hertogenbosch', 'Zoetermeer', 'Zwolle'
      ];

      // Industry keywords
      const industries = {
        'Technology': ['technology', 'tech', 'software', 'IT', 'digital', 'data'],
        'Manufacturing': ['manufacturing', 'productie', 'fabriek', 'industrie'],
        'Finance': ['bank', 'finance', 'verzekering', 'insurance', 'financial'],
        'Healthcare': ['health', 'gezondheid', 'zorg', 'medisch', 'pharma'],
        'Retail': ['retail', 'winkel', 'verkoop', 'commerce', 'shop'],
        'Logistics': ['logistiek', 'transport', 'distributie', 'supply chain'],
        'Construction': ['bouw', 'construction', 'engineering', 'civil'],
        'Energy': ['energie', 'energy', 'oil', 'gas', 'renewable'],
        'Education': ['onderwijs', 'education', 'university', 'school'],
        'Consulting': ['consulting', 'advies', 'consultancy', 'advisory']
      };

      // Process each search result
      data.web.results.forEach((result, index) => {
        // Extract URLs
        if (result.url.includes('linkedin.com/company') && !insights.linkedin_url) {
          insights.linkedin_url = result.url;
          // Try to extract company size from description
          const sizeMatch = result.description?.match(/(\d+[\d,\.]*)\s*(employees|werknemers|medewerkers)/i);
          if (sizeMatch) {
            insights.employee_count = sizeMatch[1].replace(/[,\.]/g, '');
          }
        }

        if (result.url.includes('kvk.nl') && !insights.kvk_url) {
          insights.kvk_url = result.url;
        }

        if (result.url.includes('glassdoor') && !insights.glassdoor_url) {
          insights.glassdoor_url = result.url;
          // Try to extract rating
          const ratingMatch = result.description?.match(/(\d[.,]\d)\s*(sterren|stars|\/5)/);
          if (ratingMatch) {
            insights.glassdoor_rating = parseFloat(ratingMatch[1].replace(',', '.'));
          }
        }

        // Extract location
        if (!insights.location && result.description) {
          for (const city of dutchCities) {
            if (result.description.includes(city) || result.title.includes(city)) {
              insights.location = city;
              break;
            }
          }
        }

        // Extract industry
        if (!insights.industry && result.description) {
          const desc = result.description.toLowerCase();
          for (const [industry, keywords] of Object.entries(industries)) {
            if (keywords.some(keyword => desc.includes(keyword))) {
              insights.industry = industry;
              break;
            }
          }
        }

        // Set first good description
        if (!insights.description && result.description && result.description.length > 50) {
          insights.description = result.description.substring(0, 300);
        }

        // Collect recent news (skip LinkedIn, KvK, Glassdoor)
        if (!result.url.includes('linkedin.com') &&
            !result.url.includes('kvk.nl') &&
            !result.url.includes('glassdoor') &&
            insights.recent_news.length < 3) {
          insights.recent_news.push({
            title: result.title,
            url: result.url,
            description: result.description?.substring(0, 150),
            age: result.age
          });
        }

        // Extract key facts from descriptions
        if (index < 5 && result.description) {
          // Founded year
          const foundedMatch = result.description.match(/(opgericht|founded|sinds|since)\s*(\d{4})/i);
          if (foundedMatch && !insights.founded_year) {
            insights.founded_year = foundedMatch[2];
          }

          // Extract any numbers that might be relevant
          const factMatches = result.description.match(/\d+[\d,\.]*\s*\w+/g);
          if (factMatches) {
            factMatches.slice(0, 2).forEach(fact => {
              if (!insights.key_facts.includes(fact)) {
                insights.key_facts.push(fact);
              }
            });
          }
        }
      });

      // Default location if not found
      if (!insights.location) {
        insights.location = 'Netherlands';
      }
    }

    return insights;

  } catch (error) {
    console.error('Brave Search error:', error.message);
    return { found: false, error: error.message };
  }
}

// ==================== PIPEDRIVE INTEGRATION ====================
async function checkPipedriveOrganization(companyName) {
  if (!config.pipedrive_api_token || !companyName) {
    return { found: false, message: 'No Pipedrive token or company name' };
  }

  try {
    const searchUrl = `https://api.pipedrive.com/v1/organizations/search`;
    const params = new URLSearchParams({
      term: companyName,
      api_token: config.pipedrive_api_token,
      limit: 3,
      exact_match: false
    });

    const response = await fetch(`${searchUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();

      if (data.success && data.data && data.data.items && data.data.items.length > 0) {
        const org = data.data.items[0].item;
        return {
          found: true,
          organization_id: org.id,
          organization_name: org.name,
          owner_id: org.owner_id,
          address: org.address,
          match_score: data.data.items[0].result_score || 0
        };
      }
    }
  } catch (error) {
    console.error('Pipedrive error:', error.message);
  }

  return { found: false };
}

// ==================== SCORING FUNCTIONS ====================
function calculateLeadScore(data) {
  let score = 0;

  // Basic info (40 points)
  if (data.name || data.candidate_name) score += 10;
  if (data.company || data.current_company || data.company_name) score += 10;
  if (data.title) score += 10;
  if (data.linkedin_url || data.profile_url) score += 10;

  // Enrichment (30 points)
  if (data.enrichment?.found) score += 10;
  if (data.enrichment?.industry) score += 5;
  if (data.enrichment?.location) score += 5;
  if (data.enrichment?.glassdoor_rating >= 3.5) score += 10;

  // Pipedrive match (20 points)
  if (data.pipedrive?.found) score += 20;

  // Skills for recruiter type (10 points)
  if (data.skills_array && data.skills_array.length > 3) score += 10;

  return Math.min(100, score);
}

function calculateSkillMatchScore(skills, targetSkills = null) {
  if (!skills || !Array.isArray(skills)) return 0;

  // Default high-demand skills for Dutch market
  const defaultTargets = [
    'Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
    'Java', 'SQL', 'Agile', 'Scrum', 'TypeScript', 'Angular', 'Vue.js',
    'CI/CD', 'DevOps', 'Machine Learning', 'Data Science', 'Cloud'
  ];

  const targets = targetSkills || defaultTargets;
  let matches = 0;

  skills.forEach(skill => {
    if (targets.some(target => skill.toLowerCase().includes(target.toLowerCase()))) {
      matches++;
    }
  });

  return Math.round((matches / Math.min(skills.length, targets.length)) * 100);
}

function calculateMarketOpportunityScore(data) {
  let score = 0;

  // Growth rate (40 points)
  if (data.growth_rate) {
    if (data.growth_rate > 20) score += 40;
    else if (data.growth_rate > 10) score += 30;
    else if (data.growth_rate > 5) score += 20;
    else if (data.growth_rate > 0) score += 10;
  }

  // Talent pool size (30 points)
  const poolSize = parseInt(data.talent_pool_size);
  if (poolSize > 5000) score += 30;
  else if (poolSize > 1000) score += 20;
  else if (poolSize > 100) score += 10;

  // Companies hiring (30 points)
  if (data.companies_hiring) {
    const companies = data.companies_hiring.split(',').length;
    if (companies > 10) score += 30;
    else if (companies > 5) score += 20;
    else if (companies > 2) score += 10;
  }

  return Math.min(100, score);
}

// ==================== MAIN PROCESSING ====================
async function processUnifiedAutomation() {
  const inputType = detectInputType();
  const results = {
    processing_id: `PROC-${Date.now()}`,
    timestamp: new Date().toISOString(),
    input_type: inputType.type,
    input_subtype: inputType.subtype
  };

  // Handle unknown input
  if (inputType.type === 'unknown') {
    return {
      ...results,
      success: false,
      error: 'Could not determine input type',
      message: 'Please provide either LinkedIn export email or company name'
    };
  }

  // Process LinkedIn exports
  if (inputType.type === 'linkedin') {
    const emailBody = inputData.email_body || inputData.body || inputData.text || '';
    const parsedData = parseLinkedInExport(inputType.subtype, emailBody);

    // Merge parsed data into results
    Object.assign(results, parsedData);

    // Extract company name for enrichment
    const companyName = parsedData.company ||
                       parsedData.current_company ||
                       parsedData.company_name ||
                       parsedData.companies_hiring?.split(',')[0];

    // Extract person name for enrichment
    const personName = parsedData.name || parsedData.candidate_name;

    // Parallel enrichment
    const promises = [];

    if (companyName) {
      promises.push(enrichWithBraveSearch(companyName, 'company'));
      promises.push(checkPipedriveOrganization(companyName));
    } else {
      promises.push(Promise.resolve({ found: false }));
      promises.push(Promise.resolve({ found: false }));
    }

    if (personName && inputType.subtype !== 'talent_insights_talent' && inputType.subtype !== 'talent_insights_company') {
      promises.push(enrichWithBraveSearch(personName, 'person'));
    } else {
      promises.push(Promise.resolve({ found: false }));
    }

    const [companyEnrichment, pipedriveResult, personEnrichment] = await Promise.all(promises);

    // Add enrichment results
    results.company_enrichment = companyEnrichment;
    results.pipedrive = pipedriveResult;
    if (personName) {
      results.person_enrichment = personEnrichment;
    }

    // Calculate scores based on feed type
    switch(inputType.subtype) {
      case 'sales_navigator':
        results.lead_score = calculateLeadScore(results);
        results.priority = results.lead_score >= 70 ? 'high' : results.lead_score >= 40 ? 'medium' : 'low';
        break;

      case 'recruiter':
        if (results.skills_array) {
          results.skill_match_score = calculateSkillMatchScore(results.skills_array);
        }
        results.candidate_score = calculateLeadScore(results);
        results.priority = results.skill_match_score >= 60 ? 'high' : 'medium';
        break;

      case 'talent_insights_talent':
        results.market_opportunity_score = calculateMarketOpportunityScore(results);
        results.market_attractiveness = results.market_opportunity_score >= 70 ? 'hot' :
                                       results.market_opportunity_score >= 40 ? 'warm' : 'cold';
        break;

      case 'talent_insights_company':
        results.company_growth_score = calculateMarketOpportunityScore(results);
        results.hiring_potential = results.company_growth_score >= 70 ? 'expanding' :
                                  results.company_growth_score >= 40 ? 'stable' : 'limited';
        break;
    }

  // Process direct company research
  } else if (inputType.type === 'company_research') {
    const companies = inputType.subtype === 'batch' ? inputData.companies : [inputData.company];
    results.companies_processed = [];

    for (const company of companies.slice(0, 5)) { // Limit to 5 for performance
      const companyResults = {
        company_name: company,
        timestamp: new Date().toISOString()
      };

      // Parallel processing
      const [enrichment, pipedrive] = await Promise.all([
        enrichWithBraveSearch(company, 'company'),
        checkPipedriveOrganization(company)
      ]);

      companyResults.enrichment = enrichment;
      companyResults.pipedrive = pipedrive;
      companyResults.quality_score = calculateLeadScore({
        company: company,
        enrichment,
        pipedrive
      });

      results.companies_processed.push(companyResults);
    }
  }

  // Add processing metadata
  results.success = true;
  results.data_completeness = calculateDataCompleteness(results);
  results.requires_review = results.data_completeness < 60;

  return results;
}

// Helper function to calculate data completeness
function calculateDataCompleteness(data) {
  const importantFields = [
    'name', 'candidate_name', 'company', 'current_company', 'company_name',
    'title', 'skills', 'linkedin_url', 'profile_url', 'market', 'talent_pool_size'
  ];

  let filled = 0;
  let checked = 0;

  importantFields.forEach(field => {
    if (data[field] !== undefined) {
      checked++;
      if (data[field] && data[field] !== '') {
        filled++;
      }
    }
  });

  if (checked === 0) return 100; // No relevant fields for this type
  return Math.round((filled / checked) * 100);
}

// ==================== EXECUTE AND RETURN ====================
return processUnifiedAutomation()
  .then(results => {
    // Format output for Zapier next steps
    const output = {
      // Core identification
      processing_id: results.processing_id,
      timestamp: results.timestamp,
      input_type: results.input_type,
      input_subtype: results.input_subtype,

      // Status
      success: results.success,
      data_completeness: results.data_completeness,
      requires_review: results.requires_review,

      // LinkedIn specific fields (if applicable)
      feed_type: results.feed_type || '',

      // Person data
      person_name: results.name || results.candidate_name || '',
      person_title: results.title || '',
      person_linkedin: results.linkedin_url || results.profile_url || '',
      person_skills: results.skills || '',
      person_experience: results.years_experience || '',
      person_education: results.education || '',

      // Company data
      company_name: results.company || results.current_company || results.company_name || '',
      company_industry: results.company_enrichment?.industry || '',
      company_location: results.company_enrichment?.location || '',
      company_size: results.company_enrichment?.employee_count || results.employee_count || '',
      company_growth: results.growth_rate || '',

      // URLs
      linkedin_company_url: results.company_enrichment?.linkedin_url || '',
      kvk_url: results.company_enrichment?.kvk_url || '',
      glassdoor_url: results.company_enrichment?.glassdoor_url || '',
      glassdoor_rating: results.company_enrichment?.glassdoor_rating || '',

      // Pipedrive
      pipedrive_found: results.pipedrive?.found || false,
      pipedrive_org_id: results.pipedrive?.organization_id || '',
      pipedrive_org_name: results.pipedrive?.organization_name || '',

      // Market intelligence (Talent Insights)
      market_name: results.market || '',
      talent_pool_size: results.talent_pool_size || '',
      market_growth_rate: results.growth_rate || '',
      top_skills: results.top_skills || '',
      companies_hiring: results.companies_hiring || '',
      hiring_trends: results.hiring_trends || '',

      // Scores
      lead_score: results.lead_score || 0,
      skill_match_score: results.skill_match_score || 0,
      candidate_score: results.candidate_score || 0,
      market_opportunity_score: results.market_opportunity_score || 0,
      company_growth_score: results.company_growth_score || 0,

      // Priority/Classification
      priority: results.priority || 'medium',
      market_attractiveness: results.market_attractiveness || '',
      hiring_potential: results.hiring_potential || '',

      // Actions for next steps
      should_create_person: (results.input_subtype === 'sales_navigator' || results.input_subtype === 'recruiter') && (results.name || results.candidate_name),
      should_create_company: !results.pipedrive?.found && (results.company || results.current_company || results.company_name),
      should_send_alert: (results.lead_score >= 80 || results.skill_match_score >= 70 || results.market_opportunity_score >= 80),
      should_add_to_talent_pool: results.input_subtype === 'recruiter' && results.skill_match_score >= 50,

      // Debug info
      enrichment_found: results.company_enrichment?.found || false,
      recent_news: results.company_enrichment?.recent_news || [],
      key_facts: results.company_enrichment?.key_facts || [],

      // Original email info (if applicable)
      email_subject: inputData.email_subject || inputData.subject || '',
      source: inputData.source || 'linkedin_export'
    };

    // Add batch results if processing multiple companies
    if (results.companies_processed) {
      output.batch_results = results.companies_processed;
      output.batch_count = results.companies_processed.length;
    }

    return output;
  })
  .catch(error => {
    console.error('Processing error:', error);
    return {
      processing_id: `PROC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message,
      error_type: error.name,
      input_type: inputType?.type || 'unknown',
      requires_review: true,
      status: 'Error'
    };
  });