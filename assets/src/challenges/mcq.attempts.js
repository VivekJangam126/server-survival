/**
 * MCQ Attempts Storage
 * Handles persistence of MCQ attempt data to localStorage and Supabase
 * No ranking or sorting - pure storage operations
 * 
 * Now with Supabase backend support and localStorage fallback
 */

import { STORAGE_KEYS, ERROR_MESSAGES } from './challenges.constants.js';
import mcqService from '../services/mcqService.js';

// Track if we're using backend
let useBackend = false;
let currentUserId = null;

/**
 * Initialize the attempts module (check auth status)
 */
async function initializeBackend() {
    try {
        currentUserId = await mcqService.getCurrentUserId();
        useBackend = !!currentUserId;
        console.log('mcq.attempts: Backend mode:', useBackend ? 'enabled' : 'disabled (localStorage only)');
    } catch (error) {
        console.warn('mcq.attempts: Failed to initialize backend, using localStorage', error);
        useBackend = false;
        currentUserId = null;
    }
}

// Initialize on module load
initializeBackend();

// Import for cache clearing (will be lazy loaded)
let clearBackendCacheFn = null;

/**
 * Clear leaderboard cache after saving new attempt
 */
async function clearLeaderboardCache() {
    try {
        if (!clearBackendCacheFn) {
            const module = await import('/features/leaderboard/mcqLeaderboard.datasource.js');
            clearBackendCacheFn = module.clearBackendCache;
        }
        if (clearBackendCacheFn) {
            clearBackendCacheFn();
        }
    } catch (error) {
        // Leaderboard module might not be loaded, ignore
    }
}

/**
 * Save an MCQ attempt to localStorage and optionally to Supabase
 * @param {Object} attempt - The attempt object to save
 * @returns {boolean} True if saved successfully, false otherwise
 */
export async function saveAttempt(attempt) {
    try {
        // Validate attempt object
        if (!isValidAttempt(attempt)) {
            console.error('Invalid attempt object:', attempt);
            return false;
        }

        // Always save to localStorage first (optimistic update)
        const localSaveSuccess = saveAttemptToLocalStorage(attempt);
        
        if (!localSaveSuccess) {
            console.error('Failed to save attempt to localStorage');
            return false;
        }

        // Clear leaderboard cache so it fetches fresh data
        clearLeaderboardCache();

        // Try to save to Supabase if user is authenticated
        await initializeBackend(); // Re-check auth status
        
        if (useBackend && currentUserId) {
            // Fire and forget - don't block on backend save
            mcqService.saveAttempt(attempt)
                .then(result => {
                    if (result.error) {
                        console.warn('mcq.attempts: Backend save failed, localStorage has the data', result.error);
                    } else {
                        console.log('mcq.attempts: Attempt synced to backend');
                        // Clear cache again after backend save
                        clearLeaderboardCache();
                    }
                })
                .catch(err => {
                    console.warn('mcq.attempts: Backend save error', err);
                });
        }
        
        return true;
    } catch (error) {
        console.error('Failed to save attempt:', error);
        return false;
    }
}

/**
 * Save attempt to localStorage only
 * @param {Object} attempt - The attempt object to save
 * @returns {boolean} True if saved successfully
 */
function saveAttemptToLocalStorage(attempt) {
    try {
        const existingAttempts = getAllAttemptsFromLocalStorage();
        existingAttempts.push(attempt);
        localStorage.setItem(STORAGE_KEYS.MCQ_ATTEMPTS, JSON.stringify(existingAttempts));
        return true;
    } catch (error) {
        console.error('Failed to save attempt to localStorage:', error);
        return false;
    }
}

/**
 * Get all attempts from localStorage
 * @returns {Array} Array of all attempt objects
 */
function getAllAttemptsFromLocalStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.MCQ_ATTEMPTS);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to read attempts from localStorage:', error);
        return [];
    }
}

/**
 * Get all attempts from localStorage
 * @returns {Array} Array of all attempt objects
 */
export function getAllAttempts() {
    return getAllAttemptsFromLocalStorage();
}

/**
 * Get attempts for a specific challenge
 * @param {string} challengeId - The challenge ID
 * @returns {Array} Array of attempts for the challenge
 */
export function getAttemptsByChallenge(challengeId) {
    if (!challengeId) {
        console.error('Challenge ID is required');
        return [];
    }

    const allAttempts = getAllAttempts();
    return allAttempts.filter(attempt => attempt.mcq_challenge_id === challengeId);
}

/**
 * Get attempts for a specific user
 * @param {string} userId - The user ID
 * @returns {Array} Array of attempts for the user
 */
export function getAttemptsByUser(userId) {
    if (!userId) {
        console.error('User ID is required');
        return [];
    }

    const allAttempts = getAllAttempts();
    return allAttempts.filter(attempt => attempt.user_id === userId);
}

