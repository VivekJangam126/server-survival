/**
 * MCQ Service
 * 
 * Service layer for MCQ attempt backend operations.
 * Handles Supabase communication for MCQ attempts.
 * 
 * @module mcqService
 */

import { getSupabase, isConfigured } from './supabaseClient.js';
import authService from './authService.js';

/**
 * MCQ Service
 * Isolates all Supabase calls for MCQ attempts
 */
const mcqService = {
    /**
     * Get the current authenticated user's ID
     * @returns {Promise<string|null>} User ID or null if not authenticated
     */
    async getCurrentUserId() {
        try {
            const { user } = await authService.getCurrentUser();
            return user?.id || null;
        } catch (error) {
            console.warn('mcqService: Failed to get current user', error);
            return null;
        }
    },

    /**
     * Save an MCQ attempt to Supabase
     * @param {Object} attempt - The attempt object to save
     * @returns {Promise<{success: boolean, error: Error|null}>}
     */
    async saveAttempt(attempt) {
        try {
            if (!isConfigured()) {
                return { success: false, error: new Error('Supabase not configured') };
            }

            const userId = await this.getCurrentUserId();
            if (!userId) {
                return { success: false, error: new Error('User not authenticated') };
            }

            const supabase = await getSupabase();
            
            // Map frontend attempt shape to database shape
            const dbAttempt = {
                user_id: userId,
                challenge_id: attempt.mcq_challenge_id || attempt.challenge_id,
                score: attempt.score,
                percentage: Math.round(attempt.percentage),
                time_taken: attempt.time_taken,
                completed_at: new Date(attempt.completed_at).toISOString()
            };

            const { error } = await supabase
                .from('mcq_attempts')
                .insert(dbAttempt);

            if (error) {
                throw error;
            }

            console.log('mcqService: Attempt saved to Supabase');
            return { success: true, error: null };
        } catch (error) {
            console.error('mcqService: Failed to save attempt', error);
            return { success: false, error };
        }
    },

    /**
     * Get all MCQ attempts for a user
     * @param {string} userId - User ID
     * @returns {Promise<{data: Array|null, error: Error|null}>}
     */
    async getAttempts(userId) {
        try {
            if (!isConfigured()) {
                return { data: null, error: new Error('Supabase not configured') };
            }

            if (!userId) {
                return { data: null, error: new Error('User ID required') };
            }

            const supabase = await getSupabase();
            const { data, error } = await supabase
                .from('mcq_attempts')
                .select('*')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false });

            if (error) {
                throw error;
            }

            return { data, error: null };
        } catch (error) {
            console.error('mcqService: Failed to get attempts', error);
            return { data: null, error };
        }
    },

    /**
     * Get attempts for a specific challenge
     * @param {string} userId - User ID
     * @param {string} challengeId - Challenge ID
     * @returns {Promise<{data: Array|null, error: Error|null}>}
     */
    async getAttemptsByChallenge(userId, challengeId) {
        try {
            if (!isConfigured()) {
                return { data: null, error: new Error('Supabase not configured') };
            }

            if (!userId || !challengeId) {
                return { data: null, error: new Error('User ID and Challenge ID required') };
            }

            const supabase = await getSupabase();
            const { data, error } = await supabase
                .from('mcq_attempts')
                .select('*')
                .eq('user_id', userId)
                .eq('challenge_id', challengeId)
                .order('completed_at', { ascending: false });

            if (error) {
                throw error;
            }

            return { data, error: null };
        } catch (error) {
            console.error('mcqService: Failed to get attempts by challenge', error);
            return { data: null, error };
        }
    },

    /**
     * Get the best attempt for a user and challenge
     * @param {string} userId - User ID
     * @param {string} challengeId - Challenge ID
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async getBestAttempt(userId, challengeId) {
        try {
            if (!isConfigured()) {
                return { data: null, error: new Error('Supabase not configured') };
            }

            if (!userId || !challengeId) {
                return { data: null, error: new Error('User ID and Challenge ID required') };
            }

            const supabase = await getSupabase();
            const { data, error } = await supabase
                .from('mcq_attempts')
                .select('*')
                .eq('user_id', userId)
                .eq('challenge_id', challengeId)
                .order('percentage', { ascending: false })
                .order('time_taken', { ascending: true })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error;
            }

            return { data: data || null, error: null };
        } catch (error) {
            console.error('mcqService: Failed to get best attempt', error);
            return { data: null, error };
        }
    }
};

export default mcqService;

// Named exports for convenience
export const {
    getCurrentUserId,
    saveAttempt,
    getAttempts,
    getAttemptsByChallenge,
    getBestAttempt
} = mcqService;
