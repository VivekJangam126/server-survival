/**
 * Leaderboard Service
 * 
 * Service layer for leaderboard backend operations.
 * Handles Supabase communication for fetching MCQ attempts.
 * 
 * @module leaderboardService
 */

import { getSupabase, isConfigured } from './supabaseClient.js';
import authService from './authService.js';

/**
 * Leaderboard Service
 * Isolates all Supabase calls for leaderboard data
 */
const leaderboardService = {
    /**
     * Get the current authenticated user's ID
     * @returns {Promise<string|null>} User ID or null if not authenticated
     */
    async getCurrentUserId() {
        try {
            const { user } = await authService.getCurrentUser();
            return user?.id || null;
        } catch (error) {
            console.warn('leaderboardService: Failed to get current user', error);
            return null;
        }
    },

    /**
     * Get all MCQ attempts for the current user
     * Note: Due to RLS, we can only fetch the current user's attempts
     * Global leaderboard will be implemented in Phase 3 with a view or service role
     * 
     * @returns {Promise<{data: Array|null, error: Error|null}>}
     */
    async getAllMcqAttempts() {
        try {
            if (!isConfigured()) {
                return { data: null, error: new Error('Supabase not configured') };
            }

            const userId = await this.getCurrentUserId();
            if (!userId) {
                return { data: null, error: new Error('User not authenticated') };
            }

            const supabase = await getSupabase();
            
            // Due to RLS, this will only return current user's attempts
            // For MVP, leaderboard shows user's own attempts
            const { data, error } = await supabase
                .from('mcq_attempts')
                .select('user_id, challenge_id, score, percentage, time_taken, completed_at')
                .order('completed_at', { ascending: false });

            if (error) {
                throw error;
            }

            // Map database fields to frontend expected shape
            const mappedData = data.map(row => ({
                user_id: row.user_id,
                mcq_challenge_id: row.challenge_id, // Map challenge_id → mcq_challenge_id
                score: row.score,
                percentage: row.percentage,
                time_taken: row.time_taken,
                completed_at: new Date(row.completed_at).getTime() // Convert to timestamp
            }));

            return { data: mappedData, error: null };
        } catch (error) {
            console.error('leaderboardService: Failed to get MCQ attempts', error);
            return { data: null, error };
        }
    },

    /**
     * Get MCQ attempts for a specific challenge (current user only due to RLS)
     * @param {string} challengeId - Challenge ID
     * @returns {Promise<{data: Array|null, error: Error|null}>}
     */
    async getAttemptsByChallenge(challengeId) {
        try {
            if (!isConfigured()) {
                return { data: null, error: new Error('Supabase not configured') };
            }

            if (!challengeId) {
                return { data: null, error: new Error('Challenge ID required') };
            }

            const userId = await this.getCurrentUserId();
            if (!userId) {
                return { data: null, error: new Error('User not authenticated') };
            }

            const supabase = await getSupabase();
            
            const { data, error } = await supabase
                .from('mcq_attempts')
                .select('user_id, challenge_id, score, percentage, time_taken, completed_at')
                .eq('challenge_id', challengeId)
                .order('completed_at', { ascending: false });

            if (error) {
                throw error;
            }

            // Map database fields to frontend expected shape
            const mappedData = data.map(row => ({
                user_id: row.user_id,
                mcq_challenge_id: row.challenge_id,
                score: row.score,
                percentage: row.percentage,
                time_taken: row.time_taken,
                completed_at: new Date(row.completed_at).getTime()
            }));

            return { data: mappedData, error: null };
        } catch (error) {
            console.error('leaderboardService: Failed to get attempts by challenge', error);
            return { data: null, error };
        }
    }
};

export default leaderboardService;

// Named exports for convenience
export const {
    getCurrentUserId,
    getAllMcqAttempts,
    getAttemptsByChallenge
} = leaderboardService;
