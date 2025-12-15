/**
 * Gamification Service (Database-Backed)
 * 
 * Provides gamification features with real database storage:
 * - Points system for engagement activities
 * - Badges and achievements (persisted)
 * - Leaderboards (real-time from DB)
 * - Rewards tracking
 */

import { getDb } from "../db";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import {
  gamificationBadges,
  gamificationUserBadges,
  gamificationPoints,
  gamificationLeaderboard,
  gamificationUserStats,
  users,
  departments,
} from "../../drizzle/schema-pg";

// ============================================================================
// TYPES
// ============================================================================

interface Badge {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  category: 'learning' | 'engagement' | 'performance' | 'leadership' | 'special';
  points: number;
  criteria: {
    type: 'count' | 'streak' | 'score' | 'completion' | 'custom';
    metric: string;
    threshold: number;
    timeframe?: 'day' | 'week' | 'month' | 'year' | 'all_time';
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserBadge {
  badgeId: number;
  earnedAt: Date;
  progress?: number;
}

interface PointTransaction {
  id: number;
  userId: number;
  points: number;
  type: 'earned' | 'spent' | 'bonus' | 'penalty';
  reason: string | null;
  category: string | null;
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

interface UserGamificationStats {
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  badges: UserBadge[];
  rank: number;
  streak: number;
  recentActivity: PointTransaction[];
}

// ============================================================================
// POINT VALUES
// ============================================================================

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

// ============================================================================
// DEFAULT BADGES (seeded on first use)
// ============================================================================

const DEFAULT_BADGES = [
  {
    name: 'First Steps',
    description: 'Complete your first training course',
    icon: '🎓',
    category: 'learning' as const,
    points: 50,
    criteriaType: 'count',
    criteriaMetric: 'courses_completed',
    criteriaThreshold: 1,
    rarity: 'common' as const,
  },
  {
    name: 'Course Master',
    description: 'Complete 10 training courses',
    icon: '📚',
    category: 'learning' as const,
    points: 200,
    criteriaType: 'count',
    criteriaMetric: 'courses_completed',
    criteriaThreshold: 10,
    rarity: 'rare' as const,
  },
  {
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    category: 'learning' as const,
    points: 100,
    criteriaType: 'streak',
    criteriaMetric: 'learning_days',
    criteriaThreshold: 7,
    rarity: 'common' as const,
  },
  {
    name: 'Voice Matters',
    description: 'Complete your first engagement survey',
    icon: '📝',
    category: 'engagement' as const,
    points: 25,
    criteriaType: 'count',
    criteriaMetric: 'surveys_completed',
    criteriaThreshold: 1,
    rarity: 'common' as const,
  },
  {
    name: 'Goal Setter',
    description: 'Set your first performance goal',
    icon: '🎯',
    category: 'performance' as const,
    points: 30,
    criteriaType: 'count',
    criteriaMetric: 'goals_set',
    criteriaThreshold: 1,
    rarity: 'common' as const,
  },
  {
    name: 'Goal Achiever',
    description: 'Complete 5 performance goals',
    icon: '✅',
    category: 'performance' as const,
    points: 200,
    criteriaType: 'count',
    criteriaMetric: 'goals_completed',
    criteriaThreshold: 5,
    rarity: 'rare' as const,
  },
  {
    name: 'Mentor',
    description: 'Mentor 3 colleagues',
    icon: '🧑‍🏫',
    category: 'leadership' as const,
    points: 250,
    criteriaType: 'count',
    criteriaMetric: 'mentees',
    criteriaThreshold: 3,
    rarity: 'rare' as const,
  },
  {
    name: 'Licensed Professional',
    description: 'Obtain your teaching license',
    icon: '📜',
    category: 'special' as const,
    points: 1000,
    criteriaType: 'custom',
    criteriaMetric: 'license_obtained',
    criteriaThreshold: 1,
    rarity: 'legendary' as const,
  },
];

// ============================================================================
// GAMIFICATION SERVICE
// ============================================================================

export class GamificationService {
  private badgesSeeded = false;

  /**
   * Ensure default badges are in the database
   */
  private async ensureBadgesSeeded(): Promise<void> {
    if (this.badgesSeeded) return;

    const db = await getDb();
    if (!db) return;

    try {
      const existingBadges = await db.select().from(gamificationBadges).limit(1);
      
      if (existingBadges.length === 0) {
        console.log('[Gamification] Seeding default badges...');
        for (const badge of DEFAULT_BADGES) {
          await db.insert(gamificationBadges).values(badge);
        }
        console.log('[Gamification] Default badges seeded');
      }
      
      this.badgesSeeded = true;
    } catch (error) {
      console.error('[Gamification] Error seeding badges:', error);
    }
  }

  /**
   * Get all available badges from database
   */
  async getAllBadges(): Promise<Badge[]> {
    await this.ensureBadgesSeeded();

    const db = await getDb();
    if (!db) return [];

    try {
      const badges = await db.select().from(gamificationBadges).where(eq(gamificationBadges.isActive, true));
      
      return badges.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        icon: b.icon,
        category: b.category,
        points: b.points,
        criteria: {
          type: b.criteriaType as any,
          metric: b.criteriaMetric,
          threshold: b.criteriaThreshold,
          timeframe: b.criteriaTimeframe as any,
        },
        rarity: b.rarity,
      }));
    } catch (error) {
      console.error('[Gamification] Error fetching badges:', error);
      return [];
    }
  }

