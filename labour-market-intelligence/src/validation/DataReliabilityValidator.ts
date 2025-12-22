/**
 * Data Reliability Validator - Enforces 85% minimum reliability standard
 * Critical component ensuring only verified data is used in analysis
 */

export interface ReliabilityScore {
  overallScore: number;
  isReliable: boolean;
  dataQuality: {
    pdfData: number;
    marketData: number;
    workforceData: number;
    manualData: number;
  };
  blockers: string[];
  recommendations: string[];
}

export interface VerifiedWorkforceData {
  totalAvailable: number;
  activeJobSeekers: {
    percentage: number;
    count: number;
    reliability: 'verified' | 'estimated' | 'unavailable';
  };
  passiveJobSeekers: {
    percentage: number;
    count: number;
    reliability: 'verified' | 'estimated' | 'unavailable';
  };
  notJobSeeking: {
    percentage: number;
    count: number;
    reliability: 'verified' | 'estimated' | 'unavailable';
  };
  experienceDistribution: {
    junior: { percentage: number; reliability: string };
    medior: { percentage: number; reliability: string };
    senior: { percentage: number; reliability: string };
  };
  ageDistribution: {
    under30: { percentage: number; reliability: string };
    age30to45: { percentage: number; reliability: string };
    over45: { percentage: number; reliability: string };
  };
  reliabilityMetadata: {
    dataSource: string;
    lastUpdated: string;
    sampleSize: number;
    methodology: string;
  };
}

export class DataReliabilityValidator {
  private readonly MINIMUM_RELIABILITY = 85; // User's strict requirement
  private readonly WEIGHTS = {
    pdfData: 0.4,      // Jobdigger PDF heeft hoogste waarde
    marketData: 0.3,   // Marktgegevens belangrijk
    workforceData: 0.2, // Workforce intelligence
    manualData: 0.1    // Handmatige input
  };

  /**
   * Validate data reliability against 85% minimum standard
   */
  validateDataReliability(pdfData?: any, marketData?: any, manualData?: any): ReliabilityScore {
    const scores = {
      pdfData: this.assessPdfReliability(pdfData),
      marketData: this.assessMarketDataReliability(marketData),
      workforceData: this.assessWorkforceReliability(pdfData, marketData),
      manualData: this.assessManualDataReliability(manualData)
    };

    const weightedScore = 
      scores.pdfData * this.WEIGHTS.pdfData +
      scores.marketData * this.WEIGHTS.marketData +
      scores.workforceData * this.WEIGHTS.workforceData +
      scores.manualData * this.WEIGHTS.manualData;

    const overallScore = Math.round(weightedScore);
    const isReliable = overallScore >= this.MINIMUM_RELIABILITY;

    const blockers: string[] = [];
    const recommendations: string[] = [];

    // Check critical blockers
    if (scores.pdfData < 70) {
      blockers.push('PDF data onvoldoende betrouwbaar (< 70%)');
      recommendations.push('Upload volledig Jobdigger rapport');
    }

    if (scores.marketData < 60) {
      blockers.push('Marktdata ontbreekt of onbetrouwbaar');
      recommendations.push('Voeg actuele marktgegevens toe');
    }

    if (overallScore < this.MINIMUM_RELIABILITY) {
      blockers.push(`Overall betrouwbaarheid ${overallScore}% < vereiste ${this.MINIMUM_RELIABILITY}%`);
      recommendations.push('Combineer meerdere betrouwbare databronnen');
    }

    return {
      overallScore,
      isReliable,
      dataQuality: scores,
      blockers,
      recommendations
    };
  }

