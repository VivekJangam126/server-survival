# Phase 1: Static Data Layer - Implementation Complete

## Overview

Phase 1 establishes the foundational data layer for the Learn Mode and Game → Real-World Mapping Hub. All data is JSON-driven, enabling UI components to be built without rewriting content.

---

## Files Created

### 1. Canonical Concept Constants
**File:** `src/constants/concepts.js`

Exports a single `CONCEPTS` object with 10 canonical concept IDs:

| Constant | Value |
|----------|-------|
| LOAD_BALANCER | load_balancer |
| AUTO_SCALING | auto_scaling |
| CACHE | cache |
| TRAFFIC_SPIKES | traffic_spikes |
| BOTTLENECKS | bottlenecks |
| FAILURE_CHAINS | failure_chains |
| QUEUES | queues |
| WAF | waf |
| RATE_LIMITING | rate_limiting |
| COST_OPTIMIZATION | cost_optimization |

---

### 2. Learn Mode Tutorials
**File:** `src/data/learn/tutorials.json`

5 tutorials implemented:

| Order | ID | Title | Difficulty |
|-------|-----|-------|------------|
| 1 | load_balancer | Load Balancer & Traffic Handling | beginner |
| 2 | auto_scaling | Auto Scaling & Compute Capacity | beginner |
| 3 | cache | Cache & Performance Optimization | intermediate |
| 4 | traffic_spikes | Traffic Spikes, Bottlenecks & Failure Chains | intermediate |
| 5 | cost_optimization | Cost Optimization & Architecture Tradeoffs | intermediate |

**Unlock Flow:**
- load_balancer → unlocks: auto_scaling, rate_limiting
- auto_scaling → unlocks: cache, cost_optimization
- cache → unlocks: queues
- traffic_spikes → unlocks: waf, rate_limiting
- cost_optimization → unlocks: (none - terminal)

---

### 3. Mapping Hub - Game Events
**File:** `src/data/mapping/gameEvents.json`

7 game events implemented:

| Event ID | Severity | Primary Concepts |
|----------|----------|------------------|
| traffic_spike_collapse | high | traffic_spikes, auto_scaling |
| db_failed_first | high | cache, bottlenecks |
| system_slow_under_load | medium | cache, bottlenecks |
| costs_increased_fast | medium | cost_optimization, auto_scaling |
| security_attack_failure | high | waf, rate_limiting |
| stable_but_low_score | low | cost_optimization |
| queue_overflow | high | queues, auto_scaling |

---

### 4. Mapping Hub - Failure Chains
**File:** `src/data/mapping/failureChains.json`

2 failure chains implemented:

**Chain 1: Traffic Spike → Cascading Failure**
1. Traffic Spike → 2. Server Overload → 3. Database Overload → 4. Cascading System Failure

**Chain 2: Cost Spiral → Budget Exhaustion**
1. Over-Provisioning Resources → 2. Scaling Without Limits → 3. Budget Exhaustion

---

### 5. Mapping Hub - Architecture Decisions
**File:** `src/data/mapping/decisions.json`

7 decision patterns implemented:

| Decision ID | Decision |
|-------------|----------|
| lb_without_scaling | Added load balancer only |
| scaling_without_cache | Scaling compute without cache |
| no_queue_traffic_spike | No queue during traffic spikes |
| no_waf_during_attack | No WAF during attack traffic |
| over_provisioning_early | Over-provisioning everything early |
| cache_without_invalidation | Added cache without invalidation strategy |
| single_region_deployment | Deployed in single region only |

---

## Validation Checklist

- [x] All concept IDs match `concepts.js`
- [x] All `learnLinks` point to valid tutorial IDs
- [x] No circular unlock logic
- [x] Files are valid JSON (no comments)
- [x] No duplicated IDs
- [x] No UI logic in data files
- [x] Naming is consistent throughout

---

## Directory Structure

