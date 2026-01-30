/**
 * Navigation - Top navigation bar and section management
 * Provides routing system for different application modes and breadcrumb navigation
 */
import { BaseComponent } from '../BaseComponent.js';

class Navigation extends BaseComponent {
    constructor(app) {
        super(app, 'navigation-container');
        this.currentSection = 'home';
        this.breadcrumbs = [];
        this.sections = {
            home: { title: 'Dashboard', icon: '🏠', component: 'dashboard' },
            play: { 
                title: 'Play', 
                icon: '🎮', 
                component: 'playMode',
                subsections: {
                    survival: { title: 'Survival Mode', icon: '⚡', action: 'startGame' },
                    challenge: { title: 'Challenge Mode', icon: '🏆' },
                    sandbox: { title: 'Sandbox Mode', icon: '🛠️', action: 'startSandbox' }
                }
            },
            learn: { 
                title: 'Learn', 
                icon: '📚', 
                component: 'learnMode',
                subsections: {
                    tutorials: { title: 'Tutorials', icon: '📖' },
                    concepts: { title: 'Concepts', icon: '💡' },
                    videos: { title: 'Videos', icon: '🎥' }
                }
            },
            sandbox: { title: 'Sandbox', icon: '🛠️', component: 'sandboxMode', action: 'startSandbox' },
            analysis: { 
                title: 'Analysis', 
                icon: '📊', 
                component: 'analysisMode',
                subsections: {
                    performance: { title: 'Performance', icon: '⚡' },
                    reports: { title: 'Reports', icon: '📈' },
                    insights: { title: 'Insights', icon: '🔍' }
                }
            },
            profile: { 
                title: 'Profile', 
                icon: '👤', 
                component: 'profileMode',
                subsections: {
                    settings: { title: 'Settings', icon: '⚙️' },
                    achievements: { title: 'Achievements', icon: '🏅' },
                    progress: { title: 'Progress', icon: '📈' }
                }
            }
        };
    }

    /**
     * Component-specific setup
     */
    async setup() {
        // Create navigation container if it doesn't exist
        if (!this.element) {
            this.element = this.createElement('div', {
                id: 'navigation-container'
            }, ['navigation', 'fixed', 'top-0', 'left-0', 'right-0', 'z-40', 'pointer-events-auto']);
            
            // Add to UI container
            const uiContainer = document.getElementById('ui-container');
            if (uiContainer) {
                uiContainer.appendChild(this.element);
            } else {
                // Fallback: add to body if ui-container doesn't exist
                document.body.appendChild(this.element);
            }
        }

        this.createNavigationLayout();
        this.renderMainNavigation();
        this.setupMobileMenu();
        this.setActiveSection('home');
    }

    /**
     * Create the navigation layout structure
     */
    createNavigationLayout() {
        this.element.innerHTML = `
            <!-- Top Navigation Bar -->
            <nav class="glass-panel border-b border-gray-700/50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-16">
                        <!-- Logo and Brand -->
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <h1 class="text-xl font-bold text-white">Cloud Learning Simulator</h1>
                            </div>
                        </div>

                        <!-- Main Navigation -->
                        <div class="hidden md:block">
                            <div class="ml-10 flex items-baseline space-x-4" id="main-nav">
                                <!-- Navigation items will be populated here -->
                            </div>
                        </div>

                        <!-- User Menu -->
                        <div class="hidden md:block">
                            <div class="ml-4 flex items-center md:ml-6">
                                <!-- User menu items -->
                                <button id="user-menu-button" class="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                    <span class="sr-only">Open user menu</span>
                                    <div class="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center justify-center">
                                        <span class="text-white text-sm font-bold">U</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Mobile menu button -->
                        <div class="md:hidden">
                            <button id="mobile-menu-button" class="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                <span class="sr-only">Open main menu</span>
                                <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Mobile Navigation Menu -->
                <div id="mobile-menu" class="md:hidden hidden">
                    <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3" id="mobile-nav">
                        <!-- Mobile navigation items will be populated here -->
                    </div>
                </div>
            </nav>

            <!-- Breadcrumb Navigation -->
            <div id="breadcrumb-container" class="bg-gray-900/50 border-b border-gray-700/30">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center space-x-2 py-3" id="breadcrumb-nav">
                        <!-- Breadcrumbs will be populated here -->
                    </div>
                </div>
            </div>

            <!-- Section Content Container -->
            <div id="section-content" class="pt-20">
                <!-- Section-specific content will be loaded here -->
            </div>
        `;

        this.renderMainNavigation();
        this.setupMobileMenu();
    }

