/**
 * MCQ Challenge Engine
 * Core logic for MCQ challenges - timing, scoring, state management
 * No UI dependencies, pure challenge execution logic
 */

import { getChallengeById, getQuestionsForChallenge, getQuestionById } from './mcq.data.js';
import { saveAttempt } from './mcq.attempts.js';
import { 
    ERROR_MESSAGES, 
    CHALLENGE_STATUS, 
    SCORING, 
    ANSWER_OPTIONS,
    TIME_UP_MESSAGES 
} from './challenges.constants.js';

/**
 * MCQ Challenge Engine Class
 * Manages individual challenge sessions
 */
class MCQEngine {
    constructor() {
        this.reset();
    }

    /**
     * Reset engine state
     */
    reset() {
        this.currentChallenge = null;
        this.currentQuestions = [];
        this.userId = null;
        this.startTime = null;
        this.endTime = null;
        this.status = CHALLENGE_STATUS.NOT_STARTED;
        this.userAnswers = new Map(); // questionId -> selectedOption
        this.timeLimit = 0;
        this.timerInterval = null;
        this.timeRemaining = 0;
        this.onTimeUpdate = null;
        this.onTimeUp = null;
    }

    /**
     * Start a new MCQ challenge
     * @param {string} challengeId - The challenge ID
     * @param {string} userId - The user ID
     * @returns {Object} Result object with success status and data
     */
    startChallenge(challengeId, userId) {
        try {
            // Validate inputs
            if (!challengeId || typeof challengeId !== 'string') {
                return this.createErrorResult(ERROR_MESSAGES.INVALID_CHALLENGE_ID);
            }

            if (!userId || typeof userId !== 'string') {
                return this.createErrorResult(ERROR_MESSAGES.INVALID_USER_ID);
            }

            // Check if challenge already in progress
            if (this.status === CHALLENGE_STATUS.IN_PROGRESS) {
                return this.createErrorResult(ERROR_MESSAGES.CHALLENGE_ALREADY_STARTED);
            }

            // Get challenge data
            const challenge = getChallengeById(challengeId);
            if (!challenge) {
                return this.createErrorResult(ERROR_MESSAGES.CHALLENGE_NOT_FOUND);
            }

            // Get questions for challenge
            const questions = getQuestionsForChallenge(challengeId);
            if (questions.length === 0) {
                return this.createErrorResult(ERROR_MESSAGES.NO_QUESTIONS_FOUND);
            }

            // Validate question count matches challenge
            if (questions.length !== challenge.question_count) {
                console.warn(`Question count mismatch: expected ${challenge.question_count}, found ${questions.length}`);
            }

            // Initialize challenge session
            this.currentChallenge = challenge;
            this.currentQuestions = [...questions]; // Copy to prevent mutation
            this.userId = userId;
            this.startTime = Date.now();
            this.endTime = null;
            this.status = CHALLENGE_STATUS.IN_PROGRESS;
            this.userAnswers.clear();
            this.timeLimit = challenge.time_limit;
            this.timeRemaining = challenge.time_limit;

            // Start timer
            this.startTimer();

            return this.createSuccessResult({
                challenge: this.currentChallenge,
                questions: this.getQuestionsForUser(), // Remove correct answers
                timeLimit: this.timeLimit,
                status: this.status
            });

        } catch (error) {
            console.error('Error starting challenge:', error);
            return this.createErrorResult('Failed to start challenge');
        }
    }

    /**
     * Submit an answer for a question
     * @param {string} questionId - The question ID
     * @param {string} selectedOption - The selected option (A, B, C, D)
     * @returns {Object} Result object with success status
     */
    submitAnswer(questionId, selectedOption) {
        try {
            // Validate challenge is in progress
            if (this.status !== CHALLENGE_STATUS.IN_PROGRESS) {
                return this.createErrorResult(ERROR_MESSAGES.CHALLENGE_NOT_STARTED);
            }

            // Validate inputs
            if (!questionId || typeof questionId !== 'string') {
                return this.createErrorResult(ERROR_MESSAGES.INVALID_QUESTION_ID);
            }

            if (!ANSWER_OPTIONS.includes(selectedOption)) {
                return this.createErrorResult(ERROR_MESSAGES.INVALID_ANSWER_OPTION);
            }

            // Verify question belongs to current challenge
            const question = this.currentQuestions.find(q => q.question_id === questionId);
            if (!question) {
                return this.createErrorResult(ERROR_MESSAGES.INVALID_QUESTION_ID);
            }

            // Store the answer
            this.userAnswers.set(questionId, selectedOption);

            return this.createSuccessResult({
                questionId,
                selectedOption,
                answeredCount: this.userAnswers.size,
                totalQuestions: this.currentQuestions.length
            });

        } catch (error) {
            console.error('Error submitting answer:', error);
            return this.createErrorResult('Failed to submit answer');
        }
    }

    /**
     * Submit the entire challenge and calculate results
     * @returns {Object} Result object with attempt data
     */
    submitChallenge() {
        try {
            // Validate challenge is in progress
            if (this.status !== CHALLENGE_STATUS.IN_PROGRESS) {
                return this.createErrorResult(ERROR_MESSAGES.CHALLENGE_NOT_STARTED);
            }

            // Stop timer
            this.stopTimer();

            // Calculate results
            const results = this.calculateResults();

            // Create attempt object
            const attempt = this.createAttemptObject(results);

            // Save attempt
            const saved = saveAttempt(attempt);
            if (!saved) {
                console.error('Failed to save attempt');
                return this.createErrorResult(ERROR_MESSAGES.STORAGE_ERROR);
            }

            // Update status
            this.status = CHALLENGE_STATUS.COMPLETED;
            this.endTime = Date.now();

            return this.createSuccessResult({
                attempt,
                results,
                status: this.status
            });

        } catch (error) {
            console.error('Error submitting challenge:', error);
            return this.createErrorResult('Failed to submit challenge');
        }
    }

