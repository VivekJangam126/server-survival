/**
 * StatsPanel - Game statistics display component
 * Shows budget, reputation, RPS, traffic mix, and score information
 */
import { BaseComponent } from '../BaseComponent.js';

class StatsPanel extends BaseComponent {
    constructor(app) {
        super(app, 'statsPanel');
        this.updateInterval = null;
    }

    async setup() {
        // Create the stats panel if it doesn't exist
        if (!this.element) {
            this.element = this.createStatsPanel();
            // Add to UI container instead of body
            const uiContainer = this.getUIContainer();
            uiContainer.appendChild(this.element);
        }
    }

    getUIContainer() {
        let container = document.getElementById('ui-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'ui-container';
            container.className = 'absolute top-0 left-0 w-full h-full pointer-events-none';
            document.body.appendChild(container);
        }
        return container;
    }

    bindEvents() {
        // Subscribe to game state updates
        this.subscribeToEvent('game:stats-update', (data) => this.updateStats(data));
        this.subscribeToEvent('game:mode-change', (data) => this.handleModeChange(data));
        
        // Start periodic updates
        this.updateInterval = setInterval(() => this.updateDisplay(), 100);
    }

    subscribeToState() {
        // Subscribe to relevant state changes
        this.subscribeToStateChange('game.currentSession', () => this.updateDisplay());
        this.subscribeToStateChange('user.preferences', () => this.updateDisplay());
    }

    createStatsPanel() {
        const panel = this.createElement('div', {
            id: 'statsPanel',
            class: 'absolute top-4 left-4 glass-panel rounded-xl p-5 w-80 pointer-events-auto'
        });

        panel.innerHTML = `
            <div class="flex justify-between items-end mb-3 border-b border-gray-700 pb-2">
                <h1 data-i18n="survival" class="text-2xl font-bold text-red-500 tracking-widest animate-pulse">
                    SURVIVAL
                </h1>
                <span class="text-xs text-gray-500 font-mono">v3.0</span>
            </div>

            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <span data-i18n="budget" class="text-gray-400 text-sm">BUDGET</span>
                    <span id="money-display" class="text-green-400 font-mono text-xl font-bold transition-colors duration-300">$500</span>
                </div>
                
                <div class="flex justify-between items-center text-xs">
                    <span data-i18n="upkeep_cost" class="text-gray-500">Upkeep Cost</span>
                    <span id="upkeep-display" class="text-red-400 font-mono">-$0.00/s</span>
                </div>
                
                <div class="flex justify-between items-center text-xs">
                    <span data-i18n="elapsed_time" class="text-gray-500">Elapsed Time</span>
                    <span id="elapsed-time" class="text-gray-400 font-mono">00:00</span>
                </div>
                
                <div class="flex justify-between items-center">
                    <span data-i18n="reputation" class="text-gray-400 text-sm">REPUTATION</span>
                    <div class="flex items-center gap-2">
                        <div class="w-24 h-3 bg-gray-800 rounded-full overflow-hidden relative">
                            <div id="rep-bar" class="h-full bg-yellow-500 transition-all duration-500" style="width: 100%"></div>
                        </div>
                        <span id="rep-display" class="text-yellow-400 font-mono text-sm w-10 text-right">100%</span>
                    </div>
                </div>
                
                <div class="flex justify-between items-center pt-1">
                    <span data-i18n="load_rps" class="text-gray-400 text-sm">LOAD (RPS)</span>
                    <span id="rps-display" class="text-blue-300 font-mono text-sm">0.0 req/s</span>
                </div>
                
                <div class="flex justify-between items-center text-xs" id="rps-milestone-row">
                    <span data-i18n="next_rps_surge" class="text-gray-500">Next RPS Surge</span>
                    <div class="flex items-center gap-2 font-mono">
                        <span id="rps-next" class="text-orange-400">×1.0</span>
                        <span data-i18n="in" class="text-gray-600">in</span>
                        <span id="rps-countdown" class="text-cyan-400">0:00</span>
                    </div>
                </div>
                
                <div class="flex justify-between items-center pt-1">
                    <span data-i18n="traffic" class="text-gray-400 text-sm">TRAFFIC</span>
                    <div class="flex gap-1 text-[10px] font-mono">
                        <span class="text-green-400" id="mix-static" data-i18n-title="traffic_static" title="Static GET">ST</span>
                        <span class="text-blue-400" id="mix-read" data-i18n-title="traffic_read" title="Read GET">RD</span>
                        <span class="text-orange-400" id="mix-write" data-i18n-title="traffic_write" title="Write POST">WR</span>
                        <span class="text-yellow-400" id="mix-upload" data-i18n-title="traffic_upload" title="Upload">UP</span>
                        <span class="text-cyan-400" id="mix-search" data-i18n-title="traffic_search" title="Search">SR</span>
                        <span class="text-red-400" id="mix-malicious" data-i18n-title="traffic_malicious" title="Malicious">⚠️</span>
                    </div>
                </div>

                <!-- Failures Table -->
                <div id="failures-panel" class="mt-2 pt-2 border-t border-gray-700/50 hidden">
                    <div class="flex justify-between items-center mb-2">
                        <span data-i18n="failures" class="text-gray-500 text-xs uppercase">Failures</span>
                        <span id="failures-total" class="text-red-400 font-mono text-xs">0 <span data-i18n="total">total</span></span>
                    </div>
                    <table class="w-full text-[10px] font-mono">
                        <thead>
                            <tr class="text-gray-500">
                                <th data-i18n="type" class="text-left font-normal">Type</th>
                                <th data-i18n="count" class="text-right font-normal">Count</th>
                                <th data-i18n="rep_loss" class="text-right font-normal">Rep Loss</th>
                            </tr>
                        </thead>
                        <tbody id="failures-tbody">
                            <tr class="text-purple-400" id="fail-row-malicious">
                                <td data-i18n="fraud_leak">🛡️ Fraud Leak</td>
                                <td class="text-right" id="fail-malicious">0</td>
                                <td class="text-right text-red-400" id="fail-malicious-rep">0</td>
                            </tr>
                            <tr class="text-green-400" id="fail-row-static">
                                <td data-i18n="fail_static">ST Static</td>
                                <td class="text-right" id="fail-static">0</td>
                                <td class="text-right text-red-400" id="fail-static-rep">0</td>
                            </tr>
                            <tr class="text-blue-400" id="fail-row-read">
                                <td data-i18n="fail_read">RD Read</td>
                                <td class="text-right" id="fail-read">0</td>
                                <td class="text-right text-red-400" id="fail-read-rep">0</td>
                            </tr>
                            <tr class="text-orange-400" id="fail-row-write">
                                <td data-i18n="fail_write">WR Write</td>
                                <td class="text-right" id="fail-write">0</td>
                                <td class="text-right text-red-400" id="fail-write-rep">0</td>
                            </tr>
                            <tr class="text-yellow-400" id="fail-row-upload">
                                <td data-i18n="fail_upload">UP Upload</td>
                                <td class="text-right" id="fail-upload">0</td>
                                <td class="text-right text-red-400" id="fail-upload-rep">0</td>
                            </tr>
                            <tr class="text-cyan-400" id="fail-row-search">
                                <td data-i18n="fail_search">SR Search</td>
                                <td class="text-right" id="fail-search">0</td>
                                <td class="text-right text-red-400" id="fail-search-rep">0</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="flex justify-between items-center pt-3 border-t border-gray-700 mt-2">
                    <span data-i18n="total_score" class="text-gray-300 font-bold text-lg">TOTAL SCORE</span>
                    <span id="total-score-display" class="text-white font-mono text-2xl font-bold">0</span>
                </div>
            </div>
        `;

        return panel;
    }

