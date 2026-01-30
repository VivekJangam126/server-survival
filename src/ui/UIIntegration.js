/**
 * UIIntegration - Handles integration between new modular UI and legacy game UI
 * Manages the transition and coexistence of old and new UI elements
 */
class UIIntegration {
    constructor(app) {
        this.app = app;
        this.eventSystem = app.getModule('eventSystem');
        this.stateManager = app.getModule('stateManager');
        this.initialized = false;
        this.legacyElements = new Map();
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Hide legacy UI elements that are replaced by modular components
            this.hideLegacyElements();
            
            // Set up UI container
            this.setupUIContainer();
            
            // Set up event bridges
            this.setupEventBridges();
            
            this.initialized = true;
            this.eventSystem.emit('ui:integration-initialized');
            
            console.log('UIIntegration: Initialized');
        } catch (error) {
            console.error('UIIntegration: Initialization failed', error);
            throw error;
        }
    }

    hideLegacyElements() {
        // List of legacy UI elements to hide (they're replaced by modular components)
        const elementsToHide = [
            // We'll keep the original elements for now and gradually replace them
            // This allows for a smooth transition
        ];

        elementsToHide.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                this.legacyElements.set(selector, {
                    element: element,
                    originalDisplay: element.style.display,
                    hidden: false
                });
                // Don't hide yet - we'll do this gradually as we replace functionality
            }
        });
    }

    setupUIContainer() {
        // Ensure UI container exists
        let uiContainer = document.getElementById('ui-container');
        if (!uiContainer) {
            uiContainer = document.createElement('div');
            uiContainer.id = 'ui-container';
            uiContainer.className = 'absolute top-0 left-0 w-full h-full pointer-events-none';
            document.body.appendChild(uiContainer);
        }
    }

    setupEventBridges() {
        // Bridge events between legacy game and new UI system
        
        // Listen for legacy game events and forward to new system
        this.bridgeLegacyEvents();
        
        // Listen for new UI events and forward to legacy game
        this.bridgeNewUIEvents();
    }

    bridgeLegacyEvents() {
        // Monitor legacy STATE changes and emit events for new UI
        if (window.STATE) {
            let lastMoney = window.STATE.money;
            let lastReputation = window.STATE.reputation;
            let lastRPS = window.STATE.currentRPS;
            
            const checkStateChanges = () => {
                if (window.STATE) {
                    // Check for money changes
                    if (window.STATE.money !== lastMoney) {
                        this.eventSystem.emit('game:money-changed', {
                            oldValue: lastMoney,
                            newValue: window.STATE.money
                        });
                        lastMoney = window.STATE.money;
                    }
                    
                    // Check for reputation changes
                    if (window.STATE.reputation !== lastReputation) {
                        this.eventSystem.emit('game:reputation-changed', {
                            oldValue: lastReputation,
                            newValue: window.STATE.reputation
                        });
                        lastReputation = window.STATE.reputation;
                    }
                    
                    // Check for RPS changes
                    if (window.STATE.currentRPS !== lastRPS) {
                        this.eventSystem.emit('game:rps-changed', {
                            oldValue: lastRPS,
                            newValue: window.STATE.currentRPS
                        });
                        lastRPS = window.STATE.currentRPS;
                    }
                    
                    // Emit general stats update
                    this.eventSystem.emit('game:stats-update', {
                        money: window.STATE.money,
                        reputation: window.STATE.reputation,
                        currentRPS: window.STATE.currentRPS,
                        totalScore: window.STATE.score?.total || 0,
                        elapsedTime: window.STATE.elapsedGameTime || 0,
                        upkeepCost: this.calculateUpkeepCost()
                    });
                }
            };
            
            // Check for changes every 100ms
            setInterval(checkStateChanges, 100);
        }
    }

    bridgeNewUIEvents() {
        // Forward new UI events to legacy game functions
        
        this.eventSystem.on('game:tool-selected', (data) => {
            if (typeof window.setTool === 'function') {
                window.setTool(data.tool);
            }
        });

        this.eventSystem.on('ui:show-help', () => {
            if (typeof window.showFAQ === 'function') {
                window.showFAQ('game');
            }
        });

        this.eventSystem.on('audio:toggle-mute', () => {
            if (typeof window.toggleMute === 'function') {
                window.toggleMute();
            }
        });

        this.eventSystem.on('game:start-survival', () => {
            if (typeof window.startGame === 'function') {
                window.startGame();
            }
        });

        this.eventSystem.on('game:start-sandbox', () => {
            if (typeof window.startSandbox === 'function') {
                window.startSandbox();
            }
        });

        this.eventSystem.on('game:pause', () => {
            if (typeof window.setTimeScale === 'function') {
                window.setTimeScale(0);
            }
        });

        this.eventSystem.on('game:resume', () => {
            if (typeof window.setTimeScale === 'function') {
                window.setTimeScale(1);
            }
        });

        this.eventSystem.on('game:fast-forward', () => {
            if (typeof window.setTimeScale === 'function') {
                window.setTimeScale(3);
            }
        });
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

    // Gradually replace legacy UI elements
    replaceLegacyElement(selector, newComponent) {
        const legacyInfo = this.legacyElements.get(selector);
        if (legacyInfo && !legacyInfo.hidden) {
            legacyInfo.element.style.display = 'none';
            legacyInfo.hidden = true;
            console.log(`UIIntegration: Replaced legacy element ${selector}`);
        }
    }

    // Restore legacy UI element if needed
    restoreLegacyElement(selector) {
        const legacyInfo = this.legacyElements.get(selector);
        if (legacyInfo && legacyInfo.hidden) {
            legacyInfo.element.style.display = legacyInfo.originalDisplay;
            legacyInfo.hidden = false;
            console.log(`UIIntegration: Restored legacy element ${selector}`);
        }
    }

    // Check if modular UI should be active
    shouldUseModularUI() {
        // For now, always use modular UI alongside legacy
        // Later phases will fully replace legacy UI
        return true;
    }

    async cleanup() {
        // Restore all hidden legacy elements
        this.legacyElements.forEach((info, selector) => {
            if (info.hidden) {
                info.element.style.display = info.originalDisplay;
            }
        });
        
        this.legacyElements.clear();
        this.initialized = false;
        console.log('UIIntegration: Cleaned up');
    }
}

export { UIIntegration };