/**
 * LeaderboardPageController - Main controller for Leaderboard page
 * Coordinates between leaderboard logic and UI components
 * No ranking logic - pure UI coordination
 */

import { getLeaderboardForChallenge, getUserRankInChallenge } from './mcqLeaderboard.logic.js';
import { getAllChallengesWithAttempts } from './mcqLeaderboard.datasource.js';
import { getAllChallenges } from '/src/challenges/mcq.data.js';

class LeaderboardPageController {
    constructor() {
        this.currentTab = 'mcq'; // 'mcq' or 'game'
        this.selectedChallengeId = null;
        this.availableChallenges = [];
        this.currentLeaderboard = null;
        this.userId = 'default-user'; // TODO: Get from auth system
    }

    /**
     * Initialize the controller
     */
    init() {
        console.log('Initializing LeaderboardPageController...');
        this.setupEventListeners();
        this.loadInitialData();
    }

    /**
     * Setup event listeners for UI interactions
     */
    setupEventListeners() {
        // Challenge selector change
        const challengeSelector = document.getElementById('challenge-selector');
        if (challengeSelector) {
            challengeSelector.addEventListener('change', (e) => {
                this.selectChallenge(e.target.value);
            });
        }
    }

    /**
     * Load initial data and render UI
     */
    async loadInitialData() {
        try {
            console.log('Loading initial leaderboard data...');
            
            // Load available challenges
            await this.loadAvailableChallenges();
            
            // Render tabs
            this.renderTabs();
            
            // Show MCQ leaderboard by default
            this.showMCQLeaderboard();
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load leaderboard data');
        }
    }

    /**
     * Load available challenges that have attempts
     */
    async loadAvailableChallenges() {
        try {
            // Get all challenges from data
            const allChallenges = getAllChallenges();
            
            // Get challenges that have attempts
            const challengesWithAttempts = getAllChallengesWithAttempts();
            
            // Filter challenges to only include those with attempts
            this.availableChallenges = allChallenges.filter(challenge => 
                challengesWithAttempts.includes(challenge.mcq_challenge_id)
            );
            
            console.log(`Found ${this.availableChallenges.length} challenges with attempts`);
            
        } catch (error) {
            console.error('Failed to load available challenges:', error);
            this.availableChallenges = [];
        }
    }

    /**
     * Render leaderboard tabs
     */
    renderTabs() {
        if (window.LeaderboardTabs) {
            window.LeaderboardTabs.render({
                currentTab: this.currentTab,
                onTabChange: (tab) => this.switchTab(tab)
            });
        }
    }

    /**
     * Switch between MCQ and Game leaderboard tabs
     * @param {string} tab - Tab name ('mcq' or 'game')
     */
    switchTab(tab) {
        if (tab === this.currentTab) return;
        
        this.currentTab = tab;
        
        // Re-render tabs to update active state
        this.renderTabs();
        
        // Show appropriate view
        if (tab === 'mcq') {
            this.showMCQLeaderboard();
        } else if (tab === 'game') {
            this.showGameLeaderboard();
        }
    }

    /**
     * Show MCQ leaderboard view
     */
    showMCQLeaderboard() {
        this.showView('mcq-leaderboard');
        
        // Populate challenge selector
        this.populateChallengeSelector();
        
        // If no challenge selected and challenges available, select first one
        if (!this.selectedChallengeId && this.availableChallenges.length > 0) {
            this.selectChallenge(this.availableChallenges[0].mcq_challenge_id);
        } else if (this.selectedChallengeId) {
            // Reload current challenge leaderboard
            this.loadLeaderboardForChallenge(this.selectedChallengeId);
        } else {
            // No challenges available
            this.renderEmptyMCQLeaderboard();
        }
    }

    /**
     * Show Game leaderboard view (Coming Soon)
     */
    showGameLeaderboard() {
        this.showView('game-leaderboard');
        
        // Render coming soon component
        if (window.ComingSoon) {
            window.ComingSoon.render({
                title: 'Game Leaderboard',
                subtitle: 'Complete challenges to prepare for competitive play',
                icon: '🎮'
            });
        }
    }

