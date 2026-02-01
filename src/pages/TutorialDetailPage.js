/**
 * TutorialDetailPage - Tutorial Detail Page with UI
 * Displays full tutorial content with navigation context and completion
 */

import { SectionHeader } from '../components/ui/SectionHeader.js';
import { ExpandableCard } from '../components/ui/ExpandableCard.js';
import { InfoPanel } from '../components/ui/InfoPanel.js';
import { TagBadge } from '../components/ui/TagBadge.js';
import { LearnLink } from '../components/ui/LearnLink.js';
import { EmptyState } from '../components/ui/EmptyState.js';
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
            
            // Initialize learn state
            learnState.initialize(this.tutorials);
            
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
        this.container.className = 'tutorial-detail-page max-w-4xl mx-auto p-6';
        
        // Back navigation
        this.renderBackNavigation();
        
        // Header section
        this.renderHeader();
        
        // Tutorial content sections
        this.renderContentSections();
        
        // Related game events
        this.renderRelatedGameEvents();
        
        // Footer actions
        this.renderFooterActions();
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
            backLink.href = '/learn';
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
        orderSpan.textContent = `📖 Tutorial ${this.tutorial.order} of ${this.tutorials.length}`;
        metaRow.appendChild(orderSpan);
        
        headerSection.appendChild(metaRow);
        this.container.appendChild(headerSection);
    }

    /**
     * Render content sections
     */
    renderContentSections() {
        const contentSection = document.createElement('div');
        contentSection.className = 'tutorial-content space-y-4 mb-6';
        
        // Concept Overview
        const overviewCard = new ExpandableCard({
            title: '📌 Concept Overview',
            initiallyOpen: true,
            children: this.createConceptOverview()
        });
        contentSection.appendChild(overviewCard.render());
        
        // Why It Matters
        const whyCard = new ExpandableCard({
            title: '❓ Why It Matters',
            initiallyOpen: true,
            children: this.createWhyItMatters()
        });
        contentSection.appendChild(whyCard.render());
        
        // Game Connection
        const gameCard = new ExpandableCard({
            title: '🎮 Game Connection',
            initiallyOpen: false,
            children: this.createGameConnection()
        });
        contentSection.appendChild(gameCard.render());
        
        // Real-World Mapping
        const realWorldCard = new ExpandableCard({
            title: '🌍 Real-World Application',
            initiallyOpen: false,
            children: this.createRealWorldMapping()
        });
        contentSection.appendChild(realWorldCard.render());
        
        // Key Takeaways
        const takeawaysCard = new ExpandableCard({
            title: '💡 Key Takeaways',
            initiallyOpen: true,
            children: this.createKeyTakeaways()
        });
        contentSection.appendChild(takeawaysCard.render());
        
        this.container.appendChild(contentSection);
    }

    /**
     * Create concept overview content
     * @returns {HTMLElement} Content element
     */
    createConceptOverview() {
        const content = document.createElement('div');
        content.className = 'space-y-3';
        
        const overviewPanel = new InfoPanel({
            label: 'What You Will Learn',
            content: this.tutorial.description
        });
        content.appendChild(overviewPanel.render());
        
        // Placeholder for detailed content
        const detailsText = document.createElement('p');
        detailsText.className = 'text-sm text-gray-400 leading-relaxed';
        detailsText.textContent = `This tutorial covers the fundamentals of ${this.tutorial.title.toLowerCase()}. You'll understand how this concept applies in cloud architecture and how it affects system reliability.`;
        content.appendChild(detailsText);
        
        return content;
    }

    /**
     * Create why it matters content
     * @returns {HTMLElement} Content element
     */
    createWhyItMatters() {
        const content = document.createElement('div');
        content.className = 'space-y-3';
        
        const whyPanel = new InfoPanel({
            label: 'Importance',
            content: `Understanding ${this.tutorial.title.split('&')[0].trim().toLowerCase()} is crucial for building resilient systems. Without this knowledge, systems are more likely to fail under stress.`
        });
        content.appendChild(whyPanel.render());
        
        const impactPanel = new InfoPanel({
            label: 'Impact',
            content: 'Mastering this concept will help you prevent common failure patterns and design more robust architectures.'
        });
        content.appendChild(impactPanel.render());
        
        return content;
    }

    /**
     * Create game connection content
     * @returns {HTMLElement} Content element
     */
    createGameConnection() {
        const content = document.createElement('div');
        content.className = 'space-y-3';
        
        const connectionPanel = new InfoPanel({
            label: 'In The Game',
            content: 'This concept directly affects how your system handles traffic and maintains stability during gameplay.'
        });
        content.appendChild(connectionPanel.render());
        
        // Related failure nodes
        if (this.tutorial.relatedFailureNodes?.length > 0) {
            const nodesPanel = new InfoPanel({
                label: 'Related Failure Points',
                content: this.tutorial.relatedFailureNodes.join(', ').replace(/_/g, ' ')
            });
            content.appendChild(nodesPanel.render());
        }
        
        return content;
    }

    /**
     * Create real-world mapping content
     * @returns {HTMLElement} Content element
     */
    createRealWorldMapping() {
        const content = document.createElement('div');
        content.className = 'space-y-3';
        
        const realWorldPanel = new InfoPanel({
            label: 'Real-World Equivalent',
            content: 'In production cloud environments, these concepts are implemented using services from major cloud providers like AWS, Azure, and GCP.'
        });
        content.appendChild(realWorldPanel.render());
        
        const examplesPanel = new InfoPanel({
            label: 'Examples',
            content: 'Large-scale web applications, e-commerce platforms, and streaming services all rely on these architectural patterns.'
        });
        content.appendChild(examplesPanel.render());
        
        return content;
    }

    /**
     * Create key takeaways content
     * @returns {HTMLElement} Content element
     */
    createKeyTakeaways() {
        const content = document.createElement('div');
        
        const takeawaysList = document.createElement('ul');
        takeawaysList.className = 'space-y-2 text-sm text-gray-300';
        
        const takeaways = [
            `Understand the core principles of ${this.tutorial.title.split('&')[0].trim().toLowerCase()}`,
            'Recognize when to apply this concept in your architecture',
            'Avoid common mistakes related to this pattern',
            'Connect game events to real-world scenarios'
        ];
        
        takeaways.forEach(takeaway => {
            const li = document.createElement('li');
            li.className = 'flex items-start gap-2';
            li.innerHTML = `<span class="text-green-400">✓</span> <span>${takeaway}</span>`;
            takeawaysList.appendChild(li);
        });
        
        content.appendChild(takeawaysList);
        
        return content;
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
        if (prevTutorial && learnState.isUnlocked(prevTutorial.id)) {
            const prevLink = document.createElement('a');
            prevLink.href = goToLearn(prevTutorial.id);
            prevLink.className = 'text-sm text-gray-400 hover:text-cyan-400 transition-colors';
            prevLink.innerHTML = `← Previous: ${prevTutorial.title}`;
            navRow.appendChild(prevLink);
        } else {
            navRow.appendChild(document.createElement('div')); // Spacer
        }
        
        // Next tutorial
        const nextTutorial = this.tutorials.find(t => t.order === this.tutorial.order + 1);
        if (nextTutorial) {
            const nextContainer = document.createElement('div');
            nextContainer.className = 'text-right';
            
            if (learnState.isUnlocked(nextTutorial.id)) {
                const nextLink = document.createElement('a');
                nextLink.href = goToLearn(nextTutorial.id);
                nextLink.className = 'text-sm text-gray-400 hover:text-cyan-400 transition-colors';
                nextLink.innerHTML = `Next: ${nextTutorial.title} →`;
                nextContainer.appendChild(nextLink);
            } else {
                const lockedText = document.createElement('span');
                lockedText.className = 'text-sm text-gray-600';
                lockedText.innerHTML = `🔒 Next: ${nextTutorial.title}`;
                nextContainer.appendChild(lockedText);
            }
            
            navRow.appendChild(nextContainer);
        }
        
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
        backLink.href = '/learn';
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
        backLink.href = '/learn';
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
        actionButton.href = '/learn';
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
        this.initialized = false;
    }
}

// Export
export { TutorialDetailPage };
export default TutorialDetailPage;
