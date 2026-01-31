/**
 * AnalysisPageController - Manages the Analysis Page state and data flow
 * Handles mode switching, data fetching, and component coordination
 * No analytics calculations - pure UI controller
 */
class AnalysisPageController {
    constructor() {
        this.currentMode = 'PLAY';
        this.currentSummary = null;
    }

    /**
     * Initialize the page controller
     */
    init() {
        this.setupModeSelector();
        this.loadCurrentMode();
    }

    /**
     * Setup mode selector buttons and event handlers
     */
    setupModeSelector() {
        const playButton = document.getElementById('mode-play');
        const sandboxButton = document.getElementById('mode-sandbox');

        if (!playButton || !sandboxButton) {
            console.warn('Mode selector buttons not found - page may not be fully loaded');
            return;
        }

        playButton.addEventListener('click', () => {
            this.switchMode('PLAY');
        });

        sandboxButton.addEventListener('click', () => {
            this.switchMode('SANDBOX');
        });
    }

    /**
     * Switch between Play and Sandbox modes
     * @param {string} mode - "PLAY" or "SANDBOX"
     */
    switchMode(mode) {
        if (mode === this.currentMode) return;

        this.currentMode = mode;
        this.updateModeSelector();
        this.loadCurrentMode();
    }

    /**
     * Update mode selector button states
     */
    updateModeSelector() {
        const playButton = document.getElementById('mode-play');
        const sandboxButton = document.getElementById('mode-sandbox');

        if (!playButton || !sandboxButton) return;

        // Reset both buttons
        playButton.className = 'px-6 py-2 rounded-md font-medium transition-all duration-200 text-gray-400 hover:text-white';
        sandboxButton.className = 'px-6 py-2 rounded-md font-medium transition-all duration-200 text-gray-400 hover:text-white';

        // Highlight active button
        if (this.currentMode === 'PLAY') {
            playButton.className = 'px-6 py-2 rounded-md font-medium transition-all duration-200 bg-blue-600 text-white';
        } else {
            sandboxButton.className = 'px-6 py-2 rounded-md font-medium transition-all duration-200 bg-purple-600 text-white';
        }
    }

    /**
     * Load and display data for current mode
     */
    loadCurrentMode() {
        this.showLoading();

        try {
            // Fetch progress summary using ProgressSummaryBuilder
            this.currentSummary = getProgressSummary(this.currentMode);
            
            // Check if we have any data
            if (this.hasNoData()) {
                this.showEmptyState();
            } else {
                this.showMainContent();
                this.renderComponents();
            }
        } catch (error) {
            console.error('Failed to load progress summary:', error);
            this.showEmptyState();
        }
    }

    /**
     * Check if there's no data to display
     * @returns {boolean}
     */
    hasNoData() {
        return !this.currentSummary || this.currentSummary.overview.totalSessions === 0;
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.hideAllStates();
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.classList.remove('hidden');
        }
    }

    /**
     * Show empty state when no data available
     */
    showEmptyState() {
        this.hideAllStates();
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.classList.remove('hidden');
            
            // Update the link based on current mode
            const startLink = emptyState.querySelector('a');
            if (startLink) {
                if (this.currentMode === 'SANDBOX') {
                    startLink.href = 'sandbox.html';
                    startLink.textContent = 'Try Sandbox';
                } else {
                    startLink.href = 'play.html';
                    startLink.textContent = 'Start Playing';
                }
            }
        }
    }

    /**
     * Show main content with data
     */
    showMainContent() {
        this.hideAllStates();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.remove('hidden');
        }
    }

    /**
     * Hide all page states
     */
    hideAllStates() {
        const states = ['loading-state', 'empty-state', 'main-content'];
        states.forEach(stateId => {
            const element = document.getElementById(stateId);
            if (element) {
                element.classList.add('hidden');
            }
        });
    }

    /**
     * Render all UI components with current summary data
     */
    renderComponents() {
        if (!this.currentSummary) return;

        try {
            // Render each component with summary data
            OverviewCards.render(this.currentSummary);
            RecentProgress.render(this.currentSummary);
            TrendsPanel.render(this.currentSummary);
            LearningInsight.render(this.currentSummary);
        } catch (error) {
            console.error('Failed to render components:', error);
        }
    }

    /**
     * Get current mode for external access
     * @returns {string}
     */
    getCurrentMode() {
        return this.currentMode;
    }

    /**
     * Get current summary for external access
     * @returns {Object|null}
     */
    getCurrentSummary() {
        return this.currentSummary;
    }
}

// Export the class and create global instance
window.AnalysisPageController = new AnalysisPageController();

// Also export the class itself for debugging
window.AnalysisPageControllerClass = AnalysisPageController;