// LinkedIn 4-Feeds Unified Processor for Zapier
// Complete code voor je Code by Zapier step
// Verwerkt automatisch alle 4 LinkedIn export types uit Gmail

// Configuration
const brave_api_key = inputData.brave_api_key || 'BSAW_h04juedQeMi6BwPvPLlfST4vC3';
const pipedrive_api_token = inputData.pipedrive_api_token || '';

// Detect feed type from email subject/body
function detectFeedType(emailSubject, emailBody) {
  const subject = (emailSubject || '').toLowerCase();
  const body = (emailBody || '').toLowerCase();

  if (subject.includes('sales navigator') || body.includes('lead export')) {
    return 'sales_navigator';
  } else if (subject.includes('recruiter') || body.includes('candidate export')) {
    return 'recruiter';
  } else if (subject.includes('talent insights') && (subject.includes('talent') || body.includes('talent pool'))) {
    return 'talent_insights_talent';
  } else if (subject.includes('talent insights') && (subject.includes('company') || body.includes('company report'))) {
    return 'talent_insights_company';
  }
  return 'unknown';
}

// Parse email content based on feed type
function parseEmailContent(feedType, emailBody) {
  const lines = emailBody.split('\n');
  const data = {};

  switch(feedType) {
    case 'sales_navigator':
      // Extract Sales Navigator lead data
      lines.forEach(line => {
        if (line.includes('Name:')) data.name = line.split('Name:')[1]?.trim();
        if (line.includes('Title:')) data.title = line.split('Title:')[1]?.trim();
        if (line.includes('Company:')) data.company = line.split('Company:')[1]?.trim();
        if (line.includes('Location:')) data.location = line.split('Location:')[1]?.trim();
        if (line.includes('linkedin.com/in/')) {
          const urlMatch = line.match(/(https?:\/\/[^\s]+linkedin\.com\/in\/[^\s]+)/);
          if (urlMatch) data.linkedin_url = urlMatch[1];
        }
      });
      break;

    case 'recruiter':
      // Extract Recruiter candidate data
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
      break;

    case 'talent_insights_talent':
      // Extract Talent Insights - Talent Report
      lines.forEach(line => {
        if (line.includes('Market:')) data.market = line.split('Market:')[1]?.trim();
        if (line.includes('Talent Pool:')) data.talent_pool_size = line.split('Talent Pool:')[1]?.trim();
        if (line.includes('Growth Rate:')) data.growth_rate = parseFloat(line.split('Growth Rate:')[1]?.replace('%','')?.trim());
        if (line.includes('Top Skills:')) data.top_skills = line.split('Top Skills:')[1]?.trim();
        if (line.includes('Companies Hiring:')) data.companies_hiring = line.split('Companies Hiring:')[1]?.trim();
        if (line.includes('Average Tenure:')) data.avg_tenure = line.split('Average Tenure:')[1]?.trim();
      });
      break;

    case 'talent_insights_company':
      // Extract Talent Insights - Company Report
      lines.forEach(line => {
        if (line.includes('Company:')) data.company_name = line.split('Company:')[1]?.trim();
        if (line.includes('Employee Count:')) data.employee_count = line.split('Employee Count:')[1]?.trim();
        if (line.includes('Growth:')) data.growth_rate = parseFloat(line.split('Growth:')[1]?.replace('%','')?.trim());
        if (line.includes('Departments:')) data.top_departments = line.split('Departments:')[1]?.trim();
        if (line.includes('Hiring Trends:')) data.hiring_trends = line.split('Hiring Trends:')[1]?.trim();
        if (line.includes('Top Skills:')) data.top_skills = line.split('Top Skills:')[1]?.trim();
      });
      break;
  }

  return data;
}

