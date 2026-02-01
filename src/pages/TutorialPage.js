/**
 * TutorialPage - Navigation behavior for individual tutorial pages
 * Handles route params, data loading, validation, and navigation context
 * 
 * NO UI IMPLEMENTATION - This is navigation/data layer only
 */

import {
    getRouteParams,
    getNavigationContext,
    getBackNavigationInfo,
    isValidConceptId,
    getInvalidRouteRedirect,
    navigateTo
} from '../utils/navigation.js';

/**
 * TutorialPage controller for navigation behavior
 */
class TutorialPage {
    constructor() {
        this.conceptId = null;
        this.tutorial = null;
        this.tutorials = [];
        this.navigationContext = null;
        this.backNavigation = null;
        this.initialized = false;
        this.error = null;
    }

    /**
     * Initialize the tutorial page
     * Reads route params, loads data, validates, and sets up navigation context
     * @returns {Promise<boolean>} True if initialization succeeded
     */
    async initialize() {
        try {
            this.error = null;
            
            // Step 1: Read conceptId from route params
            const params = getRouteParams();
            this.conceptId = params.conceptId;
            
            // Step 2: Validate conceptId exists
            if (!this.conceptId) {
                this.error = 'missing_concept_id';
                this.handleInvalidRoute('Missing concept ID');
                return false;
            }
            
            // Step 3: Load tutorials data
            await this.loadTutorials();
            
            // Step 4: Validate conceptId against available tutorials
            if (!isValidConceptId(this.conceptId, this.tutorials)) {
                this.error = 'invalid_concept_id';
                this.handleInvalidRoute(`Invalid concept ID: ${this.conceptId}`);
                return false;
            }
            
            // Step 5: Find and set current tutorial
            this.tutorial = this.findTutorial(this.conceptId);
            
            if (!this.tutorial) {
                this.error = 'tutorial_not_found';
                this.handleInvalidRoute(`Tutorial not found: ${this.conceptId}`);
                return false;
            }
            
            // Step 6: Parse navigation context
            this.navigationContext = getNavigationContext();
            
            // Step 7: Set up back navigation
            this.backNavigation = getBackNavigationInfo();
            
            this.initialized = true;
            return true;
            
        } catch (error) {
            console.error('TutorialPage: Initialization failed', error);
            this.error = 'initialization_failed';
            this.handleInvalidRoute('Initialization error');
            return false;
        }
    }

    /**
     * Load tutorials from JSON data
     * @returns {Promise<void>}
     */
    async loadTutorials() {
        try {
            // Dynamic import of tutorials data
            const response = await fetch('/src/data/learn/tutorials.json');
            
            if (!response.ok) {
                throw new Error(`Failed to load tutorials: ${response.status}`);
            }
            
            this.tutorials = await response.json();
            
        } catch (error) {
            console.error('TutorialPage: Failed to load tutorials', error);
            // Fallback: try alternate path
            try {
                const altResponse = await fetch('./data/learn/tutorials.json');
                if (altResponse.ok) {
                    this.tutorials = await altResponse.json();
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
     * Find a tutorial by concept ID
     * @param {string} conceptId - Concept ID to find
     * @returns {Object|null} Tutorial object or null
     */
    findTutorial(conceptId) {
        return this.tutorials.find(t => t.id === conceptId) || null;
    }

    /**
     * Handle invalid route by redirecting to learn index
     * @param {string} reason - Reason for the invalid route
     */
    handleInvalidRoute(reason) {
        console.warn(`TutorialPage: ${reason}`);
        const redirectUrl = getInvalidRouteRedirect(reason);
        navigateTo(redirectUrl, { replace: true });
    }

    /**
     * Get current state for UI layer
     * @returns {Object} Current page state
     */
    getState() {
        return {
            initialized: this.initialized,
            conceptId: this.conceptId,
            tutorial: this.tutorial,
            tutorials: this.tutorials,
            navigationContext: this.navigationContext,
            backNavigation: this.backNavigation,
            error: this.error
        };
    }

    /**
     * Get current tutorial data
     * @returns {Object|null} Current tutorial
     */
    getTutorial() {
        return this.tutorial;
    }

    /**
     * Get navigation context
     * @returns {Object|null} Navigation context
     */
    getContext() {
        return this.navigationContext;
    }

    /**
     * Check if back to mapping should be shown
     * @returns {boolean} True if should show back to mapping CTA
     */
    shouldShowBackToMapping() {
        return this.backNavigation?.shouldShowBackToMapping || false;
    }

    /**
     * Get back navigation URL
     * @returns {string|null} Back navigation URL
     */
    getBackUrl() {
        return this.backNavigation?.backUrl || null;
    }

    /**
     * Get back navigation label
     * @returns {string} Back navigation label
     */
    getBackLabel() {
        return this.backNavigation?.backLabel || 'Back';
    }

    /**
     * Get next tutorial in sequence
     * @returns {Object|null} Next tutorial or null if at end
     */
    getNextTutorial() {
        if (!this.tutorial) return null;
        
        const currentOrder = this.tutorial.order;
        return this.tutorials.find(t => t.order === currentOrder + 1) || null;
    }

    /**
     * Get previous tutorial in sequence
     * @returns {Object|null} Previous tutorial or null if at start
     */
    getPreviousTutorial() {
        if (!this.tutorial) return null;
        
        const currentOrder = this.tutorial.order;
        return this.tutorials.find(t => t.order === currentOrder - 1) || null;
    }

    /**
     * Get related tutorials based on unlocks
     * @returns {Array} Array of related tutorials
     */
    getRelatedTutorials() {
        if (!this.tutorial?.unlocks) return [];
        
        return this.tutorials.filter(t => 
            this.tutorial.unlocks.includes(t.id)
        );
    }

    /**
     * Check if this is the first tutorial
     * @returns {boolean} True if first tutorial
     */
    isFirstTutorial() {
        return this.tutorial?.order === 1;
    }

    /**
     * Check if this is the last tutorial
     * @returns {boolean} True if last tutorial
     */
    isLastTutorial() {
        if (!this.tutorial) return false;
        const maxOrder = Math.max(...this.tutorials.map(t => t.order));
        return this.tutorial.order === maxOrder;
    }

    /**
     * Cleanup page resources
     */
    cleanup() {
        this.conceptId = null;
        this.tutorial = null;
        this.navigationContext = null;
        this.backNavigation = null;
        this.initialized = false;
        this.error = null;
    }
}

// Export singleton instance and class
export const tutorialPage = new TutorialPage();
export { TutorialPage };
export default tutorialPage;
