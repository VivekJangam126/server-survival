/**
 * MCQ Challenge System - Main Export
 * Centralized exports for all MCQ challenge functionality
 * Use this file to import MCQ challenge features
 */

// Data access functions
export {
    getAllChallenges,
    getChallengeById,
    getQuestionsForChallenge,
    getQuestionById,
    getChallengesByDifficulty,
    getChallengesByConcept
} from './mcq.data.js';

// Challenge engine functions
export {
    startChallenge,
    submitAnswer,
    submitChallenge,
    getStatus,
    setTimeUpdateCallback,
    setTimeUpCallback,
    forceSubmit,
    resetEngine,
    MCQEngine
} from './mcq.engine.js';

// Attempt storage functions
export {
    saveAttempt,
    getAllAttempts,
    getAttemptsByChallenge,
    getAttemptsByUser,
    getAttemptsByUserAndChallenge,
    getLatestAttempt,
    getAttemptCount,
    attemptExists,
    getAttemptById,
    clearAllAttempts
} from './mcq.attempts.js';

// Constants
export {
    DIFFICULTY_LEVELS,
    DIFFICULTY_LABELS,
    ANSWER_OPTIONS,
    ERROR_MESSAGES,
    TIME_UP_MESSAGES,
    VALIDATION_MESSAGES,
    STORAGE_KEYS,
    CHALLENGE_STATUS,
    SCORING
} from './challenges.constants.js';