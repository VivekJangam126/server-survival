/**
 * BaseComponent - Base class for all UI components
 * Provides common functionality for component lifecycle and event handling
 */
class BaseComponent {
    constructor(app, elementId = null) {
        this.app = app;
        this.eventSystem = app.getModule('eventSystem');
        this.stateManager = app.getModule('stateManager');
        this.elementId = elementId;
        this.element = null;
        this.initialized = false;
        this.eventListeners = [];
        this.stateSubscriptions = [];
    }

    /**
     * Initialize the component
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Find or create the DOM element
            if (this.elementId) {
                this.element = document.getElementById(this.elementId);
                if (!this.element) {
                    console.warn(`BaseComponent: Element with ID '${this.elementId}' not found`);
                }
            }

            // Setup component-specific initialization
            await this.setup();

            // Bind event listeners
            this.bindEvents();

            // Subscribe to state changes
            this.subscribeToState();

            this.initialized = true;
            this.eventSystem.emit('component:initialized', { component: this.constructor.name });

        } catch (error) {
            console.error(`BaseComponent: Failed to initialize ${this.constructor.name}`, error);
            throw error;
        }
    }

    /**
     * Component-specific setup (override in subclasses)
     */
    async setup() {
        // Override in subclasses
    }

    /**
     * Bind event listeners (override in subclasses)
     */
    bindEvents() {
        // Override in subclasses
    }

    /**
     * Subscribe to state changes (override in subclasses)
     */
    subscribeToState() {
        // Override in subclasses
    }

    /**
     * Render the component
     */
    render() {
        // Override in subclasses
    }

    /**
     * Update the component with new data
     */
    update(data) {
        // Override in subclasses
    }

    /**
     * Show the component
     */
    show() {
        if (this.element) {
            this.element.classList.remove('hidden');
            this.element.style.display = '';
        }
        this.eventSystem.emit('component:shown', { component: this.constructor.name });
    }

    /**
     * Hide the component
     */
    hide() {
        if (this.element) {
            this.element.classList.add('hidden');
        }
        this.eventSystem.emit('component:hidden', { component: this.constructor.name });
    }

    /**
     * Toggle component visibility
     */
    toggle() {
        if (this.element) {
            if (this.element.classList.contains('hidden')) {
                this.show();
            } else {
                this.hide();
            }
        }
    }

    /**
     * Add event listener with automatic cleanup tracking
     */
    addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        this.eventListeners.push({ element, event, handler, options });
    }

    /**
     * Subscribe to application events with automatic cleanup
     */
    subscribeToEvent(event, handler) {
        const unsubscribe = this.eventSystem.on(event, handler);
        this.eventListeners.push({ unsubscribe });
        return unsubscribe;
    }

    /**
     * Subscribe to state changes with automatic cleanup
     */
    subscribeToStateChange(path, handler) {
        const unsubscribe = this.stateManager.subscribe(path, handler);
        this.stateSubscriptions.push(unsubscribe);
        return unsubscribe;
    }

    /**
     * Create DOM element with attributes and classes
     */
    createElement(tag, attributes = {}, classes = [], textContent = '') {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        // Add classes
        if (classes.length > 0) {
            element.classList.add(...classes);
        }

        // Set text content
        if (textContent) {
            element.textContent = textContent;
        }

        return element;
    }

    /**
     * Find element within component scope
     */
    querySelector(selector) {
        return this.element ? this.element.querySelector(selector) : document.querySelector(selector);
    }

    /**
     * Find elements within component scope
     */
    querySelectorAll(selector) {
        return this.element ? this.element.querySelectorAll(selector) : document.querySelectorAll(selector);
    }

    /**
     * Emit component-specific event
     */
    emit(event, data = null) {
        this.eventSystem.emit(`${this.constructor.name.toLowerCase()}:${event}`, data);
    }

    /**
     * Get current state value
     */
    getState(path) {
        return this.stateManager.getState(path);
    }

    /**
     * Set state value
     */
    setState(path, value) {
        this.stateManager.setState(path, value);
    }

    /**
     * Cleanup component resources
     */
    async cleanup() {
        // Remove event listeners
        this.eventListeners.forEach(({ element, event, handler, options, unsubscribe }) => {
            if (unsubscribe) {
                unsubscribe();
            } else if (element && event && handler) {
                element.removeEventListener(event, handler, options);
            }
        });
        this.eventListeners = [];

        // Remove state subscriptions
        this.stateSubscriptions.forEach(unsubscribe => unsubscribe());
        this.stateSubscriptions = [];

        // Component-specific cleanup
        await this.onCleanup();

        this.initialized = false;
        this.eventSystem.emit('component:cleanup', { component: this.constructor.name });
    }

    /**
     * Component-specific cleanup (override in subclasses)
     */
    async onCleanup() {
        // Override in subclasses
    }

    /**
     * Handle errors gracefully
     */
    handleError(error, context = 'unknown') {
        console.error(`${this.constructor.name}: Error in ${context}`, error);
        this.eventSystem.emit('component:error', {
            component: this.constructor.name,
            error,
            context
        });
    }
}

export { BaseComponent };