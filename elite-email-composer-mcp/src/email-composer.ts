import type { ComposeEmailParams, FormatEmailParams, TranslateEmailParams } from './schemas.js';

interface SectorData {
  painPoints: string[];
  statistics: string[];
  roiMetrics: string[];
  commonChallenges: string[];
  valueProps: string[];
}

interface CopywritingFramework {
  name: string;
  structure: string[];
  description: string;
}

export class EmailComposer {
  private templates = {
    professional: {
      greeting: "Dear {recipient}",
      closing: "Best regards,\n{sender}",
    },
    friendly: {
      greeting: "Hi {recipient}",
      closing: "Best,\n{sender}",
    },
    formal: {
      greeting: "Dear {recipient}",
      closing: "Yours sincerely,\n{sender}",
    },
    casual: {
      greeting: "Hey {recipient}",
      closing: "Thanks,\n{sender}",
    },
    urgent: {
      greeting: "Dear {recipient}",
      closing: "Urgently,\n{sender}",
    },
  };

  private copywritingFrameworks: CopywritingFramework[] = [
    {
      name: 'PAS',
      structure: ['Problem', 'Agitation', 'Solution'],
      description: 'Problem-Agitate-Solve framework for pain point focused emails'
    },
    {
      name: 'AIDA',
      structure: ['Attention', 'Interest', 'Desire', 'Action'],
      description: 'Classic attention-grabbing framework'
    },
    {
      name: 'Problem-Solution',
      structure: ['Problem Identification', 'Consequences', 'Solution Benefits', 'Call to Action'],
      description: 'Direct problem-solution approach with consequences'
    },
    {
      name: 'Value-First',
      structure: ['Value Hook', 'Proof/Data', 'Benefit Stack', 'Easy Next Step'],
      description: 'Lead with immediate value proposition'
    }
  ];

  private sectorDatabase: Record<string, SectorData> = {
    'manufacturing': {
      painPoints: [
        'Recruitment capacity te beperkt bij groeiambities',
        'Time-to-hire technische profielen: 10-16 weken (te lang)',
        'Externe bureaus leveren volume, maar niet altijd kwaliteit',
        'Interne HR belast met operationele werving én strategisch HRM'
      ],
      statistics: [
        '40% meer openstaande vacatures in techniek (CBS 2024)',
        '83% van MKB-bedrijven in manufacturing rapporteert vacatureproblemen techniek',
        'Gemiddelde time-to-hire technische functies: 12 weken (UWV 2024)'
      ],
      roiMetrics: [
        '-30 tot -50% kortere time-to-hire',
        'Bij 10 technische vacatures per jaar bespaart RPO gemiddeld €45.000',
        'Hogere kwaliteit kandidaten door gespecialiseerde technische sourcing'
      ],
      commonChallenges: [
        'Schaarse technische expertise',
        'Concurrentie om talent',
        'Lange time-to-hire',
        'Recruitment capacity tekort'
      ],
      valueProps: [
        'Voorspelbare recruitment capacity',
        'Meer focus voor HR op strategische projecten',
        'Technische sourcing expertise',
        'Flexibel op- en afschalen'
      ]
    },
    'technology': {
      painPoints: [
        'Ontwikkelaars steeds moeilijker te vinden',
        'Salarisverwachtingen stijgen sneller dan budgetten',
        'Remote work compliceert recruitment proces',
        'Tech talent heeft veel keuze en is kritisch'
      ],
      statistics: [
        '65% meer vraag naar developers dan aanbod (Stack Overflow 2024)',
        'Gemiddelde time-to-hire developers: 8-12 weken',
        '3 van 4 tech vacatures blijft langer dan 2 maanden open'
      ],
      roiMetrics: [
        'Time-to-hire developers van 12 naar 4-6 weken',
        '40% betere candidate experience scores',
        'Kostenreductie van €15.000 per placement'
      ],
      commonChallenges: [
        'Technische assessment complexiteit',
        'Remote hiring challenges',
        'Talent pool competitie',
        'Snelle technologie ontwikkelingen'
      ],
      valueProps: [
        'Gespecialiseerde tech sourcing',
        'Remote hiring expertise',
        'Technical assessment support',
        'Market intelligence over salarissen'
      ]
    }
  };

