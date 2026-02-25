import { PipedriveIntegrator } from './pipedrive-integrator.js';

interface JobDiggerPersonalizationData {
  company_name: string;
  contact_name: string;
  vacancy_title: string;
  tech_stack?: string;
  company_size: string;
  location: string;
  urgency_level: string;
}

interface JobDiggerEmailData {
  subject: string;
  body: string;
  framework: string;
  tone: string;
  effectiveness_score: number;
}

interface JobDiggerSequenceStrategy {
  email_1: { approach: 'tech_shortage' | 'developer_pipeline', timing: string, framework: string };
  email_2: { approach: 'talent_pipeline' | 'tech_scaling', timing: string, framework: string };
  email_3: { approach: 'team_scaling' | 'innovation_focus', timing: string, framework: string };
  email_4: { approach: 'tech_expertise' | 'competitive_edge', timing: string, framework: string };
  email_5: { approach: 'innovation_growth' | 'market_position', timing: string, framework: string };
  email_6: { approach: 'partnership' | 'long_term_strategy', timing: string, framework: string };
}

export class JobDiggerIntegrator extends PipedriveIntegrator {
  
  // JobDigger pipeline and stage configuration
  private readonly JOBDIGGER_PIPELINE_ID = 12;  // "JobDigger Automation" pipeline
  private readonly EMAIL_SEQUENCE_READY_STAGE_ID = 83;  // "Contact gemaakt" stage

  // Override sequence strategy for tech vacatures
  determineJobDiggerSequence(
    vacancy_title: string, 
    company_size?: string, 
    tech_stack?: string, 
    urgency_level?: string
  ): JobDiggerSequenceStrategy {
    const vacancyLower = vacancy_title.toLowerCase();
    const isSeniorRole = vacancyLower.includes('senior') || 
                        vacancyLower.includes('lead') ||
                        vacancyLower.includes('architect') ||
                        vacancyLower.includes('principal');
    
    const isStartup = company_size?.toLowerCase().includes('startup') || 
                     company_size?.toLowerCase().includes('scale-up');
    const isUrgent = urgency_level === 'high';
    
    // Tech-focused sequence strategy
    if (isSeniorRole && isStartup) {
      return {
        email_1: { approach: 'tech_shortage', timing: 'immediate', framework: 'Problem-Solution' },
        email_2: { approach: 'talent_pipeline', timing: '7 days', framework: 'Value-First' },
        email_3: { approach: 'team_scaling', timing: '14 days', framework: 'AIDA' },
        email_4: { approach: 'competitive_edge', timing: '21 days', framework: 'Problem-Solution' },
        email_5: { approach: 'innovation_growth', timing: '35 days', framework: 'Value-First' },
        email_6: { approach: 'partnership', timing: '49 days', framework: 'AIDA' }
      };
    } else if (isUrgent) {
      return {
        email_1: { approach: 'developer_pipeline', timing: 'immediate', framework: 'AIDA' },
        email_2: { approach: 'tech_scaling', timing: '5 days', framework: 'Problem-Solution' },
        email_3: { approach: 'innovation_focus', timing: '10 days', framework: 'Value-First' },
        email_4: { approach: 'tech_expertise', timing: '17 days', framework: 'AIDA' },
        email_5: { approach: 'market_position', timing: '31 days', framework: 'Problem-Solution' },
        email_6: { approach: 'long_term_strategy', timing: '45 days', framework: 'Value-First' }
      };
    } else {
      // Default tech sequence
      return {
        email_1: { approach: 'tech_shortage', timing: 'immediate', framework: 'PAS' },
        email_2: { approach: 'talent_pipeline', timing: '7 days', framework: 'Value-First' },
        email_3: { approach: 'team_scaling', timing: '14 days', framework: 'AIDA' },
        email_4: { approach: 'tech_expertise', timing: '21 days', framework: 'Problem-Solution' },
        email_5: { approach: 'innovation_growth', timing: '35 days', framework: 'Value-First' },
        email_6: { approach: 'partnership', timing: '49 days', framework: 'AIDA' }
      };
    }
  }
  
