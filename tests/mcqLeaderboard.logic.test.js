/**
 * MCQ Leaderboard Ranking Logic Tests
 * Tests the pure sorting and ranking logic
 */
import { describe, it, expect } from 'vitest';

// ============================================================
// PURE FUNCTIONS EXTRACTED FOR TESTING
// These mirror the logic in mcqLeaderboard.logic.js
// ============================================================

/**
 * Sort attempts according to ranking rules
 * Rule 1: Higher percentage wins
 * Rule 2: Lower time_taken wins (tie-breaker)
 * Rule 3: Earlier completed_at wins (tie-breaker #2)
 */
function sortAttemptsByRankingRules(attempts) {
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
 * Check if two attempts are tied
 */
function attemptsAreTied(attemptA, attemptB) {
    return attemptA.percentage === attemptB.percentage &&
           attemptA.time_taken === attemptB.time_taken &&
           attemptA.completed_at === attemptB.completed_at;
}

/**
 * Assign ranks to sorted attempts, handling ties correctly
 */
function assignRanks(sortedAttempts) {
    if (sortedAttempts.length === 0) {
        return [];
    }
    
    const rankedAttempts = [];
    let currentRank = 1;
    
    for (let i = 0; i < sortedAttempts.length; i++) {
        const attempt = { ...sortedAttempts[i] };
        
        if (i > 0 && attemptsAreTied(sortedAttempts[i], sortedAttempts[i - 1])) {
            attempt.rank = rankedAttempts[i - 1].rank;
        } else {
            attempt.rank = currentRank;
        }
        
        rankedAttempts.push(attempt);
        currentRank = i + 2;
    }
    
    return rankedAttempts;
}

// ============================================================
// TESTS
// ============================================================

describe('MCQ Leaderboard Ranking Logic', () => {
    describe('sortAttemptsByRankingRules', () => {
        it('ranks higher percentage first', () => {
            const attempts = [
                { user_id: 'user1', percentage: 70, time_taken: 100, completed_at: 1000 },
                { user_id: 'user2', percentage: 90, time_taken: 100, completed_at: 1000 },
                { user_id: 'user3', percentage: 80, time_taken: 100, completed_at: 1000 }
            ];
            
            const result = sortAttemptsByRankingRules(attempts);
            
            expect(result[0].percentage).toBe(90);
            expect(result[1].percentage).toBe(80);
            expect(result[2].percentage).toBe(70);
        });

        it('ranks lower time_taken higher on percentage tie', () => {
            const attempts = [
                { user_id: 'user1', percentage: 80, time_taken: 120, completed_at: 1000 },
                { user_id: 'user2', percentage: 80, time_taken: 60, completed_at: 1000 },
                { user_id: 'user3', percentage: 80, time_taken: 90, completed_at: 1000 }
            ];
            
            const result = sortAttemptsByRankingRules(attempts);
            
            expect(result[0].time_taken).toBe(60);
            expect(result[1].time_taken).toBe(90);
            expect(result[2].time_taken).toBe(120);
        });

        it('ranks earlier completed_at higher on percentage and time tie', () => {
            const attempts = [
                { user_id: 'user1', percentage: 80, time_taken: 60, completed_at: 3000 },
                { user_id: 'user2', percentage: 80, time_taken: 60, completed_at: 1000 },
                { user_id: 'user3', percentage: 80, time_taken: 60, completed_at: 2000 }
            ];
            
            const result = sortAttemptsByRankingRules(attempts);
            
            expect(result[0].completed_at).toBe(1000);
            expect(result[1].completed_at).toBe(2000);
            expect(result[2].completed_at).toBe(3000);
        });
    });

    describe('assignRanks', () => {
        it('assigns sequential ranks to different scores', () => {
            const sorted = [
                { user_id: 'user1', percentage: 90, time_taken: 60, completed_at: 1000 },
                { user_id: 'user2', percentage: 80, time_taken: 60, completed_at: 1000 },
                { user_id: 'user3', percentage: 70, time_taken: 60, completed_at: 1000 }
            ];
            
            const result = assignRanks(sorted);
            
            expect(result[0].rank).toBe(1);
            expect(result[1].rank).toBe(2);
            expect(result[2].rank).toBe(3);
        });

        it('identical scores preserve stable ordering with same rank', () => {
            const sorted = [
                { user_id: 'user1', percentage: 80, time_taken: 60, completed_at: 1000 },
                { user_id: 'user2', percentage: 80, time_taken: 60, completed_at: 1000 },
                { user_id: 'user3', percentage: 70, time_taken: 60, completed_at: 1000 }
            ];
            
            const result = assignRanks(sorted);
            
            // Both tied users get rank 1
            expect(result[0].rank).toBe(1);
            expect(result[1].rank).toBe(1);
            // Third user gets rank 3 (skips 2)
            expect(result[2].rank).toBe(3);
        });

        it('returns empty array for empty input', () => {
            const result = assignRanks([]);
            expect(result).toEqual([]);
        });
    });
});
