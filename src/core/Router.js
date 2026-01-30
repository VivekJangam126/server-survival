/**
 * Router - Application routing system for different modes and sections
 * Manages state preservation during transitions and mode switching
 */
class Router {
    constructor(app) {
        this.app = app;
        this.eventSystem = null;
        this.stateManager = null;
        this.currentMode = 'home';
        this.currentOptions = {};
        this.modeHistory = [];
        this.modeComponents = new Map();
        this.initialized = false;
    }

    /**
     * Initialize the router
     */
    async initialize() {
        if (this.initialized) return;

        // Ensure required modules are available
        if (!this.app.getModule('eventSystem') || !this.app.getModule('stateManager')) {
            throw new Error('Router requires EventSystem and StateManager to be initialized first');
        }

        this.eventSystem = this.app.getModule('eventSystem');
        this.stateManager = this.app.getModule('stateManager');

        // Register available modes and their components
        this.registerModes();
        
        // Set up event listeners
        this.bindEvents();
        
        // Restore previous state if available
        this.restoreState();
        
        this.initialized = true;
        console.log('Router: Initialized successfully');
    }

    /**
     * Register available application modes
     */
    registerModes() {
        this.modes = {
            play: {
                title: 'Play Mode',
                component: 'playMode',
                preserveState: true,
                requiresAuth: false,
                submodes: {
                    survival: { title: 'Survival Mode', component: 'survivalMode' },
                    challenge: { title: 'Challenge Mode', component: 'challengeMode' },
                    sandbox: { title: 'Sandbox Mode', component: 'sandboxMode' }
                }
            },
            learn: {
                title: 'Learn Mode',
                component: 'learnMode',
                preserveState: true,
                requiresAuth: false,
                submodes: {
                    tutorials: { title: 'Tutorials', component: 'tutorialMode' },
                    concepts: { title: 'Concepts', component: 'conceptMode' },
                    videos: { title: 'Videos', component: 'videoMode' }
                }
            },
            sandbox: {
                title: 'Sandbox',
                component: 'sandboxMode',
                preserveState: true,
                requiresAuth: false
            },
            analysis: {
                title: 'Analysis',
                component: 'analysisMode',
                preserveState: true,
                requiresAuth: false,
                submodes: {
                    performance: { title: 'Performance', component: 'performanceAnalysis' },
                    reports: { title: 'Reports', component: 'reportsMode' },
                    insights: { title: 'Insights', component: 'insightsMode' }
                }
            },
            profile: {
                title: 'Profile',
                component: 'profileMode',
                preserveState: true,
                requiresAuth: false,
                submodes: {
                    settings: { title: 'Settings', component: 'settingsMode' },
                    achievements: { title: 'Achievements', component: 'achievementsMode' },
                    progress: { title: 'Progress', component: 'progressMode' }
                }
            }
        };
    }

    /**
     * Navigate to a specific mode
     */
    async navigateTo(mode, options = {}) {
        try {
            // Validate mode
            if (!this.modes[mode]) {
                console.warn(`Router: Unknown mode '${mode}'`);
                return false;
            }

            const modeConfig = this.modes[mode];
            
            // Check authentication if required
            if (modeConfig.requiresAuth && !this.isAuthenticated()) {
                console.warn(`Router: Mode '${mode}' requires authentication`);
                this.navigateTo('login');
                return false;
            }

            // Store current state if mode supports it
            if (this.modes[this.currentMode]?.preserveState) {
                await this.preserveCurrentState();
            }

            // Add to history
            this.addToHistory(this.currentMode, this.currentOptions);

            // Update current mode
            const previousMode = this.currentMode;
            this.currentMode = mode;
            this.currentOptions = { ...options };

            // Handle submode if specified
            if (options.submode && modeConfig.submodes?.[options.submode]) {
                this.currentOptions.submode = options.submode;
            }

            // Emit mode change events
            this.eventSystem.emit('router:mode-changing', {
                from: previousMode,
                to: mode,
                options
            });

            // Perform the navigation
            await this.performNavigation(mode, options);

            // Update state
            this.stateManager.setState('router.currentMode', mode);
            this.stateManager.setState('router.currentOptions', this.currentOptions);

            // Emit completion event
            this.eventSystem.emit('router:mode-changed', {
                from: previousMode,
                to: mode,
                options: this.currentOptions
            });

            console.log(`Router: Navigated to ${mode}`, options);
            return true;

        } catch (error) {
            console.error(`Router: Navigation to ${mode} failed:`, error);
            this.eventSystem.emit('router:navigation-error', { mode, options, error });
            return false;
        }
    }

