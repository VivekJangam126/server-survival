# MCQ Challenge System

Core engine for Multiple Choice Question challenges in the Cloud Learning Simulator.

## Overview

This system provides a complete MCQ challenge engine with:
- Challenge and question data management
- Challenge execution with timing
- Answer submission and scoring
- Attempt persistence to localStorage
- No UI dependencies - pure logic layer

## Architecture

```
src/challenges/
├── mcq.data.js          # Static challenge and question data
├── mcq.engine.js        # Core challenge execution logic
├── mcq.attempts.js      # Attempt persistence to localStorage
├── challenges.constants.js # System constants and messages
├── index.js             # Main exports
├── test-mcq-engine.html # Test page
└── README.md            # This file
```

## Data Models

### MCQ Challenge
```javascript
{
  mcq_challenge_id: string,
  title: string,
  concept: string,
  difficulty: "beginner" | "intermediate",
  question_count: number,
  time_limit: number, // seconds
  description: string
}
```

### MCQ Question
```javascript
{
  question_id: string,
  mcq_challenge_id: string,
  question_text: string,
  options: {
    A: string,
    B: string,
    C: string,
    D: string
  },
  correct_option: "A" | "B" | "C" | "D",
  explanation?: string
}
```

### MCQ Attempt
```javascript
{
  attempt_id: string,
  user_id: string,
  mcq_challenge_id: string,
  score: number,
  total_questions: number,
  percentage: number,
  time_taken: number, // seconds
  completed_at: timestamp
}
```

## Usage Examples

### Basic Challenge Flow

```javascript
import { 
  startChallenge, 
  submitAnswer, 
  submitChallenge,
  getStatus 
} from './src/challenges/index.js';

// 1. Start a challenge
const result = startChallenge('cloud-basics-001', 'user-123');
if (result.success) {
  const { challenge, questions, timeLimit } = result.data;
  console.log(`Started: ${challenge.title}`);
  console.log(`Questions: ${questions.length}`);
  console.log(`Time limit: ${timeLimit} seconds`);
}

// 2. Submit answers
const answerResult = submitAnswer('cb-001', 'A');
if (answerResult.success) {
  console.log('Answer submitted successfully');
}

// 3. Complete challenge
const completionResult = submitChallenge();
if (completionResult.success) {
  const { attempt, results } = completionResult.data;
  console.log(`Score: ${attempt.score}/${attempt.total_questions}`);
  console.log(`Percentage: ${attempt.percentage}%`);
  console.log(`Time taken: ${attempt.time_taken} seconds`);
}
```

### Data Access

```javascript
import { 
  getAllChallenges, 
  getQuestionsForChallenge,
  getChallengesByDifficulty 
} from './src/challenges/index.js';

// Get all available challenges
const challenges = getAllChallenges();

// Get challenges by difficulty
const beginnerChallenges = getChallengesByDifficulty('beginner');

// Get questions for a specific challenge
const questions = getQuestionsForChallenge('cloud-basics-001');
```

### Attempt Management

```javascript
import { 
  getAttemptsByUser,
  getLatestAttempt,
  getAttemptCount 
} from './src/challenges/index.js';

// Get all attempts by a user
const userAttempts = getAttemptsByUser('user-123');

// Get latest attempt for a challenge
const latestAttempt = getLatestAttempt('user-123', 'cloud-basics-001');

// Get attempt count
const attemptCount = getAttemptCount('user-123', 'cloud-basics-001');
```

### Timer Callbacks

```javascript
import { 
  setTimeUpdateCallback,
  setTimeUpCallback 
} from './src/challenges/index.js';

// Set callback for time updates (called every second)
setTimeUpdateCallback((timeRemaining) => {
  console.log(`Time remaining: ${timeRemaining} seconds`);
});

// Set callback for when time expires
setTimeUpCallback(() => {
  console.log('Time up! Challenge auto-submitted.');
});
```

## Key Features

### Timer Management
- Automatic countdown timer
- Configurable time limits per challenge
- Auto-submit when time expires
- Real-time callbacks for UI updates

### Scoring System
- 1 point per correct answer
- Percentage calculation
- Time tracking
- Detailed results with explanations

### Data Persistence
- localStorage-based attempt storage
- No data loss on page refresh
- Query attempts by user/challenge
- Attempt history tracking

### Error Handling
- Comprehensive validation
- Descriptive error messages
- Graceful failure handling
- Input sanitization

## Available Challenges

1. **Cloud Computing Fundamentals** (Beginner, 5 questions, 5 minutes)
2. **AWS Core Services** (Intermediate, 8 questions, 8 minutes)
3. **Cloud Security Essentials** (Beginner, 6 questions, 6 minutes)
4. **Cloud Networking Concepts** (Intermediate, 7 questions, 7 minutes)

## Testing

Open `test-mcq-engine.html` in a browser to test all functionality:
- Challenge data loading
- Challenge execution
- Answer submission
- Challenge completion
- Attempt storage

## Integration Notes

This system is designed to be:
- **UI-agnostic**: No DOM dependencies
- **Modular**: Import only what you need
- **Extensible**: Easy to add new challenges/questions
- **Testable**: Pure functions with predictable outputs

The engine will later power:
- MCQ Challenge UI pages
- MCQ Leaderboard system
- Progress tracking integration
- Achievement systems