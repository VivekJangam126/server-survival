/**
 * Game Session Service
 * 
 * Service layer for persisting game sessions to Supabase.
 * Handles write operations for Play and Sandbox mode sessions.
 * 
 * @module gameSessionService
 */

import { getSupabase, isConfigured } from './supabaseClient.js';
import authService from './authService.js';

/**
 * Game Session Service
 * Isolates all Supabase calls for game session data
 */
const gameSessionService = {
    /**
     * Get the current authenticated user's ID
     * @returns {Promise<string|null>} User ID or null if not authenticated
     */
    async getCurrentUserId() {
        try {
            const { user } = await authService.getCurrentUser();
            return user?.id || null;
        } catch (error) {
            // Silently fail - user is not authenticated
            return null;
        }
    },

    /**
     * Save a game session to Supabase
     * @param {Object} session - Session data from SessionTracker
     * @returns {Promise<{success: boolean, error: Error|null}>}
     */
    async saveSession(session) {
        try {
            // Check if Supabase is configured
            if (!isConfigured()) {
                return { success: false, error: null };
            }

            // Get current user - if not authenticated, silently fail
            const userId = await this.getCurrentUserId();
            if (!userId) {
                return { success: false, error: null };
            }

            const supabase = await getSupabase();

            // Map frontend session to database schema
            const dbRow = {
                user_id: userId,
                mode: session.mode, // 'PLAY' | 'SANDBOX'
                final_score: session.finalScore || 0,
                duration: session.durationMinutes || 0, // in minutes
                failures: session.failures || 0,
                budget_used: session.budgetUsed || 0,
                result: this._mapResult(session.result) // 'COMPLETED' | 'FAILED' | 'ABANDONED'
            };

            const { error } = await supabase
                .from('game_sessions')
                .insert(dbRow);

            if (error) {
                // Silently fail - don't throw, just return failure
                return { success: false, error };
            }

            return { success: true, error: null };
        } catch (error) {
            // Silently fail - don't throw
            return { success: false, error };
        }
    },

    /**
     * Get all game sessions for the current user
     * @returns {Promise<{data: Array|null, error: Error|null}>}
     */
    async getSessions(userId = null) {
        try {
            if (!isConfigured()) {
                return { data: null, error: null };
            }

            // If no userId provided, get current user
            const targetUserId = userId || await this.getCurrentUserId();
            if (!targetUserId) {
                return { data: null, error: null };
            }

            const supabase = await getSupabase();

            // Due to RLS, this will only return current user's sessions
            const { data, error } = await supabase
                .from('game_sessions')
                .select('*')
                .eq('user_id', targetUserId)
                .order('created_at', { ascending: false });

            if (error) {
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Map frontend result to database result
     * Database accepts: 'COMPLETED' | 'FAILED' | 'ABANDONED'
     * Frontend sends: 'COMPLETED' | 'FAILED' | 'EXITED'
     * @param {string} result - Frontend result string
     * @returns {string} Database-compatible result string
     */
    _mapResult(result) {
        const resultMap = {
            'COMPLETED': 'COMPLETED',
            'FAILED': 'FAILED',
            'EXITED': 'ABANDONED' // Map EXITED to ABANDONED for DB
        };
        return resultMap[result] || 'ABANDONED';
    }
};

export default gameSessionService;
