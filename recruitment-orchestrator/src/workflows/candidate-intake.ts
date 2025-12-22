/**
 * Workflow 1: Candidate Intake
 * Processes new candidates from Jotform through full pipeline
 */

import { WorkflowDefinition } from '../types/workflows.js';
import { pipedriveClient } from '../integrations/pipedrive-client.js';

export async function candidateIntake(params: {
  name: string;
  email: string;
  phone?: string;
  current_company?: string;
  position?: string;
  skills?: string;
}) {
  console.log('🚀 Starting candidate intake workflow...');

  try {
    // 1. Check for duplicates
    console.log('Checking for duplicates...');
    const existing: any = await pipedriveClient.searchPersons({ email: params.email });
    
    if (existing?.data?.items?.length > 0) {
      console.log('⚠️  Duplicate found, skipping...');
      return {
        success: false,
        message: 'Candidate already exists in Pipedrive',
        existing_person_id: existing.data.items[0].item.id,
      };
    }

    // 2. Create person in Pipedrive
    console.log('Creating person in Pipedrive...');
    const person: any = await pipedriveClient.createPerson({
      name: params.name,
      email: params.email,
      phone: params.phone,
    });

    console.log(`✅ Person created: ID ${person.data.id}`);

    // 3. Create deal
    console.log('Creating deal...');
    const deal: any = await pipedriveClient.createDeal({
      title: `${params.name} - ${params.position || 'Candidate'}`,
      person_id: person.data.id,
      value: 5000, // Estimated placement fee
    });

    console.log(`✅ Deal created: ID ${deal.data.id}`);

    // 4. Add note with details
    console.log('Adding note...');
    await pipedriveClient.addNote({
      deal_id: deal.data.id,
      content: `
🤖 New candidate via Recruitment Orchestrator

📋 Details:
- Current Company: ${params.current_company || 'N/A'}
- Position: ${params.position || 'N/A'}
- Skills: ${params.skills || 'N/A'}
- Email: ${params.email}
- Phone: ${params.phone || 'N/A'}

⏰ Added: ${new Date().toLocaleString('nl-NL')}
      `.trim(),
    });

    console.log(`✅ Note added`);

    // 5. Schedule intake activity
    console.log('Scheduling intake activity...');
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    await pipedriveClient.createActivity({
      subject: `Intake call - ${params.name}`,
      deal_id: deal.data.id,
      type: 'call',
      due_date: nextWeek.toISOString().split('T')[0],
      note: 'Schedule intake call with candidate',
    });

    console.log(`✅ Activity scheduled for ${nextWeek.toISOString().split('T')[0]}`);

    // 6. Return success
    return {
      success: true,
      person_id: person.data.id,
      deal_id: deal.data.id,
      message: 'Candidate intake completed successfully! ✅',
      pipedrive_url: `https://recruitinbv.pipedrive.com/deal/${deal.data.id}`,
      time_taken: 'Less than 30 seconds',
    };

  } catch (error: any) {
    console.error('❌ Error in candidate intake:', error);
    return {
      success: false,
      error: error.message,
      message: 'Candidate intake failed',
    };
  }
}

export const candidateIntakeWorkflow: WorkflowDefinition = {
  name: 'candidate_intake',
  description: 'Process new candidate from Jotform submission through full recruitment pipeline',
  trigger: 'manual',

  steps: [
    {
      name: 'extract_candidate_data',
      local: 'javascript',
      code: `
        // Extract candidate data from Jotform or params
        return {
          name: jotform_data?.name || params?.name || 'Unknown',
          email: jotform_data?.email || params?.email,
          role: jotform_data?.role || params?.role || 'Developer',
          location: jotform_data?.location || params?.location || 'Amsterdam',
          experience_level: jotform_data?.experience_level || params?.seniority || 'Medior',
          expected_salary: parseInt(jotform_data?.expected_salary || params?.expected_salary || '60000'),
          skills: (jotform_data?.skills || params?.skills || 'JavaScript,React').split(',').map(s => s.trim()),
          current_company: jotform_data?.current_company || params?.current_company || 'Unknown'
        }
      `,
      output: 'candidate_data'
    },

    {
      name: 'salary_benchmark_lookup',
      mcp: 'salary-benchmark',
      tool: 'get_market_rate',
      params: {
        role: '${candidate_data.role}',
        location: '${candidate_data.location}',
        seniority: '${candidate_data.experience_level}'
      },
      output: 'salary_data',
      on_error: 'continue',
      retry: {
        max_attempts: 2,
        delay: 1000
      }
    },

    {
      name: 'analyze_skills_demand',
      mcp: 'recruitment-trends',
      tool: 'analyze_skills',
      params: {
        skills: '${candidate_data.skills}'
      },
      output: 'trend_data',
      on_error: 'continue',
      retry: {
        max_attempts: 2,
        delay: 1000
      }
    },

    {
      name: 'create_pipedrive_deal',
      mcp: 'pipedrive-automation',
      tool: 'create_deal',
      params: {
        title: '${candidate_data.name} - ${candidate_data.role}',
        person_name: '${candidate_data.name}',
        person_email: '${candidate_data.email}',
        org_name: '${candidate_data.current_company}',
        value: '${salary_data.market_median || candidate_data.expected_salary}',
        source: 'Jotform Lead'
      },
      output: 'deal_data',
      retry: {
        max_attempts: 3,
        delay: 2000
      }
    },

    {
      name: 'add_intelligence_note',
      mcp: 'pipedrive-automation',
      tool: 'add_note_to_deal',
      params: {
        deal_id: '${deal_data.id}',
        content: `📊 Market Intelligence Report

💰 Salary Analysis:
- Market Rate: €\${context.salary_data?.market_median || 'N/A'}
- Candidate Expectation: €\${context.candidate_data?.expected_salary || 'N/A'}
- Difference: €\${((context.salary_data?.market_median || 0) - (context.candidate_data?.expected_salary || 0))}
- Percentile: \${context.salary_data?.percentile || 'N/A'}

🔥 Skills Demand Analysis:
- Overall Demand Score: \${context.trend_data?.demand_score || 'N/A'}/100
- Market Fit: \${context.trend_data?.market_fit || 'Good'}
- Trending Skills: \${context.trend_data?.hot_skills ? context.trend_data.hot_skills.join(', ') : 'N/A'}
- Growth Trajectory: \${context.trend_data?.trend_direction || 'Stable'}

📈 Recommendation:
\${(context.trend_data?.demand_score || 0) > 80 ? '⭐ HIGH PRIORITY - Skills in high demand!' : 
  (context.trend_data?.demand_score || 0) > 60 ? '✅ GOOD FIT - Solid market position' : 
  '⚠️ Review carefully - Lower demand skills'}`
      },
      output: 'note_result',
      on_error: 'continue'
    }
  ],

  return: {
    candidate_name: '${candidate_data.name}',
    candidate_email: '${candidate_data.email}',
    deal_id: '${deal_data.id}',
    deal_url: '${deal_data.url}',
    market_salary: '${salary_data.market_median}',
    expected_salary: '${candidate_data.expected_salary}',
    salary_diff: '${(salary_data.market_median || candidate_data.expected_salary) - candidate_data.expected_salary}',
    skill_demand_score: '${trend_data.demand_score}',
    processing_time_ms: '${workflow.duration}',
    status: 'completed'
  }
};
