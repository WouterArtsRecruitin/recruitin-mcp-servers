/**
 * Reliable Workforce Engine - Only analyzes with verified data
 * Replacement for WorkforceAvailabilityEngine to eliminate assumptions
 * Enforces 85% minimum reliability standard per user requirement
 */

import { 
  DataReliabilityValidator, 
  ReliabilityScore, 
  VerifiedWorkforceData 
} from '../validation/DataReliabilityValidator.js';

export interface WorkforceAnalysisResult {
  isReliable: boolean;
  reliabilityScore: ReliabilityScore;
  workforceData?: VerifiedWorkforceData;
  blockerMessage?: string;
}

export class ReliableWorkforceEngine {
  public readonly validator: DataReliabilityValidator;

  constructor() {
    this.validator = new DataReliabilityValidator();
  }

  /**
   * Analyze workforce with strict reliability verification
   * Only proceeds if data meets 85% reliability threshold
   */
  analyzeWorkforceWithVerification(
    jobTitle: string,
    pdfData?: any,
    marketData?: any,
    manualData?: any
  ): WorkforceAnalysisResult {
    console.log(`🔍 Workforce reliability check voor: ${jobTitle}`);
    
    // First validate data reliability
    const reliabilityScore = this.validator.validateDataReliability(
      pdfData, 
      marketData, 
      manualData
    );

    console.log(`📊 Reliability score: ${reliabilityScore.overallScore}%`);

    // Block analysis if reliability is insufficient
    if (!reliabilityScore.isReliable) {
      console.warn(`❌ Analysis blocked: ${reliabilityScore.overallScore}% < 85%`);
      
      return {
        isReliable: false,
        reliabilityScore,
        blockerMessage: `Onvoldoende data betrouwbaarheid (${reliabilityScore.overallScore}% < 85%). ` +
                       `Ontbrekend: ${reliabilityScore.blockers.join(', ')}`
      };
    }

    // Create verified workforce data
    const workforceData = this.validator.createVerifiedWorkforceData(
      jobTitle,
      pdfData,
      marketData
    );

    if (!workforceData) {
      return {
        isReliable: false,
        reliabilityScore,
        blockerMessage: 'Kon geen betrouwbare workforce data genereren'
      };
    }

    console.log(`✅ Reliable workforce analysis completed for ${jobTitle}`);

    return {
      isReliable: true,
      reliabilityScore,
      workforceData
    };
  }

  /**
   * Get workforce availability statistics (only verified data)
   */
  getWorkforceAvailability(jobTitle: string, location: string = 'Nederland'): VerifiedWorkforceData | null {
    // This would normally connect to real data sources
    // For now, return null to indicate no verified data available
    console.log(`⚠️ No verified workforce data available for ${jobTitle} in ${location}`);
    return null;
  }

  /**
   * Analyze job seeker segments with reliability validation
   */
  analyzeJobSeekerSegments(
    workforceData: VerifiedWorkforceData
  ): {
    segments: {
      active: { count: number; percentage: number; reliability: string };
      passive: { count: number; percentage: number; reliability: string };
      unavailable: { count: number; percentage: number; reliability: string };
    };
    totalVerifiedData: number;
    reliabilityWarnings: string[];
  } {
    const warnings: string[] = [];
    let totalVerified = 0;

    // Only count data marked as 'verified'
    if (workforceData.activeJobSeekers.reliability === 'verified') {
      totalVerified += workforceData.activeJobSeekers.count;
    } else {
      warnings.push('Active job seekers data not verified');
    }

    if (workforceData.passiveJobSeekers.reliability === 'verified') {
      totalVerified += workforceData.passiveJobSeekers.count;
    } else {
      warnings.push('Passive job seekers data not verified');
    }

    return {
      segments: {
        active: {
          count: workforceData.activeJobSeekers.count,
          percentage: workforceData.activeJobSeekers.percentage,
          reliability: workforceData.activeJobSeekers.reliability
        },
        passive: {
          count: workforceData.passiveJobSeekers.count,
          percentage: workforceData.passiveJobSeekers.percentage,
          reliability: workforceData.passiveJobSeekers.reliability
        },
        unavailable: {
          count: workforceData.notJobSeeking.count,
          percentage: workforceData.notJobSeeking.percentage,
          reliability: workforceData.notJobSeeking.reliability
        }
      },
      totalVerifiedData: totalVerified,
      reliabilityWarnings: warnings
    };
  }

