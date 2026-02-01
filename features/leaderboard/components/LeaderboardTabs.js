/**
 * LeaderboardTabs Component
 * Renders tab navigation for MCQ and Game leaderboards
 * Stateless, render-only component
 */

class LeaderboardTabs {
    /**
     * Render leaderboard tabs
     * @param {Object} props - Component props
     * @param {string} props.currentTab - Currently active tab ('mcq' or 'game')
     * @param {Function} props.onTabChange - Callback for tab changes
     */
    static render(props) {
        const { currentTab = 'mcq', onTabChange } = props;
        
        const container = document.getElementById('leaderboard-tabs');
        if (!container) {
            console.error('LeaderboardTabs: Container element not found');
            return;
        }

        // Create tabs HTML
        const tabsHTML = `
            <div class="glass-panel rounded-lg p-1 flex">
                <button 
                    id="tab-mcq" 
                    class="px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                        currentTab === 'mcq' ? 'tab-active' : 'tab-inactive hover:text-white'
                    }"
                >
                    MCQ Leaderboard
                </button>
                <button 
                    id="tab-game" 
                    class="px-6 py-2 rounded-md font-medium transition-all duration-200 tab-disabled"
                    disabled
                >
                    Game Leaderboard
                    <span class="text-xs ml-2">(Coming Soon)</span>
                </button>
            </div>
        `;

        // Set HTML
        container.innerHTML = tabsHTML;

        // Add event listeners
        this.bindEvents(onTabChange);
    }

    /**
     * Bind event listeners to tabs
     * @param {Function} onTabChange - Callback for tab changes
     */
    static bindEvents(onTabChange) {
        if (!onTabChange) return;

        // MCQ tab click
        const mcqTab = document.getElementById('tab-mcq');
        if (mcqTab) {
            mcqTab.addEventListener('click', () => {
                onTabChange('mcq');
            });
        }

        // Game tab is disabled, no event listener needed
        const gameTab = document.getElementById('tab-game');
        if (gameTab) {
            gameTab.addEventListener('click', (e) => {
                e.preventDefault();
                // Could show a tooltip or message about coming soon
            });
        }
    }

    /**
     * Get tab configuration
     * @returns {Array} Array of tab configurations
     */
    static getTabConfig() {
        return [
            {
                id: 'mcq',
                label: 'MCQ Leaderboard',
                enabled: true,
                active: true
            },
            {
                id: 'game',
                label: 'Game Leaderboard',
                enabled: false,
                active: false,
                comingSoon: true
            }
        ];
    }
}

// Export to global scope
window.LeaderboardTabs = LeaderboardTabs;