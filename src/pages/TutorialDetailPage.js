/**
 * TutorialDetailPage - Tutorial Detail Page with UI
 * Displays full tutorial content with navigation context and completion
 * 
 * Uses 2-column layout:
 * - Left: Vertical navigation for sections
 * - Right: Content panel for active section
 */

import { SectionHeader } from '../components/ui/SectionHeader.js';
import { InfoPanel } from '../components/ui/InfoPanel.js';
import { TagBadge } from '../components/ui/TagBadge.js';
import { LearnLink } from '../components/ui/LearnLink.js';
import { VerticalTabNav } from '../components/ui/VerticalTabNav.js';
import { TutorialContentPanel } from '../components/ui/TutorialContentPanel.js';
import { learnState } from '../state/learnState.js';
import { 
    goToLearn, 
    goToMapping, 
    getNavigationContext, 
    getRouteParams,
    getBackNavigationInfo,
    isValidConceptId,
    navigateTo,
    NAV_SOURCES 
} from '../utils/navigation.js';

/**
 * TutorialDetailPage - Full tutorial page with UI
 */
class TutorialDetailPage {
    constructor() {
        this.container = null;
        this.conceptId = null;
        this.tutorial = null;
        this.tutorials = [];
        this.navigationContext = null;
        this.backNavigation = null;
        this.initialized = false;
        this.error = null;
        this.unsubscribe = null;
        
        // 2-column layout state
        this.activeSection = 'overview';
        this.verticalNav = null;
        this.contentPanel = null;
    }

    /**
     * Initialize the page
     * @param {HTMLElement} container - Container element to render into
     * @param {string} [conceptId] - Optional concept ID (otherwise read from URL)
     * @returns {Promise<boolean>} True if initialization succeeded
     */
    async initialize(container, conceptId = null) {
        try {
            this.container = container;
            this.error = null;
            
            // Get conceptId from params or argument
            const params = getRouteParams();
            this.conceptId = conceptId || params.conceptId;
            
            // Validate conceptId exists
            if (!this.conceptId) {
                this.error = 'missing_concept_id';
                this.renderError('Tutorial Not Found', 'No tutorial ID was specified.');
                return false;
            }
            
            // Load tutorials
            await this.loadTutorials();
            
            // Initialize learn state (async for backend sync)
            await learnState.initialize(this.tutorials);
            
            // Validate conceptId
            if (!isValidConceptId(this.conceptId, this.tutorials)) {
                this.error = 'invalid_concept_id';
                this.renderError('Tutorial Not Found', `The tutorial "${this.conceptId}" does not exist.`);
                return false;
            }
            
            // Find tutorial
            this.tutorial = this.tutorials.find(t => t.id === this.conceptId);
            
            if (!this.tutorial) {
                this.error = 'tutorial_not_found';
                this.renderError('Tutorial Not Found', 'The requested tutorial could not be loaded.');
                return false;
            }
            
            // Check if tutorial is locked
            if (learnState.isLocked(this.conceptId)) {
                this.error = 'tutorial_locked';
                this.renderLockedState();
                return false;
            }
            
            // Parse navigation context
            this.navigationContext = getNavigationContext();
            this.backNavigation = getBackNavigationInfo();
            
            // Subscribe to state changes
            this.unsubscribe = learnState.subscribe(() => this.updateCompletionState());
            
            // Render
            this.render();
            
            this.initialized = true;
            return true;
            
        } catch (error) {
            console.error('TutorialDetailPage: Initialization failed', error);
            this.error = 'initialization_failed';
            this.renderError('Failed to Load Tutorial', 'There was an error loading this tutorial.');
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
            // Try alternate path
            try {
                const altResponse = await fetch('./data/learn/tutorials.json');
                if (altResponse.ok) {
                    this.tutorials = await altResponse.json();
                    this.tutorials.sort((a, b) => a.order - b.order);
                    return;
                }
            } catch {
                // Ignore
            }
            
            this.tutorials = [];
            throw error;
        }
    }

    /**
     * Render the page
     */
    render() {
        if (!this.container || !this.tutorial) return;
        
        this.container.innerHTML = '';
        this.container.className = 'tutorial-detail-page max-w-6xl mx-auto p-6';
        
        // Back navigation
        this.renderBackNavigation();
        
        // Header section
        this.renderHeader();
        
        // 2-column layout for content
        this.render2ColumnLayout();
        
        // Related game events
        this.renderRelatedGameEvents();
        
        // Footer actions
        this.renderFooterActions();
    }

