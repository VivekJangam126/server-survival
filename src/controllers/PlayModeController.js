/**
 * PlayModeController - Manages the Play mode with survival, challenge, and sandbox submodes
 */
import { BaseModeController } from '../core/BaseModeController.js';

class PlayModeController extends BaseModeController {
    constructor(app) {
        super(app, 'Play');
        this.currentSubmode = 'survival';
        this.gameInstance = null;
        this.gameState = null;
        this.submodeControllers = new Map();
    }

    /**
     * Initialize Play mode specific logic
     */
    async initializeMode() {
        // Create Play mode UI
        this.createPlayModeUI();
        
        // Initialize submode controllers
        await this.initializeSubmodes();
        
        // Set up game integration
        this.setupGameIntegration();
        
        // Add transition effects
        this.addTransitionEffects();
    }

    /**
     * Create Play mode UI
     */
    createPlayModeUI() {
        this.container.innerHTML = `
            <div class="play-mode-header">
                <div class="mode-title">
                    <h1>🎮 Play Mode</h1>
                    <p>Choose your adventure in the cloud</p>
                </div>
                <div class="submode-selector">
                    <button class="submode-btn active" data-submode="survival">
                        ⚡ Survival
                    </button>
                    <button class="submode-btn" data-submode="challenge">
                        🏆 Challenge
                    </button>
                    <button class="submode-btn" data-submode="sandbox">
                        🛠️ Sandbox
                    </button>
                </div>
            </div>
            
            <div class="play-mode-content">
                <div class="submode-container" id="survival-container">
                    <div class="submode-info">
                        <h2>Survival Mode</h2>
                        <p>Test your skills in an ever-changing cloud environment. Keep your infrastructure running as challenges increase!</p>
                        <div class="mode-features">
                            <div class="feature">🔥 Dynamic challenges</div>
                            <div class="feature">📈 Progressive difficulty</div>
                            <div class="feature">🎯 Real-time feedback</div>
                        </div>
                        <button class="start-mode-btn" data-action="start-survival">
                            Start Survival Mode
                        </button>
                    </div>
                </div>
                
                <div class="submode-container hidden" id="challenge-container">
                    <div class="submode-info">
                        <h2>Challenge Mode</h2>
                        <p>Complete focused 3-5 minute scenarios targeting specific cloud computing concepts.</p>
                        <div class="mode-features">
                            <div class="feature">⏱️ Timed challenges</div>
                            <div class="feature">🎯 Specific objectives</div>
                            <div class="feature">🏅 Immediate feedback</div>
                        </div>
                        <div class="challenge-selector">
                            <select id="challenge-select">
                                <option value="">Select a challenge...</option>
                                <option value="cost-optimization">Cost Optimization</option>
                                <option value="security-hardening">Security Hardening</option>
                                <option value="scaling-strategy">Auto Scaling</option>
                                <option value="disaster-recovery">Disaster Recovery</option>
                            </select>
                        </div>
                        <button class="start-mode-btn" data-action="start-challenge" disabled>
                            Start Challenge
                        </button>
                    </div>
                </div>
                
                <div class="submode-container hidden" id="sandbox-container">
                    <div class="submode-info">
                        <h2>Sandbox Mode</h2>
                        <p>Experiment freely with cloud architectures in a safe environment with AI assistant guidance.</p>
                        <div class="mode-features">
                            <div class="feature">🤖 AI Assistant</div>
                            <div class="feature">🔬 Free experimentation</div>
                            <div class="feature">💾 Save architectures</div>
                        </div>
                        <div class="sandbox-options">
                            <label>
                                <input type="checkbox" id="enable-assistant" checked>
                                Enable AI Assistant
                            </label>
                            <label>
                                <input type="checkbox" id="guided-mode">
                                Guided Mode
                            </label>
                        </div>
                        <button class="start-mode-btn" data-action="start-sandbox">
                            Enter Sandbox
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="game-container hidden" id="game-container">
                <!-- Game will be loaded here -->
            </div>
        `;
        
        // Bind UI events
        this.bindPlayModeEvents();
    }