```
src/
├── constants/
│   └── concepts.js          # Canonical concept constants
└── data/
    ├── learn/
    │   └── tutorials.json   # Learn Mode tutorials
    └── mapping/
        ├── gameEvents.json      # Common game events
        ├── failureChains.json   # Failure chain definitions
        └── decisions.json       # Architecture decision analyzer
```

---

## Next Steps (Phase 2)

With the static data layer complete:
- UI components can consume tutorials.json for Learn Mode
- Mapping Hub can use gameEvents.json and failureChains.json
- Decision analyzer can reference decisions.json
- All references use canonical concept IDs from concepts.js

---

**Phase 1 Complete** ✅

---

# Phase 2: Routing & Navigation - Implementation Complete

## Overview

Phase 2 establishes the routing and navigation layer for Learn Mode and Mapping Hub. All navigation is context-aware, supporting back-navigation and query parameter preservation.

---

## Files Created

### 1. Routes Configuration
**File:** `src/router/routes.js`

Defines route patterns and utilities:

| Route Path | Name | Description |
|------------|------|-------------|
| `/learn` | learn-index | Learn Mode index page |
| `/learn/:conceptId` | learn-tutorial | Individual tutorial page |
| `/learn/mapping` | learn-mapping | Game → Real-World Mapping Hub |

**Exported Utilities:**
- `matchRoute(path)` - Match URL against defined routes
- `buildUrl(routeName, params, query)` - Construct URLs with parameters
- `parseQueryString(queryString)` - Parse query parameters
- `extractRouteParams(pattern)` - Extract parameter names from patterns

---

### 2. Navigation Utilities
**File:** `src/utils/navigation.js`

**Navigation Functions:**

| Function | Description | Example Output |
|----------|-------------|----------------|
| `goToLearn(conceptId, options)` | Navigate to tutorial | `/learn/cache?from=mapping&event=db_failed_first` |
| `goToLearnIndex(options)` | Navigate to learn index | `/learn?from=game` |
| `goToMapping(options)` | Navigate to Mapping Hub | `/learn/mapping?concept=cache&sessionId=last` |
| `getNavigationContext()` | Parse current URL context | `{ from, event, concept, sessionId, ... }` |

**Back Navigation:**
- `isFromMapping()` - Check if navigated from Mapping Hub
- `buildBackToMappingUrl()` - Build URL preserving context
- `getBackNavigationInfo()` - Get back navigation info with label

**Constants:**
- `CONTEXT_KEYS` - Query parameter key names
- `NAV_SOURCES` - Navigation source identifiers

---

### 3. Tutorial Page Controller
**File:** `src/pages/TutorialPage.js`

**Behavior (No UI):**
- Reads `conceptId` from route params
- Loads tutorial data from `tutorials.json`
- Validates `conceptId` (redirects to `/learn` if invalid)
- Exposes navigation context for UI layer
- Provides next/previous tutorial navigation

**Key Methods:**
- `initialize()` - Full page initialization
- `getState()` - Get current state for UI
- `shouldShowBackToMapping()` - Back navigation check
- `getNextTutorial()` / `getPreviousTutorial()` - Sequential navigation

---

### 4. Mapping Hub Page Controller
**File:** `src/pages/MappingHubPage.js`

**Behavior (No UI):**
- Reads query params: `concept`, `event`, `sessionId`, `chainId`, `decisionId`
- Handles `sessionId=last` special value
- Loads all mapping data files
- Provides filtering and highlighting logic
- Supports debug mode

**Key Methods:**
- `initialize()` - Full page initialization
- `getFilteredEvents()` - Get events filtered by concept/event
- `getHighlightedNodes()` - Get nodes to highlight in failure chains
- `buildLearnLink(conceptId)` - Build learn links with context
- `getDebugInfo()` - Debug information for development

---

### 5. Learn Index Page Controller
**File:** `src/pages/LearnIndexPage.js`

