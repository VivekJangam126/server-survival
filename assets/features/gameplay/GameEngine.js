/**
 * GameEngine - Core game lifecycle and main loop
 * 
 * Responsibilities:
 * - Game lifecycle (start, pause, end)
 * - Main game loop
 * - Tick/update coordination
 * - Manager orchestration
 * 
 * @module GameEngine
 */

class GameEngine {
    constructor(options = {}) {
        // Store references to Three.js objects
        this.scene = options.scene;
        this.camera = options.camera;
        this.renderer = options.renderer;
        this.serviceGroup = options.serviceGroup;
        this.connectionGroup = options.connectionGroup;
        this.requestGroup = options.requestGroup;
        this.container = options.container;
        
        // Managers will be set after construction
        this.scoreManager = null;
        this.trafficManager = null;
        this.serviceManager = null;
        this.eventManager = null;
        this.uiManager = null;
        
        // Bind methods
        this.animate = this.animate.bind(this);
    }

    /**
     * Set manager references
     */
    setManagers(managers) {
        this.scoreManager = managers.scoreManager;
        this.trafficManager = managers.trafficManager;
        this.serviceManager = managers.serviceManager;
        this.eventManager = managers.eventManager;
        this.uiManager = managers.uiManager;
    }

    /**
     * Reset game state for a new game
     * @param {string} mode - Game mode (always 'survival' for Play mode)
     */
    resetGame(mode = "survival") {
        STATE.sound.init();
        STATE.sound.playGameBGM();
        
        // Hard-lock mode to survival (Play mode only)
        STATE.gameMode = "survival";

        // Set Play mode budget and configuration
        STATE.money = CONFIG.survival.startBudget;
        STATE.upkeepEnabled = true;
        STATE.trafficDistribution = { ...CONFIG.survival.trafficDistribution };
        STATE.currentRPS = 0.5;

        STATE.reputation = 100;
        STATE.requestsProcessed = 0;
        STATE.services = [];
        STATE.requests = [];
        STATE.connections = [];
        STATE.score = { total: 0, storage: 0, database: 0, maliciousBlocked: 0 };
        STATE.failures = {
            STATIC: 0,
            READ: 0,
            WRITE: 0,
            UPLOAD: 0,
            SEARCH: 0,
            MALICIOUS: 0,
        };
        STATE.isRunning = true;
        STATE.lastTime = performance.now();
        STATE.timeScale = 0;
        STATE.spawnTimer = 0;

        // Hide failures panel on reset
        const failuresPanel = document.getElementById("failures-panel");
        if (failuresPanel) failuresPanel.classList.add("hidden");

        // Initialize balance overhaul state
        STATE.elapsedGameTime = 0;
        STATE.gameStartTime = performance.now();
        STATE.maliciousSpikeTimer = 0;
        STATE.maliciousSpikeActive = false;
        STATE.normalTrafficDist = null;
        STATE.autoRepairEnabled = false;

        // Initialize intervention state
        STATE.intervention = {
            trafficShiftTimer: 0,
            trafficShiftActive: false,
            currentShift: null,
            originalTrafficDist: null,
            randomEventTimer: 0,
            activeEvent: null,
            eventEndTime: 0,
            eventDuration: 0,
            pausedEvent: null,
            remainingTime: 0,
            currentMilestoneIndex: 0,
            rpsMultiplier: 1.0,
            recentEvents: [],
            warnings: [],
            costMultiplier: 1.0,
            trafficBurstMultiplier: 1.0,
        };

        // Initialize detailed finance tracking
        STATE.finances = {
            income: {
                byType: {
                    STATIC: 0,
                    READ: 0,
                    WRITE: 0,
                    UPLOAD: 0,
                    SEARCH: 0,
                },
                countByType: {
                    STATIC: 0,
                    READ: 0,
                    WRITE: 0,
                    UPLOAD: 0,
                    SEARCH: 0,
                    blocked: 0,
                },
                requests: 0,
                blocked: 0,
                total: 0,
            },
            expenses: {
                services: 0,
                upkeep: 0,
                repairs: 0,
                autoRepair: 0,
                mitigation: 0,
                breach: 0,
                byService: {
                    waf: 0,
                    alb: 0,
                    compute: 0,
                    db: 0,
                    s3: 0,
                    cache: 0,
                    sqs: 0,
                },
                countByService: {
                    waf: 0,
                    alb: 0,
                    compute: 0,
                    db: 0,
                    s3: 0,
                    cache: 0,
                    sqs: 0,
                },
            },
        };

        // Reset auto-repair toggle UI
        const autoRepairBtn = document.getElementById("auto-repair-toggle");
        if (autoRepairBtn) {
            autoRepairBtn.textContent = i18n.t('upkeep_off');
            autoRepairBtn.classList.remove("text-green-400");
            autoRepairBtn.classList.add("text-gray-400");
        }

        // Reset repair cost table
        const repairTable = document.getElementById("repair-cost-table");
        if (repairTable) repairTable.classList.add("hidden");

        const maliciousWarning = document.getElementById("malicious-warning");
        if (maliciousWarning) maliciousWarning.remove();
        const maliciousIndicator = document.getElementById("malicious-spike-indicator");
        if (maliciousIndicator) maliciousIndicator.remove();

        // Clear visual elements
        if (this.serviceGroup) {
            while (this.serviceGroup.children.length > 0) {
                this.serviceGroup.remove(this.serviceGroup.children[0]);
            }
        }
        if (this.connectionGroup) {
            while (this.connectionGroup.children.length > 0) {
                this.connectionGroup.remove(this.connectionGroup.children[0]);
            }
        }
        if (this.requestGroup) {
            while (this.requestGroup.children.length > 0) {
                this.requestGroup.remove(this.requestGroup.children[0]);
            }
        }
        
        STATE.internetNode.connections = [];
        STATE.internetNode.position.set(
            CONFIG.internetNodeStartPos.x,
            CONFIG.internetNodeStartPos.y,
            CONFIG.internetNodeStartPos.z
        );
        STATE.internetNode.mesh.position.set(
            CONFIG.internetNodeStartPos.x,
            CONFIG.internetNodeStartPos.y,
            CONFIG.internetNodeStartPos.z
        );

        // Reset UI
        document
            .querySelectorAll(".time-btn")
            .forEach((b) => b.classList.remove("active"));
        document.getElementById("btn-pause").classList.add("active");
        // Only add pulse-green if tutorial is not active
        if (!window.tutorial?.isActive) {
            document.getElementById("btn-play").classList.add("pulse-green");
        }

        // Update UI displays
        if (this.scoreManager) {
            this.scoreManager.updateScoreUI();
        }

        // Mark game as started
        STATE.gameStarted = true;

        // Session tracking - start new session for Play mode
        if (window.sessionTracker) {
            window.sessionTracker.startSession("PLAY");
        }

        // Show/hide sandbox panel and objectives panel based on mode
        const sandboxPanel = document.getElementById("sandboxPanel");
        const objectivesPanel = document.getElementById("objectivesPanel");

        // Play mode only - always show objectives panel, hide sandbox panel
        if (sandboxPanel) sandboxPanel.classList.add("hidden");
        if (objectivesPanel) objectivesPanel.classList.remove("hidden");

        // Ensure loop is running
        if (!STATE.animationId) {
            this.animate(performance.now());
        }
    }

