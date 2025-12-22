import type { AnalyzeEmailParams, EmailPerformanceParams } from './schemas.js';

interface AnalysisResult {
  metric: string;
  score: number;
  feedback: string;
  suggestions: string[];
}

interface PerformanceMetrics {
  email_id?: string;
  opens: number;
  clicks: number;
  replies: number;
  forwards: number;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
  engagement_score: number;
}

export class EmailAnalyzer {
  async analyzeEmail(params: AnalyzeEmailParams) {
    try {
      const { content, metrics } = params;
      
      const results: AnalysisResult[] = [];

      for (const metric of metrics) {
        switch (metric) {
          case 'tone':
            results.push(this.analyzeTone(content));
            break;
          case 'clarity':
            results.push(this.analyzeClarity(content));
            break;
          case 'professionalism':
            results.push(this.analyzeProfessionalism(content));
            break;
          case 'engagement':
            results.push(this.analyzeEngagement(content));
            break;
          case 'length':
            results.push(this.analyzeLength(content));
            break;
        }
      }

      // Calculate overall score
      const overallScore = results.reduce((sum, result) => sum + result.score, 0) / results.length;
      
      // Generate overall recommendations
      const overallRecommendations = this.generateOverallRecommendations(results, content);

      return {
        success: true,
        data: {
          content_preview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          overall_score: Math.round(overallScore * 10) / 10,
          metrics_analyzed: results,
          word_count: content.split(' ').length,
          character_count: content.length,
          estimated_read_time: Math.ceil(content.split(' ').length / 200) + ' minutes',
          overall_recommendations: overallRecommendations,
        },
        message: `Email analysis completed with overall score of ${Math.round(overallScore * 10) / 10}/10`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to analyze email',
      };
    }
  }

  async getPerformanceMetrics(params: EmailPerformanceParams) {
    try {
      const { email_id, timeframe } = params;

      // In a real implementation, this would fetch data from an email service provider
      // For demo purposes, we'll generate mock data
      const mockMetrics: PerformanceMetrics = this.generateMockMetrics(email_id, timeframe);

      const insights = this.generatePerformanceInsights(mockMetrics);

      return {
        success: true,
        data: {
          metrics: mockMetrics,
          timeframe: timeframe,
          insights: insights,
          benchmark_comparison: this.getBenchmarkComparison(mockMetrics),
          recommendations: this.getPerformanceRecommendations(mockMetrics),
        },
        message: `Performance metrics retrieved for ${timeframe} period`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve performance metrics',
      };
    }
  }

  private analyzeTone(content: string): AnalysisResult {
    const positiveWords = ['please', 'thank', 'appreciate', 'grateful', 'wonderful', 'excellent', 'great'];
    const negativeWords = ['urgent', 'immediately', 'asap', 'demand', 'must', 'required', 'disappointed'];
    const formalWords = ['furthermore', 'therefore', 'consequently', 'nevertheless', 'hereby'];
    const casualWords = ['hey', 'awesome', 'cool', 'super', 'totally', 'gonna'];

    const words = content.toLowerCase().split(/\s+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    let formalCount = 0;
    let casualCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
      if (formalWords.includes(word)) formalCount++;
      if (casualWords.includes(word)) casualCount++;
    });

    let score = 7; // Base score
    let toneType = 'neutral';
    let feedback = '';
    const suggestions: string[] = [];

    if (positiveCount > negativeCount) {
      score += 1;
      toneType = 'positive';
      feedback = 'The email has a positive and friendly tone.';
    } else if (negativeCount > positiveCount) {
      score -= 1;
      toneType = 'negative';
      feedback = 'The email tone seems somewhat demanding or negative.';
      suggestions.push('Consider using more positive language');
    }

    if (formalCount > casualCount) {
      feedback += ' The language is appropriately formal.';
    } else if (casualCount > formalCount) {
      score -= 0.5;
      feedback += ' The language is quite casual for professional communication.';
      suggestions.push('Consider using more formal language for professional emails');
    }