    /**
     * Populate challenge selector dropdown
     */
    populateChallengeSelector() {
        const selector = document.getElementById('challenge-selector');
        if (!selector) return;
        
        // Clear existing options except the first one
        selector.innerHTML = '<option value="">Choose a challenge...</option>';
        
        // Add available challenges
        this.availableChallenges.forEach(challenge => {
            const option = document.createElement('option');
            option.value = challenge.mcq_challenge_id;
            option.textContent = challenge.title;
            selector.appendChild(option);
        });
        
        // Set selected value if we have one
        if (this.selectedChallengeId) {
            selector.value = this.selectedChallengeId;
        }
    }

    /**
     * Select a challenge and load its leaderboard
     * @param {string} challengeId - Challenge ID
     */
    selectChallenge(challengeId) {
        if (!challengeId) {
            this.selectedChallengeId = null;
            this.renderEmptyMCQLeaderboard();
            return;
        }
        
        this.selectedChallengeId = challengeId;
        
        // Update selector
        const selector = document.getElementById('challenge-selector');
        if (selector) {
            selector.value = challengeId;
        }
        
        // Load leaderboard for selected challenge
        this.loadLeaderboardForChallenge(challengeId);
    }

    /**
     * Load leaderboard data for a specific challenge
     * @param {string} challengeId - Challenge ID
     */
    async loadLeaderboardForChallenge(challengeId) {
        try {
            console.log('Loading leaderboard for challenge:', challengeId);
            
            // Get leaderboard data from logic layer
            const leaderboardData = getLeaderboardForChallenge(challengeId);
            
            // Store current leaderboard
            this.currentLeaderboard = leaderboardData;
            
            // Find challenge details
            const challengeDetails = this.availableChallenges.find(c => c.mcq_challenge_id === challengeId);
            
            // Render leaderboard table
            this.renderMCQLeaderboardTable(leaderboardData, challengeDetails);
            
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            this.showError('Failed to load leaderboard data');
        }
    }

    /**
     * Render MCQ leaderboard table
     * @param {Object} leaderboardData - Leaderboard data from logic layer
     * @param {Object} challengeDetails - Challenge details
     */
    renderMCQLeaderboardTable(leaderboardData, challengeDetails) {
        if (window.MCQLeaderboardTable) {
            window.MCQLeaderboardTable.render({
                leaderboardData,
                challengeDetails,
                currentUserId: this.userId
            });
        }
    }

    /**
     * Render empty MCQ leaderboard state
     */
    renderEmptyMCQLeaderboard() {
        if (window.MCQLeaderboardTable) {
            window.MCQLeaderboardTable.renderEmpty({
                message: this.availableChallenges.length === 0 
                    ? 'No challenges with attempts found.' 
                    : 'Select a challenge to view leaderboard.'
            });
        }
    }

    /**
     * Show specific view
     * @param {string} viewName - View name
     */
    showView(viewName) {
        // Hide all views
        const views = ['loading-state', 'mcq-leaderboard-view', 'game-leaderboard-view', 'error-state'];
        views.forEach(viewId => {
            const element = document.getElementById(viewId);
            if (element) {
                element.classList.add('hidden');
            }
        });

        // Show target view
        let targetViewId;
        switch (viewName) {
            case 'mcq-leaderboard':
                targetViewId = 'mcq-leaderboard-view';
                break;
            case 'game-leaderboard':
                targetViewId = 'game-leaderboard-view';
                break;
            case 'error':
                targetViewId = 'error-state';
                break;
            default:
                targetViewId = 'loading-state';
        }

        const targetView = document.getElementById(targetViewId);
        if (targetView) {
            targetView.classList.remove('hidden');
        }
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        this.showView('error');
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }

    /**
     * Get user's rank in current challenge
     * @returns {Object} User rank information
     */
    getCurrentUserRank() {
        if (!this.selectedChallengeId) {
            return { found: false };
        }
        
        return getUserRankInChallenge(this.selectedChallengeId, this.userId);
    }

    /**
     * Refresh current leaderboard
     */
    refresh() {
        if (this.selectedChallengeId) {
            this.loadLeaderboardForChallenge(this.selectedChallengeId);
        } else {
            this.loadInitialData();
        }
    }

    /**
     * Get current state for debugging
     * @returns {Object} Current state
     */
    getState() {
        return {
            currentTab: this.currentTab,
            selectedChallengeId: this.selectedChallengeId,
            availableChallenges: this.availableChallenges.length,
            hasLeaderboard: !!this.currentLeaderboard,
            leaderboardEntries: this.currentLeaderboard?.leaderboard?.length || 0
        };
    }
}

// Create and export global instance
window.LeaderboardPageController = new LeaderboardPageController();