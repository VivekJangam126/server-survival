/**
 * VerticalTabNav - Vertical navigation component for tutorial sections
 * Displays section tabs in a left sidebar with active state indicator
 * 
 * @example
 * const nav = new VerticalTabNav({
 *   sections: ['overview', 'why', 'game', 'realworld', 'videos'],
 *   activeSection: 'overview',
 *   onSelect: (section) => console.log(section)
 * });
 * container.appendChild(nav.render());
 */

/**
 * @typedef {Object} VerticalTabNavProps
 * @property {string[]} sections - Array of section keys
 * @property {string} activeSection - Currently active section key
 * @property {function(string): void} onSelect - Callback when section is selected
 */

/**
 * Section configuration with display names and icons
 */
const SECTION_CONFIG = {
    overview: {
        label: 'Concept Overview',
        icon: '📌',
        description: 'What you will learn'
    },
    why: {
        label: 'Why It Matters',
        icon: '❓',
        description: 'Importance and impact'
    },
    game: {
        label: 'Game Connection',
        icon: '🎮',
        description: 'In-game application'
    },
    realworld: {
        label: 'Real-World Application',
        icon: '🌍',
        description: 'Production examples'
    },
    videos: {
        label: 'Video Learning',
        icon: '🎥',
        description: 'Curated tutorials'
    },
    takeaways: {
        label: 'Key Takeaways',
        icon: '💡',
        description: 'Summary points'
    }
};

class VerticalTabNav {
    /**
     * Create a VerticalTabNav component
     * @param {VerticalTabNavProps} props - Component properties
     */
    constructor(props = {}) {
        this.props = {
            sections: props.sections || Object.keys(SECTION_CONFIG),
            activeSection: props.activeSection || 'overview',
            onSelect: props.onSelect || (() => {})
        };
        
        this.element = null;
    }

    /**
     * Update active section
     * @param {string} section - New active section
     */
    setActiveSection(section) {
        this.props.activeSection = section;
        this.updateActiveState();
    }

    /**
     * Update active state in DOM
     */
    updateActiveState() {
        if (!this.element) return;
        
        const buttons = this.element.querySelectorAll('[data-section]');
        buttons.forEach(btn => {
            const section = btn.getAttribute('data-section');
            const isActive = section === this.props.activeSection;
            
            // Update classes
            btn.classList.toggle('bg-cyan-600/20', isActive);
            btn.classList.toggle('border-l-cyan-400', isActive);
            btn.classList.toggle('text-cyan-400', isActive);
            btn.classList.toggle('border-l-transparent', !isActive);
            btn.classList.toggle('text-gray-400', !isActive);
            btn.classList.toggle('hover:text-gray-200', !isActive);
            btn.classList.toggle('hover:bg-gray-800/50', !isActive);
        });
    }

    /**
     * Handle section click
     * @param {string} section - Clicked section
     */
    handleClick(section) {
        if (section === this.props.activeSection) return;
        
        this.props.activeSection = section;
        this.updateActiveState();
        this.props.onSelect(section);
    }

    /**
     * Render the component
     * @returns {HTMLElement} The rendered element
     */
    render() {
        const nav = document.createElement('nav');
        nav.className = 'vertical-tab-nav w-full bg-gray-900/50 rounded-xl p-4';
        
        // Section title
        const title = document.createElement('h3');
        title.className = 'text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2';
        title.textContent = 'Sections';
        nav.appendChild(title);
        
        // Navigation buttons container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'space-y-1';
        
        this.props.sections.forEach(sectionKey => {
            const config = SECTION_CONFIG[sectionKey] || { 
                label: sectionKey, 
                icon: '📄',
                description: ''
            };
            
            const isActive = sectionKey === this.props.activeSection;
            
            const button = document.createElement('button');
            button.setAttribute('data-section', sectionKey);
            button.className = `w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg border-l-4 transition-all ${
                isActive 
                    ? 'bg-cyan-600/20 border-l-cyan-400 text-cyan-400' 
                    : 'border-l-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`;
            
            button.innerHTML = `
                <span class="text-lg">${config.icon}</span>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate">${config.label}</div>
                </div>
            `;
            
            button.addEventListener('click', () => this.handleClick(sectionKey));
            buttonContainer.appendChild(button);
        });
        
        nav.appendChild(buttonContainer);
        
        this.element = nav;
        return nav;
    }

    /**
     * Cleanup component
     */
    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

export { VerticalTabNav, SECTION_CONFIG };
export default VerticalTabNav;
