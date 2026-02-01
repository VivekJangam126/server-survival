/**
 * RecentProgress - Renders recent session comparison data
 * Shows changes in score, duration, objectives, and failures
 * Pure rendering component - displays comparison data only
 */
class RecentProgress {
    /**
     * Render recent progress section with comparison data
     * @param {Object} summary - Progress summary object
     */
    static render(summary) {
        const container = document.getElementById('recent-progress');
        if (!container) return;

        const { recentComparison } = summary;

        // Check if we have comparison data
        if (recentComparison.scoreTrend === 'N/A') {
            this.renderNoData(container);
            return;
        }

        container.innerHTML = `
            <div class="glass-panel rounded-xl p-6">
                <h2 class="text-xl font-bold mb-6 text-center">Recent Progress</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    ${this.renderMetricCard('Score', recentComparison.scoreChange, recentComparison.scoreTrend, '🎯')}
                    ${this.renderMetricCard('Duration', recentComparison.durationChangeMinutes, this.getDurationTrend(recentComparison.durationChangeMinutes), '⏱️', 'min')}
                    ${this.renderMetricCard('Objectives', recentComparison.objectivesChange, this.getObjectivesTrend(recentComparison.objectivesChange), '🎯')}
                    ${this.renderMetricCard('Failures', recentComparison.failuresChange, this.getFailuresTrend(recentComparison.failuresChange), '⚠️')}
                </div>
            </div>
        `;
    }

    /**
     * Render no data state
     * @param {HTMLElement} container - Container element
     */
    static renderNoData(container) {
        container.innerHTML = `
            <div class="glass-panel rounded-xl p-6 text-center">
                <h2 class="text-xl font-bold mb-4">Recent Progress</h2>
                <div class="text-gray-400 py-8">
                    <div class="text-4xl mb-4">📈</div>
                    <p>Not enough data yet</p>
                    <p class="text-sm mt-2">Play at least 2 sessions to see your progress comparison</p>
                </div>
            </div>
        `;
    }

    /**
     * Render a metric comparison card
     * @param {string} label - Metric label
     * @param {number|null} change - Change value
     * @param {string} trend - Trend direction
     * @param {string} icon - Emoji icon
     * @param {string} unit - Unit suffix (optional)
     * @returns {string} HTML string
     */
    static renderMetricCard(label, change, trend, icon, unit = '') {
        const { arrow, colorClass, changeText } = this.getChangeDisplay(change, trend, unit);

        return `
            <div class="bg-gray-800/50 rounded-lg p-4 text-center">
                <div class="text-2xl mb-2">${icon}</div>
                <div class="text-sm text-gray-400 mb-1">${label}</div>
                <div class="flex items-center justify-center gap-2">
                    <span class="${colorClass} text-lg font-bold">${arrow}</span>
                    <span class="text-white font-medium">${changeText}</span>
                </div>
            </div>
        `;
    }

    /**
     * Get display information for a change value
     * @param {number|null} change - Change value
     * @param {string} trend - Trend direction
     * @param {string} unit - Unit suffix
     * @returns {Object} Display information
     */
    static getChangeDisplay(change, trend, unit = '') {
        if (change === null || change === undefined) {
            return {
                arrow: '—',
                colorClass: 'text-gray-400',
                changeText: '—'
            };
        }

        const absChange = Math.abs(change);
        const changeText = absChange === 0 ? '0' : `${absChange}${unit}`;

        if (change > 0) {
            return {
                arrow: '↑',
                colorClass: 'trend-up',
                changeText: `+${changeText}`
            };
        } else if (change < 0) {
            return {
                arrow: '↓',
                colorClass: 'trend-down',
                changeText: `-${changeText}`
            };
        } else {
            return {
                arrow: '→',
                colorClass: 'trend-same',
                changeText: changeText
            };
        }
    }

    /**
     * Get trend for duration change (shorter is better)
     * @param {number|null} durationChange - Duration change in minutes
     * @returns {string} Trend direction
     */
    static getDurationTrend(durationChange) {
        if (durationChange === null || durationChange === undefined) return 'N/A';
        if (durationChange > 0) return 'DOWN'; // Longer duration is worse
        if (durationChange < 0) return 'UP';   // Shorter duration is better
        return 'SAME';
    }

    /**
     * Get trend for objectives change (more is better)
     * @param {number|null} objectivesChange - Objectives change
     * @returns {string} Trend direction
     */
    static getObjectivesTrend(objectivesChange) {
        if (objectivesChange === null || objectivesChange === undefined) return 'N/A';
        if (objectivesChange > 0) return 'UP';   // More objectives is better
        if (objectivesChange < 0) return 'DOWN'; // Fewer objectives is worse
        return 'SAME';
    }

    /**
     * Get trend for failures change (fewer is better)
     * @param {number|null} failuresChange - Failures change
     * @returns {string} Trend direction
     */
    static getFailuresTrend(failuresChange) {
        if (failuresChange === null || failuresChange === undefined) return 'N/A';
        if (failuresChange > 0) return 'DOWN'; // More failures is worse
        if (failuresChange < 0) return 'UP';   // Fewer failures is better
        return 'SAME';
    }
}

// Export for global access
window.RecentProgress = RecentProgress;