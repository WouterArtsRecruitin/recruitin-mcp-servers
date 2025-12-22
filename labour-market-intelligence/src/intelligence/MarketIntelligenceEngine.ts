/**
 * Market Intelligence Engine - Professional Dutch Labour Market Analysis
 * Focused on realistic Netherlands job market data
 */

export interface MarketDemandData {
  jobTitle: string;
  location: string;
  timestamp: string;
  demandIndicators: {
    currentOpenings: number;
    trendDirection: 'Stijgend' | 'Stabiel' | 'Dalend';
    demandScore: number; // 1-100
    competitiveLevel: 'Laag' | 'Gemiddeld' | 'Hoog' | 'Zeer Hoog';
  };
  salaryBenchmarks: {
    median: number;
    p25: number;
    p75: number;
    currency: 'EUR';
    period: 'jaar' | 'maand';
  };
  skillsInDemand: string[];
  regionalData: {
    topRegions: Array<{
      region: string;
      openings: number;
      avgSalary: number;
    }>;
  };
  industryAnalysis: {
    topIndustries: Array<{
      industry: string;
      openings: number;
      growthRate: number;
    }>;
  };
  reliabilityMetadata: {
    dataSource: string;
    confidence: number;
    lastUpdated: string;
  };
}

export class MarketIntelligenceEngine {
  private readonly NEDERLANDS_REGIONS = [
    'Noord-Holland', 'Zuid-Holland', 'Utrecht', 'Noord-Brabant',
    'Gelderland', 'Limburg', 'Overijssel', 'Friesland',
    'Groningen', 'Drenthe', 'Flevoland', 'Zeeland'
  ];

  /**
   * Analyze market demand for specific job title in Dutch market
   */
  async analyzeMarketDemand(
    jobTitle: string, 
    location: string = 'Nederland'
  ): Promise<MarketDemandData> {
    console.log(`📊 Market analysis voor: ${jobTitle} in ${location}`);

    // Simulate realistic Dutch market analysis
    // In real implementation, this would connect to:
    // - CBS (Centraal Bureau voor de Statistiek)
    // - UWV (Uitvoeringsinstituut Werknemersverzekeringen)
    // - Tech Pact / Techniek Nederland data
    // - Indeed/LinkedIn aggregate APIs (if legally compliant)

    const marketData: MarketDemandData = {
      jobTitle,
      location,
      timestamp: new Date().toISOString(),
      demandIndicators: this.calculateDemandIndicators(jobTitle),
      salaryBenchmarks: this.getSalaryBenchmarks(jobTitle),
      skillsInDemand: this.getTopSkills(jobTitle),
      regionalData: this.getRegionalAnalysis(jobTitle),
      industryAnalysis: this.getIndustryBreakdown(jobTitle),
      reliabilityMetadata: {
        dataSource: 'Market Intelligence Engine',
        confidence: 75, // Base confidence without external data
        lastUpdated: new Date().toISOString()
      }
    };

    return marketData;
  }

  private calculateDemandIndicators(jobTitle: string): MarketDemandData['demandIndicators'] {
    // Realistic demand calculation based on job title patterns
    const techRoles = ['ontwikkelaar', 'programmer', 'engineer', 'architect', 'devops'];
    const manualRoles = ['monteur', 'technicus', 'installateur', 'lasser'];
    const commercialRoles = ['verkoper', 'accountmanager', 'consultant'];

    const lowerTitle = jobTitle.toLowerCase();
    
    let baseOpenings = 100;
    let trendDirection: 'Stijgend' | 'Stabiel' | 'Dalend' = 'Stabiel';
    let demandScore = 60;
    let competitiveLevel: 'Laag' | 'Gemiddeld' | 'Hoog' | 'Zeer Hoog' = 'Gemiddeld';

    if (techRoles.some(role => lowerTitle.includes(role))) {
      baseOpenings = 450;
      trendDirection = 'Stijgend';
      demandScore = 85;
      competitiveLevel = 'Hoog';
    } else if (manualRoles.some(role => lowerTitle.includes(role))) {
      baseOpenings = 320;
      trendDirection = 'Stijgend';
      demandScore = 75;
      competitiveLevel = 'Gemiddeld';
    } else if (commercialRoles.some(role => lowerTitle.includes(role))) {
      baseOpenings = 280;
      trendDirection = 'Stabiel';
      demandScore = 65;
      competitiveLevel = 'Gemiddeld';
    }

    return {
      currentOpenings: baseOpenings + Math.floor(Math.random() * 100),
      trendDirection,
      demandScore,
      competitiveLevel
    };
  }

  private getSalaryBenchmarks(jobTitle: string): MarketDemandData['salaryBenchmarks'] {
    // Realistic Dutch salary ranges based on 2024 market data
    const lowerTitle = jobTitle.toLowerCase();
    
    let baseSalary = 40000;
    
    if (lowerTitle.includes('senior') || lowerTitle.includes('lead')) {
      baseSalary = 65000;
    } else if (lowerTitle.includes('junior') || lowerTitle.includes('trainee')) {
      baseSalary = 32000;
    } else if (lowerTitle.includes('developer') || lowerTitle.includes('engineer')) {
      baseSalary = 55000;
    } else if (lowerTitle.includes('monteur') || lowerTitle.includes('technicus')) {
      baseSalary = 42000;
    } else if (lowerTitle.includes('manager') || lowerTitle.includes('directeur')) {
      baseSalary = 75000;
    }

    return {
      median: baseSalary,
      p25: Math.round(baseSalary * 0.85),
      p75: Math.round(baseSalary * 1.25),
      currency: 'EUR',
      period: 'jaar'
    };
  }

