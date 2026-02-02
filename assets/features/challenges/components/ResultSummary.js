/**
 * ResultSummary Component
 * Renders the challenge completion results
 * Pure rendering component - no business logic
 */

class ResultSummary {
    /**
     * Render result summary
     * @param {Object} data - Result data
     * @param {Object} data.challenge - Challenge object
     * @param {Object} data.result - Result object from engine
     * @param {Function} data.onReturnToList - Return to list callback
     * @param {Function} data.onRetryChallenge - Retry challenge callback
     */
    static render(data) {
        const container = document.getElementById('result-summary');
        if (!container) {
            console.error('Result summary container not found');
            return;
        }

        const { challenge, result, onReturnToList, onRetryChallenge } = data;

        if (!challenge || !result) {
            container.innerHTML = this.renderErrorState('Result data not available');
            return;
        }

        const { attempt, results } = result;

        container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-6">
                <!-- Result Header -->
                ${this.renderResultHeader(challenge, attempt)}
                
                <!-- Score Summary -->
                ${this.renderScoreSummary(attempt, results)}
                
                <!-- Detailed Results -->
                ${this.renderDetailedResults(results)}
                
                <!-- Action Buttons -->
                ${this.renderActionButtons(onReturnToList, onRetryChallenge)}
            </div>
        `;

        // Attach event listeners
        this.attachEventListeners(data);
    }

    /**
     * Render result header with challenge info
     * @param {Object} challenge - Challenge object
     * @param {Object} attempt - Attempt object
     * @returns {string} HTML string
     */
    static renderResultHeader(challenge, attempt) {
        const completedAt = new Date(attempt.completed_at).toLocaleString();
        
        return `
            <div class="glass-panel rounded-xl p-8 text-center">
                <div class="mb-6">
                    ${this.renderResultIcon(attempt.percentage)}
                </div>
                
                <h1 class="text-3xl font-bold text-white mb-2">Challenge Complete!</h1>
                <h2 class="text-xl text-gray-300 mb-4">${this.escapeHtml(challenge.title)}</h2>
                
                <div class="flex items-center justify-center gap-4 text-sm text-gray-400">
                    <span>${challenge.concept}</span>
                    <span>•</span>
                    <span class="capitalize">${challenge.difficulty}</span>
                    <span>•</span>
                    <span>Completed ${completedAt}</span>
                </div>
            </div>
        `;
    }

    /**
     * Render score summary cards
     * @param {Object} attempt - Attempt object
     * @param {Object} results - Detailed results
     * @returns {string} HTML string
     */
    static renderScoreSummary(attempt, results) {
        const performanceLevel = this.getPerformanceLevel(attempt.percentage);
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Score Card -->
                <div class="glass-panel rounded-xl p-6 text-center">
                    <div class="text-4xl font-bold text-blue-400 mb-2">
                        ${attempt.score}/${attempt.total_questions}
                    </div>
                    <div class="text-gray-400 text-sm uppercase tracking-wide">Score</div>
                </div>

                <!-- Percentage Card -->
                <div class="glass-panel rounded-xl p-6 text-center">
                    <div class="text-4xl font-bold ${this.getPercentageColor(attempt.percentage)} mb-2">
                        ${attempt.percentage}%
                    </div>
                    <div class="text-gray-400 text-sm uppercase tracking-wide">Accuracy</div>
                </div>

                <!-- Time Card -->
                <div class="glass-panel rounded-xl p-6 text-center">
                    <div class="text-4xl font-bold text-purple-400 mb-2">
                        ${this.formatTime(attempt.time_taken)}
                    </div>
                    <div class="text-gray-400 text-sm uppercase tracking-wide">Time Taken</div>
                </div>

                <!-- Performance Card -->
                <div class="glass-panel rounded-xl p-6 text-center">
                    <div class="text-2xl font-bold ${performanceLevel.color} mb-2">
                        ${performanceLevel.label}
                    </div>
                    <div class="text-gray-400 text-sm uppercase tracking-wide">Performance</div>
                </div>
            </div>
        `;
    }

