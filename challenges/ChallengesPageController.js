/**
 * ChallengesPageController - Main controller for MCQ Challenges page
 * Coordinates between MCQ engine and UI components
 * No business logic - pure UI coordination
 */

import { 
    getAllChallenges,
    getAttemptsByUser,
    startChallenge,
    submitAnswer,
    submitChallenge,
    getStatus,
    setTimeUpdateCallback,
    setTimeUpCallback,
    resetEngine
} from '../src/challenges/index.js';

class ChallengesPageController {
    constructor() {
        this.currentView = 'list'; // 'list', 'test', 'result'
        this.selectedChallenge = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = new Map(); // questionId -> selectedOption (UI display only)
        this.userId = 'default-user'; // TODO: Get from auth system
        this.challengeResult = null;
        this.timeRemaining = 0;
        this.challengeSubmitted = false; // Defensive guard against multiple submissions
    }

    /**
     * Initialize the controller
     */
    init() {
        console.log('Initializing ChallengesPageController...');
        this.setupEventListeners();
        this.setupEngineCallbacks();
        this.loadChallengeList();
    }

    /**
     * Setup event listeners for UI interactions
     */
    setupEventListeners() {
        // Tab switching (MCQ vs Game challenges)
        const mcqTab = document.getElementById('tab-mcq');
        if (mcqTab) {
            mcqTab.addEventListener('click', () => {
                // Already active, no action needed
            });
        }
    }

    /**
     * Setup callbacks for MCQ engine
     */
    setupEngineCallbacks() {
        // Timer update callback - engine drives timer display
        setTimeUpdateCallback((timeRemaining) => {
            this.timeRemaining = timeRemaining;
            this.updateTimerDisplay();
        });

        // Time up callback - engine drives auto-submit
        setTimeUpCallback(() => {
            this.handleTimeUp();
        });
    }

    /**
     * Load and display challenge list
     */
    async loadChallengeList() {
        try {
            console.log('Loading challenge list...');
            
            // Get challenges from engine
            const challenges = getAllChallenges();
            
            // Get user attempts for status
            const userAttempts = getAttemptsByUser(this.userId);
            
            // Show challenge list view
            this.showView('list');
            
            // Render challenge list
            if (window.ChallengeList) {
                window.ChallengeList.render(challenges, userAttempts, (challenge) => {
                    this.startChallenge(challenge);
                });
            } else {
                console.error('ChallengeList component not available');
            }
            
        } catch (error) {
            console.error('Failed to load challenge list:', error);
            this.showError('Failed to load challenges');
        }
    }

    /**
     * Start a challenge
     * @param {Object} challenge - Challenge object
     */
    async startChallenge(challenge) {
        try {
            console.log('Starting challenge:', challenge.title);
            
            // Reset engine state
            resetEngine();
            
            // Reset controller state
            this.challengeSubmitted = false;
            
            // Start challenge via engine
            const result = startChallenge(challenge.mcq_challenge_id, this.userId);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            // Store challenge data from engine response
            this.selectedChallenge = challenge;
            this.currentQuestions = result.data.questions;
            this.currentQuestionIndex = 0;
            this.userAnswers.clear();
            this.timeRemaining = result.data.timeLimit;
            
            // Show test view
            this.showView('test');
            
            // Render MCQ test interface
            this.renderMCQTest();
            
        } catch (error) {
            console.error('Failed to start challenge:', error);
            this.showError(`Failed to start challenge: ${error.message}`);
        }
    }

