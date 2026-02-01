/**
 * Routes Configuration for Learn Mode and Mapping Hub
 * Defines all route patterns, parameters, and lazy-loading configuration
 * 
 * STATIC FILE MODE: Uses HTML file paths for simple HTTP servers
 * 
 * DEPRECATED: Most of this SPA-style logic is unused in multi-entry HTML architecture.
 * Kept for reference only. Do not extend.
 */

/**
 * Route path constants (static file paths)
 */
export const ROUTE_PATHS = {
    LEARN_INDEX: '/public/learn.html',
    LEARN_TUTORIAL: '/public/tutorial.html',
    LEARN_MAPPING: '/public/mapping-hub.html'
};

/**
 * Route configuration for Learn Mode and Mapping Hub
 * Each route supports lazy-loading and query parameters
 */
export const routes = [
    {
        path: '/public/learn.html',
        name: 'learn-index',
        title: 'Learn Mode',
        component: 'LearnPage',
        lazy: true,
        preserveState: true,
        meta: {
            description: 'Browse all available tutorials and learning content',
            requiresAuth: false
        },
        queryParams: ['from', 'event', 'sessionId', 'demo']
    },
    {
        path: '/public/tutorial.html',
        name: 'learn-tutorial',
        title: 'Tutorial',
        component: 'TutorialDetailPage',
        lazy: true,
        preserveState: true,
        meta: {
            description: 'Individual tutorial page for a specific concept',
            requiresAuth: false
        },
        // conceptId passed via query param 'id'
        queryParams: ['id', 'from', 'event', 'sessionId', 'step']
    },
    {
        path: '/public/mapping-hub.html',
        name: 'learn-mapping',
        title: 'Game → Real-World Mapping Hub',
        component: 'MappingHubUI',
        lazy: true,
        preserveState: true,
        meta: {
            description: 'Connect game events to real-world cloud concepts',
            requiresAuth: false
        },
        queryParams: ['concept', 'event', 'sessionId', 'chainId', 'decisionId']
    }
];

/**
 * Route matching utilities
 */

/**
 * Parse a path pattern and extract parameter names
 * @param {string} pattern - Route pattern like '/learn/:conceptId'
 * @returns {string[]} Array of parameter names
 */
export function extractRouteParams(pattern) {
    const paramRegex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
    const params = [];
    let match;
    
    while ((match = paramRegex.exec(pattern)) !== null) {
        params.push(match[1]);
    }
    
    return params;
}

/**
 * Convert a route pattern to a regex for matching
 * @param {string} pattern - Route pattern like '/learn/:conceptId'
 * @returns {RegExp} Compiled regex
 */
export function patternToRegex(pattern) {
    // Escape special regex chars except for our parameter placeholders
    let regexPattern = pattern
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\\:([a-zA-Z_][a-zA-Z0-9_]*)/g, '([^/]+)');
    
    return new RegExp(`^${regexPattern}$`);
}

/**
 * Match a URL path against defined routes
 * @param {string} path - URL path to match
 * @returns {Object|null} Matched route with extracted params, or null
 */
export function matchRoute(path) {
    // Clean the path
    const cleanPath = path.split('?')[0].replace(/\/$/, '') || '/';
    
    // Special case: check for /learn/mapping first (before :conceptId pattern)
    if (cleanPath === '/learn/mapping') {
        const route = routes.find(r => r.path === '/learn/mapping');
        return route ? { route, params: {} } : null;
    }
    
    for (const route of routes) {
        // Skip mapping route as it's already handled
        if (route.path === '/learn/mapping') continue;
        
        const paramNames = extractRouteParams(route.path);
        const regex = patternToRegex(route.path);
        const match = cleanPath.match(regex);
        
        if (match) {
            const params = {};
            paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });
            
            return { route, params };
        }
    }
    
    return null;
}

/**
 * Build a URL from route name and parameters
 * @param {string} routeName - Name of the route
 * @param {Object} params - Route parameters (for learn-tutorial, use { conceptId })
 * @param {Object} query - Query parameters
 * @returns {string} Constructed URL
 */
export function buildUrl(routeName, params = {}, query = {}) {
    const route = routes.find(r => r.name === routeName);
    
    if (!route) {
        console.warn(`Route '${routeName}' not found`);
        return ROUTE_PATHS.LEARN_INDEX;
    }
    
    // For static file routing, use the path directly
    let path = route.path;
    
    // For learn-tutorial, convert conceptId param to 'id' query param
    if (routeName === 'learn-tutorial' && params.conceptId) {
        query.id = params.conceptId;
    }
    
    // Build query string
    const queryString = buildQueryString(query);
    
    return queryString ? `${path}?${queryString}` : path;
}

/**
 * Build a query string from an object
 * @param {Object} query - Query parameters object
 * @returns {string} Query string without leading '?'
 */
export function buildQueryString(query) {
    const entries = Object.entries(query)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    
    return entries.join('&');
}

/**
 * Parse query string from URL
 * @param {string} queryString - Query string (with or without leading '?')
 * @returns {Object} Parsed query parameters
 */
export function parseQueryString(queryString) {
    if (!queryString) return {};
    
    const cleanQuery = queryString.startsWith('?') ? queryString.slice(1) : queryString;
    
    if (!cleanQuery) return {};
    
    const params = {};
    const pairs = cleanQuery.split('&');
    
    for (const pair of pairs) {
        const [key, value] = pair.split('=').map(decodeURIComponent);
        if (key) {
            params[key] = value || '';
        }
    }
    
    return params;
}

/**
 * Get route configuration by name
 * @param {string} routeName - Name of the route
 * @returns {Object|null} Route configuration or null
 */
export function getRouteByName(routeName) {
    return routes.find(r => r.name === routeName) || null;
}

/**
 * Get route configuration by path pattern
 * @param {string} path - Path pattern
 * @returns {Object|null} Route configuration or null
 */
export function getRouteByPath(path) {
    return routes.find(r => r.path === path) || null;
}

/**
 * Check if a route accepts a specific query parameter
 * @param {string} routeName - Name of the route
 * @param {string} paramName - Query parameter name
 * @returns {boolean} Whether the route accepts the parameter
 */
export function routeAcceptsQueryParam(routeName, paramName) {
    const route = getRouteByName(routeName);
    return route?.queryParams?.includes(paramName) || false;
}

export default routes;
