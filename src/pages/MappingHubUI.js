/**
 * MappingHubUI - UI Layer for Game → Real-World Mapping Hub
 * Assembles UI using components from Phase 3 and data from Phase 1
 * 
 * Route: /learn/mapping
 * 
 * FEATURE COMPLETE — DO NOT EXTEND IN MVP
 * 
 * Sections:
 * 1. Common Game Events
 * 2. Failure Chain Explorer
 * 3. Architecture Decision Analyzer
 * 4. Game ↔ Cloud Service Mapping
 * 5. "Why Did I Lose?" Debug Mode (MVP)
 */

import { mappingHubPage } from './MappingHubPage.js';
import {
    SectionHeader,
    ExpandableCard,
    TagBadge,
    LearnLink,
    createLearnLinkGroup,
    EmptyState
} from '../components/ui/index.js';
import { goToLearnIndex, NAV_SOURCES, getNavigationContext } from '../utils/navigation.js';

/**
 * Static Game ↔ Cloud Service Mapping Data
 */
const CLOUD_SERVICE_MAPPING = [
    {
        id: 'compute',
        gameElement: 'Server Instances',
        cloudConcept: 'Stateless Compute',
        description: 'Game servers represent stateless compute instances that can be scaled horizontally',
        learnLink: 'auto_scaling'
    },
    {
        id: 'cache',
        gameElement: 'Fast Memory Store',
        cloudConcept: 'In-Memory Cache',
        description: 'Reduces database load by storing frequently accessed data in fast memory',
        learnLink: 'cache'
    },
    {
        id: 'queue',
        gameElement: 'Request Buffer',
        cloudConcept: 'Message Queue',
        description: 'Async buffer that absorbs traffic spikes and decouples producers from consumers',
        learnLink: 'queues'
    },
    {
        id: 'waf',
        gameElement: 'Security Shield',
        cloudConcept: 'Web Application Firewall',
        description: 'Filters malicious requests before they reach your servers',
        learnLink: 'waf'
    },
    {
        id: 'loadbalancer',
        gameElement: 'Traffic Distributor',
        cloudConcept: 'Load Balancer',
        description: 'Distributes incoming traffic across multiple server instances',
        learnLink: 'load_balancer'
    },
    {
        id: 'ratelimit',
        gameElement: 'Request Throttle',
        cloudConcept: 'Rate Limiting',
        description: 'Limits request rate per client to prevent abuse and ensure fair usage',
        learnLink: 'rate_limiting'
    }
];

/**
 * Severity to variant mapping for TagBadge
 */
const SEVERITY_VARIANTS = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
};

/**
 * MappingHubUI Class - UI Assembly Layer
 */
class MappingHubUI {
    constructor() {
        this.container = null;
        this.expandedCards = new Map(); // Track expanded cards for cleanup
        this.selectedEvent = null;
        this.selectedNode = null;
        this.debugOutput = null;
        
        // Bind methods
        this.handleEventClick = this.handleEventClick.bind(this);
        this.handleNodeClick = this.handleNodeClick.bind(this);
        this.handleAnalyzeClick = this.handleAnalyzeClick.bind(this);
    }

    /**
     * Initialize and render the Mapping Hub UI
     * @param {HTMLElement} container - Container element to render into
     * @returns {Promise<boolean>} True if render succeeded
     */
    async initialize(container) {
        if (!container) {
            console.error('MappingHubUI: Container is required');
            return false;
        }
        
        this.container = container;
        
        // Initialize the data layer
        const success = await mappingHubPage.initialize();
        
        if (!success) {
            this.renderError();
            return false;
        }
        
        // Render the full UI
        this.render();
        
        // Handle navigation context (auto-expand relevant sections)
        this.handleNavigationContext();
        
        return true;
    }

    /**
     * Handle navigation context from query params
     */
    handleNavigationContext() {
        const context = getNavigationContext();
        
        // Auto-expand event section if event param present
        if (context.event) {
            const eventCard = this.expandedCards.get(`event-${context.event}`);
            if (eventCard) {
                eventCard.open();
                this.selectedEvent = context.event;
            }
        }
        
        // Auto-expand chain section if chainId param present
        if (context.chainId) {
            const chainCard = this.expandedCards.get(`chain-${context.chainId}`);
            if (chainCard) {
                chainCard.open();
            }
        }
        
        // Auto-expand decision section if decisionId param present
        if (context.decisionId) {
            const decisionCard = this.expandedCards.get(`decision-${context.decisionId}`);
            if (decisionCard) {
                decisionCard.open();
            }
        }
    }

