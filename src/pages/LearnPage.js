/**
 * LearnPage - Learn Mode Index Page
 * Entry point for Learn Mode, shows all tutorials with lock/unlock state
 * 
 * FEATURE COMPLETE — DO NOT EXTEND IN MVP
 */

import { SectionHeader } from '../components/ui/SectionHeader.js';
import { ExpandableCard } from '../components/ui/ExpandableCard.js';
import { TagBadge } from '../components/ui/TagBadge.js';
import { LearnLink } from '../components/ui/LearnLink.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { learnState } from '../state/learnState.js';
import { goToLearn, getNavigationContext, NAV_SOURCES } from '../utils/navigation.js';

/**
 * LearnPage - Main Learn Mode page controller with UI
 */
class LearnPage {
    constructor() {
        this.container = null;
        this.tutorials = [];
        this.navigationContext = null;
        this.initialized = false;
        this.error = null;
        this.unsubscribe = null;
    }

    /**
     * Initialize the page
     * @param {HTMLElement} container - Container element to render into
     * @returns {Promise<boolean>} True if initialization succeeded
     */
    async initialize(container) {
        try {
            this.container = container;
            this.error = null;
            
            // Parse navigation context
            this.navigationContext = getNavigationContext();
            
            // Load tutorials
            await this.loadTutorials();
            
            // Initialize learn state with tutorials (async for backend sync)
            await learnState.initialize(this.tutorials);
            
            // Subscribe to state changes
            this.unsubscribe = learnState.subscribe(() => this.render());
            
            // Initial render
            this.render();
            
            this.initialized = true;
            return true;
            
        } catch (error) {
            console.error('LearnPage: Initialization failed', error);
            this.error = 'initialization_failed';
            this.renderError();
            return false;
        }
    }

    /**
     * Load tutorials from JSON
     */
    async loadTutorials() {
        try {
            const response = await fetch('/src/data/learn/tutorials.json');
            
            if (!response.ok) {
                throw new Error(`Failed to load tutorials: ${response.status}`);
            }
            
            this.tutorials = await response.json();
            this.tutorials.sort((a, b) => a.order - b.order);
            
        } catch (error) {
            console.error('LearnPage: Failed to load tutorials', error);
            
            // Try alternate path
            try {
                const altResponse = await fetch('./data/learn/tutorials.json');
                if (altResponse.ok) {
                    this.tutorials = await altResponse.json();
                    this.tutorials.sort((a, b) => a.order - b.order);
                    return;
                }
            } catch {
                // Ignore fallback error
            }
            
            this.tutorials = [];
            throw error;
        }
    }

    /**
     * Render the page
     */
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.container.className = 'learn-page max-w-4xl mx-auto p-6';
        
        // Header section
        this.renderHeader();
        
        // Progress overview
        this.renderProgressOverview();
        