    /**
     * Restart the game
     */
    restartGame() {
        document.getElementById("modal").classList.add("hidden");
        this.resetGame("survival");
    }

    /**
     * Finish a request successfully
     * @param {Request} req - The request
     */
    finishRequest(req) {
        STATE.requestsProcessed++;
        if (this.scoreManager) {
            this.scoreManager.updateScore(req, "COMPLETED");
        }
        this.removeRequest(req);
    }

    /**
     * Fail a request
     * @param {Request} req - The request
     */
    failRequest(req) {
        const failType =
            req.type === TRAFFIC_TYPES.MALICIOUS ? "MALICIOUS_PASSED" : "FAILED";
        if (this.scoreManager) {
            this.scoreManager.updateScore(req, failType);
        }
        STATE.sound.playFail();
        req.mesh.material.color.setHex(CONFIG.colors.requestFail);
        setTimeout(() => this.removeRequest(req), 500);
    }

    /**
     * Remove a request from the game
     * @param {Request} req - The request
     */
    removeRequest(req) {
        req.destroy();
        STATE.requests = STATE.requests.filter((r) => r !== req);
    }

    /**
     * Main animation loop
     * @param {number} time - Current timestamp
     */
    animate(time) {
        STATE.animationId = requestAnimationFrame(this.animate);
        if (!STATE.isRunning) return;

        // Limit dt to prevent huge jumps when tab loses focus
        const rawDt = (time - STATE.lastTime) / 1000;
        const clampedDt = Math.min(rawDt, 0.1); // Max 100ms per frame
        const dt = clampedDt * STATE.timeScale;
        STATE.lastTime = time;
        STATE.elapsedGameTime += dt;

        // Handle keyboard panning (passed through from input handler)
        this.handleKeyboardPanning(clampedDt);

        // Update all services
        STATE.services.forEach((s) => s.update(dt));
        
        // Update all requests
        STATE.requests.forEach((r) => r.update(dt));

        // Spawn requests based on RPS
        STATE.spawnTimer += dt;
        const effectiveRPS =
            STATE.currentRPS * (STATE.intervention?.trafficBurstMultiplier || 1.0);
        if (effectiveRPS > 0) {
            const spawnInterval = 1 / effectiveRPS;
            while (STATE.spawnTimer >= spawnInterval) {
                STATE.spawnTimer -= spawnInterval;
                if (this.trafficManager) {
                    this.trafficManager.spawnRequest(this.failRequest.bind(this));
                }
            }
            // Ramp up RPS in survival mode
            if (STATE.gameMode === "survival" && this.trafficManager) {
                const gameTime = STATE.elapsedGameTime;
                const targetRPS = this.trafficManager.calculateTargetRPS(gameTime);
                STATE.currentRPS += (targetRPS - STATE.currentRPS) * 0.01;
                STATE.currentRPS = Math.min(STATE.currentRPS, CONFIG.survival.maxRPS);
            }
        }

        // Update traffic mechanics
        if (this.trafficManager) {
            this.trafficManager.updateMaliciousSpike(dt);
            this.trafficManager.updateTrafficShift(dt);
        }

        // Update event mechanics
        if (this.eventManager) {
            this.eventManager.updateRandomEvents(dt);
            this.eventManager.updateActiveEventTimer(this.uiManager.formatTime.bind(this.uiManager));
        }

        // Update service mechanics
        if (this.serviceManager) {
            this.serviceManager.updateServiceHealthIndicators();
            this.serviceManager.processAutoRepair(dt);
        }

        // Process auto-repair cost
        if (this.scoreManager) {
            const autoRepairCost = this.scoreManager.getAutoRepairUpkeep();
            if (autoRepairCost > 0 && STATE.upkeepEnabled) {
                const cost = autoRepairCost * dt;
                STATE.money -= cost;
                if (STATE.finances) STATE.finances.expenses.autoRepair += cost;
            }
        }

        // Update UI
        if (this.uiManager && this.scoreManager) {
            this.uiManager.updateHUD(
                this.scoreManager.getUpkeepMultiplier.bind(this.scoreManager),
                this.scoreManager.getAutoRepairUpkeep.bind(this.scoreManager)
            );
            this.uiManager.updateRPSMilestone();
            this.uiManager.updateFailuresPanel();
            this.uiManager.updateFinancesDisplay();
        }

        // Update internet node ring opacity
        if (STATE.internetNode.ring) {
            if (STATE.selectedNodeId === "internet") {
                STATE.internetNode.ring.material.opacity = 1.0;
            } else {
                STATE.internetNode.ring.material.opacity = 0.2;
            }
        }

        // Check for game over (survival mode only)
        if (
            STATE.gameMode === "survival" &&
            (STATE.reputation <= 0 || STATE.money <= -1000)
        ) {
            STATE.isRunning = false;

            // Session tracking - end session with failure
            if (window.sessionTracker) {
                window.sessionTracker.endSession("FAILED");
            }

            // Determine failure reason and generate tips
            if (this.scoreManager && this.uiManager) {
                const failureAnalysis = this.scoreManager.analyzeFailure();
                this.uiManager.showGameOverModal(failureAnalysis);
            }
        }

        // Render
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Handle keyboard panning (called from animate)
     * @param {number} clampedDt - Clamped delta time
     */
    handleKeyboardPanning(clampedDt) {
        // This will be connected to the input handler in game.js
        // The actual implementation remains in game.js for now
    }

    /**
     * Start the game
     */
    startGame() {
        document.getElementById("main-menu-modal").classList.add("hidden");
        
        // Hide navbar during gameplay
        if (typeof window.hideMainMenu === 'function') {
            window.hideMainMenu();
        }
        
        this.resetGame("survival");

        if (window.tutorial) {
            setTimeout(() => {
                window.tutorial.start();
            }, 500);
        }
    }

    /**
     * Open the main menu
     */
    openMainMenu() {
        // Store current time scale and pause
        STATE.previousTimeScale = STATE.timeScale;
        window.setTimeScale(0);

        // Hide tutorial while menu is open
        if (window.tutorial?.isActive) {
            window.tutorial.hide();
        }

        // Show resume button if game is active
        const resumeBtn = document.getElementById("resume-btn");
        if (resumeBtn) {
            if (STATE.gameStarted && STATE.isRunning) {
                resumeBtn.classList.remove("hidden");
            } else {
                resumeBtn.classList.add("hidden");
            }
        }

        // Check for saved game and show/hide load button
        const loadBtn = document.getElementById("load-btn");
        const hasSave = localStorage.getItem("serverSurvivalSave") !== null;
        if (loadBtn) {
            loadBtn.style.display = hasSave ? "block" : "none";
        }

        // Show main menu
        document.getElementById("main-menu-modal").classList.remove("hidden");
        STATE.sound.playMenuBGM();
    }

    /**
     * Resume the game from menu
     */
    resumeGame() {
        document.getElementById("main-menu-modal").classList.add("hidden");
        STATE.sound.playGameBGM();

        // Restore tutorial if active
        if (window.tutorial?.isActive) {
            window.tutorial.show();
        }
    }

    /**
     * Retry with the same architecture
     */
    retryWithSameArchitecture() {
        document.getElementById("modal").classList.add("hidden");

        // Save current architecture with indices for connection mapping
        const savedServices = STATE.services.map((s, idx) => ({
            type: s.type,
            position: { x: s.position.x, y: s.position.y, z: s.position.z },
            index: idx,
            cost: s.config.cost,
        }));

        // Calculate total cost of saved architecture
        const totalArchitectureCost = savedServices.reduce(
            (sum, s) => sum + s.cost,
            0
        );

        // Save connections with indices instead of IDs
        const savedConnections = STATE.connections.map((c) => ({
            fromIndex:
                c.from === "internet"
                    ? -1
                    : STATE.services.findIndex((s) => s.id === c.from),
            toIndex:
                c.to === "internet" ? -1 : STATE.services.findIndex((s) => s.id === c.to),
        }));

        // Reset game state but keep mode
        this.resetGame(STATE.gameMode);

        // Deduct the architecture cost from starting budget
        STATE.money -= totalArchitectureCost;
        if (STATE.finances) {
            STATE.finances.expenses.services = totalArchitectureCost;
        }

        // Rebuild services in same order
        savedServices.forEach((saved) => {
            const pos = new THREE.Vector3(
                saved.position.x,
                saved.position.y,
                saved.position.z
            );
            const service = new Service(saved.type, pos);
            service.mesh.position.set(saved.position.x, 0, saved.position.z);
            STATE.services.push(service);
        });

        // Update repair cost table after all services are created
        if (this.uiManager) {
            this.uiManager.updateRepairCostTable();
        }

        // Rebuild connections using indices
        savedConnections.forEach((saved) => {
            const fromId =
                saved.fromIndex === -1 ? "internet" : STATE.services[saved.fromIndex]?.id;
            const toId =
                saved.toIndex === -1 ? "internet" : STATE.services[saved.toIndex]?.id;

            if (fromId && toId && this.serviceManager) {
                this.serviceManager.createConnection(fromId, toId, this.connectionGroup);
            }
        });

        if (this.eventManager) {
            this.eventManager.addInterventionWarning(i18n.t('arch_restored'), "info", 3000);
        }
        STATE.sound?.playPlace();
    }
}

// Export for use by other modules and global access
window.GameEngine = GameEngine;
