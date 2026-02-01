/**
 * SectionHeader - Reusable section heading component
 * Used across Learn Mode & Mapping Hub for consistent section titles
 * 
 * @example
 * const header = new SectionHeader({
 *   title: 'My Section',
 *   subtitle: 'Optional description',
 *   rightAction: document.createElement('button')
 * });
 * container.appendChild(header.render());
 */

/**
 * @typedef {Object} SectionHeaderProps
 * @property {string} title - Required section title
 * @property {string} [subtitle] - Optional subtitle/description
 * @property {HTMLElement} [rightAction] - Optional action element (button, link, etc.)
 */

class SectionHeader {
    /**
     * Create a SectionHeader component
     * @param {SectionHeaderProps} props - Component properties
     */
    constructor(props = {}) {
        this.props = {
            title: props.title || '',
            subtitle: props.subtitle || null,
            rightAction: props.rightAction || null
        };
        
        this.element = null;
    }

    /**
     * Validate required props
     * @returns {boolean} True if valid
     */
    validate() {
        if (!this.props.title) {
            console.warn('SectionHeader: title prop is required');
            return false;
        }
        return true;
    }

    /**
     * Update component props
     * @param {Partial<SectionHeaderProps>} newProps - New properties to merge
     */
    update(newProps) {
        this.props = { ...this.props, ...newProps };
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
            const errorEl = document.createElement('div');
            errorEl.textContent = 'SectionHeader: Missing required title';
            errorEl.className = 'text-red-400 text-sm';
            return errorEl;
        }

        const container = document.createElement('div');
        container.className = 'section-header flex justify-between items-start mb-4 pb-3 border-b border-gray-700';

        // Left side - title and subtitle
        const textContainer = document.createElement('div');
        textContainer.className = 'flex flex-col';

        const title = document.createElement('h2');
        title.className = 'text-xl font-bold text-white tracking-wide';
        title.textContent = this.props.title;
        textContainer.appendChild(title);

        if (this.props.subtitle) {
            const subtitle = document.createElement('p');
            subtitle.className = 'text-sm text-gray-400 mt-1';
            subtitle.textContent = this.props.subtitle;
            textContainer.appendChild(subtitle);
        }

        container.appendChild(textContainer);

        // Right side - optional action
        if (this.props.rightAction) {
            const actionContainer = document.createElement('div');
            actionContainer.className = 'section-header-action flex-shrink-0 ml-4';
            
            if (this.props.rightAction instanceof HTMLElement) {
                actionContainer.appendChild(this.props.rightAction);
            } else if (typeof this.props.rightAction === 'string') {
                actionContainer.innerHTML = this.props.rightAction;
            }
            
            container.appendChild(actionContainer);
        }

        this.element = container;
        return container;
    }

    /**
     * Get the rendered element
     * @returns {HTMLElement|null} The element or null if not rendered
     */
    getElement() {
        return this.element;
    }

    /**
     * Destroy the component
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

export { SectionHeader };
export default SectionHeader;
