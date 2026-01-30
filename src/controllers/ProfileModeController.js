/**
 * ProfileModeController - Manages the Profile mode with settings, achievements, and progress
 */
import { BaseModeController } from '../core/BaseModeController.js';

class ProfileModeController extends BaseModeController {
    constructor(app) {
        super(app, 'Profile');
        this.currentSubmode = 'settings';
        this.userProfile = {};
        this.achievements = [];
        this.settings = {};
    }

    /**
     * Initialize Profile mode specific logic
     */
    async initializeMode() {
        // Create Profile mode UI
        this.createProfileModeUI();
        
        // Load user data
        await this.loadUserData();
        
        // Set up settings management
        this.setupSettingsManagement();
        
        // Add transition effects
        this.addTransitionEffects();
    }

    /**
     * Create Profile mode UI
     */
    createProfileModeUI() {
        this.container.innerHTML = `
            <div class="profile-mode-header">
                <div class="profile-info">
                    <div class="profile-avatar">
                        <div class="avatar-circle">
                            <span class="avatar-text">U</span>
                        </div>
                        <button class="change-avatar-btn">Change Avatar</button>
                    </div>
                    <div class="profile-details">
                        <h1 class="profile-name">Cloud Learner</h1>
                        <p class="profile-title">Aspiring Cloud Architect</p>
                        <div class="profile-stats">
                            <div class="stat">
                                <span class="stat-value" id="profile-level">5</span>
                                <span class="stat-label">Level</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value" id="profile-xp">2,450</span>
                                <span class="stat-label">XP</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value" id="profile-streak">12</span>
                                <span class="stat-label">Day Streak</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="profile-content">
                <div class="submode-tabs">
                    <button class="tab-btn active" data-submode="settings">
                        ⚙️ Settings
                    </button>
                    <button class="tab-btn" data-submode="achievements">
                        🏆 Achievements
                    </button>
                    <button class="tab-btn" data-submode="progress">
                        📈 Progress
                    </button>
                </div>
                
                <div class="submode-content">
                    <!-- Settings Tab -->
                    <div class="tab-content active" id="settings-content">
                        <div class="settings-sections">
                            <div class="settings-section">
                                <h3>🔊 Audio Settings</h3>
                                <div class="setting-group">
                                    <div class="setting-item">
                                        <label for="master-volume">Master Volume</label>
                                        <div class="volume-control">
                                            <input type="range" id="master-volume" min="0" max="100" value="75">
                                            <span class="volume-value">75%</span>
                                        </div>
                                    </div>
                                    <div class="setting-item">
                                        <label for="sfx-volume">Sound Effects</label>
                                        <div class="volume-control">
                                            <input type="range" id="sfx-volume" min="0" max="100" value="80">
                                            <span class="volume-value">80%</span>
                                        </div>
                                    </div>
                                    <div class="setting-item">
                                        <label for="music-volume">Background Music</label>
                                        <div class="volume-control">
                                            <input type="range" id="music-volume" min="0" max="100" value="60">
                                            <span class="volume-value">60%</span>
                                        </div>
                                    </div>
                                    <div class="setting-item">
                                        <label>
                                            <input type="checkbox" id="mute-all" />
                                            Mute All Sounds
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="settings-section">
                                <h3>🎮 Gameplay Settings</h3>
                                <div class="setting-group">
                                    <div class="setting-item">
                                        <label for="difficulty">Default Difficulty</label>
                                        <select id="difficulty">
                                            <option value="easy">Easy</option>
                                            <option value="medium" selected>Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                    <div class="setting-item">
                                        <label for="tutorial-speed">Tutorial Speed</label>
                                        <select id="tutorial-speed">
                                            <option value="slow">Slow</option>
                                            <option value="normal" selected>Normal</option>
                                            <option value="fast">Fast</option>
                                        </select>
                                    </div>
                                    <div class="setting-item">
                                        <label>
                                            <input type="checkbox" id="auto-save" checked />
                                            Auto-save Progress
                                        </label>
                                    </div>
                                    <div class="setting-item">
                                        <label>
                                            <input type="checkbox" id="show-hints" checked />
                                            Show Hints
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="settings-section">
                                <h3>🌐 Language & Region</h3>
                                <div class="setting-group">
                                    <div class="setting-item">
                                        <label for="language">Language</label>
                                        <select id="language">
                                            <option value="en" selected>English</option>
                                            <option value="zh">中文</option>
                                            <option value="pt-BR">Português (Brasil)</option>
                                            <option value="de">Deutsch</option>
                                            <option value="nep">नेपाली</option>
                                        </select>
                                    </div>
                                    <div class="setting-item">
                                        <label for="timezone">Timezone</label>
                                        <select id="timezone">
                                            <option value="UTC" selected>UTC</option>
                                            <option value="America/New_York">Eastern Time</option>
                                            <option value="America/Los_Angeles">Pacific Time</option>
                                            <option value="Europe/London">London</option>
                                            <option value="Asia/Tokyo">Tokyo</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="settings-section">
                                <h3>🔒 Privacy Settings</h3>
                                <div class="setting-group">
                                    <div class="setting-item">
                                        <label for="profile-visibility">Profile Visibility</label>
                                        <select id="profile-visibility">
                                            <option value="public">Public</option>
                                            <option value="friends" selected>Friends Only</option>
                                            <option value="private">Private</option>
                                        </select>
                                    </div>
                                    <div class="setting-item">
                                        <label>
                                            <input type="checkbox" id="show-progress" checked />
                                            Show Learning Progress
                                        </label>
                                    </div>
                                    <div class="setting-item">
                                        <label>
                                            <input type="checkbox" id="show-achievements" checked />
                                            Show Achievements
                                        </label>
                                    </div>
                                    <div class="setting-item">
                                        <label>
                                            <input type="checkbox" id="analytics-consent" />
                                            Allow Analytics Data Collection
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="settings-actions">
                                <button class="save-settings-btn">💾 Save Settings</button>
                                <button class="reset-settings-btn">🔄 Reset to Defaults</button>
                                <button class="export-settings-btn">📤 Export Settings</button>
                                <button class="import-settings-btn">📥 Import Settings</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Achievements Tab -->
                    <div class="tab-content hidden" id="achievements-content">
                        <div class="achievements-header">
                            <div class="achievements-stats">
                                <div class="achievement-stat">
                                    <span class="stat-value" id="earned-achievements">8</span>
                                    <span class="stat-label">Earned</span>
                                </div>
                                <div class="achievement-stat">
                                    <span class="stat-value" id="total-achievements">25</span>
                                    <span class="stat-label">Total</span>
                                </div>
                                <div class="achievement-stat">
                                    <span class="stat-value" id="completion-rate">32%</span>
                                    <span class="stat-label">Complete</span>
                                </div>
                            </div>
                            <div class="achievements-filters">
                                <button class="filter-btn active" data-filter="all">All</button>
                                <button class="filter-btn" data-filter="earned">Earned</button>
                                <button class="filter-btn" data-filter="locked">Locked</button>
                                <button class="filter-btn" data-filter="recent">Recent</button>
                            </div>
                        </div>
                        
                        <div class="achievements-grid" id="achievements-grid">
                            <!-- Earned Achievements -->
                            <div class="achievement-card earned" data-category="earned">
                                <div class="achievement-icon">🌟</div>
                                <div class="achievement-info">
                                    <h4>First Steps</h4>
                                    <p>Complete your first tutorial</p>
                                    <div class="achievement-meta">
                                        <span class="earned-date">Earned 2 weeks ago</span>
                                        <span class="achievement-rarity common">Common</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="achievement-card earned" data-category="earned">
                                <div class="achievement-icon">🏆</div>
                                <div class="achievement-info">
                                    <h4>Challenge Master</h4>
                                    <p>Complete 10 challenges</p>
                                    <div class="achievement-meta">
                                        <span class="earned-date">Earned 1 week ago</span>
                                        <span class="achievement-rarity rare">Rare</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="achievement-card earned" data-category="earned">
                                <div class="achievement-icon">🔥</div>
                                <div class="achievement-info">
                                    <h4>On Fire</h4>
                                    <p>Maintain a 7-day learning streak</p>
                                    <div class="achievement-meta">
                                        <span class="earned-date">Earned 3 days ago</span>
                                        <span class="achievement-rarity uncommon">Uncommon</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Locked Achievements -->
                            <div class="achievement-card locked" data-category="locked">
                                <div class="achievement-icon">🚀</div>
                                <div class="achievement-info">
                                    <h4>Cloud Architect</h4>
                                    <p>Complete all infrastructure tutorials</p>
                                    <div class="achievement-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: 60%"></div>
                                        </div>
                                        <span class="progress-text">6/10 tutorials</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="achievement-card locked" data-category="locked">
                                <div class="achievement-icon">🛡️</div>
                                <div class="achievement-info">
                                    <h4>Security Expert</h4>
                                    <p>Master all security concepts</p>
                                    <div class="achievement-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: 25%"></div>
                                        </div>
                                        <span class="progress-text">2/8 concepts</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="achievement-card locked" data-category="locked">
                                <div class="achievement-icon">💎</div>
                                <div class="achievement-info">
                                    <h4>Perfect Score</h4>
                                    <p>Get 100% on 5 challenges in a row</p>
                                    <div class="achievement-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: 40%"></div>
                                        </div>
                                        <span class="progress-text">2/5 perfect scores</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Progress Tab -->
                    <div class="tab-content hidden" id="progress-content">
                        <div class="progress-overview">
                            <div class="progress-cards">
                                <div class="progress-card">
                                    <div class="progress-icon">📚</div>
                                    <div class="progress-info">
                                        <h4>Learning Progress</h4>
                                        <div class="progress-bar large">
                                            <div class="progress-fill" style="width: 65%"></div>
                                        </div>
                                        <div class="progress-details">
                                            <span>Level 5 - Cloud Enthusiast</span>
                                            <span>1,250 XP to next level</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="progress-card">
                                    <div class="progress-icon">🎯</div>
                                    <div class="progress-info">
                                        <h4>Skill Development</h4>
                                        <div class="skill-bars">
                                            <div class="skill-bar">
                                                <span class="skill-name">Infrastructure</span>
                                                <div class="progress-bar">
                                                    <div class="progress-fill" style="width: 75%"></div>
                                                </div>
                                                <span class="skill-level">75%</span>
                                            </div>
                                            <div class="skill-bar">
                                                <span class="skill-name">Security</span>
                                                <div class="progress-bar">
                                                    <div class="progress-fill" style="width: 45%"></div>
                                                </div>
                                                <span class="skill-level">45%</span>
                                            </div>
                                            <div class="skill-bar">
                                                <span class="skill-name">Networking</span>
                                                <div class="progress-bar">
                                                    <div class="progress-fill" style="width: 60%"></div>
                                                </div>
                                                <span class="skill-level">60%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="progress-history">
                            <h3>Recent Activity</h3>
                            <div class="activity-timeline">
                                <div class="activity-item">
                                    <div class="activity-icon">🏆</div>
                                    <div class="activity-content">
                                        <h5>Completed Challenge: Cost Optimization</h5>
                                        <p>Scored 95% on the cost optimization challenge</p>
                                        <span class="activity-time">2 hours ago</span>
                                    </div>
                                </div>
                                
                                <div class="activity-item">
                                    <div class="activity-icon">📚</div>
                                    <div class="activity-content">
                                        <h5>Finished Tutorial: Load Balancing</h5>
                                        <p>Learned about application load balancers</p>
                                        <span class="activity-time">1 day ago</span>
                                    </div>
                                </div>
                                
                                <div class="activity-item">
                                    <div class="activity-icon">🌟</div>
                                    <div class="activity-content">
                                        <h5>Achievement Unlocked: On Fire</h5>
                                        <p>Maintained a 7-day learning streak</p>
                                        <span class="activity-time">3 days ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Bind UI events
        this.bindProfileModeEvents();
    }

    /**
     * Bind Profile mode specific events
     */
    bindProfileModeEvents() {
        // Tab switching
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const submode = e.target.dataset.submode;
                this.switchSubmode(submode);
            });
        });

        // Settings controls
        this.bindSettingsEvents();
        
        // Achievement filters
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterAchievements(filter);
            });
        });

        // Avatar change
        const changeAvatarBtn = this.container.querySelector('.change-avatar-btn');
        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', () => {
                this.changeAvatar();
            });
        }
    }

    /**
     * Bind settings events
     */
    bindSettingsEvents() {
        // Volume controls
        this.container.querySelectorAll('input[type="range"]').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const valueSpan = e.target.parentNode.querySelector('.volume-value');
                if (valueSpan) {
                    valueSpan.textContent = `${e.target.value}%`;
                }
                this.updateSetting(e.target.id, e.target.value);
            });
        });

        // Checkboxes and selects
        this.container.querySelectorAll('input[type="checkbox"], select').forEach(input => {
            input.addEventListener('change', (e) => {
                const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                this.updateSetting(e.target.id, value);
            });
        });

        // Settings action buttons
        const saveBtn = this.container.querySelector('.save-settings-btn');
        const resetBtn = this.container.querySelector('.reset-settings-btn');
        const exportBtn = this.container.querySelector('.export-settings-btn');
        const importBtn = this.container.querySelector('.import-settings-btn');

        if (saveBtn) saveBtn.addEventListener('click', () => this.saveSettings());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetSettings());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportSettings());
        if (importBtn) importBtn.addEventListener('click', () => this.importSettings());
    }

    /**
     * Load user data
     */
    async loadUserData() {
        // Load user profile
        this.userProfile = this.stateManager.getState('user.profile') || {
            name: 'Cloud Learner',
            title: 'Aspiring Cloud Architect',
            level: 5,
            xp: 2450,
            streak: 12,
            avatar: 'U'
        };

        // Load settings
        this.settings = this.stateManager.getState('user.settings') || this.getDefaultSettings();

        // Load achievements
        this.achievements = this.stateManager.getState('user.achievements') || [];

        // Update UI
        this.updateProfileUI();
        this.updateSettingsUI();
    }

    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            masterVolume: 75,
            sfxVolume: 80,
            musicVolume: 60,
            muteAll: false,
            difficulty: 'medium',
            tutorialSpeed: 'normal',
            autoSave: true,
            showHints: true,
            language: 'en',
            timezone: 'UTC',
            profileVisibility: 'friends',
            showProgress: true,
            showAchievements: true,
            analyticsConsent: false
        };
    }

    /**
     * Update profile UI
     */
    updateProfileUI() {
        // Update profile stats
        const levelElement = this.container.querySelector('#profile-level');
        const xpElement = this.container.querySelector('#profile-xp');
        const streakElement = this.container.querySelector('#profile-streak');

        if (levelElement) levelElement.textContent = this.userProfile.level;
        if (xpElement) xpElement.textContent = this.userProfile.xp.toLocaleString();
        if (streakElement) streakElement.textContent = this.userProfile.streak;

        // Update profile name and title
        const nameElement = this.container.querySelector('.profile-name');
        const titleElement = this.container.querySelector('.profile-title');
        const avatarElement = this.container.querySelector('.avatar-text');

        if (nameElement) nameElement.textContent = this.userProfile.name;
        if (titleElement) titleElement.textContent = this.userProfile.title;
        if (avatarElement) avatarElement.textContent = this.userProfile.avatar;
    }

    /**
     * Update settings UI
     */
    updateSettingsUI() {
        // Update all form controls with saved settings
        Object.entries(this.settings).forEach(([key, value]) => {
            const element = this.container.querySelector(`#${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'range') {
                    element.value = value;
                    const valueSpan = element.parentNode.querySelector('.volume-value');
                    if (valueSpan) {
                        valueSpan.textContent = `${value}%`;
                    }
                } else {
                    element.value = value;
                }
            }
        });
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

        // Load submode-specific data
        this.loadSubmodeData(submode);

        // Emit submode change event
        this.eventSystem.emit('profile-mode:submode-changed', {
            from: previousSubmode,
            to: submode
        });
    }

    /**
     * Load data for specific submode
     */
    async loadSubmodeData(submode) {
        switch (submode) {
            case 'settings':
                // Settings are already loaded
                break;
            case 'achievements':
                await this.loadAchievementsData();
                break;
            case 'progress':
                await this.loadProgressData();
                break;
        }
    }

    /**
     * Load achievements data
     */
    async loadAchievementsData() {
        // Update achievement counts
        const earnedCount = this.achievements.filter(a => a.earned).length;
        const totalCount = 25; // Total available achievements
        const completionRate = Math.round((earnedCount / totalCount) * 100);

        const earnedElement = this.container.querySelector('#earned-achievements');
        const totalElement = this.container.querySelector('#total-achievements');
        const rateElement = this.container.querySelector('#completion-rate');

        if (earnedElement) earnedElement.textContent = earnedCount;
        if (totalElement) totalElement.textContent = totalCount;
        if (rateElement) rateElement.textContent = `${completionRate}%`;
    }

    /**
     * Load progress data
     */
    async loadProgressData() {
        // Progress data is already displayed in the UI
        // This could load more detailed progress information
        console.log('ProfileModeController: Loading progress data');
    }

    /**
     * Filter achievements
     */
    filterAchievements(filter) {
        // Update filter buttons
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Show/hide achievement cards based on filter
        const achievementCards = this.container.querySelectorAll('.achievement-card');
        achievementCards.forEach(card => {
            const shouldShow = filter === 'all' || card.dataset.category === filter || 
                              card.classList.contains(filter);
            card.style.display = shouldShow ? 'block' : 'none';
        });

        console.log(`ProfileModeController: Filtered achievements by ${filter}`);
    }

    /**
     * Update setting
     */
    updateSetting(key, value) {
        // Convert kebab-case to camelCase
        const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        this.settings[camelKey] = value;

        // Apply setting immediately if needed
        this.applySetting(camelKey, value);

        console.log(`ProfileModeController: Updated setting ${camelKey} to ${value}`);
    }

    /**
     * Apply setting immediately
     */
    applySetting(key, value) {
        switch (key) {
            case 'language':
                // Apply language change
                if (window.i18n) {
                    window.i18n.setLanguage(value);
                }
                break;
            case 'muteAll':
                // Apply mute setting
                if (window.soundService) {
                    window.soundService.setMuted(value);
                }
                break;
            case 'masterVolume':
            case 'sfxVolume':
            case 'musicVolume':
                // Apply volume settings
                if (window.soundService) {
                    window.soundService.setVolume(key, value / 100);
                }
                break;
        }
    }

    /**
     * Save settings
     */
    saveSettings() {
        // Save to state manager
        this.stateManager.setState('user.settings', this.settings);
        
        // Show success message
        this.showMessage('Settings saved successfully!', 'success');
        
        // Emit event
        this.eventSystem.emit('profile-mode:settings-saved', { settings: this.settings });
        
        console.log('ProfileModeController: Settings saved');
    }

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            this.settings = this.getDefaultSettings();
            this.updateSettingsUI();
            this.showMessage('Settings reset to defaults', 'info');
            
            console.log('ProfileModeController: Settings reset to defaults');
        }
    }

    /**
     * Export settings
     */
    exportSettings() {
        const settingsData = {
            settings: this.settings,
            profile: this.userProfile,
            exportedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(settingsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'cloud-learning-simulator-settings.json';
        link.click();
        
        this.showMessage('Settings exported successfully!', 'success');
        console.log('ProfileModeController: Settings exported');
    }

    /**
     * Import settings
     */
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.settings) {
                            this.settings = { ...this.getDefaultSettings(), ...data.settings };
                            this.updateSettingsUI();
                            this.showMessage('Settings imported successfully!', 'success');
                            console.log('ProfileModeController: Settings imported');
                        } else {
                            throw new Error('Invalid settings file format');
                        }
                    } catch (error) {
                        this.showMessage('Failed to import settings: Invalid file format', 'error');
                        console.error('ProfileModeController: Failed to import settings:', error);
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    /**
     * Change avatar
     */
    changeAvatar() {
        // Simple avatar selection - could be enhanced with image upload
        const avatars = ['U', '👤', '🧑‍💻', '👩‍💻', '🧑‍🎓', '👩‍🎓', '🤖', '🌟'];
        const currentIndex = avatars.indexOf(this.userProfile.avatar);
        const nextIndex = (currentIndex + 1) % avatars.length;
        
        this.userProfile.avatar = avatars[nextIndex];
        
        // Update UI
        const avatarElement = this.container.querySelector('.avatar-text');
        if (avatarElement) {
            avatarElement.textContent = this.userProfile.avatar;
        }
        
        // Save profile
        this.stateManager.setState('user.profile', this.userProfile);
        
        console.log(`ProfileModeController: Avatar changed to ${this.userProfile.avatar}`);
    }

    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        // Create or update message display
        let messageDiv = this.container.querySelector('.message-display');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.className = 'message-display';
            this.container.insertBefore(messageDiv, this.container.firstChild);
        }
        
        messageDiv.className = `message-display ${type}`;
        messageDiv.textContent = message;
        messageDiv.classList.remove('hidden');
        
        // Hide after 3 seconds
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 3000);
    }

    /**
     * Setup settings management
     */
    setupSettingsManagement() {
        // Listen for external setting changes
        this.eventSystem.on('settings:changed', (data) => {
            if (data.key && data.value !== undefined) {
                this.updateSetting(data.key, data.value);
            }
        });
    }

    /**
     * Prepare Profile mode for display
     */
    async prepareMode(options) {
        // Set submode if specified
        if (options.submode && ['settings', 'achievements', 'progress'].includes(options.submode)) {
            this.currentSubmode = options.submode;
            this.switchSubmode(options.submode);
        }

        // Refresh user data
        await this.loadUserData();
    }

    /**
     * Activate Profile mode
     */
    async activate(options) {
        // Update profile display
        this.updateProfileUI();

        // Emit activation event
        this.eventSystem.emit('profile-mode:activated', {
            submode: this.currentSubmode,
            profile: this.userProfile,
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
            userProfile: { ...this.userProfile },
            settings: { ...this.settings },
            achievements: [...this.achievements]
        };
    }
}

export { ProfileModeController };