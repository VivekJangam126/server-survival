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
        if (this.isLoaded) {
            console.log('Navbar already loaded, skipping');
            return;
        }

        console.log('Starting navbar load...');
        
        try {
            // Remove any existing static navbar
            this.removeStaticNavbars();
            
            // Load navbar HTML
            console.log('Fetching navbar HTML from /shared/navbar/navbar.html');
            const response = await fetch('/shared/navbar/navbar.html');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch navbar HTML: ${response.status} ${response.statusText}`);
            }
            
            const navbarHTML = await response.text();
            console.log('Navbar HTML fetched successfully, length:', navbarHTML.length);
            
            // Create navbar container
            const navbarContainer = document.createElement('div');
            navbarContainer.innerHTML = navbarHTML;
            
            console.log('Navbar container created, first element:', navbarContainer.firstElementChild?.tagName);
            
            // Insert at the beginning of body
            document.body.insertBefore(navbarContainer.firstElementChild, document.body.firstChild);
            console.log('Navbar inserted into DOM');
            
            // Set active page
            this.setActivePage(this.currentPage);
            console.log('Active page set to:', this.currentPage);
            
            // Add styles
            this.addStyles();
            console.log('Styles added');
            
            // Load profile data
            this.loadProfileData();
            console.log('Profile data loaded');
            
            // Ensure navbar is visible
            this.show();
            console.log('Navbar show() called');
            
            this.isLoaded = true;
            console.log('Shared navbar loaded successfully');
            
            // Verify navbar is visible
            const navbar = document.getElementById('shared-navbar');
            if (navbar) {
                console.log('Navbar element found, display:', navbar.style.display, 'offsetHeight:', navbar.offsetHeight);
            } else {
                console.error('Navbar element not found after insertion!');
            }
            
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
        } else if (filename === 'sandbox.html') {
            return 'sandbox';
        } else if (filename === 'learn.html') {
            return 'learn';
        } else if (filename === 'challenges.html') {
            return 'challenges';
        } else if (filename === 'leaderboard.html') {
            return 'leaderboard';
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

            /* Profile Card Styles */
            .profile-container {
                position: relative;
            }

            #profile-card {
                transform: translateY(-5px);
                transition: all 0.2s ease-in-out;
                backdrop-filter: blur(12px);
                border: 1px solid rgba(75, 85, 99, 0.5);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                max-width: 280px;
                min-width: 250px;
            }

            #profile-card.opacity-100 {
                transform: translateY(0);
            }

            #profile-card:before {
                content: '';
                position: absolute;
                top: -6px;
                right: 20px;
                width: 12px;
                height: 12px;
                background: #1f2937;
                border: 1px solid rgba(75, 85, 99, 0.5);
                border-bottom: none;
                border-right: none;
                transform: rotate(45deg);
            }

            /* Responsive profile card positioning */
            @media (max-width: 1024px) {
                #profile-card {
                    right: -50px;
                    max-width: 240px;
                    min-width: 220px;
                }
            }

            @media (max-width: 768px) {
                #profile-card {
                    right: -100px;
                    max-width: 200px;
                    min-width: 180px;
                }
                
                #profile-card:before {
                    right: 120px;
                }
            }

            /* Profile hover effects */
            #profile-button:hover .w-8 {
                transform: scale(1.1);
                transition: transform 0.2s ease;
            }

            /* Profile avatar gradient animation */
            #profile-button .bg-gradient-to-r {
                background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4);
                background-size: 200% 200%;
                animation: gradientShift 3s ease infinite;
            }

            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
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

            /* Mobile profile adjustments */
            @media (max-width: 768px) {
                .profile-container {
                    display: none;
                }
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

    /**
     * Load profile data and update profile card
     */
    loadProfileData() {
        // Use the global function
        if (typeof window.loadProfileData === 'function') {
            window.loadProfileData();
        }
    }
}

// Global navigation functions
window.navigateToPage = function(url, page) {
    console.log(`Navigating to ${url} (${page})`);
    
    // Convert relative URLs to absolute URLs from root
    let targetUrl = url;
    
    // If URL starts with '/', it's already absolute from root
    if (url.startsWith('/')) {
        targetUrl = window.location.origin + url;
    } else if (!url.startsWith('http') && !url.startsWith('./')) {
        // If URL doesn't start with '/', 'http', or './', make it relative to root
        const baseUrl = window.location.origin;
        targetUrl = baseUrl + '/' + url;
    } else if (url.startsWith('./')) {
        // Handle relative paths by resolving them properly
        const currentPath = window.location.pathname;
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
        const baseUrl = window.location.origin;
        targetUrl = baseUrl + currentDir + '/' + url.substring(2);
    }
    
    // Handle special cases
    if (page === 'play' && url.includes('play.html')) {
        // For game page, show main menu instead of starting game immediately
        sessionStorage.setItem('showMainMenu', 'true');
    } else if (page === 'home' && url.includes('index.html')) {
        // For home page, clear any stored modes
        sessionStorage.removeItem('startMode');
        sessionStorage.removeItem('showMainMenu');
    }
    
    console.log(`Resolved URL: ${targetUrl}`);
    
    // Navigate to the page
    window.location.href = targetUrl;
};

// Profile card functions
window.showProfileCard = function() {
    const profileCard = document.getElementById('profile-card');
    if (profileCard) {
        profileCard.classList.remove('opacity-0', 'invisible');
        profileCard.classList.add('opacity-100', 'visible');
    }
};

window.hideProfileCard = function() {
    const profileCard = document.getElementById('profile-card');
    if (profileCard) {
        profileCard.classList.remove('opacity-100', 'visible');
        profileCard.classList.add('opacity-0', 'invisible');
    }
};

// Profile data management
window.updateProfileCard = function(profileData) {
    const {
        username = 'Player',
        level = 1,
        totalScore = 0,
        challengesCompleted = 0,
        progressPercentage = 0
    } = profileData;

    // Update profile button
    const profileUsername = document.getElementById('profile-username');
    if (profileUsername) {
        profileUsername.textContent = username;
    }

    // Update profile card
    const cardUsername = document.getElementById('card-username');
    const cardLevel = document.getElementById('card-level');
    const cardScore = document.getElementById('card-score');
    const cardChallenges = document.getElementById('card-challenges');
    const cardProgressText = document.getElementById('card-progress-text');
    const cardProgressBar = document.getElementById('card-progress-bar');

    if (cardUsername) cardUsername.textContent = username;
    if (cardLevel) cardLevel.textContent = `Level ${level}`;
    if (cardScore) cardScore.textContent = totalScore.toLocaleString();
    if (cardChallenges) cardChallenges.textContent = challengesCompleted;
    if (cardProgressText) cardProgressText.textContent = `${progressPercentage}%`;
    if (cardProgressBar) cardProgressBar.style.width = `${progressPercentage}%`;
};

// Load profile data from localStorage or default values
window.loadProfileData = function() {
    try {
        // Try to get profile data from the state management system first
        let profileData = null;
        
        // Check if we have access to the state manager (for pages with the full app)
        if (typeof window.stateManager !== 'undefined' && window.stateManager) {
            profileData = window.stateManager.getState('user.profile');
        }
        
        // Fallback to localStorage
        if (!profileData) {
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                profileData = JSON.parse(savedProfile);
            }
        }
        
        // Use default values if no profile data found
        if (!profileData) {
            profileData = {
                name: 'Cloud Learner',
                title: 'Aspiring Cloud Architect',
                level: 1,
                xp: 0,
                streak: 0,
                avatar: 'U'
            };
        }
        
        // Calculate derived values for the profile card
        const challengesCompleted = profileData.challengesCompleted || Math.floor(profileData.xp / 100) || 0;
        const progressPercentage = Math.min(100, Math.floor((profileData.xp % 1000) / 10)) || 0;
        
        // Update the profile card with the loaded data
        window.updateProfileCard({
            username: profileData.name || 'Cloud Learner',
            level: profileData.level || 1,
            totalScore: profileData.xp || 0,
            challengesCompleted: challengesCompleted,
            progressPercentage: progressPercentage
        });
        
    } catch (error) {
        console.error('Error loading profile data:', error);
        // Use default values on error
        window.updateProfileCard({
            username: 'Cloud Learner',
            level: 1,
            totalScore: 0,
            challengesCompleted: 0,
            progressPercentage: 0
        });
    }
};

// Save profile data (utility function for other parts of the app)
window.saveProfileData = function(profileData) {
    try {
        // Save to localStorage as backup
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        
        // Update state manager if available
        if (typeof window.stateManager !== 'undefined' && window.stateManager) {
            window.stateManager.setState('user.profile', profileData);
        }
        
        // Refresh the profile card
        window.loadProfileData();
        
        console.log('Profile data saved successfully');
    } catch (error) {
        console.error('Error saving profile data:', error);
    }
};

// Update profile data (for incremental updates like XP gains)
window.updateProfileData = function(updates) {
    try {
        // Get current profile data
        let currentProfile = null;
        
        if (typeof window.stateManager !== 'undefined' && window.stateManager) {
            currentProfile = window.stateManager.getState('user.profile');
        }
        
        if (!currentProfile) {
            const savedProfile = localStorage.getItem('userProfile');
            currentProfile = savedProfile ? JSON.parse(savedProfile) : {
                name: 'Cloud Learner',
                title: 'Aspiring Cloud Architect',
                level: 1,
                xp: 0,
                streak: 0,
                avatar: 'U'
            };
        }
        
        // Merge updates
        const updatedProfile = { ...currentProfile, ...updates };
        
        // Save the updated profile
        window.saveProfileData(updatedProfile);
        
    } catch (error) {
        console.error('Error updating profile data:', error);
    }
};

window.toggleSharedMobileMenu = function() {
    const mobileMenu = document.getElementById('shared-mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
};

// Global navbar instance
console.log('Creating global navbar instance...');
window.sharedNavbar = new SharedNavbar();
console.log('Navbar instance created, readyState:', document.readyState);

// Auto-load navbar when DOM is ready
if (document.readyState === 'loading') {
    console.log('Document still loading, adding DOMContentLoaded listener');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded fired, loading navbar');
        window.sharedNavbar.load();
    });
} else {
    console.log('Document already loaded, loading navbar immediately');
    window.sharedNavbar.load();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedNavbar;
}