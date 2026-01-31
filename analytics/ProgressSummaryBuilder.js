/**
 * ProgressSummaryBuilder - Pure model composition layer
 * Converts ProgressAnalyzer results into student-friendly summary objects
 * No side effects, no UI dependencies, deterministic output
 */

/**
 * Build a complete progress summary for a mode
 * @param {string} mode - "PLAY" or "SANDBOX"
 * @returns {Object} Complete progress summary object
 */
function getProgressSummary(mode) {
    // Validate mode parameter
    if (mode !== "PLAY" && mode !== "SANDBOX") {
        throw new Error("Mode must be 'PLAY' or 'SANDBOX'");
    }

    // Get all analysis data
    const sessions = ProgressAnalyzer.getSessionsByMode(mode);
    const lastSession = ProgressAnalyzer.getLastSession(mode);
    const comparison = ProgressAnalyzer.getSessionComparison(mode);
    const trends = ProgressAnalyzer.getTrendSummary(mode);
    const bestPerformance = ProgressAnalyzer.getBestPerformance(mode);
    const averagePerformance = ProgressAnalyzer.getAveragePerformance(mode);

    return {
        mode: mode,
        overview: buildOverview(sessions, lastSession),
        recentComparison: buildRecentComparison(comparison),
        trends: buildTrends(trends),
        performance: buildPerformance(bestPerformance, averagePerformance),
        learningInsight: buildLearningInsight(comparison, trends, sessions.length)
    };
}

/**
 * Build overview section
 * @param {Array} sessions - All sessions for the mode
 * @param {Object|null} lastSession - Most recent session
 * @returns {Object} Overview data
 */
function buildOverview(sessions, lastSession) {
    const totalSessions = sessions.length;
    const totalPlayTimeMinutes = sessions.reduce((sum, session) => sum + (session.durationMinutes || 0), 0);
    const lastPlayedAt = lastSession ? lastSession.endTime : null;

    return {
        totalSessions,
        totalPlayTimeMinutes,
        lastPlayedAt
    };
}

/**
 * Build recent comparison section
 * @param {Object|null} comparison - Session comparison data
 * @returns {Object} Recent comparison data
 */
function buildRecentComparison(comparison) {
    if (!comparison) {
        return {
            scoreChange: null,
            scoreTrend: "N/A",
            durationChangeMinutes: null,
            objectivesChange: null,
            failuresChange: null
        };
    }

    return {
        scoreChange: comparison.scoreDelta,
        scoreTrend: comparison.scoreTrend,
        durationChangeMinutes: comparison.durationDelta,
        objectivesChange: comparison.objectivesDelta,
        failuresChange: comparison.failuresDelta
    };
}

/**
 * Build trends section
 * @param {Object|null} trends - Trend analysis data
 * @returns {Object} Trends data
 */
function buildTrends(trends) {
    if (!trends) {
        return {
            score: "N/A",
            duration: "N/A",
            failures: "N/A"
        };
    }

    return {
        score: trends.scoreTrend || "N/A",
        duration: trends.durationTrend || "N/A",
        failures: trends.failureTrend || "N/A"
    };
}

/**
 * Build performance section
 * @param {Object|null} bestPerformance - Best performance data
 * @param {Object|null} averagePerformance - Average performance data
 * @returns {Object} Performance data
 */
function buildPerformance(bestPerformance, averagePerformance) {
    const bestScore = bestPerformance ? bestPerformance.finalScore : null;
    const averageScore = averagePerformance ? averagePerformance.averageScore : null;
    
    // Calculate best duration (shortest successful session)
    let bestDurationMinutes = null;
    if (bestPerformance) {
        bestDurationMinutes = bestPerformance.durationMinutes;
    }
    
    const averageDurationMinutes = averagePerformance ? averagePerformance.averageDuration : null;

    return {
        bestScore,
        averageScore,
        bestDurationMinutes,
        averageDurationMinutes
    };
}

/**
 * Build learning insight section with student-friendly messaging
 * @param {Object|null} comparison - Session comparison data
 * @param {Object|null} trends - Trend analysis data
 * @param {number} sessionCount - Total number of sessions
 * @returns {Object} Learning insight data
 */
function buildLearningInsight(comparison, trends, sessionCount) {
    let isImproving = null;
    let improvementSummary = "";

    // Insufficient data cases
    if (sessionCount === 0) {
        improvementSummary = "Start playing to track your progress.";
        return { isImproving, improvementSummary };
    }

    if (sessionCount === 1) {
        improvementSummary = "Play more sessions to see your improvement trends.";
        return { isImproving, improvementSummary };
    }

    if (sessionCount === 2) {
        // Use comparison data for 2 sessions
        if (comparison) {
            if (comparison.scoreTrend === "UP") {
                isImproving = true;
                improvementSummary = "Great start! Your score improved in your last session.";
            } else if (comparison.scoreTrend === "DOWN") {
                isImproving = false;
                improvementSummary = "Keep practicing. Your next session can be better.";
            } else {
                isImproving = null;
                improvementSummary = "You maintained consistent performance.";
            }
        } else {
            improvementSummary = "Not enough data yet to evaluate progress.";
        }
        return { isImproving, improvementSummary };
    }

    // 3+ sessions - use trend data
    if (!trends) {
        improvementSummary = "Not enough data yet to evaluate progress.";
        return { isImproving, improvementSummary };
    }

    // Analyze multiple trend indicators
    const scoreUp = trends.scoreTrend === "UP";
    const failuresDown = trends.failureTrend === "DOWN";
    const scoreDown = trends.scoreTrend === "DOWN";
    const failuresUp = trends.failureTrend === "UP";

    // Determine improvement status
    if (scoreUp && failuresDown) {
        isImproving = true;
        improvementSummary = "You are consistently improving your performance.";
    } else if (scoreUp && trends.failureTrend !== "UP") {
        isImproving = true;
        improvementSummary = "Your scores are trending upward. Keep it up!";
    } else if (failuresDown && trends.scoreTrend !== "DOWN") {
        isImproving = true;
        improvementSummary = "You are making fewer mistakes over time.";
    } else if (scoreDown && failuresUp) {
        isImproving = false;
        improvementSummary = "Focus on the basics to improve your consistency.";
    } else if (scoreDown) {
        isImproving = false;
        improvementSummary = "Your recent scores need attention. Review your strategy.";
    } else if (failuresUp) {
        isImproving = false;
        improvementSummary = "Try to reduce errors in your next sessions.";
    } else if (trends.scoreTrend === "MIXED" && trends.failureTrend === "MIXED") {
        isImproving = null;
        improvementSummary = "Your results are mixed. Focus on stability.";
    } else if (trends.scoreTrend === "SAME" || trends.scoreTrend === "MIXED") {
        isImproving = null;
        improvementSummary = "You have steady performance. Try new strategies to improve.";
    } else {
        isImproving = null;
        improvementSummary = "Keep playing to establish clearer progress patterns.";
    }

    return { isImproving, improvementSummary };
}

// Export the main function
window.getProgressSummary = getProgressSummary;