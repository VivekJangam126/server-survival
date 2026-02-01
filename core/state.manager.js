/**
 * StateManager - Centralized state management with persistence and event integration
 * Handles application-wide state with reactive updates and data persistence
 */
class StateManager {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.state = {};
        this.subscribers = new Map();
        this.persistenceKey = 'cloud-learning-simulator-state';
        this.initialized = false;
    }

    /**
     * Initialize the state manager
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Load persisted state
            await this.restore();
            
            // Set up auto-save
            this.setupAutoSave();
            
            this.initialized = true;
            this.eventSystem.emit('state:initialized');
            
            console.log('StateManager: Initialized');
        } catch (error) {
            console.error('StateManager: Initialization failed', error);
            throw error;
        }
    }

    /**
     * Get state value by path
     */
    getState(path) {
        if (!path) return this.state;
        
        const keys = path.split('.');
        let current = this.state;
        
        for (const key of keys) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[key];
        }
        
        return current;
    }

    /**
     * Set state value by path
     */
    setState(path, value) {
        if (!path) {
            console.error('StateManager: Path is required for setState');
            return;
        }

        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = this.state;

        // Navigate to the parent object
        for (const key of keys) {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }

        // Set the value
        const oldValue = current[lastKey];
        current[lastKey] = value;

        // Notify subscribers
        this.notifySubscribers(path, value, oldValue);
        
        // Emit global state change event
        this.eventSystem.emit('state:changed', { path, value, oldValue });
    }

    /**
     * Subscribe to state changes at a specific path
     */
    subscribe(path, callback) {
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }
        this.subscribers.get(path).add(callback);

        // Return unsubscribe function
        return () => {
            const pathSubscribers = this.subscribers.get(path);
            if (pathSubscribers) {
                pathSubscribers.delete(callback);
                if (pathSubscribers.size === 0) {
                    this.subscribers.delete(path);
                }
            }
        };
    }

    /**
     * Notify subscribers of state changes
     */
    notifySubscribers(path, newValue, oldValue) {
        // Notify exact path subscribers
        const exactSubscribers = this.subscribers.get(path);
        if (exactSubscribers) {
            exactSubscribers.forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error(`StateManager: Error in subscriber for '${path}':`, error);
                }
            });
        }

        // Notify parent path subscribers
        const pathParts = path.split('.');
        for (let i = pathParts.length - 1; i > 0; i--) {
            const parentPath = pathParts.slice(0, i).join('.');
            const parentSubscribers = this.subscribers.get(parentPath);
            if (parentSubscribers) {
                const parentValue = this.getState(parentPath);
                parentSubscribers.forEach(callback => {
                    try {
                        callback(parentValue, undefined, parentPath);
                    } catch (error) {
                        console.error(`StateManager: Error in parent subscriber for '${parentPath}':`, error);
                    }
                });
            }
        }
    }

    /**
     * Merge state object at path
     */
    mergeState(path, partialState) {
        const currentState = this.getState(path) || {};
        const newState = { ...currentState, ...partialState };
        this.setState(path, newState);
    }

    /**
     * Initialize default state structure
     */
    initializeDefaultState() {
        const defaultState = {
            user: {
                profile: {
                    id: null,
                    username: '',
                    createdAt: new Date().toISOString(),
                    preferences: {
                        sound: true,
                        language: 'en',
                        profileVisibility: 'private'
                    }
                },
                progress: {
                    completedTutorials: [],
                    completedChallenges: [],
                    currentLevel: 1,
                    skillAssessments: {},
                    timeSpent: 0
                },
                achievements: [],
                statistics: {
                    gamesPlayed: 0,
                    totalScore: 0,
                    bestSurvivalTime: 0
                }
            },
            game: {
                mode: 'menu',
                currentSession: null,
                settings: {
                    difficulty: 'normal',
                    assistantEnabled: true,
                    tutorialPacing: 'normal'
                }
            },
            ui: {
                activeSection: 'dashboard',
                panelStates: {},
                notifications: []
            }
        };

        // Only set default values for missing keys
        this.mergeDefaultState(this.state, defaultState);
    }

    /**
     * Recursively merge default state without overwriting existing values
     */
    mergeDefaultState(current, defaults) {
        for (const key in defaults) {
            if (!(key in current)) {
                current[key] = defaults[key];
            } else if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
                this.mergeDefaultState(current[key], defaults[key]);
            }
        }
    }

    /**
     * Persist state to localStorage
     */
    async persist() {
        try {
            const stateToSave = {
                ...this.state,
                _timestamp: Date.now(),
                _version: '1.0.0'
            };
            
            localStorage.setItem(this.persistenceKey, JSON.stringify(stateToSave));
            this.eventSystem.emit('state:persisted');
        } catch (error) {
            console.error('StateManager: Failed to persist state', error);
            this.eventSystem.emit('state:persist-error', error);
        }
    }

    /**
     * Restore state from localStorage
     */
    async restore() {
        try {
            const savedState = localStorage.getItem(this.persistenceKey);
            
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                
                // Remove metadata
                delete parsedState._timestamp;
                delete parsedState._version;
                
                this.state = parsedState;
                this.eventSystem.emit('state:restored');
            }
            
            // Initialize any missing default state
            this.initializeDefaultState();
            
        } catch (error) {
            console.error('StateManager: Failed to restore state', error);
            this.initializeDefaultState();
            this.eventSystem.emit('state:restore-error', error);
        }
    }

    /**
     * Setup automatic state persistence
     */
    setupAutoSave() {
        // Save state on important events
        this.eventSystem.on('game:session-end', () => this.persist());
        this.eventSystem.on('user:progress-update', () => this.persist());
        this.eventSystem.on('app:before-unload', () => this.persist());
        
        // Periodic auto-save (every 30 seconds)
        setInterval(() => {
            this.persist();
        }, 30000);
    }

    /**
     * Clear all state
     */
    clearState() {
        this.state = {};
        this.initializeDefaultState();
        localStorage.removeItem(this.persistenceKey);
        this.eventSystem.emit('state:cleared');
    }

    /**
     * Get state snapshot for debugging
     */
    getSnapshot() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Validate state integrity
     */
    validateState() {
        // Basic validation - can be extended
        const requiredPaths = [
            'user.profile',
            'user.progress',
            'game.mode',
            'ui.activeSection'
        ];

        const issues = [];
        for (const path of requiredPaths) {
            if (this.getState(path) === undefined) {
                issues.push(`Missing required state: ${path}`);
            }
        }

        if (issues.length > 0) {
            console.warn('StateManager: State validation issues:', issues);
            return false;
        }

        return true;
    }
}

export { StateManager };