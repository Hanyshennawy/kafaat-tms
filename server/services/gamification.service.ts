/**
 * Gamification Service
 * 
 * Provides gamification features including:
 * - Points system for engagement activities
 * - Badges and achievements
 * - Leaderboards
 * - Rewards tracking
 */

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'engagement' | 'performance' | 'leadership' | 'special';
  points: number;
  criteria: BadgeCriteria;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface BadgeCriteria {
  type: 'count' | 'streak' | 'score' | 'completion' | 'custom';
  metric: string;
  threshold: number;
  timeframe?: 'day' | 'week' | 'month' | 'year' | 'all_time';
}

interface UserBadge {
  badgeId: string;
  earnedAt: Date;
  progress?: number;
}

interface PointTransaction {
  id: string;
  userId: number;
  points: number;
  type: 'earned' | 'spent' | 'bonus' | 'penalty';
  reason: string;
  category: string;
  createdAt: Date;
}

interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  avatarUrl?: string;
  department?: string;
  points: number;
  badgeCount: number;
  streak?: number;
}

// Predefined badges for the platform
const PLATFORM_BADGES: Badge[] = [
  // Learning Badges
  {
    id: 'first-course',
    name: 'First Steps',
    description: 'Complete your first training course',
    icon: '🎓',
    category: 'learning',
    points: 50,
    criteria: { type: 'count', metric: 'courses_completed', threshold: 1 },
    rarity: 'common',
  },
  {
    id: 'course-master',
    name: 'Course Master',
    description: 'Complete 10 training courses',
    icon: '📚',
    category: 'learning',
    points: 200,
    criteria: { type: 'count', metric: 'courses_completed', threshold: 10 },
    rarity: 'rare',
  },
  {
    id: 'learning-streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    category: 'learning',
    points: 100,
    criteria: { type: 'streak', metric: 'learning_days', threshold: 7 },
    rarity: 'common',
  },
  {
    id: 'learning-streak-30',
    name: 'Month Master',
    description: 'Maintain a 30-day learning streak',
    icon: '⚡',
    category: 'learning',
    points: 500,
    criteria: { type: 'streak', metric: 'learning_days', threshold: 30 },
    rarity: 'epic',
  },
  {
    id: 'cpd-champion',
    name: 'CPD Champion',
    description: 'Earn 100 CPD hours',
    icon: '🏆',
    category: 'learning',
    points: 1000,
    criteria: { type: 'count', metric: 'cpd_hours', threshold: 100 },
    rarity: 'legendary',
  },

  // Engagement Badges
  {
    id: 'survey-responder',
    name: 'Voice Matters',
    description: 'Complete your first engagement survey',
    icon: '📝',
    category: 'engagement',
    points: 25,
    criteria: { type: 'count', metric: 'surveys_completed', threshold: 1 },
    rarity: 'common',
  },
  {
    id: 'feedback-giver',
    name: 'Feedback Champion',
    description: 'Provide feedback to 5 colleagues',
    icon: '💬',
    category: 'engagement',
    points: 75,
    criteria: { type: 'count', metric: 'feedback_given', threshold: 5 },
    rarity: 'common',
  },
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Participate in 10 team activities',
    icon: '🤝',
    category: 'engagement',
    points: 150,
    criteria: { type: 'count', metric: 'team_activities', threshold: 10 },
    rarity: 'rare',
  },

  // Performance Badges
  {
    id: 'goal-setter',
    name: 'Goal Setter',
    description: 'Set your first performance goal',
    icon: '🎯',
    category: 'performance',
    points: 30,
    criteria: { type: 'count', metric: 'goals_set', threshold: 1 },
    rarity: 'common',
  },
  {
    id: 'goal-achiever',
    name: 'Goal Achiever',
    description: 'Complete 5 performance goals',
    icon: '✅',
    category: 'performance',
    points: 200,
    criteria: { type: 'count', metric: 'goals_completed', threshold: 5 },
    rarity: 'rare',
  },
  {
    id: 'high-performer',
    name: 'High Performer',
    description: 'Achieve a performance rating of 4.5 or higher',
    icon: '⭐',
    category: 'performance',
    points: 300,
    criteria: { type: 'score', metric: 'performance_rating', threshold: 4.5 },
    rarity: 'epic',
  },

  // Leadership Badges
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Mentor 3 colleagues',
    icon: '🧑‍🏫',
    category: 'leadership',
    points: 250,
    criteria: { type: 'count', metric: 'mentees', threshold: 3 },
    rarity: 'rare',
  },
  {
    id: 'succession-ready',
    name: 'Succession Ready',
    description: 'Be identified as a high-potential successor',
    icon: '📈',
    category: 'leadership',
    points: 500,
    criteria: { type: 'custom', metric: 'succession_identified', threshold: 1 },
    rarity: 'epic',
  },

  // Special Badges
  {
    id: 'licensed-teacher',
    name: 'Licensed Professional',
    description: 'Obtain your teaching license',
    icon: '📜',
    category: 'special',
    points: 1000,
    criteria: { type: 'custom', metric: 'license_obtained', threshold: 1 },
    rarity: 'legendary',
  },
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'One of the first 1000 users on the platform',
    icon: '🚀',
    category: 'special',
    points: 500,
    criteria: { type: 'custom', metric: 'early_adopter', threshold: 1 },
    rarity: 'legendary',
  },
];

