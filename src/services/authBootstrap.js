/**
 * Auth State Bootstrap
 * 
 * Initializes authentication state on app load.
 * Checks for existing sessions and listens for auth state changes.
 * 
 * @module authBootstrap
 */

import authService from './authService.js';

/**
 * Default auth state shape
 */
const DEFAULT_AUTH_STATE = {
    id: null,
    email: null,
    isAuthenticated: false
};

/**
 * Extract auth state from Supabase user object
 * @param {object|null} user - Supabase user object
 * @returns {object} Auth state object
 */
function extractAuthState(user) {
    if (!user) {
        return { ...DEFAULT_AUTH_STATE };
    }

    return {
        id: user.id,
        email: user.email,
        isAuthenticated: true
    };
}

/**
 * Initialize authentication bootstrap
 * 
 * @param {object} stateManager - The StateManager instance
 * @returns {Promise<void>}
 */
export async function initializeAuth(stateManager) {
    if (!stateManager) {
        console.warn('authBootstrap: StateManager not provided. Auth state will not be persisted.');
        return;
    }

    console.log('authBootstrap: Initializing authentication...');

    try {
        // Check for existing session on app load
        const { session } = await authService.getSession();
        
        if (session?.user) {
            console.log('authBootstrap: Existing session found');
            const authState = extractAuthState(session.user);
            stateManager.setState('user.auth', authState);
        } else {
            console.log('authBootstrap: No existing session');
            stateManager.setState('user.auth', { ...DEFAULT_AUTH_STATE });
        }

        // Listen for auth state changes (now async)
        const unsubscribe = await authService.onAuthStateChange((event, session) => {
            console.log('authBootstrap: Auth state changed -', event);

            switch (event) {
                case 'SIGNED_IN':
                case 'TOKEN_REFRESHED':
                case 'USER_UPDATED':
                    if (session?.user) {
                        const authState = extractAuthState(session.user);
                        stateManager.setState('user.auth', authState);
                        console.log('authBootstrap: User signed in -', session.user.email);
                    }
                    break;

                case 'SIGNED_OUT':
                    stateManager.setState('user.auth', { ...DEFAULT_AUTH_STATE });
                    console.log('authBootstrap: User signed out');
                    break;

                default:
                    // Handle other events if needed
                    console.log('authBootstrap: Unhandled auth event -', event);
            }
        });

        // Store unsubscribe for cleanup (if needed later)
        window.__authUnsubscribe = unsubscribe;

        console.log('authBootstrap: Authentication initialized successfully');

    } catch (error) {
        console.error('authBootstrap: Failed to initialize authentication', error);
        // Set default state on error
        stateManager.setState('user.auth', { ...DEFAULT_AUTH_STATE });
    }
}

/**
 * Cleanup auth bootstrap (call on app teardown if needed)
 */
export function cleanupAuth() {
    if (window.__authUnsubscribe) {
        window.__authUnsubscribe();
        delete window.__authUnsubscribe;
        console.log('authBootstrap: Cleaned up auth listener');
    }
}

export default {
    initializeAuth,
    cleanupAuth,
    DEFAULT_AUTH_STATE
};