    /**
     * Render main navigation items
     */
    renderMainNavigation() {
        const mainNav = this.querySelector('#main-nav');
        const mobileNav = this.querySelector('#mobile-nav');
        
        if (!mainNav || !mobileNav) return;

        const navItems = Object.entries(this.sections).map(([key, section]) => {
            const isActive = this.currentSection === key;
            const activeClasses = isActive 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white';

            return {
                desktop: `
                    <button data-section="${key}" class="${activeClasses} px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        <span class="mr-2">${section.icon}</span>
                        ${section.title}
                    </button>
                `,
                mobile: `
                    <button data-section="${key}" class="${activeClasses} block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors">
                        <span class="mr-2">${section.icon}</span>
                        ${section.title}
                    </button>
                `
            };
        });

        // Render desktop navigation
        mainNav.innerHTML = navItems.map(item => item.desktop).join('');
        
        // Render mobile navigation
        mobileNav.innerHTML = navItems.map(item => item.mobile).join('');

        // Add click handlers
        [...mainNav.querySelectorAll('[data-section]'), ...mobileNav.querySelectorAll('[data-section]')].forEach(button => {
            this.addEventListener(button, 'click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.setActiveSection(section);
                this.handleSectionChange(section);
                
                // Close mobile menu if open
                this.closeMobileMenu();
            });
        });
    }

    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        const mobileMenuButton = this.querySelector('#mobile-menu-button');
        const mobileMenu = this.querySelector('#mobile-menu');

        if (mobileMenuButton && mobileMenu) {
            this.addEventListener(mobileMenuButton, 'click', () => {
                mobileMenu.classList.toggle('hidden');
            });

            // Close mobile menu when clicking outside
            this.addEventListener(document, 'click', (e) => {
                if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                }
            });
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const mobileMenu = this.querySelector('#mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    }

    /**
     * Set the active navigation section
     */
    setActiveSection(section) {
        if (!this.sections[section]) {
            console.warn(`Navigation: Unknown section '${section}'`);
            return;
        }

        const previousSection = this.currentSection;
        this.currentSection = section;

        // Update navigation visual state
        this.updateNavigationState();
        
        // Update breadcrumbs
        this.updateBreadcrumbs();

        // Emit section change event
        this.emit('section-changed', { 
            section, 
            previousSection,
            sectionData: this.sections[section]
        });

        // Update state
        this.setState('navigation.currentSection', section);
    }

    /**
     * Update navigation visual state
     */
    updateNavigationState() {
        // Update desktop navigation
        const desktopButtons = this.querySelectorAll('#main-nav [data-section]');
        desktopButtons.forEach(button => {
            const section = button.dataset.section;
            const isActive = section === this.currentSection;
            
            button.className = isActive
                ? 'bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors';
        });

        // Update mobile navigation
        const mobileButtons = this.querySelectorAll('#mobile-nav [data-section]');
        mobileButtons.forEach(button => {
            const section = button.dataset.section;
            const isActive = section === this.currentSection;
            
            button.className = isActive
                ? 'bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors';
        });
    }

    /**
     * Update breadcrumb navigation
     */
    updateBreadcrumbs() {
        const breadcrumbNav = this.querySelector('#breadcrumb-nav');
        if (!breadcrumbNav) return;

        const currentSectionData = this.sections[this.currentSection];
        
        // Build breadcrumb trail
        const breadcrumbs = [
            { title: 'Home', section: 'home', icon: '🏠' }
        ];

        if (this.currentSection !== 'home') {
            breadcrumbs.push({
                title: currentSectionData.title,
                section: this.currentSection,
                icon: currentSectionData.icon
            });
        }

        // Add any additional breadcrumbs from state
        const additionalBreadcrumbs = this.breadcrumbs;
        breadcrumbs.push(...additionalBreadcrumbs);

        // Render breadcrumbs
        breadcrumbNav.innerHTML = breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isClickable = !isLast && crumb.section;

            return `
                <div class="flex items-center">
                    ${index > 0 ? '<span class="text-gray-500 mx-2">/</span>' : ''}
                    ${isClickable 
                        ? `<button data-breadcrumb-section="${crumb.section}" class="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                             <span class="mr-1">${crumb.icon}</span>${crumb.title}
                           </button>`
                        : `<span class="text-gray-300 text-sm">
                             <span class="mr-1">${crumb.icon}</span>${crumb.title}
                           </span>`
                    }
                </div>
            `;
        }).join('');

        // Add click handlers for breadcrumb navigation
        breadcrumbNav.querySelectorAll('[data-breadcrumb-section]').forEach(button => {
            this.addEventListener(button, 'click', (e) => {
                const section = e.currentTarget.dataset.breadcrumbSection;
                this.setActiveSection(section);
                this.handleSectionChange(section);
            });
        });
    }

    /**
     * Add breadcrumb to the navigation trail
     */
    addBreadcrumb(title, icon = '', data = null) {
        this.breadcrumbs.push({ title, icon, data });
        this.updateBreadcrumbs();
    }

    /**
     * Remove breadcrumbs from a specific index
     */
    removeBreadcrumbsFrom(index) {
        this.breadcrumbs = this.breadcrumbs.slice(0, index);
        this.updateBreadcrumbs();
    }

    /**
     * Clear all additional breadcrumbs
     */
    clearBreadcrumbs() {
        this.breadcrumbs = [];
        this.updateBreadcrumbs();
    }

    /**
     * Handle section change and routing
     */
    handleSectionChange(section, options = {}) {
        // Clear additional breadcrumbs when changing main sections
        this.clearBreadcrumbs();

        // Handle special actions for game modes
        const sectionData = this.sections[section];
        if (sectionData && sectionData.action) {
            this.executeAction(sectionData.action);
            return;
        }

        // Emit app mode change
        this.app.switchMode(section, options);

        // Store navigation state
        this.setState('navigation.history', {
            section,
            timestamp: Date.now(),
            options
        });
    }

    /**
     * Execute special actions (like starting game modes)
     */
    executeAction(action) {
        switch (action) {
            case 'startGame':
                // Hide navigation and dashboard, start survival mode
                this.hideDashboard();
                if (typeof window.startGame === 'function') {
                    window.startGame();
                }
                break;
            case 'startSandbox':
                // Hide navigation and dashboard, start sandbox mode
                this.hideDashboard();
                if (typeof window.startSandbox === 'function') {
                    window.startSandbox();
                }
                break;
            default:
                console.warn('Unknown action:', action);
        }
    }

    /**
     * Hide dashboard when starting game modes
     */
    hideDashboard() {
        const dashboard = this.app.getModule('dashboard');
        if (dashboard) {
            dashboard.hide();
        }
        
        // Hide main menu if visible
        const mainMenu = document.getElementById('main-menu-modal');
        if (mainMenu) {
            mainMenu.classList.add('hidden');
        }
    }

    /**
     * Navigate to a specific section with options
     */
    navigateTo(section, options = {}) {
        this.setActiveSection(section);
        this.handleSectionChange(section, options);
    }

    /**
     * Navigate to subsection within current section
     */
    navigateToSubsection(subsection, options = {}) {
        const currentSectionData = this.sections[this.currentSection];
        
        if (currentSectionData?.subsections?.[subsection]) {
            const subsectionData = currentSectionData.subsections[subsection];
            
            // Add subsection to breadcrumbs
            this.addBreadcrumb(subsectionData.title, subsectionData.icon, { subsection, options });
            
            // Emit subsection change
            this.emit('subsection-changed', {
                section: this.currentSection,
                subsection,
                subsectionData,
                options
            });

            // Update app mode with subsection
            this.app.switchMode(this.currentSection, { subsection, ...options });
        }
    }

    /**
     * Get current navigation state
     */
    getCurrentState() {
        return {
            section: this.currentSection,
            breadcrumbs: [...this.breadcrumbs],
            sectionData: this.sections[this.currentSection]
        };
    }

    /**
     * Restore navigation state
     */
    restoreState(state) {
        if (state.section) {
            this.setActiveSection(state.section);
        }
        
        if (state.breadcrumbs) {
            this.breadcrumbs = [...state.breadcrumbs];
            this.updateBreadcrumbs();
        }
    }

    /**
     * Subscribe to state changes
     */
    subscribeToState() {
        // Subscribe to navigation state changes
        this.subscribeToStateChange('navigation.currentSection', (section) => {
            if (section && section !== this.currentSection) {
                this.setActiveSection(section);
            }
        });
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Listen for app mode changes
        this.subscribeToEvent('app:mode-change', (data) => {
            if (data.mode !== this.currentSection) {
                this.setActiveSection(data.mode);
            }
        });

        // Listen for navigation requests from other components
        this.subscribeToEvent('navigation:request', (data) => {
            if (data.section) {
                this.navigateTo(data.section, data.options);
            } else if (data.subsection) {
                this.navigateToSubsection(data.subsection, data.options);
            }
        });

        // Handle browser back/forward buttons
        this.addEventListener(window, 'popstate', (e) => {
            if (e.state && e.state.section) {
                this.setActiveSection(e.state.section);
            }
        });
    }

    /**
     * Show navigation
     */
    show() {
        super.show();
        this.element.classList.remove('hidden');
    }

    /**
     * Hide navigation
     */
    hide() {
        super.hide();
        this.element.classList.add('hidden');
    }
}

export { Navigation };