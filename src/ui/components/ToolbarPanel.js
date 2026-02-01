/**
 * ToolbarPanel - Bottom toolbar with tools and service buttons
 * Handles tool selection and service placement
 */
import { BaseComponent } from '../BaseComponent.js';

class ToolbarPanel extends BaseComponent {
    constructor(app) {
        super(app, 'toolbarPanel');
        this.activeTool = 'select';
    }

    async setup() {
        // Create the toolbar panel if it doesn't exist
        if (!this.element) {
            this.element = this.createToolbarPanel();
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
        // Tool button events
        this.addEventListener(this.element, 'click', (e) => this.handleToolClick(e));
        
        // Subscribe to tool change events
        this.subscribeToEvent('game:tool-change', (data) => this.setActiveTool(data.tool));
        this.subscribeToEvent('game:mode-change', (data) => this.handleModeChange(data));
    }

    subscribeToState() {
        this.subscribeToStateChange('game.activeTool', (tool) => this.setActiveTool(tool));
        this.subscribeToStateChange('game.currentSession.money', (money) => this.updateServiceCosts(money));
    }

    createToolbarPanel() {
        const panel = this.createElement('div', {
            id: 'toolbarPanel',
            class: 'absolute bottom-6 left-0 w-full z-10 pointer-events-none flex justify-center'
        });

        panel.innerHTML = `
            <div class="glass-panel rounded-2xl p-2 pointer-events-auto overflow-y-auto flex items-center gap-2 shadow-2xl">
                <!-- Help Button -->
                <button id="tool-help" class="service-btn bg-gray-700 text-gray-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center mr-2 border border-gray-600" data-tool="help">
                    <div class="text-xl">?</div>
                    <span data-i18n="help" class="text-[9px] font-bold mt-1 uppercase">Help</span>
                </button>

                <!-- Mute Button -->
                <button id="tool-mute" class="service-btn bg-gray-700 text-gray-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center border border-gray-600" data-tool="mute">
                    <div class="text-xl" id="mute-icon">🔊</div>
                    <span data-i18n="sound" class="text-[9px] font-bold mt-1 uppercase">Sound</span>
                </button>

                <!-- Tools -->
                <div class="flex gap-1 pr-4 border-r border-gray-700">
                    <button id="tool-select" class="service-btn active bg-gray-800 text-gray-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center border border-transparent" data-tool="select">
                        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                        </svg>
                        <span data-i18n="select" class="text-[10px] uppercase">Select</span>
                    </button>

                    <button id="tool-connect" class="service-btn bg-gray-800 text-gray-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center border border-transparent" data-tool="connect">
                        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                        <span data-i18n="link" class="text-[10px] uppercase">Link</span>
                    </button>

                    <button id="tool-delete" class="service-btn bg-red-900/30 text-red-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center border border-transparent hover:bg-red-900/50" data-tool="delete">
                        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        <span data-i18n="demolish" class="text-[10px] uppercase">Demolish</span>
                    </button>

                    <button id="tool-unlink" class="service-btn bg-orange-900/30 text-orange-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center border border-transparent hover:bg-orange-900/50" data-tool="unlink">
                        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                        </svg>
                        <span data-i18n="unlink" class="text-[10px] uppercase">Unlink</span>
                    </button>
                </div>

                <!-- Services Shop -->
                <div class="flex gap-2 pl-2">
                    <!-- WAF -->
                    <button id="tool-waf" class="service-btn bg-gray-800 text-gray-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center border border-transparent group relative overflow-hidden" data-tool="waf" data-cost="40">
                        <div class="absolute top-0 right-0 bg-green-900/80 text-green-400 text-[9px] px-1 rounded-bl font-mono">$40</div>
                        <div class="w-4 h-4 bg-purple-500 rounded-sm mb-1 shadow-[0_0_10px_rgba(168,85,247,0.6)]"></div>
                        <span data-i18n="fw" class="text-[10px] font-bold mt-1">FW</span>
                    </button>

                    <!-- SQS -->
                    <button id="tool-sqs" class="service-btn bg-gray-800 text-gray-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center border border-transparent group relative overflow-hidden" data-tool="sqs" data-cost="40">
                        <div class="absolute top-0 right-0 bg-green-900/80 text-green-400 text-[9px] px-1 rounded-bl font-mono">$40</div>
                        <div class="w-5 h-3 bg-orange-500 rounded-sm mb-1 shadow-[0_0_10px_rgba(255,153,0,0.6)]"></div>
                        <span data-i18n="queue" class="text-[10px] font-bold mt-1">Queue</span>
                    </button>

                    <!-- ALB -->
                    <button id="tool-alb" class="service-btn bg-gray-800 text-gray-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center border border-transparent group relative overflow-hidden" data-tool="alb" data-cost="50">
                        <div class="absolute top-0 right-0 bg-green-900/80 text-green-400 text-[9px] px-1 rounded-bl font-mono">$50</div>
                        <div class="w-4 h-4 bg-blue-500 rounded-sm mb-1 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                        <span data-i18n="lb" class="text-[10px] font-bold mt-1">LB</span>
                    </button>

                    <!-- Lambda/Compute -->
                    <button id="tool-lambda" class="service-btn bg-gray-800 text-gray-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center border border-transparent group relative overflow-hidden" data-tool="lambda" data-cost="60">
                        <div class="absolute top-0 right-0 bg-green-900/80 text-green-400 text-[9px] px-1 rounded-bl font-mono">$60</div>
                        <div class="w-4 h-4 bg-orange-500 rounded-full mb-1 shadow-[0_0_10px_rgba(249,115,22,0.6)]"></div>
                        <span data-i18n="compute_short" class="text-[10px] font-bold mt-1">Compute</span>
                    </button>

                    <!-- Database -->
                    <button id="tool-db" class="service-btn bg-gray-800 text-gray-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center border border-transparent group relative overflow-hidden" data-tool="db" data-cost="150">
                        <div class="absolute top-0 right-0 bg-green-900/80 text-green-400 text-[9px] px-1 rounded-bl font-mono">$150</div>
                        <div class="w-4 h-4 bg-red-600 rounded-sm mb-1 shadow-[0_0_10px_rgba(220,38,38,0.6)] border-b-2 border-red-800"></div>
                        <span data-i18n="db_short" class="text-[10px] font-bold mt-1">SQL DB</span>
                    </button>

                    <!-- Cache -->
                    <button id="tool-cache" class="service-btn bg-gray-800 text-gray-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center border border-transparent group relative overflow-hidden" data-tool="cache" data-cost="60">
                        <div class="absolute top-0 right-0 bg-green-900/80 text-green-400 text-[9px] px-1 rounded-bl font-mono">$60</div>
                        <div class="w-4 h-4 bg-red-600 rounded mb-1 shadow-[0_0_10px_rgba(220,56,45,0.6)]"></div>
                        <span data-i18n="cache_short" class="text-[10px] font-bold mt-1">Cache</span>
                    </button>

                    <!-- CDN -->
                    <button id="tool-cdn" class="service-btn bg-gray-800 text-gray-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center border border-transparent group relative overflow-hidden" data-tool="cdn" data-cost="60">
                        <div class="absolute top-0 right-0 bg-green-900/80 text-green-400 text-[9px] px-1 rounded-bl font-mono">$60</div>
                        <div class="w-4 h-4 bg-green-400 rounded-full mb-1 shadow-[0_0_10px_rgba(74,222,128,0.6)] border border-white"></div>
                        <span data-i18n="cdn_short" class="text-[10px] font-bold mt-1">CDN</span>
                    </button>

                    <!-- S3 Storage -->
                    <button id="tool-s3" class="service-btn bg-gray-800 text-gray-200 p-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center border border-transparent group relative overflow-hidden" data-tool="s3" data-cost="25">
                        <div class="absolute top-0 right-0 bg-green-900/80 text-green-400 text-[9px] px-1 rounded-bl font-mono">$25</div>
                        <div class="w-4 h-4 bg-emerald-500 rounded-full mb-1 shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
                        <span data-i18n="storage_short" class="text-[10px] font-bold mt-1">Storage</span>
                    </button>
                </div>
            </div>
        `;

        return panel;
    }

    handleToolClick(e) {
        const button = e.target.closest('[data-tool]');
        if (!button) return;

        const tool = button.dataset.tool;
        
        // Handle special tools
        switch (tool) {
            case 'help':
                this.eventSystem.emit('ui:show-help');
                return;
            case 'mute':
                this.eventSystem.emit('audio:toggle-mute');
                return;
        }

        // Set active tool
        this.setActiveTool(tool);
        this.setState('game.activeTool', tool);
        this.eventSystem.emit('game:tool-selected', { tool });
    }

    setActiveTool(tool) {
        if (this.activeTool === tool) return;

        // Remove active class from current tool
        const currentActive = this.querySelector('.service-btn.active');
        if (currentActive) {
            currentActive.classList.remove('active');
        }

        // Add active class to new tool
        const newActive = this.querySelector(`[data-tool="${tool}"]`);
        if (newActive) {
            newActive.classList.add('active');
        }

        this.activeTool = tool;
        this.emit('tool-changed', { tool });
    }

    updateServiceCosts(money) {
        // Update service button states based on available money
        const serviceButtons = this.querySelectorAll('[data-cost]');
        serviceButtons.forEach(button => {
            const cost = parseInt(button.dataset.cost);
            if (money < cost) {
                button.classList.add('opacity-50', 'cursor-not-allowed');
                button.disabled = true;
            } else {
                button.classList.remove('opacity-50', 'cursor-not-allowed');
                button.disabled = false;
            }
        });
    }

    handleModeChange(data) {
        // Show/hide certain tools based on game mode
        const deleteButton = this.querySelector('#tool-delete');
        const unlinkButton = this.querySelector('#tool-unlink');
        
        if (data.mode === 'challenge') {
            // In challenge mode, limit destructive tools
            deleteButton?.classList.add('hidden');
            unlinkButton?.classList.add('hidden');
        } else {
            deleteButton?.classList.remove('hidden');
            unlinkButton?.classList.remove('hidden');
        }
    }

    // Public API for external tool changes
    selectTool(tool) {
        this.setActiveTool(tool);
        this.setState('game.activeTool', tool);
    }

    getActiveTool() {
        return this.activeTool;
    }
}

export { ToolbarPanel };