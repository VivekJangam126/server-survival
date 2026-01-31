/**
 * MCQTest Component
 * Renders the complete MCQ test interface
 * Pure rendering component - no business logic
 */

class MCQTest {
    /**
     * Render MCQ test interface
     * @param {Object} data - Test data
     * @param {Object} data.challenge - Challenge object
     * @param {Array} data.questions - Array of questions
     * @param {number} data.currentQuestionIndex - Current question index
     * @param {Map} data.userAnswers - User answers map
     * @param {number} data.timeRemaining - Time remaining in seconds
     * @param {Function} data.onAnswerSelect - Answer selection callback
     * @param {Function} data.onNextQuestion - Next question callback
     * @param {Function} data.onPreviousQuestion - Previous question callback
     * @param {Function} data.onGoToQuestion - Go to question callback
     * @param {Function} data.onSubmitChallenge - Submit challenge callback
     */
    static render(data) {
        const container = document.getElementById('mcq-test');
        if (!container) {
            console.error('MCQ test container not found');
            return;
        }

        const {
            challenge,
            questions,
            currentQuestionIndex,
            userAnswers,
            timeRemaining,
            onAnswerSelect,
            onNextQuestion,
            onPreviousQuestion,
            onGoToQuestion,
            onSubmitChallenge
        } = data;

        if (!challenge || !questions || questions.length === 0) {
            container.innerHTML = this.renderErrorState('Challenge data not available');
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];
        const selectedAnswer = userAnswers.get(currentQuestion.question_id);

        container.innerHTML = `
            <div class="max-w-6xl mx-auto space-y-6">
                <!-- Test Header -->
                ${this.renderTestHeader(challenge, questions.length, userAnswers.size, timeRemaining)}
                
                <!-- Question Navigation -->
                ${this.renderQuestionNavigation(questions, currentQuestionIndex, userAnswers, onGoToQuestion)}
                
                <!-- Current Question -->
                <div id="question-card-container">
                    <!-- Question card will be rendered here -->
                </div>
                
                <!-- Navigation Controls -->
                ${this.renderNavigationControls(
                    currentQuestionIndex, 
                    questions.length, 
                    userAnswers.size,
                    onPreviousQuestion, 
                    onNextQuestion, 
                    onSubmitChallenge
                )}
            </div>
        `;

        // Render the current question
        if (window.QuestionCard) {
            window.QuestionCard.render({
                question: currentQuestion,
                questionNumber: currentQuestionIndex + 1,
                totalQuestions: questions.length,
                selectedAnswer,
                onAnswerSelect
            });
        }

        // Attach event listeners
        this.attachEventListeners(data);
    }

