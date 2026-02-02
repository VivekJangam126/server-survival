/**
 * TrafficManager - Handles all traffic-related operations
 * 
 * Responsibilities:
 * - Traffic generation
 * - Request simulation
 * - Traffic spikes
 * - Load variation logic
 * - Malicious spike mechanics
 * 
 * @module TrafficManager
 */

class TrafficManager {
    constructor() {
        // Manager is stateless - uses STATE directly
    }

    /**
     * Get the traffic type based on current distribution
     * @returns {string} Traffic type (STATIC, READ, WRITE, UPLOAD, SEARCH, MALICIOUS)
     */
    getTrafficType() {
        const dist = STATE.trafficDistribution;
        const types = Object.keys(dist);
        const total = types.reduce((sum, type) => sum + (dist[type] || 0), 0);
        if (total === 0) return TRAFFIC_TYPES.STATIC;

        const r = Math.random() * total;
        let cumulative = 0;

        for (const type of types) {
            cumulative += dist[type] || 0;
            if (r < cumulative) {
                return TRAFFIC_TYPES[type] || type;
            }
        }

        return TRAFFIC_TYPES.STATIC;
    }

    /**
     * Calculate target RPS based on game time
     * @param {number} gameTimeSeconds - Elapsed game time in seconds
     * @returns {number} Target requests per second
     */
    calculateTargetRPS(gameTimeSeconds) {
        const base = CONFIG.survival.baseRPS;
        const logGrowth = Math.log(1 + gameTimeSeconds / 20) * 2.2;
        const linearBoost = gameTimeSeconds * 0.008; // Adds ~0.5 RPS per minute
        let targetRPS = base + logGrowth + linearBoost;

        if (CONFIG.survival.rpsAcceleration && STATE.intervention) {
            const milestones = CONFIG.survival.rpsAcceleration.milestones;
            let multiplier = 1.0;

            for (let i = 0; i < milestones.length; i++) {
                if (gameTimeSeconds >= milestones[i].time) {
                    multiplier = milestones[i].multiplier;
                    if (STATE.intervention.currentMilestoneIndex < i + 1) {
                        STATE.intervention.currentMilestoneIndex = i + 1;

                        if (window.gameEventManager) {
                            window.gameEventManager.addInterventionWarning(
                                i18n.t('rps_surge_warning', { multiplier: multiplier.toFixed(1) }),
                                "danger",
                                5000
                            );
                        }
                    }
                }
            }

            STATE.intervention.rpsMultiplier = multiplier;
            targetRPS *= multiplier;
        }

        return targetRPS;
    }

    /**
     * Spawn a new request
     * @param {Function} failRequestCallback - Callback to fail the request
     */
    spawnRequest(failRequestCallback) {
        const type = this.getTrafficType();
        const req = new Request(type);
        STATE.requests.push(req);
        const conns = STATE.internetNode.connections;
        if (conns.length > 0) {
            const entryNodes = conns.map((id) =>
                STATE.services.find((s) => s.id === id)
            );

            // Traffic Routing Logic
            let target;

            // 1. Prefer CDN for STATIC traffic
            if (type === "STATIC") {
                target = entryNodes.find(s => s?.type === "cdn");
            }

            // 2. Fallback to WAF (Security Best Practice)
            if (!target) {
                target = entryNodes.find((s) => s?.type === "waf");
            }

            // 3. Last Resort: Random entry point (Reckless)
            if (!target) {
                target = entryNodes[Math.floor(Math.random() * entryNodes.length)];
            }

            if (target) req.flyTo(target);
            else failRequestCallback(req);
        } else failRequestCallback(req);
    }

    /**
     * Update malicious spike mechanic
     * @param {number} dt - Delta time in seconds
     */
    updateMaliciousSpike(dt) {
        if (STATE.gameMode !== "survival") return;
        if (!CONFIG.survival.maliciousSpike.enabled) return;

        STATE.maliciousSpikeTimer += dt;

        const interval = CONFIG.survival.maliciousSpike.interval;
        const duration = CONFIG.survival.maliciousSpike.duration;
        const warning = CONFIG.survival.maliciousSpike.warningTime;

        const cycleTime = STATE.maliciousSpikeTimer % interval;

        if (
            cycleTime >= interval - warning &&
            cycleTime < interval - warning + dt &&
            !STATE.maliciousSpikeActive
        ) {
            this.showMaliciousWarning();
        }

        if (cycleTime < dt && STATE.maliciousSpikeTimer > warning) {
            this.startMaliciousSpike();
        }

        if (
            STATE.maliciousSpikeActive &&
            cycleTime >= duration &&
            cycleTime < duration + dt
        ) {
            this.endMaliciousSpike();
        }
    }

    /**
     * Show warning before malicious spike
     */
    showMaliciousWarning() {
        const existing = document.getElementById("malicious-warning");
        if (existing) existing.remove();

        const warning = document.createElement("div");
        warning.id = "malicious-warning";
        warning.className =
            "fixed top-1/3 left-1/2 transform -translate-x-1/2 text-center z-50 pointer-events-none";
        warning.innerHTML = `
            <div class="text-red-500 text-2xl font-bold animate-pulse">${i18n.t('ddos_incoming')}</div>
            <div class="text-red-300 text-sm">${i18n.t('attack_spike')}</div>
        `;
        document.body.appendChild(warning);

        STATE.sound.playTone(400, "sawtooth", 0.3);
        STATE.sound.playTone(300, "sawtooth", 0.3, 0.15);

        setTimeout(() => warning.remove(), 4000);
    }