    updateStats(data) {
        if (!data) return;

        // Update money display
        const moneyEl = this.querySelector('#money-display');
        if (moneyEl && data.money !== undefined) {
            moneyEl.textContent = `$${Math.floor(data.money)}`;
            
            // Color coding based on money amount
            if (data.money < 0) {
                moneyEl.className = 'text-red-400 font-mono text-xl font-bold transition-colors duration-300';
            } else if (data.money < 100) {
                moneyEl.className = 'text-yellow-400 font-mono text-xl font-bold transition-colors duration-300';
            } else {
                moneyEl.className = 'text-green-400 font-mono text-xl font-bold transition-colors duration-300';
            }
        }

        // Update reputation
        const repBar = this.querySelector('#rep-bar');
        const repDisplay = this.querySelector('#rep-display');
        if (repBar && repDisplay && data.reputation !== undefined) {
            const repPercent = Math.max(0, Math.min(100, data.reputation));
            repBar.style.width = `${repPercent}%`;
            repDisplay.textContent = `${Math.floor(repPercent)}%`;
            
            // Color coding based on reputation
            if (repPercent < 25) {
                repBar.className = 'h-full bg-red-500 transition-all duration-500';
                repDisplay.className = 'text-red-400 font-mono text-sm w-10 text-right';
            } else if (repPercent < 50) {
                repBar.className = 'h-full bg-orange-500 transition-all duration-500';
                repDisplay.className = 'text-orange-400 font-mono text-sm w-10 text-right';
            } else {
                repBar.className = 'h-full bg-yellow-500 transition-all duration-500';
                repDisplay.className = 'text-yellow-400 font-mono text-sm w-10 text-right';
            }
        }

        // Update RPS display
        const rpsEl = this.querySelector('#rps-display');
        if (rpsEl && data.currentRPS !== undefined) {
            rpsEl.textContent = `${data.currentRPS.toFixed(1)} req/s`;
        }

        // Update total score
        const scoreEl = this.querySelector('#total-score-display');
        if (scoreEl && data.totalScore !== undefined) {
            scoreEl.textContent = Math.floor(data.totalScore).toString();
        }

        // Update upkeep cost
        const upkeepEl = this.querySelector('#upkeep-display');
        if (upkeepEl && data.upkeepCost !== undefined) {
            upkeepEl.textContent = `-$${data.upkeepCost.toFixed(2)}/s`;
        }

        // Update elapsed time
        const timeEl = this.querySelector('#elapsed-time');
        if (timeEl && data.elapsedTime !== undefined) {
            timeEl.textContent = this.formatTime(data.elapsedTime);
        }
    }

    updateDisplay() {
        // Get current game state and update display
        const gameState = this.getState('game.currentSession');
        if (gameState) {
            this.updateStats(gameState);
        }
    }

    handleModeChange(data) {
        const titleEl = this.querySelector('h1[data-i18n="survival"]');
        if (titleEl) {
            switch (data.mode) {
                case 'survival':
                    titleEl.textContent = 'SURVIVAL';
                    titleEl.className = 'text-2xl font-bold text-red-500 tracking-widest animate-pulse';
                    break;
                case 'sandbox':
                    titleEl.textContent = 'SANDBOX';
                    titleEl.className = 'text-2xl font-bold text-purple-500 tracking-widest';
                    break;
                case 'challenge':
                    titleEl.textContent = 'CHALLENGE';
                    titleEl.className = 'text-2xl font-bold text-blue-500 tracking-widest';
                    break;
                default:
                    titleEl.textContent = 'CLOUD SIMULATOR';
                    titleEl.className = 'text-2xl font-bold text-cyan-500 tracking-widest';
            }
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    async onCleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

export { StatsPanel };