**Behavior (No UI):**
- Loads all tutorials sorted by order
- Parses navigation context
- Provides recommended tutorials based on context
- Builds navigation URLs to tutorials and mapping hub

---

## Query Parameter Schema

| Parameter | Used In | Description |
|-----------|---------|-------------|
| `from` | All | Source of navigation (mapping, learn, game) |
| `event` | Tutorial, Mapping | Related game event ID |
| `concept` | Mapping | Concept to filter/highlight |
| `sessionId` | All | Game session ID (or "last") |
| `chainId` | Mapping | Failure chain to display |
| `decisionId` | Mapping | Decision to analyze |
| `step` | Tutorial | Tutorial step position |

---

## Back Navigation Rules

| Condition | Behavior |
|-----------|----------|
| `from=mapping` | Show "Back to Mapping Hub" CTA with preserved context |
| `from=game` | Show "Back to Game" (handled by game) |
| Default | Show "Back to Learn" |

---

## Edge Case Handling

| Scenario | Behavior |
|----------|----------|
| Unknown `conceptId` | Redirect to `/learn` with replace |
| Missing query params | Use `null` values gracefully |
| Direct navigation to `/learn/mapping` | Works without filters |
| Page refresh with query params | Params preserved and parsed |
| `sessionId=last` | Resolved from localStorage/sessionStorage |

---

## Directory Structure

```
src/
├── router/
│   └── routes.js            # Route definitions and utilities
├── utils/
│   └── navigation.js        # Navigation helper functions
└── pages/
    ├── LearnIndexPage.js    # Learn index controller
    ├── TutorialPage.js      # Tutorial page controller
    └── MappingHubPage.js    # Mapping Hub controller
```

---

## Validation Checklist

- [x] All routes work on browser refresh
- [x] Query params persist across navigation
- [x] Back-navigation preserves context
- [x] Invalid conceptId redirects cleanly
- [x] No UI components (navigation layer only)
- [x] No data mutation
- [x] No side effects beyond navigation

---

**Phase 2 Complete** ✅

---

# Phase 3: Core UI Components - Implementation Complete

## Overview

Phase 3 establishes reusable UI components that will be shared across Learn Mode and the Mapping Hub. All components are props-driven, stateless where possible, and contain no hardcoded cloud terminology.

---

## Files Created

**Location:** `src/components/ui/`

### 1. SectionHeader.js
**Purpose:** Reusable section heading with optional subtitle and action

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | ✅ | Section title |
| `subtitle` | string | ❌ | Optional description |
| `rightAction` | HTMLElement | ❌ | Optional action element |

---

### 2. ExpandableCard.js
**Purpose:** Expandable/collapsible container for detailed content

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | ✅ | Card header title |
| `initiallyOpen` | boolean | ❌ | Start expanded (default: false) |
| `children` | HTMLElement/string | ❌ | Content when expanded |

**Methods:**
- `toggle()` - Toggle expanded state
- `open()` / `close()` - Explicit state control
- `isExpanded()` - Check current state

---

### 3. InfoPanel.js
**Purpose:** Structured explanation block (cause, effect, fix, etc.)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | string | ✅ | Always visible label |
| `content` | string/HTMLElement | ✅ | Text or element content |

---

### 4. TagBadge.js
**Purpose:** Small visual indicator/label

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `text` | string | ✅ | Badge text |
| `variant` | string | ❌ | default/warning/success/danger |

**Variants:**
- `default` - Gray styling
- `warning` - Yellow/amber styling
- `success` - Green styling
- `danger` - Red styling

**Helper:** `createBadgeGroup(items)` - Create multiple badges

---

### 5. LearnLink.js
**Purpose:** Standardized link to Learn Mode tutorials

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `conceptId` | string | ✅ | Concept ID to link to |
| `label` | string | ❌ | Link text (defaults to formatted conceptId) |
| `context` | object | ❌ | Navigation context (from, event, sessionId) |

