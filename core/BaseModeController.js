/**
 * BaseModeController - Base class for all mode controllers
 * Provides common functionality for mode management and transitions
 */
class BaseModeController {
    constructor(app, modeName) {
        this.app = app;
        this.modeName = modeName;
        this.eventSystem = null;
        this.stateManager = null;
        this.router = null;
        this.isActive = false;
        this.isInitialized = false;
        this.state = {};
        this.options = {};
        this.container = null;
        this.loadingPromise = null;
    }

    /**
     * Initialize the mode controller
     */
    async initialize() {
        if (this.isInitialized) return;

        // Get required modules
        this.eventSystem = this.app.getModule('eventSystem');
        this.stateManager = this.app.getModule('stateManager');
        this.router = this.app.getModule('router');

        if (!this.eventSystem || !this.stateManager) {
            throw new Error(`${this.modeName}Controller requires EventSystem and StateManager`);
        }

        // Create container element
        this.createContainer();

        // Bind events
        this.bindEvents();

        // Initialize mode-specific logic
        await this.initializeMode();

        this.isInitialized = true;
        console.log(`${this.modeName}Controller: Initialized successfully`);
    }

    /**
     * Create container element for this mode
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = `${this.modeName.toLowerCase()}-mode-container`;
        this.container.className = `mode-container ${this.modeName.toLowerCase()}-mode hidden`;
        this.container.setAttribute('data-mode', this.modeName.toLowerCase());
        
        // Add to UI container or body
        const uiContainer = document.getElementById('ui-container') || document.body;
        uiContainer.appendChild(this.container);
    }

    /**
     * Show this mode
     */
    async show(options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // Update options
        this.options = { ...this.options, ...options };

        // Show loading state
        this.showLoadingState();

        try {
            // Prepare mode for display
            await this.prepareMode(options);

            // Show container
            if (this.container) {
                this.container.classList.remove('hidden');
                this.container.classList.add('active');
            }

            // Activate mode
            await this.activate(options);

            this.isActive = true;
            this.hideLoadingState();

            // Emit mode shown event
            this.eventSystem.emit(`mode:${this.modeName.toLowerCase()}:shown`, {
                mode: this.modeName,
                options: this.options
            });

            console.log(`${this.modeName}Controller: Mode shown`);

        } catch (error) {
            this.hideLoadingState();
            console.error(`${this.modeName}Controller: Failed to show mode:`, error);
            throw error;
        }
    }

    /**
     * Hide this mode
     */
    async hide() {
        if (!this.isActive) return;

        try {
            // Deactivate mode
            await this.deactivate();

            // Hide container
            if (this.container) {
                this.container.classList.add('hidden');
                this.container.classList.remove('active');
            }

            this.isActive = false;

            // Emit mode hidden event
            this.eventSystem.emit(`mode:${this.modeName.toLowerCase()}:hidden`, {
                mode: this.modeName
            });

            console.log(`${this.modeName}Controller: Mode hidden`);

        } catch (error) {
            console.error(`${this.modeName}Controller: Failed to hide mode:`, error);
        }
    }

    /**
     * Update mode options
     */
    async updateOptions(newOptions = {}) {
        const previousOptions = { ...this.options };
        this.options = { ...this.options, ...newOptions };

        if (this.isActive) {
            await this.handleOptionsChange(previousOptions, this.options);
        }

        // Emit options updated event
        this.eventSystem.emit(`mode:${this.modeName.toLowerCase()}:options-updated`, {
            mode: this.modeName,
            previousOptions,
            currentOptions: this.options
        });
    }

    /**
     * Get current mode state
     */
    getState() {
        return {
            ...this.state,
            options: { ...this.options },
            isActive: this.isActive,
            timestamp: Date.now()
        };
    }

    /**
     * Set mode state
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        
        if (this.isActive) {
            this.handleStateChange(newState);
        }

        // Emit state updated event
        this.eventSystem.emit(`mode:${this.modeName.toLowerCase()}:state-updated`, {
            mode: this.modeName,
            state: this.state
        });
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        if (this.container) {
            this.container.classList.add('loading');
            
            // Add loading spinner if not exists
            let loadingSpinner = this.container.querySelector('.mode-loading');
            if (!loadingSpinner) {
                loadingSpinner = document.createElement('div');
                loadingSpinner.className = 'mode-loading';
                loadingSpinner.innerHTML = `
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <div class="loading-text">Loading ${this.modeName}...</div>
                    </div>
                `;
                this.container.appendChild(loadingSpinner);
            }
            
            loadingSpinner.classList.remove('hidden');
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        if (this.container) {
            this.container.classList.remove('loading');
            
            const loadingSpinner = this.container.querySelector('.mode-loading');
            if (loadingSpinner) {
                loadingSpinner.classList.add('hidden');
            }
        }
    }

    /**
     * Add transition effects
     */
    addTransitionEffects() {
        if (this.container) {
            this.container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }
    }

    /**
     * Bind common events
     */
    bindEvents() {
        // Listen for mode-specific events
        this.eventSystem.on(`mode:${this.modeName.toLowerCase()}:show`, (data) => {
            this.show(data.options);
        });

        this.eventSystem.on(`mode:${this.modeName.toLowerCase()}:hide`, () => {
            this.hide();
        });

        this.eventSystem.on(`mode:${this.modeName.toLowerCase()}:update-options`, (data) => {
            this.updateOptions(data.options);
        });

        // Listen for router events
        this.eventSystem.on('router:mode-changing', (data) => {
            if (data.from === this.modeName.toLowerCase() && this.isActive) {
                this.hide();
            }
        });

        this.eventSystem.on('router:mode-changed', (data) => {
            if (data.to === this.modeName.toLowerCase()) {
                this.show(data.options);
            }
        });
    }

    /**
     * Cleanup mode resources
     */
    async cleanup() {
        if (this.isActive) {
            await this.hide();
        }

        // Remove container
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        // Clear references
        this.container = null;
        this.state = {};
        this.options = {};
        this.isInitialized = false;

        console.log(`${this.modeName}Controller: Cleanup completed`);
    }

    // Abstract methods to be implemented by subclasses
    
    /**
     * Initialize mode-specific logic
     * Override in subclasses
     */
    async initializeMode() {
        // Default implementation - override in subclasses
    }

    /**
     * Prepare mode for display
     * Override in subclasses
     */
    async prepareMode(options) {
        // Default implementation - override in subclasses
    }

    /**
     * Activate mode (called when mode becomes active)
     * Override in subclasses
     */
    async activate(options) {
        // Default implementation - override in subclasses
    }

    /**
     * Deactivate mode (called when mode becomes inactive)
     * Override in subclasses
     */
    async deactivate() {
        // Default implementation - override in subclasses
    }

    /**
     * Handle options change
     * Override in subclasses
     */
    async handleOptionsChange(previousOptions, currentOptions) {
        // Default implementation - override in subclasses
    }

    /**
     * Handle state change
     * Override in subclasses
     */
    handleStateChange(newState) {
        // Default implementation - override in subclasses
    }
}

export { BaseModeController };