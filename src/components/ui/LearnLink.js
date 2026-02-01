/**
 * LearnLink - Standardized link to Learn Mode tutorials
 * Uses navigation helpers from Phase 2 for URL generation
 * 
 * @example
 * const link = new LearnLink({
 *   conceptId: 'cache',
 *   label: 'Learn about Caching',
 *   context: { from: 'mapping', event: 'db_failed_first' }
 * });
 * container.appendChild(link.render());
 */

import { goToLearn } from '../../utils/navigation.js';

/**
 * @typedef {Object} LearnLinkContext
 * @property {string} [from] - Source of navigation
 * @property {string} [event] - Related event ID
 * @property {string} [sessionId] - Session ID
 */

/**
 * @typedef {Object} LearnLinkProps
 * @property {string} conceptId - Concept ID to link to (required)
 * @property {string} [label] - Link text (defaults to conceptId)
 * @property {LearnLinkContext} [context] - Navigation context
 */

class LearnLink {
    /**
     * Create a LearnLink component
     * @param {LearnLinkProps} props - Component properties
     */
    constructor(props = {}) {
        this.props = {
            conceptId: props.conceptId || '',
            label: props.label || null,
            context: props.context || {}
        };
        
        this.element = null;
        
        // Bind methods
        this.handleClick = this.handleClick.bind(this);
    }

    /**
     * Validate required props
     * @returns {boolean} True if valid
     */
    validate() {
        if (!this.props.conceptId) {
            console.warn('LearnLink: conceptId prop is required');
            return false;
        }
        return true;
    }

    /**
     * Generate the URL for this link
     * @returns {string} Generated URL
     */
    generateUrl() {
        return goToLearn(this.props.conceptId, this.props.context);
    }

    /**
     * Format concept ID for display
     * @param {string} conceptId - Raw concept ID
     * @returns {string} Formatted display text
     */
    formatLabel(conceptId) {
        // Convert snake_case to Title Case
        return conceptId
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get display label
     * @returns {string} Label text
     */
    getLabel() {
        return this.props.label || this.formatLabel(this.props.conceptId);
    }

    /**
     * Handle click event
     * @param {Event} event - Click event
     */
    handleClick(event) {
        // Allow default navigation behavior
        // The href is already set correctly
    }

    /**
     * Update component props
     * @param {Partial<LearnLinkProps>} newProps - New properties to merge
     */
    update(newProps) {
        this.props = { ...this.props, ...newProps };
        if (newProps.context) {
            this.props.context = { ...this.props.context, ...newProps.context };
        }
        if (this.element && this.element.parentNode) {
            const newElement = this.render();
            this.element.parentNode.replaceChild(newElement, this.element);
            this.element = newElement;
        }
    }

    /**
     * Render the component
     * @returns {HTMLElement} The rendered element
     */
    render() {
        if (!this.validate()) {
            const errorEl = document.createElement('span');
            errorEl.textContent = '[Invalid Link]';
            errorEl.className = 'text-red-400 text-sm';
            return errorEl;
        }

        const link = document.createElement('a');
        link.className = 'learn-link inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline text-sm transition-colors cursor-pointer';
        link.href = this.generateUrl();
        link.setAttribute('data-concept-id', this.props.conceptId);

        // Icon
        const icon = document.createElement('span');
        icon.className = 'learn-link-icon';
        icon.textContent = '📚';
        link.appendChild(icon);

        // Label
        const label = document.createElement('span');
        label.className = 'learn-link-label';
        label.textContent = this.getLabel();
        link.appendChild(label);

        link.addEventListener('click', this.handleClick);

        this.element = link;
        return link;
    }

    /**
     * Get the rendered element
     * @returns {HTMLElement|null} The element or null if not rendered
     */
    getElement() {
        return this.element;
    }

    /**
     * Get the concept ID
     * @returns {string} Concept ID
     */
    getConceptId() {
        return this.props.conceptId;
    }

    /**
     * Destroy the component
     */
    destroy() {
        if (this.element) {
            this.element.removeEventListener('click', this.handleClick);
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }
        this.element = null;
    }
}

/**
 * Create a group of learn links
 * @param {Array<LearnLinkProps>} items - Link items
 * @param {LearnLinkContext} [sharedContext] - Shared context for all links
 * @returns {HTMLElement} Container with links
 */
function createLearnLinkGroup(items, sharedContext = {}) {
    const container = document.createElement('div');
    container.className = 'learn-link-group flex flex-wrap gap-3';
    
    items.forEach(item => {
        const link = new LearnLink({
            ...item,
            context: { ...sharedContext, ...item.context }
        });
        container.appendChild(link.render());
    });
    
    return container;
}

export { LearnLink, createLearnLinkGroup };
export default LearnLink;
