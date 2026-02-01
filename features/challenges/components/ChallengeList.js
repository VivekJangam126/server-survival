/**
 * ChallengeList Component
 * Renders the list of available MCQ challenges
 * Pure rendering component - no business logic
 */

class ChallengeList {
    /**
     * Render challenge list
     * @param {Array} challenges - Array of challenge objects
     * @param {Array} userAttempts - Array of user attempt objects
     * @param {Function} onChallengeSelect - Callback when challenge is selected
     */
    static render(challenges, userAttempts, onChallengeSelect) {
        const container = document.getElementById('challenge-list');
        if (!container) {
            console.error('Challenge list container not found');
            return;
        }

        // Handle empty state
        if (!challenges || challenges.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        // Group challenges by concept for better organization
        const challengesByDifficulty = this.groupChallengesByDifficulty(challenges);
        
        container.innerHTML = `
            <div class="space-y-8 scrollable-container">
                ${this.renderDifficultySection('beginner', 'Beginner Challenges', challengesByDifficulty.beginner, userAttempts, onChallengeSelect)}
                ${this.renderDifficultySection('intermediate', 'Intermediate Challenges', challengesByDifficulty.intermediate, userAttempts, onChallengeSelect)}
            </div>
        `;

        // Attach event listeners
        this.attachEventListeners(challenges, onChallengeSelect);
    }

    /**
     * Group challenges by difficulty level
     * @param {Array} challenges - Array of challenges
     * @returns {Object} Challenges grouped by difficulty
     */
    static groupChallengesByDifficulty(challenges) {
        return challenges.reduce((groups, challenge) => {
            const difficulty = challenge.difficulty || 'beginner';
            if (!groups[difficulty]) {
                groups[difficulty] = [];
            }
            groups[difficulty].push(challenge);
            return groups;
        }, {});
    }

    /**
     * Render a difficulty section
     * @param {string} difficulty - Difficulty level
     * @param {string} title - Section title
     * @param {Array} challenges - Challenges for this difficulty
     * @param {Array} userAttempts - User attempts
     * @param {Function} onChallengeSelect - Selection callback
     * @returns {string} HTML string
     */
    static renderDifficultySection(difficulty, title, challenges, userAttempts, onChallengeSelect) {
        if (!challenges || challenges.length === 0) {
            return '';
        }

        return `
            <div class="difficulty-section">
                <h2 class="text-2xl font-bold mb-6 text-gray-200">${title}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${challenges.map(challenge => 
                        this.renderChallengeCard(challenge, userAttempts)
                    ).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render a single challenge card
     * @param {Object} challenge - Challenge object
     * @param {Array} userAttempts - User attempts
     * @returns {string} HTML string
     */
    static renderChallengeCard(challenge, userAttempts) {
        const status = this.getChallengeStatus(challenge, userAttempts);
        const difficultyClass = `difficulty-${challenge.difficulty}`;
        
        return `
            <div class="challenge-card glass-panel rounded-xl p-6 ${difficultyClass}" 
                 data-challenge-id="${challenge.mcq_challenge_id}">
                
                <!-- Challenge Header -->
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-white mb-1">${challenge.title}</h3>
                        <p class="text-sm text-gray-400">${challenge.concept}</p>
                    </div>
                    <div class="ml-4">
                        ${this.renderDifficultyBadge(challenge.difficulty)}
                    </div>
                </div>

                <!-- Challenge Description -->
                <p class="text-gray-300 text-sm mb-4 line-clamp-2">${challenge.description}</p>

                <!-- Challenge Stats -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="text-center">
                        <div class="text-xl font-bold text-blue-400">${challenge.question_count}</div>
                        <div class="text-xs text-gray-400 uppercase tracking-wide">Questions</div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-green-400">${this.formatTime(challenge.time_limit)}</div>
                        <div class="text-xs text-gray-400 uppercase tracking-wide">Time Limit</div>
                    </div>
                </div>

                <!-- Challenge Status -->
                <div class="mb-4">
                    ${this.renderStatusBadge(status)}
                </div>

                <!-- Action Button -->
                <button class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 challenge-start-btn"
                        data-challenge-id="${challenge.mcq_challenge_id}">
                    ${status.attempted ? 'Retry Challenge' : 'Start Challenge'}
                </button>
            </div>
        `;
    }

    /**
     * Get challenge status for a user
     * @param {Object} challenge - Challenge object
     * @param {Array} userAttempts - User attempts
     * @returns {Object} Status object
     */
    static getChallengeStatus(challenge, userAttempts) {
        const challengeAttempts = userAttempts.filter(
            attempt => attempt.mcq_challenge_id === challenge.mcq_challenge_id
        );

        if (challengeAttempts.length === 0) {
            return {
                attempted: false,
                status: 'Not Attempted',
                bestScore: null,
                attemptCount: 0
            };
        }

        // Find best attempt (highest percentage)
        const bestAttempt = challengeAttempts.reduce((best, current) => 
            current.percentage > best.percentage ? current : best
        );

        return {
            attempted: true,
            status: 'Attempted',
            bestScore: bestAttempt.percentage,
            attemptCount: challengeAttempts.length,
            bestAttempt
        };
    }

    /**
     * Render difficulty badge
     * @param {string} difficulty - Difficulty level
     * @returns {string} HTML string
     */
    static renderDifficultyBadge(difficulty) {
        const colors = {
            beginner: 'bg-green-900/30 text-green-300 border-green-700',
            intermediate: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
            advanced: 'bg-red-900/30 text-red-300 border-red-700'
        };

        const colorClass = colors[difficulty] || colors.beginner;

        return `
            <span class="px-2 py-1 text-xs font-medium rounded-full border ${colorClass}">
                ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
        `;
    }

    /**
     * Render status badge
     * @param {Object} status - Status object
     * @returns {string} HTML string
     */
    static renderStatusBadge(status) {
        if (!status.attempted) {
            return `
                <div class="flex items-center justify-center py-2">
                    <span class="text-gray-400 text-sm">Not attempted yet</span>
                </div>
            `;
        }

        return `
            <div class="flex items-center justify-between py-2">
                <div class="flex items-center gap-2">
                    <span class="text-green-400 text-sm">✓ Attempted</span>
                    <span class="text-gray-400 text-xs">(${status.attemptCount}x)</span>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold text-yellow-400">${status.bestScore}%</div>
                    <div class="text-xs text-gray-400">Best Score</div>
                </div>
            </div>
        `;
    }

    /**
     * Format time in seconds to readable string
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes === 0) {
            return `${remainingSeconds}s`;
        } else if (remainingSeconds === 0) {
            return `${minutes}m`;
        } else {
            return `${minutes}m ${remainingSeconds}s`;
        }
    }

    /**
     * Render empty state
     * @returns {string} HTML string
     */
    static renderEmptyState() {
        return `
            <div class="text-center py-12">
                <div class="glass-panel rounded-xl p-8 max-w-md mx-auto">
                    <div class="text-6xl mb-4">📚</div>
                    <h3 class="text-xl font-bold mb-2">No Challenges Available</h3>
                    <p class="text-gray-400">Check back later for new MCQ challenges.</p>
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners to challenge cards
     * @param {Array} challenges - Array of challenges
     * @param {Function} onChallengeSelect - Selection callback
     */
    static attachEventListeners(challenges, onChallengeSelect) {
        // Add click listeners to start buttons
        document.querySelectorAll('.challenge-start-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const challengeId = button.getAttribute('data-challenge-id');
                const challenge = challenges.find(c => c.mcq_challenge_id === challengeId);
                
                if (challenge && onChallengeSelect) {
                    onChallengeSelect(challenge);
                }
            });
        });

        // Add click listeners to entire cards (for better UX)
        document.querySelectorAll('.challenge-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking the button
                if (e.target.classList.contains('challenge-start-btn')) {
                    return;
                }
                
                const challengeId = card.getAttribute('data-challenge-id');
                const challenge = challenges.find(c => c.mcq_challenge_id === challengeId);
                
                if (challenge && onChallengeSelect) {
                    onChallengeSelect(challenge);
                }
            });
        });
    }
}

// Export for global access
window.ChallengeList = ChallengeList;