  private getTopSkills(jobTitle: string): string[] {
    const lowerTitle = jobTitle.toLowerCase();
    
    const skillSets = {
      tech: ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
      monteur: ['Mechanica', 'Elektrotechniek', 'Lassen', 'Hydrauliek', 'Preventief onderhoud', 'Troubleshooting'],
      commercial: ['CRM systemen', 'Salesforce', 'Onderhandelen', 'Presenteren', 'Klantgericht werken'],
      general: ['Nederlands', 'Engels', 'Microsoft Office', 'Teamwork', 'Communicatie', 'Probleemoplossing']
    };

    if (lowerTitle.includes('ontwikkelaar') || lowerTitle.includes('developer')) {
      return [...skillSets.tech.slice(0, 4), ...skillSets.general.slice(0, 3)];
    } else if (lowerTitle.includes('monteur') || lowerTitle.includes('technicus')) {
      return [...skillSets.monteur.slice(0, 4), ...skillSets.general.slice(0, 3)];
    } else if (lowerTitle.includes('verkoper') || lowerTitle.includes('account')) {
      return [...skillSets.commercial.slice(0, 4), ...skillSets.general.slice(0, 3)];
    }

    return skillSets.general;
  }

  private getRegionalAnalysis(jobTitle: string): MarketDemandData['regionalData'] {
    // Realistic regional distribution based on Dutch economic centers
    const regions = [
      { region: 'Randstad (Amsterdam/Den Haag)', openings: 180, avgSalary: 55000 },
      { region: 'Eindhoven/Brainport', openings: 95, avgSalary: 52000 },
      { region: 'Rotterdam/Zuid-Holland', openings: 85, avgSalary: 48000 },
      { region: 'Utrecht', openings: 75, avgSalary: 51000 },
      { region: 'Overige Nederland', openings: 120, avgSalary: 44000 }
    ];

    return { topRegions: regions };
  }

  private getIndustryBreakdown(jobTitle: string): MarketDemandData['industryAnalysis'] {
    const lowerTitle = jobTitle.toLowerCase();
    
    if (lowerTitle.includes('monteur') || lowerTitle.includes('technicus')) {
      return {
        topIndustries: [
          { industry: 'Industrie & Manufacturing', openings: 140, growthRate: 8.5 },
          { industry: 'Automotive', openings: 85, growthRate: 6.2 },
          { industry: 'Energie & Utilities', openings: 65, growthRate: 12.1 },
          { industry: 'Bouw & Installatie', openings: 95, growthRate: 4.8 }
        ]
      };
    } else if (lowerTitle.includes('ontwikkelaar') || lowerTitle.includes('engineer')) {
      return {
        topIndustries: [
          { industry: 'Technology & Software', openings: 220, growthRate: 15.3 },
          { industry: 'Financiele Diensten', openings: 85, growthRate: 9.7 },
          { industry: 'E-commerce & Retail', openings: 75, growthRate: 11.2 },
          { industry: 'Zorg & Medtech', openings: 45, growthRate: 8.9 }
        ]
      };
    }

    // Generic breakdown
    return {
      topIndustries: [
        { industry: 'Zakelijke Dienstverlening', openings: 120, growthRate: 5.5 },
        { industry: 'Retail & Groothandel', openings: 95, growthRate: 3.2 },
        { industry: 'Zorg & Welzijn', openings: 80, growthRate: 7.1 },
        { industry: 'Overheid & Publiek', openings: 60, growthRate: 2.8 }
      ]
    };
  }

  /**
   * Get market trend analysis
   */
  async getMarketTrends(jobTitle: string): Promise<{
    shortTerm: string;
    longTerm: string;
    keyDrivers: string[];
    risks: string[];
  }> {
    return {
      shortTerm: 'Stabiele vraag verwacht voor komende 6 maanden',
      longTerm: 'Positieve groei verwacht door digitalisering en automatisering',
      keyDrivers: [
        'Tekort aan gekwalificeerd personeel',
        'Digitale transformatie',
        'Duurzaamheidsinitiatieven'
      ],
      risks: [
        'Economische onzekerheid',
        'Automatisering van taken',
        'Concurrentie internationale markten'
      ]
    };
  }

  /**
   * Compare job titles for market positioning
   */
  async compareJobTitles(titles: string[]): Promise<{
    comparison: Array<{
      title: string;
      demandScore: number;
      salaryMedian: number;
      competitiveness: string;
    }>;
    recommendation: string;
  }> {
    const comparisons = [];
    
    for (const title of titles) {
      const marketData = await this.analyzeMarketDemand(title);
      comparisons.push({
        title,
        demandScore: marketData.demandIndicators.demandScore,
        salaryMedian: marketData.salaryBenchmarks.median,
        competitiveness: marketData.demandIndicators.competitiveLevel
      });
    }

    const bestOption = comparisons.reduce((best, current) => 
      current.demandScore > best.demandScore ? current : best
    );

    return {
      comparison: comparisons,
      recommendation: `${bestOption.title} toont de beste marktperspectieven met een demand score van ${bestOption.demandScore}`
    };
  }
}