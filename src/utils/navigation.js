/**
 * Navigation Utility Helpers
 * Provides functions for navigating between Learn Mode, Mapping Hub, and handling context
 */

import { buildUrl, parseQueryString, matchRoute } from '../router/routes.js';

/**
 * Navigation context keys
 */
export const CONTEXT_KEYS = {
    FROM: 'from',
    EVENT: 'event',
    CONCEPT: 'concept',
    SESSION_ID: 'sessionId',
    CHAIN_ID: 'chainId',
    DECISION_ID: 'decisionId',
    STEP: 'step'
};

/**
 * Navigation sources
 */
export const NAV_SOURCES = {
    MAPPING: 'mapping',
    LEARN: 'learn',
    GAME: 'game',
    ANALYSIS: 'analysis',
    DIRECT: 'direct'
};

/**
 * Navigate to a Learn tutorial
 * @param {string} conceptId - The concept ID to navigate to (e.g., 'cache', 'load_balancer')
 * @param {Object} options - Navigation options
 * @param {string} [options.from] - Source of navigation (e.g., 'mapping', 'game')
 * @param {string} [options.event] - Related event ID
 * @param {string} [options.sessionId] - Session ID for context
 * @param {string} [options.step] - Tutorial step
 * @returns {string} Generated URL path with query parameters
 * 
 * @example
 * goToLearn("cache", { from: "mapping", event: "db_failed_first" })
 * // Returns: "/learn/cache?from=mapping&event=db_failed_first"
 */
export function goToLearn(conceptId, options = {}) {
    if (!conceptId) {
        console.warn('goToLearn: conceptId is required');
        return '/learn';
    }
    
    const query = {};
    
    if (options.from) {
        query[CONTEXT_KEYS.FROM] = options.from;
    }
    
    if (options.event) {
        query[CONTEXT_KEYS.EVENT] = options.event;
    }
    
    if (options.sessionId) {
        query[CONTEXT_KEYS.SESSION_ID] = options.sessionId;
    }
    
    if (options.step) {
        query[CONTEXT_KEYS.STEP] = options.step;
    }
    
    return buildUrl('learn-tutorial', { conceptId }, query);
}

/**
 * Navigate to the Learn Mode index page
 * @param {Object} options - Navigation options
 * @param {string} [options.from] - Source of navigation
 * @param {string} [options.sessionId] - Session ID for context
 * @returns {string} Generated URL path with query parameters
 * 
 * @example
 * goToLearnIndex({ from: "game" })
 * // Returns: "/learn?from=game"
 */
export function goToLearnIndex(options = {}) {
    const query = {};
    
    if (options.from) {
        query[CONTEXT_KEYS.FROM] = options.from;
    }
    
    if (options.sessionId) {
        query[CONTEXT_KEYS.SESSION_ID] = options.sessionId;
    }
    
    return buildUrl('learn-index', {}, query);
}

/**
 * Navigate to the Mapping Hub
 * @param {Object} options - Navigation options
 * @param {string} [options.concept] - Concept to highlight/filter
 * @param {string} [options.event] - Event to highlight/filter
 * @param {string} [options.sessionId] - Session ID ('last' for most recent)
 * @param {string} [options.chainId] - Failure chain to display
 * @param {string} [options.decisionId] - Decision to analyze
 * @returns {string} Generated URL path with query parameters
 * 
 * @example
 * goToMapping({ concept: "cache", sessionId: "last" })
 * // Returns: "/learn/mapping?concept=cache&sessionId=last"
 */
export function goToMapping(options = {}) {
    const query = {};
    
    if (options.concept) {
        query[CONTEXT_KEYS.CONCEPT] = options.concept;
    }
    
    if (options.event) {
        query[CONTEXT_KEYS.EVENT] = options.event;
    }
    
    if (options.sessionId) {
        query[CONTEXT_KEYS.SESSION_ID] = options.sessionId;
    }
    
    if (options.chainId) {
        query[CONTEXT_KEYS.CHAIN_ID] = options.chainId;
    }
    
    if (options.decisionId) {
        query[CONTEXT_KEYS.DECISION_ID] = options.decisionId;
    }
    
    return buildUrl('learn-mapping', {}, query);
}

/**
 * Get current navigation context from URL
 * Parses the current URL query parameters and returns a structured context object
 * @returns {Object} Navigation context object
 * @returns {string|null} returns.from - Source of navigation
 * @returns {string|null} returns.event - Related event ID
 * @returns {string|null} returns.concept - Related concept ID
 * @returns {string|null} returns.sessionId - Session ID
 * @returns {string|null} returns.chainId - Failure chain ID
 * @returns {string|null} returns.decisionId - Decision ID
 * @returns {string|null} returns.step - Tutorial step
 * 
 * @example
 * // URL: /learn/cache?from=mapping&event=db_failed_first
 * getNavigationContext()
 * // Returns: { from: "mapping", event: "db_failed_first", concept: null, sessionId: null, ... }
 */
export function getNavigationContext() {
    const queryString = window.location.search;
    const params = parseQueryString(queryString);
    
    return {
        from: params[CONTEXT_KEYS.FROM] || null,
        event: params[CONTEXT_KEYS.EVENT] || null,
        concept: params[CONTEXT_KEYS.CONCEPT] || null,
        sessionId: params[CONTEXT_KEYS.SESSION_ID] || null,
        chainId: params[CONTEXT_KEYS.CHAIN_ID] || null,
        decisionId: params[CONTEXT_KEYS.DECISION_ID] || null,
        step: params[CONTEXT_KEYS.STEP] || null
    };
}

