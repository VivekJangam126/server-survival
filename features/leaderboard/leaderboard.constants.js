/**
 * Leaderboard Constants
 * Centralized constants for leaderboard system
 * No UI dependencies, pure configuration
 */

// Rank labels for display
export const RANK_LABELS = {
    1: '1st',
    2: '2nd', 
    3: '3rd'
};

// Generate ordinal suffix for any rank number
export function getRankLabel(rank) {
    if (rank <= 0) return '';
    
    // Handle special cases for 1st, 2nd, 3rd
    if (RANK_LABELS[rank]) {
        return RANK_LABELS[rank];
    }
    
    // Handle general case (4th, 5th, etc.)
    const lastDigit = rank % 10;
    const lastTwoDigits = rank % 100;
    
    // Special cases for 11th, 12th, 13th
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
        return `${rank}th`;
    }
    
    // General rules
    switch (lastDigit) {
        case 1: return `${rank}st`;
        case 2: return `${rank}nd`;
        case 3: return `${rank}rd`;
        default: return `${rank}th`;
    }
}

// Empty leaderboard messages
export const EMPTY_LEADERBOARD_MESSAGES = {
    NO_ATTEMPTS: 'No attempts found for this challenge.',
    NO_VALID_ATTEMPTS: 'No valid attempts found for this challenge.',
    CHALLENGE_NOT_FOUND: 'Challenge not found.'
};

// Coming soon messages
export const COMING_SOON_MESSAGES = {
    GAME_LEADERBOARD: 'Game Leaderboard - Coming Soon!',
    FEATURE_PLACEHOLDER: 'This feature is coming soon.'
};

// Leaderboard types
export const LEADERBOARD_TYPES = {
    MCQ: 'mcq',
    GAME: 'game'
};

// Sorting directions
export const SORT_DIRECTION = {
    ASC: 'asc',
    DESC: 'desc'
};

// Ranking rules priority order (locked)
export const RANKING_RULES = {
    PRIMARY: 'percentage',      // Higher percentage wins
    TIE_BREAKER_1: 'time_taken',    // Lower time wins
    TIE_BREAKER_2: 'completed_at'   // Earlier submission wins
};

// Minimum required fields for valid attempt
export const REQUIRED_ATTEMPT_FIELDS = [
    'user_id',
    'mcq_challenge_id', 
    'percentage',
    'time_taken',
    'completed_at'
];