    /**
     * Perform the actual navigation
     */
    async performNavigation(mode, options) {
        const modeConfig = this.modes[mode];
        
        // Hide all mode components first
        this.hideAllModeComponents();

        // Show loading state if navigation takes time
        this.showLoadingState(mode);

        try {
            // Load and show the target mode component
            await this.loadModeComponent(mode, options);
            
            // Handle submode if specified
            if (options.submode) {
                await this.loadSubmodeComponent(mode, options.submode, options);
            }

            // Restore state if available
            if (modeConfig.preserveState) {
                await this.restoreModeState(mode, options);
            }

            // Hide loading state
            this.hideLoadingState();

        } catch (error) {
            this.hideLoadingState();
            throw error;
        }
    }

    /**
     * Load and show a mode component
     */
    async loadModeComponent(mode, options) {
        const modeConfig = this.modes[mode];
        const componentName = modeConfig.component;

        // Get or create the component
        let component = this.modeComponents.get(componentName);
        
        if (!component) {
            // Try to get from app modules first
            component = this.app.getModule(componentName);
            
            if (!component) {
                console.warn(`Router: Component '${componentName}' for mode '${mode}' not found`);
                return;
            }
            
            this.modeComponents.set(componentName, component);
        }

        // Show the component
        if (typeof component.show === 'function') {
            component.show();
        }

        // Update component with options if supported
        if (typeof component.updateOptions === 'function') {
            component.updateOptions(options);
        }

        // Emit component loaded event
        this.eventSystem.emit('router:component-loaded', { mode, component: componentName, options });
    }

    /**
     * Load and show a submode component
     */
    async loadSubmodeComponent(mode, submode, options) {
        const modeConfig = this.modes[mode];
        const submodeConfig = modeConfig.submodes?.[submode];
        
        if (!submodeConfig) {
            console.warn(`Router: Unknown submode '${submode}' for mode '${mode}'`);
            return;
        }

        const componentName = submodeConfig.component;
        
        // Get or create the submode component
        let component = this.modeComponents.get(componentName);
        
        if (!component) {
            component = this.app.getModule(componentName);
            
            if (!component) {
                console.warn(`Router: Component '${componentName}' for submode '${submode}' not found`);
                return;
            }
            
            this.modeComponents.set(componentName, component);
        }

        // Show the submode component
        if (typeof component.show === 'function') {
            component.show();
        }

        // Update component with options
        if (typeof component.updateOptions === 'function') {
            component.updateOptions(options);
        }

        // Emit submode loaded event
        this.eventSystem.emit('router:submode-loaded', { mode, submode, component: componentName, options });
    }

    /**
     * Hide all mode components
     */
    hideAllModeComponents() {
        this.modeComponents.forEach((component, name) => {
            if (typeof component.hide === 'function') {
                component.hide();
            }
        });
    }

    /**
     * Show loading state
     */
    showLoadingState(mode) {
        this.eventSystem.emit('router:loading-start', { mode });
        
        // You could show a loading spinner or transition here
        const loadingElement = document.getElementById('loading-screen');
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
            const statusElement = document.getElementById('loading-status');
            if (statusElement) {
                statusElement.textContent = `Loading ${this.modes[mode]?.title || mode}...`;
            }
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        this.eventSystem.emit('router:loading-end');
        
        const loadingElement = document.getElementById('loading-screen');
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
    }

