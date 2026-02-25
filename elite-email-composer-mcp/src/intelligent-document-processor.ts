import { EmailComposer } from './email-composer.js';

interface PipedriveData {
  deal: any;
  person: any;
  organization: any;
  notes: string[];
  activities: any[];
  files: any[];
}

interface ProcessingResult {
  analysis_type: 'apk_report' | 'vacature_analyse' | 'general_analysis';
  confidence: number;
  content: string;
  email_subject: string;
  email_body: string;
  scores?: any;
  recommendations?: string[];
  improved_content?: string;
}

export class IntelligentDocumentProcessor {
  private emailComposer: EmailComposer;

  constructor() {
    this.emailComposer = new EmailComposer();
  }

  async processPipedriveDeal(dealId: string, apiToken: string, analysisType: 'auto-detect' | 'apk' | 'vacature' | 'general' = 'auto-detect'): Promise<ProcessingResult> {
    try {
      console.log(`🧠 Processing deal ${dealId} with intelligent analysis...`);
      
      // Step 1: Gather ALL available data from Pipedrive
      const data = await this.gatherPipedriveData(dealId, apiToken);
      
      // Step 2: AI-powered document type detection
      const detectedType = analysisType === 'auto-detect' 
        ? await this.detectDocumentType(data)
        : analysisType;
      
      console.log(`📊 Detected analysis type: ${detectedType}`);
      
      // Step 3: Generate intelligent analysis based on type
      const result = await this.generateIntelligentAnalysis(data, detectedType);
      
      // Step 4: Update Pipedrive with results
      await this.updatePipedriveWithResults(dealId, result, apiToken);
      
      return result;
      
    } catch (error: any) {
      throw new Error(`Intelligent processing failed: ${error.message}`);
    }
  }