    /**
     * Render 2-column layout with vertical nav and content panel
     */
    render2ColumnLayout() {
        const layoutContainer = document.createElement('div');
        layoutContainer.className = 'flex flex-col md:flex-row gap-6 mb-8';
        
        // Left column: Vertical navigation (fixed width on desktop)
        const navWrapper = document.createElement('div');
        navWrapper.className = 'w-full md:w-72 flex-shrink-0';
        
        this.verticalNav = new VerticalTabNav({
            activeSection: this.activeSection,
            onSelect: (sectionId) => this.handleSectionChange(sectionId)
        });
        navWrapper.appendChild(this.verticalNav.render());
        layoutContainer.appendChild(navWrapper);
        
        // Right column: Content panel (flexible width)
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'flex-1 min-w-0';
        
        this.contentPanel = new TutorialContentPanel({
            activeSection: this.activeSection,
            tutorialData: this.tutorial
        });
        contentWrapper.appendChild(this.contentPanel.render());
        layoutContainer.appendChild(contentWrapper);
        
        this.container.appendChild(layoutContainer);
    }

    /**
     * Handle section change from vertical nav
     * @param {string} sectionId - Section identifier
     */
    handleSectionChange(sectionId) {
        this.activeSection = sectionId;
        
        // Update the content panel
        if (this.contentPanel) {
            this.contentPanel.setActiveSection(sectionId);
        }
    }

    /**
     * Render back navigation
     */
    renderBackNavigation() {
        const backNav = document.createElement('div');
        backNav.className = 'mb-4';
        
        const backLink = document.createElement('a');
        backLink.className = 'inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors';
        
        if (this.backNavigation?.shouldShowBackToMapping) {
            backLink.href = this.backNavigation.backUrl;
            backLink.innerHTML = `← Back to Failure Explanation`;
        } else {
            backLink.href = '/public/learn.html';
            backLink.innerHTML = `← Back to Learn Mode`;
        }
        
        backNav.appendChild(backLink);
        this.container.appendChild(backNav);
    }

    /**
     * Render header section
     */
    renderHeader() {
        const headerSection = document.createElement('div');
        headerSection.className = 'mb-6';
        
        // Status badge
        const status = learnState.getTutorialStatus(this.conceptId);
        const statusBadge = new TagBadge({
            text: status === 'completed' ? '✅ Completed' : '▶ In Progress',
            variant: status === 'completed' ? 'success' : 'default'
        });
        
        const header = new SectionHeader({
            title: this.tutorial.title,
            subtitle: this.tutorial.description,
            rightAction: statusBadge.render()
        });
        
        headerSection.appendChild(header.render());
        
        // Meta info
        const metaRow = document.createElement('div');
        metaRow.className = 'flex items-center gap-4 mt-3';
        
        const difficultyBadge = new TagBadge({
            text: this.tutorial.difficulty.charAt(0).toUpperCase() + this.tutorial.difficulty.slice(1),
            variant: this.tutorial.difficulty === 'beginner' ? 'success' : 'warning'
        });
        metaRow.appendChild(difficultyBadge.render());
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'text-sm text-gray-500';
        timeSpan.textContent = `⏱️ ${this.tutorial.estimatedTimeMinutes} min`;
        metaRow.appendChild(timeSpan);
        
        const orderSpan = document.createElement('span');
        orderSpan.className = 'text-sm text-gray-500';
        const completedCount = this.tutorials.filter(t => learnState.isCompleted(t.id)).length;
        orderSpan.textContent = `📖 Tutorial ${this.tutorial.order} of ${this.tutorials.length} • ${completedCount} completed`;
        metaRow.appendChild(orderSpan);
        
        headerSection.appendChild(metaRow);
        this.container.appendChild(headerSection);
    }

