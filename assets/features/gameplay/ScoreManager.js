/**
 * ScoreManager - Handles all score-related calculations
 * 
 * Responsibilities:
 * - Score calculation
 * - Reputation updates
 * - Money / budget updates
 * - Penalties and rewards
 * 
 * @module ScoreManager
 */

class ScoreManager {
    constructor() {
        // Manager is stateless - uses STATE directly
    }

    /**
     * Update score based on request outcome
     * @param {Request} req - The request object
     * @param {string} outcome - MALICIOUS_BLOCKED, COMPLETED, FAILED, MALICIOUS_PASSED
     */
    updateScore(req, outcome) {
        const points = CONFIG.survival.SCORE_POINTS;
        const typeConfig = req.typeConfig || CONFIG.trafficTypes[req.type];

        if (outcome === "MALICIOUS_BLOCKED") {
            STATE.score.maliciousBlocked += points.MALICIOUS_BLOCKED_SCORE;
            STATE.score.total += points.MALICIOUS_BLOCKED_SCORE;
            STATE.score.total += points.MALICIOUS_BLOCKED_SCORE;

            // Mitigation cost for blocking attacks
            const mitigationCost = CONFIG.survival.SCORE_POINTS.MALICIOUS_MITIGATION_COST || 1.0;
            STATE.money -= mitigationCost;
            if (STATE.finances) {
                STATE.finances.expenses.mitigation = (STATE.finances.expenses.mitigation || 0) + mitigationCost;
            }
            STATE.sound.playFraudBlocked();
        } else if (
            req.type === TRAFFIC_TYPES.MALICIOUS &&
            outcome === "MALICIOUS_PASSED"
        ) {
            STATE.reputation += points.MALICIOUS_PASSED_REPUTATION;
            STATE.reputation += points.MALICIOUS_PASSED_REPUTATION;
            STATE.failures.MALICIOUS++;

            // Breach penalty
            const breachPenalty = CONFIG.survival.SCORE_POINTS.MALICIOUS_BREACH_PENALTY || 50.0;
            STATE.money -= breachPenalty;
            if (STATE.finances) {
                STATE.finances.expenses.breach = (STATE.finances.expenses.breach || 0) + breachPenalty;
            }

            console.warn(
                `MALICIOUS PASSED: ${points.MALICIOUS_PASSED_REPUTATION} Rep. (Critical Failure)`
            );
        } else if (outcome === "COMPLETED") {
            let reward = typeConfig.reward;
            const score = typeConfig.score;

            if (req.cached) {
                reward *= 1 + points.CACHE_HIT_BONUS;
            }

            if (typeConfig.destination === "s3" || typeConfig.destination === "cdn") {
                STATE.score.storage += score;
            } else if (typeConfig.destination === "db") {
                STATE.score.database += score;
            }

            STATE.score.total += score;
            STATE.money += reward;
            if (STATE.finances) {
                STATE.finances.income.requests += reward;
                STATE.finances.income.total += reward;
                // Track by request type
                const reqType = req.type || "STATIC";
                STATE.finances.income.byType[reqType] =
                    (STATE.finances.income.byType[reqType] || 0) + reward;
                STATE.finances.income.countByType[reqType] =
                    (STATE.finances.income.countByType[reqType] || 0) + 1;
            }
            STATE.reputation += points.SUCCESS_REPUTATION || 0.5; // Gain reputation on success
        } else if (outcome === "FAILED") {
            STATE.reputation += points.FAIL_REPUTATION;
            STATE.score.total -= (typeConfig.score || 5) / 2;
            if (STATE.failures[req.type] !== undefined) {
                STATE.failures[req.type]++;
            }
        }

        this.updateScoreUI();
    }

    /**
     * Update the score display in the UI
     */
    updateScoreUI() {
        document.getElementById("total-score-display").innerText = STATE.score.total;
        document.getElementById("score-storage").innerText = STATE.score.storage;
        document.getElementById("score-database").innerText = STATE.score.database;
        document.getElementById("score-malicious").innerText = STATE.score.maliciousBlocked;
    }

    /**
     * Flash money display when insufficient funds
     */
    flashMoney() {
        const el = document.getElementById("money-display");
        el.classList.add("text-red-500");
        setTimeout(() => el.classList.remove("text-red-500"), 300);
    }

