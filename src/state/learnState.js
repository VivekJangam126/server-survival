/**
 * Learn State Management
 * Tracks tutorial completion and unlock status
 * Integrates with existing StateManager pattern
 * 
 * Now supports Supabase backend with localStorage fallback
 * 
 * FEATURE COMPLETE — DO NOT EXTEND IN MVP
 */

import learnService from '../services/learnService.js';

const LEARN_STATE_KEY = 'learn-mode-progress';
const DEMO_MODE_KEY = 'learn-demo-mode';

/**
 * Default learn state
 */
const DEFAULT_LEARN_STATE = {
    completedTutorials: [],
    unlockedTutorials: []
};

/**
 * LearnState - Manages Learn Mode progress
 * Now with Supabase backend support and localStorage fallback
 */
class LearnState {
    constructor() {
        this.state = { ...DEFAULT_LEARN_STATE };
        this.tutorials = [];
        this.subscribers = new Set();
        this.initialized = false;
        this.userId = null;
        this.useBackend = false; // Will be set based on auth status
    }

    /**
     * Initialize learn state
     * @param {Array} tutorials - Array of tutorial objects
     */
    async initialize(tutorials = []) {
        this.tutorials = tutorials;
        
        // Try to initialize with backend first
        await this.initializeWithBackend();
        
        // Ensure first tutorial is always unlocked
        if (tutorials.length > 0 && !this.isUnlocked(tutorials[0].id)) {
            this.unlockTutorial(tutorials[0].id);
        }
        
        this.initialized = true;
    }

    /**
     * Initialize state from Supabase backend
     * Falls back to localStorage if unavailable
     */
    async initializeWithBackend() {
        try {
            // Get current user
            this.userId = await learnService.getCurrentUserId();
            
            if (!this.userId) {
                console.log('LearnState: No authenticated user, using localStorage');
                this.useBackend = false;
                this.restore();
                return;
            }

            // Fetch progress from backend
            const { data, error } = await learnService.getProgress(this.userId);
            
            if (error || !data) {
                console.warn('LearnState: Backend fetch failed, using localStorage', error);
                this.useBackend = false;
                this.restore();
                return;
            }

            // Hydrate state from backend data
            this.hydrateFromBackend(data);
            this.useBackend = true;
            
            // Also update localStorage as backup
            this.persist();
            
            console.log('LearnState: Initialized from backend for user', this.userId);
        } catch (error) {
            console.warn('LearnState: Backend initialization failed, using localStorage', error);
            this.useBackend = false;
            this.restore();
        }
    }

    /**
     * Hydrate state from backend data
     * @param {Array} backendData - Array of tutorial_progress rows
     */
    hydrateFromBackend(backendData) {
        const completedTutorials = [];
        const unlockedTutorials = [];

        backendData.forEach(row => {
            if (row.status === 'completed') {
                completedTutorials.push(row.tutorial_id);
                unlockedTutorials.push(row.tutorial_id);
            } else if (row.status === 'available') {
                unlockedTutorials.push(row.tutorial_id);
            }
        });

        this.state = {
            completedTutorials,
            unlockedTutorials
        };
    }

    /**
     * Restore state from localStorage
     */
    restore() {
        try {
            const saved = localStorage.getItem(LEARN_STATE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = {
                    completedTutorials: parsed.completedTutorials || [],
                    unlockedTutorials: parsed.unlockedTutorials || []
                };
            }
        } catch (error) {
            console.warn('LearnState: Failed to restore state', error);
            this.state = { ...DEFAULT_LEARN_STATE };
        }
    }

    /**
     * Persist state to localStorage
     */
    persist() {
        try {
            localStorage.setItem(LEARN_STATE_KEY, JSON.stringify(this.state));
        } catch (error) {
            console.warn('LearnState: Failed to persist state', error);
        }
    }

    /**
     * Sync current state to backend (for migration or backup)
     */
    async syncToBackend() {
        if (!this.userId || !this.useBackend) {
            return;
        }

        try {
            const progressList = [];
            
            // Add completed tutorials
            this.state.completedTutorials.forEach(tutorialId => {
                progressList.push({ tutorialId, status: 'completed' });
            });
            
            // Add unlocked (available) tutorials that aren't completed
            this.state.unlockedTutorials.forEach(tutorialId => {
                if (!this.state.completedTutorials.includes(tutorialId)) {
                    progressList.push({ tutorialId, status: 'available' });
                }
            });

            if (progressList.length > 0) {
                await learnService.batchSaveProgress(this.userId, progressList);
            }
        } catch (error) {
            console.warn('LearnState: Failed to sync to backend', error);
        }
    }

    /**
     * Subscribe to state changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    /**
     * Notify all subscribers
     */
    notify() {
        this.subscribers.forEach(callback => {
            try {
                callback(this.getState());
            } catch (error) {
                console.error('LearnState: Subscriber error', error);
            }
        });
    }

    /**
     * Get current state
     * @returns {Object} Current learn state
     */
    getState() {
        return {
            completedTutorials: [...this.state.completedTutorials],
            unlockedTutorials: [...this.state.unlockedTutorials]
        };
    }

    /**
     * Check if a tutorial is completed
     * @param {string} tutorialId - Tutorial ID
     * @returns {boolean} True if completed
     */
    isCompleted(tutorialId) {
        return this.state.completedTutorials.includes(tutorialId);
    }

    /**
     * Check if a tutorial is unlocked
     * @param {string} tutorialId - Tutorial ID
     * @returns {boolean} True if unlocked
     */
    isUnlocked(tutorialId) {
        // First tutorial is always unlocked
        const tutorial = this.tutorials.find(t => t.id === tutorialId);
        if (tutorial?.order === 1) {
            return true;
        }
        
        return this.state.unlockedTutorials.includes(tutorialId);
    }

