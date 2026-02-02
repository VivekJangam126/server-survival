/**
 * Learn State Unlock Logic Tests
 * Tests the pure unlock/completion logic without Supabase
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================================
// MOCK localStorage BEFORE ANY IMPORTS
// ============================================================
const localStorageMock = {
    store: {},
    getItem: vi.fn((key) => localStorageMock.store[key] || null),
    setItem: vi.fn((key, value) => { localStorageMock.store[key] = value; }),
    removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
    clear: vi.fn(() => { localStorageMock.store = {}; })
};

global.localStorage = localStorageMock;
global.window = { location: { search: '' } };

// ============================================================
// TESTABLE LEARN STATE CLASS (matches production logic)
// Extracted to avoid Supabase dependency
// ============================================================

const LEARN_STATE_KEY = 'learn-mode-progress';

const DEFAULT_LEARN_STATE = {
    completedTutorials: [],
    unlockedTutorials: []
};

class TestableLearnState {
    constructor() {
        this.state = { ...DEFAULT_LEARN_STATE };
        this.tutorials = [];
        this.initialized = false;
    }

    initialize(tutorials = []) {
        this.tutorials = tutorials;
        this.state = { ...DEFAULT_LEARN_STATE };
        
        // First tutorial always unlocked
        if (tutorials.length > 0) {
            this.unlockTutorial(tutorials[0].id);
        }
        
        this.initialized = true;
    }

    restore() {
        try {
            const saved = localStorage.getItem(LEARN_STATE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = {
                    completedTutorials: parsed.completedTutorials || [],
                    unlockedTutorials: parsed.unlockedTutorials || []
                };
            }
        } catch {
            this.state = { ...DEFAULT_LEARN_STATE };
        }
    }

    persist() {
        localStorage.setItem(LEARN_STATE_KEY, JSON.stringify(this.state));
    }

    isCompleted(tutorialId) {
        return this.state.completedTutorials.includes(tutorialId);
    }

    isUnlocked(tutorialId) {
        // First tutorial is always unlocked
        const tutorial = this.tutorials.find(t => t.id === tutorialId);
        if (tutorial?.order === 1) {
            return true;
        }
        return this.state.unlockedTutorials.includes(tutorialId);
    }

    isLocked(tutorialId) {
        return !this.isUnlocked(tutorialId);
    }

    unlockTutorial(tutorialId) {
        if (!this.state.unlockedTutorials.includes(tutorialId)) {
            this.state.unlockedTutorials.push(tutorialId);
            this.persist();
        }
    }

    completeTutorial(tutorialId) {
        // Cannot complete a locked tutorial
        if (this.isLocked(tutorialId)) {
            return false;
        }

        // Mark as completed
        if (!this.state.completedTutorials.includes(tutorialId)) {
            this.state.completedTutorials.push(tutorialId);
        }
        
        // Unlock next tutorial in order
        const tutorial = this.tutorials.find(t => t.id === tutorialId);
        if (tutorial) {
            const nextTutorial = this.tutorials.find(t => t.order === tutorial.order + 1);
            if (nextTutorial) {
                this.unlockTutorial(nextTutorial.id);
            }
        }
        
        this.persist();
        return true;
    }

    getState() {
        return {
            completedTutorials: [...this.state.completedTutorials],
            unlockedTutorials: [...this.state.unlockedTutorials]
        };
    }

    reset() {
        this.state = { ...DEFAULT_LEARN_STATE };
        if (this.tutorials.length > 0) {
            this.state.unlockedTutorials.push(this.tutorials[0].id);
        }
        this.persist();
    }
}

// ============================================================
// TESTS
// ============================================================

describe('LearnState Unlock Logic', () => {
    let learnState;
    
    const mockTutorials = [
        { id: 'tutorial-1', title: 'Intro', order: 1 },
        { id: 'tutorial-2', title: 'Basics', order: 2 },
        { id: 'tutorial-3', title: 'Advanced', order: 3 },
        { id: 'tutorial-4', title: 'Expert', order: 4 }
    ];

    beforeEach(() => {
        localStorageMock.clear();
        learnState = new TestableLearnState();
    });

    describe('initialization', () => {
        it('first tutorial is unlocked by default', () => {
            learnState.initialize(mockTutorials);
            
            expect(learnState.isUnlocked('tutorial-1')).toBe(true);
            expect(learnState.isLocked('tutorial-2')).toBe(true);
            expect(learnState.isLocked('tutorial-3')).toBe(true);
        });
    });

    describe('completion', () => {
        it('completing tutorial marks it completed', () => {
            learnState.initialize(mockTutorials);
            
            learnState.completeTutorial('tutorial-1');
            
            expect(learnState.isCompleted('tutorial-1')).toBe(true);
        });

        it('completing tutorial unlocks next tutorial', () => {
            learnState.initialize(mockTutorials);
            
            // Complete tutorials 1 and 2 to unlock tutorial-3
            learnState.completeTutorial('tutorial-1');
            learnState.completeTutorial('tutorial-2');
            
            // After completing tutorial-2, tutorial-3 should be unlocked
            expect(learnState.getState().unlockedTutorials).toContain('tutorial-3');
        });

        it('duplicate completion does not duplicate unlock', () => {
            learnState.initialize(mockTutorials);
            
            learnState.completeTutorial('tutorial-1');
            learnState.completeTutorial('tutorial-1');
            
            const state = learnState.getState();
            const completedCount = state.completedTutorials.filter(id => id === 'tutorial-1').length;
            
            expect(completedCount).toBe(1);
        });

        it('locked tutorial cannot be completed', () => {
            learnState.initialize(mockTutorials);
            
            // tutorial-4 is definitely locked (tutorials 2 and 3 not completed)
            expect(learnState.getState().unlockedTutorials).not.toContain('tutorial-4');
            
            const result = learnState.completeTutorial('tutorial-4');
            
            expect(result).toBe(false);
            expect(learnState.isCompleted('tutorial-4')).toBe(false);
        });
    });

    describe('progression', () => {
        it('completing all tutorials in sequence works correctly', () => {
            learnState.initialize(mockTutorials);
            
            // Complete tutorial 1
            learnState.completeTutorial('tutorial-1');
            expect(learnState.isUnlocked('tutorial-2')).toBe(true);
            
            // Complete tutorial 2
            learnState.completeTutorial('tutorial-2');
            expect(learnState.isUnlocked('tutorial-3')).toBe(true);
            
            // Complete tutorial 3
            learnState.completeTutorial('tutorial-3');
            expect(learnState.isUnlocked('tutorial-4')).toBe(true);
        });
    });

    describe('persistence', () => {
        it('state is persisted to localStorage', () => {
            learnState.initialize(mockTutorials);
            learnState.completeTutorial('tutorial-1');
            
            expect(localStorage.setItem).toHaveBeenCalled();
            
            const saved = JSON.parse(localStorageMock.store[LEARN_STATE_KEY]);
            expect(saved.completedTutorials).toContain('tutorial-1');
        });
    });
});
