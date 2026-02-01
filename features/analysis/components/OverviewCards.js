/**
 * OverviewCards - Renders overview statistics cards
 * Displays total sessions, play time, best score, and last played
 * Pure rendering component - no analytics calculations
 */
class OverviewCards {
    /**
     * Render overview cards with summary data
     * @param {Object} summary - Progress summary object
     */
    static render(summary) {
        const container = document.getElementById('overview-cards');
        if (!container) return;

        const { overview, performance } = summary;

        // Format last played date
        const lastPlayedText = this.formatLastPlayed(overview.lastPlayedAt);

        // Format play time
        const playTimeText = this.formatPlayTime(overview.totalPlayTimeMinutes);

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Total Sessions Card -->
                <div class="glass-panel rounded-xl p-6 text-center">
                    <div class="text-3xl font-bold text-blue-400 mb-2">${overview.totalSessions}</div>
                    <div class="text-gray-400 text-sm uppercase tracking-wide">Total Sessions</div>
                </div>

                <!-- Play Time Card -->
                <div class="glass-panel rounded-xl p-6 text-center">
                    <div class="text-3xl font-bold text-green-400 mb-2">${playTimeText}</div>
                    <div class="text-gray-400 text-sm uppercase tracking-wide">Play Time</div>
                </div>

                <!-- Best Score Card -->
                <div class="glass-panel rounded-xl p-6 text-center">
                    <div class="text-3xl font-bold text-yellow-400 mb-2">${performance.bestScore || '—'}</div>
                    <div class="text-gray-400 text-sm uppercase tracking-wide">Best Score</div>
                </div>

                <!-- Last Played Card -->
                <div class="glass-panel rounded-xl p-6 text-center">
                    <div class="text-lg font-bold text-purple-400 mb-2">${lastPlayedText}</div>
                    <div class="text-gray-400 text-sm uppercase tracking-wide">Last Played</div>
                </div>
            </div>
        `;
    }

    /**
     * Format last played timestamp to readable text
     * @param {number|null} timestamp - Last played timestamp
     * @returns {string} Formatted date or fallback text
     */
    static formatLastPlayed(timestamp) {
        if (!timestamp) return '—';

        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                return 'Today';
            } else if (diffDays === 1) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else {
                return date.toLocaleDateString();
            }
        } catch (error) {
            return '—';
        }
    }

    /**
     * Format play time minutes to readable text
     * @param {number} minutes - Total play time in minutes
     * @returns {string} Formatted time string
     */
    static formatPlayTime(minutes) {
        if (!minutes || minutes === 0) return '0m';

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours === 0) {
            return `${remainingMinutes}m`;
        } else if (remainingMinutes === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${remainingMinutes}m`;
        }
    }
}

// Export for global access
window.OverviewCards = OverviewCards;