# MCQ Leaderboard System

This module implements deterministic, read-only leaderboard logic for MCQ challenges.

## Architecture

### 📁 Files Structure
```
leaderboard/
├── leaderboard.constants.js     # Constants and configuration
├── mcqLeaderboard.datasource.js # Data fetching and filtering
├── mcqLeaderboard.logic.js      # Ranking and sorting logic
├── leaderboard.html             # Main leaderboard page
├── LeaderboardPageController.js # UI controller (no ranking logic)
├── test-data-generator.js       # Development testing tool
├── components/
│   ├── LeaderboardTabs.js       # Tab navigation component
│   ├── MCQLeaderboardTable.js   # Leaderboard table component
│   └── ComingSoon.js            # Coming soon placeholder
└── README.md                    # This documentation
```

## 🎯 Core Principles

- **Deterministic**: Same input always produces same output
- **Read-only**: Never writes to storage, only computes rankings
- **Derived data**: Leaderboards are computed from existing attempts
- **Fair ranking**: Consistent tie-breaking rules

## 🧮 Ranking Rules (Locked)

Rankings follow this exact priority order:

1. **Higher percentage** (primary metric)
2. **Lower time_taken** (tie-breaker #1) 
3. **Earlier completed_at** (tie-breaker #2)

## 📦 Module Responsibilities

### leaderboard.constants.js
- Rank labels and formatting
- Empty state messages
- Configuration constants
- No business logic

### mcqLeaderboard.datasource.js
- Fetches attempts from storage
- Filters invalid attempts
- Groups by challenge
- **No ranking or sorting**

Key functions:
- `getAttemptsForChallenge(challengeId)`
- `getAllChallengesWithAttempts()`
- `getChallengeSummary(challengeId)`

### mcqLeaderboard.logic.js
- Applies ranking rules
- Handles ties correctly
- Assigns ranks (1, 2, 3...)
- **No data fetching**

Key functions:
- `getLeaderboardForChallenge(challengeId)`
- `getUserRankInChallenge(challengeId, userId)`

### UI Components (Frontend)

### LeaderboardPageController.js
- Coordinates between logic and UI
- Handles tab switching and challenge selection
- **No ranking or sorting logic**
- Pure UI coordination

### Components (Stateless, Render-only)
- **LeaderboardTabs.js**: Tab navigation (MCQ/Game)
- **MCQLeaderboardTable.js**: Displays rankings in table format
- **ComingSoon.js**: Placeholder for Game leaderboard

All UI components:
- Receive data via props
- Never compute rankings
- Handle empty states gracefully

## 🔌 Usage Example

### Backend Logic Usage
```javascript
import { getLeaderboardForChallenge } from './leaderboard/mcqLeaderboard.logic.js';

// Get leaderboard for a challenge
const leaderboard = getLeaderboardForChallenge('challenge-1');

console.log(leaderboard);
// Output:
// {
//   challengeId: 'challenge-1',
//   totalParticipants: 5,
//   totalAttempts: 12,
//   hasData: true,
//   message: null,
//   leaderboard: [
//     {
//       rank: 1,
//       userId: 'user123',
//       percentage: 95,
//       timeTaken: 120,
//       completedAt: 1640995200000
//     },
//     // ... more entries
//   ]
// }
```

### Frontend Usage
1. **Open the leaderboard page**: Navigate to `leaderboard/leaderboard.html`
2. **Select a challenge**: Use the dropdown to choose an MCQ challenge
3. **View rankings**: See top 10 participants with their scores and times
4. **Switch tabs**: Toggle between MCQ Leaderboard (active) and Game Leaderboard (coming soon)

### Testing with Sample Data
```javascript
// In browser console on leaderboard.html:
// 1. Load test data generator
await import('./test-data-generator.js');

// 2. Generate sample data
generateTestData();

// 3. Refresh page to see populated leaderboard
location.reload();
```

## 🛡 Safety Features

- Validates all input data
- Handles empty/missing data gracefully
- Never mutates original attempt objects
- Consistent error handling
- Stable sorting algorithm

## 🚫 What This Module Does NOT Do

- ❌ Create or modify UI components (logic layer only)
- ❌ Write to localStorage or any storage
- ❌ Auto-create users or attempts
- ❌ Handle game session rankings
- ❌ Mix with analysis/progress logic

## 🎮 UI Features

### Page Structure
1. **Header**: "Leaderboard" with subtitle
2. **Tabs**: MCQ Leaderboard (active) | Game Leaderboard (coming soon)
3. **Challenge Selector**: Dropdown to choose MCQ challenge
4. **Leaderboard Table**: Top 10 participants with:
   - Rank (with special badges for 1st, 2nd, 3rd)
   - User ID (with "You" indicator)
   - Score percentage (color-coded)
   - Time taken (mm:ss format)
   - Attempt date

### UI Constraints
- ✅ Read-only display of rankings
- ✅ No ranking computation in UI
- ✅ Stateless components
- ✅ Graceful empty state handling

## 🎮 Future Extensions

The architecture supports adding game leaderboards later:
- Add `gameLeaderboard.datasource.js`
- Add `gameLeaderboard.logic.js` 
- Extend constants for game-specific rules
- UI can switch between MCQ/Game tabs