    return {
      metric: 'tone',
      score: Math.max(0, Math.min(10, score)),
      feedback: feedback || 'The email maintains a neutral tone.',
      suggestions,
    };
  }

  private analyzeClarity(content: string): AnalysisResult {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/);
    
    const avgWordsPerSentence = words.length / sentences.length;
    const longWords = words.filter(word => word.length > 6).length;
    const longWordRatio = longWords / words.length;

    let score = 8; // Base score
    const suggestions: string[] = [];

    // Check sentence length
    if (avgWordsPerSentence > 20) {
      score -= 2;
      suggestions.push('Consider breaking down long sentences for better readability');
    } else if (avgWordsPerSentence > 15) {
      score -= 1;
      suggestions.push('Some sentences could be shorter for better clarity');
    }

    // Check complex words
    if (longWordRatio > 0.3) {
      score -= 1;
      suggestions.push('Consider using simpler words where possible');
    }

    // Check for clear structure
    const hasGreeting = /^(dear|hi|hello)/i.test(content.trim());
    const hasClosing = /(regards|sincerely|best|thanks)/i.test(content);
    
    if (!hasGreeting) {
      score -= 0.5;
      suggestions.push('Add a proper greeting to make the email more personal');
    }
    
    if (!hasClosing) {
      score -= 0.5;
      suggestions.push('Include a professional closing');
    }

    const feedback = `Email has ${sentences.length} sentences with an average of ${Math.round(avgWordsPerSentence)} words per sentence.`;

    return {
      metric: 'clarity',
      score: Math.max(0, Math.min(10, score)),
      feedback,
      suggestions,
    };
  }

  private analyzeProfessionalism(content: string): AnalysisResult {
    const unprofessionalWords = ['lol', 'omg', 'wtf', 'asap', 'fyi', 'btw'];
    const professionalPhrases = ['please find', 'i would like', 'thank you for', 'looking forward', 'best regards'];
    
    let score = 8;
    const suggestions: string[] = [];
    
    const lowerContent = content.toLowerCase();
    
    // Check for unprofessional language
    const unprofessionalCount = unprofessionalWords.filter(word => lowerContent.includes(word)).length;
    if (unprofessionalCount > 0) {
      score -= unprofessionalCount * 2;
      suggestions.push('Avoid using informal abbreviations and slang in professional emails');
    }

    // Check for professional phrases
    const professionalCount = professionalPhrases.filter(phrase => lowerContent.includes(phrase)).length;
    if (professionalCount > 0) {
      score += professionalCount * 0.5;
    }

    // Check for proper capitalization
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const improperCapitalization = sentences.filter(sentence => {
      const trimmed = sentence.trim();
      return trimmed.length > 0 && !/^[A-Z]/.test(trimmed);
    }).length;

    if (improperCapitalization > 0) {
      score -= improperCapitalization * 0.5;
      suggestions.push('Ensure proper capitalization at the beginning of sentences');
    }

    // Check for excessive exclamation marks
    const exclamationCount = (content.match(/!/g) || []).length;
    if (exclamationCount > 2) {
      score -= 1;
      suggestions.push('Use exclamation marks sparingly in professional communication');
    }

    return {
      metric: 'professionalism',
      score: Math.max(0, Math.min(10, score)),
      feedback: `Email demonstrates ${score >= 8 ? 'high' : score >= 6 ? 'moderate' : 'low'} professionalism.`,
      suggestions,
    };
  }

  private analyzeEngagement(content: string): AnalysisResult {
    const engagementWords = ['question', 'thoughts', 'opinion', 'feedback', 'discuss', 'meeting', 'call'];
    const callToActions = ['please let me know', 'looking forward', 'please reply', 'please confirm'];
    
    let score = 6; // Base score
    const suggestions: string[] = [];
    
    const lowerContent = content.toLowerCase();
    
    // Check for engagement words
    const engagementCount = engagementWords.filter(word => lowerContent.includes(word)).length;
    score += engagementCount * 0.5;

    // Check for call-to-actions
    const ctaCount = callToActions.filter(phrase => lowerContent.includes(phrase)).length;
    score += ctaCount;

    // Check for questions
    const questionCount = (content.match(/\?/g) || []).length;
    if (questionCount > 0) {
      score += questionCount * 0.5;
    } else {
      suggestions.push('Consider adding questions to encourage responses');
    }

    // Check for personal touch
    if (lowerContent.includes('you') && lowerContent.includes('your')) {
      score += 0.5;
    } else {
      suggestions.push('Make the email more personal by addressing the recipient directly');
    }

    if (ctaCount === 0) {
      suggestions.push('Include a clear call-to-action to encourage response');
    }

    return {
      metric: 'engagement',
      score: Math.max(0, Math.min(10, score)),
      feedback: `Email has ${questionCount} questions and ${ctaCount} call-to-action phrases.`,
      suggestions,
    };
  }

  private analyzeLength(content: string): AnalysisResult {
    const wordCount = content.split(/\s+/).length;
    const charCount = content.length;
    
    let score = 8;
    const suggestions: string[] = [];
    
    if (wordCount < 10) {
      score -= 3;
      suggestions.push('Email might be too short and lack important details');
    } else if (wordCount < 20) {
      score -= 1;
      suggestions.push('Consider adding more context or details');
    } else if (wordCount > 300) {
      score -= 2;
      suggestions.push('Email might be too long; consider breaking it into shorter paragraphs');
    } else if (wordCount > 200) {
      score -= 1;
      suggestions.push('Consider making the email more concise');
    }

    let lengthCategory = '';
    if (wordCount < 50) lengthCategory = 'short';
    else if (wordCount < 150) lengthCategory = 'medium';
    else lengthCategory = 'long';

    return {
      metric: 'length',
      score: Math.max(0, Math.min(10, score)),
      feedback: `Email is ${lengthCategory} with ${wordCount} words and ${charCount} characters.`,
      suggestions,
    };
  }

  private generateOverallRecommendations(results: AnalysisResult[], content: string): string[] {
    const recommendations: string[] = [];
    const lowScores = results.filter(r => r.score < 6);

    if (lowScores.length > 0) {
      recommendations.push(`Focus on improving: ${lowScores.map(r => r.metric).join(', ')}`);
    }

    // Add specific recommendations based on patterns
    if (results.some(r => r.metric === 'engagement' && r.score < 6)) {
      recommendations.push('Add more interactive elements like questions or clear next steps');
    }

    if (results.some(r => r.metric === 'clarity' && r.score < 6)) {
      recommendations.push('Restructure content with bullet points or shorter paragraphs');
    }

    if (results.every(r => r.score >= 8)) {
      recommendations.push('Excellent email! Consider this as a template for future communications');
    }

    return recommendations;
  }

  private generateMockMetrics(email_id?: string, timeframe?: string): PerformanceMetrics {
    // Generate realistic mock data based on industry averages
    const baseOpenRate = 0.22; // 22% average open rate
    const baseClickRate = 0.03; // 3% average click rate
    const baseReplyRate = 0.08; // 8% average reply rate

    const opens = Math.floor(Math.random() * 100) + 10;
    const clicks = Math.floor(opens * (baseClickRate + Math.random() * 0.02));
    const replies = Math.floor(opens * (baseReplyRate + Math.random() * 0.03));
    const forwards = Math.floor(clicks * 0.1);

    const totalSent = Math.floor(opens / (baseOpenRate + Math.random() * 0.1));

    return {
      email_id: email_id || `email_${Date.now()}`,
      opens,
      clicks,
      replies,
      forwards,
      open_rate: Math.round((opens / totalSent) * 1000) / 10,
      click_rate: Math.round((clicks / opens) * 1000) / 10,
      reply_rate: Math.round((replies / opens) * 1000) / 10,
      engagement_score: Math.round(((clicks + replies * 2) / opens) * 1000) / 10,
    };
  }

  private generatePerformanceInsights(metrics: PerformanceMetrics): string[] {
    const insights: string[] = [];

    if (metrics.open_rate > 25) {
      insights.push('Excellent open rate - your subject line is very effective');
    } else if (metrics.open_rate < 15) {
      insights.push('Low open rate - consider improving your subject line');
    }

    if (metrics.click_rate > 5) {
      insights.push('High click rate indicates engaging content');
    } else if (metrics.click_rate < 2) {
      insights.push('Low click rate - consider adding more compelling calls-to-action');
    }

    if (metrics.reply_rate > 10) {
      insights.push('Excellent reply rate - recipients are highly engaged');
    } else if (metrics.reply_rate < 5) {
      insights.push('Low reply rate - consider making your emails more conversational');
    }

    return insights;
  }

  private getBenchmarkComparison(metrics: PerformanceMetrics) {
    return {
      open_rate: {
        your_rate: metrics.open_rate,
        industry_average: 22.0,
        performance: metrics.open_rate > 22 ? 'above_average' : metrics.open_rate > 18 ? 'average' : 'below_average',
      },
      click_rate: {
        your_rate: metrics.click_rate,
        industry_average: 3.0,
        performance: metrics.click_rate > 3 ? 'above_average' : metrics.click_rate > 2 ? 'average' : 'below_average',
      },
      reply_rate: {
        your_rate: metrics.reply_rate,
        industry_average: 8.0,
        performance: metrics.reply_rate > 8 ? 'above_average' : metrics.reply_rate > 5 ? 'average' : 'below_average',
      },
    };
  }

  private getPerformanceRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.open_rate < 20) {
      recommendations.push('Experiment with different subject line styles (questions, urgency, personalization)');
    }

    if (metrics.click_rate < 3) {
      recommendations.push('Include more compelling and clear call-to-action buttons');
      recommendations.push('Test different placement of links within your email content');
    }

    if (metrics.reply_rate < 7) {
      recommendations.push('Make your emails more conversational and ask specific questions');
      recommendations.push('Include a clear next step or request for response');
    }

    if (metrics.engagement_score < 10) {
      recommendations.push('Consider segmenting your audience for more targeted messaging');
    }

    return recommendations;
  }
}