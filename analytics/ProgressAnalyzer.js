/**
 * ProgressAnalyzer - Pure, read-only analysis of student progress
 * Computes improvement, trends, and performance summaries from session data
 * No side effects, no UI dependencies, no data mutation
 */
class ProgressAnalyzer {
    /**
     * Get all sessions from localStorage (read-only)
     * @returns {Array} Array of session objects
     */
    static getAllSessions() {
        try {
            const stored = localStorage.getItem("game_sessions");
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error("Failed to read sessions:", error);
            return [];
        }
    }

    /**
     * Get sessions filtered by mode, sorted by start time (newest first)
     * @param {string} mode - "PLAY" or "SANDBOX"
     * @returns {Array} Filtered and sorted session array
     */
    static getSessionsByMode(mode) {
        return this.getAllSessions()
            .filter(session => session.mode === mode)
            .sort((a, b) => b.startTime - a.startTime);
    }

    /**
     * Get the most recent session for a mode
     * @param {string} mode - "PLAY" or "SANDBOX"
     * @returns {Object|null} Latest session or null if none exists
     */
    static getLastSession(mode) {
        const sessions = this.getSessionsByMode(mode);
        return sessions.length > 0 ? sessions[0] : null;
    }

    /**
     * Get the second most recent session for a mode
     * @param {string} mode - "PLAY" or "SANDBOX"
     * @returns {Object|null} Previous session or null if less than 2 sessions
     */
    static getPreviousSession(mode) {
        const sessions = this.getSessionsByMode(mode);
        return sessions.length > 1 ? sessions[1] : null;
    }

    /**
     * Calculate budget efficiency (score per dollar spent)
     * @param {Object} session - Session object
     * @returns {number} Efficiency ratio (score/budgetUsed) or 0 if no budget used
     */
    static calculateBudgetEfficiency(session) {
        if (!session || session.budgetUsed <= 0) return 0;
        return session.finalScore / session.budgetUsed;
    }

    /**
     * Calculate objectives completion rate
     * @param {Object} session - Session object
     * @returns {number} Completion rate (0-1) or 0 if no objectives
     */
    static calculateObjectivesRate(session) {
        if (!session || session.objectivesTotal <= 0) return 0;
        return session.objectivesCompleted / session.objectivesTotal;
    }

    /**
     * Compare last two sessions for a mode
     * @param {string} mode - "PLAY" or "SANDBOX"
     * @returns {Object|null} Comparison object or null if insufficient data
     */
    static getSessionComparison(mode) {
        const lastSession = this.getLastSession(mode);
        const previousSession = this.getPreviousSession(mode);

        if (!lastSession || !previousSession) {
            return null;
        }

        const lastEfficiency = this.calculateBudgetEfficiency(lastSession);
        const prevEfficiency = this.calculateBudgetEfficiency(previousSession);

        const scoreDelta = lastSession.finalScore - previousSession.finalScore;
        const durationDelta = lastSession.durationMinutes - previousSession.durationMinutes;
        const objectivesDelta = lastSession.objectivesCompleted - previousSession.objectivesCompleted;
        const failuresDelta = lastSession.failures - previousSession.failures;
        const budgetEfficiencyDelta = lastEfficiency - prevEfficiency;

        // Determine score trend
        let scoreTrend = "SAME";
        if (scoreDelta > 0) {
            scoreTrend = "UP";
        } else if (scoreDelta < 0) {
            scoreTrend = "DOWN";
        }

        return {
            scoreDelta,
            durationDelta,
            objectivesDelta,
            failuresDelta,
            budgetEfficiencyDelta,
            scoreTrend,
            lastSession: {
                score: lastSession.finalScore,
                duration: lastSession.durationMinutes,
                objectives: lastSession.objectivesCompleted,
                failures: lastSession.failures,
                efficiency: lastEfficiency
            },
            previousSession: {
                score: previousSession.finalScore,
                duration: previousSession.durationMinutes,
                objectives: previousSession.objectivesCompleted,
                failures: previousSession.failures,
                efficiency: prevEfficiency
            }
        };
    }

    /**
     * Analyze trends over the last N sessions
     * @param {string} mode - "PLAY" or "SANDBOX"
     * @param {number} lastN - Number of recent sessions to analyze (default 5)
     * @returns {Object|null} Trend summary or null if insufficient data
     */
    static getTrendSummary(mode, lastN = 5) {
        const sessions = this.getSessionsByMode(mode).slice(0, lastN);
        
        if (sessions.length < 2) {
            return null;
        }

        // Calculate trends
        const scores = sessions.map(s => s.finalScore);
        const durations = sessions.map(s => s.durationMinutes);
        const failures = sessions.map(s => s.failures);
        const objectives = sessions.map(s => this.calculateObjectivesRate(s));

        const scoreTrend = this.calculateTrend(scores);
        const durationTrend = this.calculateTrend(durations);
        const failureTrend = this.calculateTrend(failures);
        const objectivesTrend = this.calculateTrend(objectives);

        // Calculate averages
        const avgScore = this.calculateAverage(scores);
        const avgDuration = this.calculateAverage(durations);
        const avgFailures = this.calculateAverage(failures);
        const avgObjectivesRate = this.calculateAverage(objectives);

        // Success rate (non-failed sessions)
        const successfulSessions = sessions.filter(s => s.result !== "FAILED").length;
        const successRate = successfulSessions / sessions.length;

        return {
            sessionsAnalyzed: sessions.length,
            scoreTrend,
            durationTrend,
            failureTrend,
            objectivesTrend,
            averages: {
                score: Math.round(avgScore),
                durationMinutes: Math.round(avgDuration),
                failures: Math.round(avgFailures * 10) / 10,
                objectivesRate: Math.round(avgObjectivesRate * 100) / 100
            },
            successRate: Math.round(successRate * 100) / 100,
            mostRecentScore: scores[0],
            bestScore: Math.max(...scores),
            worstScore: Math.min(...scores)
        };
    }

