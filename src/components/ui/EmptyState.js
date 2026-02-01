/**
 * EmptyState - Reusable empty/fallback state component
 * Used when there's no data to display
 * 
 * @example
 * const empty = new EmptyState({
 *   title: 'No Results',
 *   description: 'Try adjusting your filters',
 *   action: document.createElement('button')
 * });
 * container.appendChild(empty.render());
 */

/**
 * @typedef {Object} EmptyStateProps
 * @property {string} title - Main title text
 * @property {string} [description] - Optional description
 * @property {HTMLElement} [action] - Optional action element
 */

class EmptyState {
    /**
     * Create an EmptyState component
     * @param {EmptyStateProps} props - Component properties
     */
    constructor(props = {}) {
        this.props = {
            title: props.title || 'No content',
            description: props.description || null,
            action: props.action || null
        };
        
        this.element = null;
    }

    /**
     * Update component props
     * @param {Partial<EmptyStateProps>} newProps - New properties to merge
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
        const container = document.createElement('div');
        container.className = 'empty-state flex flex-col items-center justify-center py-12 px-6 text-center';

        // Icon placeholder (generic, not hardcoded)
        const iconContainer = document.createElement('div');
        iconContainer.className = 'empty-state-icon text-4xl text-gray-600 mb-4';
        iconContainer.textContent = '📭';
        container.appendChild(iconContainer);

        // Title
        const title = document.createElement('h3');
        title.className = 'empty-state-title text-lg font-medium text-gray-300 mb-2';
        title.textContent = this.props.title;
        container.appendChild(title);

        // Description (optional)
        if (this.props.description) {
            const description = document.createElement('p');
            description.className = 'empty-state-description text-sm text-gray-500 max-w-sm mb-4';
            description.textContent = this.props.description;
            container.appendChild(description);
        }

        // Action (optional)
        if (this.props.action) {
            const actionContainer = document.createElement('div');
            actionContainer.className = 'empty-state-action mt-2';
            
            if (this.props.action instanceof HTMLElement) {
                actionContainer.appendChild(this.props.action);
            } else if (typeof this.props.action === 'string') {
                actionContainer.innerHTML = this.props.action;
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
     * Set custom icon
     * @param {string} icon - Icon text or emoji
     */
    setIcon(icon) {
        if (this.element) {
            const iconEl = this.element.querySelector('.empty-state-icon');
            if (iconEl) {
                iconEl.textContent = icon;
            }
        }
    }

    /**
     * Set action element
     * @param {HTMLElement} action - Action element
     */
    setAction(action) {
        this.props.action = action;
        if (this.element) {
            let actionContainer = this.element.querySelector('.empty-state-action');
            
            if (action) {
                if (!actionContainer) {
                    actionContainer = document.createElement('div');
                    actionContainer.className = 'empty-state-action mt-2';
                    this.element.appendChild(actionContainer);
                }
                actionContainer.innerHTML = '';
                if (action instanceof HTMLElement) {
                    actionContainer.appendChild(action);
                }
            } else if (actionContainer) {
                actionContainer.remove();
            }
        }
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

export { EmptyState };
export default EmptyState;