/**
 * Get route parameters from current URL
 * @returns {Object} Route parameters (e.g., { conceptId: 'cache' })
 */
export function getRouteParams() {
    const path = window.location.pathname;
    const matched = matchRoute(path);
    
    return matched?.params || {};
}

/**
 * Get current route information
 * @returns {Object} Current route info including name, params, and query
 */
export function getCurrentRouteInfo() {
    const path = window.location.pathname;
    const matched = matchRoute(path);
    const context = getNavigationContext();
    
    return {
        path,
        route: matched?.route || null,
        params: matched?.params || {},
        query: context,
        fullUrl: window.location.href
    };
}

/**
 * Check if navigation came from Mapping Hub
 * Used to determine if "Back to Mapping" CTA should be shown
 * @returns {boolean} True if navigated from mapping
 */
export function isFromMapping() {
    const context = getNavigationContext();
    return context.from === NAV_SOURCES.MAPPING;
}

/**
 * Check if navigation came from Game
 * @returns {boolean} True if navigated from game
 */
export function isFromGame() {
    const context = getNavigationContext();
    return context.from === NAV_SOURCES.GAME;
}

/**
 * Build a "Back to Mapping" URL preserving original context
 * @returns {string} URL to navigate back to mapping with preserved context
 */
export function buildBackToMappingUrl() {
    const context = getNavigationContext();
    const routeParams = getRouteParams();
    
    const options = {};
    
    // Preserve event context
    if (context.event) {
        options.event = context.event;
    }
    
    // Preserve session context
    if (context.sessionId) {
        options.sessionId = context.sessionId;
    }
    
    // Add current concept as context for mapping
    if (routeParams.conceptId) {
        options.concept = routeParams.conceptId;
    }
    
    return goToMapping(options);
}

/**
 * Build a "Back to Learn" URL
 * @returns {string} URL to navigate back to learn index
 */
export function buildBackToLearnUrl() {
    const context = getNavigationContext();
    
    const options = {};
    
    if (context.sessionId) {
        options.sessionId = context.sessionId;
    }
    
    return goToLearnIndex(options);
}

/**
 * Navigate to a URL (updates browser location)
 * @param {string} url - URL to navigate to
 * @param {Object} options - Navigation options
 * @param {boolean} [options.replace=false] - Replace current history entry
 */
export function navigateTo(url, options = {}) {
    if (options.replace) {
        window.location.replace(url);
    } else {
        window.location.href = url;
    }
}

/**
 * Update URL without full page reload (for SPA-like behavior)
 * @param {string} url - URL to update to
 * @param {Object} state - State object for history
 * @param {boolean} [replace=false] - Replace current history entry
 */
export function updateUrl(url, state = {}, replace = false) {
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method](state, '', url);
}

/**
 * Build back navigation info based on current context
 * @returns {Object} Back navigation info
 * @returns {boolean} returns.shouldShowBackToMapping - Whether to show back to mapping CTA
 * @returns {string|null} returns.backUrl - URL for back navigation
 * @returns {string} returns.backLabel - Label for back button
 */
export function getBackNavigationInfo() {
    const context = getNavigationContext();
    
    if (context.from === NAV_SOURCES.MAPPING) {
        return {
            shouldShowBackToMapping: true,
            backUrl: buildBackToMappingUrl(),
            backLabel: 'Back to Mapping Hub'
        };
    }
    
    if (context.from === NAV_SOURCES.GAME) {
        return {
            shouldShowBackToMapping: false,
            backUrl: null, // Game handles its own navigation
            backLabel: 'Back to Game'
        };
    }
    
    // Default: back to learn index
    return {
        shouldShowBackToMapping: false,
        backUrl: buildBackToLearnUrl(),
        backLabel: 'Back to Learn'
    };
}

/**
 * Validate a concept ID against known tutorials
 * @param {string} conceptId - Concept ID to validate
 * @param {Array} tutorials - Array of tutorial objects with 'id' property
 * @returns {boolean} True if valid
 */
export function isValidConceptId(conceptId, tutorials) {
    if (!conceptId || !Array.isArray(tutorials)) {
        return false;
    }
    
    return tutorials.some(tutorial => tutorial.id === conceptId);
}

/**
 * Get redirect URL for invalid routes
 * @param {string} reason - Reason for redirect
 * @returns {string} Redirect URL
 */
export function getInvalidRouteRedirect(reason = 'unknown') {
    console.warn(`Navigation: Redirecting due to ${reason}`);
    return '/learn';
}

export default {
    goToLearn,
    goToLearnIndex,
    goToMapping,
    getNavigationContext,
    getRouteParams,
    getCurrentRouteInfo,
    isFromMapping,
    isFromGame,
    buildBackToMappingUrl,
    buildBackToLearnUrl,
    navigateTo,
    updateUrl,
    getBackNavigationInfo,
    isValidConceptId,
    getInvalidRouteRedirect,
    CONTEXT_KEYS,
    NAV_SOURCES
};
