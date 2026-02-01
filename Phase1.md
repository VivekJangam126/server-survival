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
