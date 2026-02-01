/**
 * ModeControllerManager - Manages all mode controllers and their lifecycle
 * Provides centralized mode switching and coordination
 */
class ModeControllerManager {
    constructor(app) {
        this.app = app;
        this.eventSystem = null;
        this.stateManager = null;
        this.router = null;
        this.controllers = new Map();
        this.currentController = null;
        this.isInitialized = false;
        this.transitionInProgress = false;
    }

    /**
     * Initialize the mode controller manager
     */
    async initialize() {
        if (this.isInitialized) return;

        // Get required modules
        this.eventSystem = this.app.getModule('eventSystem');
        this.stateManager = this.app.getModule('stateManager');
        this.router = this.app.getModule('router');

        if (!this.eventSystem || !this.stateManager) {
            throw new Error('ModeControllerManager requires EventSystem and StateManager');
        }

        // Register mode controllers
        await this.registerModeControllers();

        // Set up event listeners
        this.bindEvents();

        // Add global styles for mode controllers
        this.addGlobalStyles();

        this.isInitialized = true;
        console.log('ModeControllerManager: Initialized successfully');
    }

    /**
     * Register all mode controllers
     */
    async registerModeControllers() {
        try {
            // Import and register Play Mode Controller
            const { PlayModeController } = await import('/src/controllers/PlayModeController.js');
            const playController = new PlayModeController(this.app);
            this.controllers.set('play', playController);
            this.controllers.set('playMode', playController); // Alias for router compatibility

            // Import and register Learn Mode Controller
            const { LearnModeController } = await import('/src/controllers/LearnModeController.js');
            const learnController = new LearnModeController(this.app);
            this.controllers.set('learn', learnController);
            this.controllers.set('learnMode', learnController); // Alias for router compatibility

            // Import and register Analysis Mode Controller
            const { AnalysisModeController } = await import('/src/controllers/AnalysisModeController.js');
            const analysisController = new AnalysisModeController(this.app);
            this.controllers.set('analysis', analysisController);
            this.controllers.set('analysisMode', analysisController); // Alias for router compatibility

            // Import and register Profile Mode Controller
            const { ProfileModeController } = await import('/src/controllers/ProfileModeController.js');
            const profileController = new ProfileModeController(this.app);
            this.controllers.set('profile', profileController);
            this.controllers.set('profileMode', profileController); // Alias for router compatibility

            console.log('ModeControllerManager: All mode controllers registered');

        } catch (error) {
            console.error('ModeControllerManager: Failed to register mode controllers:', error);
            throw error;
        }
    }

    /**
     * Get a mode controller by name
     */
    getController(name) {
        return this.controllers.get(name);
    }

    /**
     * Switch to a specific mode
     */
    async switchToMode(modeName, options = {}) {
        if (this.transitionInProgress) {
            console.warn('ModeControllerManager: Transition already in progress');
            return false;
        }

        const controller = this.controllers.get(modeName);
        if (!controller) {
            console.warn(`ModeControllerManager: Controller '${modeName}' not found`);
            return false;
        }

        this.transitionInProgress = true;

        try {
            // Emit transition start event
            this.eventSystem.emit('mode-controller:transition-start', {
                from: this.currentController?.modeName,
                to: modeName,
                options
            });

            // Hide current controller if exists
            if (this.currentController && this.currentController !== controller) {
                await this.currentController.hide();
            }

            // Show new controller
            await controller.show(options);

            // Update current controller
            this.currentController = controller;

            // Update state
            this.stateManager.setState('modeController.current', modeName);
            this.stateManager.setState('modeController.options', options);

            // Emit transition complete event
            this.eventSystem.emit('mode-controller:transition-complete', {
                to: modeName,
                controller,
                options
            });

            console.log(`ModeControllerManager: Switched to ${modeName} mode`);
            return true;

        } catch (error) {
            console.error(`ModeControllerManager: Failed to switch to ${modeName}:`, error);
            this.eventSystem.emit('mode-controller:transition-error', {
                to: modeName,
                error,
                options
            });
            return false;

        } finally {
            this.transitionInProgress = false;
        }
    }

    /**
     * Hide all mode controllers
     */
    async hideAllModes() {
        const hidePromises = Array.from(this.controllers.values()).map(controller => {
            if (controller.isActive) {
                return controller.hide();
            }
            return Promise.resolve();
        });

        await Promise.all(hidePromises);
        this.currentController = null;

        console.log('ModeControllerManager: All modes hidden');
    }

    /**
     * Get current active controller
     */
    getCurrentController() {
        return this.currentController;
    }

    /**
     * Get current mode name
     */
    getCurrentMode() {
        return this.currentController?.modeName || null;
    }

    /**
     * Check if a mode is active
     */
    isModeActive(modeName) {
        const controller = this.controllers.get(modeName);
        return controller && controller.isActive;
    }

    /**
     * Update options for current mode
     */
    async updateCurrentModeOptions(options) {
        if (this.currentController) {
            await this.currentController.updateOptions(options);
            
            // Update stored options
            this.stateManager.setState('modeController.options', {
                ...this.stateManager.getState('modeController.options'),
                ...options
            });

            return true;
        }
        return false;
    }

    /**
     * Get state of all controllers
     */
    getAllControllerStates() {
        const states = {};
        this.controllers.forEach((controller, name) => {
            states[name] = controller.getState();
        });
        return states;
    }