  async composeEmail(params: ComposeEmailParams) {
    try {
      const { subject, recipient, context, tone, language, length, sector, framework, company, goal } = params;
      
      // Detect framework from context if not specified
      const selectedFramework = framework || this.detectOptimalFramework(context, goal);
      
      // Get sector data if available
      const sectorData = sector ? this.sectorDatabase[sector.toLowerCase()] : null;
      
      // Generate advanced email using framework
      const emailContent = this.generateAdvancedEmail({
        framework: selectedFramework,
        context,
        company,
        goal,
        recipient,
        sectorData,
        tone: tone || 'professional',
        language: language || 'en'
      });
      
      // Generate multiple subject line options
      const subjectLines = this.generateSubjectLines(subject, context, goal, company, language);
      
      // Calculate effectiveness score
      const effectivenessScore = this.calculateEffectivenessScore(emailContent, selectedFramework);
      
      return {
        success: true,
        data: {
          subject_options: subjectLines,
          primary_subject: subjectLines[0],
          content: emailContent.content,
          framework_used: selectedFramework,
          sector_applied: sector || 'general',
          tone: tone || 'professional',
          language: language || 'en',
          word_count: emailContent.content.split(' ').length,
          estimated_read_time: Math.ceil(emailContent.content.split(' ').length / 200) + ' minutes',
          effectiveness_score: effectivenessScore,
          roi_prediction: emailContent.roiPrediction,
          follow_up_strategy: emailContent.followUpStrategy,
          personalization_elements: emailContent.personalizationElements,
        },
        message: `Professional email generated using ${selectedFramework} framework with ${effectivenessScore}% effectiveness score`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to compose advanced email',
      };
    }
  }

  async formatEmail(params: FormatEmailParams) {
    try {
      const { content, style, include_signature } = params;
      
      let formattedContent = content;
      
      switch (style) {
        case 'business':
          formattedContent = this.applyBusinessFormatting(content);
          break;
        case 'modern':
          formattedContent = this.applyModernFormatting(content);
          break;
        case 'minimal':
          formattedContent = this.applyMinimalFormatting(content);
          break;
        case 'newsletter':
          formattedContent = this.applyNewsletterFormatting(content);
          break;
      }

      if (include_signature) {
        formattedContent += "\n\n---\n[Your Signature Here]";
      }

      return {
        success: true,
        data: {
          original_content: content,
          formatted_content: formattedContent,
          style: style,
          has_signature: include_signature,
        },
        message: `Email formatted with ${style} style`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to format email',
      };
    }
  }