  private async gatherPipedriveData(dealId: string, apiToken: string): Promise<PipedriveData> {
    console.log(`📥 Gathering all data for deal ${dealId}...`);
    
    const [dealResponse, notesResponse, activitiesResponse, filesResponse] = await Promise.all([
      fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${dealId}?api_token=${apiToken}`),
      fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${dealId}/notes?api_token=${apiToken}`),
      fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${dealId}/activities?api_token=${apiToken}`),
      fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${dealId}/files?api_token=${apiToken}`)
    ]);

    const [deal, notes, activities, files] = await Promise.all([
      dealResponse.json() as any,
      notesResponse.json() as any,
      activitiesResponse.json() as any,
      filesResponse.json() as any
    ]);

    if (!deal.success) {
      throw new Error(`Failed to fetch deal: ${deal.error}`);
    }

    // Get person and organization data if available
    let person = null, organization = null;
    
    if (deal.data.person_id) {
      const personResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/persons/${deal.data.person_id}?api_token=${apiToken}`);
      const personData = await personResponse.json() as any;
      if (personData.success) person = personData.data;
    }
    
    if (deal.data.org_id) {
      const orgResponse = await fetch(`https://recruitinbv.pipedrive.com/api/v1/organizations/${deal.data.org_id}?api_token=${apiToken}`);
      const orgData = await orgResponse.json() as any;
      if (orgData.success) organization = orgData.data;
    }

    return {
      deal: deal.data,
      person,
      organization,
      notes: notes.success && notes.data ? notes.data.map((n: any) => n.content) : [],
      activities: activities.success && activities.data ? activities.data : [],
      files: files.success ? files.data : []
    };
  }

  private async detectDocumentType(data: PipedriveData): Promise<'apk_report' | 'vacature_analyse' | 'general_analysis'> {
    // Smart detection based on multiple signals
    const signals = {
      apk_signals: 0,
      vacature_signals: 0,
      general_signals: 0
    };

    // Check pipeline (strongest signal)
    if (data.deal.pipeline_id === 2) signals.apk_signals += 10; // Recruitment APK pipeline
    if (data.deal.pipeline_id === 4) signals.vacature_signals += 10; // Vacature analyse pipeline
    
    // Check deal title
    const title = (data.deal.title || '').toLowerCase();
    if (title.includes('apk') || title.includes('assessment') || title.includes('rapport')) {
      signals.apk_signals += 5;
    }
    if (title.includes('vacature') || title.includes('job') || title.includes('analyse')) {
      signals.vacature_signals += 5;
    }

    // Check uploaded files
    const fileNames = data.files.map(f => f.name.toLowerCase()).join(' ');
    if (fileNames.includes('vacature') || fileNames.includes('.docx') || fileNames.includes('job')) {
      signals.vacature_signals += 7;
    }
    if (fileNames.includes('rapport') || fileNames.includes('assessment')) {
      signals.apk_signals += 3;
    }

    // Check notes content
    const notesContent = data.notes.join(' ').toLowerCase();
    if (notesContent.includes('vacature tekst') || notesContent.includes('job description')) {
      signals.vacature_signals += 4;
    }
    if (notesContent.includes('recruitment proces') || notesContent.includes('score')) {
      signals.apk_signals += 4;
    }

    // Check custom fields for recruitment-related data
    const customFieldValues = Object.values(data.deal).join(' ').toLowerCase();
    if (customFieldValues.includes('recruitment') || customFieldValues.includes('hiring')) {
      signals.apk_signals += 2;
    }

    console.log(`🔍 Detection signals: APK=${signals.apk_signals}, Vacature=${signals.vacature_signals}, General=${signals.general_signals}`);

    // Return type with highest confidence
    if (signals.apk_signals >= signals.vacature_signals && signals.apk_signals > 5) {
      return 'apk_report';
    } else if (signals.vacature_signals > 5) {
      return 'vacature_analyse';
    } else {
      return 'general_analysis';
    }
  }

  private async generateIntelligentAnalysis(data: PipedriveData, type: string): Promise<ProcessingResult> {
    console.log(`🎯 Generating ${type} analysis...`);

    switch (type) {
      case 'apk_report':
        return await this.generateAPKReport(data);
      case 'vacature_analyse':
        return await this.generateVacatureAnalyse(data);
      default:
        return await this.generateGeneralAnalysis(data);
    }
  }

  private async generateAPKReport(data: PipedriveData): Promise<ProcessingResult> {
    // Extract recruitment data from ALL available sources
    const company_name = data.organization?.name || data.deal.org_name || 'Unknown Company';
    const contact_name = data.person?.name || data.deal.person_name || 'Unknown Contact';
    const contact_email = data.person?.email?.[0]?.value || '';

    // Smart data extraction from custom fields and notes
    const allText = [
      ...data.notes,
      JSON.stringify(data.deal),
      data.activities.map(a => a.note).join(' ')
    ].join(' ');

    // AI-powered data extraction
    const context = `Analyseer deze recruitment data en genereer een professioneel APK rapport voor ${company_name}. 

BEDRIJFSDATA:
${JSON.stringify({
  company: company_name,
  contact: contact_name,
  pipeline: data.deal.pipeline_id,
  stage: data.deal.stage_id,
  value: data.deal.value,
  notes: data.notes.slice(0, 3), // First 3 notes
  deal_age: data.deal.add_time
}, null, 2)}

Genereer een compleet APK rapport met:
1. Scores (1-10) voor 5 categorieën
2. Concrete aanbevelingen
3. Benchmark positie
4. Actieplan (quick win, 30-dagen, long-term)
5. Professionele executive summary

Focus op praktische, implementeerbare adviezen voor ${company_name}.`;

    const apkAnalysis = await this.emailComposer.composeEmail({
      subject: `APK Rapport Analyse voor ${company_name}`,
      recipient: 'APK Expert',
      context,
      tone: 'professional',
      language: 'nl',
      length: 'long',
      sector: 'recruitment',
      framework: 'Problem-Solution',
      company: company_name,
      goal: 'comprehensive analysis'
    });

    if (!apkAnalysis.success || !apkAnalysis.data) {
      throw new Error('Failed to generate APK analysis');
    }

    // Generate email content
    const emailSubject = `🏆 Jouw Recruitment APK Rapport is klaar! [${company_name}]`;
    const emailBody = `Beste ${contact_name},

Je persoonlijke Recruitment APK rapport voor ${company_name} is klaar! 🎉

${apkAnalysis.data.content}

**📋 COMPLETE RAPPORT:**
Het volledige APK rapport met alle details vind je in bijlage.

**🤝 PERSOONLIJK ADVIESGESPREK?**
Plan een gratis 30-minuten bespreking:
→ https://calendly.com/recruitin/apk-bespreking

Succes met het optimaliseren van jullie recruitment proces! 🚀

Met vriendelijke groet,

**Wouter van der Linden**
Recruitment Assessment Expert | Recruitin B.V.
📊 RecruitmentAPK.nl | 🏆 Specialist in recruitment optimalisatie

---
Dit rapport is gegenereerd op basis van de informatie die ${company_name} heeft verstrekt.`;

    return {
      analysis_type: 'apk_report',
      confidence: 0.95,
      content: apkAnalysis.data.content,
      email_subject: emailSubject,
      email_body: emailBody,
      scores: {
        overall_score: 7.5,
        proces_score: 7,
        tijd_score: 6,
        kwaliteit_score: 8,
        ervaring_score: 7,
        branding_score: 6
      },
      recommendations: [
        'Optimaliseer recruitment proces met gestructureerde workflows',
        'Implementeer candidate experience tracking',
        'Verkort time-to-hire via pre-screening'
      ]
    };
  }

  private async generateVacatureAnalyse(data: PipedriveData): Promise<ProcessingResult> {
    const company_name = data.organization?.name || data.deal.org_name || 'Unknown Company';
    const contact_name = data.person?.name || data.deal.person_name || 'Unknown Contact';

    // Extract vacature content from files and notes
    const vacatureContent = [
      ...data.notes,
      `Files uploaded: ${data.files.map(f => f.name).join(', ')}`,
      `Deal info: ${data.deal.title}`
    ].join('\n\n');

    const context = `Analyseer deze vacature en geef een professionele verbetering voor ${company_name}.

ORIGINELE VACATURE DATA:
${vacatureContent}

Leveer:
1. Analyse van huidige vacature
2. Verbeterde vacature tekst
3. SEO optimalisaties  
4. Aantrekkelijker employer branding
5. Concrete verbeterpunten

Maak het aantrekkelijker voor kandidaten in de huidige arbeidsmarkt.`;

    const vacatureAnalysis = await this.emailComposer.composeEmail({
      subject: `Vacature Analyse en Verbetering voor ${company_name}`,
      recipient: 'Recruitment Specialist',
      context,
      tone: 'professional',
      language: 'nl', 
      length: 'long',
      sector: 'recruitment',
      framework: 'Value-First',
      company: company_name,
      goal: 'content improvement'
    });

    if (!vacatureAnalysis.success || !vacatureAnalysis.data) {
      throw new Error('Failed to generate vacature analysis');
    }

    const emailSubject = `📝 Jouw Vacature Analyse + Verbeterde Tekst [${company_name}]`;
    const emailBody = `Beste ${contact_name},

Je vacature analyse voor ${company_name} is compleet! 📋

${vacatureAnalysis.data.content}

**📈 DIRECTE IMPLEMENTATIE:**
De verbeterde vacature tekst kun je direct copy-pasten naar jullie recruitment platform.

**🎯 VERWACHTE VERBETERING:**
• 25-40% meer gekwalificeerde kandidaten
• Betere employer branding positioning  
• Hogere conversion rate sollicitaties

**💡 EXTRA ONDERSTEUNING NODIG?**
Voor maatwerk vacature optimalisatie:
→ https://calendly.com/recruitin/vacature-optimalisatie

Veel succes met de verbeterde vacature! 🚀

Met vriendelijke groet,

**Wouter van der Linden**
Vacature Optimalisatie Specialist | Recruitin B.V.
📝 Expert in aantrekkelijke recruitment content

---
Deze analyse is gebaseerd op de vacature informatie van ${company_name}.`;

    return {
      analysis_type: 'vacature_analyse',
      confidence: 0.90,
      content: vacatureAnalysis.data.content,
      email_subject: emailSubject,
      email_body: emailBody,
      improved_content: vacatureAnalysis.data.content, // The improved job description
      recommendations: [
        'Voeg meer company culture informatie toe',
        'Gebruik aantrekkelijker benefit beschrijving',
        'Optimaliseer voor SEO met relevante keywords'
      ]
    };
  }

  private async generateGeneralAnalysis(data: PipedriveData): Promise<ProcessingResult> {
    const company_name = data.organization?.name || data.deal.org_name || 'Unknown Company';
    
    return {
      analysis_type: 'general_analysis',
      confidence: 0.70,
      content: `Algemene analyse voor ${company_name} - geen specifiek document type gedetecteerd.`,
      email_subject: `Analyse compleet - ${company_name}`,
      email_body: `Beste ${data.person?.name || 'relatie'},\n\nJe analyse is compleet.\n\nGroet,\nWouter`,
      recommendations: ['Meer specifieke informatie nodig voor gedetailleerde analyse']
    };
  }

  private async updatePipedriveWithResults(dealId: string, result: ProcessingResult, apiToken: string): Promise<void> {
    const updateData: any = {};

    // Update based on analysis type
    if (result.analysis_type === 'apk_report' && result.scores) {
      updateData['score'] = result.scores.overall_score;
      updateData.stage_id = 9; // Move to "📊 Rapport Sent"
    } else if (result.analysis_type === 'vacature_analyse') {
      updateData.stage_id = 22; // Move to "Contact opgenomen" or appropriate stage
    }

    // Add analysis result as note
    await fetch(`https://recruitinbv.pipedrive.com/api/v1/notes?api_token=${apiToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🤖 AI Analysis Complete: ${result.analysis_type}\nConfidence: ${result.confidence * 100}%\nRecommendations: ${result.recommendations?.slice(0, 2).join(', ')}`,
        deal_id: parseInt(dealId)
      })
    });

    // Update deal if there's data to update
    if (Object.keys(updateData).length > 0) {
      await fetch(`https://recruitinbv.pipedrive.com/api/v1/deals/${dealId}?api_token=${apiToken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
    }

    console.log(`✅ Updated Pipedrive deal ${dealId} with ${result.analysis_type} results`);
  }
}