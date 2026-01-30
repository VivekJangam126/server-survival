/**
 * ApplicationController - Main application controller and module loader
 * Manages the overall application lifecycle and module coordination
 */
class ApplicationController {
    constructor() {
        this.modules = new Map();
        this.eventSystem = null;
        this.stateManager = null;
        this.initialized = false;
    }

    /**
     * Initialize the application and load core modules
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Initialize core systems first
            await this.initializeCoreModules();
            
            // Initialize UI modules
            await this.initializeUIModules();
            
            // Initialize game modules
            await this.initializeGameModules();
            
            this.initialized = true;
            this.eventSystem.emit('app:initialized');
            
            console.log('ApplicationController: Initialization complete');
        } catch (error) {
            console.error('ApplicationController: Initialization failed', error);
            throw error;
        }
    }

    /**
     * Load and register a module
     */
    async loadModule(moduleName, moduleClass) {
        try {
            if (this.modules.has(moduleName)) {
                console.warn(`Module ${moduleName} already loaded`);
                return this.modules.get(moduleName);
            }

            const moduleInstance = new moduleClass(this);
            
            // Initialize module if it has an initialize method
            if (typeof moduleInstance.initialize === 'function') {
                await moduleInstance.initialize();
            }

            this.modules.set(moduleName, moduleInstance);
            this.eventSystem?.emit('module:loaded', { name: moduleName });
            
            console.log(`Module loaded: ${moduleName}`);
            return moduleInstance;
        } catch (error) {
            console.error(`Failed to load module ${moduleName}:`, error);
            throw error;
        }
    }

    /**
     * Get a loaded module
     */
    getModule(moduleName) {
        return this.modules.get(moduleName);
    }

    /**
     * Switch application mode (survival, sandbox, learn, etc.)
     */
    switchMode(mode, options = {}) {
        // Use router for navigation if available
        if (this.router) {
            this.router.navigateTo(mode, options);
        } else {
            // Fallback to event system
            this.eventSystem.emit('app:mode-change', { mode, options });
        }
    }

    /**
     * Handle global application events
     */
    handleGlobalEvents() {
        // Handle window events
        window.addEventListener('beforeunload', () => {
            this.eventSystem.emit('app:before-unload');
        });

        window.addEventListener('resize', () => {
            this.eventSystem.emit('app:resize');
        });

        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.eventSystem.emit('app:hidden');
            } else {
                this.eventSystem.emit('app:visible');
            }
        });
    }

    /**
     * Initialize core system modules
     */
    async initializeCoreModules() {
        // Import and initialize EventSystem
        const { EventSystem } = await import('./EventSystem.js');
        this.eventSystem = new EventSystem();

        // Import and initialize StateManager
        const { StateManager } = await import('./StateManager.js');
        this.stateManager = new StateManager(this.eventSystem);
        await this.stateManager.initialize();

        // Register core modules BEFORE initializing other modules
        this.modules.set('eventSystem', this.eventSystem);
        this.modules.set('stateManager', this.stateManager);

        // Import and initialize Router
        const { Router } = await import('./Router.js');
        this.router = new Router(this);
        await this.router.initialize();
        this.modules.set('router', this.router);

        // Import and initialize ModeControllerManager
        const { ModeControllerManager } = await import('./ModeControllerManager.js');
        this.modeControllerManager = new ModeControllerManager(this);
        await this.modeControllerManager.initialize();
        this.modules.set('modeControllerManager', this.modeControllerManager);

        // Import and initialize BackwardCompatibility (after modules are registered)
        const { BackwardCompatibility } = await import('./BackwardCompatibility.js');
        this.backwardCompatibility = new BackwardCompatibility(this);
        await this.backwardCompatibility.initialize();

        // Register BackwardCompatibility module
        this.modules.set('backwardCompatibility', this.backwardCompatibility);

        // Set up global event handling
        this.handleGlobalEvents();
    }

    /**
     * Initialize UI modules
     */
     async initializeUIModules() {
        // Import and initialize UIIntegration
        const { UIIntegration } = await import('../ui/UIIntegration.js');
        await this.loadModule('uiIntegration', UIIntegration);

        // Note: Dashboard and Navigation are handled separately in dashboard.html
        // Only load game-specific UI components here
        
        console.log('UI modules initialized');
    }

    /**
     * Initialize game modules
     */
    async initializeGameModules() {
        // Import and initialize GameController
        const { GameController } = await import('./GameController.js');
        await this.loadModule('gameController', GameController);
        
        console.log('Game modules initialized');
    }

    /**
     * Cleanup and shutdown
     */
    async shutdown() {
        this.eventSystem.emit('app:shutdown');
        
        // Cleanup modules in reverse order
        const moduleNames = Array.from(this.modules.keys()).reverse();
        for (const moduleName of moduleNames) {
            const module = this.modules.get(moduleName);
            if (typeof module.cleanup === 'function') {
                await module.cleanup();
            }
        }
        
        this.modules.clear();
        this.initialized = false;
    }
}

export { ApplicationController };