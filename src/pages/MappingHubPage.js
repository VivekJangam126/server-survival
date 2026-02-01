/**
 * MappingHubPage - Navigation behavior for the Game → Real-World Mapping Hub
 * Handles query params, state management, and exposes data for UI filtering
 * 
 * NO UI IMPLEMENTATION - This is navigation/data layer only
 */

import {
    getNavigationContext,
    goToLearn,
    NAV_SOURCES
} from '../utils/navigation.js';

/**
 * MappingHubPage controller for navigation behavior
 */
class MappingHubPage {
    constructor() {
        // Query param state
        this.concept = null;
        this.event = null;
        this.sessionId = null;
        this.chainId = null;
        this.decisionId = null;
        
        // Data state
        this.gameEvents = [];
        this.failureChains = [];
        this.decisions = [];
        
        // UI state flags
        this.initialized = false;
        this.error = null;
        this.debugMode = false;
    }

    /**
     * Initialize the Mapping Hub page
     * Reads query params and loads data
     * @returns {Promise<boolean>} True if initialization succeeded
     */
    async initialize() {
        try {
            this.error = null;
            
            // Step 1: Parse query parameters
            this.parseQueryParams();
            
            // Step 2: Load mapping data
            await this.loadMappingData();
            
            // Step 3: Determine debug mode
            this.debugMode = this.determineDebugMode();
            
            this.initialized = true;
            return true;
            
        } catch (error) {
            console.error('MappingHubPage: Initialization failed', error);
            this.error = 'initialization_failed';
            return false;
        }
    }

    /**
     * Parse query parameters from URL
     */
    parseQueryParams() {
        const context = getNavigationContext();
        
        this.concept = context.concept;
        this.event = context.event;
        this.sessionId = context.sessionId;
        this.chainId = context.chainId;
        this.decisionId = context.decisionId;
        
        // Handle special sessionId values
        if (this.sessionId === 'last') {
            this.sessionId = this.getLastSessionId();
        }
    }

    /**
     * Get the last session ID from storage
     * @returns {string|null} Last session ID or null
     */
    getLastSessionId() {
        try {
            // Try localStorage first
            const lastSession = localStorage.getItem('lastGameSessionId');
            if (lastSession) return lastSession;
            
            // Fallback to sessionStorage
            return sessionStorage.getItem('lastGameSessionId') || null;
            
        } catch (error) {
            console.warn('MappingHubPage: Could not retrieve last session ID', error);
            return null;
        }
    }

    /**
     * Load mapping data from JSON files
     * @returns {Promise<void>}
     */
    async loadMappingData() {
        const loadJson = async (path, fallbackPath) => {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    return await response.json();
                }
            } catch {
                // Try fallback
            }
            
            try {
                const fallbackResponse = await fetch(fallbackPath);
                if (fallbackResponse.ok) {
                    return await fallbackResponse.json();
                }
            } catch {
                // Ignore
            }
            
