/**
 * GameController - Bridges existing game logic with modular architecture
 * Manages game state, loop, and integration with legacy game.js
 */
class GameController {
    constructor(app) {
        this.app = app;
        this.eventSystem = app.getModule('eventSystem');
        this.stateManager = app.getModule('stateManager');
        this.initialized = false;
        this.gameLoopId = null;
        this.lastTime = 0;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize game state integration
            this.initializeGameStateIntegration();
            
            // Set up periodic state sync
            this.setupStateSync();
            
            this.initialized = true;
            this.eventSystem.emit('game:controller-initialized');
            
            console.log('GameController: Initialized');
        } catch (error) {
            console.error('GameController: Initialization failed', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Listen for app events
        this.eventSystem.on('app:ready', () => this.onAppReady());
        this.eventSystem.on('game:start', (data) => this.startGame(data));
        this.eventSystem.on('game:pause', () => this.pauseGame());
        this.eventSystem.on('game:resume', () => this.resumeGame());
        this.eventSystem.on('game:stop', () => this.stopGame());
        this.eventSystem.on('game:tool-selected', (data) => this.onToolSelected(data));
        
        // Listen for UI events
        this.eventSystem.on('ui:show-help', () => this.showHelp());
        this.eventSystem.on('audio:toggle-mute', () => this.toggleMute());
    }

    initializeGameStateIntegration() {
        // Create a bridge between legacy STATE object and new state manager
        this.createStateBridge();
        
        // Set up initial game state structure
        this.stateManager.setState('game.mode', 'menu');
        this.stateManager.setState('game.activeTool', 'select');
        this.stateManager.setState('game.currentSession', null);
    }

    createStateBridge() {
        // Create a proxy to sync legacy STATE with new state manager
        if (window.STATE) {
            // Sync important state changes from legacy STATE to new state manager
            const syncToNewState = () => {
                if (window.STATE) {
                    this.stateManager.setState('game.currentSession', {
                        money: window.STATE.money || 0,
                        reputation: window.STATE.reputation || 100,
                        currentRPS: window.STATE.currentRPS || 0,
                        totalScore: window.STATE.score?.total || 0,
                        upkeepCost: this.calculateUpkeepCost(),
                        elapsedTime: window.STATE.elapsedGameTime || 0,
                        gameMode: window.STATE.gameMode || 'survival',
                        isRunning: window.STATE.isRunning || false
                    });
                }
            };

            // Sync every 100ms during gameplay
            setInterval(syncToNewState, 100);
        }
    }

    calculateUpkeepCost() {
        if (!window.STATE?.services) return 0;
        
        const baseUpkeep = window.STATE.services.reduce(
            (sum, s) => sum + (s.config?.upkeep || 0) / 60,
            0
        );
        
        const multiplier = typeof window.getUpkeepMultiplier === 'function' 
            ? window.getUpkeepMultiplier() 
            : 1.0;
            
        const autoRepairCost = typeof window.getAutoRepairUpkeep === 'function' 
            ? window.getAutoRepairUpkeep() 
            : 0;
            
        return baseUpkeep * multiplier + autoRepairCost;
    }

    setupStateSync() {
        // Sync state changes from new state manager to legacy STATE
        this.stateManager.subscribe('game.activeTool', (tool) => {
            if (window.STATE && tool) {
                window.STATE.activeTool = tool;
                // Update UI if setTool function exists
                if (typeof window.setTool === 'function') {
                    window.setTool(tool);
                }
            }
        });

        this.stateManager.subscribe('game.mode', (mode) => {
            if (window.STATE && mode) {
                window.STATE.gameMode = mode;
            }
        });
    }

    onAppReady() {
        // Initialize game when app is ready
        console.log('GameController: App ready, initializing game integration');
        
        // Game integration is ready, but main menu will be shown by the main initialization
        console.log('GameController: Legacy game functions integrated');
    }

    startGame(data = {}) {
        const mode = data.mode || 'survival';
        
        // Update state
        this.stateManager.setState('game.mode', mode);
        this.stateManager.setState('game.currentSession', {
            startTime: Date.now(),
            mode: mode
        });

        // Call legacy start game function
        if (mode === 'sandbox' && typeof window.startSandbox === 'function') {
            window.startSandbox();
        } else if (typeof window.startGame === 'function') {
            window.startGame();
        }

        this.eventSystem.emit('game:started', { mode });
    }

    pauseGame() {
        if (typeof window.setTimeScale === 'function') {
            window.setTimeScale(0);
        }
        this.eventSystem.emit('game:paused');
    }

    resumeGame() {
        if (typeof window.setTimeScale === 'function') {
            window.setTimeScale(1);
        }
        this.eventSystem.emit('game:resumed');
    }

    stopGame() {
        if (typeof window.restartGame === 'function') {
            window.restartGame();
        }
        this.stateManager.setState('game.currentSession', null);
        this.eventSystem.emit('game:stopped');
    }

    onToolSelected(data) {
        // Tool selection is handled by the bridge
        console.log('GameController: Tool selected:', data.tool);
    }

    showHelp() {
        if (typeof window.showFAQ === 'function') {
            window.showFAQ('game');
        }
    }

    toggleMute() {
        if (typeof window.toggleMute === 'function') {
            window.toggleMute();
        }
    }

    // Public API methods
    getCurrentGameState() {
        return this.stateManager.getState('game.currentSession');
    }

    setGameMode(mode) {
        this.stateManager.setState('game.mode', mode);
    }

    getGameMode() {
        return this.stateManager.getState('game.mode');
    }

    // Cleanup
    async cleanup() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
        
        this.initialized = false;
        console.log('GameController: Cleaned up');
    }
}

export { GameController };