/**
 * EventManager - Handles random events and intervention mechanics
 * 
 * Responsibilities:
 * - Random event selection
 * - Event triggers and resolution
 * - Event cooldowns
 * - Intervention warnings
 * 
 * @module EventManager
 */

class EventManager {
    constructor() {
        // Manager is stateless - uses STATE directly
    }

    /**
     * Add an intervention warning message
     * @param {string} message - Warning message
     * @param {string} type - Type: warning, danger, info
     * @param {number} duration - Duration in milliseconds
     */
    addInterventionWarning(message, type = "warning", duration = 4000) {
        const warningsContainer = document.getElementById("intervention-warnings");
        if (!warningsContainer) return;

        const warning = document.createElement("div");
        const typeStyles = {
            warning: "warning-warning",
            danger: "warning-danger",
            info: "warning-info",
        };

        warning.className = `intervention-warning ${typeStyles[type] || typeStyles.warning
            } border-2 rounded-lg px-6 py-3 mb-2 shadow-lg`;
        warning.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-2xl">${type === "danger" ? "⚠️" : type === "info" ? "✅" : "📢"
            }</span>
                <span class="font-bold text-lg">${message}</span>
            </div>
        `;
        warningsContainer.appendChild(warning);

        // Play warning sound
        if (type === "danger") {
            STATE.sound?.playTone(200, "sawtooth", 0.4);
            STATE.sound?.playTone(150, "sawtooth", 0.4, 0.1);
        } else if (type === "warning") {
            STATE.sound?.playTone(400, "sine", 0.2);
        }

        // Add to state for tracking
        if (STATE.intervention) {
            STATE.intervention.warnings.push({ message, type, time: Date.now() });
        }

        // Animate out before removing
        setTimeout(() => {
            warning.style.transition = "all 0.3s ease-out";
            warning.style.opacity = "0";
            warning.style.transform = "translateY(-20px)";
            setTimeout(() => warning.remove(), 300);
        }, duration - 300);
    }

    /**
     * Update random events mechanic
     * @param {number} dt - Delta time in seconds
     */
    updateRandomEvents(dt) {
        if (STATE.gameMode !== "survival") return;
        if (!CONFIG.survival.randomEvents?.enabled) return;
        if (!STATE.intervention) return;

        STATE.intervention.randomEventTimer += dt;

        const config = CONFIG.survival.randomEvents;

        // Check if event should trigger
        if (STATE.intervention.randomEventTimer >= config.checkInterval) {
            STATE.intervention.randomEventTimer = 0;

            // 30% chance to trigger an event
            if (Math.random() < 0.3) {
                this.triggerRandomEvent();
            }
        }

        // Check if active event should end
        if (
            STATE.intervention.activeEvent &&
            Date.now() >= STATE.intervention.eventEndTime
        ) {
            this.endRandomEvent();
        }
    }

    /**
     * Handle game state changes (pause/resume) for events
     * @param {number} timeScale - Time scale (0 = paused)
     */
    handleGameState(timeScale) {
        if (timeScale === 0) { // pause state
            STATE.intervention.pausedEvent = STATE.intervention.activeEvent;
            STATE.intervention.remainingTime = STATE.intervention.eventEndTime - Date.now();
            this.endRandomEvent();
        } else if (STATE.intervention.pausedEvent) { // not paused state
            this.triggerRandomEvent(
                STATE.intervention.pausedEvent,
                STATE.intervention.remainingTime
            );
            STATE.intervention.pausedEvent = null;
            STATE.intervention.remainingTime = 0;
        }

        window.setTimeScale(timeScale);
    }

    /**
     * Trigger a random event
     * @param {string|null} eventType - Specific event type or null for random
     * @param {number|null} duration - Duration in ms or null for default
     */
    triggerRandomEvent(eventType = null, duration = null) {
        if (!STATE.intervention || STATE.intervention.activeEvent) return;

        const config = CONFIG.survival.randomEvents;
        if (!eventType)
            eventType = config.types[Math.floor(Math.random() * config.types.length)];
        if (!duration) duration = 30000; // 30 seconds

        STATE.intervention.activeEvent = eventType;
        STATE.intervention.eventEndTime = Date.now() + duration;
        STATE.intervention.eventDuration = duration;

        switch (eventType) {
            case "COST_SPIKE":
                this.addInterventionWarning(
                    i18n.t('cost_spike_warning'),
                    "danger",
                    8000
                );
                STATE.intervention.costMultiplier = 2.0;
                break;

            case "CAPACITY_DROP":
                this.addInterventionWarning(
                    i18n.t('capacity_drop_warning'),
                    "danger",
                    8000
                );
                STATE.services.forEach((s) => {
                    s.tempCapacityReduction = 0.5; // 50% capacity
                });
                break;

            case "TRAFFIC_BURST":
                this.addInterventionWarning(
                    i18n.t('traffic_burst_warning'),
                    "warning",
                    8000
                );
                STATE.intervention.trafficBurstMultiplier = 3.0;
                break;

            case "SERVICE_OUTAGE":
                // Pick a random service to temporarily disable
                const services = STATE.services.filter((s) => s.type !== "waf");
                if (services.length > 0) {
                    const target = services[Math.floor(Math.random() * services.length)];
                    target.isDisabled = true;
                    target.mesh.material.opacity = 0.3;
                    target.mesh.material.transparent = true;
                    this.addInterventionWarning(
                        i18n.t('service_outage_warning', { type: i18n.t(target.type) }),
                        "danger",
                        8000
                    );
                }
                break;
        }

        // Show active event bar
        this.showActiveEventBar(eventType);

        STATE.sound?.playTone(300, "sawtooth", 0.3);
    }

    /**
     * End the current random event
     */
    endRandomEvent() {
        if (!STATE.intervention || !STATE.intervention.activeEvent) return;

        const eventType = STATE.intervention.activeEvent;

        switch (eventType) {
            case "COST_SPIKE":
                STATE.intervention.costMultiplier = 1.0;
                break;

            case "CAPACITY_DROP":
                STATE.services.forEach((s) => {
                    s.tempCapacityReduction = 1.0;
                });
                break;

            case "TRAFFIC_BURST":
                STATE.intervention.trafficBurstMultiplier = 1.0;
                break;

            case "SERVICE_OUTAGE":
                STATE.services.forEach((s) => {
                    if (s.isDisabled) {
                        s.isDisabled = false;
                        s.mesh.material.opacity = 1.0;
                        s.mesh.material.transparent = false;
                    }
                });
                break;
        }

        // Hide active event bar
        this.hideActiveEventBar();

        STATE.intervention.activeEvent = null;
        this.addInterventionWarning(i18n.t('event_ended'), "info", 2000);
        STATE.sound?.playSuccess();
    }

    /**
     * Show the active event bar at top of screen
     * @param {string} eventType - Type of event
     */
    showActiveEventBar(eventType) {
        const bar = document.getElementById("active-event-bar");
        const icon = document.getElementById("active-event-icon");
        const text = document.getElementById("active-event-text");

        if (!bar) return;

        const eventConfig = {
            COST_SPIKE: { icon: "💰", text: i18n.t('cost_spike_active'), color: "bg-red-600" },
            CAPACITY_DROP: {
                icon: "⚡",
                text: i18n.t('capacity_reduced'),
                color: "bg-orange-600",
            },
            TRAFFIC_BURST: {
                icon: "🚀",
                text: i18n.t('traffic_burst'),
                color: "bg-yellow-600",
            },
            SERVICE_OUTAGE: {
                icon: "🔧",
                text: i18n.t('service_outage_active'),
                color: "bg-purple-600",
            },
        };

        const config = eventConfig[eventType] || eventConfig["COST_SPIKE"];

        bar.className = `fixed top-0 left-0 right-0 h-8 z-40 ${config.color}`;
        icon.textContent = config.icon;
        text.textContent = config.text;
        bar.classList.remove("hidden");
    }

    /**
     * Hide the active event bar
     */
    hideActiveEventBar() {
        const bar = document.getElementById("active-event-bar");
        if (bar) bar.classList.add("hidden");
    }

    /**
     * Update the active event timer display
     * @param {Function} formatTimeCallback - Function to format time
     */
    updateActiveEventTimer(formatTimeCallback) {
        if (!STATE.intervention?.activeEvent) return;

        const timerEl = document.getElementById("active-event-timer");
        const progressEl = document.getElementById("active-event-progress");

        const remaining = Math.max(0, STATE.intervention.eventEndTime - Date.now());
        const remainingSec = Math.ceil(remaining / 1000);

        if (timerEl) {
            timerEl.textContent = formatTimeCallback(remainingSec);
        }

        if (progressEl && STATE.intervention.eventDuration) {
            const progress = (remaining / STATE.intervention.eventDuration) * 100;
            progressEl.style.width = `${Math.max(0, progress)}%`;
        }
    }
}

// Export for use by other modules and global access
window.EventManager = EventManager;