  async translateEmail(params: TranslateEmailParams) {
    try {
      const { content, target_language, preserve_formatting } = params;
      
      // This is a simplified translation - in production, you'd use a real translation API
      const translations = {
        'nl': this.translateToDutch(content),
        'de': this.translateToGerman(content),
        'fr': this.translateToFrench(content),
        'es': this.translateToSpanish(content),
      };

      const translatedContent = translations[target_language as keyof typeof translations] || content;

      return {
        success: true,
        data: {
          original_content: content,
          translated_content: translatedContent,
          source_language: 'en', // Assumed
          target_language: target_language,
          preserved_formatting: preserve_formatting,
        },
        message: `Email translated to ${target_language}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to translate email',
      };
    }
  }

  private detectOptimalFramework(context: string, goal?: string): string {
    const lowerContext = (context + ' ' + (goal || '')).toLowerCase();
    
    if (lowerContext.includes('problem') || lowerContext.includes('challenge') || lowerContext.includes('pain')) {
      return 'Problem-Solution';
    }
    if (lowerContext.includes('meeting') || lowerContext.includes('call') || lowerContext.includes('discuss')) {
      return 'Value-First';
    }
    if (lowerContext.includes('urgent') || lowerContext.includes('immediate') || lowerContext.includes('quickly')) {
      return 'PAS';
    }
    return 'AIDA'; // Default
  }

  private generateAdvancedEmail(params: {
    framework: string;
    context: string;
    company?: string;
    goal?: string;
    recipient?: string;
    sectorData: SectorData | null;
    tone: string;
    language: string;
  }) {
    const { framework, context, company, goal, recipient, sectorData, tone, language } = params;
    
    let content = '';
    let roiPrediction = '';
    let followUpStrategy = [];
    let personalizationElements = [];

    const greeting = language === 'nl' ? 
      (tone === 'formal' ? `Geachte ${recipient || '[Naam]'}` : `Beste ${recipient || '[Naam]'}`) :
      `Dear ${recipient || '[Name]'}`;

    const closing = language === 'nl' ? 
      'Met vriendelijke groet,\n\n[Uw naam]\n[Functie]\n[Bedrijf]\n[Contact]' :
      'Best regards,\n\n[Your name]\n[Title]\n[Company]\n[Contact]';

    switch (framework) {
      case 'Problem-Solution':
        content = this.generateProblemSolutionEmail(context, company, goal, sectorData, language);
        break;
      case 'PAS':
        content = this.generatePASEmail(context, company, goal, sectorData, language);
        break;
      case 'AIDA':
        content = this.generateAIDAEmail(context, company, goal, sectorData, language);
        break;
      case 'Value-First':
        content = this.generateValueFirstEmail(context, company, goal, sectorData, language);
        break;
    }

    // Add ROI prediction
    if (sectorData) {
      roiPrediction = language === 'nl' ? 
        `Verwacht: 35-45% open rate, 8-12% reply rate gebaseerd op sector data` :
        `Expected: 35-45% open rate, 8-12% reply rate based on sector data`;
    }

    // Generate follow-up strategy
    followUpStrategy = language === 'nl' ? [
      'Dag 3: LinkedIn verbinding met korte reminder',
      'Dag 7: Email met extra waarde (bijv. quickscan rapport)',
      'Dag 14: Laatste reminder met urgentie'
    ] : [
      'Day 3: LinkedIn connection with brief reminder',
      'Day 7: Email with additional value (e.g. industry report)',
      'Day 14: Final reminder with urgency'
    ];

    // Track personalization elements
    personalizationElements = [
      company ? `Company name: ${company}` : '',
      sectorData ? `Sector-specific data applied` : '',
      goal ? `Goal-oriented messaging: ${goal}` : ''
    ].filter(Boolean);

    const fullEmail = `${greeting},\n\n${content}\n\n${closing}`;

    return {
      content: fullEmail,
      roiPrediction,
      followUpStrategy,
      personalizationElements
    };
  }

  private generateProblemSolutionEmail(context: string, company?: string, goal?: string, sectorData?: SectorData | null, language: string = 'en'): string {
    if (language === 'nl') {
      const companyContext = company ? ` bij ${company}` : ' in uw sector';
      const problems = sectorData?.painPoints.slice(0, 3).join('\n- ') || 'Recruitment uitdagingen die ik vaak hoor';
      const statistics = sectorData?.statistics[0] || '40% meer openstaande vacatures in techniek (CBS 2024)';
      const roiMetrics = sectorData?.roiMetrics.slice(0, 3).map(metric => `✓ **${metric}**`).join('\n') || '✓ **-30 tot -50% kortere time-to-hire**';
      
      return `Als ${company ? company : '[Bedrijfsnaam]'} weet u hoe belangrijk kwaliteitspersoneel is voor uw groei. Maar met **${statistics}** wordt het steeds lastiger om die expertise te vinden én te behouden.

**De uitdaging die ik vaak hoor${companyContext}:**
- ${problems}

**Wat als uw recruitment structureel sneller, kwalitatief beter én voorspelbaarder wordt?**

Recruitin ondersteunt bedrijven zoals ${company || '[Uw bedrijf]'} met **Recruitment Process Outsourcing (RPO)**: wij nemen het volledige wervingsproces over of vullen specifieke stappen aan. Dit levert gemiddeld op:

${roiMetrics}
✓ **Voorspelbare recruitment capacity** (flexibel op- en afschalen)
✓ **Meer focus voor HR** op strategische projecten

**Korte kennismaking?**  
Ik licht graag toe hoe RPO ${company ? company + "'s" : 'uw'} groeiambities kan ondersteunen. Een presentatie van 30 minuten volstaat om te bepalen of dit aansluit bij uw wervingsstrategie.

Schikt **volgende week dinsdag of woensdag** tussen 10:00-12:00 uur?

*P.S. Benieuwd naar de arbeidsmarktsituatie in uw sector voor 2025? Ik stuur u graag onze quickscan toe.*`;
    }

    return `As a leader at ${company || '[Company]'}, you understand how crucial quality talent is for growth. However, with current market conditions, finding and retaining that expertise is becoming increasingly challenging.

**Common challenges I hear in your industry:**
- ${sectorData?.painPoints.slice(0, 3).join('\n- ') || 'Recruitment capacity limitations during growth phases'}

**What if your recruitment became structurally faster, higher quality, and more predictable?**

We support companies like ${company || '[Your company]'} with **Recruitment Process Outsourcing (RPO)**: we take over the complete hiring process or supplement specific steps. This typically delivers:

${sectorData?.roiMetrics.slice(0, 3).map(metric => `✓ **${metric}**`).join('\n') || '✓ **30-50% shorter time-to-hire**'}
✓ **Predictable recruitment capacity** (flexible scaling)
✓ **More strategic focus for HR**

**Brief introduction meeting?**  
I'd be happy to explain how RPO can support ${company || 'your'} growth ambitions. A 30-minute presentation is sufficient to determine if this aligns with your hiring strategy.

Would **next Tuesday or Wednesday** between 10:00-12:00 work for you?

*P.S. Curious about the job market situation in your sector for 2025? I'm happy to send you our industry quickscan.*`;
  }

  private generatePASEmail(context: string, company?: string, goal?: string, sectorData?: SectorData | null, language: string = 'en'): string {
    if (language === 'nl') {
      return `**URGENT: Recruitment bottleneck dreigt groeiplannen ${company || '[Bedrijf]'} te vertragen**

Heeft u op dit moment openstaande vacatures langer dan 3 maanden? U bent niet de enige. **${sectorData?.statistics[0] || '83% van bedrijven kampt met langdurige vacatures'}**.

**De gevolgen stapelen zich op:**
- Projectvertragingen door personeelstekort
- Overbelasting huidige team → risico op burn-out  
- Omzetverlies door gemiste kansen
- Concurrenten trekken uw doelkandidaten weg

**Maar er is een snelle oplossing.**

RPO (Recruitment Process Outsourcing) van Recruitin neemt binnen **2 weken** uw volledige wervingsproces over. Resultaat:

- **Time-to-hire daalt van 12 naar 4-6 weken**
- **Direct toegang tot verborgen talentpool** 
- **Geen vaste recruitmentkosten** bij wisselende vraag
- **Uw HR kan zich focussen op strategische projecten**

**De kans loopt weg.** Q1 2025 wordt de krapste arbeidsmarkt in jaren. Bedrijven die nu handelen, krijgen het beste talent.

**15-minuten telefoongesprek deze week?**  
Ik toon u exact hoe we ${company || '[Uw bedrijf]'} binnen 30 dagen kunnen helpen met uw recruitment uitdagingen.

Wanneer schikt het: **morgen 14:00** of **overmorgen 10:00**?`;
    }

    return `**URGENT: Recruitment bottleneck threatens to delay ${company || '[Company]'} growth plans**

Do you currently have open positions longer than 3 months? You're not alone. **${sectorData?.statistics[0] || '83% of companies struggle with prolonged vacancies'}**.

**The consequences are stacking up:**
- Project delays due to staff shortage
- Current team overload → burnout risk
- Revenue loss from missed opportunities  
- Competitors attracting your target candidates

**But there's a quick solution.**

RPO (Recruitment Process Outsourcing) from our team takes over your entire hiring process within **2 weeks**. Result:

- **Time-to-hire drops from 12 to 4-6 weeks**
- **Direct access to hidden talent pool**
- **No fixed recruitment costs** with fluctuating demand
- **Your HR can focus on strategic projects**

**The opportunity is slipping away.** Q1 2025 will be the tightest job market in years. Companies acting now get the best talent.

**15-minute phone call this week?**  
I'll show you exactly how we can help ${company || '[Your company]'} with recruitment challenges within 30 days.

When works: **tomorrow 2:00 PM** or **day after tomorrow 10:00 AM**?`;
  }

  private generateAIDAEmail(context: string, company?: string, goal?: string, sectorData?: SectorData | null, language: string = 'en'): string {
    if (language === 'nl') {
      return `**Hoe ${company || '[Top bedrijf]'} hun time-to-hire met 40% verkortte**

Recruitment uitdagingen kosten Nederlandse bedrijven €2.1 miljard per jaar aan gemiste groei (CBS 2024). Maar wat als uw recruitment zó efficiënt wordt dat vacatures binnen 4 weken gevuld zijn?

**Hier is precies hoe dat werkt:**

**Recruitment Process Outsourcing (RPO)** betekent dat wij uw complete wervingsproces overnemen - van job analysis tot onboarding. Voor bedrijven zoals ${company || '[Uw bedrijf]'} resulteert dit in:

${sectorData?.roiMetrics.slice(0, 4).map(metric => `🎯 ${metric}`).join('\n') || '🎯 40% kortere time-to-hire\n🎯 60% meer gekwalificeerde kandidaten\n🎯 35% lagere recruitment kosten\n🎯 Voorspelbare hiring pipeline'}

**Stel je voor:** Volgende maand heeft u al 2-3 nieuwe teamleden gestart, uw huidige team is minder overbelast, en nieuwe projecten kunnen zonder vertraging beginnen.

**De investering?** Vaak lager dan uw huidige recruitment kosten, maar dan met gegarandeerde resultaten.

**Klaar voor die verandering?**

30 minuten presentatie volstaat om te zien of RPO past bij ${company || '[Uw bedrijf]'}. Ik toon concrete cijfers van vergelijkbare bedrijven en een implementatieplan op maat.

**Volgende week beschikbaar:** dinsdag 10:00 of woensdag 14:00?`;
    }

    return `**How ${company || '[Leading Company]'} reduced their time-to-hire by 40%**

Recruitment challenges cost Dutch companies €2.1 billion annually in missed growth (CBS 2024). But what if your recruitment became so efficient that vacancies are filled within 4 weeks?

**Here's exactly how it works:**

**Recruitment Process Outsourcing (RPO)** means we take over your complete hiring process - from job analysis to onboarding. For companies like ${company || '[Your company]'}, this results in:

${sectorData?.roiMetrics.slice(0, 4).map(metric => `🎯 ${metric}`).join('\n') || '🎯 40% shorter time-to-hire\n🎯 60% more qualified candidates\n🎯 35% lower recruitment costs\n🎯 Predictable hiring pipeline'}

**Imagine:** Next month you already have 2-3 new team members started, your current team is less overloaded, and new projects can begin without delay.

**The investment?** Often lower than your current recruitment costs, but with guaranteed results.

**Ready for that change?**

A 30-minute presentation is sufficient to see if RPO fits ${company || '[Your company]'}. I'll show concrete figures from comparable companies and a tailored implementation plan.

**Available next week:** Tuesday 10:00 AM or Wednesday 2:00 PM?`;
  }

  private generateValueFirstEmail(context: string, company?: string, goal?: string, sectorData?: SectorData | null, language: string = 'en'): string {
    if (language === 'nl') {
      return `**GRATIS: Recruitment Efficiency Audit voor ${company || '[Uw bedrijf]'} (waarde €2.500)**

Voordat ik mezelf voorstel, wil ik u iets waardevols aanbieden:

**Een complete analyse van uw huidige recruitment proces** - gratis, zonder verplichtingen. Dit 90-minuten audit onthult:

✅ **Exacte bottlenecks** in uw hiring proces  
✅ **Verborgen kosten** van langdurige vacatures  
✅ **3 quick wins** om direct sneller te werven  
✅ **ROI berekening** van process optimalisatie  
✅ **Benchmarking** tegen beste presteerders in uw sector

**Waarom gratis?** Simpel. Ik ben er zeker van dat na deze audit duidelijk wordt hoeveel potential er ligt in uw recruitment. En als u daarna wilt doorpraten over verdere samenwerking, geweldig. Zo niet, dan heeft u alsnog waardevolle inzichten.

**Recent audit resultaat bij vergelijkbaar bedrijf:**
"*In 3 maanden 40% sneller werven, €45.000 besparing op externe bureaukosten, en HR heeft weer tijd voor strategisch werk.*" - HRM Manager, ${sectorData ? 'technische industrie' : 'MKB bedrijf'}

**Interesse in uw gratis audit?**

Ik heb **volgende week dinsdag 10:00** of **woensdag 14:00** beschikbaar voor een eerste kennismaking en intake voor de audit.

Welke tijd schikt u het beste?

**Wouter [Achternaam]**  
Senior Recruitment Strategist  
*Gespecialiseerd in RPO voor groeiende MKB bedrijven*`;
    }

    return `**FREE: Recruitment Efficiency Audit for ${company || '[Your company]'} (value €2,500)**

Before I introduce myself, I want to offer you something valuable:

**A complete analysis of your current recruitment process** - free, no obligations. This 90-minute audit reveals:

✅ **Exact bottlenecks** in your hiring process  
✅ **Hidden costs** of prolonged vacancies  
✅ **3 quick wins** to immediately hire faster  
✅ **ROI calculation** of process optimization  
✅ **Benchmarking** against top performers in your sector

**Why free?** Simple. I'm confident that after this audit it becomes clear how much potential lies in your recruitment. And if you want to continue discussing further collaboration afterwards, great. If not, you still have valuable insights.

**Recent audit result at comparable company:**
"*40% faster hiring in 3 months, €45,000 savings on external agency costs, and HR has time for strategic work again.*" - HRM Manager, ${sectorData ? 'technical industry' : 'SME company'}

**Interested in your free audit?**

I have **next Tuesday 10:00 AM** or **Wednesday 2:00 PM** available for initial introduction and audit intake.

Which time suits you best?

**[Your Name]**  
Senior Recruitment Strategist  
*Specialized in RPO for growing SME companies*`;
  }

  private generateSubjectLines(subject: string, context: string, goal?: string, company?: string, language: string = 'en'): string[] {
    if (language === 'nl') {
      return [
        subject || `Structurele oplossing voor vacatures ${company || '[Bedrijf]'}`,
        `30% sneller personeel werven - hoe?`,
        `RPO-presentatie: van 8 naar 2 weken time-to-hire`,
        `${company ? company + ': ' : ''}Recruitment bottleneck oplossen?`,
        `Gratis audit: uw recruitment efficiency (€2.500 waarde)`
      ];
    }

    return [
      subject || `Structural solution for ${company || '[Company]'} vacancies`,
      `30% faster hiring - how?`,
      `RPO presentation: from 8 to 2 weeks time-to-hire`,
      `${company ? company + ': ' : ''}Solve recruitment bottleneck?`,
      `Free audit: your recruitment efficiency (€2,500 value)`
    ];
  }

  private calculateEffectivenessScore(emailContent: any, framework: string): number {
    let score = 70; // Base score

    // Framework bonus
    const frameworkBonus = {
      'Problem-Solution': 15,
      'PAS': 12,
      'AIDA': 10,
      'Value-First': 18
    };
    score += frameworkBonus[framework as keyof typeof frameworkBonus] || 0;

    // Content quality factors
    if (emailContent.content.includes('€') || emailContent.content.includes('%')) score += 5; // Data-driven
    if (emailContent.content.includes('✅') || emailContent.content.includes('🎯')) score += 3; // Visual elements
    if (emailContent.content.split('\n').length > 10) score += 5; // Good structure
    if (emailContent.personalizationElements.length > 2) score += 5; // Personalization

    return Math.min(95, score); // Cap at 95%
  }

  async generateEmailVariants(params: ComposeEmailParams) {
    try {
      const { subject, recipient, context, tone, language, sector, company, goal } = params;
      
      // Generate 3 variants using different frameworks
      const frameworks = ['Problem-Solution', 'Value-First', 'AIDA'];
      const variants = [];
      
      for (let i = 0; i < frameworks.length; i++) {
        const framework = frameworks[i];
        const variantParams = {
          ...params,
          framework: framework as any
        };
        
        const result = await this.composeEmail(variantParams);
        
        if (result.success && result.data) {
          variants.push({
            variant: String.fromCharCode(65 + i), // A, B, C
            framework: framework,
            subject: result.data.primary_subject,
            content: result.data.content,
            effectiveness_score: result.data.effectiveness_score,
            use_case: this.getFrameworkUseCase(framework, language || 'en')
          });
        }
      }
      
      // Recommend best variant
      const bestVariant = variants.reduce((best, current) => 
        current.effectiveness_score > best.effectiveness_score ? current : best
      );
      
      return {
        success: true,
        data: {
          variants,
          recommended_variant: bestVariant.variant,
          comparison: {
            best_for_conversion: bestVariant.variant,
            best_for_engagement: variants.find(v => v.framework === 'Value-First')?.variant || 'B',
            best_for_urgency: variants.find(v => v.framework === 'Problem-Solution')?.variant || 'A',
          },
          testing_advice: language === 'nl' ? 
            'Test variant A tegen B in eerste ronde. Winner tegen variant C in tweede ronde.' :
            'Test variant A against B in first round. Winner against variant C in second round.',
        },
        message: `Generated ${variants.length} email variants with effectiveness scores`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate email variants',
      };
    }
  }

  private getFrameworkUseCase(framework: string, language: string): string {
    const useCases = {
      'nl': {
        'Problem-Solution': 'Beste voor bedrijven met duidelijke pijnpunten',
        'Value-First': 'Beste voor risk-averse beslissers en eerste contact',
        'AIDA': 'Beste voor algemene interesse en awareness',
        'PAS': 'Beste voor urgente situaties en directe actie'
      },
      'en': {
        'Problem-Solution': 'Best for companies with clear pain points',
        'Value-First': 'Best for risk-averse decision makers and first contact',
        'AIDA': 'Best for general interest and awareness building',
        'PAS': 'Best for urgent situations and immediate action'
      }
    };
    
    return useCases[language as keyof typeof useCases]?.[framework as keyof typeof useCases['en']] || 
           useCases['en'][framework as keyof typeof useCases['en']];
  }

  private generateEmailContent(context: string, length: string, tone: string): string {
    const baseContent = this.analyzeContextAndGenerate(context, tone);
    
    switch (length) {
      case 'short':
        return this.shortenContent(baseContent);
      case 'long':
        return this.expandContent(baseContent, context);
      default:
        return baseContent;
    }
  }

  private analyzeContextAndGenerate(context: string, tone: string): string {
    // Analyze context for key elements
    const isRequest = context.toLowerCase().includes('request') || context.toLowerCase().includes('ask');
    const isUpdate = context.toLowerCase().includes('update') || context.toLowerCase().includes('status');
    const isMeeting = context.toLowerCase().includes('meeting') || context.toLowerCase().includes('schedule');
    
    let content = '';
    
    if (isRequest) {
      content = `I hope this email finds you well. I am writing to request your assistance with ${context.toLowerCase()}.`;
    } else if (isUpdate) {
      content = `I wanted to provide you with an update regarding ${context.toLowerCase()}.`;
    } else if (isMeeting) {
      content = `I would like to schedule a meeting to discuss ${context.toLowerCase()}.`;
    } else {
      content = `I am writing to you regarding ${context.toLowerCase()}.`;
    }

    // Add tone-specific adjustments
    switch (tone) {
      case 'urgent':
        content += ' This matter requires immediate attention.';
        break;
      case 'friendly':
        content += ' I hope you\'re having a great day!';
        break;
      case 'formal':
        content += ' I would appreciate your prompt consideration of this matter.';
        break;
    }

    return content + '\n\nPlease let me know if you need any additional information.';
  }

  private shortenContent(content: string): string {
    return content.split('\n')[0] + '\n\nThank you for your time.';
  }

  private expandContent(content: string, context: string): string {
    return content + `\n\nTo provide more context: ${context}\n\nI believe this would be beneficial for both parties and look forward to your response.\n\nPlease feel free to reach out if you have any questions or concerns.`;
  }

  private applyBusinessFormatting(content: string): string {
    return content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .join('\n\n');
  }

  private applyModernFormatting(content: string): string {
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        if (index === 0) return `**${paragraph.trim()}**`;
        return paragraph.trim();
      })
      .join('\n\n');
  }