    /**
     * Submit an answer for current question
     * Engine-driven answer submission - no UI state duplication
     * @param {string} selectedOption - Selected option (A, B, C, D)
     */
    submitAnswer(selectedOption) {
        try {
            const currentQuestion = this.currentQuestions[this.currentQuestionIndex];
            
            // Submit answer via engine - engine is single source of truth
            const result = submitAnswer(currentQuestion.question_id, selectedOption);
            
            if (!result.success) {
                console.error('Failed to submit answer:', result.error);
                return;
            }
            
            // Store answer locally ONLY for UI display state
            this.userAnswers.set(currentQuestion.question_id, selectedOption);
            
            // Update question card display to show selection
            this.renderCurrentQuestion();
            
        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    }

    /**
     * Navigate to next question OR submit challenge if last question
     * CRITICAL: Implements exact Next/Submit logic to prevent dead-end states
     */
    nextQuestion() {
        // CRITICAL FIX: Check if this is the last question
        if (this.currentQuestionIndex === this.currentQuestions.length - 1) {
            // Last question - must submit challenge
            this.submitChallenge();
        } else {
            // Not last question - advance to next
            this.currentQuestionIndex++;
            this.renderCurrentQuestion();
        }
    }

    /**
     * Navigate to previous question
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderCurrentQuestion();
        }
    }

    /**
     * Go to specific question
     * @param {number} index - Question index
     */
    goToQuestion(index) {
        if (index >= 0 && index < this.currentQuestions.length) {
            this.currentQuestionIndex = index;
            this.renderCurrentQuestion();
        }
    }

    /**
     * Submit the entire challenge
     * Defensive implementation to prevent multiple submissions
     */
    async submitChallenge() {
        // Defensive guard: prevent multiple submissions
        if (this.challengeSubmitted) {
            console.warn('Challenge already submitted, ignoring duplicate submission');
            return;
        }

        try {
            console.log('Submitting challenge...');
            
            // Mark as submitted to prevent duplicate calls
            this.challengeSubmitted = true;
            
            // Submit challenge via engine - engine calculates everything
            const result = submitChallenge();
            
            if (!result.success) {
                // Reset flag on failure
                this.challengeSubmitted = false;
                throw new Error(result.error);
            }
            
            // Store result
            this.challengeResult = result.data;
            
            // Show result view
            this.showView('result');
            
            // Render result summary
            this.renderResultSummary();
            
        } catch (error) {
            console.error('Failed to submit challenge:', error);
            this.challengeSubmitted = false; // Reset on error
            this.showError(`Failed to submit challenge: ${error.message}`);
        }
    }

    /**
     * Handle time up event - engine-driven auto-submit
     * CRITICAL: Must always call submitChallenge() to show results
     */
    handleTimeUp() {
        console.log('Time up! Auto-submitting challenge...');
        
        // CRITICAL FIX: Always submit challenge when time expires
        // Engine has already stopped the timer, now we must finish the challenge
        this.submitChallenge();
    }

    /**
     * Update timer display - engine-driven via callback
     */
    updateTimerDisplay() {
        if (window.MCQTest) {
            window.MCQTest.updateTimer(this.timeRemaining);
        }
    }

    /**
     * Render MCQ test interface
     */
    renderMCQTest() {
        if (window.MCQTest) {
            window.MCQTest.render({
                challenge: this.selectedChallenge,
                questions: this.currentQuestions,
                currentQuestionIndex: this.currentQuestionIndex,
                userAnswers: this.userAnswers,
                timeRemaining: this.timeRemaining,
                onAnswerSelect: (option) => this.submitAnswer(option),
                onNextQuestion: () => this.nextQuestion(),
                onPreviousQuestion: () => this.previousQuestion(),
                onGoToQuestion: (index) => this.goToQuestion(index),
                onSubmitChallenge: () => this.submitChallenge()
            });
        }
    }

    /**
     * Render current question card
     */
    renderCurrentQuestion() {
        const currentQuestion = this.currentQuestions[this.currentQuestionIndex];
        const selectedAnswer = this.userAnswers.get(currentQuestion.question_id);
        
        if (window.QuestionCard) {
            window.QuestionCard.render({
                question: currentQuestion,
                questionNumber: this.currentQuestionIndex + 1,
                totalQuestions: this.currentQuestions.length,
                selectedAnswer,
                onAnswerSelect: (option) => this.submitAnswer(option)
            });
        }
    }

    /**
     * Render result summary
     */
    renderResultSummary() {
        if (window.ResultSummary) {
            window.ResultSummary.render({
                challenge: this.selectedChallenge,
                result: this.challengeResult,
                onReturnToList: () => this.returnToList(),
                onRetryChallenge: () => this.startChallenge(this.selectedChallenge)
            });
        }
    }

    /**
     * Return to challenge list
     */
    returnToList() {
        // Reset state
        this.selectedChallenge = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers.clear();
        this.challengeResult = null;
        this.challengeSubmitted = false; // Reset submission guard
        
        // Reset engine
        resetEngine();
        
        // Load challenge list
        this.loadChallengeList();
    }

    /**
     * Show specific view
     * @param {string} viewName - View name ('list', 'test', 'result')
     */
    showView(viewName) {
        // Hide all views
        const views = ['loading-state', 'challenge-list-view', 'mcq-test-view', 'result-summary-view', 'error-state'];
        views.forEach(viewId => {
            const element = document.getElementById(viewId);
            if (element) {
                element.classList.add('hidden');
            }
        });

        // Show target view
        let targetViewId;
        switch (viewName) {
            case 'list':
                targetViewId = 'challenge-list-view';
                break;
            case 'test':
                targetViewId = 'mcq-test-view';
                break;
            case 'result':
                targetViewId = 'result-summary-view';
                break;
            default:
                targetViewId = 'loading-state';
        }

        const targetView = document.getElementById(targetViewId);
        if (targetView) {
            targetView.classList.remove('hidden');
        }

        this.currentView = viewName;
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        this.showView('error');
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }

    /**
     * Get current state for debugging
     * @returns {Object} Current state
     */
    getState() {
        return {
            currentView: this.currentView,
            selectedChallenge: this.selectedChallenge,
            currentQuestionIndex: this.currentQuestionIndex,
            answeredCount: this.userAnswers.size,
            totalQuestions: this.currentQuestions.length,
            timeRemaining: this.timeRemaining
        };
    }
}

// Create and export global instance
window.ChallengesPageController = new ChallengesPageController();