  // Tech-specific email generation
  async generateJobDiggerEmail(
    emailNumber: number, 
    data: JobDiggerPersonalizationData, 
    strategy: JobDiggerSequenceStrategy
  ): Promise<JobDiggerEmailData> {
    const strategyKey = `email_${emailNumber}` as keyof JobDiggerSequenceStrategy;
    const emailStrategy = strategy[strategyKey];
    
    // Tech-focused contexts and pain points
    let context = '';
    let tone = 'professional';
    
    const techPainPoints = [
      'Developer shortage: 65% meer vraag dan aanbod',
      'Gemiddelde time-to-hire developers: 12+ weken',
      'Competitie voor senior talent is enorm',
      'Tech-stack specifieke expertise vereist',
      'Remote work verwachtingen',
      'Salary inflatie in tech sector (+40% vs andere sectoren)'
    ];
    
    const techSolutions = [
      'Direct toegang tot 2.000+ pre-screened developers',
      'Tech-stack specifieke sourcing (React, Python, AWS, etc.)',
      'Competitieve salary benchmarking',
      'Remote-first recruitment aanpak',
      'Technische interview ondersteuning',
      'Employer branding voor tech companies'
    ];
    
    switch (emailStrategy.approach) {
      case 'tech_shortage':
        context = `${data.company_name} zoekt ${data.vacancy_title}. **Tech realiteit:** ${techPainPoints[0]}. Wij hebben directe oplossing: ${techSolutions[0]}. Focus op snelle plaatsing vs. lange zoektocht.`;
        tone = 'urgent';
        break;
      
      case 'developer_pipeline':
        context = `Direct developer pipeline voor ${data.company_name}. ${techSolutions[1]} + ${techSolutions[2]}. Concrete aanpak voor ${data.vacancy_title} met tech-stack focus.`;
        tone = 'confident';
        break;
        
      case 'talent_pipeline':
        const techStack = data.tech_stack || 'moderne tech stack';
        context = `Follow-up ${data.company_name}: onze tech talent pipeline. Specialized sourcing voor ${techStack}. ${techSolutions[3]} + ${techSolutions[4]}.`;
        tone = 'consultative';
        break;
        
      case 'team_scaling':
        context = `Team scaling strategie voor ${data.company_name}. ${emailNumber === 3 ? 'Concrete case study' : 'Strategische aanpak'}: hoe tech teams snel en effectief uitbreiden. ${data.vacancy_title} als onderdeel van groter plan.`;
        tone = 'strategic';
        break;
        
      case 'innovation_focus':
        context = `Innovation focus voor ${data.company_name}. ${techPainPoints[3]} + ${techSolutions[5]}. Hoe recruitment bijdraagt aan tech innovation doelstellingen.`;
        tone = 'innovative';
        break;
        
      case 'tech_expertise':
        context = `Tech expertise match voor ${data.vacancy_title}. Specialized approach: ${techSolutions[1]} + ${techSolutions[4]}. Concrete expertise validation proces.`;
        tone = 'expert';
        break;
        
      case 'competitive_edge':
        context = `Competitief voordeel ${data.company_name}. ${techPainPoints[1]} vs. onze 6-weken gemiddelde. Hoe sneller recruitment = business advantage.`;
        tone = 'competitive';
        break;
        
      case 'innovation_growth':
        context = `Innovation & growth strategie. Tech talent als growth driver voor ${data.company_name}. ${data.vacancy_title} rol in scaling strategy.`;
        tone = 'visionary';
        break;
        
      case 'market_position':
        context = `Market positioning via tech talent. ${techPainPoints[4]} + ${techPainPoints[5]} = opportunity voor ${data.company_name}. Strategic talent acquisition.`;
        tone = 'strategic';
        break;
        
      case 'partnership':
        context = `Long-term partnership voorstel. ${data.company_name} tech team growth support. Niet alleen ${data.vacancy_title}, maar complete tech recruitment strategy.`;
        tone = 'partnership';
        break;
        
      case 'long_term_strategy':
        context = `Long-term tech recruitment strategie. Final touch: hoe ${data.company_name} tech talent pipeline structureel kan optimaliseren.`;
        tone = 'strategic';
        break;
        
      default:
        context = `Tech recruitment follow-up voor ${data.company_name}. Professional approach voor ${data.vacancy_title} met focus op tech sector specifieke uitdagingen.`;
    }

    // Generate the email using the enhanced EmailComposer
    const emailResult = await this.emailComposer.composeEmail({
      subject: `Re: ${data.vacancy_title} - ${this.getTechSubjectHook(emailStrategy.approach)}`,
      recipient: data.contact_name,
      context,
      tone: tone as any,
      language: 'nl',
      length: emailNumber <= 2 ? 'medium' : 'short',
      sector: 'technology',
      framework: emailStrategy.framework as any,
      company: data.company_name,
      goal: emailNumber === 1 ? 'meeting request' : 'engagement'
    });

    if (!emailResult.success || !emailResult.data) {
      throw new Error(`JobDigger email generation failed: ${emailResult.error || 'No data returned'}`);
    }

    // Apply tech-specific personalization
    const personalizedSubject = this.personalizeTechSubject(emailResult.data.primary_subject, data, emailStrategy.approach);
    const personalizedBody = this.personalizeTechBody(emailResult.data.content, data, emailStrategy.approach, emailNumber);

    // Clean formatting for Pipedrive templates
    const cleanSubject = personalizedSubject.replace(/\*\*(.*?)\*\*/g, '$1');
    const cleanBody = personalizedBody.replace(/\*\*(.*?)\*\*/g, '$1');

    return {
      subject: cleanSubject,
      body: cleanBody,
      framework: emailResult.data.framework_used,
      tone: emailResult.data.tone,
      effectiveness_score: emailResult.data.effectiveness_score
    };
  }
  
