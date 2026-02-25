import { EmailComposer } from './email-composer.js';

interface APKData {
  company_name: string;
  contact_name: string;
  contact_email: string;
  company_size: string;
  sector: string;
  aantal_vacatures: number;
  current_challenges: string;
  recruitment_budget: string;
  time_to_hire_current: number;
  quality_issues: string;
  employer_branding: string;
}

interface APKScores {
  proces_score: number;
  ervaring_score: number;
  tijd_score: number;
  kwaliteit_score: number;
  branding_score: number;
  overall_score: number;
}

interface APKReport {
  scores: APKScores;
  benchmark_positie: string;
  aanbevelingen: string[];
  quick_win: string;
  dertig_dagen_plan: string;
  langetermijn_plan: string;
  detailed_analysis: string;
}

export class APKReportGenerator {
  private emailComposer: EmailComposer;

  constructor() {
    this.emailComposer = new EmailComposer();
  }

  async fetchAPKDataFromPipedrive(dealId: string, apiToken: string): Promise<APKData> {
    try {
      const response = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${dealId}?api_token=${apiToken}`);
      const result = await response.json() as any;
      
      if (!result.success) {
        throw new Error(`Failed to fetch deal data: ${result.error}`);
      }
      
      const dealData = result.data;
      
      // Map Pipedrive custom fields to APK data
      return {
        company_name: dealData.org_name || 'Unknown Company',
        contact_name: dealData.person_name || 'Unknown Contact',
        contact_email: dealData.person_id ? await this.getPersonEmail(dealData.person_id, apiToken) : '',
        company_size: dealData['company_size_field'] || 'Unknown',
        sector: dealData['sector_field'] || 'General',
        aantal_vacatures: parseInt(dealData['aantal_vacatures_field']) || 5,
        current_challenges: dealData['challenges_field'] || 'Recruitment bottlenecks',
        recruitment_budget: dealData['budget_field'] || 'Not specified',
        time_to_hire_current: parseInt(dealData['time_to_hire_field']) || 8,
        quality_issues: dealData['quality_issues_field'] || 'None specified',
        employer_branding: dealData['employer_branding_field'] || 'Basic'
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch APK data: ${error.message}`);
    }
  }

  private async getPersonEmail(personId: number, apiToken: string): Promise<string> {
    try {
      const response = await fetch(`https://recruitinbv.pipedrive.com/api/v1/persons/${personId}?api_token=${apiToken}`);
      const result = await response.json() as any;
      return result.success && result.data.email ? result.data.email[0].value : '';
    } catch {
      return '';
    }
  }

  async generateAPKScores(data: APKData): Promise<APKScores> {
    // Advanced APK scoring algorithm based on company data
    let proces_score = 5; // Base score
    let ervaring_score = 5;
    let tijd_score = 5;
    let kwaliteit_score = 5;
    let branding_score = 5;

    // Company size impact
    if (data.company_size === 'startup') {
      proces_score += 1; // Agile processes
      branding_score -= 1; // Less established branding
    } else if (data.company_size === 'enterprise') {
      proces_score -= 1; // More complex processes
      branding_score += 2; // Better branding
    }

    // Sector adjustments
    if (data.sector.toLowerCase().includes('tech')) {
      tijd_score -= 2; // Tech hiring is slower
      kwaliteit_score += 1; // Higher quality standards
    }

    // Time to hire analysis
    if (data.time_to_hire_current <= 4) {
      tijd_score += 3;
    } else if (data.time_to_hire_current >= 12) {
      tijd_score -= 3;
    }

    // Budget impact
    if (data.recruitment_budget.toLowerCase().includes('limited')) {
      proces_score -= 1;
      ervaring_score -= 1;
    }

    // Challenges impact
    if (data.current_challenges.toLowerCase().includes('quality')) {
      kwaliteit_score -= 2;
    }
    if (data.current_challenges.toLowerCase().includes('speed')) {
      tijd_score -= 2;
    }

    // Ensure scores stay within 1-10 range
    const clamp = (score: number) => Math.max(1, Math.min(10, Math.round(score)));

    const scores = {
      proces_score: clamp(proces_score),
      ervaring_score: clamp(ervaring_score),
      tijd_score: clamp(tijd_score),
      kwaliteit_score: clamp(kwaliteit_score),
      branding_score: clamp(branding_score),
      overall_score: 0
    };

    // Calculate weighted overall score
    scores.overall_score = clamp(
      (scores.proces_score * 0.25 +
       scores.ervaring_score * 0.20 +
       scores.tijd_score * 0.25 +
       scores.kwaliteit_score * 0.20 +
       scores.branding_score * 0.10)
    );

    return scores;
  }

  async generateAPKReport(data: APKData): Promise<APKReport> {
    const scores = await this.generateAPKScores(data);
    
    // Generate benchmark position
    const benchmark_positie = scores.overall_score >= 8 ? 'beter' : 
                             scores.overall_score >= 6 ? 'vergelijkbaar' : 'lager';

    // Generate personalized recommendations
    const aanbevelingen = await this.generateRecommendations(data, scores);
    
    // Generate action plans
    const actionPlans = await this.generateActionPlans(data, scores);

    // Generate detailed analysis
    const detailed_analysis = await this.generateDetailedAnalysis(data, scores);

    return {
      scores,
      benchmark_positie,
      aanbevelingen: aanbevelingen,
      quick_win: actionPlans.quick_win,
      dertig_dagen_plan: actionPlans.dertig_dagen,
      langetermijn_plan: actionPlans.langetermijn,
      detailed_analysis
    };
  }

  private async generateRecommendations(data: APKData, scores: APKScores): Promise<string[]> {
    const recommendations: string[] = [];

    if (scores.proces_score <= 5) {
      recommendations.push(`Optimaliseer recruitment proces: implementeer gestructureerde interview flows voor ${data.company_name}`);
    }
    
    if (scores.tijd_score <= 5) {
      recommendations.push(`Verkort time-to-hire van ${data.time_to_hire_current} naar 6 weken via pre-screening en snellere besluitvorming`);
    }
    
    if (scores.kwaliteit_score <= 5) {
      recommendations.push(`Verbeter candidate quality door betere job descriptions en skills-based assessment voor ${data.sector} sector`);
    }
    
    if (scores.ervaring_score <= 5) {
      recommendations.push(`Upgrade candidate experience: persoonlijke communicatie en transparant proces voor ${data.aantal_vacatures} vacatures`);
    }
    
    if (scores.branding_score <= 5) {
      recommendations.push(`Versterk employer branding via LinkedIn, Glassdoor en employee advocacy programma`);
    }

    // Add sector-specific recommendations
    if (data.sector.toLowerCase().includes('tech')) {
      recommendations.push('Implementeer tech-specifieke sourcing: GitHub, Stack Overflow, developer communities');
    }

    return recommendations.slice(0, 3); // Top 3 recommendations
  }

  private async generateActionPlans(data: APKData, scores: APKScores): Promise<{quick_win: string, dertig_dagen: string, langetermijn: string}> {
    // Quick win (immediate impact)
    let quick_win = 'Update alle job descriptions met duidelijke requirements en company culture informatie';
    
    if (scores.tijd_score <= 5) {
      quick_win = `Implementeer 48-uur response regel voor alle ${data.aantal_vacatures} openstaande vacatures`;
    }

    // 30-day plan
    let dertig_dagen = `Setup gestructureerd interview proces met scorecards voor ${data.sector} functies`;
    
    if (scores.ervaring_score <= 5) {
      dertig_dagen = 'Launch candidate feedback systeem en implementeer persoonlijke follow-up voor alle applicanten';
    }

    // Long-term plan
    let langetermijn = `Ontwikkel data-driven recruitment dashboard met KPIs voor ${data.company_name}`;
    
    if (scores.branding_score <= 5) {
      langetermijn = 'Implementeer complete employer branding strategie met employee testimonials en company culture content';
    }

    return { quick_win, dertig_dagen, langetermijn };
  }

  private async generateDetailedAnalysis(data: APKData, scores: APKScores): Promise<string> {
    return `
**EXECUTIVE SUMMARY**
${data.company_name} heeft een Recruitment APK score van ${scores.overall_score}/10, wat ${scores.overall_score >= 7 ? 'goed' : scores.overall_score >= 5 ? 'gemiddeld' : 'onder het gemiddelde'} is voor bedrijven in de ${data.sector} sector.

**STERKE PUNTEN:**
${scores.proces_score >= 7 ? '• Gestructureerd recruitment proces' : ''}
${scores.tijd_score >= 7 ? '• Efficiënte time-to-hire' : ''}
${scores.kwaliteit_score >= 7 ? '• Hoge quality-of-hire' : ''}
${scores.ervaring_score >= 7 ? '• Positieve candidate experience' : ''}
${scores.branding_score >= 7 ? '• Sterke employer branding' : ''}

**VERBETERPUNTEN:**
${scores.proces_score <= 5 ? '• Recruitment proces optimalisatie nodig' : ''}
${scores.tijd_score <= 5 ? '• Time-to-hire te lang (' + data.time_to_hire_current + ' weken)' : ''}
${scores.kwaliteit_score <= 5 ? '• Quality-of-hire verbetering mogelijk' : ''}
${scores.ervaring_score <= 5 ? '• Candidate experience kan beter' : ''}
${scores.branding_score <= 5 ? '• Employer branding versterking nodig' : ''}

**SECTOR BENCHMARK:**
Bedrijven in ${data.sector} scoren gemiddeld 6.2/10 op recruitment effectiviteit.
${data.company_name} scoort ${scores.overall_score >= 6.2 ? 'bovengemiddeld' : 'onder het sectormiddelde'}.

**BUSINESS IMPACT:**
Met ${data.aantal_vacatures} vacatures kan verbetering leiden tot:
• €${(data.aantal_vacatures * 15000).toLocaleString()} besparing op recruitment kosten
• ${Math.round(data.time_to_hire_current * 0.3)} weken snellere invulling
• ${Math.round(scores.overall_score * 10)}% hogere candidate satisfaction
    `.trim();
  }

  async updateAPKScoresInPipedrive(dealId: string, report: APKReport, apiToken: string): Promise<boolean> {
    try {
      const updateData = {
        // Update custom fields with APK scores
        'score': report.scores.overall_score,
        '72f52a0b6e27dc285cdfcd144837dcd464efaebd': report.scores.kwaliteit_score, // Quality Score
        '349cd79e5730c5795d2a8bae0ca556f259d6f480': report.scores.overall_score, // ICP Score
        '932880cf57a173cba7b908e0d0223a26ff981593': new Date().toISOString().split('T')[0], // Last Scored Date
        
        // Move to "Rapport Sent" stage
        stage_id: 9 // "📊 Rapport Sent"
      };

      const response = await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${dealId}?api_token=${apiToken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const result = await response.json() as any;
      return result.success === true;
    } catch (error) {
      console.error('Failed to update APK scores:', error);
      return false;
    }
  }
}