**Behavior:**
- Uses `goToLearn()` from navigation helpers
- Generates correct URL with query params
- Auto-formats conceptId to Title Case if no label

**Helper:** `createLearnLinkGroup(items, sharedContext)` - Create multiple links

---

### 6. EmptyState.js
**Purpose:** Fallback state when no content to display

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | ✅ | Main title |
| `description` | string | ❌ | Optional description |
| `action` | HTMLElement | ❌ | Optional action element |

---

### 7. index.js
**Purpose:** Barrel export for all components

```javascript
import { 
    SectionHeader,
    ExpandableCard,
    InfoPanel,
    TagBadge,
    LearnLink,
    EmptyState
} from './components/ui/index.js';
```

---

## Component API Pattern

All components follow a consistent API:

```javascript
// Create component
const component = new ComponentName(props);

// Render to DOM
container.appendChild(component.render());

// Update props
component.update({ newProp: value });

// Get element reference
const element = component.getElement();

// Cleanup
component.destroy();
```

---

## Directory Structure

```
src/
└── components/
    └── ui/
        ├── index.js           # Barrel export
        ├── SectionHeader.js   # Section headings
        ├── ExpandableCard.js  # Collapsible containers
        ├── InfoPanel.js       # Labeled content blocks
        ├── TagBadge.js        # Visual indicators
        ├── LearnLink.js       # Tutorial links
        └── EmptyState.js      # Empty/fallback states
```

---

## Validation Checklist

- [x] Components render with dummy props
- [x] No runtime errors
- [x] No data coupling (no imports from data files)
- [x] No duplicated logic
- [x] No assumptions about specific pages
- [x] No hardcoded cloud terms
- [x] Clean prop documentation (JSDoc)
- [x] Consistent styling with project patterns

---

**Phase 3 Complete** ✅

---

# Phase 4: Learn Mode UI Assembly - Implementation Complete

## Overview

Phase 4 assembles the Learn Mode pages using the data layer (Phase 1), routing (Phase 2), and UI components (Phase 3). Users can now browse, complete, and track progress through tutorials.

---

## Files Created

### 1. Learn State Management
**File:** `src/state/learnState.js`

Manages tutorial completion and unlock status with localStorage persistence.

**State Structure:**
```javascript
{
  completedTutorials: string[],
  unlockedTutorials: string[]
}
```

**Key Methods:**
| Method | Description |
|--------|-------------|
| `initialize(tutorials)` | Initialize with tutorial data |
| `isCompleted(tutorialId)` | Check if tutorial is completed |
| `isUnlocked(tutorialId)` | Check if tutorial is unlocked |
| `isLocked(tutorialId)` | Check if tutorial is locked |
| `getTutorialStatus(tutorialId)` | Get status: locked/available/completed |
| `completeTutorial(tutorialId)` | Mark as complete, unlock next |
| `getStats()` | Get completion statistics |
| `subscribe(callback)` | Subscribe to state changes |
| `reset()` | Reset all progress |

**Locking Rules:**
- First tutorial is always unlocked
- Completing a tutorial unlocks tutorials listed in its `unlocks` array
- Next tutorial in order is also unlocked on completion
- State persists to localStorage

---

### 2. Learn Index Page
**File:** `src/pages/LearnPage.js`

Entry point for Learn Mode showing all tutorials.

**Features:**
- Progress overview with completion percentage
- Tutorial cards with status badges
- Lock/unlock visualization
- Difficulty and time estimates
- Navigation to tutorial detail

**Tutorial Card States:**

| Status | Badge | Action |
|--------|-------|--------|
| Locked | 🔒 Locked | Shows lock reason |
| Available | ▶ Available | "Start Tutorial" button |
| Completed | ✅ Completed | "Review Tutorial" button |

**UI Components Used:**
- `SectionHeader` - Page title
- `TagBadge` - Status and difficulty badges
- `EmptyState` - No tutorials fallback

---

