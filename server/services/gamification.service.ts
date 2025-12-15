/**
 * Gamification Service
 * 
 * Re-exports the database-backed gamification service.
 * This file is kept for backward compatibility.
 * 
 * All gamification data is now stored in PostgreSQL:
 * - gamification_badges - Badge definitions
 * - gamification_user_badges - User earned badges
 * - gamification_points - Point transactions
 * - gamification_leaderboard - Leaderboard cache
 * - gamification_user_stats - User stats cache
 */

export { 
  gamificationService, 
  GamificationService 
} from './gamification-db.service';
