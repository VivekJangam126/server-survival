/**
 * TutorialContentPanel - Right content panel for tutorial sections
 * Renders content based on active section selection
 * 
 * @example
 * const panel = new TutorialContentPanel({
 *   activeSection: 'overview',
 *   tutorialData: { title: 'Load Balancer', description: '...' }
 * });
 * container.appendChild(panel.render());
 */

import { InfoPanel } from './InfoPanel.js';
import { VideoCard } from './VideoCard.js';
import { EmptyState } from './EmptyState.js';

/**
 * @typedef {Object} TutorialContentPanelProps
 * @property {string} activeSection - Currently active section key
 * @property {Object} tutorialData - Tutorial data object
 */

class TutorialContentPanel {
    /**
     * Create a TutorialContentPanel component
     * @param {TutorialContentPanelProps} props - Component properties
     */
    constructor(props = {}) {
        this.props = {
            activeSection: props.activeSection || 'overview',
            tutorialData: props.tutorialData || {}
        };
        
        this.element = null;
        this.contentContainer = null;
    }

    /**
     * Update active section and re-render content
     * @param {string} section - New active section
     */
    setActiveSection(section) {
        this.props.activeSection = section;
        this.renderContent();
    }

    /**
     * Get section title
     * @returns {string} Section title with icon
     */
    getSectionTitle() {
        const titles = {
            overview: '📌 Concept Overview',
            why: '❓ Why It Matters',
            game: '🎮 Game Connection',
            realworld: '🌍 Real-World Application',
            videos: '🎥 Video Learning',
            takeaways: '💡 Key Takeaways'
        };
        return titles[this.props.activeSection] || 'Content';
    }

    /**
     * Render content for the active section
     */
    renderContent() {
        if (!this.contentContainer) return;
        
        this.contentContainer.innerHTML = '';
        
        // Section header
        const header = document.createElement('h2');
        header.className = 'text-xl font-bold text-gray-100 mb-4 pb-3 border-b border-gray-700';
        header.textContent = this.getSectionTitle();
        this.contentContainer.appendChild(header);
        
        // Section content
        let content;
        switch (this.props.activeSection) {
            case 'overview':
                content = this.renderOverview();
                break;
            case 'why':
                content = this.renderWhyItMatters();
                break;
            case 'game':
                content = this.renderGameConnection();
                break;
            case 'realworld':
                content = this.renderRealWorld();
                break;
            case 'videos':
                content = this.renderVideos();
                break;
            case 'takeaways':
                content = this.renderTakeaways();
                break;
            default:
                content = this.renderOverview();
        }
        
        if (content) {
            this.contentContainer.appendChild(content);
        }
    }