### 3. Tutorial Detail Page
**File:** `src/pages/TutorialDetailPage.js`

Full tutorial view with content sections and completion.

**Content Sections (ExpandableCard):**
1. 📌 Concept Overview - What you'll learn
2. ❓ Why It Matters - Importance and impact
3. 🎮 Game Connection - How it relates to gameplay
4. 🌍 Real-World Application - Production examples
5. 💡 Key Takeaways - Summary points

**Features:**
- Back navigation (context-aware)
- Tutorial metadata display
- Related game events links to Mapping Hub
- Previous/Next tutorial navigation
- Mark as Completed button
- Unlocks next tutorials on completion
- Success message with next steps

**Navigation Context Handling:**
```
If ?from=mapping:
  Show "← Back to Failure Explanation"
Else:
  Show "← Back to Learn Mode"
```

**UI Components Used:**
- `SectionHeader` - Tutorial title
- `ExpandableCard` - Content sections
- `InfoPanel` - Labeled content blocks
- `TagBadge` - Status and difficulty
- `EmptyState` - Error/locked states

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| No tutorials available | EmptyState with message |
| Tutorial locked | Locked state UI with redirect to index |
| Invalid conceptId | Error state with back navigation |
| Data loading failure | Error state with refresh button |
| Page refresh | Progress preserved via localStorage |

---

## State Flow

```
User visits /learn
    ↓
LearnPage loads tutorials.json
    ↓
learnState.initialize(tutorials)
    ↓
Renders tutorial list with status from learnState
    ↓
User clicks unlocked tutorial
    ↓
TutorialDetailPage loads and renders
    ↓
User clicks "Mark as Completed"
    ↓
learnState.completeTutorial(id)
    ↓
Next tutorials unlocked
    ↓
State persisted to localStorage
```

---

## Directory Structure

```
src/
├── state/
│   └── learnState.js          # Learn progress state management
└── pages/
    ├── LearnPage.js           # Learn Mode index page
    ├── LearnIndexPage.js      # Navigation controller (Phase 2)
    ├── TutorialPage.js        # Navigation controller (Phase 2)
    └── TutorialDetailPage.js  # Tutorial detail page with UI
```

---

## Validation Checklist

- [x] /learn renders without errors
- [x] Tutorials show correct lock status
- [x] Clicking unlocked tutorial navigates correctly
- [x] Completion updates state and unlocks next
- [x] Page refresh preserves progress (localStorage)
- [x] Back navigation respects context (?from=mapping)
- [x] No console errors
- [x] Empty states handled
- [x] Locked tutorial access handled
- [x] Invalid conceptId handled

---

**Phase 4 Complete** ✅

---

# Phase 5: Mapping Hub UI Assembly

## Overview

Phase 5 assembles the Game → Real-World Mapping Hub UI using existing data (Phase 1) and UI components (Phase 3). This page explains why things happened in the game and bridges gameplay to real cloud concepts.

---

## Files Created

### MappingHubUI.js
**File:** `src/pages/MappingHubUI.js`

**Route:** `/learn/mapping`

**Purpose:**
- Explain why things happened in the game
- Bridge gameplay → real cloud concepts
- Complete the gameplay → learning loop

---

## Page Layout

```
SectionHeader: "Game → Real-World Mapping Hub"
----------------------------------
Section 1: Common Game Events (grid of event cards)
----------------------------------
Section 2: Failure Chain Explorer (expandable chains with nodes)
----------------------------------
Section 3: Architecture Decision Analyzer (accordion list)
----------------------------------
Section 4: Game ↔ Cloud Service Mapping (table with expandable rows)
----------------------------------
Section 5: Why Did I Lose? Debug Mode (session selector + analyze button)
```

---

## Section Details

### Section 1 — Common Game Events

**Data Source:** `src/data/mapping/gameEvents.json`

**UI Components Used:**
- Grid layout with clickable event cards
- `TagBadge` for severity indicators
- Modal detail panel on click

