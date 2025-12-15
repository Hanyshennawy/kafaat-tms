/**
 * Predictive Analytics Service
 * 
 * Provides AI-driven predictive analytics for:
 * - Employee turnover prediction
 * - Performance forecasting
 * - Skills gap prediction
 * - Workforce demand forecasting
 * - Engagement risk prediction
 */

import { invokeLLM } from '../_core/llm';

interface TurnoverPrediction {
  employeeId: number;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative';
    weight: number;
  }>;
  recommendations: string[];
  retentionActions: string[];
}

interface PerformanceForecast {
  employeeId: number;
  currentRating: number;
  predictedRating: number;
  confidence: number;
  trend: 'improving' | 'stable' | 'declining';
  keyDrivers: string[];
  developmentSuggestions: string[];
}

interface SkillsGapAnalysis {
  departmentId?: number;
  roleId?: number;
  currentSkillsProfile: Record<string, number>;
  requiredSkillsProfile: Record<string, number>;
  gaps: Array<{
    skill: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    trainingRecommendations: string[];
  }>;
  overallReadiness: number;
}

interface WorkforceDemandForecast {
  scenarioId: number;
  timeframe: string;
  departments: Array<{
    departmentId: number;
    departmentName: string;
    currentHeadcount: number;
    projectedDemand: number;
    surplus: number;
    deficit: number;
    keyRoles: Array<{
      roleTitle: string;
      currentCount: number;
      projectedNeed: number;
      difficulty: 'easy' | 'moderate' | 'hard' | 'very_hard';
    }>;
  }>;
  totalProjectedHires: number;
  estimatedCost: number;
  recommendations: string[];
}

interface EngagementRiskAssessment {
  scope: 'organization' | 'department' | 'team';
  scopeId?: number;
  overallEngagementScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  atRiskEmployees: number;
  totalEmployees: number;
  riskFactors: Array<{
    factor: string;
    severity: number;
    affectedPercentage: number;
  }>;
  trendAnalysis: {
    direction: 'improving' | 'stable' | 'declining';
    changeRate: number;
  };
  recommendations: string[];
}