    /**
     * Render the full Mapping Hub page
     */
    render() {
        this.container.innerHTML = '';
        this.container.className = 'mapping-hub-page max-w-6xl mx-auto px-4 py-6 space-y-8';
        
        // Page Header
        this.renderPageHeader();
        
        // Section 1: Common Game Events
        this.renderGameEventsSection();
        
        // Section 2: Failure Chain Explorer
        this.renderFailureChainsSection();
        
        // Section 3: Architecture Decision Analyzer
        this.renderDecisionsSection();
        
        // Section 4: Game ↔ Cloud Service Mapping
        this.renderCloudMappingSection();
        
        // Section 5: Why Did I Lose? Debug Mode
        this.renderDebugSection();
    }

    /**
     * Render page header with back navigation
     */
    renderPageHeader() {
        const headerContainer = document.createElement('div');
        headerContainer.className = 'mb-6';
        
        // Back to Learn link
        const backLink = document.createElement('a');
        backLink.href = goToLearnIndex({ from: NAV_SOURCES.MAPPING });
        backLink.className = 'inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm mb-4';
        backLink.innerHTML = '← Back to Learn Mode';
        headerContainer.appendChild(backLink);
        
        // Page title
        const title = document.createElement('h1');
        title.className = 'text-2xl font-bold text-white mb-2';
        title.textContent = 'Game → Real-World Mapping Hub';
        headerContainer.appendChild(title);
        
        // Page description
        const description = document.createElement('p');
        description.className = 'text-gray-400 text-sm max-w-2xl leading-relaxed';
        description.textContent = 'Analyze what went wrong in your game. Each event maps to real cloud architecture concepts you can learn.';
        headerContainer.appendChild(description);
        
        this.container.appendChild(headerContainer);
    }

    /**
     * Section 1: Common Game Events
     */
    renderGameEventsSection() {
        const section = document.createElement('section');
        section.className = 'game-events-section';
        section.id = 'events-section';
        
        const header = new SectionHeader({
            title: 'Common Game Events',
            subtitle: 'Click an event to see what happened and how to prevent it'
        });
        section.appendChild(header.render());
        
        const state = mappingHubPage.getState();
        const events = state.gameEvents;
        
        if (!events || events.length === 0) {
            const empty = new EmptyState({
                title: 'No Game Events Available',
                description: 'Event data could not be loaded. Please try refreshing the page.'
            });
            section.appendChild(empty.render());
            this.container.appendChild(section);
            return;
        }
        
        // Grid of event cards
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
        
        events.forEach(event => {
            const card = this.createEventCard(event);
            grid.appendChild(card);
        });
        
        section.appendChild(grid);
        this.container.appendChild(section);
    }

    /**
     * Create an event card
     * @param {Object} event - Event data
     * @returns {HTMLElement} Event card element
     */
    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card glass-panel rounded-lg p-4 cursor-pointer hover:bg-gray-800/50 transition-colors';
        card.setAttribute('data-event-id', event.eventId);
        
        // Header with title and severity badge
        const cardHeader = document.createElement('div');
        cardHeader.className = 'flex justify-between items-start mb-2';
        
        const title = document.createElement('h3');
        title.className = 'text-white font-medium text-sm pr-2';
        title.textContent = event.title;
        cardHeader.appendChild(title);
        
        const severityBadge = new TagBadge({
            text: event.severity.toUpperCase(),
            variant: SEVERITY_VARIANTS[event.severity] || 'default'
        });
        cardHeader.appendChild(severityBadge.render());
        
        card.appendChild(cardHeader);
        
        // Short description
        const desc = document.createElement('p');
        desc.className = 'text-gray-400 text-xs mb-3 line-clamp-2';
        desc.textContent = event.shortDescription;
        card.appendChild(desc);
        
        // Click indicator
        const clickHint = document.createElement('span');
        clickHint.className = 'text-cyan-400 text-xs';
        clickHint.textContent = 'Click for details →';
        card.appendChild(clickHint);
        
        // Click handler
        card.addEventListener('click', () => this.handleEventClick(event));
        
