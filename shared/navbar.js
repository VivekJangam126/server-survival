/**
 * Shared Navigation Bar Component
 * Provides consistent navigation across all pages
 */

class SharedNavbar {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.isLoaded = false;
        this.isHidden = false;
    }

    /**
     * Load and initialize the shared navbar
     */
    async load() {
        if (this.isLoaded) return;

        try {
            // Remove any existing static navbar
            this.removeStaticNavbars();
            
            // Load navbar HTML
            const response = await fetch('shared/navbar.html');
            const navbarHTML = await response.text();
            
            // Create navbar container
            const navbarContainer = document.createElement('div');
            navbarContainer.innerHTML = navbarHTML;
            
            // Insert at the beginning of body
            document.body.insertBefore(navbarContainer.firstElementChild, document.body.firstChild);
            
            // Set active page
            this.setActivePage(this.currentPage);
            
            // Add styles
            this.addStyles();
            
            // Ensure navbar is visible
            this.show();
            
            this.isLoaded = true;
            console.log('Shared navbar loaded successfully');
            
        } catch (error) {
            console.error('Failed to load shared navbar:', error);
        }
    }

    /**
     * Remove any existing static navbars to avoid duplication
     */
    removeStaticNavbars() {
        // Remove static navbars by common selectors
        const staticNavbars = document.querySelectorAll('nav:not(#shared-navbar), #game-navbar');
        staticNavbars.forEach(navbar => {
            if (navbar.id !== 'shared-navbar') {
                navbar.remove();
            }
        });
    }

    /**
     * Detect current page based on URL
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        if (filename === '' || filename === 'index.html') {
            return 'home';
        } else if (filename === 'dashboard.html' || filename === 'dashboard-fixed.html') {
            return 'dashboard';
        } else if (filename === 'play.html') {
            return 'game';
        } else if (filename === 'learn.html') {
            return 'learn';
        } else if (filename === 'analysis.html') {
            return 'analysis';
        } else if (filename === 'profile.html') {
            return 'profile';
        } else {
            return 'other';
        }
    }

    /**
     * Set active page styling
     */
    setActivePage(page) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item, .nav-item-mobile').forEach(item => {
            item.classList.remove('active', 'bg-gray-900', 'text-white');
            item.classList.add('text-gray-300');
        });

        // Add active class to current page
        document.querySelectorAll(`[data-page="${page}"]`).forEach(item => {
            item.classList.remove('text-gray-300');
            item.classList.add('active', 'bg-gray-900', 'text-white');
        });
    }

    /**
     * Add required styles
     */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Shared Navbar Styles */
            #shared-navbar {
                z-index: 1000;
                display: block !important;
            }
            
            /* Ensure desktop navigation is visible */
            #shared-navbar .hidden.md\\:flex {
                display: flex !important;
            }
            
            @media (max-width: 768px) {
                #shared-navbar .hidden.md\\:flex {
                    display: none !important;
                }
            }
            
            .nav-item, .nav-item-mobile {
                transition: all 0.2s ease;
            }
            
            .nav-item:hover, .nav-item-mobile:hover {
                color: white !important;
                background-color: #374151 !important;
            }
            
            .nav-item.active, .nav-item-mobile.active {
                color: white !important;
                background-color: #1f2937 !important;
            }
            
            /* Adjust page content for navbar */
            body {
                padding-top: 64px;
            }
            
            /* Specific adjustments for different pages */
            #main-menu-modal {
                top: 64px;
                height: calc(100vh - 64px);
            }
            
            #canvas-container {
                padding-top: 0;
            }
            
            /* Hide navbar during gameplay */
            body.gameplay #shared-navbar {
                display: none !important;
            }
            
            body.gameplay {
                padding-top: 0;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Show navbar
     */
    show() {
        const navbar = document.getElementById('shared-navbar');
        if (navbar) {
            navbar.style.display = 'block';
            document.body.classList.remove('gameplay');
            this.isHidden = false;
            
            // Ensure navigation items are visible on desktop
            const navItems = navbar.querySelector('.hidden.md\\:flex');
            if (navItems && window.innerWidth >= 768) {
                navItems.style.display = 'flex';
            }
        }
    }

    /**
     * Hide navbar (for gameplay)
     */
    hide() {
        const navbar = document.getElementById('shared-navbar');
        if (navbar) {
            navbar.style.display = 'none';
            document.body.classList.add('gameplay');
            this.isHidden = true;
        }
    }

    /**
     * Toggle navbar visibility
     */
    toggle() {
        if (this.isHidden) {
            this.show();
        } else {
            this.hide();
        }
    }
}

// Global navigation functions
window.navigateToPage = function(url, page) {
    console.log(`Navigating to ${url} (${page})`);
    
    // Handle special cases
    if (page === 'sandbox' && url === 'play.html') {
        // Store intent to start sandbox mode
        sessionStorage.setItem('startMode', 'sandbox');
    } else if (page === 'play' && url === 'play.html') {
        // For game page, show main menu instead of starting game immediately
        sessionStorage.setItem('showMainMenu', 'true');
    } else if (page === 'home' && url === 'index.html') {
        // For home page, clear any stored modes
        sessionStorage.removeItem('startMode');
        sessionStorage.removeItem('showMainMenu');
    }
    
    // Navigate to the page
    window.location.href = url;
};

window.toggleSharedMobileMenu = function() {
    const mobileMenu = document.getElementById('shared-mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
};

// Global navbar instance
window.sharedNavbar = new SharedNavbar();

// Auto-load navbar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sharedNavbar.load();
    });
} else {
    window.sharedNavbar.load();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedNavbar;
}