  /**
   * Get badges by category
   */
  async getBadgesByCategory(category: Badge['category']): Promise<Badge[]> {
    const allBadges = await this.getAllBadges();
    return allBadges.filter(b => b.category === category);
  }

  /**
   * Get a specific badge
   */
  async getBadge(badgeId: number): Promise<Badge | null> {
    const badges = await this.getAllBadges();
    return badges.find(b => b.id === badgeId) || null;
  }

  /**
   * Award points to a user
   */
  async awardPoints(params: {
    userId: number;
    activity: keyof typeof POINT_VALUES;
    multiplier?: number;
    reason?: string;
    referenceType?: string;
    referenceId?: number;
  }): Promise<PointTransaction | null> {
    const db = await getDb();
    if (!db) return null;

    const basePoints = POINT_VALUES[params.activity] || 0;
    const points = Math.round(basePoints * (params.multiplier || 1));
    const category = this.getCategoryForActivity(params.activity);

    try {
      const [transaction] = await db.insert(gamificationPoints).values({
        userId: params.userId,
        points,
        type: 'earned',
        reason: params.reason || `Earned for: ${params.activity}`,
        category,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
      }).returning();

      // Update user stats
      await this.updateUserStats(params.userId);

      console.log(`[Gamification] Awarded ${points} points to user ${params.userId} for ${params.activity}`);

      return {
        id: transaction.id,
        userId: transaction.userId,
        points: transaction.points,
        type: transaction.type,
        reason: transaction.reason,
        category: transaction.category,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      console.error('[Gamification] Error awarding points:', error);
      return null;
    }
  }

  /**
   * Deduct points from a user
   */
  async deductPoints(params: {
    userId: number;
    points: number;
    reason: string;
  }): Promise<PointTransaction | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const [transaction] = await db.insert(gamificationPoints).values({
        userId: params.userId,
        points: -params.points,
        type: 'spent',
        reason: params.reason,
        category: 'rewards',
      }).returning();

      // Update user stats
      await this.updateUserStats(params.userId);

      console.log(`[Gamification] Deducted ${params.points} points from user ${params.userId}`);

      return {
        id: transaction.id,
        userId: transaction.userId,
        points: transaction.points,
        type: transaction.type,
        reason: transaction.reason,
        category: transaction.category,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      console.error('[Gamification] Error deducting points:', error);
      return null;
    }
  }

  /**
   * Award a badge to a user
   */
  async awardBadge(userId: number, badgeId: number): Promise<UserBadge | null> {
    const db = await getDb();
    if (!db) return null;

    const badge = await this.getBadge(badgeId);
    if (!badge) return null;

    try {
      // Check if already earned
      const existing = await db.select()
        .from(gamificationUserBadges)
        .where(and(
          eq(gamificationUserBadges.userId, userId),
          eq(gamificationUserBadges.badgeId, badgeId)
        ))
        .limit(1);

      if (existing.length > 0) {
        return { badgeId, earnedAt: existing[0].earnedAt, progress: existing[0].progress || undefined };
      }

      // Award the badge
      const [userBadge] = await db.insert(gamificationUserBadges).values({
        userId,
        badgeId,
      }).returning();

      // Also award the badge points
      await this.awardPoints({
        userId,
        activity: 'recognition_received',
        multiplier: badge.points / POINT_VALUES.recognition_received,
        reason: `Earned badge: ${badge.name}`,
      });

      console.log(`[Gamification] User ${userId} earned badge: ${badge.name}`);

      return {
        badgeId: userBadge.badgeId,
        earnedAt: userBadge.earnedAt,
        progress: userBadge.progress || undefined,
      };
    } catch (error) {
      console.error('[Gamification] Error awarding badge:', error);
      return null;
    }
  }

