/**
 * Auth Debug Utility
 * 
 * DEBUG ONLY — REMOVE AFTER PHASE 2
 * 
 * Exposes auth functions to browser console for manual testing.
 * Usage in browser console:
 *   - authDebug.login('email@example.com', 'password')
 *   - authDebug.logout()
 *   - authDebug.getUser()
 *   - authDebug.getSession()
 *   - authDebug.register('email@example.com', 'password')
 *   - authDebug.isConfigured()
 * 
 * @module authDebug
 */

import authService from './authService.js';
import { isConfigured } from './supabaseClient.js';

// DEBUG ONLY — REMOVE AFTER PHASE 2
const authDebug = {
    /**
     * Login with email and password
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        console.log('authDebug: Attempting login for', email);
        const result = await authService.login(email, password);
        
        if (result.error) {
            console.error('authDebug: Login failed', result.error.message);
        } else {
            console.log('authDebug: Login successful', result.user);
        }
        
        return result;
    },

    /**
     * Logout current user
     */
    async logout() {
        console.log('authDebug: Attempting logout');
        const result = await authService.logout();
        
        if (result.error) {
            console.error('authDebug: Logout failed', result.error.message);
        } else {
            console.log('authDebug: Logout successful');
        }
        
        return result;
    },

    /**
     * Get current user
     */
    async getUser() {
        const result = await authService.getCurrentUser();
        
        if (result.error) {
            console.error('authDebug: Failed to get user', result.error.message);
        } else if (result.user) {
            console.log('authDebug: Current user', {
                id: result.user.id,
                email: result.user.email,
                created_at: result.user.created_at
            });
        } else {
            console.log('authDebug: No user logged in');
        }
        
        return result;
    },

    /**
     * Get current session
     */
    async getSession() {
        const result = await authService.getSession();
        
        if (result.error) {
            console.error('authDebug: Failed to get session', result.error.message);
        } else if (result.session) {
            console.log('authDebug: Current session', {
                access_token: result.session.access_token?.substring(0, 20) + '...',
                expires_at: result.session.expires_at,
                user_email: result.session.user?.email
            });
        } else {
            console.log('authDebug: No active session');
        }
        
        return result;
    },

    /**
     * Register new user
     * @param {string} email 
     * @param {string} password 
     */
    async register(email, password) {
        console.log('authDebug: Attempting registration for', email);
        const result = await authService.register(email, password);
        
        if (result.error) {
            console.error('authDebug: Registration failed', result.error.message);
        } else {
            console.log('authDebug: Registration successful', result.user);
        }
        
        return result;
    },

    /**
     * Check if Supabase is configured
     */
    isConfigured() {
        const configured = isConfigured();
        console.log('authDebug: Supabase configured:', configured);
        return configured;
    },

    /**
     * Show help message
     */
    help() {
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    AUTH DEBUG UTILITY                         ║
║              DEBUG ONLY — REMOVE AFTER PHASE 2                ║
╠═══════════════════════════════════════════════════════════════╣
║ Available commands:                                           ║
║                                                               ║
║   authDebug.login(email, password)    - Login user            ║
║   authDebug.logout()                  - Logout user           ║
║   authDebug.getUser()                 - Get current user      ║
║   authDebug.getSession()              - Get current session   ║
║   authDebug.register(email, password) - Register new user     ║
║   authDebug.isConfigured()            - Check Supabase config ║
║   authDebug.help()                    - Show this help        ║
╚═══════════════════════════════════════════════════════════════╝
        `);
    }
};

// DEBUG ONLY — REMOVE AFTER PHASE 2
// Expose to window for console access
if (typeof window !== 'undefined') {
    window.authDebug = authDebug;
    console.log('🔐 authDebug utility loaded. Type authDebug.help() for commands.');
}

export default authDebug;