    /**
     * Render detailed results with question breakdown
     * @param {Object} results - Detailed results
     * @returns {string} HTML string
     */
    static renderDetailedResults(results) {
        if (!results.questionResults || results.questionResults.length === 0) {
            return '';
        }

        return `
            <div class="glass-panel rounded-xl p-6">
                <h3 class="text-xl font-bold text-white mb-6">Question Breakdown</h3>
                
                <!-- Summary Stats -->
                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-400">${results.correctAnswers}</div>
                        <div class="text-sm text-gray-400">Correct</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-red-400">${results.totalQuestions - results.correctAnswers}</div>
                        <div class="text-sm text-gray-400">Incorrect</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-gray-400">${results.totalQuestions - results.questionResults.filter(q => q.userAnswer).length}</div>
                        <div class="text-sm text-gray-400">Unanswered</div>
                    </div>
                </div>

                <!-- Question List -->
                <div class="space-y-4 max-h-96 overflow-y-auto scrollable-container">
                    ${results.questionResults.map((questionResult, index) => 
                        this.renderQuestionResult(questionResult, index + 1)
                    ).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render individual question result
     * @param {Object} questionResult - Question result object
     * @param {number} questionNumber - Question number (1-based)
     * @returns {string} HTML string
     */
    static renderQuestionResult(questionResult, questionNumber) {
        const { userAnswer, correctAnswer, isCorrect, explanation } = questionResult;
        
        let statusIcon, statusColor, statusText;
        if (!userAnswer) {
            statusIcon = '⚪';
            statusColor = 'text-gray-400';
            statusText = 'Not answered';
        } else if (isCorrect) {
            statusIcon = '✅';
            statusColor = 'text-green-400';
            statusText = 'Correct';
        } else {
            statusIcon = '❌';
            statusColor = 'text-red-400';
            statusText = 'Incorrect';
        }

        return `
            <div class="bg-gray-800/50 rounded-lg p-4">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-3">
                        <span class="text-lg">${statusIcon}</span>
                        <span class="font-medium text-white">Question ${questionNumber}</span>
                        <span class="${statusColor} text-sm">${statusText}</span>
                    </div>
                    <div class="text-sm text-gray-400">
                        ${userAnswer ? `Your answer: ${userAnswer}` : 'No answer'} • Correct: ${correctAnswer}
                    </div>
                </div>
                
                ${explanation ? `
                    <div class="mt-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded text-sm text-blue-200">
                        <strong>Explanation:</strong> ${this.escapeHtml(explanation)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render action buttons
     * @param {Function} onReturnToList - Return to list callback
     * @param {Function} onRetryChallenge - Retry challenge callback
     * @returns {string} HTML string
     */
    static renderActionButtons(onReturnToList, onRetryChallenge) {
        return `
            <div class="glass-panel rounded-xl p-6">
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button id="return-to-list-btn" 
                            class="flex items-center justify-center gap-2 px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-all duration-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back to Challenges
                    </button>
                    
                    <button id="retry-challenge-btn" 
                            class="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all duration-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners
     * @param {Object} data - Component data with callbacks
     */
    static attachEventListeners(data) {
        const { onReturnToList, onRetryChallenge } = data;

        // Return to list button
        const returnBtn = document.getElementById('return-to-list-btn');
        if (returnBtn && onReturnToList) {
            returnBtn.addEventListener('click', onReturnToList);
        }

        // Retry challenge button
        const retryBtn = document.getElementById('retry-challenge-btn');
        if (retryBtn && onRetryChallenge) {
            retryBtn.addEventListener('click', onRetryChallenge);
        }
    }

    /**
     * Get result icon based on percentage
     * @param {number} percentage - Score percentage
     * @returns {string} HTML string with icon
     */
    static renderResultIcon(percentage) {
        if (percentage >= 90) {
            return '<div class="text-8xl">🏆</div>';
        } else if (percentage >= 80) {
            return '<div class="text-8xl">🥇</div>';
        } else if (percentage >= 70) {
            return '<div class="text-8xl">🥈</div>';
        } else if (percentage >= 60) {
            return '<div class="text-8xl">🥉</div>';
        } else {
            return '<div class="text-8xl">📚</div>';
        }
    }

    /**
     * Get performance level based on percentage
     * @param {number} percentage - Score percentage
     * @returns {Object} Performance level object
     */
    static getPerformanceLevel(percentage) {
        if (percentage >= 90) {
            return { label: 'Excellent', color: 'text-yellow-400' };
        } else if (percentage >= 80) {
            return { label: 'Great', color: 'text-green-400' };
        } else if (percentage >= 70) {
            return { label: 'Good', color: 'text-blue-400' };
        } else if (percentage >= 60) {
            return { label: 'Fair', color: 'text-orange-400' };
        } else {
            return { label: 'Needs Work', color: 'text-red-400' };
        }
    }

    /**
     * Get color class for percentage
     * @param {number} percentage - Score percentage
     * @returns {string} CSS color class
     */
    static getPercentageColor(percentage) {
        if (percentage >= 80) {
            return 'text-green-400';
        } else if (percentage >= 60) {
            return 'text-yellow-400';
        } else {
            return 'text-red-400';
        }
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
     * Render error state
     * @param {string} message - Error message
     * @returns {string} HTML string
     */
    static renderErrorState(message) {
        return `
            <div class="glass-panel rounded-xl p-8 text-center">
                <div class="text-6xl mb-4">⚠️</div>
                <h3 class="text-xl font-bold mb-2 text-red-400">Error</h3>
                <p class="text-gray-400">${this.escapeHtml(message)}</p>
            </div>
        `;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    static escapeHtml(text) {
        if (typeof text !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for global access
window.ResultSummary = ResultSummary;