    /**
     * Render test header with challenge info and timer
     * @param {Object} challenge - Challenge object
     * @param {number} totalQuestions - Total number of questions
     * @param {number} answeredCount - Number of answered questions
     * @param {number} timeRemaining - Time remaining in seconds
     * @returns {string} HTML string
     */
    static renderTestHeader(challenge, totalQuestions, answeredCount, timeRemaining) {
        const isTimeWarning = timeRemaining <= 60; // Warning when 1 minute or less
        const timerClass = isTimeWarning ? 'text-red-400 timer-warning' : 'text-green-400';

        return `
            <div class="glass-panel rounded-xl p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <!-- Challenge Info -->
                    <div class="flex-1">
                        <h1 class="text-2xl font-bold text-white mb-2">${this.escapeHtml(challenge.title)}</h1>
                        <div class="flex items-center gap-4 text-sm text-gray-400">
                            <span>${challenge.concept}</span>
                            <span>•</span>
                            <span class="capitalize">${challenge.difficulty}</span>
                            <span>•</span>
                            <span>${answeredCount}/${totalQuestions} answered</span>
                        </div>
                    </div>
                    
                    <!-- Timer -->
                    <div class="flex items-center gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold ${timerClass}" id="timer-display">
                                ${this.formatTime(timeRemaining)}
                            </div>
                            <div class="text-xs text-gray-400 uppercase tracking-wide">Time Remaining</div>
                        </div>
                        ${isTimeWarning ? 
                            '<div class="text-red-400 text-sm">⚠️ Hurry up!</div>' : 
                            ''
                        }
                    </div>
                </div>
                
                <!-- Progress Bar -->
                <div class="mt-4">
                    <div class="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>${Math.round((answeredCount / totalQuestions) * 100)}% complete</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full progress-bar transition-all duration-300" 
                             style="width: ${(answeredCount / totalQuestions) * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render question navigation dots
     * @param {Array} questions - Array of questions
     * @param {number} currentIndex - Current question index
     * @param {Map} userAnswers - User answers map
     * @param {Function} onGoToQuestion - Go to question callback
     * @returns {string} HTML string
     */
    static renderQuestionNavigation(questions, currentIndex, userAnswers, onGoToQuestion) {
        return `
            <div class="glass-panel rounded-xl p-4">
                <div class="flex items-center justify-center">
                    <div class="flex flex-wrap gap-2 justify-center">
                        ${questions.map((question, index) => {
                            const isAnswered = userAnswers.has(question.question_id);
                            const isCurrent = index === currentIndex;
                            
                            let statusClass = 'bg-gray-600 text-gray-300';
                            if (isCurrent) {
                                statusClass = 'bg-blue-600 text-white ring-2 ring-blue-400';
                            } else if (isAnswered) {
                                statusClass = 'bg-green-600 text-white';
                            }
                            
                            return `
                                <button class="question-nav-btn w-10 h-10 rounded-full font-bold text-sm transition-all duration-200 hover:scale-110 ${statusClass}"
                                        data-question-index="${index}"
                                        title="Question ${index + 1}${isAnswered ? ' (Answered)' : ''}">
                                    ${index + 1}
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Legend -->
                <div class="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-blue-600"></div>
                        <span>Current</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-green-600"></div>
                        <span>Answered</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-gray-600"></div>
                        <span>Not Answered</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render navigation controls
     * @param {number} currentIndex - Current question index
     * @param {number} totalQuestions - Total number of questions
     * @param {number} answeredCount - Number of answered questions
     * @param {Function} onPreviousQuestion - Previous callback
     * @param {Function} onNextQuestion - Next callback
     * @param {Function} onSubmitChallenge - Submit callback
     * @returns {string} HTML string
     */
    static renderNavigationControls(currentIndex, totalQuestions, answeredCount, onPreviousQuestion, onNextQuestion, onSubmitChallenge) {
        const isFirstQuestion = currentIndex === 0;
        const isLastQuestion = currentIndex === totalQuestions - 1;
        const canSubmit = answeredCount > 0; // Allow partial submission

        return `
            <div class="glass-panel rounded-xl p-6">
                <div class="flex items-center justify-between">
                    <!-- Previous Button -->
                    <button id="prev-question-btn" 
                            class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                isFirstQuestion ? 
                                'bg-gray-700 text-gray-500 cursor-not-allowed' : 
                                'bg-gray-600 hover:bg-gray-500 text-white'
                            }"
                            ${isFirstQuestion ? 'disabled' : ''}>
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Previous
                    </button>

                    <!-- Question Counter -->
                    <div class="text-center">
                        <div class="text-lg font-bold text-white">
                            Question ${currentIndex + 1} of ${totalQuestions}
                        </div>
                        <div class="text-sm text-gray-400">
                            ${answeredCount} answered • ${totalQuestions - answeredCount} remaining
                        </div>
                    </div>

                    <!-- Next/Submit Button -->
                    ${isLastQuestion ? `
                        <button id="submit-challenge-btn" 
                                class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    canSubmit ? 
                                    'bg-green-600 hover:bg-green-500 text-white' : 
                                    'bg-gray-700 text-gray-500 cursor-not-allowed'
                                }"
                                ${!canSubmit ? 'disabled' : ''}>
                            Submit Challenge
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </button>
                    ` : `
                        <button id="next-question-btn" 
                                class="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all duration-200">
                            ${currentIndex === totalQuestions - 2 ? 'Go to Last Question' : 'Next'}
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    `}
                </div>

                <!-- Submit Early Option -->
                ${!isLastQuestion && answeredCount > 0 ? `
                    <div class="mt-4 pt-4 border-t border-gray-700 text-center">
                        <button id="submit-early-btn" 
                                class="text-sm text-gray-400 hover:text-white transition-colors duration-200 underline">
                            Submit challenge early (${answeredCount}/${totalQuestions} answered)
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Attach event listeners
     * @param {Object} data - Component data with callbacks
     */
    static attachEventListeners(data) {
        const {
            onPreviousQuestion,
            onNextQuestion,
            onGoToQuestion,
            onSubmitChallenge
        } = data;

        // Previous question button
        const prevBtn = document.getElementById('prev-question-btn');
        if (prevBtn && !prevBtn.disabled) {
            prevBtn.addEventListener('click', onPreviousQuestion);
        }

        // Next question button - CRITICAL: This now handles Next/Submit logic in controller
        const nextBtn = document.getElementById('next-question-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', onNextQuestion);
        }

        // Submit challenge button - Direct submit (for early submission)
        const submitBtn = document.getElementById('submit-challenge-btn');
        if (submitBtn && !submitBtn.disabled) {
            submitBtn.addEventListener('click', onSubmitChallenge);
        }

        // Submit early button
        const submitEarlyBtn = document.getElementById('submit-early-btn');
        if (submitEarlyBtn) {
            submitEarlyBtn.addEventListener('click', onSubmitChallenge);
        }

        // Question navigation buttons
        document.querySelectorAll('.question-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const questionIndex = parseInt(btn.getAttribute('data-question-index'));
                if (!isNaN(questionIndex) && onGoToQuestion) {
                    onGoToQuestion(questionIndex);
                }
            });
        });
    }

    /**
     * Update timer display - called by engine via callback
     * @param {number} timeRemaining - Time remaining in seconds
     */
    static updateTimer(timeRemaining) {
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = this.formatTime(timeRemaining);
            
            // Update timer color based on remaining time
            const isWarning = timeRemaining <= 60;
            timerDisplay.className = isWarning ? 'text-2xl font-bold text-red-400 timer-warning' : 'text-2xl font-bold text-green-400';
        }
    }

    /**
     * Format time in seconds to MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
window.MCQTest = MCQTest;