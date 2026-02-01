/**
 * Routes Configuration for Learn Mode and Mapping Hub
 * Defines all route patterns, parameters, and lazy-loading configuration
 */

/**
 * Route path constants
 */
export const ROUTE_PATHS = {
    LEARN_INDEX: '/learn',
    LEARN_CONCEPT: '/learn/:conceptId',
    LEARN_MAPPING: '/learn/mapping'
};

/**
 * Route configuration for Learn Mode and Mapping Hub
 * Each route supports lazy-loading and query parameters
 */
export const routes = [
    {
        path: '/learn',
        name: 'learn-index',
        title: 'Learn Mode',
        component: 'LearnIndexPage',
        lazy: true,
        preserveState: true,
        meta: {
            description: 'Browse all available tutorials and learning content',
            requiresAuth: false
        },
        queryParams: ['from', 'event', 'sessionId']
    },
    {
        path: '/learn/:conceptId',
        name: 'learn-tutorial',
        title: 'Tutorial',
        component: 'TutorialPage',
        lazy: true,
        preserveState: true,
        meta: {
            description: 'Individual tutorial page for a specific concept',
            requiresAuth: false
        },
        params: ['conceptId'],
        queryParams: ['from', 'event', 'sessionId', 'step']
    },
    {
        path: '/learn/mapping',
        name: 'learn-mapping',
        title: 'Game → Real-World Mapping Hub',
        component: 'MappingHubPage',
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
 * @param {Object} params - Route parameters
 * @param {Object} query - Query parameters
 * @returns {string} Constructed URL
 */
export function buildUrl(routeName, params = {}, query = {}) {
    const route = routes.find(r => r.name === routeName);
    
    if (!route) {
        console.warn(`Route '${routeName}' not found`);
        return '/learn';
    }
    
    // Build path with parameters
    let path = route.path;
    const paramNames = extractRouteParams(route.path);
    
    for (const paramName of paramNames) {
        if (params[paramName] === undefined) {
            console.warn(`Missing required parameter '${paramName}' for route '${routeName}'`);
            return '/learn';
        }
        path = path.replace(`:${paramName}`, encodeURIComponent(params[paramName]));
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
