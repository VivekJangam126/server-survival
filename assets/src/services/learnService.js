/**
 * Learn Service
 * 
 * Service layer for Learn Mode backend operations.
 * Handles Supabase communication for tutorial progress.
 * 
 * @module learnService
 */

import { getSupabase, isConfigured } from './supabaseClient.js';
import authService from './authService.js';

/**
 * Learn Service
 * Isolates all Supabase calls for tutorial progress
 */
const learnService = {
    /**
     * Get the current authenticated user's ID
     * @returns {Promise<string|null>} User ID or null if not authenticated
     */
    async getCurrentUserId() {
        try {
            const { user } = await authService.getCurrentUser();
            return user?.id || null;
        } catch (error) {
            console.warn('learnService: Failed to get current user', error);
            return null;
        }
    },

    /**
     * Get tutorial progress for a user
     * @param {string} userId - User ID
     * @returns {Promise<{data: Array|null, error: Error|null}>}
     */
    async getProgress(userId) {
        try {
            if (!isConfigured()) {
                return { data: null, error: new Error('Supabase not configured') };
            }

            if (!userId) {
                return { data: null, error: new Error('User ID required') };
            }

            const supabase = await getSupabase();
            const { data, error } = await supabase
                .from('tutorial_progress')
                .select('tutorial_id, status, completed_at')
                .eq('user_id', userId);

            if (error) {
                throw error;
            }

            return { data, error: null };
        } catch (error) {
            console.error('learnService: Failed to get progress', error);
            return { data: null, error };
        }
    },

    /**
     * Mark a tutorial as completed
     * @param {string} userId - User ID
     * @param {string} tutorialId - Tutorial ID
     * @returns {Promise<{success: boolean, error: Error|null}>}
     */
    async markCompleted(userId, tutorialId) {
        try {
            if (!isConfigured()) {
                return { success: false, error: new Error('Supabase not configured') };
            }

            if (!userId || !tutorialId) {
                return { success: false, error: new Error('User ID and Tutorial ID required') };
            }

            const supabase = await getSupabase();
            
            // Upsert - insert or update if exists
            const { error } = await supabase
                .from('tutorial_progress')
                .upsert({
                    user_id: userId,
                    tutorial_id: tutorialId,
                    status: 'completed',
                    completed_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,tutorial_id'
                });

            if (error) {
                throw error;
            }

            return { success: true, error: null };
        } catch (error) {
            console.error('learnService: Failed to mark completed', error);
            return { success: false, error };
        }
    },

    /**
     * Save tutorial unlock status
     * @param {string} userId - User ID
     * @param {string} tutorialId - Tutorial ID
     * @param {string} status - Status ('locked', 'available', 'completed')
     * @returns {Promise<{success: boolean, error: Error|null}>}
     */
    async saveProgress(userId, tutorialId, status) {
        try {
            if (!isConfigured()) {
                return { success: false, error: new Error('Supabase not configured') };
            }

            if (!userId || !tutorialId) {
                return { success: false, error: new Error('User ID and Tutorial ID required') };
            }

            const supabase = await getSupabase();
            
            const progressData = {
                user_id: userId,
                tutorial_id: tutorialId,
                status: status,
                completed_at: status === 'completed' ? new Date().toISOString() : null
            };

            const { error } = await supabase
                .from('tutorial_progress')
                .upsert(progressData, {
                    onConflict: 'user_id,tutorial_id'
                });

            if (error) {
                throw error;
            }

            return { success: true, error: null };
        } catch (error) {
            console.error('learnService: Failed to save progress', error);
            return { success: false, error };
        }
    },

    /**
     * Batch save multiple tutorial progress entries
     * @param {string} userId - User ID
     * @param {Array<{tutorialId: string, status: string}>} progressList - List of progress entries
     * @returns {Promise<{success: boolean, error: Error|null}>}
     */
    async batchSaveProgress(userId, progressList) {
        try {
            if (!isConfigured()) {
                return { success: false, error: new Error('Supabase not configured') };
            }

            if (!userId || !progressList?.length) {
                return { success: false, error: new Error('User ID and progress list required') };
            }

            const supabase = await getSupabase();
            
            const records = progressList.map(item => ({
                user_id: userId,
                tutorial_id: item.tutorialId,
                status: item.status,
                completed_at: item.status === 'completed' ? new Date().toISOString() : null
            }));

            const { error } = await supabase
                .from('tutorial_progress')
                .upsert(records, {
                    onConflict: 'user_id,tutorial_id'
                });

            if (error) {
                throw error;
            }

            return { success: true, error: null };
        } catch (error) {
            console.error('learnService: Failed to batch save progress', error);
            return { success: false, error };
        }
    }
};

export default learnService;

// Named exports for convenience
export const {
    getCurrentUserId,
    getProgress,
    markCompleted,
    saveProgress,
    batchSaveProgress
} = learnService;