        return card;
    }

    /**
     * Handle event card click - show detail modal/expandable
     * @param {Object} event - Event data
     */
    handleEventClick(event) {
        this.selectedEvent = event.eventId;
        this.showEventDetail(event);
    }

    /**
     * Show event detail panel
     * @param {Object} event - Event data
     */
    showEventDetail(event) {
        // Remove existing detail panel if any
        const existingDetail = document.querySelector('.event-detail-panel');
        if (existingDetail) {
            existingDetail.remove();
        }
        
        // Create detail panel
        const panel = document.createElement('div');
        panel.className = 'event-detail-panel fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4';
        
        const content = document.createElement('div');
        content.className = 'glass-panel rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto';
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'absolute top-4 right-4 text-gray-400 hover:text-white text-xl';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', () => panel.remove());
        
        // Header
        const header = document.createElement('div');
        header.className = 'flex justify-between items-start mb-4 pr-8';
        
        const title = document.createElement('h2');
        title.className = 'text-white font-bold text-lg';
        title.textContent = event.title;
        header.appendChild(title);
        
        const severityBadge = new TagBadge({
            text: event.severity.toUpperCase(),
            variant: SEVERITY_VARIANTS[event.severity] || 'default'
        });
        header.appendChild(severityBadge.render());
        
        content.appendChild(header);
        
        // What happened
        const whatSection = document.createElement('div');
        whatSection.className = 'mb-4';
        
        const whatLabel = document.createElement('h3');
        whatLabel.className = 'text-gray-300 font-medium text-sm mb-2';
        whatLabel.textContent = 'What Happened';
        whatSection.appendChild(whatLabel);
        
        const whatText = document.createElement('p');
        whatText.className = 'text-gray-400 text-sm';
        whatText.textContent = event.shortDescription;
        whatSection.appendChild(whatText);
        
        content.appendChild(whatSection);
        
        // Primary Concepts
        if (event.primaryConcepts?.length > 0) {
            const primarySection = document.createElement('div');
            primarySection.className = 'mb-4';
            
            const primaryLabel = document.createElement('h3');
            primaryLabel.className = 'text-gray-300 font-medium text-sm mb-2';
            primaryLabel.textContent = 'Primary Concepts';
            primarySection.appendChild(primaryLabel);
            
            const primaryBadges = document.createElement('div');
            primaryBadges.className = 'flex flex-wrap gap-2';
            
            event.primaryConcepts.forEach(concept => {
                const badge = new TagBadge({
                    text: this.formatConceptName(concept),
                    variant: 'danger'
                });
                primaryBadges.appendChild(badge.render());
            });
            
            primarySection.appendChild(primaryBadges);
            content.appendChild(primarySection);
        }
        
        // Secondary Concepts
        if (event.secondaryConcepts?.length > 0) {
            const secondarySection = document.createElement('div');
            secondarySection.className = 'mb-4';
            
            const secondaryLabel = document.createElement('h3');
            secondaryLabel.className = 'text-gray-300 font-medium text-sm mb-2';
            secondaryLabel.textContent = 'Secondary Concepts';
            secondarySection.appendChild(secondaryLabel);
            
            const secondaryBadges = document.createElement('div');
            secondaryBadges.className = 'flex flex-wrap gap-2';
            
            event.secondaryConcepts.forEach(concept => {
                const badge = new TagBadge({
                    text: this.formatConceptName(concept),
                    variant: 'warning'
                });
                secondaryBadges.appendChild(badge.render());
            });
            
            secondarySection.appendChild(secondaryBadges);
            content.appendChild(secondarySection);
        }
        
        // Fix Suggestions with Learn Links
        if (event.learnLinks?.length > 0) {
            const fixSection = document.createElement('div');
            fixSection.className = 'mb-2';
            
            const fixLabel = document.createElement('h3');
            fixLabel.className = 'text-gray-300 font-medium text-sm mb-2';
            fixLabel.textContent = 'Learn How to Fix This';
            fixSection.appendChild(fixLabel);
            
            const linkGroup = createLearnLinkGroup(
                event.learnLinks.map(conceptId => ({ conceptId })),
                { from: NAV_SOURCES.MAPPING, event: event.eventId }
            );
            fixSection.appendChild(linkGroup);
            
            content.appendChild(fixSection);
        }
        
        // Close button at bottom
        const closeBottomBtn = document.createElement('button');
        closeBottomBtn.className = 'mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm transition-colors';
        closeBottomBtn.textContent = 'Close';
        closeBottomBtn.addEventListener('click', () => panel.remove());
        content.appendChild(closeBottomBtn);
        
        content.style.position = 'relative';
        content.appendChild(closeBtn);
        panel.appendChild(content);
        
        // Close on backdrop click
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                panel.remove();
            }
        });
        
        // Close on ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                panel.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        document.body.appendChild(panel);
    }

    /**
     * Section 2: Failure Chain Explorer
     */
    renderFailureChainsSection() {
        const section = document.createElement('section');
        section.className = 'failure-chains-section';
        section.id = 'chains-section';
        
        const header = new SectionHeader({
            title: 'Failure Chain Explorer',
            subtitle: 'Trace cascading failures from root cause to final outcome'
        });
        section.appendChild(header.render());
        
        const state = mappingHubPage.getState();
        const chains = state.failureChains;
        
        if (!chains || chains.length === 0) {
            const empty = new EmptyState({
                title: 'No Failure Chains Available',
                description: 'Failure chain data could not be loaded.'
            });
            section.appendChild(empty.render());
            this.container.appendChild(section);
            return;
        }
        
        // Render each failure chain
        chains.forEach(chain => {
            const chainCard = this.createChainCard(chain);
            section.appendChild(chainCard);
        });
        
        this.container.appendChild(section);
    }

    /**
     * Create a failure chain card with expandable content
     * @param {Object} chain - Failure chain data
     * @returns {HTMLElement} Chain card element
     */
    createChainCard(chain) {
        const content = document.createElement('div');
        content.className = 'chain-content p-4';
        
        // Render chain nodes in order
        const nodesContainer = document.createElement('div');
        nodesContainer.className = 'chain-nodes space-y-4';
        
        const highlightedNodes = mappingHubPage.getHighlightedNodes();
        
        chain.nodes.forEach((node, index) => {
            const nodeElement = this.createChainNode(node, index, chain.nodes.length, highlightedNodes);
            nodesContainer.appendChild(nodeElement);
        });
        
        content.appendChild(nodesContainer);
        
        const card = new ExpandableCard({
            title: chain.title,
            initiallyOpen: false,
            children: content
        });
        
        // Store reference for context handling
        this.expandedCards.set(`chain-${chain.chainId}`, card);
        
        return card.render();
    }

    /**
     * Create a chain node element
     * @param {Object} node - Node data
     * @param {number} index - Node index
     * @param {number} total - Total nodes
     * @param {Array} highlightedNodes - Nodes to highlight
     * @returns {HTMLElement} Node element
     */
    createChainNode(node, index, total, highlightedNodes) {
        const isHighlighted = highlightedNodes.includes(node.nodeId);
        const isLast = index === total - 1;
        
        const nodeContainer = document.createElement('div');
        nodeContainer.className = 'chain-node relative';
        nodeContainer.setAttribute('data-node-id', node.nodeId);
        
        // Connection line (except for last node)
        if (!isLast) {
            const connector = document.createElement('div');
            connector.className = 'absolute left-4 top-8 w-0.5 h-full bg-gray-600';
            nodeContainer.appendChild(connector);
        }
        
        // Node content
        const nodeContent = document.createElement('div');
        nodeContent.className = `flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
            isHighlighted ? 'bg-cyan-900/30 border border-cyan-700' : 'hover:bg-gray-800/50'
        }`;
        
        // Node indicator
        const indicator = document.createElement('div');
        indicator.className = `w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            isHighlighted ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'
        }`;
        indicator.textContent = (index + 1).toString();
        nodeContent.appendChild(indicator);
        
        // Node details
        const details = document.createElement('div');
        details.className = 'flex-1';
        
        const nodeTitle = document.createElement('h4');
        nodeTitle.className = 'text-white font-medium text-sm mb-1';
        nodeTitle.textContent = node.title;
        details.appendChild(nodeTitle);
        
        // Causes
        if (node.causes?.length > 0) {
            const causesText = document.createElement('p');
            causesText.className = 'text-gray-400 text-xs mb-1';
            causesText.innerHTML = `<span class="text-gray-500">Causes:</span> ${node.causes.slice(0, 3).join(', ')}`;
            details.appendChild(causesText);
        }
        
        // Effects
        if (node.effects?.length > 0) {
            const effectsText = document.createElement('p');
            effectsText.className = 'text-gray-400 text-xs';
            effectsText.innerHTML = `<span class="text-gray-500">Effects:</span> ${node.effects.slice(0, 3).join(', ')}`;
            details.appendChild(effectsText);
        }
        
        nodeContent.appendChild(details);
        
        // Expand icon
        const expandIcon = document.createElement('span');
        expandIcon.className = 'text-gray-500 text-sm';
        expandIcon.textContent = '▶';
        nodeContent.appendChild(expandIcon);
        
        nodeContainer.appendChild(nodeContent);
        
        // Click handler to show node details
        nodeContent.addEventListener('click', () => this.handleNodeClick(node, nodeContainer, expandIcon));
        
        return nodeContainer;
    }

    /**
     * Handle node click - toggle detail panel
     * @param {Object} node - Node data
     * @param {HTMLElement} container - Node container element
     * @param {HTMLElement} expandIcon - Expand icon element
     */
    handleNodeClick(node, container, expandIcon) {
        // Toggle existing detail
        const existingDetail = container.querySelector('.node-detail-panel');
        if (existingDetail) {
            existingDetail.remove();
            expandIcon.textContent = '▶';
            this.selectedNode = null;
            return;
        }
        
        // Close any other open node details
        document.querySelectorAll('.node-detail-panel').forEach(el => el.remove());
        document.querySelectorAll('.chain-node .text-gray-500').forEach(el => {
            if (el.textContent === '▼') el.textContent = '▶';
        });
        
        this.selectedNode = node.nodeId;
        expandIcon.textContent = '▼';
        
        // Create detail panel
        const detailPanel = document.createElement('div');
        detailPanel.className = 'node-detail-panel ml-11 mt-2 p-3 bg-gray-800/50 rounded-lg';
        
        // Prevention concepts
        if (node.preventionConcepts?.length > 0) {
            const preventSection = document.createElement('div');
            preventSection.className = 'mb-3';
            
            const preventLabel = document.createElement('h5');
            preventLabel.className = 'text-gray-300 font-medium text-xs mb-2';
            preventLabel.textContent = 'Prevention Concepts';
            preventSection.appendChild(preventLabel);
            
            const badges = document.createElement('div');
            badges.className = 'flex flex-wrap gap-2';
            
            node.preventionConcepts.forEach(concept => {
                const badge = new TagBadge({
                    text: this.formatConceptName(concept),
                    variant: 'success'
                });
                badges.appendChild(badge.render());
            });
            
            preventSection.appendChild(badges);
            detailPanel.appendChild(preventSection);
        }
        
        // Learn links
        if (node.learnLinks?.length > 0) {
            const learnSection = document.createElement('div');
            
            const learnLabel = document.createElement('h5');
            learnLabel.className = 'text-gray-300 font-medium text-xs mb-2';
            learnLabel.textContent = 'Learn More';
            learnSection.appendChild(learnLabel);
            
            const linkGroup = createLearnLinkGroup(
                node.learnLinks.map(conceptId => ({ conceptId })),
                { from: NAV_SOURCES.MAPPING }
            );
            learnSection.appendChild(linkGroup);
            
            detailPanel.appendChild(learnSection);
        }
        
        container.appendChild(detailPanel);
    }

    /**
     * Section 3: Architecture Decision Analyzer
     */
    renderDecisionsSection() {
        const section = document.createElement('section');
        section.className = 'decisions-section';
        section.id = 'decisions-section';
        
        const header = new SectionHeader({
            title: 'Architecture Decision Analyzer',
            subtitle: 'Learn from common architecture mistakes and correct patterns'
        });
        section.appendChild(header.render());
        
        const state = mappingHubPage.getState();
        const decisions = state.decisions;
        
        if (!decisions || decisions.length === 0) {
            const empty = new EmptyState({
                title: 'No Decisions Available',
                description: 'Decision data could not be loaded.'
            });
            section.appendChild(empty.render());
            this.container.appendChild(section);
            return;
        }
        
        // Accordion list of decisions
        const accordionContainer = document.createElement('div');
        accordionContainer.className = 'decisions-accordion space-y-2';
        
        decisions.forEach(decision => {
            const card = this.createDecisionCard(decision);
            accordionContainer.appendChild(card);
        });
        
        section.appendChild(accordionContainer);
        this.container.appendChild(section);
    }

    /**
     * Create a decision card
     * @param {Object} decision - Decision data
     * @returns {HTMLElement} Decision card element
     */
    createDecisionCard(decision) {
        const content = document.createElement('div');
        content.className = 'p-4 space-y-4';
        
        // Why it failed
        const failedSection = document.createElement('div');
        
        const failedLabel = document.createElement('h4');
        failedLabel.className = 'text-red-400 font-medium text-sm mb-2';
        failedLabel.textContent = '❌ Why It Failed';
        failedSection.appendChild(failedLabel);
        
        const failedText = document.createElement('p');
        failedText.className = 'text-gray-300 text-sm';
        failedText.textContent = decision.whyItFailed;
        failedSection.appendChild(failedText);
        
        content.appendChild(failedSection);
        
        // Correct pattern
        if (decision.correctPattern?.length > 0) {
            const patternSection = document.createElement('div');
            
            const patternLabel = document.createElement('h4');
            patternLabel.className = 'text-green-400 font-medium text-sm mb-2';
            patternLabel.textContent = '✓ Correct Architecture Pattern';
            patternSection.appendChild(patternLabel);
            
            const patternBadges = document.createElement('div');
            patternBadges.className = 'flex flex-wrap gap-2';
            
            decision.correctPattern.forEach(concept => {
                const badge = new TagBadge({
                    text: this.formatConceptName(concept),
                    variant: 'success'
                });
                patternBadges.appendChild(badge.render());
            });
            
            patternSection.appendChild(patternBadges);
            content.appendChild(patternSection);
        }
        
        // Learn links
        if (decision.learnLinks?.length > 0) {
            const learnSection = document.createElement('div');
            
            const learnLabel = document.createElement('h4');
            learnLabel.className = 'text-cyan-400 font-medium text-sm mb-2';
            learnLabel.textContent = '📚 Learn More';
            learnSection.appendChild(learnLabel);
            
            const linkGroup = createLearnLinkGroup(
                decision.learnLinks.map(conceptId => ({ conceptId })),
                { from: NAV_SOURCES.MAPPING }
            );
            learnSection.appendChild(linkGroup);
            
            content.appendChild(learnSection);
        }
        
        const card = new ExpandableCard({
            title: decision.decision,
            initiallyOpen: false,
            children: content
        });
        
        // Store reference for context handling
        this.expandedCards.set(`decision-${decision.decisionId}`, card);
        
        return card.render();
    }

    /**
     * Section 4: Game ↔ Cloud Service Mapping
     */
    renderCloudMappingSection() {
        const section = document.createElement('section');
        section.className = 'cloud-mapping-section';
        section.id = 'mapping-section';
        
        const header = new SectionHeader({
            title: 'Game ↔ Cloud Service Mapping',
            subtitle: 'Understand how game elements map to real cloud infrastructure'
        });
        section.appendChild(header.render());
        
        // Table/list of mappings
        const tableContainer = document.createElement('div');
        tableContainer.className = 'glass-panel rounded-lg overflow-hidden';
        
        // Table header
        const tableHeader = document.createElement('div');
        tableHeader.className = 'grid grid-cols-3 gap-4 px-4 py-3 bg-gray-800/50 border-b border-gray-700 text-xs font-medium text-gray-400 uppercase tracking-wide';
        tableHeader.innerHTML = `
            <div>Game Element</div>
            <div>Cloud Concept</div>
            <div>Learn</div>
        `;
        tableContainer.appendChild(tableHeader);
        
        // Table rows
        const tableBody = document.createElement('div');
        tableBody.className = 'divide-y divide-gray-800';
        
        CLOUD_SERVICE_MAPPING.forEach(mapping => {
            const row = this.createMappingRow(mapping);
            tableBody.appendChild(row);
        });
        
        tableContainer.appendChild(tableBody);
        section.appendChild(tableContainer);
        this.container.appendChild(section);
    }

    /**
     * Create a mapping table row
     * @param {Object} mapping - Mapping data
     * @returns {HTMLElement} Row element
     */
    createMappingRow(mapping) {
        const row = document.createElement('div');
        row.className = 'mapping-row';
        row.setAttribute('data-mapping-id', mapping.id);
        
        // Row header (always visible)
        const rowHeader = document.createElement('div');
        rowHeader.className = 'grid grid-cols-3 gap-4 px-4 py-3 cursor-pointer hover:bg-gray-800/30 transition-colors items-center';
        
        const gameElement = document.createElement('div');
        gameElement.className = 'text-white text-sm font-medium';
        gameElement.textContent = mapping.gameElement;
        rowHeader.appendChild(gameElement);
        
        const cloudConcept = document.createElement('div');
        cloudConcept.className = 'text-gray-300 text-sm';
        cloudConcept.textContent = mapping.cloudConcept;
        rowHeader.appendChild(cloudConcept);
        
        const learnContainer = document.createElement('div');
        const learnLink = new LearnLink({
            conceptId: mapping.learnLink,
            context: { from: NAV_SOURCES.MAPPING }
        });
        learnContainer.appendChild(learnLink.render());
        rowHeader.appendChild(learnContainer);
        
        row.appendChild(rowHeader);
        
        // Expandable detail (hidden by default)
        const detail = document.createElement('div');
        detail.className = 'mapping-detail hidden px-4 py-3 bg-gray-800/30 border-t border-gray-800';
        detail.innerHTML = `
            <p class="text-gray-400 text-sm">${mapping.description}</p>
        `;
        row.appendChild(detail);
        
        // Toggle detail on row click (but not on link click)
        rowHeader.addEventListener('click', (e) => {
            // Don't toggle if clicking on a link
            if (e.target.closest('a')) return;
            
            detail.classList.toggle('hidden');
        });
        
        return row;
    }

    /**
     * Section 5: "Why Did I Lose?" Debug Mode
     */
    renderDebugSection() {
        const section = document.createElement('section');
        section.className = 'debug-section';
        section.id = 'debug-section';
        
        const header = new SectionHeader({
            title: 'Why Did I Lose? (Debug Mode)',
            subtitle: 'Analyze your game session to understand what went wrong'
        });
        section.appendChild(header.render());
        
        const debugContainer = document.createElement('div');
        debugContainer.className = 'glass-panel rounded-lg p-4';
        
        // Session selector
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'flex flex-wrap gap-4 items-center mb-4';
        
        const selectLabel = document.createElement('label');
        selectLabel.className = 'text-gray-300 text-sm';
        selectLabel.textContent = 'Select Session:';
        selectorContainer.appendChild(selectLabel);
        
        const sessionSelect = document.createElement('select');
        sessionSelect.className = 'bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-sm';
        sessionSelect.innerHTML = `
            <option value="last">Last Session</option>
            <option value="none">No Session Selected</option>
        `;
        selectorContainer.appendChild(sessionSelect);
        
        const analyzeBtn = document.createElement('button');
        analyzeBtn.className = 'bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors';
        analyzeBtn.textContent = 'Analyze Failure';
        analyzeBtn.addEventListener('click', () => this.handleAnalyzeClick(sessionSelect.value));
        selectorContainer.appendChild(analyzeBtn);
        
        debugContainer.appendChild(selectorContainer);
        
        // Output panel
        const outputPanel = document.createElement('div');
        outputPanel.className = 'debug-output mt-4 p-4 bg-gray-900 rounded border border-gray-800 min-h-32';
        outputPanel.id = 'debug-output';
        
        const placeholder = document.createElement('p');
        placeholder.className = 'text-gray-500 text-sm';
        placeholder.textContent = 'Click "Analyze Failure" to see analysis results...';
        outputPanel.appendChild(placeholder);
        
        debugContainer.appendChild(outputPanel);
        this.debugOutput = outputPanel;
        
        section.appendChild(debugContainer);
        this.container.appendChild(section);
    }

    /**
     * Handle analyze button click
     * Rule-based failure analysis (no AI/backend)
     * @param {string} sessionValue - Selected session value
     */
    handleAnalyzeClick(sessionValue) {
        const output = this.debugOutput;
        if (!output) return;
        
        output.innerHTML = '';
        
        if (sessionValue === 'none') {
            const noSession = new EmptyState({
                title: 'No Session Selected',
                description: 'Please select a session to analyze.'
            });
            output.appendChild(noSession.render());
            return;
        }
        
        // MVP: Rule-based analysis using available data
        // This would normally read from actual session data
        const analysisResult = this.performRuleBasedAnalysis();
        
        // Render analysis result
        this.renderAnalysisResult(analysisResult);
    }

    /**
     * Perform rule-based failure analysis
     * MVP implementation using static rules
     * @returns {Object} Analysis result
     */
    performRuleBasedAnalysis() {
        // MVP: Return a plausible analysis based on common failure patterns
        // In a real implementation, this would read from session storage
        
        const state = mappingHubPage.getState();
        const events = state.gameEvents || [];
        const chains = state.failureChains || [];
        
        // Pick a random high-severity event as the "primary failure"
        const highSeverityEvents = events.filter(e => e.severity === 'high');
        const primaryFailure = highSeverityEvents[0] || events[0];
        
        // Pick the first failure chain as root cause path
        const rootCauseChain = chains[0];
        
        return {
            primaryFailure: primaryFailure ? {
                title: primaryFailure.title,
                eventId: primaryFailure.eventId
            } : null,
            rootCause: rootCauseChain ? {
                title: rootCauseChain.nodes[0]?.title || 'Unknown',
                chainTitle: rootCauseChain.title
            } : null,
            suggestedTopics: primaryFailure?.learnLinks?.slice(0, 3) || []
        };
    }

    /**
     * Render analysis result
     * @param {Object} result - Analysis result
     */
    renderAnalysisResult(result) {
        const output = this.debugOutput;
        if (!output) return;
        
        output.innerHTML = '';
        
        // No data case
        if (!result.primaryFailure && !result.rootCause) {
            const noData = new EmptyState({
                title: 'No Session Data Available',
                description: 'Play a game session first, then return here to analyze what went wrong.'
            });
            output.appendChild(noData.render());
            return;
        }
        
        // Primary Failure
        if (result.primaryFailure) {
            const failureSection = document.createElement('div');
            failureSection.className = 'mb-4';
            
            const failureLabel = document.createElement('h4');
            failureLabel.className = 'text-red-400 font-medium text-sm mb-2';
            failureLabel.textContent = '🔴 Primary Failure';
            failureSection.appendChild(failureLabel);
            
            const failureText = document.createElement('p');
            failureText.className = 'text-white text-sm bg-red-900/20 border border-red-800 rounded px-3 py-2';
            failureText.textContent = result.primaryFailure.title;
            failureSection.appendChild(failureText);
            
            output.appendChild(failureSection);
        }
        
        // Root Cause
        if (result.rootCause) {
            const causeSection = document.createElement('div');
            causeSection.className = 'mb-4';
            
            const causeLabel = document.createElement('h4');
            causeLabel.className = 'text-yellow-400 font-medium text-sm mb-2';
            causeLabel.textContent = '⚠️ Root Cause';
            causeSection.appendChild(causeLabel);
            
            const causeText = document.createElement('div');
            causeText.className = 'text-white text-sm bg-yellow-900/20 border border-yellow-800 rounded px-3 py-2';
            causeText.innerHTML = `
                <p class="font-medium">${result.rootCause.title}</p>
                <p class="text-gray-400 text-xs mt-1">From: ${result.rootCause.chainTitle}</p>
            `;
            causeSection.appendChild(causeText);
            
            output.appendChild(causeSection);
        }
        
        // Suggested Topics
        if (result.suggestedTopics?.length > 0) {
            const topicsSection = document.createElement('div');
            
            const topicsLabel = document.createElement('h4');
            topicsLabel.className = 'text-cyan-400 font-medium text-sm mb-2';
            topicsLabel.textContent = '📚 Suggested Learn Mode Topics';
            topicsSection.appendChild(topicsLabel);
            
            const linkGroup = createLearnLinkGroup(
                result.suggestedTopics.map(conceptId => ({ conceptId })),
                { from: NAV_SOURCES.MAPPING }
            );
            topicsSection.appendChild(linkGroup);
            
            output.appendChild(topicsSection);
        }
    }

    /**
     * Format concept ID for display
     * @param {string} conceptId - Concept ID
     * @returns {string} Formatted name
     */
    formatConceptName(conceptId) {
        return conceptId
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Render error state
     */
    renderError() {
        this.container.innerHTML = '';
        
        const empty = new EmptyState({
            title: 'Failed to Load Mapping Hub',
            description: 'There was an error loading the page. Please try refreshing.'
        });
        
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'mt-4 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded text-sm';
        refreshBtn.textContent = 'Refresh Page';
        refreshBtn.addEventListener('click', () => window.location.reload());
        
        empty.update({ action: refreshBtn });
        
        this.container.appendChild(empty.render());
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.expandedCards.clear();
        this.selectedEvent = null;
        this.selectedNode = null;
        this.debugOutput = null;
        
        // Remove any modals
        document.querySelectorAll('.event-detail-panel').forEach(el => el.remove());
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export
export { MappingHubUI };
export default MappingHubUI;