/**
 * Get attempts for a specific user and challenge combination
 * @param {string} userId - The user ID
 * @param {string} challengeId - The challenge ID
 * @returns {Array} Array of attempts for the user and challenge
 */
export function getAttemptsByUserAndChallenge(userId, challengeId) {
    if (!userId || !challengeId) {
        console.error('Both user ID and challenge ID are required');
        return [];
    }

    const allAttempts = getAllAttempts();
    return allAttempts.filter(attempt => 
        attempt.user_id === userId && attempt.mcq_challenge_id === challengeId
    );
}

/**
 * Get the latest attempt for a user and challenge
 * @param {string} userId - The user ID
 * @param {string} challengeId - The challenge ID
 * @returns {Object|null} Latest attempt or null if none found
 */
export function getLatestAttempt(userId, challengeId) {
    const attempts = getAttemptsByUserAndChallenge(userId, challengeId);
    
    if (attempts.length === 0) {
        return null;
    }

    // Sort by completed_at timestamp (most recent first)
    attempts.sort((a, b) => b.completed_at - a.completed_at);
    return attempts[0];
}

/**
 * Get attempt count for a user and challenge
 * @param {string} userId - The user ID
 * @param {string} challengeId - The challenge ID
 * @returns {number} Number of attempts
 */
export function getAttemptCount(userId, challengeId) {
    return getAttemptsByUserAndChallenge(userId, challengeId).length;
}

/**
 * Check if an attempt exists for a specific attempt ID
 * @param {string} attemptId - The attempt ID
 * @returns {boolean} True if attempt exists, false otherwise
 */
export function attemptExists(attemptId) {
    if (!attemptId) {
        return false;
    }

    const allAttempts = getAllAttempts();
    return allAttempts.some(attempt => attempt.attempt_id === attemptId);
}

/**
 * Get a specific attempt by ID
 * @param {string} attemptId - The attempt ID
 * @returns {Object|null} Attempt object or null if not found
 */
export function getAttemptById(attemptId) {
    if (!attemptId) {
        return null;
    }

    const allAttempts = getAllAttempts();
    return allAttempts.find(attempt => attempt.attempt_id === attemptId) || null;
}

/**
 * Clear all attempts (for testing/reset purposes)
 * @returns {boolean} True if cleared successfully, false otherwise
 */
export function clearAllAttempts() {
    try {
        localStorage.removeItem(STORAGE_KEYS.MCQ_ATTEMPTS);
        return true;
    } catch (error) {
        console.error('Failed to clear attempts:', error);
        return false;
    }
}

/**
 * Validate an attempt object structure
 * @param {Object} attempt - The attempt object to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidAttempt(attempt) {
    if (!attempt || typeof attempt !== 'object') {
        return false;
    }

    // Required fields
    const requiredFields = [
        'attempt_id',
        'user_id',
        'mcq_challenge_id',
        'score',
        'total_questions',
        'percentage',
        'time_taken',
        'completed_at'
    ];

    // Check all required fields exist
    for (const field of requiredFields) {
        if (!(field in attempt)) {
            console.error(`Missing required field: ${field}`);
            return false;
        }
    }

    // Validate data types and ranges
    if (typeof attempt.attempt_id !== 'string' || attempt.attempt_id.length === 0) {
        console.error('Invalid attempt_id');
        return false;
    }

    if (typeof attempt.user_id !== 'string' || attempt.user_id.length === 0) {
        console.error('Invalid user_id');
        return false;
    }

    if (typeof attempt.mcq_challenge_id !== 'string' || attempt.mcq_challenge_id.length === 0) {
        console.error('Invalid mcq_challenge_id');
        return false;
    }

    if (typeof attempt.score !== 'number' || attempt.score < 0) {
        console.error('Invalid score');
        return false;
    }

    if (typeof attempt.total_questions !== 'number' || attempt.total_questions <= 0) {
        console.error('Invalid total_questions');
        return false;
    }

    if (typeof attempt.percentage !== 'number' || attempt.percentage < 0 || attempt.percentage > 100) {
        console.error('Invalid percentage');
        return false;
    }

    if (typeof attempt.time_taken !== 'number' || attempt.time_taken < 0) {
        console.error('Invalid time_taken');
        return false;
    }

    if (typeof attempt.completed_at !== 'number' || attempt.completed_at <= 0) {
        console.error('Invalid completed_at');
        return false;
    }

    // Validate score doesn't exceed total questions
    if (attempt.score > attempt.total_questions) {
        console.error('Score cannot exceed total questions');
        return false;
    }

    return true;
}

/**
 * Reinitialize backend connection (call on auth state change)
 */
export async function reinitializeBackend() {
    await initializeBackend();
}

/**
 * Check if backend sync is enabled
 * @returns {boolean} True if using backend
 */
export function isUsingBackend() {
    return useBackend;
}

/**
 * Get current authenticated user ID
 * @returns {string|null} User ID or null
 */
export function getCurrentUserId() {
    return currentUserId;
}