/**
 * SessionTracker - Tracks game sessions and forwards completed sessions to SessionStore
 * Creates new session on game start, tracks events, finalizes on end
 */
class SessionTracker {
    constructor() {
        this.currentSession = null;
        this.sessionStore = new SessionStore();
        this.setupPageUnloadHandler();
    }

    /**
     * Generate a unique session ID
     * @returns {string} UUID-like session identifier
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Start a new session
     * @param {string} mode - "PLAY" or "SANDBOX"
     */
    startSession(mode) {
        // End any existing session first
        if (this.currentSession) {
            this.endSession("EXITED");
        }

        this.currentSession = {
            sessionId: this.generateSessionId(),
            mode: mode,
            startTime: Date.now(),
            endTime: null,
            durationMinutes: 0,
            finalScore: 0,
            objectivesCompleted: 0,
            objectivesTotal: 0,
            servicesDeployed: 0,
            failures: 0,
            budgetUsed: 0,
            result: null,
            saveUsed: false
        };
    }

    /**
     * Mark that save was used during this session
     */
    markSaveUsed() {
        if (this.currentSession) {
            this.currentSession.saveUsed = true;
        }
    }

    /**
     * End the current session and save it
     * @param {string} result - "COMPLETED", "FAILED", or "EXITED"
     */
    endSession(result) {
        if (!this.currentSession) {
            return;
        }

        // Finalize session data
        this.currentSession.endTime = Date.now();
        this.currentSession.durationMinutes = Math.round(
            (this.currentSession.endTime - this.currentSession.startTime) / (1000 * 60)
        );
        this.currentSession.result = result;

        // Capture final game state if available
        this.captureGameState();

        // Save to store
        this.sessionStore.saveSession(this.currentSession);

        // Clear current session
        this.currentSession = null;
    }

    /**
     * Capture current game state for session metrics
     */
    captureGameState() {
        if (!this.currentSession || typeof window.STATE === 'undefined') {
            return;
        }

        try {
            const state = window.STATE;
            
            // Final score
            if (state.score && typeof state.score.total === 'number') {
                this.currentSession.finalScore = state.score.total;
            }

            // Services deployed
            if (state.services && Array.isArray(state.services)) {
                this.currentSession.servicesDeployed = state.services.length;
            }

            // Failures count
            if (state.failures && typeof state.failures === 'object') {
                this.currentSession.failures = Object.values(state.failures).reduce((a, b) => a + b, 0);
            }

            // Budget used (starting budget - current money)
            const startingBudget = this.currentSession.mode === "SANDBOX" ? 
                (state.sandboxBudget || 2000) : 500;
            if (typeof state.money === 'number') {
                this.currentSession.budgetUsed = Math.max(0, startingBudget - state.money);
            }

            // Objectives (simplified - in survival mode, basic objectives are implied)
            if (this.currentSession.mode === "PLAY") {
                this.currentSession.objectivesTotal = 3; // Basic objectives: storage, db, firewall
                
                // Count completed objectives based on services
                let completed = 0;
                const hasStorage = state.services.some(s => s.type === 's3');
                const hasDB = state.services.some(s => s.type === 'db');
                const hasFirewall = state.services.some(s => s.type === 'waf');
                
                if (hasStorage) completed++;
                if (hasDB) completed++;
                if (hasFirewall) completed++;
                
                this.currentSession.objectivesCompleted = completed;
            } else {
                // Sandbox mode - no fixed objectives
                this.currentSession.objectivesTotal = 0;
                this.currentSession.objectivesCompleted = 0;
            }
        } catch (error) {
            console.error("Failed to capture game state:", error);
        }
    }

    /**
     * Setup page unload handler to catch exits
     */
    setupPageUnloadHandler() {
        window.addEventListener('beforeunload', () => {
            if (this.currentSession) {
                this.endSession("EXITED");
            }
        });
    }

    /**
     * Check if a session is currently active
     * @returns {boolean}
     */
    hasActiveSession() {
        return this.currentSession !== null;
    }

    /**
     * Get current session data (for debugging)
     * @returns {Object|null}
     */
    getCurrentSession() {
        return this.currentSession;
    }
}

// Create global instance
window.sessionTracker = new SessionTracker();

// Export for use in other modules
window.SessionTracker = SessionTracker;