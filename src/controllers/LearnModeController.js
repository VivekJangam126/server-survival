/**
 * LearnModeController - Manages the Learn mode with tutorials, concepts, and videos
 */
import { BaseModeController } from '../core/BaseModeController.js';

class LearnModeController extends BaseModeController {
    constructor(app) {
        super(app, 'Learn');
        this.currentSubmode = 'tutorials';
        this.currentTutorial = null;
        this.tutorialProgress = {};
        this.learningPath = [];
    }

    /**
     * Initialize Learn mode specific logic
     */
    async initializeMode() {
        // Create Learn mode UI
        this.createLearnModeUI();
        
        // Load learning content
        await this.loadLearningContent();
        
        // Set up progress tracking
        this.setupProgressTracking();
        
        // Add transition effects
        this.addTransitionEffects();
    }

    /**
     * Create Learn mode UI
     */
    createLearnModeUI() {
        this.container.innerHTML = `
            <div class="learn-mode-header">
                <div class="mode-title">
                    <h1>📚 Learn Mode</h1>
                    <p>Master cloud computing through interactive tutorials</p>
                </div>
                <div class="progress-overview">
                    <div class="progress-stat">
                        <span class="stat-value" id="completed-tutorials">0</span>
                        <span class="stat-label">Tutorials Completed</span>
                    </div>
                    <div class="progress-stat">
                        <span class="stat-value" id="current-level">1</span>
                        <span class="stat-label">Current Level</span>
                    </div>
                    <div class="progress-stat">
                        <span class="stat-value" id="learning-streak">0</span>
                        <span class="stat-label">Day Streak</span>
                    </div>
                </div>
            </div>
            
            <div class="learn-mode-content">
                <div class="submode-tabs">
                    <button class="tab-btn active" data-submode="tutorials">
                        📖 Tutorials
                    </button>
                    <button class="tab-btn" data-submode="concepts">
                        🧠 Concepts
                    </button>
                    <button class="tab-btn" data-submode="videos">
                        🎥 Videos
                    </button>
                </div>
                
                <div class="submode-content">
                    <!-- Tutorials Tab -->
                    <div class="tab-content active" id="tutorials-content">
                        <div class="learning-path">
                            <h2>Your Learning Path</h2>
                            <div class="path-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 0%"></div>
                                </div>
                                <span class="progress-text">0% Complete</span>
                            </div>
                        </div>
                        
                        <div class="tutorial-categories">
                            <div class="category-card" data-category="basics">
                                <div class="category-icon">🌟</div>
                                <h3>Cloud Basics</h3>
                                <p>Start your cloud journey with fundamental concepts</p>
                                <div class="category-progress">
                                    <span class="progress-count">0/5 completed</span>
                                </div>
                                <button class="category-btn">Start Learning</button>
                            </div>
                            
                            <div class="category-card locked" data-category="infrastructure">
                                <div class="category-icon">🏗️</div>
                                <h3>Infrastructure</h3>
                                <p>Learn about servers, networks, and cloud architecture</p>
                                <div class="category-progress">
                                    <span class="progress-count">0/8 completed</span>
                                </div>
                                <button class="category-btn" disabled>🔒 Locked</button>
                            </div>
                            
                            <div class="category-card locked" data-category="security">
                                <div class="category-icon">🔐</div>
                                <h3>Security</h3>
                                <p>Master cloud security best practices</p>
                                <div class="category-progress">
                                    <span class="progress-count">0/6 completed</span>
                                </div>
                                <button class="category-btn" disabled>🔒 Locked</button>
                            </div>
                            
                            <div class="category-card locked" data-category="advanced">
                                <div class="category-icon">🚀</div>
                                <h3>Advanced Topics</h3>
                                <p>Dive deep into advanced cloud concepts</p>
                                <div class="category-progress">
                                    <span class="progress-count">0/10 completed</span>
                                </div>
                                <button class="category-btn" disabled>🔒 Locked</button>
                            </div>
                        </div>
                        
                        <div class="recommended-tutorials">
                            <h3>Recommended for You</h3>
                            <div class="tutorial-list" id="recommended-list">
                                <!-- Will be populated dynamically -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Concepts Tab -->
                    <div class="tab-content hidden" id="concepts-content">
                        <div class="concepts-grid">
                            <div class="concept-card" data-concept="virtualization">
                                <div class="concept-icon">💻</div>
                                <h3>Virtualization</h3>
                                <p>Understanding virtual machines and containers</p>
                                <div class="concept-status">Not Started</div>
                            </div>
                            
                            <div class="concept-card" data-concept="networking">
                                <div class="concept-icon">🌐</div>
                                <h3>Cloud Networking</h3>
                                <p>VPCs, subnets, and network security</p>
                                <div class="concept-status">Not Started</div>
                            </div>
                            
                            <div class="concept-card" data-concept="storage">
                                <div class="concept-icon">💾</div>
                                <h3>Cloud Storage</h3>
                                <p>Object, block, and file storage systems</p>
                                <div class="concept-status">Not Started</div>
                            </div>
                            
                            <div class="concept-card" data-concept="databases">
                                <div class="concept-icon">🗄️</div>
                                <h3>Cloud Databases</h3>
                                <p>SQL, NoSQL, and managed database services</p>
                                <div class="concept-status">Not Started</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Videos Tab -->
                    <div class="tab-content hidden" id="videos-content">
                        <div class="video-categories">
                            <div class="video-section">
                                <h3>Getting Started</h3>
                                <div class="video-grid">
                                    <div class="video-card" data-video="intro">
                                        <div class="video-thumbnail">
                                            <div class="play-button">▶️</div>
                                            <div class="video-duration">5:30</div>
                                        </div>
                                        <h4>Introduction to Cloud Computing</h4>
                                        <p>Learn the basics of cloud computing</p>
                                    </div>
                                    
                                    <div class="video-card" data-video="benefits">
                                        <div class="video-thumbnail">
                                            <div class="play-button">▶️</div>
                                            <div class="video-duration">8:15</div>
                                        </div>
                                        <h4>Benefits of Cloud Computing</h4>
                                        <p>Why businesses move to the cloud</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="video-section">
                                <h3>Infrastructure Deep Dive</h3>
                                <div class="video-grid">
                                    <div class="video-card locked" data-video="servers">
                                        <div class="video-thumbnail">
                                            <div class="lock-icon">🔒</div>
                                            <div class="video-duration">12:45</div>
                                        </div>
                                        <h4>Virtual Servers Explained</h4>
                                        <p>Complete tutorial on cloud servers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tutorial-viewer hidden" id="tutorial-viewer">
                <!-- Tutorial content will be loaded here -->
            </div>
        `;
        
        // Bind UI events
        this.bindLearnModeEvents();
    }