    /**
     * Start the malicious traffic spike
     */
    startMaliciousSpike() {
        const existing = document.getElementById("malicious-spike-indicator");
        if (existing) existing.remove();

        if (STATE.intervention && STATE.intervention.trafficShiftActive) return;

        STATE.maliciousSpikeActive = true;

        STATE.normalTrafficDist = { ...STATE.trafficDistribution };

        const maliciousPct = CONFIG.survival.maliciousSpike.maliciousPercent;
        const remaining = 1 - maliciousPct;

        const otherTotal = 1 - STATE.normalTrafficDist.MALICIOUS;
        STATE.trafficDistribution = {
            STATIC: (STATE.normalTrafficDist.STATIC / otherTotal) * remaining,
            READ: (STATE.normalTrafficDist.READ / otherTotal) * remaining,
            WRITE: (STATE.normalTrafficDist.WRITE / otherTotal) * remaining,
            UPLOAD: (STATE.normalTrafficDist.UPLOAD / otherTotal) * remaining,
            SEARCH: (STATE.normalTrafficDist.SEARCH / otherTotal) * remaining,
            MALICIOUS: maliciousPct,
        };

        const indicator = document.createElement("div");
        indicator.id = "malicious-spike-indicator";
        indicator.className =
            "fixed top-4 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none";
        indicator.innerHTML = `
            <div class="bg-red-900/80 border-2 border-red-500 rounded-lg px-4 py-2 animate-pulse">
                <span class="text-red-400 font-bold">${i18n.t('ddos_active')}</span>
            </div>
        `;
        document.body.appendChild(indicator);

        const maliciousEl = document.getElementById("mix-malicious");
        if (maliciousEl)
            maliciousEl.className = "text-red-500 font-bold animate-pulse";
    }

    /**
     * End the malicious traffic spike
     */
    endMaliciousSpike() {
        STATE.maliciousSpikeActive = false;

        // Restore normal distribution
        if (STATE.normalTrafficDist) {
            STATE.trafficDistribution = { ...STATE.normalTrafficDist };
            STATE.normalTrafficDist = null;
        }

        // Remove indicator
        const indicator = document.getElementById("malicious-spike-indicator");
        if (indicator) indicator.remove();

        // Reset mix display styling
        const maliciousEl = document.getElementById("mix-malicious");
        if (maliciousEl) maliciousEl.className = "text-red-400";

        STATE.sound.playSuccess();
    }

    /**
     * Update traffic shift mechanic
     * @param {number} dt - Delta time in seconds
     */
    updateTrafficShift(dt) {
        if (STATE.gameMode !== "survival") return;
        if (!CONFIG.survival.trafficShift?.enabled) return;
        if (!STATE.intervention) return;

        STATE.intervention.trafficShiftTimer += dt;

        const config = CONFIG.survival.trafficShift;
        const interval = config.interval;
        const duration = config.duration;

        // Check if shift should start
        if (
            !STATE.intervention.trafficShiftActive &&
            STATE.intervention.trafficShiftTimer >= interval
        ) {
            this.startTrafficShift();
        }

        // Check if shift should end
        if (
            STATE.intervention.trafficShiftActive &&
            STATE.intervention.trafficShiftTimer >= interval + duration
        ) {
            this.endTrafficShift();
            STATE.intervention.trafficShiftTimer = 0; // Reset for next cycle
        }
    }

    /**
     * Start a traffic shift event
     */
    startTrafficShift() {
        if (!STATE.intervention || STATE.maliciousSpikeActive) return;

        const config = CONFIG.survival.trafficShift;
        const shifts = config.shifts;

        // Pick a random shift
        const shift = shifts[Math.floor(Math.random() * shifts.length)];
        STATE.intervention.currentShift = shift;
        STATE.intervention.trafficShiftActive = true;

        // Store original distribution
        STATE.intervention.originalTrafficDist = { ...STATE.trafficDistribution };

        if (shift.distribution) {
            STATE.trafficDistribution = { ...shift.distribution };
        }

        if (window.gameEventManager) {
            window.gameEventManager.addInterventionWarning(
                i18n.t('traffic_surging', { 
                    name: i18n.t('shift_' + shift.name.toLowerCase().replace(' ', '_')), 
                    type: i18n.t('traffic_' + shift.type.toLowerCase()) 
                }),
                "warning",
                5000
            );
        }
        STATE.sound?.playTone(500, "sine", 0.2);
    }

    /**
     * End the current traffic shift
     */
    endTrafficShift() {
        if (!STATE.intervention) return;

        STATE.intervention.trafficShiftActive = false;

        // Restore original distribution
        if (STATE.intervention.originalTrafficDist) {
            STATE.trafficDistribution = { ...STATE.intervention.originalTrafficDist };
            STATE.intervention.originalTrafficDist = null;
        }

        STATE.intervention.currentShift = null;
    }
}

// Export for use by other modules and global access
window.TrafficManager = TrafficManager;
