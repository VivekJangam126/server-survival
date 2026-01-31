/**
 * SessionStore - Handles persistence of session records to localStorage
 * Storage key: "game_sessions"
 * Appends sessions safely without overwriting previous sessions
 */
class SessionStore {
    constructor() {
        this.storageKey = "game_sessions";
    }

    /**
     * Append a session record to localStorage
     * @param {Object} sessionData - Complete session record
     */
    saveSession(sessionData) {
        try {
            const existingSessions = this.getAllSessions();
            existingSessions.push(sessionData);
            localStorage.setItem(this.storageKey, JSON.stringify(existingSessions));
        } catch (error) {
            console.error("Failed to save session:", error);
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
            console.error("Failed to load sessions:", error);
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
            console.error("Failed to clear sessions:", error);
        }
    }
}

// Export for use in other modules
window.SessionStore = SessionStore;