    /**
     * Analyze why the player failed and generate helpful tips
     * @returns {Object} { reason, description, tips[] }
     */
    analyzeFailure() {
        const result = {
            reason: "",
            description: "",
            tips: [],
        };

        // Determine primary failure reason
        if (STATE.reputation <= 0) {
            result.reason = i18n.t('reason_reputation');

            // Check what caused reputation loss
            const totalFailures = Object.values(STATE.failures).reduce(
                (a, b) => a + b,
                0
            );
            const maliciousFailures = STATE.failures.MALICIOUS || 0;

            if (maliciousFailures > totalFailures * 0.3) {
                result.description = i18n.t('reason_malicious', { count: maliciousFailures });
                result.tips.push(i18n.t('tip_waf'));
                result.tips.push(i18n.t('tip_multiple_waf'));
            } else {
                const worstFailure = Object.entries(STATE.failures)
                    .filter(([k]) => k !== "MALICIOUS")
                    .sort((a, b) => b[1] - a[1])[0];

                if (worstFailure && worstFailure[1] > 0) {
                    result.description = i18n.t('reason_failed_type', { 
                        type: i18n.t('traffic_' + worstFailure[0].toLowerCase()), 
                        count: worstFailure[1] 
                    });

                    if (worstFailure[0] === "STATIC" || worstFailure[0] === "UPLOAD") {
                        result.tips.push(i18n.t('tip_s3'));
                    } else {
                        result.tips.push(i18n.t('tip_db'));
                        result.tips.push(i18n.t('tip_cache'));
                    }
                } else {
                    result.description = i18n.t('desc_reputation');
                }
            }

            result.tips.push(i18n.t('tip_sqs'));
            result.tips.push(i18n.t('tip_repair'));
        } else if (STATE.money <= -1000) {
            result.reason = i18n.t('reason_bankruptcy');
            result.description = i18n.t('desc_bankruptcy', { money: Math.floor(STATE.money) });

            // Analyze spending
            if (STATE.finances) {
                const upkeepRatio =
                    STATE.finances.expenses.upkeep / (STATE.finances.income.total || 1);
                if (upkeepRatio > 0.8) {
                    result.tips.push(i18n.t('tip_upkeep_high'));
                    result.tips.push(i18n.t('tip_scale_slow'));
                }

                if (STATE.finances.expenses.repairs > STATE.finances.income.total * 0.2) {
                    result.tips.push(i18n.t('tip_auto_repair'));
                }
            }

            result.tips.push(i18n.t('tip_scale_slow'));
            result.tips.push(i18n.t('tip_cache'));
            result.tips.push(i18n.t('tip_s3'));
        }

        // Add general tips based on game state
        if (STATE.services.length < 3) {
            result.tips.push(i18n.t('tip_complete_pipeline'));
        }

        if (!STATE.services.some((s) => s.type === "cache")) {
            result.tips.push(i18n.t('tip_add_cache'));
        }

        // Limit tips to 4
        result.tips = result.tips.slice(0, 4);

        return result;
    }

    /**
     * Get the upkeep multiplier for survival mode
     * @returns {number} The current upkeep multiplier
     */
    getUpkeepMultiplier() {
        if (STATE.gameMode !== "survival") return 1.0;
        if (!CONFIG.survival.upkeepScaling.enabled) return 1.0;

        const gameTime =
            STATE.elapsedGameTime ?? (performance.now() - STATE.gameStartTime) / 1000;
        const progress = Math.min(
            gameTime / CONFIG.survival.upkeepScaling.scaleTime,
            1.0
        );

        const base = CONFIG.survival.upkeepScaling.baseMultiplier;
        const max = CONFIG.survival.upkeepScaling.maxMultiplier;

        let multiplier = base + (max - base) * progress;

        if (STATE.intervention?.costMultiplier) {
            multiplier *= STATE.intervention.costMultiplier;
        }

        return multiplier;
    }

    /**
     * Get the auto-repair upkeep cost per second
     * @returns {number} Auto-repair cost per second
     */
    getAutoRepairUpkeep() {
        if (!STATE.autoRepairEnabled) return 0;

        const percent = CONFIG.survival.degradation?.autoRepairCostPercent || 0.1;
        // 10% of total service cost per second
        const totalServiceCost = STATE.services.reduce(
            (sum, s) => sum + s.config.cost,
            0
        );
        return (totalServiceCost * percent) / 60; // Per second
    }
}

// Export for use by other modules and global access
window.ScoreManager = ScoreManager;
