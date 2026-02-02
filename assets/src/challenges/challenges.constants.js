/**
 * MCQ Challenge Constants
 * Centralized constants for MCQ challenge system
 * No UI dependencies, pure configuration
 */

// Difficulty levels
export const DIFFICULTY_LEVELS = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate'
};

// Difficulty labels for display
export const DIFFICULTY_LABELS = {
    [DIFFICULTY_LEVELS.BEGINNER]: 'Beginner',
    [DIFFICULTY_LEVELS.INTERMEDIATE]: 'Intermediate'
};

// Valid answer options
export const ANSWER_OPTIONS = ['A', 'B', 'C', 'D'];

// Error messages
export const ERROR_MESSAGES = {
    CHALLENGE_NOT_FOUND: 'Challenge not found',
    INVALID_CHALLENGE_ID: 'Invalid challenge ID',
    INVALID_USER_ID: 'Invalid user ID',
    INVALID_QUESTION_ID: 'Invalid question ID',
    INVALID_ANSWER_OPTION: 'Invalid answer option',
    CHALLENGE_NOT_STARTED: 'Challenge not started',
    CHALLENGE_ALREADY_STARTED: 'Challenge already in progress',
    CHALLENGE_ALREADY_COMPLETED: 'Challenge already completed',
    NO_QUESTIONS_FOUND: 'No questions found for this challenge',
    STORAGE_ERROR: 'Failed to save attempt data'
};

// Time-up messages
export const TIME_UP_MESSAGES = {
    AUTO_SUBMIT: 'Time limit exceeded. Challenge auto-submitted.',
    WARNING_30_SEC: '30 seconds remaining!',
    WARNING_60_SEC: '1 minute remaining!'
};

// Validation messages
export const VALIDATION_MESSAGES = {
    REQUIRED_FIELD: 'This field is required',
    INVALID_FORMAT: 'Invalid format',
    OUT_OF_RANGE: 'Value out of acceptable range'
};

// Storage keys
export const STORAGE_KEYS = {
    MCQ_ATTEMPTS: 'mcq_attempts'
};

// Challenge status
export const CHALLENGE_STATUS = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    TIME_UP: 'time_up'
};

// Scoring constants
export const SCORING = {
    POINTS_PER_CORRECT: 1,
    MIN_PERCENTAGE: 0,
    MAX_PERCENTAGE: 100
};