export class PredictiveAnalyticsService {
  /**
   * Check if AI features are available
   */
  private isAIAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  /**
   * Predict employee turnover risk
   */
  async predictTurnover(params: {
    employeeId: number;
    tenure: number;
    recentPerformanceRating: number;
    engagementScore: number;
    lastPromotion?: Date;
    salaryCompetitiveness: number; // 0-100
    managerRelationshipScore: number;
    recentFeedbackSentiment: 'positive' | 'neutral' | 'negative';
  }): Promise<TurnoverPrediction> {
    // Calculate risk factors
    const factors: TurnoverPrediction['factors'] = [];
    let riskScore = 0;

    // Tenure factor (new employees or very long tenure can be risky)
    if (params.tenure < 1) {
      factors.push({ factor: 'New employee (< 1 year)', impact: 'negative', weight: 15 });
      riskScore += 15;
    } else if (params.tenure > 5) {
      factors.push({ factor: 'Long tenure (> 5 years)', impact: 'negative', weight: 10 });
      riskScore += 10;
    } else {
      factors.push({ factor: 'Moderate tenure', impact: 'positive', weight: -5 });
      riskScore -= 5;
    }

    // Performance factor
    if (params.recentPerformanceRating < 3) {
      factors.push({ factor: 'Low performance rating', impact: 'negative', weight: 20 });
      riskScore += 20;
    } else if (params.recentPerformanceRating >= 4.5) {
      factors.push({ factor: 'High performer (may seek growth)', impact: 'negative', weight: 10 });
      riskScore += 10;
    } else {
      factors.push({ factor: 'Solid performance', impact: 'positive', weight: -10 });
      riskScore -= 10;
    }

    // Engagement factor
    if (params.engagementScore < 50) {
      factors.push({ factor: 'Low engagement', impact: 'negative', weight: 25 });
      riskScore += 25;
    } else if (params.engagementScore >= 80) {
      factors.push({ factor: 'High engagement', impact: 'positive', weight: -15 });
      riskScore -= 15;
    }

    // Promotion factor
    if (params.lastPromotion) {
      const monthsSincePromotion = Math.floor(
        (Date.now() - params.lastPromotion.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      if (monthsSincePromotion > 36) {
        factors.push({ factor: 'No promotion in 3+ years', impact: 'negative', weight: 15 });
        riskScore += 15;
      }
    }

    // Salary factor
    if (params.salaryCompetitiveness < 50) {
      factors.push({ factor: 'Below market salary', impact: 'negative', weight: 20 });
      riskScore += 20;
    } else if (params.salaryCompetitiveness >= 80) {
      factors.push({ factor: 'Competitive salary', impact: 'positive', weight: -10 });
      riskScore -= 10;
    }

    // Manager relationship
    if (params.managerRelationshipScore < 3) {
      factors.push({ factor: 'Poor manager relationship', impact: 'negative', weight: 25 });
      riskScore += 25;
    } else if (params.managerRelationshipScore >= 4.5) {
      factors.push({ factor: 'Strong manager relationship', impact: 'positive', weight: -15 });
      riskScore -= 15;
    }

    // Feedback sentiment
    if (params.recentFeedbackSentiment === 'negative') {
      factors.push({ factor: 'Recent negative feedback', impact: 'negative', weight: 15 });
      riskScore += 15;
    }

    // Normalize score to 0-100
    riskScore = Math.max(0, Math.min(100, riskScore + 30)); // Base risk of 30

    // Determine risk level
    let riskLevel: TurnoverPrediction['riskLevel'];
    if (riskScore < 25) riskLevel = 'low';
    else if (riskScore < 50) riskLevel = 'medium';
    else if (riskScore < 75) riskLevel = 'high';
    else riskLevel = 'critical';

    // Generate recommendations
    const recommendations: string[] = [];
    const retentionActions: string[] = [];

    if (params.engagementScore < 60) {
      recommendations.push('Schedule regular 1:1 meetings to understand concerns');
      retentionActions.push('Increase engagement through meaningful projects');
    }
    if (params.salaryCompetitiveness < 60) {
      recommendations.push('Review compensation against market rates');
      retentionActions.push('Consider salary adjustment or bonus');
    }
    if (params.managerRelationshipScore < 3.5) {
      recommendations.push('Facilitate manager-employee relationship building');
      retentionActions.push('Provide coaching for the manager');
    }
    if (!params.lastPromotion || (Date.now() - params.lastPromotion.getTime()) > 24 * 30 * 24 * 60 * 60 * 1000) {
      recommendations.push('Discuss career progression opportunities');
      retentionActions.push('Create a clear career development plan');
    }

    return {
      employeeId: params.employeeId,
      riskScore,
      riskLevel,
      factors,
      recommendations,
      retentionActions,
    };
  }

  /**
   * Forecast performance trend
   */
  async forecastPerformance(params: {
    employeeId: number;
    historicalRatings: Array<{ period: string; rating: number }>;
    recentTrainingHours: number;
    goalCompletionRate: number;
    feedbackScores: number[];
  }): Promise<PerformanceForecast> {
    const { historicalRatings, recentTrainingHours, goalCompletionRate, feedbackScores } = params;

    // Calculate current average
    const currentRating = historicalRatings.length > 0
      ? historicalRatings[historicalRatings.length - 1].rating
      : 3;

    // Calculate trend from historical data
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    let predictedRating = currentRating;

    if (historicalRatings.length >= 2) {
      const recentRatings = historicalRatings.slice(-3);
      const avgChange = recentRatings.reduce((acc, curr, i, arr) => {
        if (i === 0) return 0;
        return acc + (curr.rating - arr[i - 1].rating);
      }, 0) / (recentRatings.length - 1 || 1);

      if (avgChange > 0.2) {
        trend = 'improving';
        predictedRating = Math.min(5, currentRating + avgChange);
      } else if (avgChange < -0.2) {
        trend = 'declining';
        predictedRating = Math.max(1, currentRating + avgChange);
      }
    }

    // Adjust based on other factors
    if (recentTrainingHours > 40) {
      predictedRating = Math.min(5, predictedRating + 0.1);
    }
    if (goalCompletionRate > 80) {
      predictedRating = Math.min(5, predictedRating + 0.2);
    }

    // Key drivers
    const keyDrivers: string[] = [];
    if (goalCompletionRate > 80) keyDrivers.push('Strong goal completion rate');
    if (recentTrainingHours > 40) keyDrivers.push('Active learning engagement');
    if (feedbackScores.length > 0) {
      const avgFeedback = feedbackScores.reduce((a, b) => a + b, 0) / feedbackScores.length;
      if (avgFeedback > 4) keyDrivers.push('Positive peer feedback');
      if (avgFeedback < 3) keyDrivers.push('Needs improvement based on feedback');
    }

    // Development suggestions
    const developmentSuggestions: string[] = [];
    if (recentTrainingHours < 20) {
      developmentSuggestions.push('Increase participation in training programs');
    }
    if (goalCompletionRate < 60) {
      developmentSuggestions.push('Focus on goal prioritization and time management');
    }
    if (feedbackScores.some(s => s < 3)) {
      developmentSuggestions.push('Address areas highlighted in feedback');
    }

    return {
      employeeId: params.employeeId,
      currentRating,
      predictedRating: Math.round(predictedRating * 10) / 10,
      confidence: 0.75,
      trend,
      keyDrivers,
      developmentSuggestions,
    };
  }

  /**
   * Analyze skills gaps
   */
  async analyzeSkillsGap(params: {
    currentSkills: Array<{ skillId: number; skillName: string; level: number }>;
    requiredSkills: Array<{ skillId: number; skillName: string; requiredLevel: number }>;
    departmentId?: number;
    roleId?: number;
  }): Promise<SkillsGapAnalysis> {
    const currentProfile: Record<string, number> = {};
    const requiredProfile: Record<string, number> = {};
    const gaps: SkillsGapAnalysis['gaps'] = [];

    // Build profiles
    params.currentSkills.forEach(s => {
      currentProfile[s.skillName] = s.level;
    });
    params.requiredSkills.forEach(s => {
      requiredProfile[s.skillName] = s.requiredLevel;
    });

    // Analyze gaps
    params.requiredSkills.forEach(required => {
      const current = currentProfile[required.skillName] || 0;
      const gap = required.requiredLevel - current;

      if (gap > 0) {
        let priority: 'low' | 'medium' | 'high' | 'critical';
        if (gap <= 1) priority = 'low';
        else if (gap <= 2) priority = 'medium';
        else if (gap <= 3) priority = 'high';
        else priority = 'critical';

        const trainingRecommendations: string[] = [];
        if (gap >= 2) {
          trainingRecommendations.push(`Enroll in ${required.skillName} fundamentals course`);
        }
        if (gap >= 1) {
          trainingRecommendations.push(`Practice ${required.skillName} through projects`);
          trainingRecommendations.push(`Seek mentorship from ${required.skillName} experts`);
        }

        gaps.push({
          skill: required.skillName,
          currentLevel: current,
          requiredLevel: required.requiredLevel,
          gap,
          priority,
          trainingRecommendations,
        });
      }
    });

    // Sort by priority
    gaps.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Calculate overall readiness
    const totalRequired = params.requiredSkills.reduce((sum, s) => sum + s.requiredLevel, 0);
    const totalCurrent = params.requiredSkills.reduce((sum, s) => sum + (currentProfile[s.skillName] || 0), 0);
    const overallReadiness = totalRequired > 0 ? Math.round((totalCurrent / totalRequired) * 100) : 100;

    return {
      departmentId: params.departmentId,
      roleId: params.roleId,
      currentSkillsProfile: currentProfile,
      requiredSkillsProfile: requiredProfile,
      gaps,
      overallReadiness,
    };
  }

  /**
   * Forecast workforce demand
   */
  async forecastWorkforceDemand(params: {
    scenarioId: number;
    scenarioType: 'growth' | 'restructuring' | 'reduction' | 'baseline';
    growthRate: number;
    timeframeMonths: number;
    departments: Array<{
      departmentId: number;
      departmentName: string;
      currentHeadcount: number;
      attritionRate: number;
    }>;
  }): Promise<WorkforceDemandForecast> {
    const departments: WorkforceDemandForecast['departments'] = [];
    let totalProjectedHires = 0;
    const recommendations: string[] = [];

    for (const dept of params.departments) {
      const attritionLoss = Math.round(dept.currentHeadcount * (dept.attritionRate / 100) * (params.timeframeMonths / 12));
      
      let growthFactor = 1;
      if (params.scenarioType === 'growth') {
        growthFactor = 1 + (params.growthRate / 100);
      } else if (params.scenarioType === 'reduction') {
        growthFactor = 1 - (params.growthRate / 100);
      }

      const projectedDemand = Math.round(dept.currentHeadcount * growthFactor);
      const netChange = projectedDemand - dept.currentHeadcount + attritionLoss;
      
      const surplus = netChange < 0 ? Math.abs(netChange) : 0;
      const deficit = netChange > 0 ? netChange : 0;

      if (deficit > 0) {
        totalProjectedHires += deficit;
      }

      departments.push({
        departmentId: dept.departmentId,
        departmentName: dept.departmentName,
        currentHeadcount: dept.currentHeadcount,
        projectedDemand,
        surplus,
        deficit,
        keyRoles: [], // Would be populated with actual role data
      });
    }

    // Generate recommendations
    if (params.scenarioType === 'growth') {
      recommendations.push('Start recruitment pipeline early for critical roles');
      recommendations.push('Consider internal promotions to fill leadership gaps');
      recommendations.push('Develop training programs for skill development');
    } else if (params.scenarioType === 'reduction') {
      recommendations.push('Identify redeployment opportunities for affected staff');
      recommendations.push('Offer voluntary separation packages');
      recommendations.push('Freeze non-critical hiring');
    }

    // Estimate cost (simplified)
    const avgHiringCost = 50000; // AED
    const estimatedCost = totalProjectedHires * avgHiringCost;

    return {
      scenarioId: params.scenarioId,
      timeframe: `${params.timeframeMonths} months`,
      departments,
      totalProjectedHires,
      estimatedCost,
      recommendations,
    };
  }

  /**
   * Assess engagement risk
   */
  async assessEngagementRisk(params: {
    scope: 'organization' | 'department' | 'team';
    scopeId?: number;
    engagementScores: Array<{ employeeId: number; score: number }>;
    surveyParticipationRate: number;
    recentTurnover: number;
    averageTenure: number;
  }): Promise<EngagementRiskAssessment> {
    const scores = params.engagementScores.map(e => e.score);
    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 50;

    const atRiskEmployees = params.engagementScores.filter(e => e.score < 50).length;
    const totalEmployees = params.engagementScores.length;

    // Determine risk level
    let riskLevel: EngagementRiskAssessment['riskLevel'];
    const atRiskPercentage = (atRiskEmployees / totalEmployees) * 100;
    
    if (atRiskPercentage < 10 && overallScore >= 70) {
      riskLevel = 'low';
    } else if (atRiskPercentage < 25 && overallScore >= 50) {
      riskLevel = 'medium';
    } else if (atRiskPercentage < 40) {
      riskLevel = 'high';
    } else {
      riskLevel = 'critical';
    }

    // Identify risk factors
    const riskFactors: EngagementRiskAssessment['riskFactors'] = [];

    if (params.surveyParticipationRate < 60) {
      riskFactors.push({
        factor: 'Low survey participation',
        severity: (100 - params.surveyParticipationRate) / 10,
        affectedPercentage: 100 - params.surveyParticipationRate,
      });
    }

    if (params.recentTurnover > 15) {
      riskFactors.push({
        factor: 'High turnover rate',
        severity: Math.min(10, params.recentTurnover / 2),
        affectedPercentage: params.recentTurnover,
      });
    }

    if (params.averageTenure < 2) {
      riskFactors.push({
        factor: 'Low average tenure',
        severity: 7,
        affectedPercentage: 40,
      });
    }

    if (atRiskPercentage > 20) {
      riskFactors.push({
        factor: 'High percentage of disengaged employees',
        severity: atRiskPercentage / 5,
        affectedPercentage: atRiskPercentage,
      });
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (overallScore < 60) {
      recommendations.push('Conduct focus groups to understand root causes of disengagement');
    }
    if (params.surveyParticipationRate < 70) {
      recommendations.push('Improve survey communication and encourage participation');
    }
    if (atRiskPercentage > 20) {
      recommendations.push('Implement targeted engagement programs for at-risk employees');
    }
    if (params.recentTurnover > 10) {
      recommendations.push('Conduct exit interviews and address common concerns');
    }

    return {
      scope: params.scope,
      scopeId: params.scopeId,
      overallEngagementScore: overallScore,
      riskLevel,
      atRiskEmployees,
      totalEmployees,
      riskFactors,
      trendAnalysis: {
        direction: overallScore >= 60 ? 'stable' : 'declining',
        changeRate: 0, // Would be calculated from historical data
      },
      recommendations,
    };
  }

  /**
   * Get AI-powered insights using LLM (when configured)
   */
  async getAIInsights(context: string, question: string): Promise<string> {
    if (!this.isAIAvailable()) {
      return 'AI insights are not available. Please configure OpenAI API key for enhanced analytics.';
    }

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analytics consultant providing insights for a talent management system.',
          },
          {
            role: 'user',
            content: `Context: ${context}\n\nQuestion: ${question}`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (typeof content === 'string') {
        return content;
      }
      return 'Unable to generate insights.';
    } catch (error) {
      console.error('[PredictiveAnalytics] AI insights error:', error);
      return 'Error generating AI insights. Please try again later.';
    }
  }
}

// Export singleton instance
export const predictiveAnalyticsService = new PredictiveAnalyticsService();
