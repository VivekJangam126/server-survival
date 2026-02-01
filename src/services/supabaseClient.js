/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for authentication.
 * Uses CDN version for vanilla JavaScript compatibility.
 * 
 * @module supabaseClient
 */

// Supabase configuration
const SUPABASE_URL = 'https://yyhpmkzkfjsxbxipgpig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5aHBta3prZmpzeGJ4aXBncGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NzE1MDksImV4cCI6MjA4NTU0NzUwOX0.LjGADtNxjDLI8p6hNI7YVV1Ajqgj8Rg7odcykMyCLZY';

// Load Supabase from CDN
let supabaseClient = null;
let initPromise = null;

/**
 * Initialize Supabase client (loads from CDN if needed)
 * @returns {Promise<object>} Supabase client instance
 */
async function initSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }
    
    if (initPromise) {
        return initPromise;
    }
    
    initPromise = new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
            resolve(supabaseClient);
            return;
        }
        
        // Load from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
            console.log('Supabase: Client initialized from CDN');
            resolve(supabaseClient);
        };
        script.onerror = () => {
            reject(new Error('Failed to load Supabase from CDN'));
        };
        document.head.appendChild(script);
    });
    
    return initPromise;
}

/**
 * Get the Supabase client (initializes if needed)
 * @returns {Promise<object>} Supabase client instance
 */
export async function getSupabase() {
    return initSupabase();
}

// Export config status for debugging
export const isConfigured = () => {
    return SUPABASE_URL !== 'SUPABASE_URL_PLACEHOLDER' && 
           SUPABASE_ANON_KEY !== 'SUPABASE_ANON_KEY_PLACEHOLDER';
};

// For backward compatibility - will be initialized async
export const supabase = {
    get auth() {
        if (!supabaseClient) {
            console.warn('Supabase not initialized yet. Use getSupabase() for async access.');
            return null;
        }
        return supabaseClient.auth;
    }
};
