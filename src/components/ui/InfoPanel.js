/**
 * InfoPanel - Structured explanation block component
 * Displays labeled content for cause, effect, fix, etc.
 * 
 * FEATURE COMPLETE — DO NOT EXTEND IN MVP
 * 
 * @example
 * const panel = new InfoPanel({
 *   label: 'Root Cause',
 *   content: 'Explanation of the issue...'
 * });
 * container.appendChild(panel.render());
 */

/**
 * @typedef {Object} InfoPanelProps
 * @property {string} label - Always visible label
 * @property {string|HTMLElement} content - Text or JSX content
 */

class InfoPanel {
    /**
     * Create an InfoPanel component
     * @param {InfoPanelProps} props - Component properties
     */
    constructor(props = {}) {
        this.props = {
            label: props.label || '',
            content: props.content || ''
        };
        
        this.element = null;
    }

    /**
     * Update component props
     * @param {Partial<InfoPanelProps>} newProps - New properties to merge
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
        container.className = 'info-panel mb-3';

        // Label
        const label = document.createElement('div');
        label.className = 'info-panel-label text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1';
        label.textContent = this.props.label;
        container.appendChild(label);

        // Content
        const content = document.createElement('div');
        content.className = 'info-panel-content text-sm text-gray-200 leading-relaxed';
        
        if (this.props.content instanceof HTMLElement) {
            content.appendChild(this.props.content);
        } else if (typeof this.props.content === 'string') {
            content.textContent = this.props.content;
        }
        
        container.appendChild(content);

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
     * Set content dynamically
     * @param {string|HTMLElement} content - New content
     */
    setContent(content) {
        this.props.content = content;
        if (this.element) {
            const contentEl = this.element.querySelector('.info-panel-content');
            if (contentEl) {
                contentEl.innerHTML = '';
                if (content instanceof HTMLElement) {
                    contentEl.appendChild(content);
                } else if (typeof content === 'string') {
                    contentEl.textContent = content;
                }
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

export { InfoPanel };
export default InfoPanel;