// Point values for different activities
const POINT_VALUES = {
  // Learning
  course_completed: 50,
  course_started: 10,
  assessment_passed: 30,
  cpd_hour: 10,
  learning_day: 5,

  // Engagement
  survey_completed: 25,
  feedback_given: 15,
  feedback_received: 5,
  team_activity: 20,
  event_attended: 30,

  // Performance
  goal_set: 10,
  goal_completed: 50,
  goal_milestone: 20,
  self_appraisal: 25,
  review_completed: 30,

  // Special
  license_obtained: 500,
  certification_earned: 200,
  promotion: 300,
  recognition_received: 50,
};

export class GamificationService {
  /**
   * Get all available badges
   */
  getAllBadges(): Badge[] {
    return PLATFORM_BADGES;
  }

  /**
   * Get badges by category
   */
  getBadgesByCategory(category: Badge['category']): Badge[] {
    return PLATFORM_BADGES.filter(b => b.category === category);
  }

  /**
   * Get a specific badge
   */
  getBadge(badgeId: string): Badge | undefined {
    return PLATFORM_BADGES.find(b => b.id === badgeId);
  }

  /**
   * Award points to a user
   */
  async awardPoints(params: {
    userId: number;
    activity: keyof typeof POINT_VALUES;
    multiplier?: number;
    reason?: string;
  }): Promise<PointTransaction> {
    const basePoints = POINT_VALUES[params.activity] || 0;
    const points = Math.round(basePoints * (params.multiplier || 1));

    const transaction: PointTransaction = {
      id: `pt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: params.userId,
      points,
      type: 'earned',
      reason: params.reason || `Earned for: ${params.activity}`,
      category: this.getCategoryForActivity(params.activity),
      createdAt: new Date(),
    };

    // TODO: Save to database
    console.log(`[Gamification] Awarded ${points} points to user ${params.userId} for ${params.activity}`);

    return transaction;
  }

  /**
   * Deduct points from a user
   */
  async deductPoints(params: {
    userId: number;
    points: number;
    reason: string;
  }): Promise<PointTransaction> {
    const transaction: PointTransaction = {
      id: `pt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: params.userId,
      points: -params.points,
      type: 'spent',
      reason: params.reason,
      category: 'rewards',
      createdAt: new Date(),
    };

    // TODO: Save to database
    console.log(`[Gamification] Deducted ${params.points} points from user ${params.userId}`);

    return transaction;
  }

  /**
   * Check if user earned any new badges based on their metrics
   */
  async checkBadgeEligibility(userId: number, metrics: Record<string, number>): Promise<Badge[]> {
    const earnedBadges: Badge[] = [];

    for (const badge of PLATFORM_BADGES) {
      const metricValue = metrics[badge.criteria.metric] || 0;
      
      if (badge.criteria.type === 'count' || badge.criteria.type === 'streak') {
        if (metricValue >= badge.criteria.threshold) {
          earnedBadges.push(badge);
        }
      } else if (badge.criteria.type === 'score') {
        if (metricValue >= badge.criteria.threshold) {
          earnedBadges.push(badge);
        }
      }
    }

    return earnedBadges;
  }

