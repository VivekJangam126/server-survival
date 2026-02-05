/**
 * SessionStore - Handles persistence of session records to localStorage and Supabase
 * Storage key: "game_sessions"
 * Appends sessions safely without overwriting previous sessions
 * 
 * Priority: Backend (Supabase) is primary, localStorage is fallback
 * If user is authenticated → write to Supabase + localStorage
 * If user not authenticated → localStorage only
 * If Supabase fails → silently fallback to localStorage only
 */

// Import gameSessionService dynamically to avoid module loading issues
let gameSessionService = null;

/**
 * Lazy load the gameSessionService
 * @returns {Promise<object|null>} gameSessionService or null if unavailable
 */
async function getGameSessionService() {
    if (gameSessionService) {
        return gameSessionService;
    }
    
    try {
        // Dynamic import to handle both module and non-module contexts
        const module = await import('../src/services/gameSessionService.js');
        gameSessionService = module.default;
        return gameSessionService;
    } catch (error) {
        // Silently fail - service not available
        return null;
    }
}

class SessionStore {
    constructor() {
        this.storageKey = "game_sessions";
    }

    /**
     * Append a session record to localStorage and optionally Supabase
     * Backend is primary, localStorage is fallback
     * @param {Object} sessionData - Complete session record
     */
    saveSession(sessionData) {
        // Always save to localStorage first (synchronous, reliable)
        this._saveToLocalStorage(sessionData);
        
        // Attempt to save to Supabase asynchronously (fire-and-forget)
        this._saveToSupabase(sessionData);
    }

    /**
     * Save session to localStorage
     * @param {Object} sessionData - Complete session record
     * @private
     */
    _saveToLocalStorage(sessionData) {
        try {
            const existingSessions = this.getAllSessions();
            existingSessions.push(sessionData);
            localStorage.setItem(this.storageKey, JSON.stringify(existingSessions));
        } catch (error) {
            // Silently fail - don't break game flow
        }
    }

    /**
     * Save session to Supabase (async, fire-and-forget)
     * Silently fails if user not authenticated or network error
     * @param {Object} sessionData - Complete session record
     * @private
     */
    async _saveToSupabase(sessionData) {
        try {
            const service = await getGameSessionService();
            if (!service) {
                // Service not available - silently fallback to localStorage only
                return;
            }

            // Attempt to save to Supabase
            // This will silently fail if:
            // - User not authenticated
            // - Supabase unavailable
            // - Network error
            // - RLS blocks
            await service.saveSession(sessionData);
        } catch (error) {
            // Silently fail - localStorage already has the data
        }
    }

    /**
     * Retrieve all session records from localStorage
     * @returns {Array} Array of session records
     */
    getAllSessions() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            // Silently fail - return empty array
            return [];
        }
    }

    /**
     * Get sessions filtered by mode
     * @param {string} mode - "PLAY" or "SANDBOX"
     * @returns {Array} Filtered session records
     */
    getSessionsByMode(mode) {
        return this.getAllSessions().filter(session => session.mode === mode);
    }

    /**
     * Clear all session data (for testing/debugging only)
     */
    clearAllSessions() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            // Silently fail
        }
    }
}

// Export for use in other modules
window.SessionStore = SessionStore;