  /**
   * Create verified workforce data only from reliable sources
   */
  createVerifiedWorkforceData(
    jobTitle: string,
    pdfData?: any,
    marketData?: any
  ): VerifiedWorkforceData | null {
    const reliability = this.validateDataReliability(pdfData, marketData);
    
    if (!reliability.isReliable) {
      return null; // Block creation if not reliable enough
    }

    // Only use verified data - no assumptions or estimates
    let totalAvailable = 0;
    let activeJobSeekers: { percentage: number; count: number; reliability: 'verified' | 'estimated' | 'unavailable' } = { percentage: 0, count: 0, reliability: 'unavailable' };
    let passiveJobSeekers: { percentage: number; count: number; reliability: 'verified' | 'estimated' | 'unavailable' } = { percentage: 0, count: 0, reliability: 'unavailable' };
    let notJobSeeking: { percentage: number; count: number; reliability: 'verified' | 'estimated' | 'unavailable' } = { percentage: 0, count: 0, reliability: 'unavailable' };

    // Extract verified data from PDF if available
    if (pdfData?.workforceMetrics && reliability.dataQuality.pdfData >= 80) {
      totalAvailable = pdfData.workforceMetrics.totalInMarket || 0;
      
      if (pdfData.workforceMetrics.activePercentage) {
        activeJobSeekers = {
          percentage: pdfData.workforceMetrics.activePercentage,
          count: Math.round(totalAvailable * (pdfData.workforceMetrics.activePercentage / 100)),
          reliability: 'verified' as const
        };
      }
    }

    return {
      totalAvailable,
      activeJobSeekers,
      passiveJobSeekers,
      notJobSeeking,
      experienceDistribution: {
        junior: { percentage: 0, reliability: 'unavailable' },
        medior: { percentage: 0, reliability: 'unavailable' },
        senior: { percentage: 0, reliability: 'unavailable' }
      },
      ageDistribution: {
        under30: { percentage: 0, reliability: 'unavailable' },
        age30to45: { percentage: 0, reliability: 'unavailable' },
        over45: { percentage: 0, reliability: 'unavailable' }
      },
      reliabilityMetadata: {
        dataSource: pdfData ? 'Jobdigger PDF' : 'Market analysis',
        lastUpdated: new Date().toISOString(),
        sampleSize: totalAvailable,
        methodology: 'Verified data only - no estimates'
      }
    };
  }

  private assessPdfReliability(pdfData?: any): number {
    if (!pdfData) return 0;
    
    let score = 0;
    
    // Check for key Jobdigger indicators
    if (pdfData.jobTitle) score += 20;
    if (pdfData.salaryData && pdfData.salaryData.marketMedian) score += 25;
    if (pdfData.marketDemand && pdfData.marketDemand.currentOpenings) score += 20;
    if (pdfData.skillsRequired && pdfData.skillsRequired.length > 0) score += 15;
    if (pdfData.educationRequirement) score += 10;
    if (pdfData.experienceRequirement) score += 10;
    
    return Math.min(score, 100);
  }

  private assessMarketDataReliability(marketData?: any): number {
    if (!marketData) return 0;
    
    let score = 0;
    
    if (marketData.demandIndicators) score += 30;
    if (marketData.salaryBenchmarks) score += 25;
    if (marketData.jobOpenings && marketData.jobOpenings > 0) score += 20;
    if (marketData.trendAnalysis) score += 15;
    if (marketData.regionalData) score += 10;
    
    return Math.min(score, 100);
  }

  private assessWorkforceReliability(pdfData?: any, marketData?: any): number {
    let score = 0;
    
    // Only count verified workforce data
    if (pdfData?.workforceMetrics) score += 40;
    if (marketData?.workforceSize) score += 30;
    if (pdfData?.demographics || marketData?.demographics) score += 30;
    
    return Math.min(score, 100);
  }

  private assessManualDataReliability(manualData?: any): number {
    if (!manualData) return 50; // Neutral score for missing manual data
    
    let score = 50;
    
    if (manualData.vacatureText && manualData.vacatureText.length > 100) score += 20;
    if (manualData.vacatureUrl) score += 15;
    if (manualData.companyInfo) score += 15;
    
    return Math.min(score, 100);
  }
}