    /**
     * Bind Play mode specific events
     */
    bindPlayModeEvents() {
        // Submode selector buttons
        this.container.querySelectorAll('.submode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const submode = e.target.dataset.submode;
                this.switchSubmode(submode);
            });
        });

        // Start mode buttons
        this.container.querySelectorAll('.start-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleStartAction(action);
            });
        });

        // Challenge selector
        const challengeSelect = this.container.querySelector('#challenge-select');
        if (challengeSelect) {
            challengeSelect.addEventListener('change', (e) => {
                const startBtn = this.container.querySelector('[data-action="start-challenge"]');
                startBtn.disabled = !e.target.value;
            });
        }
    }

    /**
     * Initialize submode controllers
     */
    async initializeSubmodes() {
        // For now, we'll use simple submode management
        // In the future, these could be separate controller classes
        this.submodes = {
            survival: {
                title: 'Survival Mode',
                description: 'Dynamic cloud infrastructure challenges',
                gameMode: 'survival'
            },
            challenge: {
                title: 'Challenge Mode',
                description: 'Focused learning scenarios',
                gameMode: 'challenge'
            },
            sandbox: {
                title: 'Sandbox Mode',
                description: 'Free experimentation with AI guidance',
                gameMode: 'sandbox'
            }
        };
    }

    /**
     * Set up game integration
     */
    setupGameIntegration() {
        // Listen for game events
        this.eventSystem.on('game:started', (data) => {
            this.handleGameStarted(data);
        });

        this.eventSystem.on('game:ended', (data) => {
            this.handleGameEnded(data);
        });

        this.eventSystem.on('game:paused', (data) => {
            this.handleGamePaused(data);
        });
    }

    /**
     * Prepare Play mode for display
     */
    async prepareMode(options) {
        // Set submode if specified
        if (options.submode && this.submodes[options.submode]) {
            this.currentSubmode = options.submode;
            this.switchSubmode(options.submode);
        }

        // Check if we should start a game immediately
        if (options.autoStart) {
            setTimeout(() => {
                this.handleStartAction(`start-${this.currentSubmode}`);
            }, 500);
        }
    }

    /**
     * Activate Play mode
     */
    async activate(options) {
        // Show navbar but prepare to hide it during gameplay
        if (window.sharedNavbar) {
            window.sharedNavbar.show();
        }

        // Update active submode
        this.updateSubmodeUI();

        // Emit activation event
        this.eventSystem.emit('play-mode:activated', {
            submode: this.currentSubmode,
            options
        });
    }

    /**
     * Deactivate Play mode
     */
    async deactivate() {
        // Stop any running game
        if (this.gameInstance) {
            this.stopGame();
        }

        // Show navbar if it was hidden
        if (window.sharedNavbar) {
            window.sharedNavbar.show();
        }

        // Emit deactivation event
        this.eventSystem.emit('play-mode:deactivated');
    }

    /**
     * Switch to a different submode
     */
    switchSubmode(submode) {
        if (!this.submodes[submode]) {
            console.warn(`PlayModeController: Unknown submode '${submode}'`);
            return;
        }

        const previousSubmode = this.currentSubmode;
        this.currentSubmode = submode;

        // Update UI
        this.updateSubmodeUI();

        // Emit submode change event
        this.eventSystem.emit('play-mode:submode-changed', {
            from: previousSubmode,
            to: submode
        });

        console.log(`PlayModeController: Switched to ${submode} submode`);
    }

    /**
     * Update submode UI
     */
    updateSubmodeUI() {
        // Update submode buttons
        this.container.querySelectorAll('.submode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.submode === this.currentSubmode);
        });

        // Show/hide submode containers
        this.container.querySelectorAll('.submode-container').forEach(container => {
            const isActive = container.id === `${this.currentSubmode}-container`;
            container.classList.toggle('hidden', !isActive);
        });
    }

    /**
     * Handle start action for different submodes
     */
    async handleStartAction(action) {
        try {
            switch (action) {
                case 'start-survival':
                    await this.startSurvivalMode();
                    break;
                case 'start-challenge':
                    await this.startChallengeMode();
                    break;
                case 'start-sandbox':
                    await this.startSandboxMode();
                    break;
                default:
                    console.warn(`PlayModeController: Unknown action '${action}'`);
            }
        } catch (error) {
            console.error(`PlayModeController: Failed to handle action '${action}':`, error);
            this.showError(`Failed to start ${action.replace('start-', '')} mode`);
        }
    }

    /**
     * Start survival mode
     */
    async startSurvivalMode() {
        console.log('PlayModeController: Starting survival mode');
        
        // Hide navbar during gameplay
        if (window.sharedNavbar) {
            window.sharedNavbar.hide();
        }

        // Hide mode selection UI
        this.container.querySelector('.play-mode-content').classList.add('hidden');
        this.container.querySelector('.game-container').classList.remove('hidden');

        // Start the game
        this.startGame('survival');

        // Emit event
        this.eventSystem.emit('play-mode:survival-started');
    }

    /**
     * Start challenge mode
     */
    async startChallengeMode() {
        const challengeSelect = this.container.querySelector('#challenge-select');
        const selectedChallenge = challengeSelect.value;

        if (!selectedChallenge) {
            this.showError('Please select a challenge first');
            return;
        }

        console.log(`PlayModeController: Starting challenge mode - ${selectedChallenge}`);

        // Hide navbar during gameplay
        if (window.sharedNavbar) {
            window.sharedNavbar.hide();
        }

        // Hide mode selection UI
        this.container.querySelector('.play-mode-content').classList.add('hidden');
        this.container.querySelector('.game-container').classList.remove('hidden');

        // Start the game with challenge
        this.startGame('challenge', { challenge: selectedChallenge });

        // Emit event
        this.eventSystem.emit('play-mode:challenge-started', { challenge: selectedChallenge });
    }

    /**
     * Start sandbox mode
     */
    async startSandboxMode() {
        const enableAssistant = this.container.querySelector('#enable-assistant').checked;
        const guidedMode = this.container.querySelector('#guided-mode').checked;

        console.log('PlayModeController: Starting sandbox mode', { enableAssistant, guidedMode });

        // Hide navbar during gameplay
        if (window.sharedNavbar) {
            window.sharedNavbar.hide();
        }

        // Hide mode selection UI
        this.container.querySelector('.play-mode-content').classList.add('hidden');
        this.container.querySelector('.game-container').classList.remove('hidden');

        // Start the game
        this.startGame('sandbox', { enableAssistant, guidedMode });

        // Emit event
        this.eventSystem.emit('play-mode:sandbox-started', { enableAssistant, guidedMode });
    }

    /**
     * Start the actual game
     */
    startGame(mode, options = {}) {
        // For now, redirect to the play.html page with the appropriate mode
        // In the future, this could load the game directly in the container
        
        // Store the mode and options for the game
        sessionStorage.setItem('gameMode', mode);
        sessionStorage.setItem('gameOptions', JSON.stringify(options));
        
        // Navigate to the game page
        window.location.href = 'play.html';
    }

    /**
     * Stop the current game
     */
    stopGame() {
        if (this.gameInstance) {
            // Stop game logic here
            this.gameInstance = null;
        }

        // Show mode selection UI
        this.container.querySelector('.play-mode-content').classList.remove('hidden');
        this.container.querySelector('.game-container').classList.add('hidden');

        // Show navbar
        if (window.sharedNavbar) {
            window.sharedNavbar.show();
        }

        // Emit event
        this.eventSystem.emit('play-mode:game-stopped');
    }

    /**
     * Handle game started event
     */
    handleGameStarted(data) {
        this.gameState = 'running';
        this.gameInstance = data.instance;
        
        // Update UI state
        this.setState({ gameState: 'running', gameMode: data.mode });
    }

    /**
     * Handle game ended event
     */
    handleGameEnded(data) {
        this.gameState = 'ended';
        
        // Show results or return to mode selection
        setTimeout(() => {
            this.stopGame();
        }, 2000);
        
        // Update UI state
        this.setState({ gameState: 'ended', results: data.results });
    }

    /**
     * Handle game paused event
     */
    handleGamePaused(data) {
        this.gameState = 'paused';
        
        // Show navbar when paused
        if (window.sharedNavbar) {
            window.sharedNavbar.show();
        }
        
        // Update UI state
        this.setState({ gameState: 'paused' });
    }

    /**
     * Show error message
     */
    showError(message) {
        // Create or update error display
        let errorDiv = this.container.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            this.container.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }

    /**
     * Handle options change
     */
    async handleOptionsChange(previousOptions, currentOptions) {
        // Handle submode change
        if (currentOptions.submode !== previousOptions.submode) {
            this.switchSubmode(currentOptions.submode);
        }

        // Handle auto-start
        if (currentOptions.autoStart && !previousOptions.autoStart) {
            this.handleStartAction(`start-${this.currentSubmode}`);
        }
    }

    /**
     * Get current state
     */
    getState() {
        return {
            ...super.getState(),
            currentSubmode: this.currentSubmode,
            gameState: this.gameState,
            gameInstance: this.gameInstance ? 'active' : null
        };
    }
}

export { PlayModeController };