  private getTechSubjectHook(approach: string): string {
    const techHooks = {
      'tech_shortage': 'Developer tekort oplossen?',
      'developer_pipeline': 'Tech talent pipeline direct beschikbaar',
      'talent_pipeline': 'Gespecialiseerde tech sourcing',
      'team_scaling': 'Tech team scaling strategie',
      'innovation_focus': 'Innovation via tech talent',
      'tech_expertise': 'Tech stack expertise match',
      'competitive_edge': 'Competitive advantage via snelle hiring',
      'innovation_growth': 'Growth via tech innovation',
      'market_position': 'Tech talent market positioning',
      'partnership': 'Strategic tech recruitment partnership',
      'long_term_strategy': 'Long-term tech recruitment strategie'
    };
    return techHooks[approach as keyof typeof techHooks] || 'Tech recruitment follow-up';
  }

  private personalizeTechSubject(subject: string, data: JobDiggerPersonalizationData, approach: string): string {
    let personalized = subject
      .replace(/\{company_name\}/g, data.company_name)
      .replace(/\{contact_name\}/g, data.contact_name)
      .replace(/\{vacancy_title\}/g, data.vacancy_title);

    // Add tech-stack specific elements
    if (data.tech_stack && (approach === 'tech_expertise' || approach === 'developer_pipeline')) {
      personalized = personalized.replace('?', ` [${data.tech_stack}]?`);
    }

    return personalized;
  }