    /**
     * Bind Learn mode specific events
     */
    bindLearnModeEvents() {
        // Tab switching
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const submode = e.target.dataset.submode;
                this.switchSubmode(submode);
            });
        });

        // Category buttons
        this.container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.category-card');
                const category = card.dataset.category;
                if (!card.classList.contains('locked')) {
                    this.openCategory(category);
                }
            });
        });

        // Concept cards
        this.container.querySelectorAll('.concept-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const concept = e.currentTarget.dataset.concept;
                this.openConcept(concept);
            });
        });

        // Video cards
        this.container.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const video = e.currentTarget.dataset.video;
                if (!e.currentTarget.classList.contains('locked')) {
                    this.playVideo(video);
                }
            });
        });
    }

    /**
     * Load learning content
     */
    async loadLearningContent() {
        // Load tutorial categories and progress
        this.tutorialCategories = {
            basics: {
                title: 'Cloud Basics',
                tutorials: [
                    { id: 'intro', title: 'What is Cloud Computing?', duration: 10 },
                    { id: 'benefits', title: 'Benefits of Cloud', duration: 8 },
                    { id: 'models', title: 'Cloud Service Models', duration: 12 },
                    { id: 'deployment', title: 'Deployment Models', duration: 15 },
                    { id: 'providers', title: 'Major Cloud Providers', duration: 10 }
                ]
            },
            infrastructure: {
                title: 'Infrastructure',
                tutorials: [
                    { id: 'servers', title: 'Virtual Servers', duration: 20 },
                    { id: 'networking', title: 'Cloud Networking', duration: 25 },
                    { id: 'storage', title: 'Storage Solutions', duration: 18 },
                    { id: 'databases', title: 'Database Services', duration: 22 },
                    { id: 'load-balancing', title: 'Load Balancing', duration: 15 },
                    { id: 'auto-scaling', title: 'Auto Scaling', duration: 20 },
                    { id: 'monitoring', title: 'Monitoring & Logging', duration: 18 },
                    { id: 'backup', title: 'Backup & Recovery', duration: 16 }
                ]
            }
        };

        // Load user progress
        await this.loadUserProgress();
        
        // Update UI with progress
        this.updateProgressUI();
    }

    /**
     * Load user progress from state
     */
    async loadUserProgress() {
        this.tutorialProgress = this.stateManager.getState('learn.tutorialProgress') || {};
        this.learningPath = this.stateManager.getState('learn.learningPath') || [];
        
        // Calculate stats
        this.calculateLearningStats();
    }

    /**
     * Calculate learning statistics
     */
    calculateLearningStats() {
        const completedCount = Object.values(this.tutorialProgress).filter(p => p.completed).length;
        const totalTutorials = Object.values(this.tutorialCategories)
            .reduce((sum, cat) => sum + cat.tutorials.length, 0);
        
        this.stats = {
            completedTutorials: completedCount,
            totalTutorials: totalTutorials,
            currentLevel: Math.floor(completedCount / 5) + 1,
            learningStreak: this.calculateStreak(),
            progressPercentage: totalTutorials > 0 ? (completedCount / totalTutorials) * 100 : 0
        };
    }

    /**
     * Calculate learning streak
     */
    calculateStreak() {
        // Simple streak calculation - could be enhanced
        const lastActivity = this.stateManager.getState('learn.lastActivity');
        if (!lastActivity) return 0;
        
        const daysSinceLastActivity = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));
        return daysSinceLastActivity <= 1 ? this.stateManager.getState('learn.streak') || 0 : 0;
    }

    /**
     * Update progress UI
     */
    updateProgressUI() {
        // Update header stats
        const completedElement = this.container.querySelector('#completed-tutorials');
        const levelElement = this.container.querySelector('#current-level');
        const streakElement = this.container.querySelector('#learning-streak');
        
        if (completedElement) completedElement.textContent = this.stats.completedTutorials;
        if (levelElement) levelElement.textContent = this.stats.currentLevel;
        if (streakElement) streakElement.textContent = this.stats.learningStreak;

        // Update progress bar
        const progressFill = this.container.querySelector('.progress-fill');
        const progressText = this.container.querySelector('.progress-text');
        
        if (progressFill) progressFill.style.width = `${this.stats.progressPercentage}%`;
        if (progressText) progressText.textContent = `${Math.round(this.stats.progressPercentage)}% Complete`;

        // Update category progress
        this.updateCategoryProgress();
        
        // Update recommended tutorials
        this.updateRecommendedTutorials();
    }

    /**
     * Update category progress and unlock status
     */
    updateCategoryProgress() {
        Object.entries(this.tutorialCategories).forEach(([categoryId, category]) => {
            const card = this.container.querySelector(`[data-category="${categoryId}"]`);
            if (!card) return;

            const completed = category.tutorials.filter(t => 
                this.tutorialProgress[t.id]?.completed
            ).length;
            const total = category.tutorials.length;
            
            // Update progress count
            const progressCount = card.querySelector('.progress-count');
            if (progressCount) {
                progressCount.textContent = `${completed}/${total} completed`;
            }

            // Update unlock status
            const shouldUnlock = this.shouldUnlockCategory(categoryId);
            if (shouldUnlock && card.classList.contains('locked')) {
                card.classList.remove('locked');
                const btn = card.querySelector('.category-btn');
                btn.disabled = false;
                btn.textContent = 'Start Learning';
            }
        });
    }

    /**
     * Check if category should be unlocked
     */
    shouldUnlockCategory(categoryId) {
        switch (categoryId) {
            case 'basics':
                return true; // Always unlocked
            case 'infrastructure':
                return this.getCategoryCompletion('basics') >= 0.8; // 80% of basics
            case 'security':
                return this.getCategoryCompletion('infrastructure') >= 0.6; // 60% of infrastructure
            case 'advanced':
                return this.getCategoryCompletion('security') >= 0.7; // 70% of security
            default:
                return false;
        }
    }

    /**
     * Get category completion percentage
     */
    getCategoryCompletion(categoryId) {
        const category = this.tutorialCategories[categoryId];
        if (!category) return 0;

        const completed = category.tutorials.filter(t => 
            this.tutorialProgress[t.id]?.completed
        ).length;
        
        return completed / category.tutorials.length;
    }

    /**
     * Update recommended tutorials
     */
    updateRecommendedTutorials() {
        const recommendedList = this.container.querySelector('#recommended-list');
        if (!recommendedList) return;

        // Get next tutorials in learning path
        const recommendations = this.getRecommendedTutorials();
        
        recommendedList.innerHTML = recommendations.map(tutorial => `
            <div class="tutorial-item" data-tutorial="${tutorial.id}">
                <div class="tutorial-icon">${tutorial.icon || '📖'}</div>
                <div class="tutorial-info">
                    <h4>${tutorial.title}</h4>
                    <p>${tutorial.description || 'Learn essential cloud concepts'}</p>
                    <div class="tutorial-meta">
                        <span class="duration">⏱️ ${tutorial.duration} min</span>
                        <span class="difficulty">${tutorial.difficulty || 'Beginner'}</span>
                    </div>
                </div>
                <button class="start-tutorial-btn" data-tutorial="${tutorial.id}">
                    Start
                </button>
            </div>
        `).join('');

        // Bind tutorial start buttons
        recommendedList.querySelectorAll('.start-tutorial-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tutorialId = e.target.dataset.tutorial;
                this.startTutorial(tutorialId);
            });
        });
    }

    /**
     * Get recommended tutorials based on progress
     */
    getRecommendedTutorials() {
        const recommendations = [];
        
        // Find next tutorials in each unlocked category
        Object.entries(this.tutorialCategories).forEach(([categoryId, category]) => {
            if (this.shouldUnlockCategory(categoryId)) {
                const nextTutorial = category.tutorials.find(t => 
                    !this.tutorialProgress[t.id]?.completed
                );
                
                if (nextTutorial) {
                    recommendations.push({
                        ...nextTutorial,
                        category: categoryId,
                        categoryTitle: category.title
                    });
                }
            }
        });

        return recommendations.slice(0, 3); // Return top 3 recommendations
    }

    /**
     * Switch to different submode
     */
    switchSubmode(submode) {
        const previousSubmode = this.currentSubmode;
        this.currentSubmode = submode;

        // Update tab buttons
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.submode === submode);
        });

        // Update tab content
        this.container.querySelectorAll('.tab-content').forEach(content => {
            const isActive = content.id === `${submode}-content`;
            content.classList.toggle('hidden', !isActive);
            content.classList.toggle('active', isActive);
        });

        // Emit submode change event
        this.eventSystem.emit('learn-mode:submode-changed', {
            from: previousSubmode,
            to: submode
        });
    }

    /**
     * Open tutorial category
     */
    openCategory(categoryId) {
        const category = this.tutorialCategories[categoryId];
        if (!category) return;

        console.log(`LearnModeController: Opening category ${categoryId}`);
        
        // For now, start the first incomplete tutorial in the category
        const nextTutorial = category.tutorials.find(t => 
            !this.tutorialProgress[t.id]?.completed
        );
        
        if (nextTutorial) {
            this.startTutorial(nextTutorial.id);
        } else {
            // All tutorials completed, show category overview
            this.showCategoryOverview(categoryId);
        }
    }

    /**
     * Start a tutorial
     */
    startTutorial(tutorialId) {
        console.log(`LearnModeController: Starting tutorial ${tutorialId}`);
        
        // For now, show a placeholder tutorial viewer
        // In the future, this would load the actual tutorial content
        this.showTutorialPlaceholder(tutorialId);
        
        // Mark tutorial as started
        if (!this.tutorialProgress[tutorialId]) {
            this.tutorialProgress[tutorialId] = {};
        }
        this.tutorialProgress[tutorialId].started = true;
        this.tutorialProgress[tutorialId].startedAt = Date.now();
        
        // Save progress
        this.saveProgress();
        
        // Emit event
        this.eventSystem.emit('learn-mode:tutorial-started', { tutorialId });
    }

    /**
     * Show tutorial placeholder
     */
    showTutorialPlaceholder(tutorialId) {
        const tutorialViewer = this.container.querySelector('#tutorial-viewer');
        
        tutorialViewer.innerHTML = `
            <div class="tutorial-header">
                <button class="back-btn" onclick="this.closest('#tutorial-viewer').classList.add('hidden')">
                    ← Back to Learn Mode
                </button>
                <h2>Tutorial: ${tutorialId}</h2>
            </div>
            <div class="tutorial-content">
                <div class="tutorial-placeholder">
                    <div class="placeholder-icon">🚧</div>
                    <h3>Tutorial Coming Soon!</h3>
                    <p>The tutorial "${tutorialId}" is currently under development.</p>
                    <p>This will include:</p>
                    <ul>
                        <li>Interactive step-by-step guidance</li>
                        <li>Hands-on exercises</li>
                        <li>Progress tracking</li>
                        <li>Knowledge checks</li>
                    </ul>
                    <button class="complete-tutorial-btn" onclick="window.app.getModule('learnMode').completeTutorial('${tutorialId}')">
                        Mark as Complete (Demo)
                    </button>
                </div>
            </div>
        `;
        
        tutorialViewer.classList.remove('hidden');
    }

    /**
     * Complete a tutorial
     */
    completeTutorial(tutorialId) {
        if (!this.tutorialProgress[tutorialId]) {
            this.tutorialProgress[tutorialId] = {};
        }
        
        this.tutorialProgress[tutorialId].completed = true;
        this.tutorialProgress[tutorialId].completedAt = Date.now();
        
        // Update streak
        this.updateLearningStreak();
        
        // Save progress
        this.saveProgress();
        
        // Update UI
        this.calculateLearningStats();
        this.updateProgressUI();
        
        // Hide tutorial viewer
        const tutorialViewer = this.container.querySelector('#tutorial-viewer');
        tutorialViewer.classList.add('hidden');
        
        // Emit event
        this.eventSystem.emit('learn-mode:tutorial-completed', { tutorialId });
        
        console.log(`LearnModeController: Tutorial ${tutorialId} completed`);
    }

    /**
     * Update learning streak
     */
    updateLearningStreak() {
        const today = new Date().toDateString();
        const lastActivity = this.stateManager.getState('learn.lastActivityDate');
        
        if (lastActivity === today) {
            // Already active today, don't change streak
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActivity === yesterday.toDateString()) {
            // Consecutive day, increment streak
            const currentStreak = this.stateManager.getState('learn.streak') || 0;
            this.stateManager.setState('learn.streak', currentStreak + 1);
        } else {
            // Streak broken, reset to 1
            this.stateManager.setState('learn.streak', 1);
        }
        
        this.stateManager.setState('learn.lastActivityDate', today);
        this.stateManager.setState('learn.lastActivity', Date.now());
    }

    /**
     * Save progress to state
     */
    saveProgress() {
        this.stateManager.setState('learn.tutorialProgress', this.tutorialProgress);
        this.stateManager.setState('learn.learningPath', this.learningPath);
    }

    /**
     * Open concept details
     */
    openConcept(conceptId) {
        console.log(`LearnModeController: Opening concept ${conceptId}`);
        // Placeholder for concept viewer
        alert(`Concept "${conceptId}" coming soon!`);
    }

    /**
     * Play video
     */
    playVideo(videoId) {
        console.log(`LearnModeController: Playing video ${videoId}`);
        // Placeholder for video player
        alert(`Video "${videoId}" coming soon!`);
    }

    /**
     * Show category overview
     */
    showCategoryOverview(categoryId) {
        console.log(`LearnModeController: Showing overview for ${categoryId}`);
        // Placeholder for category overview
        alert(`Category "${categoryId}" overview coming soon!`);
    }

    /**
     * Prepare Learn mode for display
     */
    async prepareMode(options) {
        // Set submode if specified
        if (options.submode && ['tutorials', 'concepts', 'videos'].includes(options.submode)) {
            this.currentSubmode = options.submode;
            this.switchSubmode(options.submode);
        }

        // Refresh progress
        await this.loadUserProgress();
        this.updateProgressUI();
    }

    /**
     * Activate Learn mode
     */
    async activate(options) {
        // Update progress display
        this.updateProgressUI();

        // Emit activation event
        this.eventSystem.emit('learn-mode:activated', {
            submode: this.currentSubmode,
            stats: this.stats,
            options
        });
    }

    /**
     * Get current state
     */
    getState() {
        return {
            ...super.getState(),
            currentSubmode: this.currentSubmode,
            tutorialProgress: { ...this.tutorialProgress },
            stats: { ...this.stats },
            currentTutorial: this.currentTutorial
        };
    }
}

export { LearnModeController };