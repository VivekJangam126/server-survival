/**
 * ExpandableCard - Expandable/collapsible container component
 * Used for explanations and detailed content that can be toggled
 * 
 * FEATURE COMPLETE — DO NOT EXTEND IN MVP
 * 
 * @example
 * const card = new ExpandableCard({
 *   title: 'Details',
 *   initiallyOpen: false,
 *   children: document.createElement('div')
 * });
 * container.appendChild(card.render());
 */

/**
 * @typedef {Object} ExpandableCardProps
 * @property {string} title - Card header title
 * @property {boolean} [initiallyOpen=false] - Whether card starts expanded
 * @property {HTMLElement|string} children - Content to display when expanded
 */

class ExpandableCard {
    /**
     * Create an ExpandableCard component
     * @param {ExpandableCardProps} props - Component properties
     */
    constructor(props = {}) {
        this.props = {
            title: props.title || '',
            initiallyOpen: props.initiallyOpen || false,
            children: props.children || null
        };
        
        this.isOpen = this.props.initiallyOpen;
        this.element = null;
        this.headerElement = null;
        this.contentElement = null;
        this.toggleIcon = null;
        
        // Bind methods
        this.toggle = this.toggle.bind(this);
    }

    /**
     * Toggle the expanded state
     */
    toggle() {
        this.isOpen = !this.isOpen;
        this.updateExpandedState();
    }

    /**
     * Open the card
     */
    open() {
        if (!this.isOpen) {
            this.isOpen = true;
            this.updateExpandedState();
        }
    }

    /**
     * Close the card
     */
    close() {
        if (this.isOpen) {
            this.isOpen = false;
            this.updateExpandedState();
        }
    }

    /**
     * Update the visual expanded state
     */
    updateExpandedState() {
        if (this.contentElement) {
            if (this.isOpen) {
                this.contentElement.classList.remove('hidden');
                this.contentElement.style.maxHeight = this.contentElement.scrollHeight + 'px';
            } else {
                this.contentElement.classList.add('hidden');
                this.contentElement.style.maxHeight = '0';
            }
        }
        
        if (this.toggleIcon) {
            this.toggleIcon.textContent = this.isOpen ? '▼' : '▶';
        }
        
        if (this.element) {
            this.element.setAttribute('data-expanded', this.isOpen.toString());
        }
    }

    /**
     * Update component props
     * @param {Partial<ExpandableCardProps>} newProps - New properties to merge
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
     * Set children content
     * @param {HTMLElement|string} children - New content
     */
    setChildren(children) {
        this.props.children = children;
        if (this.contentElement) {
            this.contentElement.innerHTML = '';
            if (children instanceof HTMLElement) {
                this.contentElement.appendChild(children);
            } else if (typeof children === 'string') {
                this.contentElement.innerHTML = children;
            }
        }
    }

    /**
     * Render the component
     * @returns {HTMLElement} The rendered element
     */
    render() {
        const container = document.createElement('div');
        container.className = 'expandable-card glass-panel rounded-lg overflow-hidden mb-3';
        container.setAttribute('data-expanded', this.isOpen.toString());

        // Header (clickable)
        const header = document.createElement('div');
        header.className = 'expandable-card-header flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-colors';
        header.addEventListener('click', this.toggle);
        
        // Store header reference for cleanup
        this.headerElement = header;

        const titleElement = document.createElement('span');
        titleElement.className = 'text-white font-medium';
        titleElement.textContent = this.props.title;
        header.appendChild(titleElement);

        this.toggleIcon = document.createElement('span');
        this.toggleIcon.className = 'text-gray-400 text-sm transition-transform';
        this.toggleIcon.textContent = this.isOpen ? '▼' : '▶';
        header.appendChild(this.toggleIcon);

        container.appendChild(header);

        // Content (expandable)
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'expandable-card-content px-4 pb-4 overflow-hidden transition-all';
        
        if (!this.isOpen) {
            this.contentElement.classList.add('hidden');
            this.contentElement.style.maxHeight = '0';
        }

        // Add children
        if (this.props.children) {
            if (this.props.children instanceof HTMLElement) {
                this.contentElement.appendChild(this.props.children);
            } else if (typeof this.props.children === 'string') {
                this.contentElement.innerHTML = this.props.children;
            }
        }

        container.appendChild(this.contentElement);

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
     * Check if the card is expanded
     * @returns {boolean} True if expanded
     */
    isExpanded() {
        return this.isOpen;
    }

    /**
     * Destroy the component
     */
    destroy() {
        // Remove click handler from header
        if (this.headerElement) {
            this.headerElement.removeEventListener('click', this.toggle);
        }
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.headerElement = null;
        this.contentElement = null;
        this.toggleIcon = null;
    }
}

export { ExpandableCard };
export default ExpandableCard;