  /**
   * Award a badge to a user
   */
  async awardBadge(userId: number, badgeId: string): Promise<UserBadge | null> {
    const badge = this.getBadge(badgeId);
    if (!badge) return null;

    const userBadge: UserBadge = {
      badgeId,
      earnedAt: new Date(),
    };

    // Also award the badge points
    await this.awardPoints({
      userId,
      activity: 'recognition_received',
      multiplier: badge.points / POINT_VALUES.recognition_received,
      reason: `Earned badge: ${badge.name}`,
    });

    console.log(`[Gamification] User ${userId} earned badge: ${badge.name}`);

    return userBadge;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(params: {
    timeframe: 'week' | 'month' | 'year' | 'all_time';
    department?: string;
    limit?: number;
  }): Promise<LeaderboardEntry[]> {
    // TODO: Fetch from database with proper aggregation
    // For now, return demo data
    
    const demoLeaderboard: LeaderboardEntry[] = [
      {
        rank: 1,
        userId: 1,
        userName: 'Ahmed Al-Rashid',
        department: 'Education',
        points: 2500,
        badgeCount: 12,
        streak: 30,
      },
      {
        rank: 2,
        userId: 2,
        userName: 'Fatima Hassan',
        department: 'Information Technology',
        points: 2350,
        badgeCount: 10,
        streak: 25,
      },
      {
        rank: 3,
        userId: 3,
        userName: 'Mohammed Ali',
        department: 'Human Resources',
        points: 2100,
        badgeCount: 9,
        streak: 20,
      },
      {
        rank: 4,
        userId: 4,
        userName: 'Sara Ahmed',
        department: 'Education',
        points: 1900,
        badgeCount: 8,
        streak: 15,
      },
      {
        rank: 5,
        userId: 5,
        userName: 'Omar Khalid',
        department: 'Administration',
        points: 1750,
        badgeCount: 7,
        streak: 12,
      },
    ];

    const limit = params.limit || 10;
    return demoLeaderboard.slice(0, limit);
  }

  /**
   * Get user's gamification stats
   */
  async getUserStats(userId: number): Promise<{
    totalPoints: number;
    level: number;
    nextLevelPoints: number;
    badges: UserBadge[];
    rank: number;
    streak: number;
    recentActivity: PointTransaction[];
  }> {
    // TODO: Fetch from database
    // For now, return demo data
    
    const totalPoints = 1500;
    const level = this.calculateLevel(totalPoints);
    
    return {
      totalPoints,
      level,
      nextLevelPoints: this.getPointsForLevel(level + 1),
      badges: [
        { badgeId: 'first-course', earnedAt: new Date('2025-01-15') },
        { badgeId: 'survey-responder', earnedAt: new Date('2025-01-20') },
        { badgeId: 'goal-setter', earnedAt: new Date('2025-02-01') },
      ],
      rank: 15,
      streak: 7,
      recentActivity: [],
    };
  }

  /**
   * Calculate level based on points
   */
  private calculateLevel(points: number): number {
    // Level progression: 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500...
    // Each level requires more points than the previous
    let level = 1;
    let required = 100;
    let remaining = points;

    while (remaining >= required) {
      remaining -= required;
      level++;
      required = level * 100;
    }

    return level;
  }

  /**
   * Get points required for a specific level
   */
  private getPointsForLevel(level: number): number {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += i * 100;
    }
    return total;
  }

  /**
   * Get category for an activity
   */
  private getCategoryForActivity(activity: string): string {
    if (activity.includes('course') || activity.includes('learning') || activity.includes('cpd') || activity.includes('assessment')) {
      return 'learning';
    }
    if (activity.includes('survey') || activity.includes('feedback') || activity.includes('team') || activity.includes('event')) {
      return 'engagement';
    }
    if (activity.includes('goal') || activity.includes('appraisal') || activity.includes('review')) {
      return 'performance';
    }
    return 'special';
  }

  /**
   * Get point values for all activities (for admin configuration)
   */
  getPointValues(): typeof POINT_VALUES {
    return { ...POINT_VALUES };
  }
}

// Export singleton instance
export const gamificationService = new GamificationService();