    /**
     * Restore previous mode state
     */
    async restorePreviousState() {
        const savedMode = this.stateManager.getState('modeController.current');
        const savedOptions = this.stateManager.getState('modeController.options');

        if (savedMode && this.controllers.has(savedMode)) {
            await this.switchToMode(savedMode, savedOptions || {});
            console.log(`ModeControllerManager: Restored previous state - ${savedMode}`);
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Listen for router mode changes
        this.eventSystem.on('router:mode-changed', async (data) => {
            await this.switchToMode(data.to, data.options);
        });

        // Listen for direct mode switch requests
        this.eventSystem.on('mode-controller:switch', async (data) => {
            await this.switchToMode(data.mode, data.options);
        });

        // Listen for mode hide requests
        this.eventSystem.on('mode-controller:hide-all', async () => {
            await this.hideAllModes();
        });

        // Listen for options update requests
        this.eventSystem.on('mode-controller:update-options', async (data) => {
            await this.updateCurrentModeOptions(data.options);
        });

        // Listen for individual controller events
        this.controllers.forEach((controller, name) => {
            // Forward controller events with mode prefix
            this.eventSystem.on(`mode:${name.toLowerCase()}:shown`, (data) => {
                this.eventSystem.emit('mode-controller:mode-shown', {
                    mode: name,
                    ...data
                });
            });

            this.eventSystem.on(`mode:${name.toLowerCase()}:hidden`, (data) => {
                this.eventSystem.emit('mode-controller:mode-hidden', {
                    mode: name,
                    ...data
                });
            });
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            } else {
                this.handlePageVisible();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
    }

    /**
     * Handle page becoming hidden
     */
    handlePageHidden() {
        // Pause any active animations or processes
        if (this.currentController && typeof this.currentController.pause === 'function') {
            this.currentController.pause();
        }

        this.eventSystem.emit('mode-controller:page-hidden');
    }

    /**
     * Handle page becoming visible
     */
    handlePageVisible() {
        // Resume any paused processes
        if (this.currentController && typeof this.currentController.resume === 'function') {
            this.currentController.resume();
        }

        this.eventSystem.emit('mode-controller:page-visible');
    }

    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Notify current controller of resize
        if (this.currentController && typeof this.currentController.handleResize === 'function') {
            this.currentController.handleResize();
        }

        this.eventSystem.emit('mode-controller:window-resized', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }

    /**
     * Add global styles for mode controllers
     */
    addGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Mode Controller Global Styles */
            .mode-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow-y: auto;
                background: #111827;
                color: white;
                transition: opacity 0.3s ease, transform 0.3s ease;
                z-index: 10;
            }
            
            .mode-container.hidden {
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
            }
            
            .mode-container.active {
                opacity: 1;
                transform: translateY(0);
                pointer-events: all;
            }
            
            .mode-container.loading {
                pointer-events: none;
            }
            
            /* Loading spinner styles */
            .mode-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                z-index: 100;
            }
            
            .loading-spinner .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #374151;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-text {
                color: #9ca3af;
                font-size: 16px;
            }
            
            /* Mode header styles */
            .mode-header {
                padding: 24px;
                border-bottom: 1px solid #374151;
                background: rgba(17, 24, 39, 0.95);
                backdrop-filter: blur(8px);
            }
            
            .mode-title h1 {
                font-size: 2rem;
                font-weight: bold;
                margin-bottom: 8px;
                background: linear-gradient(135deg, #3b82f6, #06b6d4);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .mode-title p {
                color: #9ca3af;
                font-size: 1.1rem;
            }
            
            /* Tab styles */
            .submode-tabs {
                display: flex;
                gap: 8px;
                margin-bottom: 24px;
                border-bottom: 1px solid #374151;
                padding-bottom: 16px;
            }
            
            .tab-btn {
                padding: 12px 24px;
                background: transparent;
                border: 1px solid #374151;
                color: #9ca3af;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
            }
            
            .tab-btn:hover {
                background: #374151;
                color: white;
            }
            
            .tab-btn.active {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
            }
            
            /* Content styles */
            .tab-content {
                transition: opacity 0.2s ease;
            }
            
            .tab-content.hidden {
                display: none;
            }
            
            /* Message display */
            .message-display {
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                transition: all 0.3s ease;
            }
            
            .message-display.success {
                background: #10b981;
            }
            
            .message-display.error {
                background: #ef4444;
            }
            
            .message-display.info {
                background: #3b82f6;
            }
            
            .message-display.hidden {
                opacity: 0;
                transform: translateX(100%);
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .mode-header {
                    padding: 16px;
                }
                
                .mode-title h1 {
                    font-size: 1.5rem;
                }
                
                .submode-tabs {
                    flex-wrap: wrap;
                    gap: 4px;
                }
                
                .tab-btn {
                    padding: 8px 16px;
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Cleanup all controllers
     */
    async cleanup() {
        // Hide all modes
        await this.hideAllModes();

        // Cleanup all controllers
        const cleanupPromises = Array.from(this.controllers.values()).map(controller => 
            controller.cleanup()
        );
        await Promise.all(cleanupPromises);

        // Clear references
        this.controllers.clear();
        this.currentController = null;
        this.isInitialized = false;

        console.log('ModeControllerManager: Cleanup completed');
    }

    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            currentMode: this.getCurrentMode(),
            transitionInProgress: this.transitionInProgress,
            controllerCount: this.controllers.size,
            controllers: Array.from(this.controllers.keys()),
            currentControllerState: this.currentController?.getState() || null
        };
    }
}

export { ModeControllerManager };