        // Tutorial list
        this.renderTutorialList();
    }

    /**
     * Render page header
     */
    renderHeader() {
        const headerSection = document.createElement('div');
        headerSection.className = 'mb-6';
        
        const header = new SectionHeader({
            title: '📚 Learn Mode',
            subtitle: 'Master concepts through interactive tutorials. Complete tutorials to unlock new topics.'
        });
        
        headerSection.appendChild(header.render());
        this.container.appendChild(headerSection);
    }

    /**
     * Render progress overview
     */
    renderProgressOverview() {
        const stats = learnState.getStats();
        const isDemoMode = learnState.isDemoMode();
        
        const progressSection = document.createElement('div');
        progressSection.className = 'glass-panel rounded-xl p-4 mb-6';
        
        // Demo Mode banner (if active)
        if (isDemoMode) {
            const demoBanner = document.createElement('div');
            demoBanner.className = 'bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-4 text-sm';
            demoBanner.innerHTML = `
                <span class="text-yellow-400 font-medium">⚠️ Demo Mode Active</span>
                <span class="text-yellow-300 ml-2">All tutorials unlocked for demonstration</span>
            `;
            progressSection.appendChild(demoBanner);
            
            // Auto-unlock all in demo mode
            if (stats.unlocked < stats.total) {
                learnState.unlockAll();
            }
        }
        
        // Progress bar
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'mb-4';
        
        const progressLabel = document.createElement('div');
        progressLabel.className = 'flex justify-between text-sm text-gray-400 mb-2';
        progressLabel.innerHTML = `
            <span class="font-medium">Your Progress</span>
            <span>${stats.completed} of ${stats.total} completed (${stats.percentage}%)</span>
        `;
        progressBarContainer.appendChild(progressLabel);
        
        const progressBar = document.createElement('div');
        progressBar.className = 'w-full h-2 bg-gray-700 rounded-full overflow-hidden';
        progressBar.innerHTML = `
            <div class="h-full bg-cyan-500 transition-all duration-300" style="width: ${stats.percentage}%"></div>
        `;
        progressBarContainer.appendChild(progressBar);
        
        progressSection.appendChild(progressBarContainer);
        
        // Stats grid
        const statsGrid = document.createElement('div');
        statsGrid.className = 'grid grid-cols-3 gap-4 text-center';
        
        statsGrid.innerHTML = `
            <div>
                <div class="text-2xl font-bold text-green-400">${stats.completed}</div>
                <div class="text-xs text-gray-500">Completed</div>
            </div>
            <div>
                <div class="text-2xl font-bold text-cyan-400">${stats.unlocked - stats.completed}</div>
                <div class="text-xs text-gray-500">Available</div>
            </div>
            <div>
                <div class="text-2xl font-bold text-gray-500">${stats.total - stats.unlocked}</div>
                <div class="text-xs text-gray-500">Locked</div>
            </div>
        `;
        
        progressSection.appendChild(statsGrid);
        
        // Reset Progress button (debug/demo helper)
        const resetContainer = document.createElement('div');
        resetContainer.className = 'mt-4 pt-4 border-t border-gray-700 flex justify-between items-center';
        
        const resetHint = document.createElement('span');
        resetHint.className = 'text-xs text-gray-600';
        resetHint.textContent = 'Debug: Reset to start fresh';
        resetContainer.appendChild(resetHint);
        
        const resetBtn = document.createElement('button');
        resetBtn.className = 'text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-1 border border-gray-700 rounded hover:border-red-700';
        resetBtn.textContent = '↻ Reset Progress';
        resetBtn.addEventListener('click', () => {
            if (confirm('Reset all tutorial progress? This cannot be undone.')) {
                learnState.reset();
            }
        });
        resetContainer.appendChild(resetBtn);
        
        progressSection.appendChild(resetContainer);
        this.container.appendChild(progressSection);
    }

    /**
     * Render tutorial list
     */
    renderTutorialList() {
        // Check for empty state
        if (this.tutorials.length === 0) {
            const emptyState = new EmptyState({
                title: 'No Tutorials Available',
                description: 'Tutorials are being prepared. Check back soon!'
            });
            this.container.appendChild(emptyState.render());
            return;
        }
        
        const listSection = document.createElement('div');
        listSection.className = 'tutorial-list space-y-4';
        
        this.tutorials.forEach(tutorial => {
            const card = this.createTutorialCard(tutorial);
            listSection.appendChild(card);
        });
        
        this.container.appendChild(listSection);
    }

    /**
     * Create a tutorial card
     * @param {Object} tutorial - Tutorial data
     * @returns {HTMLElement} Tutorial card element
     */
    createTutorialCard(tutorial) {
        const status = learnState.getTutorialStatus(tutorial.id);
        const isLocked = status === 'locked';
        const isCompleted = status === 'completed';
        
        const card = document.createElement('div');
        card.className = `tutorial-card glass-panel rounded-xl p-4 transition-all ${
            isLocked ? 'opacity-60' : 'hover:border-cyan-500/30'
        }`;
        
        // Header row
        const headerRow = document.createElement('div');
        headerRow.className = 'flex items-start justify-between mb-2';
        
        // Left side - order number and title
        const titleSection = document.createElement('div');
        titleSection.className = 'flex items-center gap-3';
        
        const orderBadge = document.createElement('div');
        orderBadge.className = `w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            isCompleted ? 'bg-green-600 text-white' : 
            isLocked ? 'bg-gray-700 text-gray-400' : 
            'bg-cyan-600 text-white'
        }`;
        orderBadge.textContent = tutorial.order;
        titleSection.appendChild(orderBadge);
        
        const titleContainer = document.createElement('div');
        const title = document.createElement('h3');
        title.className = `text-lg font-semibold ${isLocked ? 'text-gray-500' : 'text-white'}`;
        title.textContent = tutorial.title;
        titleContainer.appendChild(title);
        
        titleSection.appendChild(titleContainer);
        headerRow.appendChild(titleSection);
        
        // Right side - status badge
        const statusBadge = this.createStatusBadge(status);
        headerRow.appendChild(statusBadge);
        
        card.appendChild(headerRow);
        
        // Description
        const description = document.createElement('p');
        description.className = `text-sm mb-3 ${isLocked ? 'text-gray-600' : 'text-gray-400'}`;
        description.textContent = tutorial.description;
        card.appendChild(description);
        
        // Meta row
        const metaRow = document.createElement('div');
        metaRow.className = 'flex items-center gap-4 text-xs text-gray-500';
        
        // Difficulty badge
        const difficultyBadge = new TagBadge({
            text: tutorial.difficulty.charAt(0).toUpperCase() + tutorial.difficulty.slice(1),
            variant: tutorial.difficulty === 'beginner' ? 'success' : 'warning'
        });
        metaRow.appendChild(difficultyBadge.render());
        
        // Time estimate
        const timeSpan = document.createElement('span');
        timeSpan.textContent = `⏱️ ${tutorial.estimatedTimeMinutes} min`;
        metaRow.appendChild(timeSpan);
        
        card.appendChild(metaRow);
        
        // Action button (only for unlocked tutorials)
        if (!isLocked) {
            const actionRow = document.createElement('div');
            actionRow.className = 'mt-4 pt-3 border-t border-gray-700';
            
            const actionButton = document.createElement('a');
            actionButton.href = goToLearn(tutorial.id);
            actionButton.className = `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCompleted 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-cyan-600 text-white hover:bg-cyan-500'
            }`;
            actionButton.textContent = isCompleted ? '📖 Review Tutorial' : '▶️ Start Tutorial';
            
            actionRow.appendChild(actionButton);
            card.appendChild(actionRow);
        } else {
            // Show lock reason
            const lockRow = document.createElement('div');
            lockRow.className = 'mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500';
            lockRow.textContent = '🔒 Complete previous tutorials to unlock';
            card.appendChild(lockRow);
        }
        
        return card;
    }

    /**
     * Create status badge
     * @param {'locked' | 'available' | 'completed'} status - Tutorial status
     * @returns {HTMLElement} Status badge element
     */
    createStatusBadge(status) {
        const configs = {
            locked: { text: '🔒 Locked', variant: 'default' },
            available: { text: '▶ Available', variant: 'success' },
            completed: { text: '✅ Completed', variant: 'success' }
        };
        
        const config = configs[status] || configs.locked;
        const badge = new TagBadge(config);
        return badge.render();
    }

    /**
     * Render error state
     */
    renderError() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.container.className = 'learn-page max-w-4xl mx-auto p-6';
        
        const errorState = new EmptyState({
            title: 'Failed to Load Tutorials',
            description: 'There was an error loading the tutorials. Please try refreshing the page.'
        });
        
        // Add refresh button
        const refreshButton = document.createElement('button');
        refreshButton.className = 'px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors';
        refreshButton.textContent = 'Refresh Page';
        refreshButton.addEventListener('click', () => window.location.reload());
        
        const emptyEl = errorState.render();
        emptyEl.querySelector('.empty-state-action')?.appendChild(refreshButton) || 
            emptyEl.appendChild(refreshButton);
        
        this.container.appendChild(emptyEl);
    }

    /**
     * Cleanup page resources
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.initialized = false;
    }
}

// Export
export { LearnPage };
export default LearnPage;