  private personalizeTechBody(body: string, data: JobDiggerPersonalizationData, approach: string, emailNumber: number): string {
    let personalized = body
      .replace(/\{company_name\}/g, data.company_name)
      .replace(/\{contact_name\}/g, data.contact_name)
      .replace(/\{vacancy_title\}/g, data.vacancy_title)
      .replace(/\{location\}/g, data.location);

    // Add tech-specific elements based on approach
    switch (approach) {
      case 'tech_shortage':
        personalized += `\n\n**Tech sector realiteit voor ${data.company_name}:**\n→ 65% meer vraag dan aanbod voor developers\n→ Gemiddelde time-to-hire: 12+ weken\n→ Onze oplossing: 6 weken gemiddelde plaatsing\n\n→ https://calendly.com/recruitin/20min-tech-talk`;
        break;
        
      case 'developer_pipeline':
        const techStack = data.tech_stack || 'moderne tech stack';
        personalized += `\n\n**Direct beschikbaar voor ${data.company_name}:**\n• 2.000+ pre-screened developers\n• Specialist sourcing voor ${techStack}\n• Technical interview ondersteuning\n\n💻 **Focus areas:** React, Python, AWS, DevOps, AI/ML\n→ Interesse in quick scan huidige tech behoeften?`;
        break;
        
      case 'team_scaling':
        personalized += `\n\n**Team scaling success case:**\nScale-up in ${data.location} zocht 3 developers:\n→ Maand 1: Senior Developer geplaatst\n→ Maand 2-3: 2 Mid-level developers\n→ Resultaat: Team operationeel binnen 10 weken\n\nKan ${data.company_name} vergelijkbaar helpen?`;
        break;
    }

    // Add tech-focused signature
    personalized += `\n\nGroet,\n\n**Wouter van der Linden**\nTech Recruitment Specialist | Recruitin B.V.\n📞 06-14314593 | 🌐 recruitin.nl\n💻 Specialized in Developer, Engineer & Analyst placements`;

    // Add sequence-appropriate footer
    if (emailNumber >= 4) {
      personalized += `\n\n---\nGeen interesse in tech recruitment? Reply met "STOP" en je hoort niets meer.`;
    } else if (emailNumber === 1) {
      personalized += `\n\n---\nDeze email is verstuurd omdat ${data.company_name} recent een ${data.vacancy_title} vacature heeft gepubliceerd.`;
    }

    return personalized;
  }

  // JobDigger deal update with pipeline 2 fields (will use general email fields)
  async updateJobDiggerDeal(
    dealId: string, 
    emailSequence: JobDiggerEmailData[], 
    apiToken: string
  ): Promise<{success: boolean, fields_updated: string[]}> {
    try {
      const fieldsToUpdate: any = {};
      const fieldsUpdated: string[] = [];

      // Since we don't have JobDigger-specific fields yet, we'll use the general email fields
      // This can be updated later when JobDigger-specific fields are created
      const fieldMapping = [
        // Email 1 (use general email fields for now)
        { subject: '47a7d774bf5b08226ce8d6e1e79708f1d44e3e30', body: '867577ef580ff8d22c74799d949483401bba2e26' },
        // Email 2  
        { subject: 'c9b94aad810dad22e3835669aff3076e9bbed481', body: '14229c6d09ce02f7752762831cb290c2845a0adc' },
      ];

      // Save first 2 emails (can be extended when more fields are available)
      for (let i = 0; i < Math.min(emailSequence.length, 2); i++) {
        const email = emailSequence[i];
        const mapping = fieldMapping[i];
        
        fieldsToUpdate[mapping.subject] = email.subject;
        fieldsToUpdate[mapping.body] = email.body;
        
        fieldsUpdated.push(`JobDigger Email ${i+1} Subject`, `JobDigger Email ${i+1} Body`);
      }

      console.log(`📝 Updating JobDigger deal ${dealId} with ${fieldsUpdated.length} fields:`);
      console.log(`   ${fieldsUpdated.join(', ')}`);

      // Update Pipedrive deal
      const response = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${dealId}?api_token=${apiToken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldsToUpdate)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pipedrive API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json() as any;
      
      if (result.success) {
        // Move to JobDigger Email Sequence Ready stage
        console.log('🚀 Moving JobDigger deal to Email Sequence Ready stage...');
        
        try {
          const stageUpdateResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${dealId}?api_token=${apiToken}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stage_id: this.EMAIL_SEQUENCE_READY_STAGE_ID })
          });
          
          const stageResult = await stageUpdateResponse.json() as any;
          
          if (stageResult.success) {
            console.log(`✅ JobDigger deal moved to stage ${this.EMAIL_SEQUENCE_READY_STAGE_ID} - ready for tech automation!`);
          }
        } catch (stageError: any) {
          console.log('⚠️  Warning: Could not auto-move JobDigger deal:', stageError.message);
        }
      }
      
      return {
        success: result.success === true,
        fields_updated: fieldsUpdated
      };

    } catch (error: any) {
      throw new Error(`Failed to update JobDigger deal: ${error.message}`);
    }
  }
}