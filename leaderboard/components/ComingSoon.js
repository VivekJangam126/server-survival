/**
 * ComingSoon Component
 * Renders "Coming Soon" placeholder for Game leaderboard
 * Stateless, render-only component
 */

class ComingSoon {
    /**
     * Render coming soon placeholder
     * @param {Object} props - Component props
     * @param {string} props.title - Title text
     * @param {string} props.subtitle - Subtitle text
     * @param {string} props.icon - Icon to display
     */
    static render(props) {
        const { 
            title = 'Game Leaderboard', 
            subtitle = 'Complete challenges to prepare for competitive play',
            icon = '🎮'
        } = props;
        
        const container = document.getElementById('coming-soon');
        if (!container) {
            console.error('ComingSoon: Container element not found');
            return;
        }

        const comingSoonHTML = `
            <div class="glass-panel rounded-xl p-12 text-center max-w-2xl mx-auto">
                <!-- Lock Icon -->
                <div class="coming-soon-icon text-8xl mb-6">
                    🔒
                </div>
                
                <!-- Title -->
                <h2 class="text-3xl font-bold text-white mb-4">
                    ${title}
                </h2>
                
                <!-- Coming Soon Badge -->
                <div class="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                    Coming Soon!
                </div>
                
                <!-- Description -->
                <p class="text-gray-300 text-lg mb-8 leading-relaxed">
                    ${subtitle}
                </p>
                
                <!-- Feature Preview -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <div class="text-2xl mb-2">⚡</div>
                        <h4 class="font-semibold text-white mb-1">Real-time Competition</h4>
                        <p class="text-gray-400 text-sm">Compete with others in live game sessions</p>
                    </div>
                    
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <div class="text-2xl mb-2">🏆</div>
                        <h4 class="font-semibold text-white mb-1">Global Rankings</h4>
                        <p class="text-gray-400 text-sm">See how you rank against players worldwide</p>
                    </div>
                    
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                        <div class="text-2xl mb-2">📈</div>
                        <h4 class="font-semibold text-white mb-1">Performance Metrics</h4>
                        <p class="text-gray-400 text-sm">Track your improvement over time</p>
                    </div>
                </div>
                
                <!-- Call to Action -->
                <div class="bg-blue-900 bg-opacity-30 border border-blue-500 border-opacity-30 rounded-lg p-6">
                    <div class="text-2xl mb-3">${icon}</div>
                    <h3 class="text-xl font-bold text-blue-300 mb-2">Get Ready!</h3>
                    <p class="text-blue-200 mb-4">
                        Practice with MCQ challenges to sharpen your skills before the game leaderboard launches.
                    </p>
                    <button 
                        onclick="window.location.href='../challenges/challenges.html'" 
                        class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                        Practice MCQ Challenges
                    </button>
                </div>
                
                <!-- Progress Indicator -->
                <div class="mt-8 pt-6 border-t border-gray-700">
                    <p class="text-gray-500 text-sm">
                        Development Progress: Game leaderboard system in planning phase
                    </p>
                </div>
            </div>
        `;

        container.innerHTML = comingSoonHTML;
    }

    /**
     * Render simple coming soon message
     * @param {string} message - Custom message
     */
    static renderSimple(message = 'This feature is coming soon.') {
        const container = document.getElementById('coming-soon');
        if (!container) return;

        const simpleHTML = `
            <div class="glass-panel rounded-xl p-8 text-center">
                <div class="text-6xl mb-4">🔒</div>
                <h3 class="text-xl font-bold mb-2 text-gray-300">Coming Soon</h3>
                <p class="text-gray-400">${message}</p>
            </div>
        `;

        container.innerHTML = simpleHTML;
    }

    /**
     * Get coming soon configuration
     * @returns {Object} Configuration object
     */
    static getConfig() {
        return {
            gameLeaderboard: {
                title: 'Game Leaderboard',
                subtitle: 'Complete challenges to prepare for competitive play',
                icon: '🎮',
                features: [
                    { icon: '⚡', title: 'Real-time Competition', description: 'Compete with others in live game sessions' },
                    { icon: '🏆', title: 'Global Rankings', description: 'See how you rank against players worldwide' },
                    { icon: '📈', title: 'Performance Metrics', description: 'Track your improvement over time' }
                ]
            }
        };
    }
}

// Export to global scope
window.ComingSoon = ComingSoon;