  /**
   * Get demographic analysis with reliability indicators
   */
  getDemographicAnalysis(workforceData: VerifiedWorkforceData): {
    experience: any;
    age: any;
    reliabilityScore: number;
    dataGaps: string[];
  } {
    const dataGaps: string[] = [];
    let reliabilityCount = 0;
    let totalCategories = 6; // 3 experience + 3 age categories

    // Check experience data reliability
    Object.entries(workforceData.experienceDistribution).forEach(([level, data]) => {
      if (data.reliability === 'verified') {
        reliabilityCount++;
      } else {
        dataGaps.push(`${level} experience data not verified`);
      }
    });

    // Check age data reliability
    Object.entries(workforceData.ageDistribution).forEach(([range, data]) => {
      if (data.reliability === 'verified') {
        reliabilityCount++;
      } else {
        dataGaps.push(`${range} age data not verified`);
      }
    });

    const reliabilityScore = Math.round((reliabilityCount / totalCategories) * 100);

    return {
      experience: workforceData.experienceDistribution,
      age: workforceData.ageDistribution,
      reliabilityScore,
      dataGaps
    };
  }

  /**
   * Generate workforce intelligence report with reliability metadata
   */
  generateWorkforceIntelligenceReport(
    jobTitle: string,
    workforceData: VerifiedWorkforceData,
    reliabilityScore: ReliabilityScore
  ): string {
    const segments = this.analyzeJobSeekerSegments(workforceData);
    const demographics = this.getDemographicAnalysis(workforceData);

    return `# 🎯 WORKFORCE INTELLIGENCE RAPPORT - ${jobTitle.toUpperCase()}

## 📊 BETROUWBAARHEIDSCORE: ${reliabilityScore.overallScore}%

### ✅ DATA KWALITEIT
- PDF Data: ${reliabilityScore.dataQuality.pdfData}%
- Markt Data: ${reliabilityScore.dataQuality.marketData}%
- Workforce Data: ${reliabilityScore.dataQuality.workforceData}%
- Handmatige Data: ${reliabilityScore.dataQuality.manualData}%

### 👥 WORKFORCE SEGMENTATIE
**Totaal Beschikbaar:** ${workforceData.totalAvailable.toLocaleString()} professionals

**Actieve Zoekenden:**
- Aantal: ${segments.segments.active.count.toLocaleString()}
- Percentage: ${segments.segments.active.percentage}%
- Status: ${segments.segments.active.reliability}

**Passieve Kandidaten:**
- Aantal: ${segments.segments.passive.count.toLocaleString()}
- Percentage: ${segments.segments.passive.percentage}%
- Status: ${segments.segments.passive.reliability}

### 📈 DEMOGRAFISCHE VERDELING
**Ervaring (Betrouwbaarheid: ${demographics.reliabilityScore}%)**
- Junior: ${workforceData.experienceDistribution.junior.percentage}%
- Medior: ${workforceData.experienceDistribution.medior.percentage}%
- Senior: ${workforceData.experienceDistribution.senior.percentage}%

**Leeftijd**
- Onder 30: ${workforceData.ageDistribution.under30.percentage}%
- 30-45: ${workforceData.ageDistribution.age30to45.percentage}%
- Boven 45: ${workforceData.ageDistribution.over45.percentage}%

### ⚠️ DATA BEPERKINGEN
${reliabilityScore.blockers.length > 0 ? 
  reliabilityScore.blockers.map(b => `- ${b}`).join('\n') : 
  '✅ Geen significante beperkingen'
}

### 💡 AANBEVELINGEN
${reliabilityScore.recommendations.length > 0 ? 
  reliabilityScore.recommendations.map(r => `- ${r}`).join('\n') : 
  '✅ Data kwaliteit voldoende voor betrouwbare analyse'
}

---
**Data Bron:** ${workforceData.reliabilityMetadata.dataSource}  
**Laatst Bijgewerkt:** ${new Date(workforceData.reliabilityMetadata.lastUpdated).toLocaleDateString('nl-NL')}  
**Sample Size:** ${workforceData.reliabilityMetadata.sampleSize.toLocaleString()}  
**Methodologie:** ${workforceData.reliabilityMetadata.methodology}
`;
  }
}