# Session Analytics

This directory contains passive session tracking, progress analysis, and student progress summaries for the game.

## Files

- `SessionStore.js` - Handles localStorage persistence of session records
- `SessionTracker.js` - Tracks active sessions and forwards completed sessions to store
- `ProgressAnalyzer.js` - Pure, read-only analysis of student progress and trends
- `ProgressSummaryBuilder.js` - Model composition layer that creates student-friendly summary objects
- `test.html` - Simple test page to verify session tracking functionality
- `test-analyzer.html` - Test page for progress analysis functions
- `verify-analyzer.html` - Verification tests for ProgressAnalyzer
- `verify-summary.html` - Verification tests for ProgressSummaryBuilder

## Session Data Schema

Each session record contains:

```json
{
  "sessionId": "session_1234567890_abc123def",
  "mode": "PLAY | SANDBOX", 
  "startTime": 1234567890000,
  "endTime": 1234567890000,
  "durationMinutes": 5,
  "finalScore": 1500,
  "objectivesCompleted": 2,
  "objectivesTotal": 3,
  "servicesDeployed": 4,
  "failures": 7,
  "budgetUsed": 250,
  "result": "COMPLETED | FAILED | EXITED",
  "saveUsed": true
}
```

## Progress Analysis API

The `ProgressAnalyzer` class provides pure, read-only analysis functions:

### Basic Functions
- `getLastSession(mode)` - Get most recent session for a mode
- `getPreviousSession(mode)` - Get second most recent session for a mode
- `getBestPerformance(mode)` - Get highest scoring session for a mode
- `getAveragePerformance(mode)` - Get average metrics across all sessions

### Comparison & Trends
- `getSessionComparison(mode)` - Compare last two sessions with deltas and trends
- `getTrendSummary(mode, lastN=5)` - Analyze trends over recent N sessions
- `getLearningProgress(mode)` - Compare early vs recent performance to show improvement

## Progress Summary API

The `ProgressSummaryBuilder` provides a single function that creates student-friendly summary objects:

### Main Function
- `getProgressSummary(mode)` - Returns complete progress summary for a mode

### Summary Object Structure
```javascript
{
  mode: "PLAY | SANDBOX",
  overview: {
    totalSessions: number,
    totalPlayTimeMinutes: number,
    lastPlayedAt: number | null
  },
  recentComparison: {
    scoreChange: number | null,
    scoreTrend: "UP" | "DOWN" | "SAME" | "N/A",
    durationChangeMinutes: number | null,
    objectivesChange: number | null,
    failuresChange: number | null
  },
  trends: {
    score: "UP" | "DOWN" | "MIXED" | "N/A",
    duration: "UP" | "DOWN" | "MIXED" | "N/A",
    failures: "UP" | "DOWN" | "MIXED" | "N/A"
  },
  performance: {
    bestScore: number | null,
    averageScore: number | null,
    bestDurationMinutes: number | null,
    averageDurationMinutes: number | null
  },
  learningInsight: {
    isImproving: boolean | null,
    improvementSummary: string
  }
}
```

### Example Usage
```javascript
// Get complete progress summary for Play mode
const summary = getProgressSummary("PLAY");
console.log(`Total sessions: ${summary.overview.totalSessions}`);
console.log(`Score trend: ${summary.recentComparison.scoreTrend}`);
console.log(`Learning insight: ${summary.learningInsight.improvementSummary}`);

// Get Sandbox mode summary
const sandboxSummary = getProgressSummary("SANDBOX");
```

## Integration

The analytics are integrated into both game engines:

### Play Mode (game.js + main.html)
- `resetGame("survival")` → starts "PLAY" session
- `saveGameState()` → marks save used
- Failure conditions → ends session with "FAILED"
- Page unload → ends session with "EXITED"

### Sandbox Mode (sandbox_game.js + sandbox.html)  
- `resetGame("sandbox")` → starts "SANDBOX" session
- `saveGameState()` → marks save used
- Failure conditions → ends session with "FAILED" 
- Page unload → ends session with "EXITED"

## Storage

Sessions are stored in localStorage under the key `"game_sessions"` as an array of session objects.

## Testing

- Open `analytics/test.html` in a browser to test session tracking functionality
- Open `analytics/test-analyzer.html` to test progress analysis functions
- Open `analytics/verify-analyzer.html` to verify ProgressAnalyzer implementation
- Open `analytics/verify-summary.html` to verify ProgressSummaryBuilder implementation
- Use browser DevTools console to run analysis functions manually

## Constraints

- Analytics are completely passive - no UI changes
- No gameplay behavior modifications
- No auto-save functionality added
- ProgressAnalyzer is pure computation - no side effects
- ProgressSummaryBuilder is pure model composition - deterministic output
- Minimal hooks into existing game lifecycle events only