  /**
   * Get leaderboard from database
   */
  async getLeaderboard(params: {
    timeframe: 'week' | 'month' | 'year' | 'all_time';
    department?: string;
    limit?: number;
  }): Promise<LeaderboardEntry[]> {
    const db = await getDb();
    if (!db) return [];

    const limit = params.limit || 10;

    try {
      // Calculate start date based on timeframe
      let startDate: Date | null = null;
      const now = new Date();
      
      switch (params.timeframe) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }

      // Get aggregated points per user
      const pointsQuery = startDate
        ? db.select({
            userId: gamificationPoints.userId,
            totalPoints: sql<number>`SUM(${gamificationPoints.points})`.as('totalPoints'),
          })
          .from(gamificationPoints)
          .where(gte(gamificationPoints.createdAt, startDate))
          .groupBy(gamificationPoints.userId)
          .orderBy(desc(sql`SUM(${gamificationPoints.points})`))
          .limit(limit)
        : db.select({
            userId: gamificationUserStats.userId,
            totalPoints: gamificationUserStats.totalPoints,
          })
          .from(gamificationUserStats)
          .orderBy(desc(gamificationUserStats.totalPoints))
          .limit(limit);

      const pointsData = await pointsQuery;

      // Get user details and badge counts
      const leaderboard: LeaderboardEntry[] = [];
      let rank = 1;

      for (const entry of pointsData) {
        // Get user info
        const [user] = await db.select({
          name: users.name,
          departmentId: users.departmentId,
        })
          .from(users)
          .where(eq(users.id, entry.userId))
          .limit(1);

        // Get badge count
        const [badgeCount] = await db.select({
          count: sql<number>`COUNT(*)`.as('count'),
        })
          .from(gamificationUserBadges)
          .where(eq(gamificationUserBadges.userId, entry.userId));

        // Get department name
        let departmentName: string | undefined;
        if (user?.departmentId) {
          const [dept] = await db.select({ name: departments.name })
            .from(departments)
            .where(eq(departments.id, user.departmentId))
            .limit(1);
          departmentName = dept?.name;
        }

        // Get streak from stats
        const [stats] = await db.select({ streak: gamificationUserStats.currentStreak })
          .from(gamificationUserStats)
          .where(eq(gamificationUserStats.userId, entry.userId))
          .limit(1);

        leaderboard.push({
          rank: rank++,
          userId: entry.userId,
          userName: user?.name || 'Unknown User',
          department: departmentName,
          points: Number(entry.totalPoints) || 0,
          badgeCount: Number(badgeCount?.count) || 0,
          streak: stats?.streak || 0,
        });
      }

      return leaderboard;
    } catch (error) {
      console.error('[Gamification] Error fetching leaderboard:', error);
      return [];
    }
  }

  /**
   * Get user's gamification stats
   */
  async getUserStats(userId: number): Promise<UserGamificationStats> {
    const db = await getDb();
    
    // Default stats if DB not available
    const defaultStats: UserGamificationStats = {
      totalPoints: 0,
      level: 1,
      nextLevelPoints: 100,
      badges: [],
      rank: 0,
      streak: 0,
      recentActivity: [],
    };

    if (!db) return defaultStats;

    try {
      // Get or create user stats
      let [stats] = await db.select()
        .from(gamificationUserStats)
        .where(eq(gamificationUserStats.userId, userId))
        .limit(1);

      if (!stats) {
        // Create initial stats
        [stats] = await db.insert(gamificationUserStats).values({
          userId,
          totalPoints: 0,
          level: 1,
        }).returning();
      }

      // Get user badges
      const userBadges = await db.select()
        .from(gamificationUserBadges)
        .where(eq(gamificationUserBadges.userId, userId));

      // Get recent activity
      const recentPoints = await db.select()
        .from(gamificationPoints)
        .where(eq(gamificationPoints.userId, userId))
        .orderBy(desc(gamificationPoints.createdAt))
        .limit(10);

      // Calculate rank
      const [rankResult] = await db.select({
        rank: sql<number>`(SELECT COUNT(*) + 1 FROM gamification_user_stats WHERE total_points > ${stats.totalPoints})`.as('rank'),
      }).from(gamificationUserStats).limit(1);

      return {
        totalPoints: stats.totalPoints,
        level: stats.level,
        nextLevelPoints: this.getPointsForLevel(stats.level + 1),
        badges: userBadges.map(ub => ({
          badgeId: ub.badgeId,
          earnedAt: ub.earnedAt,
          progress: ub.progress || undefined,
        })),
        rank: Number(rankResult?.rank) || 1,
        streak: stats.currentStreak,
        recentActivity: recentPoints.map(p => ({
          id: p.id,
          userId: p.userId,
          points: p.points,
          type: p.type,
          reason: p.reason,
          category: p.category,
          createdAt: p.createdAt,
        })),
      };
    } catch (error) {
      console.error('[Gamification] Error fetching user stats:', error);
      return defaultStats;
    }
  }

  /**
   * Update user stats (called after point changes)
   */
  private async updateUserStats(userId: number): Promise<void> {
    const db = await getDb();
    if (!db) return;

    try {
      // Calculate total points
      const [pointsResult] = await db.select({
        total: sql<number>`COALESCE(SUM(${gamificationPoints.points}), 0)`.as('total'),
      })
        .from(gamificationPoints)
        .where(eq(gamificationPoints.userId, userId));

      const totalPoints = Number(pointsResult?.total) || 0;
      const level = this.calculateLevel(totalPoints);

      // Get badge count
      const [badgeResult] = await db.select({
        count: sql<number>`COUNT(*)`.as('count'),
      })
        .from(gamificationUserBadges)
        .where(eq(gamificationUserBadges.userId, userId));

      const badgeCount = Number(badgeResult?.count) || 0;

      // Upsert user stats
      await db.insert(gamificationUserStats)
        .values({
          userId,
          totalPoints,
          level,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: gamificationUserStats.userId,
          set: {
            totalPoints,
            level,
            updatedAt: new Date(),
          },
        });

      // Update leaderboard entry
      await db.insert(gamificationLeaderboard)
        .values({
          userId,
          totalPoints,
          badgeCount,
          level,
          timeframe: 'all_time',
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: gamificationLeaderboard.userId,
          set: {
            totalPoints,
            badgeCount,
            level,
            updatedAt: new Date(),
          },
        });
    } catch (error) {
      console.error('[Gamification] Error updating user stats:', error);
    }
  }

  /**
   * Calculate level based on points
   */
  private calculateLevel(points: number): number {
    // Level progression: 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500...
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
    if (['course_completed', 'course_started', 'assessment_passed', 'cpd_hour', 'learning_day'].includes(activity)) {
      return 'learning';
    }
    if (['survey_completed', 'feedback_given', 'feedback_received', 'team_activity', 'event_attended'].includes(activity)) {
      return 'engagement';
    }
    if (['goal_set', 'goal_completed', 'goal_milestone', 'self_appraisal', 'review_completed'].includes(activity)) {
      return 'performance';
    }
    return 'special';
  }

  /**
   * Check badge eligibility and award earned badges
   */
  async checkAndAwardBadges(userId: number, metrics: Record<string, number>): Promise<Badge[]> {
    const earnedBadges: Badge[] = [];
    const allBadges = await this.getAllBadges();

    for (const badge of allBadges) {
      const metricValue = metrics[badge.criteria.metric] || 0;

      let eligible = false;
      if (badge.criteria.type === 'count' || badge.criteria.type === 'streak') {
        eligible = metricValue >= badge.criteria.threshold;
      } else if (badge.criteria.type === 'score') {
        eligible = metricValue >= badge.criteria.threshold;
      }

      if (eligible) {
        const awarded = await this.awardBadge(userId, badge.id);
        if (awarded) {
          earnedBadges.push(badge);
        }
      }
    }

    return earnedBadges;
  }
}

// Export singleton
export const gamificationService = new GamificationService();