    /**
     * Preserve current mode state
     */
    async preserveCurrentState() {
        const currentComponent = this.modeComponents.get(this.modes[this.currentMode]?.component);
        
        if (currentComponent && typeof currentComponent.getState === 'function') {
            const componentState = currentComponent.getState();
            this.stateManager.setState(`router.modeStates.${this.currentMode}`, componentState);
        }

        // Store current options
        this.stateManager.setState(`router.modeOptions.${this.currentMode}`, this.currentOptions);
    }

    /**
     * Restore mode state
     */
    async restoreModeState(mode, options) {
        const savedState = this.stateManager.getState(`router.modeStates.${mode}`);
        const savedOptions = this.stateManager.getState(`router.modeOptions.${mode}`);
        
        if (savedState || savedOptions) {
            const component = this.modeComponents.get(this.modes[mode]?.component);
            
            if (component) {
                if (savedState && typeof component.setState === 'function') {
                    component.setState(savedState);
                }
                
                if (savedOptions && typeof component.updateOptions === 'function') {
                    component.updateOptions({ ...savedOptions, ...options });
                }
            }
        }
    }

    /**
     * Add navigation to history
     */
    addToHistory(mode, options) {
        this.modeHistory.push({
            mode,
            options: { ...options },
            timestamp: Date.now()
        });

        // Limit history size
        if (this.modeHistory.length > 50) {
            this.modeHistory = this.modeHistory.slice(-50);
        }

        // Update state
        this.stateManager.setState('router.history', this.modeHistory);
    }

    /**
     * Navigate back to previous mode
     */
    async goBack() {
        if (this.modeHistory.length === 0) {
            console.warn('Router: No history to go back to');
            return false;
        }

        const previousEntry = this.modeHistory.pop();
        this.stateManager.setState('router.history', this.modeHistory);
        
        return await this.navigateTo(previousEntry.mode, previousEntry.options);
    }

    /**
     * Get current mode information
     */
    getCurrentMode() {
        return {
            mode: this.currentMode,
            options: { ...this.currentOptions },
            config: this.modes[this.currentMode]
        };
    }

    /**
     * Get navigation history
     */
    getHistory() {
        return [...this.modeHistory];
    }

    /**
     * Check if user is authenticated (placeholder)
     */
    isAuthenticated() {
        // For now, always return true since we don't have authentication yet
        return true;
    }

    /**
     * Restore router state from storage
     */
    restoreState() {
        const savedMode = this.stateManager.getState('router.currentMode');
        const savedOptions = this.stateManager.getState('router.currentOptions');
        const savedHistory = this.stateManager.getState('router.history');

        if (savedMode && this.modes[savedMode]) {
            this.currentMode = savedMode;
            this.currentOptions = savedOptions || {};
        }

        if (savedHistory && Array.isArray(savedHistory)) {
            this.modeHistory = savedHistory;
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Listen for app mode change requests
        this.eventSystem.on('app:mode-change', (data) => {
            this.navigateTo(data.mode, data.options);
        });

        // Listen for navigation requests
        this.eventSystem.on('navigation:request', (data) => {
            if (data.section) {
                this.navigateTo(data.section, data.options);
            }
        });

        // Listen for back navigation
        this.eventSystem.on('router:go-back', () => {
            this.goBack();
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.mode) {
                this.navigateTo(e.state.mode, e.state.options || {});
            }
        });
    }

    /**
     * Update browser history
     */
    updateBrowserHistory(mode, options) {
        const state = { mode, options };
        const title = this.modes[mode]?.title || mode;
        const url = `#${mode}${options.submode ? `/${options.submode}` : ''}`;
        
        window.history.pushState(state, title, url);
    }

    /**
     * Cleanup router resources
     */
    async cleanup() {
        // Preserve current state before cleanup
        if (this.modes[this.currentMode]?.preserveState) {
            await this.preserveCurrentState();
        }

        // Clear component references
        this.modeComponents.clear();
        
        // Clear history
        this.modeHistory = [];
        
        this.initialized = false;
        console.log('Router: Cleanup completed');
    }
}

export { Router };