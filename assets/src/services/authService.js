/**
 * Authentication Service
 * 
 * Centralized authentication logic for the application.
 * All auth operations go through this service - no page should import Supabase directly.
 * 
 * @module authService
 */

import { getSupabase, isConfigured } from './supabaseClient.js';

/**
 * Authentication Service
 * Provides clean interface for auth operations
 */
const authService = {
    /**
     * Register a new user with email and password
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<{user: object|null, error: Error|null}>}
     */
    async register(email, password) {
        try {
            if (!isConfigured()) {
                console.warn('authService: Supabase is not configured. Using placeholder mode.');
                return {
                    user: null,
                    error: new Error('Supabase is not configured. Please set environment variables.')
                };
            }

            const supabase = await getSupabase();
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });

            if (error) {
                throw error;
            }

            return {
                user: data.user,
                error: null
            };
        } catch (error) {
            console.error('authService: Registration failed', error);
            return {
                user: null,
                error
            };
        }
    },

    /**
     * Login a user with email and password
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<{user: object|null, session: object|null, error: Error|null}>}
     */
    async login(email, password) {
        try {
            if (!isConfigured()) {
                console.warn('authService: Supabase is not configured. Using placeholder mode.');
                return {
                    user: null,
                    session: null,
                    error: new Error('Supabase is not configured. Please set environment variables.')
                };
            }

            const supabase = await getSupabase();
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            return {
                user: data.user,
                session: data.session,
                error: null
            };
        } catch (error) {
            console.error('authService: Login failed', error);
            return {
                user: null,
                session: null,
                error
            };
        }
    },

    /**
     * Logout the current user
     * @returns {Promise<{error: Error|null}>}
     */
    async logout() {
        try {
            if (!isConfigured()) {
                console.warn('authService: Supabase is not configured. Using placeholder mode.');
                return { error: null };
            }

            const supabase = await getSupabase();
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            return { error: null };
        } catch (error) {
            console.error('authService: Logout failed', error);
            return { error };
        }
    },

    /**
     * Get the currently authenticated user
     * @returns {Promise<{user: object|null, error: Error|null}>}
     */
    async getCurrentUser() {
        try {
            if (!isConfigured()) {
                return { user: null, error: null };
            }

            const supabase = await getSupabase();
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error) {
                throw error;
            }

            return { user, error: null };
        } catch (error) {
            console.error('authService: Failed to get current user', error);
            return { user: null, error };
        }
    },

    /**
     * Get the current session
     * @returns {Promise<{session: object|null, error: Error|null}>}
     */
    async getSession() {
        try {
            if (!isConfigured()) {
                return { session: null, error: null };
            }

            const supabase = await getSupabase();
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                throw error;
            }

            return { session, error: null };
        } catch (error) {
            console.error('authService: Failed to get session', error);
            return { session: null, error };
        }
    },

    /**
     * Subscribe to auth state changes
     * @param {Function} callback - Callback function (event, session) => void
     * @returns {Promise<Function>} Unsubscribe function
     */
    async onAuthStateChange(callback) {
        if (!isConfigured()) {
            console.warn('authService: Supabase is not configured. Auth state changes will not fire.');
            // Return a no-op unsubscribe function
            return () => {};
        }

        const supabase = await getSupabase();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });

        // Return unsubscribe function
        return () => {
            subscription?.unsubscribe();
        };
    }
};

export default authService;

// Named exports for convenience
export const {
    register,
    login,
    logout,
    getCurrentUser,
    getSession,
    onAuthStateChange
} = authService;