    /**
     * Render related game events panel
     */
    renderRelatedGameEvents() {
        if (!this.tutorial.relatedGameEvents?.length) return;
        
        const section = document.createElement('div');
        section.className = 'glass-panel rounded-xl p-4 mb-6';
        
        const header = document.createElement('h3');
        header.className = 'text-lg font-semibold text-white mb-3';
        header.textContent = '🎮 Related Game Events';
        section.appendChild(header);
        
        const description = document.createElement('p');
        description.className = 'text-sm text-gray-400 mb-4';
        description.textContent = 'See how this concept connects to events you might experience in the game:';
        section.appendChild(description);
        
        const eventList = document.createElement('div');
        eventList.className = 'space-y-2';
        
        this.tutorial.relatedGameEvents.forEach(eventId => {
            const eventLink = document.createElement('a');
            eventLink.href = goToMapping({ event: eventId });
            eventLink.className = 'flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors';
            
            const eventName = eventId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            
            eventLink.innerHTML = `
                <span class="text-sm text-gray-300">${eventName}</span>
                <span class="text-xs text-cyan-400">View in Mapping Hub →</span>
            `;
            
            eventList.appendChild(eventLink);
        });
        
        section.appendChild(eventList);
        this.container.appendChild(section);
    }

    /**
     * Render footer actions
     */
    renderFooterActions() {
        const footer = document.createElement('div');
        footer.className = 'tutorial-footer border-t border-gray-700 pt-6 mt-6';
        
        const isCompleted = learnState.isCompleted(this.conceptId);
        
        // Navigation row
        const navRow = document.createElement('div');
        navRow.className = 'flex justify-between items-center mb-6';
        
        // Previous tutorial
        const prevTutorial = this.tutorials.find(t => t.order === this.tutorial.order - 1);
        const prevContainer = document.createElement('div');
        if (prevTutorial) {
            if (learnState.isUnlocked(prevTutorial.id)) {
                const prevLink = document.createElement('a');
                prevLink.href = goToLearn(prevTutorial.id);
                prevLink.className = 'inline-flex items-center gap-1 text-sm text-gray-400 hover:text-cyan-400 transition-colors';
                prevLink.innerHTML = `← <span class="hidden sm:inline">Previous:</span> ${prevTutorial.title}`;
                prevContainer.appendChild(prevLink);
            } else {
                const lockedPrev = document.createElement('span');
                lockedPrev.className = 'text-sm text-gray-600 cursor-not-allowed';
                lockedPrev.innerHTML = `🔒 ${prevTutorial.title}`;
                prevContainer.appendChild(lockedPrev);
            }
        }
        navRow.appendChild(prevContainer);
        
        // Next tutorial
        const nextTutorial = this.tutorials.find(t => t.order === this.tutorial.order + 1);
        const nextContainer = document.createElement('div');
        nextContainer.className = 'text-right';
        
        if (nextTutorial) {
            if (learnState.isUnlocked(nextTutorial.id)) {
                const nextLink = document.createElement('a');
                nextLink.href = goToLearn(nextTutorial.id);
                nextLink.className = 'inline-flex items-center gap-1 text-sm text-gray-400 hover:text-cyan-400 transition-colors';
                nextLink.innerHTML = `<span class="hidden sm:inline">Next:</span> ${nextTutorial.title} →`;
                nextContainer.appendChild(nextLink);
            } else {
                const lockedNext = document.createElement('span');
                lockedNext.className = 'text-sm text-gray-600 cursor-not-allowed';
                lockedNext.innerHTML = `🔒 ${nextTutorial.title}`;
                lockedNext.title = 'Complete this tutorial to unlock';
                nextContainer.appendChild(lockedNext);
            }
        }
        
        navRow.appendChild(nextContainer);
        
        footer.appendChild(navRow);
        
        // Completion button
        const completionRow = document.createElement('div');
        completionRow.className = 'flex justify-center';
        completionRow.id = 'completion-button-container';
        
        const completionButton = document.createElement('button');
        completionButton.id = 'completion-button';
        completionButton.className = `px-6 py-3 rounded-lg font-medium transition-colors ${
            isCompleted 
                ? 'bg-green-700 text-white cursor-default' 
                : 'bg-cyan-600 text-white hover:bg-cyan-500'
        }`;
        completionButton.textContent = isCompleted ? '✅ Tutorial Completed' : '✓ Mark as Completed';
        completionButton.disabled = isCompleted;
        
        if (!isCompleted) {
            completionButton.addEventListener('click', () => this.handleComplete());
        }
        
        completionRow.appendChild(completionButton);
        footer.appendChild(completionRow);
        
        // Unlocks info
        if (!isCompleted && this.tutorial.unlocks?.length > 0) {
            const unlocksInfo = document.createElement('p');
            unlocksInfo.className = 'text-center text-xs text-gray-500 mt-3';
            const unlockNames = this.tutorial.unlocks
                .map(id => this.tutorials.find(t => t.id === id)?.title || id)
                .join(', ');
            unlocksInfo.textContent = `Completing this will unlock: ${unlockNames}`;
            footer.appendChild(unlocksInfo);
        }
        
        this.container.appendChild(footer);
    }