    /**
     * Render overview section
     * @returns {HTMLElement} Content element
     */
    renderOverview() {
        const content = document.createElement('div');
        content.className = 'space-y-4';
        
        const overviewPanel = new InfoPanel({
            label: 'What You Will Learn',
            content: this.props.tutorialData.description || 'No description available.'
        });
        content.appendChild(overviewPanel.render());
        
        const detailsText = document.createElement('p');
        detailsText.className = 'text-sm text-gray-400 leading-relaxed';
        detailsText.textContent = `This tutorial covers the fundamentals of ${(this.props.tutorialData.title || 'this concept').toLowerCase()}. You'll understand how this concept applies in cloud architecture and how it affects system reliability.`;
        content.appendChild(detailsText);
        
        // Difficulty and time
        const metaInfo = document.createElement('div');
        metaInfo.className = 'flex flex-wrap gap-4 mt-4 p-4 bg-gray-800/50 rounded-lg';
        
        const difficulty = this.props.tutorialData.difficulty || 'beginner';
        const time = this.props.tutorialData.estimatedTimeMinutes || 10;
        
        metaInfo.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-gray-500">Difficulty:</span>
                <span class="px-2 py-0.5 rounded text-xs font-medium ${
                    difficulty === 'beginner' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                }">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-gray-500">Estimated Time:</span>
                <span class="text-gray-300">${time} minutes</span>
            </div>
        `;
        content.appendChild(metaInfo);
        
        return content;
    }

    /**
     * Render why it matters section
     * @returns {HTMLElement} Content element
     */
    renderWhyItMatters() {
        const content = document.createElement('div');
        content.className = 'space-y-4';
        
        const topicName = (this.props.tutorialData.title?.split('&')[0]?.trim() || 'this concept').toLowerCase();
        
        const importancePanel = new InfoPanel({
            label: 'Importance',
            content: `Understanding ${topicName} is crucial for building resilient systems. Without this knowledge, systems are more likely to fail under stress.`
        });
        content.appendChild(importancePanel.render());
        
        const impactPanel = new InfoPanel({
            label: 'Impact on Your Systems',
            content: 'Mastering this concept will help you prevent common failure patterns and design more robust architectures.'
        });
        content.appendChild(impactPanel.render());
        
        // Consequences list
        const consequencesSection = document.createElement('div');
        consequencesSection.className = 'mt-4 p-4 bg-red-900/20 rounded-lg border border-red-800/30';
        consequencesSection.innerHTML = `
            <h4 class="text-sm font-semibold text-red-400 mb-2">⚠️ What Happens Without It</h4>
            <ul class="space-y-2 text-sm text-gray-300">
                <li class="flex items-start gap-2">
                    <span class="text-red-400">✗</span>
                    <span>System becomes vulnerable to failures</span>
                </li>
                <li class="flex items-start gap-2">
                    <span class="text-red-400">✗</span>
                    <span>Harder to scale as traffic grows</span>
                </li>
                <li class="flex items-start gap-2">
                    <span class="text-red-400">✗</span>
                    <span>Higher costs due to inefficient resource usage</span>
                </li>
            </ul>
        `;
        content.appendChild(consequencesSection);
        
        return content;
    }

    /**
     * Render game connection section
     * @returns {HTMLElement} Content element
     */
    renderGameConnection() {
        const content = document.createElement('div');
        content.className = 'space-y-4';
        
        const connectionPanel = new InfoPanel({
            label: 'In The Game',
            content: 'This concept directly affects how your system handles traffic and maintains stability during gameplay.'
        });
        content.appendChild(connectionPanel.render());
        
        // Related failure nodes
        if (this.props.tutorialData.relatedFailureNodes?.length) {
            const failureSection = document.createElement('div');
            failureSection.className = 'mt-4 p-4 bg-gray-800/50 rounded-lg';
            failureSection.innerHTML = `
                <h4 class="text-sm font-semibold text-gray-300 mb-3">Related Failure Points</h4>
                <div class="flex flex-wrap gap-2">
                    ${this.props.tutorialData.relatedFailureNodes.map(node => `
                        <span class="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded border border-red-800/30">
                            ${node.replace(/_/g, ' ')}
                        </span>
                    `).join('')}
                </div>
            `;
            content.appendChild(failureSection);
        }
        
        // Game tips
        const tipsSection = document.createElement('div');
        tipsSection.className = 'mt-4 p-4 bg-cyan-900/20 rounded-lg border border-cyan-800/30';
        tipsSection.innerHTML = `
            <h4 class="text-sm font-semibold text-cyan-400 mb-2">💡 Game Tips</h4>
            <ul class="space-y-2 text-sm text-gray-300">
                <li class="flex items-start gap-2">
                    <span class="text-cyan-400">→</span>
                    <span>Watch for this pattern when traffic increases</span>
                </li>
                <li class="flex items-start gap-2">
                    <span class="text-cyan-400">→</span>
                    <span>Apply this concept early in the game for better scores</span>
                </li>
                <li class="flex items-start gap-2">
                    <span class="text-cyan-400">→</span>
                    <span>Combine with related concepts for maximum effect</span>
                </li>
            </ul>
        `;
        content.appendChild(tipsSection);
        
        return content;
    }

    /**
     * Render real-world section
     * @returns {HTMLElement} Content element
     */
    renderRealWorld() {
        const content = document.createElement('div');
        content.className = 'space-y-4';
        
        const realWorldPanel = new InfoPanel({
            label: 'Production Usage',
            content: 'This pattern is used extensively in cloud infrastructure. Major tech companies rely on this to handle millions of requests.'
        });
        content.appendChild(realWorldPanel.render());
        
        const examplesPanel = new InfoPanel({
            label: 'Real Examples',
            content: 'Large-scale web applications, e-commerce platforms, and streaming services all rely on these architectural patterns.'
        });
        content.appendChild(examplesPanel.render());
        
        // AWS/Cloud services
        const servicesSection = document.createElement('div');
        servicesSection.className = 'mt-4 p-4 bg-gray-800/50 rounded-lg';
        servicesSection.innerHTML = `
            <h4 class="text-sm font-semibold text-gray-300 mb-3">🔧 Related Cloud Services</h4>
            <div class="grid grid-cols-2 gap-3">
                <div class="p-2 bg-gray-700/50 rounded text-sm">
                    <span class="text-orange-400">AWS:</span>
                    <span class="text-gray-300 ml-1">ELB, Auto Scaling</span>
                </div>
                <div class="p-2 bg-gray-700/50 rounded text-sm">
                    <span class="text-blue-400">Azure:</span>
                    <span class="text-gray-300 ml-1">Load Balancer, VMSS</span>
                </div>
                <div class="p-2 bg-gray-700/50 rounded text-sm">
                    <span class="text-red-400">GCP:</span>
                    <span class="text-gray-300 ml-1">Cloud Load Balancing</span>
                </div>
                <div class="p-2 bg-gray-700/50 rounded text-sm">
                    <span class="text-purple-400">K8s:</span>
                    <span class="text-gray-300 ml-1">HPA, Ingress</span>
                </div>
            </div>
        `;
        content.appendChild(servicesSection);
        
        return content;
    }

    /**
     * Render videos section
     * @returns {HTMLElement} Content element
     */
    renderVideos() {
        const content = document.createElement('div');
        content.className = 'space-y-4';
        
        const videos = this.props.tutorialData.videos;
        
        if (!videos || videos.length === 0) {
            const emptyState = new EmptyState({
                title: 'No Videos Available',
                description: 'No videos available for this topic yet.'
            });
            const emptyEl = emptyState.render();
            emptyEl.querySelector('.empty-state-icon').textContent = '📹';
            content.appendChild(emptyEl);
            return content;
        }
        
        const intro = document.createElement('p');
        intro.className = 'text-sm text-gray-400 mb-4';
        intro.textContent = 'Watch these curated videos to deepen your understanding of this concept.';
        content.appendChild(intro);
        
        // Video grid
        const videoGrid = document.createElement('div');
        videoGrid.className = 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4';
        
        videos.forEach(video => {
            const videoCard = new VideoCard({
                title: video.title,
                type: video.type,
                youtubeId: video.youtubeId,
                duration: video.duration
            });
            videoGrid.appendChild(videoCard.render());
        });
        
        content.appendChild(videoGrid);
        
        return content;
    }

    /**
     * Render takeaways section
     * @returns {HTMLElement} Content element
     */
    renderTakeaways() {
        const content = document.createElement('div');
        content.className = 'space-y-4';
        
        const topicName = (this.props.tutorialData.title?.split('&')[0]?.trim() || 'this concept').toLowerCase();
        
        const takeaways = [
            `Understand the core principles of ${topicName}`,
            'Recognize when to apply this concept in your architecture',
            'Avoid common mistakes related to this pattern',
            'Connect game events to real-world scenarios'
        ];
        
        const takeawaysList = document.createElement('ul');
        takeawaysList.className = 'space-y-3';
        
        takeaways.forEach(takeaway => {
            const li = document.createElement('li');
            li.className = 'flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg';
            li.innerHTML = `
                <span class="text-green-400 text-lg">✓</span>
                <span class="text-gray-300">${takeaway}</span>
            `;
            takeawaysList.appendChild(li);
        });
        
        content.appendChild(takeawaysList);
        
        // Next steps
        if (this.props.tutorialData.unlocks?.length) {
            const nextSection = document.createElement('div');
            nextSection.className = 'mt-6 p-4 bg-cyan-900/20 rounded-lg border border-cyan-800/30';
            nextSection.innerHTML = `
                <h4 class="text-sm font-semibold text-cyan-400 mb-2">🚀 What's Next</h4>
                <p class="text-sm text-gray-400">
                    Completing this tutorial will unlock: 
                    <span class="text-gray-200">${this.props.tutorialData.unlocks.map(u => u.replace(/_/g, ' ')).join(', ')}</span>
                </p>
            `;
            content.appendChild(nextSection);
        }
        
        return content;
    }

    /**
     * Render the component
     * @returns {HTMLElement} The rendered element
     */
    render() {
        const panel = document.createElement('div');
        panel.className = 'tutorial-content-panel bg-gray-900/50 rounded-xl p-6 min-h-[400px]';
        
        // Content container
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'content-container';
        panel.appendChild(this.contentContainer);
        
        // Initial render
        this.renderContent();
        
        this.element = panel;
        return panel;
    }

    /**
     * Cleanup component
     */
    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
            this.contentContainer = null;
        }
    }
}

export { TutorialContentPanel };
export default TutorialContentPanel;