    /**
     * Get current challenge status and progress
     * @returns {Object} Current status information
     */
    getStatus() {
        return {
            status: this.status,
            challenge: this.currentChallenge,
            timeRemaining: this.timeRemaining,
            answeredCount: this.userAnswers.size,
            totalQuestions: this.currentQuestions.length,
            startTime: this.startTime
        };
    }

    /**
     * Set callback for time updates
     * @param {Function} callback - Called with time remaining
     */
    setTimeUpdateCallback(callback) {
        this.onTimeUpdate = callback;
    }

    /**
     * Set callback for time up event
     * @param {Function} callback - Called when time expires
     */
    setTimeUpCallback(callback) {
        this.onTimeUp = callback;
    }

    /**
     * Force submit challenge (for time up scenarios)
     * @returns {Object} Result object with attempt data
     */
    forceSubmit() {
        if (this.status === CHALLENGE_STATUS.IN_PROGRESS) {
            this.status = CHALLENGE_STATUS.TIME_UP;
            return this.submitChallenge();
        }
        return this.createErrorResult('No active challenge to force submit');
    }

    /**
     * Start the challenge timer
     * @private
     */
    startTimer() {
        this.stopTimer(); // Clear any existing timer

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;

            // Call update callback
            if (this.onTimeUpdate) {
                this.onTimeUpdate(this.timeRemaining);
            }

            // Check for time up
            if (this.timeRemaining <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    /**
     * Stop the challenge timer
     * @private
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Handle time up scenario
     * @private
     */
    handleTimeUp() {
        this.stopTimer();
        this.status = CHALLENGE_STATUS.TIME_UP;

        // Call time up callback
        if (this.onTimeUp) {
            this.onTimeUp();
        }

        // Auto-submit the challenge
        this.submitChallenge();
    }

    /**
     * Calculate challenge results
     * @private
     * @returns {Object} Results object
     */
    calculateResults() {
        let correctAnswers = 0;
        const totalQuestions = this.currentQuestions.length;
        const questionResults = [];

        // Check each question
        for (const question of this.currentQuestions) {
            const userAnswer = this.userAnswers.get(question.question_id);
            const isCorrect = userAnswer === question.correct_option;
            
            if (isCorrect) {
                correctAnswers++;
            }

            questionResults.push({
                questionId: question.question_id,
                userAnswer: userAnswer || null,
                correctAnswer: question.correct_option,
                isCorrect,
                explanation: question.explanation
            });
        }

        // Calculate metrics
        const score = correctAnswers * SCORING.POINTS_PER_CORRECT;
        const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const timeTaken = this.calculateTimeTaken();

        return {
            score,
            correctAnswers,
            totalQuestions,
            percentage,
            timeTaken,
            questionResults
        };
    }

    /**
     * Calculate time taken in seconds
     * @private
     * @returns {number} Time taken in seconds
     */
    calculateTimeTaken() {
        if (!this.startTime) {
            return 0;
        }

        const endTime = this.endTime || Date.now();
        return Math.floor((endTime - this.startTime) / 1000);
    }

    /**
     * Create attempt object for storage
     * @private
     * @param {Object} results - Challenge results
     * @returns {Object} Attempt object
     */
    createAttemptObject(results) {
        return {
            attempt_id: this.generateAttemptId(),
            user_id: this.userId,
            mcq_challenge_id: this.currentChallenge.mcq_challenge_id,
            score: results.score,
            total_questions: results.totalQuestions,
            percentage: results.percentage,
            time_taken: results.timeTaken,
            completed_at: Date.now()
        };
    }

    /**
     * Generate unique attempt ID
     * @private
     * @returns {string} Unique attempt ID
     */
    generateAttemptId() {
        return `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get questions without correct answers (for user display)
     * @private
     * @returns {Array} Questions without correct_option field
     */
    getQuestionsForUser() {
        return this.currentQuestions.map(question => ({
            question_id: question.question_id,
            question_text: question.question_text,
            options: question.options
            // Exclude correct_option and explanation
        }));
    }

    /**
     * Create success result object
     * @private
     * @param {Object} data - Success data
     * @returns {Object} Success result
     */
    createSuccessResult(data = {}) {
        return {
            success: true,
            data,
            error: null
        };
    }

    /**
     * Create error result object
     * @private
     * @param {string} message - Error message
     * @returns {Object} Error result
     */
    createErrorResult(message) {
        return {
            success: false,
            data: null,
            error: message
        };
    }
}

// Create singleton instance
const mcqEngine = new MCQEngine();

// Export functions that use the singleton
export function startChallenge(challengeId, userId) {
    return mcqEngine.startChallenge(challengeId, userId);
}

export function submitAnswer(questionId, selectedOption) {
    return mcqEngine.submitAnswer(questionId, selectedOption);
}

export function submitChallenge() {
    return mcqEngine.submitChallenge();
}

export function getStatus() {
    return mcqEngine.getStatus();
}

export function setTimeUpdateCallback(callback) {
    mcqEngine.setTimeUpdateCallback(callback);
}

export function setTimeUpCallback(callback) {
    mcqEngine.setTimeUpCallback(callback);
}

export function forceSubmit() {
    return mcqEngine.forceSubmit();
}

export function resetEngine() {
    mcqEngine.reset();
}

// Export the engine class for testing purposes
export { MCQEngine };