    /**
     * Handle tutorial completion
     */
    handleComplete() {
        learnState.completeTutorial(this.conceptId);
        this.updateCompletionState();
        
        // Show success message
        this.showCompletionMessage();
    }

    /**
     * Update completion state in UI
     */
    updateCompletionState() {
        const button = this.container?.querySelector('#completion-button');
        if (button && learnState.isCompleted(this.conceptId)) {
            button.textContent = '✅ Tutorial Completed';
            button.className = 'px-6 py-3 rounded-lg font-medium bg-green-700 text-white cursor-default';
            button.disabled = true;
        }
    }

    /**
     * Show completion success message
     */
    showCompletionMessage() {
        const container = this.container?.querySelector('#completion-button-container');
        if (!container) return;
        
        const message = document.createElement('div');
        message.className = 'mt-4 p-3 bg-green-900/50 border border-green-700 rounded-lg text-center text-sm text-green-300';
        
        const nextTutorial = this.tutorials.find(t => t.order === this.tutorial.order + 1);
        if (nextTutorial) {
            message.innerHTML = `
                🎉 Great job! You've completed this tutorial.
                <a href="${goToLearn(nextTutorial.id)}" class="block mt-2 text-cyan-400 hover:underline">
                    Continue to: ${nextTutorial.title} →
                </a>
            `;
        } else {
            message.innerHTML = `
                🎉 Congratulations! You've completed all tutorials!
                <a href="${goToMapping()}" class="block mt-2 text-cyan-400 hover:underline">
                    Explore the Mapping Hub →
                </a>
            `;
        }
        
        container.appendChild(message);
    }

    /**
     * Render error state
     * @param {string} title - Error title
     * @param {string} description - Error description
     */
    renderError(title, description) {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.container.className = 'tutorial-detail-page max-w-4xl mx-auto p-6';
        
        const backNav = document.createElement('div');
        backNav.className = 'mb-6';
        const backLink = document.createElement('a');
        backLink.href = '/public/learn.html';
        backLink.className = 'text-sm text-gray-400 hover:text-cyan-400';
        backLink.textContent = '← Back to Learn Mode';
        backNav.appendChild(backLink);
        this.container.appendChild(backNav);
        
        const emptyState = new EmptyState({
            title,
            description
        });
        
        const emptyEl = emptyState.render();
        emptyEl.querySelector('.empty-state-icon').textContent = '❌';
        
        this.container.appendChild(emptyEl);
    }

    /**
     * Render locked tutorial state
     */
    renderLockedState() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.container.className = 'tutorial-detail-page max-w-4xl mx-auto p-6';
        
        const backNav = document.createElement('div');
        backNav.className = 'mb-6';
        const backLink = document.createElement('a');
        backLink.href = '/public/learn.html';
        backLink.className = 'text-sm text-gray-400 hover:text-cyan-400';
        backLink.textContent = '← Back to Learn Mode';
        backNav.appendChild(backLink);
        this.container.appendChild(backNav);
        
        const emptyState = new EmptyState({
            title: '🔒 Tutorial Locked',
            description: 'Complete the previous tutorials to unlock this content.'
        });
        
        // Add button to go back
        const actionButton = document.createElement('a');
        actionButton.href = '/public/learn.html';
        actionButton.className = 'inline-block px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors';
        actionButton.textContent = 'View All Tutorials';
        
        const emptyEl = emptyState.render();
        emptyEl.appendChild(actionButton);
        
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
        
        // Cleanup component references
        this.verticalNav = null;
        this.contentPanel = null;
        this.activeSection = 'overview';
        
        this.initialized = false;
    }
}

// Export
export { TutorialDetailPage };
export default TutorialDetailPage;