**Card Display:**
- Title
- Short description
- Severity badge (high=danger, medium=warning, low=success)

**Detail Panel Shows:**
- What happened (description)
- Primary concepts (TagBadges - danger variant)
- Secondary concepts (TagBadges - warning variant)
- Fix suggestions using `LearnLink` components

**Interaction:**
- Click card → Opens modal detail panel
- Click outside or ESC → Closes modal
- LearnLinks navigate to Learn Mode with context

---

### Section 2 — Failure Chain Explorer

**Data Source:** `src/data/mapping/failureChains.json`

**UI Components Used:**
- `ExpandableCard` for each failure chain
- Custom chain node layout (numbered steps)
- `TagBadge` for prevention concepts
- `LearnLink` for learning navigation

**Node Display:**
- Numbered indicator (1, 2, 3...)
- Node title
- Causes (truncated to 3)
- Effects (truncated to 3)
- Visual connector lines between nodes

**Node Click Behavior:**
- Shows expandable detail panel below node
- Prevention concepts as TagBadges
- LearnLinks for each prevention concept

**Context Highlighting:**
- Nodes matching `chainId` query param are highlighted
- Nodes matching `concept` query param are highlighted

---

### Section 3 — Architecture Decision Analyzer

**Data Source:** `src/data/mapping/decisions.json`

**UI Components Used:**
- `ExpandableCard` for each decision (accordion style)
- `TagBadge` for correct pattern concepts
- `LearnLink` for learning navigation

**Decision Card Shows:**
- Title: The decision made (collapsed)
- Expanded content:
  - ❌ Why It Failed (explanation)
  - ✓ Correct Architecture Pattern (concept badges)
  - 📚 Learn More (LearnLinks)

---

### Section 4 — Game ↔ Cloud Service Mapping

**Data Source:** Static inline `CLOUD_SERVICE_MAPPING` array

**Mappings:**
| Game Element | Cloud Concept | Learn Link |
|--------------|---------------|------------|
| Server Instances | Stateless Compute | auto_scaling |
| Fast Memory Store | In-Memory Cache | cache |
| Request Buffer | Message Queue | queues |
| Security Shield | Web Application Firewall | waf |
| Traffic Distributor | Load Balancer | load_balancer |
| Request Throttle | Rate Limiting | rate_limiting |

**UI:**
- Table layout with 3 columns
- Game Element | Cloud Concept | Learn
- Rows are expandable to show description
- LearnLink navigates with context

---

### Section 5 — "Why Did I Lose?" Debug Mode

**Purpose:** Help user analyze failure after a game session

**UI Components:**
- Session selector dropdown
- Analyze Failure button
- Output panel for results
- `EmptyState` for no data

**MVP Behavior:**
1. User selects "Last Session" from dropdown
2. Clicks "Analyze Failure"
3. Rule-based analysis runs (no AI/backend)
4. Output shows:
   - 🔴 Primary Failure
   - ⚠️ Root Cause
   - 📚 Suggested Learn Mode Topics

**Rule-Based Logic:**
- Picks first high-severity event as primary failure
- Picks first failure chain node as root cause
- Suggests learnLinks from the primary event

---

## Navigation Context Handling

**Query Parameters Read:**
- `event` - Auto-expands event section, highlights event
- `concept` - Filters related content, highlights nodes
- `sessionId` - Preserved for learn link context
- `chainId` - Auto-expands specific failure chain
- `decisionId` - Auto-expands specific decision

**Implementation:**
- `handleNavigationContext()` reads params after render
- Uses `expandedCards` Map to track card instances
- Calls `card.open()` to auto-expand relevant sections

---

## Empty & Edge States

**Handled Gracefully:**
| Scenario | Behavior |
|----------|----------|
| No mapping data | EmptyState with refresh action |
| Invalid event ID | Detail panel won't open |
| No session available | Debug output shows EmptyState |
| Direct navigation without params | Page renders normally |
| Data load failure | Error state with refresh button |