            return [];
        };

        // Load all mapping data in parallel
        const [gameEvents, failureChains, decisions] = await Promise.all([
            loadJson('/src/data/mapping/gameEvents.json', './data/mapping/gameEvents.json'),
            loadJson('/src/data/mapping/failureChains.json', './data/mapping/failureChains.json'),
            loadJson('/src/data/mapping/decisions.json', './data/mapping/decisions.json')
        ]);

        this.gameEvents = gameEvents;
        this.failureChains = failureChains;
        this.decisions = decisions;
    }

    /**
     * Determine if debug mode should be enabled
     * @returns {boolean} True if debug mode enabled
     */
    determineDebugMode() {
        // Check URL hash for debug flag
        if (window.location.hash.includes('debug')) {
            return true;
        }
        
        // Check localStorage for debug setting
        try {
            return localStorage.getItem('mappingHubDebug') === 'true';
        } catch {
            return false;
        }
    }

    /**
     * Get current state for UI layer
     * @returns {Object} Current page state
     */
    getState() {
        return {
            initialized: this.initialized,
            concept: this.concept,
            event: this.event,
            sessionId: this.sessionId,
            chainId: this.chainId,
            decisionId: this.decisionId,
            gameEvents: this.gameEvents,
            failureChains: this.failureChains,
            decisions: this.decisions,
            debugMode: this.debugMode,
            error: this.error
        };
    }

    /**
     * Get filtered game events based on current context
     * @returns {Array} Filtered game events
     */
    getFilteredEvents() {
        let filtered = [...this.gameEvents];
        
        // Filter by concept if specified
        if (this.concept) {
            filtered = filtered.filter(event => 
                event.primaryConcepts?.includes(this.concept) ||
                event.secondaryConcepts?.includes(this.concept)
            );
        }
        
        // Filter by event ID if specified
        if (this.event) {
            filtered = filtered.filter(event => event.eventId === this.event);
        }
        
        return filtered;
    }

    /**
     * Get highlighted failure nodes based on current context
     * @returns {Array} Array of node IDs that should be highlighted
     */
    getHighlightedNodes() {
        const highlighted = [];
        
        // If a chain is selected, highlight its nodes
        if (this.chainId) {
            const chain = this.failureChains.find(c => c.chainId === this.chainId);
            if (chain?.nodes) {
                highlighted.push(...chain.nodes.map(n => n.nodeId));
            }
        }
        
        // If a concept is selected, find related nodes
        if (this.concept) {
            for (const chain of this.failureChains) {
                for (const node of chain.nodes || []) {
                    if (node.preventionConcepts?.includes(this.concept)) {
                        highlighted.push(node.nodeId);
                    }
                }
            }
        }
        
        return [...new Set(highlighted)]; // Remove duplicates
    }

    /**
     * Get the selected failure chain
     * @returns {Object|null} Selected failure chain or null
     */
    getSelectedChain() {
        if (!this.chainId) return null;
        return this.failureChains.find(c => c.chainId === this.chainId) || null;
    }

    /**
     * Get the selected decision
     * @returns {Object|null} Selected decision or null
     */
    getSelectedDecision() {
        if (!this.decisionId) return null;
        return this.decisions.find(d => d.decisionId === this.decisionId) || null;
    }

    /**
     * Get filtered decisions based on current context
     * @returns {Array} Filtered decisions
     */
    getFilteredDecisions() {
        let filtered = [...this.decisions];
        
        // Filter by concept if specified
        if (this.concept) {
            filtered = filtered.filter(decision =>
                decision.correctPattern?.includes(this.concept) ||
                decision.learnLinks?.includes(this.concept)
            );
        }
        
        return filtered;
    }

    /**
     * Build a learn link URL for a concept
     * @param {string} conceptId - Concept ID to link to
     * @returns {string} URL for the learn link
     */
    buildLearnLink(conceptId) {
        return goToLearn(conceptId, {
            from: NAV_SOURCES.MAPPING,
            event: this.event,
            sessionId: this.sessionId
        });
    }

    /**
     * Get all learn links from current filtered context
     * @returns {Array} Array of { conceptId, url } objects
     */
    getContextLearnLinks() {
        const links = new Set();
        
        // Collect from filtered events
        const events = this.getFilteredEvents();
        for (const event of events) {
            for (const conceptId of event.learnLinks || []) {
                links.add(conceptId);
            }
        }
        
        // Collect from selected chain
        const chain = this.getSelectedChain();
        if (chain?.nodes) {
            for (const node of chain.nodes) {
                for (const conceptId of node.learnLinks || []) {
                    links.add(conceptId);
                }
            }
        }
        
        // Collect from selected decision
        const decision = this.getSelectedDecision();
        if (decision?.learnLinks) {
            for (const conceptId of decision.learnLinks) {
                links.add(conceptId);
            }
        }
        
        return Array.from(links).map(conceptId => ({
            conceptId,
            url: this.buildLearnLink(conceptId)
        }));
    }

    /**
     * Check if there are active filters
     * @returns {boolean} True if any filter is active
     */
    hasActiveFilters() {
        return !!(this.concept || this.event || this.chainId || this.decisionId);
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.concept = null;
        this.event = null;
        this.chainId = null;
        this.decisionId = null;
        // Note: sessionId is preserved as it's context, not a filter
    }

    /**
     * Update a filter value
     * @param {string} filterName - Name of the filter
     * @param {string|null} value - New value or null to clear
     */
    setFilter(filterName, value) {
        switch (filterName) {
            case 'concept':
                this.concept = value;
                break;
            case 'event':
                this.event = value;
                break;
            case 'chainId':
                this.chainId = value;
                break;
            case 'decisionId':
                this.decisionId = value;
                break;
            default:
                console.warn(`MappingHubPage: Unknown filter '${filterName}'`);
        }
    }

    /**
     * Toggle debug mode
     * @returns {boolean} New debug mode state
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        
        try {
            localStorage.setItem('mappingHubDebug', this.debugMode.toString());
        } catch {
            // Ignore storage errors
        }
        
        return this.debugMode;
    }

    /**
     * Get debug information for development
     * @returns {Object} Debug info
     */
    getDebugInfo() {
        return {
            queryParams: {
                concept: this.concept,
                event: this.event,
                sessionId: this.sessionId,
                chainId: this.chainId,
                decisionId: this.decisionId
            },
            dataCounts: {
                gameEvents: this.gameEvents.length,
                failureChains: this.failureChains.length,
                decisions: this.decisions.length
            },
            filtered: {
                events: this.getFilteredEvents().length,
                highlightedNodes: this.getHighlightedNodes().length,
                decisions: this.getFilteredDecisions().length
            },
            hasActiveFilters: this.hasActiveFilters()
        };
    }

    /**
     * Cleanup page resources
     */
    cleanup() {
        this.concept = null;
        this.event = null;
        this.sessionId = null;
        this.chainId = null;
        this.decisionId = null;
        this.gameEvents = [];
        this.failureChains = [];
        this.decisions = [];
        this.initialized = false;
        this.error = null;
        this.debugMode = false;
    }
}

// Export singleton instance and class
export const mappingHubPage = new MappingHubPage();
export { MappingHubPage };
export default mappingHubPage;
