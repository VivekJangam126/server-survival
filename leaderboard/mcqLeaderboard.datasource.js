/**
 * MCQ Leaderboard Data Source
 * Handles data fetching and filtering for MCQ leaderboards
 * No ranking or sorting - pure data operations
 */

import { getAllAttempts, getAttemptsByChallenge } from '../src/challenges/mcq.attempts.js';
import { REQUIRED_ATTEMPT_FIELDS } from './leaderboard.constants.js';

/**
 * Get attempts for a specific challenge with validation
 * @param {string} challengeId - The challenge ID
 * @returns {Array} Array of valid attempts for the challenge
 */
export function getAttemptsForChallenge(challengeId) {
    if (!challengeId || typeof challengeId !== 'string') {
        console.error('Invalid challenge ID provided');
        return [];
    }

    try {
        // Get attempts from storage
        const attempts = getAttemptsByChallenge(challengeId);
        
        // Filter out invalid attempts
        const validAttempts = attempts.filter(isValidAttemptForLeaderboard);
        
        return validAttempts;
    } catch (error) {
        console.error('Failed to fetch attempts for challenge:', challengeId, error);
        return [];
    }
}

/**
 * Get all challenges that have at least one valid attempt
 * @returns {Array} Array of challenge IDs with attempts
 */
export function getAllChallengesWithAttempts() {
    try {
        // Get all attempts from storage
        const allAttempts = getAllAttempts();
        
        // Filter valid attempts
        const validAttempts = allAttempts.filter(isValidAttemptForLeaderboard);
        
        // Extract unique challenge IDs
        const challengeIds = [...new Set(validAttempts.map(attempt => attempt.mcq_challenge_id))];
        
        return challengeIds.sort(); // Return sorted for consistency
    } catch (error) {
        console.error('Failed to fetch challenges with attempts:', error);
        return [];
    }
}

/**
 * Get attempt count for a specific challenge
 * @param {string} challengeId - The challenge ID
 * @returns {number} Number of valid attempts for the challenge
 */
export function getAttemptCountForChallenge(challengeId) {
    const attempts = getAttemptsForChallenge(challengeId);
    return attempts.length;
}

/**
 * Get unique participant count for a specific challenge
 * @param {string} challengeId - The challenge ID
 * @returns {number} Number of unique participants
 */
export function getParticipantCountForChallenge(challengeId) {
    const attempts = getAttemptsForChallenge(challengeId);
    const uniqueUsers = new Set(attempts.map(attempt => attempt.user_id));
    return uniqueUsers.size;
}

/**
 * Check if challenge has any valid attempts
 * @param {string} challengeId - The challenge ID
 * @returns {boolean} True if challenge has valid attempts
 */
export function challengeHasAttempts(challengeId) {
    return getAttemptCountForChallenge(challengeId) > 0;
}

/**
 * Validate if an attempt is suitable for leaderboard inclusion
 * @param {Object} attempt - The attempt object to validate
 * @returns {boolean} True if attempt is valid for leaderboard
 */
function isValidAttemptForLeaderboard(attempt) {
    if (!attempt || typeof attempt !== 'object') {
        return false;
    }

    // Check all required fields exist
    for (const field of REQUIRED_ATTEMPT_FIELDS) {
        if (!(field in attempt)) {
            return false;
        }
    }

    // Validate field types and values
    if (typeof attempt.user_id !== 'string' || attempt.user_id.length === 0) {
        return false;
    }

    if (typeof attempt.mcq_challenge_id !== 'string' || attempt.mcq_challenge_id.length === 0) {
        return false;
    }

    if (typeof attempt.percentage !== 'number' || attempt.percentage < 0 || attempt.percentage > 100) {
        return false;
    }

    if (typeof attempt.time_taken !== 'number' || attempt.time_taken < 0) {
        return false;
    }

    if (typeof attempt.completed_at !== 'number' || attempt.completed_at <= 0) {
        return false;
    }

    return true;
}

/**
 * Get summary statistics for a challenge
 * @param {string} challengeId - The challenge ID
 * @returns {Object} Summary statistics
 */
export function getChallengeSummary(challengeId) {
    const attempts = getAttemptsForChallenge(challengeId);
    
    if (attempts.length === 0) {
        return {
            challengeId,
            totalAttempts: 0,
            totalParticipants: 0,
            hasData: false
        };
    }

    const uniqueUsers = new Set(attempts.map(attempt => attempt.user_id));
    
    return {
        challengeId,
        totalAttempts: attempts.length,
        totalParticipants: uniqueUsers.size,
        hasData: true
    };
}