/**
 * BackwardCompatibility - Handles migration and compatibility with legacy save files
 * Ensures existing save files work with the new modular architecture
 */
class BackwardCompatibility {
    constructor(app) {
        this.app = app;
        this.eventSystem = null; // Will be set during initialization
        this.stateManager = null; // Will be set during initialization
        this.initialized = false;
        this.migrationVersion = '3.0.0';
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Get module references
            this.eventSystem = this.app.getModule('eventSystem');
            this.stateManager = this.app.getModule('stateManager');
            
            // Set up migration handlers
            this.setupMigrationHandlers();
            
            // Check for existing save files that need migration
            await this.checkForLegacySaves();
            
            this.initialized = true;
            
            if (this.eventSystem) {
                this.eventSystem.emit('compatibility:initialized');
            }
            
            console.log('BackwardCompatibility: Initialized');
        } catch (error) {
            console.error('BackwardCompatibility: Initialization failed', error);
            throw error;
        }
    }

    setupMigrationHandlers() {
        // Ensure eventSystem is available
        if (!this.eventSystem) {
            console.warn('BackwardCompatibility: EventSystem not available, skipping event handlers');
            return;
        }
        
        // Listen for save/load events to handle migration
        this.eventSystem.on('game:save-requested', (data) => this.handleSave(data));
        this.eventSystem.on('game:load-requested', (data) => this.handleLoad(data));
    }

    async checkForLegacySaves() {
        try {
            // Check for legacy save file
            const legacySave = localStorage.getItem('serverSurvivalSave');
            if (legacySave) {
                console.log('BackwardCompatibility: Legacy save file detected');
                if (this.eventSystem) {
                    this.eventSystem.emit('compatibility:legacy-save-detected');
                }
            }
        } catch (error) {
            console.warn('BackwardCompatibility: Error checking for legacy saves', error);
        }
    }

    async handleSave(data) {
        try {
            // Create a save format that's compatible with both systems
            const compatibleSave = this.createCompatibleSave(data);
            
            // Save in both legacy and new formats
            localStorage.setItem('serverSurvivalSave', JSON.stringify(compatibleSave.legacy));
            localStorage.setItem('cloudLearningSimulatorSave', JSON.stringify(compatibleSave.modular));
            
            if (this.eventSystem) {
                this.eventSystem.emit('compatibility:save-completed', { success: true });
            }
        } catch (error) {
            console.error('BackwardCompatibility: Save failed', error);
            if (this.eventSystem) {
                this.eventSystem.emit('compatibility:save-failed', { error });
            }
        }
    }

    async handleLoad(data) {
        try {
            // Try to load from new format first
            let saveData = this.loadModularSave();
            
            if (!saveData) {
                // Fall back to legacy format and migrate
                saveData = await this.loadAndMigrateLegacySave();
            }
            
            if (saveData) {
                if (this.eventSystem) {
                    this.eventSystem.emit('compatibility:load-completed', { saveData });
                }
            } else {
                if (this.eventSystem) {
                    this.eventSystem.emit('compatibility:load-failed', { reason: 'No save file found' });
                }
            }
        } catch (error) {
            console.error('BackwardCompatibility: Load failed', error);
            if (this.eventSystem) {
                this.eventSystem.emit('compatibility:load-failed', { error });
            }
        }
    }

    loadModularSave() {
        try {
            const saveStr = localStorage.getItem('cloudLearningSimulatorSave');
            if (saveStr) {
                const saveData = JSON.parse(saveStr);
                return this.validateModularSave(saveData) ? saveData : null;
            }
        } catch (error) {
            console.warn('BackwardCompatibility: Failed to load modular save', error);
        }
        return null;
    }

    async loadAndMigrateLegacySave() {
        try {
            const legacySaveStr = localStorage.getItem('serverSurvivalSave');
            if (!legacySaveStr) return null;

            const legacySave = JSON.parse(legacySaveStr);
            console.log('BackwardCompatibility: Migrating legacy save file...');
            
            // Migrate legacy save to new format
            const migratedSave = await this.migrateLegacySave(legacySave);
            
            // Validate migrated save
            if (this.validateModularSave(migratedSave)) {
                // Save migrated version
                localStorage.setItem('cloudLearningSimulatorSave', JSON.stringify(migratedSave));
                console.log('BackwardCompatibility: Migration completed successfully');
                return migratedSave;
            } else {
                throw new Error('Migration validation failed');
            }
        } catch (error) {
            console.error('BackwardCompatibility: Legacy migration failed', error);
            throw error;
        }
    }

    async migrateLegacySave(legacySave) {
        // Detect legacy save version
        const version = legacySave.version || '1.0';
        
        let migratedSave = { ...legacySave };
        
        // Apply version-specific migrations
        if (version === '1.0' || !version) {
            migratedSave = await this.migrateFromV1(migratedSave);
        }
        
        if (version === '2.0' || migratedSave.version === '2.0') {
            migratedSave = await this.migrateFromV2(migratedSave);
        }
        
        // Set new version
        migratedSave.version = this.migrationVersion;
        migratedSave.migratedAt = new Date().toISOString();
        migratedSave.originalVersion = version;
        
        return migratedSave;
    }

    async migrateFromV1(saveData) {
        console.log('BackwardCompatibility: Migrating from v1.0...');
        
        // Migrate traffic distribution format
        if (saveData.trafficDistribution) {
            const oldDist = saveData.trafficDistribution;
            if ('WEB' in oldDist || 'API' in oldDist || 'FRAUD' in oldDist) {
                saveData.trafficDistribution = {
                    STATIC: oldDist.WEB || 0.3,
                    read: (oldDist.API || 0.4) * 0.5,
                    WRITE: (oldDist.API || 0.4) * 0.3,
                    UPLOAD: 0.05,
                    SEARCH: (oldDist.API || 0.4) * 0.2,
                    MALICIOUS: oldDist.FRAUD || 0.2
                };
            }
        }

        // Migrate score format
        if (saveData.score) {
            const oldScore = saveData.score;
            if ('web' in oldScore || 'api' in oldScore || 'fraudBlocked' in oldScore) {
                saveData.score = {
                    total: oldScore.total || 0,
                    storage: oldScore.web || 0,
                    database: oldScore.api || 0,
                    maliciousBlocked: oldScore.fraudBlocked || 0
                };
            }
        }

        // Migrate fraud-related properties to malicious
        if ('fraudSpikeTimer' in saveData) {
            saveData.maliciousSpikeTimer = saveData.fraudSpikeTimer;
            delete saveData.fraudSpikeTimer;
        }
        
        if ('fraudSpikeActive' in saveData) {
            saveData.maliciousSpikeActive = saveData.fraudSpikeActive;
            delete saveData.fraudSpikeActive;
        }

        saveData.version = '2.0';
        return saveData;
    }

    async migrateFromV2(saveData) {
        console.log('BackwardCompatibility: Migrating from v2.0...');
        
        // Migrate to new modular state structure
        const modularSave = {
            version: this.migrationVersion,
            timestamp: Date.now(),
            migratedFrom: '2.0',
            
            // User data
            user: {
                profile: {
                    id: saveData.userId || null,
                    username: saveData.username || '',
                    createdAt: saveData.createdAt || new Date().toISOString(),
                    preferences: {
                        sound: saveData.soundEnabled !== false,
                        language: saveData.language || 'en',
                        profileVisibility: 'private'
                    }
                },
                progress: {
                    completedTutorials: saveData.completedTutorials || [],
                    completedChallenges: saveData.completedChallenges || [],
                    currentLevel: saveData.level || 1,
                    skillAssessments: saveData.skillAssessments || {},
                    timeSpent: saveData.totalPlayTime || 0
                },
                achievements: saveData.achievements || [],
                statistics: {
                    gamesPlayed: saveData.gamesPlayed || 0,
                    totalScore: saveData.highScore || 0,
                    bestSurvivalTime: saveData.bestTime || 0
                }
            },
            
            // Game session data
            game: {
                mode: saveData.gameMode || 'survival',
                currentSession: {
                    money: saveData.money || 500,
                    reputation: saveData.reputation || 100,
                    currentRPS: saveData.currentRPS || 0.5,
                    totalScore: saveData.score?.total || 0,
                    elapsedTime: saveData.elapsedGameTime || 0,
                    gameMode: saveData.gameMode || 'survival',
                    isRunning: saveData.isRunning || false,
                    
                    // Game state
                    services: saveData.services || [],
                    connections: saveData.connections || [],
                    internetConnections: saveData.internetConnections || [],
                    trafficDistribution: saveData.trafficDistribution || {},
                    failures: saveData.failures || {},
                    
                    // Sandbox specific
                    sandboxBudget: saveData.sandboxBudget || 2000,
                    upkeepEnabled: saveData.upkeepEnabled !== false,
                    burstCount: saveData.burstCount || 10
                },
                settings: {
                    difficulty: 'normal',
                    assistantEnabled: true,
                    tutorialPacing: 'normal'
                }
            },
            
            // UI state
            ui: {
                activeSection: 'game',
                panelStates: {},
                notifications: []
            },
            
            // Legacy compatibility data
            legacy: {
                originalSave: saveData,
                migrationNotes: [
                    'Migrated from legacy v2.0 format',
                    'Game state preserved in game.currentSession',
                    'User preferences migrated to user.profile.preferences'
                ]
            }
        };

        return modularSave;
    }

    validateModularSave(saveData) {
        try {
            // Basic validation of modular save structure
            const requiredPaths = [
                'version',
                'user.profile',
                'game.mode',
                'ui.activeSection'
            ];

            for (const path of requiredPaths) {
                if (!this.getNestedProperty(saveData, path)) {
                    console.warn(`BackwardCompatibility: Missing required property: ${path}`);
                    return false;
                }
            }

            // Validate version
            if (!saveData.version || typeof saveData.version !== 'string') {
                console.warn('BackwardCompatibility: Invalid version format');
                return false;
            }

            return true;
        } catch (error) {
            console.error('BackwardCompatibility: Validation error', error);
            return false;
        }
    }

    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    createCompatibleSave(data) {
        // Create save data that works with both legacy and modular systems
        const currentState = this.stateManager ? this.stateManager.getSnapshot() : {};
        const gameSession = currentState.game?.currentSession;
        
        // Legacy format (for backward compatibility)
        const legacySave = {
            version: '2.0',
            timestamp: Date.now(),
            
            // Core game state
            money: gameSession?.money || 500,
            reputation: gameSession?.reputation || 100,
            currentRPS: gameSession?.currentRPS || 0.5,
            score: {
                total: gameSession?.totalScore || 0,
                storage: gameSession?.storageScore || 0,
                database: gameSession?.databaseScore || 0,
                maliciousBlocked: gameSession?.maliciousBlocked || 0
            },
            elapsedGameTime: gameSession?.elapsedTime || 0,
            gameMode: currentState.game?.mode || 'survival',
            isRunning: gameSession?.isRunning || false,
            
            // Game objects
            services: gameSession?.services || [],
            connections: gameSession?.connections || [],
            internetConnections: gameSession?.internetConnections || [],
            trafficDistribution: gameSession?.trafficDistribution || {},
            failures: gameSession?.failures || {},
            
            // Sandbox
            sandboxBudget: gameSession?.sandboxBudget || 2000,
            upkeepEnabled: gameSession?.upkeepEnabled !== false,
            burstCount: gameSession?.burstCount || 10,
            
            // User data
            userId: currentState.user?.profile?.id,
            username: currentState.user?.profile?.username || '',
            soundEnabled: currentState.user?.profile?.preferences?.sound !== false,
            language: currentState.user?.profile?.preferences?.language || 'en'
        };

        // Modular format
        const modularSave = {
            ...currentState,
            version: this.migrationVersion,
            timestamp: Date.now(),
            compatibilityLayer: {
                legacySupported: true,
                migrationVersion: this.migrationVersion
            }
        };

        return {
            legacy: legacySave,
            modular: modularSave
        };
    }

    // Public API for manual migration
    async migrateLegacySaveFile() {
        try {
            const legacySave = localStorage.getItem('serverSurvivalSave');
            if (!legacySave) {
                throw new Error('No legacy save file found');
            }

            const migratedSave = await this.loadAndMigrateLegacySave();
            if (migratedSave) {
                console.log('BackwardCompatibility: Manual migration completed');
                return migratedSave;
            } else {
                throw new Error('Migration failed');
            }
        } catch (error) {
            console.error('BackwardCompatibility: Manual migration failed', error);
            throw error;
        }
    }

    // Check if legacy save exists
    hasLegacySave() {
        return localStorage.getItem('serverSurvivalSave') !== null;
    }

    // Check if modular save exists
    hasModularSave() {
        return localStorage.getItem('cloudLearningSimulatorSave') !== null;
    }

    // Get migration status
    getMigrationStatus() {
        return {
            hasLegacySave: this.hasLegacySave(),
            hasModularSave: this.hasModularSave(),
            migrationVersion: this.migrationVersion,
            initialized: this.initialized
        };
    }

    async cleanup() {
        this.initialized = false;
        console.log('BackwardCompatibility: Cleaned up');
    }
}

export { BackwardCompatibility };