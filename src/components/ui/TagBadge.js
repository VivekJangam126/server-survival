/**
 * TagBadge - Small visual indicator component
 * Used for labels, categories, status indicators
 * 
 * @example
 * const badge = new TagBadge({
 *   text: 'Warning',
 *   variant: 'warning'
 * });
 * container.appendChild(badge.render());
 */

/**
 * @typedef {'default' | 'warning' | 'success' | 'danger'} TagBadgeVariant
 */

/**
 * @typedef {Object} TagBadgeProps
 * @property {string} text - Badge text
 * @property {TagBadgeVariant} [variant='default'] - Visual variant
 */

/**
 * Variant to CSS class mapping
 */
const VARIANT_CLASSES = {
    default: 'bg-gray-700 text-gray-200 border-gray-600',
    warning: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    success: 'bg-green-900/50 text-green-300 border-green-700',
    danger: 'bg-red-900/50 text-red-300 border-red-700'
};

class TagBadge {
    /**
     * Create a TagBadge component
     * @param {TagBadgeProps} props - Component properties
     */
    constructor(props = {}) {
        this.props = {
            text: props.text || '',
            variant: props.variant || 'default'
        };
        
        this.element = null;
    }

    /**
     * Get CSS classes for the current variant
     * @returns {string} CSS classes
     */
    getVariantClasses() {
        return VARIANT_CLASSES[this.props.variant] || VARIANT_CLASSES.default;
    }

    /**
     * Update component props
     * @param {Partial<TagBadgeProps>} newProps - New properties to merge
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
        const badge = document.createElement('span');
        badge.className = `tag-badge inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${this.getVariantClasses()}`;
        badge.textContent = this.props.text;
        badge.setAttribute('data-variant', this.props.variant);

        this.element = badge;
        return badge;
    }

    /**
     * Get the rendered element
     * @returns {HTMLElement|null} The element or null if not rendered
     */
    getElement() {
        return this.element;
    }

    /**
     * Set text dynamically
     * @param {string} text - New text
     */
    setText(text) {
        this.props.text = text;
        if (this.element) {
            this.element.textContent = text;
        }
    }

    /**
     * Set variant dynamically
     * @param {TagBadgeVariant} variant - New variant
     */
    setVariant(variant) {
        this.props.variant = variant;
        if (this.element) {
            // Remove old variant classes
            Object.values(VARIANT_CLASSES).forEach(classes => {
                classes.split(' ').forEach(cls => this.element.classList.remove(cls));
            });
            // Add new variant classes
            this.getVariantClasses().split(' ').forEach(cls => this.element.classList.add(cls));
            this.element.setAttribute('data-variant', variant);
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

/**
 * Create multiple badges from an array of items
 * @param {Array<{text: string, variant?: TagBadgeVariant}>} items - Badge items
 * @returns {HTMLElement} Container with badges
 */
function createBadgeGroup(items) {
    const container = document.createElement('div');
    container.className = 'tag-badge-group flex flex-wrap gap-1';
    
    items.forEach(item => {
        const badge = new TagBadge(item);
        container.appendChild(badge.render());
    });
    
    return container;
}

export { TagBadge, createBadgeGroup, VARIANT_CLASSES };
export default TagBadge;
