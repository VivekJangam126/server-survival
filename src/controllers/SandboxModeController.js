/**
 * SandboxModeController - Handles Sandbox mode UI events and interactions
 * 
 * Responsibilities:
 * - Handle options UI events
 * - On Start → call Sandbox engine start logic
 * - On Continue → call Sandbox load logic  
 * - On Manual / FAQ → show manual exactly as in main.html
 * 
 * MUST NOT:
 * - Import or reference game.js
 * - Import or reference PlayModeController
 * - Modify game logic
 */

export class SandboxModeController {
    constructor() {
        this.mode = 'sandbox';
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('SandboxModeController: Initializing...');
        
        // Initialize UI event handlers
        this.setupEventHandlers();
        
        // Apply initial UI state
        this.updateUI();
        
        this.isInitialized = true;
        console.log('SandboxModeController: Initialized successfully');
    }

    setupEventHandlers() {
        // Start Sandbox button
        const startBtn = document.querySelector('[onclick="startSandbox()"]');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleStartSandbox();
            });
        }

        // Continue Game button  
        const continueBtn = document.querySelector('[onclick="loadGameState()"]');
        if (continueBtn) {
            continueBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleContinueGame();
            });
        }

        // Manual / FAQ button
        const manualBtn = document.querySelector('[onclick="showFAQ()"]');
        if (manualBtn) {
            manualBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleShowManual();
            });
        }

        // Resume Game button
        const resumeBtn = document.querySelector('[onclick="resumeGame()"]');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleResumeGame();
            });
        }

        // Sandbox control handlers
        this.setupSandboxControls();
    }

    setupSandboxControls() {
        // Budget controls
        const budgetSlider = document.getElementById('budget-slider');
        const budgetInput = document.getElementById('budget-input');
        
        if (budgetSlider) {
            budgetSlider.addEventListener('input', (e) => {
                this.handleSetSandboxBudget(e.target.value);
            });
        }
        
        if (budgetInput) {
            budgetInput.addEventListener('change', (e) => {
                this.handleSetSandboxBudget(e.target.value);
            });
        }

        // RPS controls
        const rpsSlider = document.getElementById('rps-slider');
        const rpsInput = document.getElementById('rps-input');
        
        if (rpsSlider) {
            rpsSlider.addEventListener('input', (e) => {
                this.handleSetSandboxRPS(e.target.value);
            });
        }
        
        if (rpsInput) {
            rpsInput.addEventListener('change', (e) => {
                this.handleSetSandboxRPS(e.target.value);
            });
        }

        // Traffic mix controls
        this.setupTrafficMixControls();

        // Burst controls
        this.setupBurstControls();

        // Utility buttons
        this.setupUtilityButtons();
    }

    setupTrafficMixControls() {
        const trafficTypes = ['static', 'read', 'write', 'upload', 'search', 'malicious'];
        
        trafficTypes.forEach(type => {
            const slider = document.getElementById(`${type}-slider`);
            const input = document.getElementById(`${type}-input`);
            
            if (slider) {
                slider.addEventListener('input', (e) => {
                    this.handleSetTrafficMix(type.toUpperCase(), e.target.value);
                });
            }
            
            if (input) {
                input.addEventListener('change', (e) => {
                    this.handleSetTrafficMix(type.toUpperCase(), e.target.value);
                });
            }
        });
    }

    setupBurstControls() {
        const burstInput = document.getElementById('burst-input');
        if (burstInput) {
            burstInput.addEventListener('change', (e) => {
                this.handleSetBurstCount(e.target.value);
            });
        }

        // Burst buttons
        const burstTypes = ['STATIC', 'read', 'WRITE', 'UPLOAD', 'SEARCH', 'MALICIOUS'];
        burstTypes.forEach(type => {
            const btn = document.querySelector(`[onclick="spawnBurst('${type}')"]`);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleSpawnBurst(type);
                });
            }
        });
    }

    setupUtilityButtons() {
        // Reset Budget button
        const resetBudgetBtn = document.querySelector('[onclick="resetBudget()"]');
        if (resetBudgetBtn) {
            resetBudgetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleResetBudget();
            });
        }

        // Toggle Upkeep button
        const upkeepToggleBtn = document.querySelector('[onclick="toggleUpkeep()"]');
        if (upkeepToggleBtn) {
            upkeepToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleToggleUpkeep();
            });
        }

        // Clear All Services button
        const clearAllBtn = document.querySelector('[onclick="clearAllServices()"]');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleClearAllServices();
            });
        }
    }

    // Event Handlers

    handleStartSandbox() {
        console.log('SandboxModeController: Starting Sandbox mode...');
        
        // Hide main menu
        const mainMenu = document.getElementById('main-menu-modal');
        if (mainMenu) {
            mainMenu.classList.add('hidden');
        }

        // Hide shared navbar during gameplay
        if (window.sharedNavbar) {
            window.sharedNavbar.hide();
        }

        // Call Sandbox engine start logic (from sandbox_game.js)
        if (typeof window.startSandbox === 'function') {
            window.startSandbox();
        } else {
            console.error('SandboxModeController: startSandbox function not found in sandbox engine');
        }
    }

    handleContinueGame() {
        console.log('SandboxModeController: Continuing saved game...');
        
        // Call Sandbox load logic (from sandbox_game.js)
        if (typeof window.loadGameState === 'function') {
            window.loadGameState();
        } else {
            console.error('SandboxModeController: loadGameState function not found in sandbox engine');
        }
    }

    handleResumeGame() {
        console.log('SandboxModeController: Resuming game...');
        
        // Hide main menu
        const mainMenu = document.getElementById('main-menu-modal');
        if (mainMenu) {
            mainMenu.classList.add('hidden');
        }

        // Hide shared navbar during gameplay
        if (window.sharedNavbar) {
            window.sharedNavbar.hide();
        }

        // Call resume logic (from sandbox_game.js)
        if (typeof window.resumeGame === 'function') {
            window.resumeGame();
        } else {
            console.error('SandboxModeController: resumeGame function not found in sandbox engine');
        }
    }

    handleShowManual() {
        console.log('SandboxModeController: Showing manual/FAQ...');
        
        // Show manual exactly as in main.html (from sandbox_game.js)
        if (typeof window.showFAQ === 'function') {
            window.showFAQ();
        } else {
            console.error('SandboxModeController: showFAQ function not found in sandbox engine');
        }
    }

    // Sandbox Control Handlers

    handleSetSandboxBudget(value) {
        console.log(`SandboxModeController: Setting budget to ${value}`);
        
        if (typeof window.setSandboxBudget === 'function') {
            window.setSandboxBudget(value);
        } else {
            console.error('SandboxModeController: setSandboxBudget function not found in sandbox engine');
        }
    }

    handleSetSandboxRPS(value) {
        console.log(`SandboxModeController: Setting RPS to ${value}`);
        
        if (typeof window.setSandboxRPS === 'function') {
            window.setSandboxRPS(value);
        } else {
            console.error('SandboxModeController: setSandboxRPS function not found in sandbox engine');
        }
    }

    handleSetTrafficMix(type, value) {
        console.log(`SandboxModeController: Setting traffic mix ${type} to ${value}%`);
        
        if (typeof window.setTrafficMix === 'function') {
            window.setTrafficMix(type, value);
        } else {
            console.error('SandboxModeController: setTrafficMix function not found in sandbox engine');
        }
    }

    handleSetBurstCount(value) {
        console.log(`SandboxModeController: Setting burst count to ${value}`);
        
        if (typeof window.setBurstCount === 'function') {
            window.setBurstCount(value);
        } else {
            console.error('SandboxModeController: setBurstCount function not found in sandbox engine');
        }
    }

    handleSpawnBurst(type) {
        console.log(`SandboxModeController: Spawning ${type} burst`);
        
        if (typeof window.spawnBurst === 'function') {
            window.spawnBurst(type);
        } else {
            console.error('SandboxModeController: spawnBurst function not found in sandbox engine');
        }
    }

    handleResetBudget() {
        console.log('SandboxModeController: Resetting budget');
        
        if (typeof window.resetBudget === 'function') {
            window.resetBudget();
        } else {
            console.error('SandboxModeController: resetBudget function not found in sandbox engine');
        }
    }

    handleToggleUpkeep() {
        console.log('SandboxModeController: Toggling upkeep');
        
        if (typeof window.toggleUpkeep === 'function') {
            window.toggleUpkeep();
        } else {
            console.error('SandboxModeController: toggleUpkeep function not found in sandbox engine');
        }
    }

    handleClearAllServices() {
        console.log('SandboxModeController: Clearing all services');
        
        if (typeof window.clearAllServices === 'function') {
            window.clearAllServices();
        } else {
            console.error('SandboxModeController: clearAllServices function not found in sandbox engine');
        }
    }

    // UI Updates

    updateUI() {
        // Update UI elements based on current state
        this.updateBudgetDisplay();
        this.updateRPSDisplay();
        this.updateTrafficMixDisplay();
    }

    updateBudgetDisplay() {
        // Sync budget UI controls with current state
        if (window.STATE && window.STATE.sandboxBudget !== undefined) {
            const budgetSlider = document.getElementById('budget-slider');
            const budgetInput = document.getElementById('budget-input');
            
            if (budgetSlider) budgetSlider.value = window.STATE.sandboxBudget;
            if (budgetInput) budgetInput.value = window.STATE.sandboxBudget;
        }
    }

    updateRPSDisplay() {
        // Sync RPS UI controls with current state
        if (window.STATE && window.STATE.currentRPS !== undefined) {
            const rpsSlider = document.getElementById('rps-slider');
            const rpsInput = document.getElementById('rps-input');
            
            if (rpsSlider) rpsSlider.value = window.STATE.currentRPS;
            if (rpsInput) rpsInput.value = window.STATE.currentRPS;
        }
    }

    updateTrafficMixDisplay() {
        // Sync traffic mix UI controls with current state
        if (window.STATE && window.STATE.trafficDistribution) {
            const trafficTypes = {
                'static': 'STATIC',
                'read': 'read', 
                'write': 'WRITE',
                'upload': 'UPLOAD',
                'search': 'SEARCH',
                'malicious': 'MALICIOUS'
            };

            Object.entries(trafficTypes).forEach(([uiKey, stateKey]) => {
                const slider = document.getElementById(`${uiKey}-slider`);
                const input = document.getElementById(`${uiKey}-input`);
                const value = Math.round((window.STATE.trafficDistribution[stateKey] || 0) * 100);
                
                if (slider) slider.value = value;
                if (input) input.value = value;
            });
        }
    }

    // Mode Controller Interface

    activate() {
        console.log('SandboxModeController: Activating...');
        this.updateUI();
    }

    deactivate() {
        console.log('SandboxModeController: Deactivating...');
    }

    cleanup() {
        console.log('SandboxModeController: Cleaning up...');
        // Remove event listeners if needed
    }
}