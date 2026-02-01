/**
 * Dashboard - Central hub interface with user stats and recommendations
 * Provides navigation to all application sections and displays user progress
 */
import { BaseComponent } from '../BaseComponent.js';

class Dashboard extends BaseComponent {
    constructor(app) {
        super(app, 'dashboard-container');
        this.userStats = null;
        this.recommendations = [];
        this.recentActivities = [];
    }

    /**
     * Component-specific setup
     */
    async setup() {
        // Create dashboard container if it doesn't exist
        if (!this.element) {
            this.element = this.createElement('div', {
                id: 'dashboard-container'
            }, ['dashboard', 'w-full', 'h-full', 'p-6', 'overflow-y-auto']);
            
            // Add to UI container
            const uiContainer = document.getElementById('ui-container');
            if (uiContainer) {
                uiContainer.appendChild(this.element);
            } else {
                // Fallback: add to body if ui-container doesn't exist
                document.body.appendChild(this.element);
            }
        }

        // Initialize dashboard sections
        this.createDashboardLayout();
        this.loadUserStats();
        this.loadRecommendations();
        this.loadRecentActivities();
        this.createQuickActions();
    }

    /**
     * Create the dashboard layout structure
     */
    createDashboardLayout() {
        this.element.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <!-- Dashboard Header -->
                <div class="mb-8">
                    <h1 class="text-4xl font-bold text-white mb-2">Cloud Learning Dashboard</h1>
                    <p class="text-gray-400">Welcome back! Continue your cloud computing journey.</p>
                </div>

                <!-- Quick Stats Grid -->
                <div id="stats-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <!-- Stats cards will be populated here -->
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Recent Activities -->
                    <div class="lg:col-span-2">
                        <div class="glass-panel p-6 rounded-xl">
                            <h2 class="text-xl font-bold text-white mb-4">Recent Activities</h2>
                            <div id="recent-activities" class="space-y-3">
                                <!-- Activities will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- Recommendations -->
                    <div class="lg:col-span-1">
                        <div class="glass-panel p-6 rounded-xl">
                            <h2 class="text-xl font-bold text-white mb-4">Recommended for You</h2>
                            <div id="recommendations" class="space-y-3">
                                <!-- Recommendations will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Learning Progress -->
                <div class="mt-8">
                    <div class="glass-panel p-6 rounded-xl">
                        <h2 class="text-xl font-bold text-white mb-4">Learning Progress</h2>
                        <div id="learning-progress" class="space-y-4">
                            <!-- Progress bars will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="mt-8">
                    <div class="glass-panel p-6 rounded-xl">
                        <h2 class="text-xl font-bold text-white mb-4">Quick Actions</h2>
                        <div id="quick-actions" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <!-- Action buttons will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Load and display user statistics
     */
    loadUserStats() {
        // Get user stats from state
        const userProfile = this.getState('user.profile') || {};
        const gameStats = this.getState('game.statistics') || {};
        const learningProgress = this.getState('user.learning.progress') || {};

        this.userStats = {
            totalPlayTime: gameStats.totalPlayTime || 0,
            challengesCompleted: learningProgress.completedChallenges?.length || 0,
            tutorialsCompleted: learningProgress.completedTutorials?.length || 0,
            currentLevel: learningProgress.currentLevel || 1,
            achievementsEarned: userProfile.achievements?.length || 0,
            survivalHighScore: gameStats.highScore || 0
        };

        this.renderStatsGrid();
    }

    /**
     * Render the statistics grid
     */
    renderStatsGrid() {
        const statsGrid = this.querySelector('#stats-grid');
        if (!statsGrid) return;

        const stats = [
            {
                title: 'Current Level',
                value: this.userStats.currentLevel,
                icon: '🎯',
                color: 'text-blue-400'
            },
            {
                title: 'Challenges Completed',
                value: this.userStats.challengesCompleted,
                icon: '🏆',
                color: 'text-green-400'
            },
            {
                title: 'Tutorials Finished',
                value: this.userStats.tutorialsCompleted,
                icon: '📚',
                color: 'text-purple-400'
            },
            {
                title: 'Achievements',
                value: this.userStats.achievementsEarned,
                icon: '⭐',
                color: 'text-yellow-400'
            }
        ];

        statsGrid.innerHTML = stats.map(stat => `
            <div class="glass-panel p-4 rounded-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-400 text-sm">${stat.title}</p>
                        <p class="text-2xl font-bold text-white">${stat.value}</p>
                    </div>
                    <div class="text-3xl ${stat.color}">${stat.icon}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Load personalized recommendations
     */
    loadRecommendations() {
        const userLevel = this.userStats?.currentLevel || 1;
        const completedChallenges = this.getState('user.learning.progress.completedChallenges') || [];
        const completedTutorials = this.getState('user.learning.progress.completedTutorials') || [];

        // Generate recommendations based on user progress
        this.recommendations = [];

        // Recommend next tutorial if user hasn't completed basic ones
        if (completedTutorials.length < 3) {
            this.recommendations.push({
                type: 'tutorial',
                title: 'Complete Basic Cloud Concepts',
                description: 'Learn fundamental cloud computing principles',
                action: 'start-tutorial',
                actionData: { tutorialId: 'cloud-basics' },
                priority: 'high'
            });
        }

        // Recommend challenges based on level
        if (userLevel >= 2 && completedChallenges.length < 5) {
            this.recommendations.push({
                type: 'challenge',
                title: 'Try Infrastructure Challenges',
                description: 'Test your skills with hands-on scenarios',
                action: 'start-challenge',
                actionData: { difficulty: 'beginner' },
                priority: 'medium'
            });
        }

        // Recommend sandbox mode for exploration
        this.recommendations.push({
            type: 'sandbox',
            title: 'Explore Sandbox Mode',
            description: 'Experiment freely with cloud components',
            action: 'start-sandbox',
            actionData: {},
            priority: 'low'
        });

        this.renderRecommendations();
    }

    /**
     * Render recommendations section
     */
    renderRecommendations() {
        const recommendationsContainer = this.querySelector('#recommendations');
        if (!recommendationsContainer) return;

        if (this.recommendations.length === 0) {
            recommendationsContainer.innerHTML = `
                <p class="text-gray-400 text-center py-4">No recommendations available</p>
            `;
            return;
        }

        recommendationsContainer.innerHTML = this.recommendations.map(rec => `
            <div class="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition cursor-pointer"
                 data-action="${rec.action}" data-action-data='${JSON.stringify(rec.actionData)}'>
                <h3 class="font-semibold text-white mb-1">${rec.title}</h3>
                <p class="text-gray-400 text-sm mb-2">${rec.description}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xs px-2 py-1 rounded ${this.getPriorityColor(rec.priority)}">${rec.priority.toUpperCase()}</span>
                    <span class="text-blue-400 text-sm">→</span>
                </div>
            </div>
        `).join('');

        // Add click handlers for recommendations
        recommendationsContainer.querySelectorAll('[data-action]').forEach(element => {
            this.addEventListener(element, 'click', (e) => {
                const action = e.currentTarget.dataset.action;
                const actionData = JSON.parse(e.currentTarget.dataset.actionData || '{}');
                this.handleRecommendationClick(action, actionData);
            });
        });
    }

    /**
     * Get CSS class for priority color
     */
    getPriorityColor(priority) {
        switch (priority) {
            case 'high': return 'bg-red-600 text-white';
            case 'medium': return 'bg-yellow-600 text-white';
            case 'low': return 'bg-gray-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    }

    /**
     * Load recent activities
     */
    loadRecentActivities() {
        // Get recent activities from state
        const recentActivities = this.getState('user.recentActivities') || [];
        
        // If no activities, create some sample ones based on user progress
        if (recentActivities.length === 0) {
            const completedTutorials = this.getState('user.learning.progress.completedTutorials') || [];
            const completedChallenges = this.getState('user.learning.progress.completedChallenges') || [];
            
            this.recentActivities = [];
            
            // Add recent tutorial completions
            completedTutorials.slice(-3).forEach(tutorial => {
                this.recentActivities.push({
                    type: 'tutorial',
                    title: `Completed Tutorial: ${tutorial.name || tutorial}`,
                    timestamp: new Date(Date.now() - Math.random() * 86400000), // Random time in last day
                    icon: '📚'
                });
            });
            
            // Add recent challenge completions
            completedChallenges.slice(-2).forEach(challenge => {
                this.recentActivities.push({
                    type: 'challenge',
                    title: `Completed Challenge: ${challenge.name || challenge}`,
                    timestamp: new Date(Date.now() - Math.random() * 86400000),
                    icon: '🏆'
                });
            });
            
            // Sort by timestamp
            this.recentActivities.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            this.recentActivities = recentActivities;
        }

        this.renderRecentActivities();
    }

    /**
     * Render recent activities section
     */
    renderRecentActivities() {
        const activitiesContainer = this.querySelector('#recent-activities');
        if (!activitiesContainer) return;

        if (this.recentActivities.length === 0) {
            activitiesContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-400 mb-4">No recent activities</p>
                    <p class="text-gray-500 text-sm">Start learning to see your progress here!</p>
                </div>
            `;
            return;
        }

        activitiesContainer.innerHTML = this.recentActivities.map(activity => `
            <div class="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                <div class="text-2xl">${activity.icon}</div>
                <div class="flex-1">
                    <p class="text-white font-medium">${activity.title}</p>
                    <p class="text-gray-400 text-sm">${this.formatTimestamp(activity.timestamp)}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Format timestamp for display
     */
    formatTimestamp(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    }

    /**
     * Handle recommendation click
     */
    handleRecommendationClick(action, actionData) {
        this.emit('recommendation-clicked', { action, actionData });
        
        // Navigate based on action
        switch (action) {
            case 'start-tutorial':
                this.app.switchMode('learn', { tutorialId: actionData.tutorialId });
                break;
            case 'start-challenge':
                this.app.switchMode('play', { mode: 'challenge', difficulty: actionData.difficulty });
                break;
            case 'start-sandbox':
                this.app.switchMode('play', { mode: 'sandbox' });
                break;
            default:
                console.warn('Unknown recommendation action:', action);
        }
    }

    /**
     * Create quick actions section
     */
    createQuickActions() {
        const quickActionsContainer = this.querySelector('#quick-actions');
        if (!quickActionsContainer) return;

        const quickActions = [
            {
                title: 'Start Survival',
                description: 'Begin survival mode',
                icon: '⚡',
                action: () => this.startSurvivalMode(),
                color: 'bg-green-600 hover:bg-green-500'
            },
            {
                title: 'Sandbox Mode',
                description: 'Free exploration',
                icon: '🛠️',
                action: () => this.startSandboxMode(),
                color: 'bg-purple-600 hover:bg-purple-500'
            },
            {
                title: 'Learn',
                description: 'Tutorials & guides',
                icon: '📚',
                action: () => this.openLearnMode(),
                color: 'bg-blue-600 hover:bg-blue-500'
            },
            {
                title: 'Achievements',
                description: 'View progress',
                icon: '🏆',
                action: () => this.openAchievements(),
                color: 'bg-yellow-600 hover:bg-yellow-500'
            }
        ];

        quickActionsContainer.innerHTML = quickActions.map(action => `
            <button class="quick-action-btn ${action.color} text-white font-bold py-4 px-6 rounded-lg shadow-lg transform transition hover:scale-105"
                    data-action="${action.title.toLowerCase().replace(' ', '-')}">
                <div class="text-3xl mb-2">${action.icon}</div>
                <div class="text-lg font-bold">${action.title}</div>
                <div class="text-sm opacity-80">${action.description}</div>
            </button>
        `).join('');

        // Add click handlers
        quickActionsContainer.querySelectorAll('[data-action]').forEach(button => {
            const actionName = button.dataset.action;
            const action = quickActions.find(a => a.title.toLowerCase().replace(' ', '-') === actionName);
            if (action) {
                this.addEventListener(button, 'click', action.action);
            }
        });
    }

    /**
     * Quick action methods
     */
    startSurvivalMode() {
        // Hide dashboard and start survival mode
        this.hide();
        if (typeof window.startGame === 'function') {
            window.startGame();
        }
    }

    startSandboxMode() {
        // Hide dashboard and start sandbox mode
        this.hide();
        if (typeof window.startSandbox === 'function') {
            window.startSandbox();
        }
    }

    openLearnMode() {
        const navigation = this.app.getModule('navigation');
        if (navigation) {
            navigation.setActiveSection('learn');
        }
    }

    openAchievements() {
        const navigation = this.app.getModule('navigation');
        if (navigation) {
            navigation.setActiveSection('profile');
            navigation.navigateToSubsection('achievements');
        }
    }

    /**
     * Update user statistics display
     */
    updateUserStats() {
        this.loadUserStats();
    }

    /**
     * Display personalized recommendations
     */
    displayRecommendations() {
        this.loadRecommendations();
    }

    /**
     * Handle navigation to different sections
     */
    handleNavigation(section, options = {}) {
        this.emit('navigation-requested', { section, options });
    }

    /**
     * Subscribe to state changes
     */
    subscribeToState() {
        // Subscribe to user profile changes
        this.subscribeToStateChange('user.profile', () => {
            this.updateUserStats();
        });

        // Subscribe to learning progress changes
        this.subscribeToStateChange('user.learning.progress', () => {
            this.updateUserStats();
            this.loadRecommendations();
        });

        // Subscribe to recent activities changes
        this.subscribeToStateChange('user.recentActivities', () => {
            this.loadRecentActivities();
        });
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Listen for app mode changes to show/hide dashboard
        this.subscribeToEvent('app:mode-change', (data) => {
            if (data.mode === 'dashboard' || data.mode === 'home') {
                this.show();
            } else {
                this.hide();
            }
        });

        // Listen for data updates
        this.subscribeToEvent('user:progress-updated', () => {
            this.updateUserStats();
            this.loadRecommendations();
            this.loadRecentActivities();
        });
    }

    /**
     * Show the dashboard
     */
    show() {
        super.show();
        // Refresh data when showing
        this.updateUserStats();
        this.displayRecommendations();
        this.loadRecentActivities();
    }
}

export { Dashboard };