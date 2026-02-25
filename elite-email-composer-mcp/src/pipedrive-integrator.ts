import { EmailComposer } from './email-composer.js';

interface PersonalizationData {
  company_name: string;
  contact_name: string;
  vacancy_title: string;
  sector: string;
  company_size: string;
  location: string;
  urgency_level: string;
}

interface EmailData {
  subject: string;
  body: string;
  framework: string;
  tone: string;
  effectiveness_score: number;
}

interface SequenceStrategy {
  email_1: { approach: 'rpo_bridge' | 'interim_relief' | 'hybrid_model', timing: string };
  email_2: { approach: 'follow_up' | 'value_add' | 'social_proof', timing: string };
  email_3: { approach: 'urgency' | 'case_study' | 'alternative_offer', timing: string };
  email_4: { approach: 'breakup' | 'final_value' | 'competitor_reference', timing: string };
  email_5: { approach: 'reconnect' | 'new_angle' | 'industry_insight', timing: string };
  email_6: { approach: 'final_touch' | 'value_summary' | 'door_closer', timing: string };
}

export class PipedriveIntegrator {
  protected emailComposer: EmailComposer;

  constructor() {
    this.emailComposer = new EmailComposer();
  }

  determineSequenceStrategy(vacancy_title: string, sector?: string, company_size?: string, urgency_level?: string): SequenceStrategy {
    const vacancyLower = vacancy_title.toLowerCase();
    const isRecruiterRole = vacancyLower.includes('recruiter');
    const isHRRole = vacancyLower.includes('hr') || vacancyLower.includes('human resources');
    const isTechSector = sector?.toLowerCase().includes('tech') || sector?.toLowerCase().includes('software');
    const isUrgent = urgency_level === 'high';
    const isEnterprise = company_size?.toLowerCase().includes('enterprise') || company_size?.toLowerCase().includes('large');

    // Strategic sequencing based on the user's proven email templates
    if (isRecruiterRole && isTechSector && !isEnterprise) {
      // Tech scale-up looking for recruiter = RPO focus sequence  
      return {
        email_1: { approach: 'rpo_bridge', timing: 'immediate' },
        email_2: { approach: 'value_add', timing: '7 days' },
        email_3: { approach: 'case_study', timing: '14 days' },
        email_4: { approach: 'competitor_reference', timing: '21 days' },
        email_5: { approach: 'industry_insight', timing: '35 days' },
        email_6: { approach: 'value_summary', timing: '49 days' }
      };
    } else if (isRecruiterRole && isEnterprise) {
      // Enterprise recruiter search = Hybrid model focus
      return {
        email_1: { approach: 'hybrid_model', timing: 'immediate' },
        email_2: { approach: 'social_proof', timing: '7 days' },
        email_3: { approach: 'alternative_offer', timing: '14 days' },
        email_4: { approach: 'final_value', timing: '21 days' },
        email_5: { approach: 'new_angle', timing: '35 days' },
        email_6: { approach: 'door_closer', timing: '49 days' }
      };
    } else if (isUrgent) {
      // High urgency = Interim relief focus
      return {
        email_1: { approach: 'interim_relief', timing: 'immediate' },
        email_2: { approach: 'follow_up', timing: '3 days' },
        email_3: { approach: 'case_study', timing: '7 days' },
        email_4: { approach: 'breakup', timing: '14 days' },
        email_5: { approach: 'reconnect', timing: '28 days' },
        email_6: { approach: 'final_touch', timing: '42 days' }
      };
    } else {
      // Default balanced approach
      return {
        email_1: { approach: 'rpo_bridge', timing: 'immediate' },
        email_2: { approach: 'follow_up', timing: '7 days' },
        email_3: { approach: 'urgency', timing: '14 days' },
        email_4: { approach: 'breakup', timing: '21 days' },
        email_5: { approach: 'reconnect', timing: '35 days' },
        email_6: { approach: 'final_touch', timing: '49 days' }
      };
    }
  }

