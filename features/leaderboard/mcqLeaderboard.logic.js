/**
 * MCQ Leaderboard Logic
 * Handles ranking and sorting logic for MCQ leaderboards
 * Deterministic, read-only operations only
 */

import { getAttemptsForChallenge, getChallengeSummary } from './mcqLeaderboard.datasource.js';
import { RANKING_RULES, EMPTY_LEADERBOARD_MESSAGES } from './leaderboard.constants.js';

/**
 * Get leaderboard for a specific challenge
 * @param {string} challengeId - The challenge ID
 * @returns {Object} Leaderboard data with rankings
 */
export function getLeaderboardForChallenge(challengeId) {
    if (!challengeId || typeof challengeId !== 'string') {
        return createEmptyLeaderboard(challengeId, EMPTY_LEADERBOARD_MESSAGES.CHALLENGE_NOT_FOUND);
    }

    try {
        // Get attempts from datasource
        const attempts = getAttemptsForChallenge(challengeId);
        
        if (attempts.length === 0) {
            return createEmptyLeaderboard(challengeId, EMPTY_LEADERBOARD_MESSAGES.NO_ATTEMPTS);
        }

        // Get best attempt per user (highest percentage, then lowest time, then earliest)
        const bestAttempts = getBestAttemptPerUser(attempts);
        
        // Sort attempts according to ranking rules
        const sortedAttempts = sortAttemptsByRankingRules(bestAttempts);
        
        // Assign ranks
        const rankedAttempts = assignRanks(sortedAttempts);
        
        // Get summary data
        const summary = getChallengeSummary(challengeId);
        
        return {
            challengeId,
            totalParticipants: summary.totalParticipants,
            totalAttempts: summary.totalAttempts,
            hasData: true,
            message: null,
            leaderboard: rankedAttempts.map(attempt => ({
                rank: attempt.rank,
                userId: attempt.user_id,
                percentage: attempt.percentage,
                timeTaken: attempt.time_taken,
                completedAt: attempt.completed_at
            }))
        };
    } catch (error) {
        console.error('Failed to generate leaderboard for challenge:', challengeId, error);
        return createEmptyLeaderboard(challengeId, EMPTY_LEADERBOARD_MESSAGES.NO_VALID_ATTEMPTS);
    }
}

/**
 * Get leaderboards for multiple challenges
 * @param {Array} challengeIds - Array of challenge IDs
 * @returns {Object} Map of challenge ID to leaderboard data
 */
export function getLeaderboardsForChallenges(challengeIds) {
    if (!Array.isArray(challengeIds)) {
        return {};
    }

    const leaderboards = {};
    
    for (const challengeId of challengeIds) {
        leaderboards[challengeId] = getLeaderboardForChallenge(challengeId);
    }
    
    return leaderboards;
}

/**
 * Get user's rank in a specific challenge
 * @param {string} challengeId - The challenge ID
 * @param {string} userId - The user ID
 * @returns {Object} User's rank information
 */
export function getUserRankInChallenge(challengeId, userId) {
    if (!challengeId || !userId) {
        return {
            found: false,
            rank: null,
            percentage: null,
            timeTaken: null,
            totalParticipants: 0
        };
    }

    const leaderboard = getLeaderboardForChallenge(challengeId);
    
    if (!leaderboard.hasData) {
        return {
            found: false,
            rank: null,
            percentage: null,
            timeTaken: null,
            totalParticipants: 0
        };
    }

    const userEntry = leaderboard.leaderboard.find(entry => entry.userId === userId);
    
    if (!userEntry) {
        return {
            found: false,
            rank: null,
            percentage: null,
            timeTaken: null,
            totalParticipants: leaderboard.totalParticipants
        };
    }

    return {
        found: true,
        rank: userEntry.rank,
        percentage: userEntry.percentage,
        timeTaken: userEntry.timeTaken,
        totalParticipants: leaderboard.totalParticipants
    };
}