    /**
     * Calculate trend direction for a series of values
     * @param {Array} values - Array of numeric values (newest first)
     * @returns {string} "UP", "DOWN", or "MIXED"
     */
    static calculateTrend(values) {
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
     * @param {Array} values - Array of numbers
     * @returns {number} Average value
     */
    static calculateAverage(values) {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Get best performance session for a mode
     * @param {string} mode - "PLAY" or "SANDBOX"
     * @returns {Object|null} Best session by score or null if no sessions
     */
    static getBestPerformance(mode) {
        const sessions = this.getSessionsByMode(mode);
        
        if (sessions.length === 0) {
            return null;
        }

        return sessions.reduce((best, current) => {
            return current.finalScore > best.finalScore ? current : best;
        });
    }

    /**
     * Get average performance metrics for a mode
     * @param {string} mode - "PLAY" or "SANDBOX"
     * @returns {Object|null} Average metrics or null if no sessions
     */
    static getAveragePerformance(mode) {
        const sessions = this.getSessionsByMode(mode);
        
        if (sessions.length === 0) {
            return null;
        }

        const scores = sessions.map(s => s.finalScore);
        const durations = sessions.map(s => s.durationMinutes);
        const objectives = sessions.map(s => this.calculateObjectivesRate(s));
        const failures = sessions.map(s => s.failures);
        const budgetUsed = sessions.map(s => s.budgetUsed);
        const servicesDeployed = sessions.map(s => s.servicesDeployed);

        // Count results
        const completedCount = sessions.filter(s => s.result === "COMPLETED").length;
        const failedCount = sessions.filter(s => s.result === "FAILED").length;
        const exitedCount = sessions.filter(s => s.result === "EXITED").length;
        const saveUsedCount = sessions.filter(s => s.saveUsed).length;

        return {
            totalSessions: sessions.length,
            averageScore: Math.round(this.calculateAverage(scores)),
            averageDuration: Math.round(this.calculateAverage(durations)),
            averageObjectivesRate: Math.round(this.calculateAverage(objectives) * 100) / 100,
            averageFailures: Math.round(this.calculateAverage(failures) * 10) / 10,
            averageBudgetUsed: Math.round(this.calculateAverage(budgetUsed)),
            averageServicesDeployed: Math.round(this.calculateAverage(servicesDeployed) * 10) / 10,
            completionRate: Math.round((completedCount / sessions.length) * 100) / 100,
            failureRate: Math.round((failedCount / sessions.length) * 100) / 100,
            exitRate: Math.round((exitedCount / sessions.length) * 100) / 100,
            saveUsageRate: Math.round((saveUsedCount / sessions.length) * 100) / 100,
            resultBreakdown: {
                completed: completedCount,
                failed: failedCount,
                exited: exitedCount
            }
        };
    }

    /**
     * Get learning progress indicators
     * @param {string} mode - "PLAY" or "SANDBOX"
     * @returns {Object|null} Learning progress metrics or null if insufficient data
     */
    static getLearningProgress(mode) {
        const sessions = this.getSessionsByMode(mode);
        
        if (sessions.length < 3) {
            return null;
        }

        // Compare first third vs last third of sessions
        const totalSessions = sessions.length;
        const thirdSize = Math.floor(totalSessions / 3);
        
        const recentSessions = sessions.slice(0, thirdSize);
        const earlySessions = sessions.slice(-thirdSize);

        const recentAvgScore = this.calculateAverage(recentSessions.map(s => s.finalScore));
        const earlyAvgScore = this.calculateAverage(earlySessions.map(s => s.finalScore));
        
        const recentAvgFailures = this.calculateAverage(recentSessions.map(s => s.failures));
        const earlyAvgFailures = this.calculateAverage(earlySessions.map(s => s.failures));

        const recentSuccessRate = recentSessions.filter(s => s.result !== "FAILED").length / recentSessions.length;
        const earlySuccessRate = earlySessions.filter(s => s.result !== "FAILED").length / earlySessions.length;

        const scoreImprovement = recentAvgScore - earlyAvgScore;
        const failureReduction = earlyAvgFailures - recentAvgFailures;
        const successImprovement = recentSuccessRate - earlySuccessRate;

        return {
            sessionsCompared: thirdSize,
            scoreImprovement: Math.round(scoreImprovement),
            failureReduction: Math.round(failureReduction * 10) / 10,
            successImprovement: Math.round(successImprovement * 100) / 100,
            isImproving: scoreImprovement > 0 && failureReduction > 0,
            recentPerformance: {
                avgScore: Math.round(recentAvgScore),
                avgFailures: Math.round(recentAvgFailures * 10) / 10,
                successRate: Math.round(recentSuccessRate * 100) / 100
            },
            earlyPerformance: {
                avgScore: Math.round(earlyAvgScore),
                avgFailures: Math.round(earlyAvgFailures * 10) / 10,
                successRate: Math.round(earlySuccessRate * 100) / 100
            }
        };
    }
}

// Export for global access
window.ProgressAnalyzer = ProgressAnalyzer;