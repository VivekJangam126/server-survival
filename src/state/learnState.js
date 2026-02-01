/**
 * Learn State Management
 * Tracks tutorial completion and unlock status
 * Integrates with existing StateManager pattern
 */

const LEARN_STATE_KEY = 'learn-mode-progress';

/**
 * Default learn state
 */
const DEFAULT_LEARN_STATE = {
    completedTutorials: [],
    unlockedTutorials: []
};

/**
 * LearnState - Manages Learn Mode progress
 */
class LearnState {
    constructor() {
        this.state = { ...DEFAULT_LEARN_STATE };
        this.tutorials = [];
        this.subscribers = new Set();
        this.initialized = false;
    }

    /**
     * Initialize learn state
     * @param {Array} tutorials - Array of tutorial objects
     */
    initialize(tutorials = []) {
        this.tutorials = tutorials;
        this.restore();
        
        // Ensure first tutorial is always unlocked
        if (tutorials.length > 0 && !this.isUnlocked(tutorials[0].id)) {
            this.unlockTutorial(tutorials[0].id);
        }
        
        this.initialized = true;
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
            this.state.unlockedTutorials.push(tutorialId);
            this.persist();
            this.notify();
        }
    }

    /**
     * Mark a tutorial as completed and unlock next tutorials
     * @param {string} tutorialId - Tutorial ID to complete
     */
    completeTutorial(tutorialId) {
        // Mark as completed
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
            unlocked: this.state.unlockedTutorials.length
        };
    }
}

// Singleton instance
export const learnState = new LearnState();
export { LearnState, DEFAULT_LEARN_STATE, LEARN_STATE_KEY };
export default learnState;
