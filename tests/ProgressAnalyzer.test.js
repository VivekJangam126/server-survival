/**
 * Progress Analyzer Logic Tests
 * Tests the pure analysis logic without DOM/localStorage
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================================
// PURE FUNCTIONS EXTRACTED FOR TESTING
// These mirror the logic in ProgressAnalyzer.js
// ============================================================

/**
 * Calculate trend direction for a series of values
 * @param {Array} values - Array of numeric values (newest first)
 * @returns {string} "UP", "DOWN", or "MIXED"
 */
function calculateTrend(values) {
    if (values.length < 2) return "MIXED";

    let upCount = 0;
    let downCount = 0;

    for (let i = 0; i < values.length - 1; i++) {
        const current = values[i];
        const previous = values[i + 1];
        
        if (current > previous) {
            upCount++;
        } else if (current < previous) {
            downCount++;
        }
    }

    if (upCount > downCount) return "UP";
    if (downCount > upCount) return "DOWN";
    return "MIXED";
}

/**
 * Calculate average of numeric array
 */
function calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate budget efficiency (score per dollar spent)
 */
function calculateBudgetEfficiency(session) {
    if (!session || session.budgetUsed <= 0) return 0;
    return session.finalScore / session.budgetUsed;
}

/**
 * Calculate objectives completion rate
 */
function calculateObjectivesRate(session) {
    if (!session || session.objectivesTotal <= 0) return 0;
    return session.objectivesCompleted / session.objectivesTotal;
}

/**
 * Get trend summary from sessions
 */
function getTrendSummary(sessions) {
    if (sessions.length < 2) {
        return null;
    }

    const scores = sessions.map(s => s.finalScore);
    const scoreTrend = calculateTrend(scores);
    
    const avgScore = calculateAverage(scores);
    
    return {
        sessionsAnalyzed: sessions.length,
        scoreTrend,
        averages: {
            score: Math.round(avgScore)
        },
        mostRecentScore: scores[0],
        bestScore: Math.max(...scores),
        worstScore: Math.min(...scores)
    };
}

// ============================================================
// TESTS
// ============================================================

describe('ProgressAnalyzer Logic', () => {
    describe('getTrendSummary', () => {
        it('returns null for empty sessions', () => {
            const result = getTrendSummary([]);
            expect(result).toBeNull();
        });

        it('returns null for single session (no trend possible)', () => {
            const sessions = [
                { finalScore: 100, mode: 'PLAY', startTime: 1000 }
            ];
            
            const result = getTrendSummary(sessions);
            expect(result).toBeNull();
        });

        it('detects positive trend when scores increase', () => {
            // Sessions are sorted newest first
            const sessions = [
                { finalScore: 300, mode: 'PLAY', startTime: 3000 },
                { finalScore: 200, mode: 'PLAY', startTime: 2000 },
                { finalScore: 100, mode: 'PLAY', startTime: 1000 }
            ];
            
            const result = getTrendSummary(sessions);
            
            expect(result.scoreTrend).toBe('UP');
            expect(result.mostRecentScore).toBe(300);
            expect(result.bestScore).toBe(300);
        });

        it('detects negative trend when scores decrease', () => {
            // Sessions are sorted newest first
            const sessions = [
                { finalScore: 100, mode: 'PLAY', startTime: 3000 },
                { finalScore: 200, mode: 'PLAY', startTime: 2000 },
                { finalScore: 300, mode: 'PLAY', startTime: 1000 }
            ];
            
            const result = getTrendSummary(sessions);
            
            expect(result.scoreTrend).toBe('DOWN');
            expect(result.worstScore).toBe(100);
        });

        it('returns MIXED for fluctuating scores', () => {
            const sessions = [
                { finalScore: 100, mode: 'PLAY', startTime: 3000 },
                { finalScore: 300, mode: 'PLAY', startTime: 2000 },
                { finalScore: 200, mode: 'PLAY', startTime: 1000 }
            ];
            
            const result = getTrendSummary(sessions);
            
            expect(result.scoreTrend).toBe('MIXED');
        });
    });

    describe('calculateBudgetEfficiency', () => {
        it('returns 0 for null session', () => {
            expect(calculateBudgetEfficiency(null)).toBe(0);
        });

        it('returns 0 when no budget used', () => {
            const session = { finalScore: 100, budgetUsed: 0 };
            expect(calculateBudgetEfficiency(session)).toBe(0);
        });

        it('calculates correct efficiency ratio', () => {
            const session = { finalScore: 500, budgetUsed: 100 };
            expect(calculateBudgetEfficiency(session)).toBe(5);
        });
    });

    describe('calculateObjectivesRate', () => {
        it('returns 0 for null session', () => {
            expect(calculateObjectivesRate(null)).toBe(0);
        });

        it('returns 0 when no objectives total', () => {
            const session = { objectivesCompleted: 3, objectivesTotal: 0 };
            expect(calculateObjectivesRate(session)).toBe(0);
        });

        it('calculates correct completion rate', () => {
            const session = { objectivesCompleted: 3, objectivesTotal: 5 };
            expect(calculateObjectivesRate(session)).toBe(0.6);
        });
    });

    describe('handles malformed session safely', () => {
        it('handles null session', () => {
            expect(calculateBudgetEfficiency(null)).toBe(0);
            expect(calculateObjectivesRate(null)).toBe(0);
        });

        it('handles session with negative budgetUsed', () => {
            const session = { finalScore: 100, budgetUsed: -10 };
            expect(calculateBudgetEfficiency(session)).toBe(0);
        });
    });
});