/**
 * Get best attempt per user for a challenge
 * @param {Array} attempts - Array of attempts
 * @returns {Array} Array of best attempts per user
 */
function getBestAttemptPerUser(attempts) {
    const userBestAttempts = new Map();
    
    for (const attempt of attempts) {
        const userId = attempt.user_id;
        const existing = userBestAttempts.get(userId);
        
        if (!existing || isBetterAttempt(attempt, existing)) {
            userBestAttempts.set(userId, attempt);
        }
    }
    
    return Array.from(userBestAttempts.values());
}

/**
 * Check if attempt A is better than attempt B using ranking rules
 * @param {Object} attemptA - First attempt
 * @param {Object} attemptB - Second attempt
 * @returns {boolean} True if attemptA is better than attemptB
 */
function isBetterAttempt(attemptA, attemptB) {
    // Rule 1: Higher percentage wins
    if (attemptA.percentage !== attemptB.percentage) {
        return attemptA.percentage > attemptB.percentage;
    }
    
    // Rule 2: Lower time wins (tie-breaker #1)
    if (attemptA.time_taken !== attemptB.time_taken) {
        return attemptA.time_taken < attemptB.time_taken;
    }
    
    // Rule 3: Earlier submission wins (tie-breaker #2)
    return attemptA.completed_at < attemptB.completed_at;
}

/**
 * Sort attempts according to ranking rules
 * @param {Array} attempts - Array of attempts to sort
 * @returns {Array} Sorted array of attempts
 */
function sortAttemptsByRankingRules(attempts) {
    // Create a copy to avoid mutating original
    const sortedAttempts = [...attempts];
    
    sortedAttempts.sort((a, b) => {
        // Rule 1: Higher percentage wins (descending)
        if (a.percentage !== b.percentage) {
            return b.percentage - a.percentage;
        }
        
        // Rule 2: Lower time wins (ascending)
        if (a.time_taken !== b.time_taken) {
            return a.time_taken - b.time_taken;
        }
        
        // Rule 3: Earlier submission wins (ascending)
        return a.completed_at - b.completed_at;
    });
    
    return sortedAttempts;
}

/**
 * Assign ranks to sorted attempts, handling ties correctly
 * @param {Array} sortedAttempts - Array of sorted attempts
 * @returns {Array} Array of attempts with ranks assigned
 */
function assignRanks(sortedAttempts) {
    if (sortedAttempts.length === 0) {
        return [];
    }
    
    const rankedAttempts = [];
    let currentRank = 1;
    
    for (let i = 0; i < sortedAttempts.length; i++) {
        const attempt = { ...sortedAttempts[i] }; // Create copy
        
        // Check if this attempt ties with the previous one
        if (i > 0 && attemptsAreTied(sortedAttempts[i], sortedAttempts[i - 1])) {
            // Use the same rank as previous attempt
            attempt.rank = rankedAttempts[i - 1].rank;
        } else {
            // New rank (could be same as position or skip numbers due to ties)
            attempt.rank = currentRank;
        }
        
        rankedAttempts.push(attempt);
        currentRank = i + 2; // Next available rank (accounting for current position)
    }
    
    return rankedAttempts;
}

/**
 * Check if two attempts are tied (same percentage, time, and completion time)
 * @param {Object} attemptA - First attempt
 * @param {Object} attemptB - Second attempt
 * @returns {boolean} True if attempts are tied
 */
function attemptsAreTied(attemptA, attemptB) {
    return attemptA.percentage === attemptB.percentage &&
           attemptA.time_taken === attemptB.time_taken &&
           attemptA.completed_at === attemptB.completed_at;
}

/**
 * Create empty leaderboard structure
 * @param {string} challengeId - The challenge ID
 * @param {string} message - Message to display
 * @returns {Object} Empty leaderboard structure
 */
function createEmptyLeaderboard(challengeId, message) {
    return {
        challengeId: challengeId || null,
        totalParticipants: 0,
        totalAttempts: 0,
        hasData: false,
        message,
        leaderboard: []
    };
}