    /**
     * Check if a tutorial is locked
     * @param {string} tutorialId - Tutorial ID
     * @returns {boolean} True if locked
     */
    isLocked(tutorialId) {
        return !this.isUnlocked(tutorialId);
    }

    /**
     * Get tutorial status
     * @param {string} tutorialId - Tutorial ID
     * @returns {'locked' | 'available' | 'completed'} Tutorial status
     */
    getTutorialStatus(tutorialId) {
        if (this.isCompleted(tutorialId)) {
            return 'completed';
        }
        if (this.isUnlocked(tutorialId)) {
            return 'available';
        }
        return 'locked';
    }

    /**
     * Unlock a tutorial
     * @param {string} tutorialId - Tutorial ID to unlock
     */
    unlockTutorial(tutorialId) {
        if (!this.state.unlockedTutorials.includes(tutorialId)) {
            // Optimistic update
            this.state.unlockedTutorials.push(tutorialId);
            this.persist();
            this.notify();
            
            // Sync to backend (fire and forget)
            if (this.useBackend && this.userId) {
                learnService.saveProgress(this.userId, tutorialId, 'available')
                    .catch(err => console.warn('LearnState: Failed to sync unlock to backend', err));
            }
        }
    }

    /**
     * Mark a tutorial as completed and unlock next tutorials
     * @param {string} tutorialId - Tutorial ID to complete
     */
    completeTutorial(tutorialId) {
        // Mark as completed (optimistic update)
        if (!this.state.completedTutorials.includes(tutorialId)) {
            this.state.completedTutorials.push(tutorialId);
        }
        
        // Find the tutorial and unlock its unlocks
        const tutorial = this.tutorials.find(t => t.id === tutorialId);
        if (tutorial?.unlocks) {
            tutorial.unlocks.forEach(unlockId => {
                this.unlockTutorial(unlockId);
            });
        }
        
        // Also unlock the next tutorial in order
        if (tutorial) {
            const nextTutorial = this.tutorials.find(t => t.order === tutorial.order + 1);
            if (nextTutorial) {
                this.unlockTutorial(nextTutorial.id);
            }
        }
        
        this.persist();
        this.notify();
        
        // Sync completion to backend (fire and forget)
        if (this.useBackend && this.userId) {
            learnService.markCompleted(this.userId, tutorialId)
                .catch(err => console.warn('LearnState: Failed to sync completion to backend', err));
        }
    }

    /**
     * Reset all progress
     */
    reset() {
        this.state = { ...DEFAULT_LEARN_STATE };
        
        // Unlock first tutorial
        if (this.tutorials.length > 0) {
            this.state.unlockedTutorials.push(this.tutorials[0].id);
        }
        
        this.persist();
        this.notify();
        
        // Note: We don't clear backend data on reset
        // That would require DELETE permission which we don't have
    }

    /**
     * Handle auth state change (login/logout)
     * Call this when user logs in or out
     */
    async onAuthStateChange() {
        const newUserId = await learnService.getCurrentUserId();
        
        if (newUserId !== this.userId) {
            this.userId = newUserId;
            
            if (newUserId) {
                // User logged in - fetch their progress
                console.log('LearnState: User logged in, fetching progress');
                await this.initializeWithBackend();
            } else {
                // User logged out - reset to localStorage
                console.log('LearnState: User logged out, using localStorage');
                this.useBackend = false;
                this.restore();
            }
            
            this.notify();
        }
    }

    /**
     * Check if demo mode is enabled via URL param
     * @returns {boolean} True if demo mode active
     */
    isDemoMode() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('demo') === 'true';
    }

    /**
     * Unlock all tutorials (for demo mode)
     */
    unlockAll() {
        this.tutorials.forEach(tutorial => {
            if (!this.state.unlockedTutorials.includes(tutorial.id)) {
                this.state.unlockedTutorials.push(tutorial.id);
            }
        });
        this.persist();
        this.notify();
    }

    /**
     * Pre-fill demo progress (2 tutorials completed)
     */
    setDemoProgress() {
        this.reset();
        // Complete first 2 tutorials for demo
        const demoTutorials = this.tutorials.slice(0, 2);
        demoTutorials.forEach(t => {
            if (!this.state.completedTutorials.includes(t.id)) {
                this.state.completedTutorials.push(t.id);
            }
            // Unlock what they would unlock
            if (t.unlocks) {
                t.unlocks.forEach(id => this.unlockTutorial(id));
            }
        });
        // Unlock tutorial 3
        if (this.tutorials[2]) {
            this.unlockTutorial(this.tutorials[2].id);
        }
        this.persist();
        this.notify();
    }

    /**
     * Get completion percentage
     * @returns {number} Percentage (0-100)
     */
    getCompletionPercentage() {
        if (this.tutorials.length === 0) return 0;
        return Math.round((this.state.completedTutorials.length / this.tutorials.length) * 100);
    }

    /**
     * Get stats for display
     * @returns {Object} Stats object
     */
    getStats() {
        return {
            completed: this.state.completedTutorials.length,
            total: this.tutorials.length,
            percentage: this.getCompletionPercentage(),
            unlocked: this.state.unlockedTutorials.length,
            isBackendSync: this.useBackend
        };
    }

    /**
     * Check if using backend sync
     * @returns {boolean} True if syncing with backend
     */
    isUsingBackend() {
        return this.useBackend;
    }
}

// Singleton instance
export const learnState = new LearnState();
export { LearnState, DEFAULT_LEARN_STATE, LEARN_STATE_KEY };
export default learnState;