// Enrich with Brave Search
async function enrichWithBraveSearch(data, feedType) {
  const enriched = { ...data };

  // Only enrich if we have a company name
  const companyName = data.company || data.current_company || data.company_name;

  if (companyName && brave_api_key) {
    try {
      const searchUrl = 'https://api.search.brave.com/res/v1/web/search';
      const params = new URLSearchParams({
        q: `${companyName} Nederland site:linkedin.com/company OR site:kvk.nl OR site:glassdoor.nl`,
        count: '10',
        country: 'nl'
      });

      const response = await fetch(`${searchUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': brave_api_key
        }
      });

      if (response.ok) {
        const searchData = await response.json();

        if (searchData.web && searchData.web.results) {
          // Extract company insights
          enriched.company_insights = {
            found: true,
            linkedin_company_url: null,
            kvk_url: null,
            glassdoor_url: null,
            recent_news: [],
            industry: null,
            location: null
          };

          searchData.web.results.forEach(result => {
            // LinkedIn Company URL
            if (result.url.includes('linkedin.com/company')) {
              enriched.company_insights.linkedin_company_url = result.url;
            }

            // KvK URL
            if (result.url.includes('kvk.nl')) {
              enriched.company_insights.kvk_url = result.url;
            }

            // Glassdoor URL
            if (result.url.includes('glassdoor.nl')) {
              enriched.company_insights.glassdoor_url = result.url;

              // Try to extract rating
              const ratingMatch = result.description?.match(/(\d[.,]\d)\s*(sterren|\/5)/);
              if (ratingMatch) {
                enriched.company_insights.glassdoor_rating = parseFloat(ratingMatch[1].replace(',', '.'));
              }
            }

            // Extract location from descriptions
            if (!enriched.company_insights.location) {
              const dutchCities = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven', 'Den Haag', 'Tilburg', 'Groningen'];
              for (const city of dutchCities) {
                if (result.description?.includes(city)) {
                  enriched.company_insights.location = city;
                  break;
                }
              }
            }

            // Collect recent news
            if (result.age && !result.url.includes('linkedin.com') && !result.url.includes('kvk.nl')) {
              enriched.company_insights.recent_news.push({
                title: result.title,
                url: result.url,
                published: result.age
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Brave Search error:', error.message);
      enriched.enrichment_error = error.message;
    }
  }

  return enriched;
}

// Calculate scores based on feed type
function calculateScores(data, feedType) {
  const scored = { ...data };

  switch(feedType) {
    case 'sales_navigator':
      // Lead quality score
      let leadScore = 0;
      if (data.name) leadScore += 20;
      if (data.company) leadScore += 20;
      if (data.title) leadScore += 20;
      if (data.linkedin_url) leadScore += 20;
      if (data.company_insights?.found) leadScore += 20;
      scored.lead_quality_score = leadScore;
      break;

    case 'recruiter':
      // Skill match score
      const targetSkills = ['Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'Java', 'SQL'];
      const candidateSkills = (data.skills || '').toLowerCase().split(',').map(s => s.trim());
      let matches = 0;

      targetSkills.forEach(skill => {
        if (candidateSkills.some(cs => cs.includes(skill.toLowerCase()))) {
          matches++;
        }
      });

      scored.skill_match_score = Math.round((matches / targetSkills.length) * 100);
      scored.matched_skills = matches;
      break;

    case 'talent_insights_talent':
      // Market opportunity score
      let marketScore = 0;
      if (data.growth_rate > 10) marketScore += 40;
      if (parseInt(data.talent_pool_size) > 1000) marketScore += 30;
      if (data.companies_hiring && data.companies_hiring.split(',').length > 5) marketScore += 30;
      scored.market_opportunity_score = marketScore;
      break;

    case 'talent_insights_company':
      // Company growth score
      let growthScore = 0;
      if (data.growth_rate > 15) growthScore += 40;
      if (parseInt(data.employee_count) > 500) growthScore += 30;
      if (data.hiring_trends && data.hiring_trends.includes('expanding')) growthScore += 30;
      scored.company_growth_score = growthScore;
      break;
  }

  return scored;
}

// Check for Pipedrive organization
async function checkPipedriveOrganization(companyName) {
  if (!pipedrive_api_token || !companyName) {
    return { found: false };
  }

  try {
    const searchUrl = `https://api.pipedrive.com/v1/organizations/search`;
    const params = new URLSearchParams({
      term: companyName,
      api_token: pipedrive_api_token,
      limit: 1
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
        return {
          found: true,
          organization_id: data.data.items[0].item.id,
          organization_name: data.data.items[0].item.name
        };
      }
    }
  } catch (error) {
    console.error('Pipedrive error:', error.message);
  }

  return { found: false };
}

// Main processing function
async function processLinkedInExport() {
  // Get input data
  const emailSubject = inputData.email_subject || inputData.subject || '';
  const emailBody = inputData.email_body || inputData.body || inputData.text || '';
  const emailFrom = inputData.email_from || inputData.from || '';

  // Detect feed type
  const feedType = detectFeedType(emailSubject, emailBody);

  if (feedType === 'unknown') {
    return {
      success: false,
      error: 'Could not identify LinkedIn export type',
      email_subject: emailSubject.substring(0, 100),
      processing_success: false
    };
  }

  // Parse email content
  let parsedData = parseEmailContent(feedType, emailBody);

  // Add metadata
  parsedData.feed_type = feedType;
  parsedData.import_timestamp = new Date().toISOString();
  parsedData.email_subject = emailSubject;
  parsedData.source = 'LinkedIn ' + feedType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Enrich with Brave Search
  parsedData = await enrichWithBraveSearch(parsedData, feedType);

  // Calculate scores
  parsedData = await calculateScores(parsedData, feedType);

  // Check Pipedrive for company
  const companyName = parsedData.company || parsedData.current_company || parsedData.company_name;
  if (companyName) {
    const pipedriveCheck = await checkPipedriveOrganization(companyName);
    parsedData.pipedrive = pipedriveCheck;
  }

  // Calculate data completeness
  const requiredFields = {
    sales_navigator: ['name', 'company', 'title'],
    recruiter: ['candidate_name', 'current_company', 'skills'],
    talent_insights_talent: ['market', 'talent_pool_size', 'growth_rate'],
    talent_insights_company: ['company_name', 'employee_count', 'growth_rate']
  };

  const required = requiredFields[feedType] || [];
  const filled = required.filter(field => parsedData[field]);
  parsedData.data_completeness = Math.round((filled.length / required.length) * 100);

  // Set processing status
  parsedData.processing_success = true;
  parsedData.requires_review = parsedData.data_completeness < 70;

  // Format for output
  return {
    // Status
    processing_success: true,
    feed_type: feedType,

    // Core data (varies by feed type)
    ...parsedData,

    // Metadata
    import_id: `LINKEDIN_${feedType.toUpperCase()}_${Date.now()}`,
    imported_at: parsedData.import_timestamp,

    // For downstream steps
    should_create_person: feedType === 'sales_navigator' || feedType === 'recruiter',
    should_create_company: feedType === 'talent_insights_company' || (parsedData.company && !parsedData.pipedrive?.found),
    should_send_alert: parsedData.lead_quality_score >= 80 || parsedData.skill_match_score >= 70 || parsedData.market_opportunity_score >= 80
  };
}

// Execute and return
return processLinkedInExport();