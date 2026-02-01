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
