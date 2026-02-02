/**
 * GameUIManager - Handles all UI rendering and updates
 * 
 * Responsibilities:
 * - DOM updates
 * - HUD refresh logic
 * - Tooltip updates
 * - Stats rendering
 * - Notifications
 * 
 * @module GameUIManager
 */

class GameUIManager {
    constructor() {
        // Manager is stateless - uses STATE directly
    }

    /**
     * Format time as h:m:s, m:s, or just s depending on duration
     * @param {number} totalSeconds - Total seconds to format
     * @returns {string} Formatted time string
     */
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = Math.floor(totalSeconds % 60);

        if (hours > 0) {
            return i18n.t('time_h', { h: hours, m: mins, s: secs });
        } else if (mins > 0) {
            return i18n.t('time_m', { m: mins, s: secs });
        } else {
            return i18n.t('time_s', { s: secs });
        }
    }

    /**
     * Update repair cost table in UI
     */
    updateRepairCostTable() {
        const table = document.getElementById("repair-cost-table");
        const rows = document.getElementById("repair-cost-rows");

        if (!table || !rows) return;

        if (STATE.services.length === 0) {
            table.classList.add("hidden");
            return;
        }

        table.classList.remove("hidden");

        const repairPercent = CONFIG.survival.degradation?.repairCostPercent || 0.15;
        const autoRepairPercent =
            CONFIG.survival.degradation?.autoRepairCostPercent || 0.1;

        rows.innerHTML = STATE.services
            .map((s) => {
                const repairCost = Math.ceil(s.config.cost * repairPercent);
                const autoRepairCost = (s.config.cost * autoRepairPercent).toFixed(1);
                const healthColor =
                    s.health < 40
                        ? "text-red-400"
                        : s.health < 70
                            ? "text-yellow-400"
                            : "text-green-400";

                return `
                <div class="grid grid-cols-3 gap-1 text-gray-300">
                    <span class="${healthColor}">${i18n.t(s.type).substring(0, 10).toUpperCase()}</span>
                    <span class="text-center text-yellow-400">$${repairCost}</span>
                    <span class="text-right text-orange-400" title="${i18n.t('repair_formula_hint', { cost: '$' + s.config.cost })}">$${autoRepairCost}</span>
                </div>
            `;
            })
            .join("");
    }

    /**
     * Update finances display panel
     */
    updateFinancesDisplay() {
        if (!STATE.finances) return;

        const f = STATE.finances;

        // Income by request type - labels, colors, and per-request rates
        const incomeTypes = [
            {
                key: "STATIC",
                label: i18n.t('income_static'),
                color: "text-blue-400",
                rate: CONFIG.trafficTypes.STATIC.reward,
            },
            {
                key: "READ",
                label: i18n.t('income_read'),
                color: "text-green-400",
                rate: CONFIG.trafficTypes.READ.reward,
            },
            {
                key: "WRITE",
                label: i18n.t('income_write'),
                color: "text-yellow-400",
                rate: CONFIG.trafficTypes.WRITE.reward,
            },
            {
                key: "UPLOAD",
                label: i18n.t('income_upload'),
                color: "text-purple-400",
                rate: CONFIG.trafficTypes.UPLOAD.reward,
            },
            {
                key: "SEARCH",
                label: i18n.t('income_search'),
                color: "text-cyan-400",
                rate: CONFIG.trafficTypes.SEARCH.reward,
            },
            { key: "blocked", label: i18n.t('income_blocked'), color: "text-red-400", rate: 0.5 },
        ];

        // Update income details with per-request rate and count
        const incomeDetails = document.getElementById("income-details");
        if (incomeDetails) {
            let incomeHtml =
                `<div class="grid grid-cols-4 gap-1 text-gray-500 mb-1 text-[10px]"><span>${i18n.t('type')}</span><span class="text-center">${i18n.t('count')}</span><span class="text-center">${i18n.t('per_request')}</span><span class="text-right">${i18n.t('total')}</span></div>`;
            let hasIncome = false;
            incomeTypes.forEach((t) => {
                const value = f.income.byType[t.key] || 0;
                const count = f.income.countByType[t.key] || 0;
                if (value > 0 || count > 0) {
                    hasIncome = true;
                    incomeHtml += `<div class="grid grid-cols-4 gap-1"><span class="${t.color
                        }">${t.label
                        }</span><span class="text-center text-gray-500">${count}</span><span class="text-center text-gray-400">$${t.rate.toFixed(
                            2
                        )}</span><span class="text-right text-gray-300">$${Math.floor(
                            value
                        )}</span></div>`;
                }
            });
            if (!hasIncome) {
                incomeHtml = `<div class="text-gray-600 italic">${i18n.t('no_income')}</div>`;
            }
            incomeDetails.innerHTML = incomeHtml;
        }

        // Update income total
        const incomeTotal = document.getElementById("income-total");
        if (incomeTotal)
            incomeTotal.textContent = `$${Math.floor(f.income.total || 0)}`;

        // Expense categories - services with costs
        const serviceTypes = [
            {
                key: "waf",
                label: i18n.t('firewall'),
                color: "text-red-400",
                cost: CONFIG.services.waf.cost,
            },
            {
                key: "alb",
                label: i18n.t('load_balancer'),
                color: "text-blue-400",
                cost: CONFIG.services.alb.cost,
            },
            {
                key: "compute",
                label: i18n.t('compute'),
                color: "text-green-400",
                cost: CONFIG.services.compute.cost,
            },
            {
                key: "db",
                label: i18n.t('relational_db'),
                color: "text-yellow-400",
                cost: CONFIG.services.db.cost,
            },
            {
                key: "s3",
                label: i18n.t('file_storage'),
                color: "text-purple-400",
                cost: CONFIG.services.s3.cost,
            },
            {
                key: "cache",
                label: i18n.t('memory_cache'),
                color: "text-orange-400",
                cost: CONFIG.services.cache.cost,
            },
            {
                key: "sqs",
                label: i18n.t('message_queue'),
                color: "text-cyan-400",
                cost: CONFIG.services.sqs.cost,
            },
        ];

        const repairPercent = CONFIG.survival.degradation?.repairCostPercent || 0.15;

        // Update expense details with service cost, repair cost and count
        const expenseDetails = document.getElementById("expense-details");
        if (expenseDetails) {
            let expenseHtml = "";

            // Breakdown by service type (includes purchase + upkeep + repairs)
            let hasServiceExpenses = false;
            serviceTypes.forEach((t) => {
                const value = f.expenses.byService[t.key] || 0;
                const count = f.expenses.countByService[t.key] || 0;
                const repairCost = Math.ceil(t.cost * repairPercent);
                if (value > 0 || count > 0) {
                    hasServiceExpenses = true;
                    expenseHtml += `<div class="grid grid-cols-5 gap-1"><span class="${t.color
                        }">${t.label
                        }</span><span class="text-center text-gray-500">${count}</span><span class="text-center text-gray-400">$${t.cost
                        }</span><span class="text-center text-yellow-400">$${repairCost}</span><span class="text-right text-gray-300">$${Math.floor(
                            value
                        )}</span></div>`;
                }
            });

            // Add header if we have service expenses
            if (hasServiceExpenses) {
                expenseHtml =
                    `<div class="grid grid-cols-5 gap-1 text-gray-500 mb-1 text-[10px]"><span>${i18n.t('service')}</span><span class="text-center">#</span><span class="text-center">${i18n.t('buy_cost')}</span><span class="text-center">${i18n.t('repair')}</span><span class="text-right">${i18n.t('total')}</span></div>` +
                    expenseHtml;
            }

            // Auto-repair overhead (if enabled)
            if (f.expenses.autoRepair > 0) {
                expenseHtml += `<div class="flex justify-between mt-1 pt-1 border-t border-gray-700"><span class="text-orange-400">${i18n.t('auto_repair')}</span><span class="text-gray-300">$${Math.floor(
                    f.expenses.autoRepair
                )}</span></div>`;
            }

            // Mitigation costs
            if (f.expenses.mitigation > 0) {
                expenseHtml += `<div class="flex justify-between mt-1 border-t border-gray-800"><span class="text-blue-300">DDoS Mitigation</span><span class="text-red-300">-$${Math.floor(
                    f.expenses.mitigation
                )}</span></div>`;
            }

            // Breach penalties
            if (f.expenses.breach > 0) {
                expenseHtml += `<div class="flex justify-between"><span class="text-red-500 font-bold">Security Breach</span><span class="text-red-500 font-bold">-$${Math.floor(
                    f.expenses.breach
                )}</span></div>`;
            }

            if (!expenseHtml) {
                expenseHtml = `<div class="text-gray-600 italic">${i18n.t('no_expenses')}</div>`;
            }
            expenseDetails.innerHTML = expenseHtml;
        }

        // Calculate totals
        const totalExpenses =
            f.expenses.services +
            f.expenses.upkeep +
            f.expenses.repairs +
            f.expenses.autoRepair +
            (f.expenses.mitigation || 0) +
            (f.expenses.breach || 0);
        const expenseTotal = document.getElementById("expense-total");
        if (expenseTotal) expenseTotal.textContent = `$${Math.floor(totalExpenses)}`;

        // Update net profit
        const totalIncome = f.income.total;
        const netProfit = totalIncome - totalExpenses;
        const netProfitEl = document.getElementById("net-profit");
        if (netProfitEl) {
            netProfitEl.textContent = `${netProfit >= 0 ? "+" : ""}$${Math.floor(
                netProfit
            )}`;
            netProfitEl.className = `text-right font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"
                }`;
        }
    }

    /**
     * Update the main HUD display
     * @param {Function} getUpkeepMultiplier - Function to get upkeep multiplier
     * @param {Function} getAutoRepairUpkeep - Function to get auto-repair upkeep
     */
    updateHUD(getUpkeepMultiplier, getAutoRepairUpkeep) {
        document.getElementById("money-display").innerText = `$${Math.floor(
            STATE.money
        )}`;

        const baseUpkeep = STATE.services.reduce(
            (sum, s) => sum + s.config.upkeep / 60,
            0
        );
        const multiplier = getUpkeepMultiplier();
        const autoRepairCost = getAutoRepairUpkeep();
        const totalUpkeep = baseUpkeep * multiplier + autoRepairCost;

        const upkeepDisplay = document.getElementById("upkeep-display");
        if (upkeepDisplay) {
            if (autoRepairCost > 0) {
                upkeepDisplay.innerText = `-$${totalUpkeep.toFixed(2)}/s ${i18n.t('plus_repair')}`;
                upkeepDisplay.className = "text-orange-400 font-mono";
            } else if (multiplier > 1.05) {
                upkeepDisplay.innerText = `-$${totalUpkeep.toFixed(
                    2
                )}/s (×${multiplier.toFixed(2)})`;
                upkeepDisplay.className = "text-red-400 font-mono";
            } else {
                upkeepDisplay.innerText = `-$${totalUpkeep.toFixed(2)}/s`;
                upkeepDisplay.className = "text-red-400 font-mono";
            }
        }

        // Update traffic distribution display
        if (STATE.gameMode === "survival") {
            const staticEl = document.getElementById("mix-static");
            const readEl = document.getElementById("mix-read");
            const writeEl = document.getElementById("mix-write");
            const uploadEl = document.getElementById("mix-upload");
            const searchEl = document.getElementById("mix-search");
            const maliciousEl = document.getElementById("mix-malicious");

            if (staticEl)
                staticEl.textContent =
                    Math.round((STATE.trafficDistribution.STATIC || 0) * 100) + "%";
            if (readEl)
                readEl.textContent =
                    Math.round((STATE.trafficDistribution.READ || 0) * 100) + "%";
            if (writeEl)
                writeEl.textContent =
                    Math.round((STATE.trafficDistribution.WRITE || 0) * 100) + "%";
            if (uploadEl)
                uploadEl.textContent =
                    Math.round((STATE.trafficDistribution.UPLOAD || 0) * 100) + "%";
            if (searchEl)
                searchEl.textContent =
                    Math.round((STATE.trafficDistribution.SEARCH || 0) * 100) + "%";
            if (maliciousEl && !STATE.maliciousSpikeActive)
                maliciousEl.textContent =
                    Math.round((STATE.trafficDistribution.MALICIOUS || 0) * 100) + "%";
        }

        // Update reputation
        STATE.reputation = Math.min(100, STATE.reputation);
        document.getElementById("rep-bar").style.width = `${Math.max(
            0,
            STATE.reputation
        )}%`;
        document.getElementById("rep-display").textContent = `${Math.round(
            Math.max(0, STATE.reputation)
        )}%`;
        document.getElementById(
            "rps-display"
        ).innerText = `${STATE.currentRPS.toFixed(1)} ${i18n.t('req_per_sec')}`;

        // Update elapsed time
        const elapsedEl = document.getElementById("elapsed-time");
        if (elapsedEl) {
            elapsedEl.textContent = this.formatTime(STATE.elapsedGameTime);
        }
    }

    /**
     * Update RPS milestone display
     */
    updateRPSMilestone() {
        const rpsNextEl = document.getElementById("rps-next");
        const rpsCountdownEl = document.getElementById("rps-countdown");
        const rpsMilestoneRow = document.getElementById("rps-milestone-row");

        if (STATE.gameMode === "survival" && rpsMilestoneRow) {
            rpsMilestoneRow.style.display = "flex";

            const milestones = CONFIG.survival.rpsAcceleration?.milestones || [];
            const currentTime = STATE.elapsedGameTime;

            // Find next upcoming milestone
            let nextMilestone = null;
            for (const m of milestones) {
                if (m.time > currentTime) {
                    nextMilestone = m;
                    break;
                }
            }

            if (rpsNextEl && rpsCountdownEl) {
                if (nextMilestone) {
                    const timeRemaining = Math.max(0, nextMilestone.time - currentTime);
                    rpsNextEl.textContent = `×${nextMilestone.multiplier.toFixed(1)}`;
                    rpsCountdownEl.textContent = this.formatTime(timeRemaining);
                } else {
                    // All milestones reached
                    rpsNextEl.textContent = i18n.t('max');
                    rpsCountdownEl.textContent = "--";
                }
            }
        } else if (rpsMilestoneRow) {
            rpsMilestoneRow.style.display = "none";
        }
    }

    /**
     * Update failures panel display
     */
    updateFailuresPanel() {
        const totalFailures = Object.values(STATE.failures).reduce(
            (a, b) => a + b,
            0
        );
        const failuresPanel = document.getElementById("failures-panel");
        const points = CONFIG.survival.SCORE_POINTS;
        
        if (totalFailures > 0 && failuresPanel) {
            failuresPanel.classList.remove("hidden");
            document.getElementById(
                "failures-total"
            ).textContent = `${totalFailures} ${i18n.t('total')}`;

            // Update counts
            document.getElementById("fail-malicious").textContent =
                STATE.failures.MALICIOUS;
            document.getElementById("fail-static").textContent = STATE.failures.STATIC;
            document.getElementById("fail-read").textContent = STATE.failures.READ;
            document.getElementById("fail-write").textContent = STATE.failures.WRITE;
            document.getElementById("fail-upload").textContent = STATE.failures.UPLOAD;
            document.getElementById("fail-search").textContent = STATE.failures.SEARCH;

            // Update reputation loss (malicious = -8, others = -2)
            document.getElementById("fail-malicious-rep").textContent =
                STATE.failures.MALICIOUS * Math.abs(points.MALICIOUS_PASSED_REPUTATION);
            document.getElementById("fail-static-rep").textContent =
                STATE.failures.STATIC * Math.abs(points.FAIL_REPUTATION);
            document.getElementById("fail-read-rep").textContent =
                STATE.failures.READ * Math.abs(points.FAIL_REPUTATION);
            document.getElementById("fail-write-rep").textContent =
                STATE.failures.WRITE * Math.abs(points.FAIL_REPUTATION);
            document.getElementById("fail-upload-rep").textContent =
                STATE.failures.UPLOAD * Math.abs(points.FAIL_REPUTATION);
            document.getElementById("fail-search-rep").textContent =
                STATE.failures.SEARCH * Math.abs(points.FAIL_REPUTATION);

            // Hide rows with 0 failures
            document.getElementById("fail-row-malicious").style.display =
                STATE.failures.MALICIOUS > 0 ? "" : "none";
            document.getElementById("fail-row-static").style.display =
                STATE.failures.STATIC > 0 ? "" : "none";
            document.getElementById("fail-row-read").style.display =
                STATE.failures.READ > 0 ? "" : "none";
            document.getElementById("fail-row-write").style.display =
                STATE.failures.WRITE > 0 ? "" : "none";
            document.getElementById("fail-row-upload").style.display =
                STATE.failures.UPLOAD > 0 ? "" : "none";
            document.getElementById("fail-row-search").style.display =
                STATE.failures.SEARCH > 0 ? "" : "none";
        }
    }

    /**
     * Show a tooltip at the specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} html - HTML content
     */
    showTooltip(x, y, html) {
        const t = document.getElementById("tooltip");
        t.style.display = "block";
        t.style.left = x + "px";
        t.style.top = y + "px";
        t.innerHTML = html;
    }

    /**
     * Hide the tooltip
     */
    hideTooltip() {
        document.getElementById("tooltip").style.display = "none";
    }

    /**
     * Setup UI tooltips for service buttons
     */
    setupUITooltips() {
        const tools = ["waf", "sqs", "alb", "lambda", "db", "cache", "s3", "cdn"];
        tools.forEach((toolId) => {
            const btn = document.getElementById(`tool-${toolId}`);
            if (!btn) return;

            // Map tool ID to config service key
            const serviceKey = toolId === "lambda" ? "compute" : toolId;
            const config = CONFIG.services[serviceKey];

            if (config && config.tooltip) {
                btn.addEventListener("mousemove", (e) => {
                    const content = `
                        <strong class="text-blue-300">${i18n.t(serviceKey)}</strong> <span class="text-green-400">$${config.cost}</span><br>
                        <span class="text-xs text-gray-400">${i18n.t(serviceKey + '_desc')}</span><br>
                        <div class="mt-1 pt-1 border-t border-gray-700 flex justify-between text-xs">
                            <span class="text-gray-500">${i18n.t('upkeep_label')} <span class="text-gray-300">${i18n.t(config.tooltip.upkeep.toLowerCase().replace(' ', '_'))}</span></span>
                        </div>
                    `;
                    this.showTooltip(e.clientX + 15, e.clientY - 100, content);
                });

                btn.addEventListener("mouseleave", () => {
                    this.hideTooltip();
                });
            }
        });
    }

    /**
     * Show the game over modal
     * @param {Object} failureAnalysis - Analysis from ScoreManager
     */
    showGameOverModal(failureAnalysis) {
        document.getElementById("modal-title").innerText = i18n.t('system_failure');
        document.getElementById("modal-title").classList.add("text-red-500");
        document.getElementById("modal-desc").innerHTML = `
            <div class="text-left space-y-3">
                <div class="text-center text-2xl font-bold text-yellow-400 mb-2">${i18n.t('final_score', { score: STATE.score.total })}</div>
                <div class="text-center text-sm text-gray-400 mb-4">${i18n.t('survived_time', { time: this.formatTime(STATE.elapsedGameTime || 0) })}</div>
                
                <div class="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                    <div class="text-red-400 font-bold text-sm uppercase mb-1">${i18n.t('failure_reason')}</div>
                    <div class="text-white">${failureAnalysis.reason}</div>
                </div>
                
                <div class="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
                    <div class="text-blue-400 font-bold text-sm uppercase mb-1">${i18n.t('analysis')}</div>
                    <div class="text-gray-300 text-sm">${failureAnalysis.description}</div>
                </div>
                
                <div class="bg-green-900/30 border border-green-500/50 rounded-lg p-3">
                    <div class="text-green-400 font-bold text-sm uppercase mb-1">${i18n.t('tips_title')}</div>
                    <ul class="text-gray-300 text-sm list-disc list-inside space-y-1">
                        ${failureAnalysis.tips.map((tip) => `<li>${tip}</li>`).join("")}
                    </ul>
                </div>
            </div>
        `;
        document.getElementById("modal").classList.remove("hidden");
        STATE.sound.playGameOver();
    }

    /**
     * Show the main menu
     */
    showMainMenu() {
        // Ensure sound is initialized if possible (browsers might block until interaction)
        if (!STATE.sound.ctx) STATE.sound.init();
        STATE.sound.playMenuBGM();

        document.getElementById("main-menu-modal").classList.remove("hidden");
        document.getElementById("faq-modal").classList.add("hidden");
        document.getElementById("modal").classList.add("hidden");

        // Show navbar when returning to menu
        const navbar = document.getElementById('game-navbar');
        if (navbar) {
            navbar.style.display = 'block';
        }

        // Check for saved game and show/hide load button
        const loadBtn = document.getElementById("load-btn");
        const hasSave = localStorage.getItem("serverSurvivalSave") !== null;
        if (loadBtn) {
            loadBtn.style.display = hasSave ? "block" : "none";
        }
    }
}

// Export for use by other modules and global access
window.GameUIManager = GameUIManager;
