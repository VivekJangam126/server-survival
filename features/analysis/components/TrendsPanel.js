/**
 * TrendsPanel - Renders trend indicators for score, duration, and failures
 * Shows simple UP/DOWN/MIXED/N/A indicators with visual styling
 * Pure rendering component - displays trend data only
 */
class TrendsPanel {
    /**
     * Render trends panel with trend data
     * @param {Object} summary - Progress summary object
     */
    static render(summary) {
        const container = document.getElementById('trends-panel');
        if (!container) return;

        const { trends } = summary;

        container.innerHTML = `
            <div class="glass-panel rounded-xl p-6">
                <h2 class="text-xl font-bold mb-6 text-center">Performance Trends</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${this.renderTrendCard('Score Trend', trends.score, '📈', 'Your scoring performance over recent sessions')}
                    ${this.renderTrendCard('Duration Trend', trends.duration, '⏱️', 'How long your sessions are lasting')}
                    ${this.renderTrendCard('Failures Trend', trends.failures, '⚠️', 'Your error rate over time')}
                </div>
                ${this.renderTrendLegend()}
            </div>
        `;
    }

    /**
     * Render a single trend card
     * @param {string} title - Card title
     * @param {string} trend - Trend value (UP/DOWN/MIXED/N/A)
     * @param {string} icon - Emoji icon
     * @param {string} description - Trend description
     * @returns {string} HTML string
     */
    static renderTrendCard(title, trend, icon, description) {
        const { displayText, colorClass, bgClass } = this.getTrendDisplay(trend);

        return `
            <div class="bg-gray-800/50 rounded-lg p-6 text-center">
                <div class="text-3xl mb-3">${icon}</div>
                <h3 class="font-bold mb-2">${title}</h3>
                <div class="${bgClass} rounded-lg py-3 px-4 mb-3">
                    <div class="${colorClass} text-xl font-bold">${displayText}</div>
                </div>
                <p class="text-gray-400 text-sm">${description}</p>
            </div>
        `;
    }

    /**
     * Get display information for a trend value
     * @param {string} trend - Trend value
     * @returns {Object} Display information
     */
    static getTrendDisplay(trend) {
        switch (trend) {
            case 'UP':
                return {
                    displayText: '↗ Improving',
                    colorClass: 'trend-up',
                    bgClass: 'bg-green-900/30 border border-green-700/50'
                };
            case 'DOWN':
                return {
                    displayText: '↘ Declining',
                    colorClass: 'trend-down',
                    bgClass: 'bg-red-900/30 border border-red-700/50'
                };
            case 'MIXED':
                return {
                    displayText: '↕ Variable',
                    colorClass: 'trend-mixed',
                    bgClass: 'bg-yellow-900/30 border border-yellow-700/50'
                };
            case 'SAME':
                return {
                    displayText: '→ Stable',
                    colorClass: 'trend-same',
                    bgClass: 'bg-gray-700/30 border border-gray-600/50'
                };
            case 'N/A':
            default:
                return {
                    displayText: '— No Data',
                    colorClass: 'trend-na',
                    bgClass: 'bg-gray-800/30 border border-gray-600/50'
                };
        }
    }

    /**
     * Render trend legend explaining the indicators
     * @returns {string} HTML string
     */
    static renderTrendLegend() {
        return `
            <div class="mt-6 pt-6 border-t border-gray-700">
                <h4 class="text-sm font-bold text-gray-400 mb-3 text-center">Trend Indicators</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div class="flex items-center gap-2">
                        <span class="trend-up">↗</span>
                        <span class="text-gray-400">Improving</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="trend-down">↘</span>
                        <span class="text-gray-400">Declining</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="trend-mixed">↕</span>
                        <span class="text-gray-400">Variable</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="trend-same">→</span>
                        <span class="text-gray-400">Stable</span>
                    </div>
                </div>
                <div class="text-center mt-3">
                    <div class="flex items-center justify-center gap-2">
                        <span class="trend-na">—</span>
                        <span class="text-gray-400 text-xs">Not enough data for trend analysis</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// Export for global access
window.TrendsPanel = TrendsPanel;