  private applyMinimalFormatting(content: string): string {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }

  private applyNewsletterFormatting(content: string): string {
    return `# Email Newsletter

${content}

---
*This is an automated email. Please do not reply directly.*`;
  }

  private localizeToDutch(content: string, tone: string): string {
    return content
      .replace('Dear', tone === 'formal' ? 'Geachte' : 'Beste')
      .replace('Hi', 'Hallo')
      .replace('Hey', 'Hé')
      .replace('Best regards', 'Met vriendelijke groet')
      .replace('Best,', 'Groeten,')
      .replace('Yours sincerely', 'Hoogachtend')
      .replace('Thanks,', 'Bedankt,')
      .replace('Urgently,', 'Met spoed,');
  }

  private translateToDutch(content: string): string {
    // Simplified Dutch translation
    return content
      .replace(/I hope this email finds you well/gi, 'Ik hoop dat deze email u in goede gezondheid bereikt')
      .replace(/Thank you for your time/gi, 'Bedankt voor uw tijd')
      .replace(/Please let me know/gi, 'Laat het me weten')
      .replace(/Best regards/gi, 'Met vriendelijke groet');
  }

  private translateToGerman(content: string): string {
    // Simplified German translation
    return content
      .replace(/I hope this email finds you well/gi, 'Ich hoffe, diese E-Mail erreicht Sie bei guter Gesundheit')
      .replace(/Thank you for your time/gi, 'Vielen Dank für Ihre Zeit')
      .replace(/Please let me know/gi, 'Bitte lassen Sie mich wissen')
      .replace(/Best regards/gi, 'Mit freundlichen Grüßen');
  }

  private translateToFrench(content: string): string {
    // Simplified French translation
    return content
      .replace(/I hope this email finds you well/gi, 'J\'espère que cet email vous trouve en bonne santé')
      .replace(/Thank you for your time/gi, 'Merci pour votre temps')
      .replace(/Please let me know/gi, 'Veuillez me faire savoir')
      .replace(/Best regards/gi, 'Cordialement');
  }

  private translateToSpanish(content: string): string {
    // Simplified Spanish translation
    return content
      .replace(/I hope this email finds you well/gi, 'Espero que este correo le encuentre bien')
      .replace(/Thank you for your time/gi, 'Gracias por su tiempo')
      .replace(/Please let me know/gi, 'Por favor, háganme saber')
      .replace(/Best regards/gi, 'Saludos cordiales');
  }
}