---

## Integration with Existing Code

**Uses from Phase 1:**
- `gameEvents.json` - Event data
- `failureChains.json` - Failure chain data
- `decisions.json` - Decision data

**Uses from Phase 2:**
- `MappingHubPage.js` - Navigation controller (data loading, query params)
- `navigation.js` - goToLearnIndex, NAV_SOURCES, getNavigationContext

**Uses from Phase 3:**
- `SectionHeader` - Section titles
- `ExpandableCard` - Collapsible sections
- `TagBadge` - Severity/concept badges
- `LearnLink` - Navigation to Learn Mode
- `createLearnLinkGroup` - Groups of LearnLinks
- `EmptyState` - Empty/error states

---

## Styling

- **Tailwind CSS only** - No new CSS files
- **Glass-panel aesthetic** - Matches Learn Mode
- **Visual density** - Consistent with Phase 4

**CSS Classes Used:**
- `glass-panel` - Panel backgrounds
- `grid grid-cols-*` - Event card grid
- `space-y-*` - Section spacing
- `divide-y` - Table row dividers
- Color variants: cyan (links), red (errors), yellow (warnings), green (success)

---

## Class Structure

```javascript
class MappingHubUI {
    // Properties
    container          // DOM container
    expandedCards      // Map<string, ExpandableCard>
    selectedEvent      // Current selected event ID
    selectedNode       // Current selected node ID
    debugOutput        // Debug output panel reference
    
    // Lifecycle
    initialize(container)  // Init and render
    render()               // Full page render
    destroy()              // Cleanup
    
    // Section Renderers
    renderPageHeader()
    renderGameEventsSection()
    renderFailureChainsSection()
    renderDecisionsSection()
    renderCloudMappingSection()
    renderDebugSection()
    
    // Event Handlers
    handleEventClick(event)
    handleNodeClick(node, container, icon)
    handleAnalyzeClick(sessionValue)
    
    // Helpers
    createEventCard(event)
    showEventDetail(event)
    createChainCard(chain)
    createChainNode(node, index, total, highlighted)
    createDecisionCard(decision)
    createMappingRow(mapping)
    performRuleBasedAnalysis()
    renderAnalysisResult(result)
    formatConceptName(conceptId)
    handleNavigationContext()
    renderError()
}
```

---

## Usage Example

```javascript
import { MappingHubUI } from './pages/MappingHubUI.js';

// Get container element
const container = document.getElementById('mapping-hub-container');

// Initialize UI
const mappingHub = new MappingHubUI();
await mappingHub.initialize(container);

// Later, cleanup
mappingHub.destroy();
```

---

## Validation Checklist

- [x] /learn/mapping loads without errors
- [x] Clicking event shows detail modal
- [x] Learn links navigate correctly with context
- [x] Failure chains render in correct order
- [x] Chain nodes are clickable and show details
- [x] Decisions accordion expands/collapses
- [x] Cloud mapping table rows are expandable
- [x] Debug mode shows output after analyze
- [x] Query params auto-expand relevant sections
- [x] Refresh preserves navigation context
- [x] No console errors
- [x] Empty states handled gracefully
- [x] Modal closes on ESC and backdrop click

---

## Project Status After Phase 5

✅ **Gameplay → Learning Loop Complete**
- Game events explain what happened
- Failure chains show cascading effects
- Decisions explain mistakes
- LearnLinks connect to tutorials

✅ **Unique Differentiator Established**
- Bidirectional mapping (Game ↔ Cloud)
- Visual failure chain exploration
- Debug mode for post-game analysis

✅ **MVP Feature Set Complete**
- Learn Mode (Phase 4)
- Mapping Hub (Phase 5)
- Navigation between them (Phase 2)
- Consistent UI components (Phase 3)

---

**Phase 5 Complete** ✅
