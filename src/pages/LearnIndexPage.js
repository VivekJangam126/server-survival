/**
 * LearnIndexPage - Navigation behavior for the Learn Mode index page
 * Handles route navigation, tutorial listing, and navigation context
 * 
 * NO UI IMPLEMENTATION - This is navigation/data layer only
 */

import {
    getNavigationContext,
    goToLearn,
    goToMapping,
    NAV_SOURCES
} from '../utils/navigation.js';

/**
 * LearnIndexPage controller for navigation behavior
 */
class LearnIndexPage {
    constructor() {
        // Navigation context
        this.navigationContext = null;
        
        // Data state
        this.tutorials = [];
        
        // UI state
        this.initialized = false;
        this.error = null;
    }

    /**
     * Initialize the Learn Index page
     * Loads tutorials and parses navigation context
     * @returns {Promise<boolean>} True if initialization succeeded
     */
    async initialize() {
        try {
            this.error = null;
            
            // Step 1: Parse navigation context
            this.navigationContext = getNavigationContext();
            
            // Step 2: Load tutorials data
            await this.loadTutorials();
            
            this.initialized = true;
            return true;
            
        } catch (error) {
            console.error('LearnIndexPage: Initialization failed', error);
            this.error = 'initialization_failed';
            return false;
        }
    }

    /**
     * Load tutorials from JSON data
     * @returns {Promise<void>}
     */
    async loadTutorials() {
        try {
            const response = await fetch('/src/data/learn/tutorials.json');
            
            if (!response.ok) {
                throw new Error(`Failed to load tutorials: ${response.status}`);
            }
            
            this.tutorials = await response.json();
            
            // Sort by order
            this.tutorials.sort((a, b) => a.order - b.order);
            
        } catch (error) {
            console.error('LearnIndexPage: Failed to load tutorials', error);
            
            // Try alternate path
            try {
                const altResponse = await fetch('./data/learn/tutorials.json');
                if (altResponse.ok) {
                    this.tutorials = await altResponse.json();
                    this.tutorials.sort((a, b) => a.order - b.order);
                    return;
                }
            } catch {
                // Ignore fallback error
            }
            
            this.tutorials = [];
            throw error;
        }
    }

    /**
     * Get current state for UI layer
     * @returns {Object} Current page state
     */
    getState() {
        return {
            initialized: this.initialized,
            tutorials: this.tutorials,
            navigationContext: this.navigationContext,
            error: this.error
        };
    }

    /**
     * Get all tutorials sorted by order
     * @returns {Array} Sorted tutorials
     */
    getTutorials() {
        return this.tutorials;
    }

    /**
     * Get tutorials by difficulty level
     * @param {string} difficulty - 'beginner' or 'intermediate'
     * @returns {Array} Filtered tutorials
     */
    getTutorialsByDifficulty(difficulty) {
        return this.tutorials.filter(t => t.difficulty === difficulty);
    }

    /**
     * Get navigation context
     * @returns {Object|null} Navigation context
     */
    getContext() {
        return this.navigationContext;
    }

    /**
     * Build URL to navigate to a specific tutorial
     * @param {string} conceptId - Concept ID to navigate to
     * @returns {string} URL for the tutorial
     */
    buildTutorialUrl(conceptId) {
        return goToLearn(conceptId, {
            from: NAV_SOURCES.LEARN,
            sessionId: this.navigationContext?.sessionId
        });
    }

    /**
     * Build URL to navigate to Mapping Hub
     * @param {Object} options - Optional filter options
     * @returns {string} URL for the Mapping Hub
     */
    buildMappingUrl(options = {}) {
        return goToMapping({
            ...options,
            sessionId: this.navigationContext?.sessionId
        });
    }

    /**
     * Get recommended tutorials based on context
     * For now, returns first incomplete tutorials or beginners
     * @returns {Array} Recommended tutorials (max 3)
     */
    getRecommendedTutorials() {
        // If coming from mapping with an event, find related tutorials
        if (this.navigationContext?.event) {
            const related = this.tutorials.filter(t =>
                t.relatedGameEvents?.includes(this.navigationContext.event)
            );
            if (related.length > 0) {
                return related.slice(0, 3);
            }
        }
        
        // Default: return beginner tutorials first
        const beginnerTutorials = this.getTutorialsByDifficulty('beginner');
        if (beginnerTutorials.length > 0) {
            return beginnerTutorials.slice(0, 3);
        }
        
        // Fallback: first 3 tutorials by order
        return this.tutorials.slice(0, 3);
    }

    /**
     * Get total estimated learning time
     * @returns {number} Total minutes
     */
    getTotalEstimatedTime() {
        return this.tutorials.reduce((sum, t) => sum + (t.estimatedTimeMinutes || 0), 0);
    }

    /**
     * Find tutorial by ID
     * @param {string} tutorialId - Tutorial ID to find
     * @returns {Object|null} Tutorial or null
     */
    findTutorial(tutorialId) {
        return this.tutorials.find(t => t.id === tutorialId) || null;
    }

    /**
     * Check if user came from a game session
     * @returns {boolean} True if from game
     */
    isFromGame() {
        return this.navigationContext?.from === NAV_SOURCES.GAME;
    }

    /**
     * Check if user came from mapping hub
     * @returns {boolean} True if from mapping
     */
    isFromMapping() {
        return this.navigationContext?.from === NAV_SOURCES.MAPPING;
    }

    /**
     * Cleanup page resources
     */
    cleanup() {
        this.navigationContext = null;
        this.tutorials = [];
        this.initialized = false;
        this.error = null;
    }
}

// Export singleton instance and class
export const learnIndexPage = new LearnIndexPage();
export { LearnIndexPage };
export default learnIndexPage;
