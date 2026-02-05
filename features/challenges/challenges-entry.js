/**
 * Challenges Page Entry Point
 * This module initializes the MCQ Challenges page
 * Loaded by challenges.html via script tag
 */

// Import MCQ engine and components
import { 
    getAllChallenges,
    getAttemptsByUser,
    startChallenge,
    submitAnswer,
    submitChallenge,
    getStatus,
    setTimeUpdateCallback,
    setTimeUpCallback,
    resetEngine
} from '/src/challenges/index.js';

// Expose MCQ engine to window for components
window.MCQEngine = {
    getAllChallenges,
    getAttemptsByUser,
    startChallenge,
    submitAnswer,
    submitChallenge,
    getStatus,
    setTimeUpdateCallback,
    setTimeUpCallback,
    resetEngine
};

// Load components dynamically
async function loadComponents() {
    const components = [
        '/features/challenges/ChallengesPageController.js',
        '/features/challenges/components/ChallengeList.js',
        '/features/challenges/components/MCQTest.js',
        '/features/challenges/components/QuestionCard.js',
        '/features/challenges/components/ResultSummary.js'
    ];

    for (const componentPath of components) {
        try {
            await import(/* @vite-ignore */ componentPath);
            console.log(`Loaded: ${componentPath}`);
        } catch (error) {
            console.error(`Failed to load: ${componentPath}`, error);
            throw error;
        }
    }
}

// Initialize page
async function initializePage() {
    try {
        console.log('Initializing MCQ Challenges page...');
        
        // Load components
        await loadComponents();
        
        // Initialize controller
        if (window.ChallengesPageController) {
            window.ChallengesPageController.init();
            console.log('MCQ Challenges page initialized successfully');
        } else {
            throw new Error('ChallengesPageController not available');
        }
        
    } catch (error) {
        console.error('Page initialization failed:', error);
        showError(`Failed to load page: ${error.message}`);
    }
}

// Show error state
function showError(message) {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('error-state').classList.remove('hidden');
    document.getElementById('error-message').textContent = message;
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}