  async generatePersonalizedEmail(
    emailNumber: number, 
    data: PersonalizationData, 
    strategy: SequenceStrategy
  ): Promise<EmailData> {
    const strategyKey = `email_${emailNumber}` as keyof SequenceStrategy;
    const emailStrategy = strategy[strategyKey];
    
    // Map strategy to copywriting framework and context
    let framework = 'PAS';  // Default
    let context = '';
    let tone = 'professional';
    
    switch (emailStrategy.approach) {
      case 'rpo_bridge':
        framework = 'Problem-Solution';
        context = `${data.company_name} zoekt een ${data.vacancy_title}. Alternatief: RPO als overbrugging tijdens zoektocht. Focus op structurele capaciteit vs. 1 persoon zoeken.`;
        tone = 'consultative';
        break;
      
      case 'interim_relief':
        framework = 'AIDA';
        context = `Immediate relief aanbod voor ${data.company_name}. Interim recruitment binnen 48 uur terwijl zij zoeken naar ${data.vacancy_title}. Cost-benefit approach.`;
        tone = 'urgent';
        break;
        
      case 'hybrid_model':
        framework = 'Value-First';
        context = `Moderne alternatief voor ${data.company_name}: Recruitment-as-a-Service model. Specialist expertise + employer branding vs. inhouse ${data.vacancy_title}.`;
        tone = 'innovative';
        break;
        
      case 'follow_up':
        framework = 'PAS';
        context = `Follow-up op vorige email over recruitment oplossingen voor ${data.company_name}. Kort, direct, vraag naar huidige status ${data.vacancy_title} zoektocht.`;
        tone = 'friendly';
        break;
        
      case 'value_add':
        framework = 'Value-First';
        context = `Toegevoegde waarde voor ${data.company_name}: Concrete berekening cost-per-hire vs. onze oplossing. Data-driven approach voor ${data.sector} sector.`;
        tone = 'analytical';
        break;
        
      case 'social_proof':
        framework = 'AIDA';
        context = `Social proof case: vergelijkbaar bedrijf in ${data.sector} heeft succesvol onze diensten gebruikt. Concrete resultaten en ROI.`;
        tone = 'confident';
        break;
        
      case 'urgency':
        framework = 'Problem-Solution';
        context = `Urgentie: Iedere dag zonder recruitment kost ${data.company_name} geld. Quick scan huidige vacature druk + immediate action plan.`;
        tone = 'urgent';
        break;
        
      case 'case_study':
        framework = 'Value-First';  
        context = `Concrete case study: ${data.sector} bedrijf, vergelijkbare situatie als ${data.company_name}. 3-maanden resultaat + lessons learned.`;
        tone = 'educational';
        break;
        
      case 'breakup':
        framework = 'Problem-Solution';
        context = `Laatste email in reeks. Acceptance dat timing niet goed is voor ${data.company_name}. Open deur voor toekomst + waardevolle resource.`;
        tone = 'respectful';
        break;
        
      case 'reconnect':
        framework = 'AIDA';
        context = `Reconnect na pauze. Update over ${data.sector} markt developments. Nieuwe relevante insight voor ${data.company_name} recruitment.`;
        tone = 'informative';
        break;
        
      default:
        context = `Professional follow-up voor ${data.company_name} over recruitment ondersteuning. Email ${emailNumber} in gepersonaliseerde sequence.`;
    }

    // Generate the email using the enhanced EmailComposer
    const emailResult = await this.emailComposer.composeEmail({
      subject: `Re: ${data.vacancy_title} - ${this.getSubjectHook(emailStrategy.approach)}`,
      recipient: data.contact_name,
      context,
      tone: tone as any,
      language: 'nl',
      length: emailNumber <= 2 ? 'medium' : 'short',  // First emails longer, later shorter
      sector: data.sector,
      framework: framework as any,
      company: data.company_name,
      goal: emailNumber === 1 ? 'meeting request' : 'engagement'
    });

    // Handle the result based on success/failure
    if (!emailResult.success || !emailResult.data) {
      throw new Error(`Email generation failed: ${emailResult.error || 'No data returned'}`);
    }

    // Apply advanced personalization based on the user's successful templates
    const personalizedSubject = this.personalizeSubject(emailResult.data.primary_subject, data, emailStrategy.approach);
    const personalizedBody = this.personalizeBody(emailResult.data.content, data, emailStrategy.approach, emailNumber);

    // CLEAN FORMATTING: Remove **bold** markup for Pipedrive templates
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

  private getSubjectHook(approach: string): string {
    const hooks = {
      'rpo_bridge': 'Overbrugging tijdens zoektocht?',
      'interim_relief': 'Vacatures kunnen niet wachten',
      'hybrid_model': 'Alternatief voor inhouse recruiter?',
      'follow_up': 'Quick scan recruitment bottleneck',
      'value_add': 'ROI berekening recruitment',
      'social_proof': 'Vergelijkbare situatie opgelost',
      'urgency': 'Recruitment bottleneck kost €€€',
      'case_study': 'Case: 3 maanden resultaat',
      'breakup': 'Laatste keer, dan stoppen we',
      'reconnect': 'Markt update + nieuwe inzichten',
      'final_touch': 'One final thought'
    };
    return hooks[approach as keyof typeof hooks] || 'Follow-up recruitment';
  }

  private personalizeSubject(subject: string, data: PersonalizationData, approach: string): string {
    // Apply company-specific personalization like in the user's templates
    let personalized = subject
      .replace(/\{company_name\}/g, data.company_name)
      .replace(/\{contact_name\}/g, data.contact_name)
      .replace(/\{vacancy_title\}/g, data.vacancy_title);

    // Add location-specific elements for regional relevance  
    if (data.location && !personalized.includes(data.location)) {
      if (approach === 'social_proof' || approach === 'case_study') {
        personalized = personalized.replace('?', ` [${data.location} case]?`);
      }
    }

    return personalized;
  }

  private personalizeBody(body: string, data: PersonalizationData, approach: string, emailNumber: number): string {
    // Base personalization
    let personalized = body
      .replace(/\{company_name\}/g, data.company_name)
      .replace(/\{contact_name\}/g, data.contact_name)
      .replace(/\{vacancy_title\}/g, data.vacancy_title)
      .replace(/\{sector\}/g, data.sector)
      .replace(/\{location\}/g, data.location);

    // Add strategic elements based on the user's proven templates
    switch (approach) {
      case 'rpo_bridge':
        personalized += `\n\n**Past dit beter bij ${data.company_name}?**\n→ https://calendly.com/recruitin/20min\n\nP.S. We helpen NIET met jullie ${data.vacancy_title} vacature - die laten we lekker aan jullie 😉`;
        break;
        
      case 'interim_relief':
        const costSaving = this.calculateCostBenefit(data.company_size);
        personalized += `\n\n**Concreet voor ${data.company_name}:**\nAls jullie meerdere openstaande posities hebben, kunnen wij er al 2-3 invullen terwijl jullie zoeken naar de perfecte interne recruiter.\n\n💰 **Cost-benefit:** ${costSaving}`;
        break;
        
      case 'hybrid_model':
        const competitorRef = this.getCompetitorReference(data.sector, data.location);
        personalized += `\n\n**Recent voorbeeld ${data.location}:**\n${competitorRef} zocht 12 weken naar recruiter, switchte naar ons:\n→ Maand 1-2: Wij vulden 5 tech posities + bouwden employer brand\n→ Nu: Hybride model (strategisch partnership)`;
        break;
    }

    // Add signature block
    personalized += `\n\nGroet,\n\n**Wouter van der Linden**\nDGA | Recruitin B.V.\n📞 06-14314593 | 🌐 recruitin.nl`;

    // Add sequence-appropriate footer
    if (emailNumber >= 4) {
      personalized += `\n\n---\nGeen interesse? Reply met "STOP" en je hoort niets meer van ons.`;
    } else if (emailNumber === 1) {
      personalized += `\n\n---\nDeze email is verstuurd omdat ${data.company_name} recent een ${data.vacancy_title} vacature heeft gepubliceerd.`;
    }

    return personalized;
  }

  private calculateCostBenefit(company_size: string): string {
    const benefits = {
      'startup': 'Besparing €15-25k vs. inhouse recruiter eerste jaar',
      'scale-up': 'Besparing €25-40k vs. inhouse recruiter + recruitment tools',  
      'enterprise': 'Flexibiliteit: schaal op/af naar behoefte (€50-200k besparing)',
      'default': 'Voorspelbare kosten, geen FTE commitment'
    };
    return benefits[company_size as keyof typeof benefits] || benefits.default;
  }

  private getCompetitorReference(sector: string, location: string): string {
    const references = {
      'technology-noord-brabant': 'ASML',
      'technology-gelderland': 'Siemens', 
      'engineering-noord-brabant': 'VDL',
      'engineering-gelderland': 'GKN Aerospace',
      'manufacturing-noord-brabant': 'Vanderlande',
      'manufacturing-gelderland': 'FrieslandCampina'
    };
    
    const key = `${sector.toLowerCase()}-${location.toLowerCase().replace(' ', '-')}`;
    return references[key as keyof typeof references] || 'Een vergelijkbaar bedrijf in jullie sector';
  }

  async updatePipedriveDeal(deal_id: string, emailSequence: EmailData[], api_token: string): Promise<{success: boolean, fields_updated: string[]}> {
    try {
      const fieldsToUpdate: any = {};
      const fieldsUpdated: string[] = [];

      // Map all 6 emails to their corresponding Pipedrive custom fields
      const fieldMapping = [
        // Email 1
        { subject: '47a7d774bf5b08226ce8d6e1e79708f1d44e3e30', body: '867577ef580ff8d22c74799d949483401bba2e26' },
        // Email 2  
        { subject: 'c9b94aad810dad22e3835669aff3076e9bbed481', body: '14229c6d09ce02f7752762831cb290c2845a0adc' },
        // Email 3
        { subject: '4a105b3f0a7e2fc4b28aa3c446ab863c3c7564c4', body: '728051c14d08fd50d018d2f52d249480553407ef' },
        // Email 4
        { subject: 'af3c082c6c557ff5d2f640be8863f855fc403b1a', body: '363f0878ff15f00cc54470a5dc85049e6a12e5e3' },
        // Email 5
        { subject: 'd915d63b9b2621d3ce81d54d8dfce1e3f0dd4306', body: 'c4f72e32ce76ad00a822e9c7d1044dba77e6458b' },
        // Email 6
        { subject: 'e84b304ae9696a9e1e1943d02bf8b762fa290f91', body: 'd0ad20b3323a67da53529b8f5514e663ed81a3fc' }
      ];

      // Save all 6 personalized emails to custom fields
      for (let i = 0; i < emailSequence.length && i < 6; i++) {
        const email = emailSequence[i];
        const mapping = fieldMapping[i];
        
        // Set subject and body for this email
        fieldsToUpdate[mapping.subject] = email.subject;
        fieldsToUpdate[mapping.body] = email.body;
        
        fieldsUpdated.push(`Email ${i+1} Subject`, `Email ${i+1} Body`);
      }

      // Update Email Sequence Status to "Not Started" (ready for Zapier to send)
      fieldsToUpdate['22d33c7f119119e178f391a272739c571cf2e29b'] = 464; // "Not Started" option ID
      fieldsUpdated.push('Email Sequence Status');

      console.log(`📝 Updating deal ${deal_id} with ${fieldsUpdated.length} fields:`);
      console.log(`   ${fieldsUpdated.join(', ')}`);

      // Make API call to update Pipedrive deal
      const response = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${deal_id}?api_token=${api_token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldsToUpdate)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pipedrive API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json() as any;
      
      if (result.success) {
        // AUTOMATISCH: Move deal naar "Email Sequence Ready" stage na email generatie
        console.log('🚀 Automatically moving deal to "Email Sequence Ready" stage...');
        
        try {
          const stageUpdateResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${deal_id}?api_token=${api_token}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              stage_id: 105 // Email Sequence Ready stage ID
            })
          });
          
          const stageResult = await stageUpdateResponse.json() as any;
          
          if (stageResult.success) {
            console.log('✅ Deal automatically moved to Email Sequence Ready - automation will start!');
            console.log(`   Deal ${deal_id} ready for email sequence`);
          } else {
            console.log('⚠️  Warning: Failed to move deal to Email Sequence Ready stage');
          }
        } catch (stageError: any) {
          console.log('⚠️  Warning: Could not auto-move deal to Email Sequence Ready:', stageError.message);
        }
      }
      
      return {
        success: result.success === true,
        fields_updated: fieldsUpdated
      };

    } catch (error: any) {
      throw new Error(`Failed to update Pipedrive deal: ${error.message}`);
    }
  }
}