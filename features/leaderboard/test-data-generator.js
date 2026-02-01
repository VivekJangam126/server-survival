/**
 * Test Data Generator for Leaderboard
 * 
 * PURPOSE: Generate sample MCQ attempts for testing leaderboard functionality
 * STATUS: Development tool - use in browser console
 * 
 * Usage:
 * 1. Open leaderboard/leaderboard.html in browser
 * 2. Open browser console (F12)
 * 3. Copy and paste this script
 * 4. Run: generateTestData()
 * 5. Refresh page to see leaderboard with test data
 */

// Import the attempts storage functions
async function loadAttemptStorage() {
    try {
        const module = await import('../src/challenges/mcq.attempts.js');
        return module;
    } catch (error) {
        console.error('Failed to load attempts storage:', error);
        return null;
    }
}

/**
 * Generate sample MCQ attempts for testing
 */
async function generateTestData() {
    console.log('🧪 Generating test data for leaderboard...');
    
    const storage = await loadAttemptStorage();
    if (!storage) {
        console.error('❌ Could not load storage module');
        return;
    }
    
    const { saveAttempt, clearAllAttempts } = storage;
    
    // Clear existing attempts
    console.log('🗑️ Clearing existing attempts...');
    clearAllAttempts();
    
    // Sample users
    const users = [
        'alice_dev', 'bob_admin', 'charlie_ops', 'diana_sec', 'eve_arch',
        'frank_data', 'grace_ui', 'henry_qa', 'iris_pm', 'jack_devops',
        'kate_cloud', 'liam_net', 'maya_db', 'noah_api', 'olivia_ml'
    ];
    
    // Available challenges
    const challenges = [
        'cloud-basics-001',
        'aws-services-001', 
        'security-basics-001',
        'networking-001'
    ];
    
    let attemptCounter = 1;
    const now = Date.now();
    
    // Generate attempts for each challenge
    for (const challengeId of challenges) {
        console.log(`📝 Generating attempts for ${challengeId}...`);
        
        // Randomly select 8-12 users for this challenge
        const participantCount = 8 + Math.floor(Math.random() * 5);
        const selectedUsers = shuffleArray([...users]).slice(0, participantCount);
        
        for (let i = 0; i < selectedUsers.length; i++) {
            const userId = selectedUsers[i];
            
            // Generate realistic attempt data
            const attempt = generateRealisticAttempt(
                attemptCounter++,
                userId,
                challengeId,
                i, // position influences score for realistic ranking
                now
            );
            
            // Save attempt
            const saved = saveAttempt(attempt);
            if (!saved) {
                console.error(`❌ Failed to save attempt for ${userId}`);
            }
        }
    }
    
    console.log('✅ Test data generation complete!');
    console.log(`📊 Generated attempts for ${challenges.length} challenges`);
    console.log('🔄 Refresh the page to see the leaderboard with test data');
    
    // Show summary
    const totalAttempts = await getTotalAttempts(storage);
    console.log(`📈 Total attempts in storage: ${totalAttempts}`);
}

/**
 * Generate a realistic MCQ attempt
 */
function generateRealisticAttempt(attemptId, userId, challengeId, position, baseTime) {
    // Base scores - higher positions get better scores with some randomness
    const baseScore = Math.max(40, 100 - (position * 8) + (Math.random() * 20 - 10));
    const percentage = Math.min(100, Math.max(0, baseScore));
    
    // Calculate score based on typical question counts
    const questionCounts = {
        'cloud-basics-001': 5,
        'aws-services-001': 8,
        'security-basics-001': 6,
        'networking-001': 7
    };
    
    const totalQuestions = questionCounts[challengeId] || 5;
    const score = Math.round((percentage / 100) * totalQuestions);
    
    // Time taken - better performers tend to be faster, but with variation
    const baseTime = 60 + (position * 15) + (Math.random() * 60); // 60-300 seconds range
    const timeTaken = Math.round(baseTime);
    
    // Completion time - spread over last few days
    const daysAgo = Math.floor(Math.random() * 7); // 0-7 days ago
    const hoursAgo = Math.floor(Math.random() * 24); // 0-24 hours ago
    const minutesAgo = Math.floor(Math.random() * 60); // 0-60 minutes ago
    
    const completedAt = baseTime - (daysAgo * 24 * 60 * 60 * 1000) - 
                       (hoursAgo * 60 * 60 * 1000) - 
                       (minutesAgo * 60 * 1000) +
                       (position * 1000); // Slight offset for tie-breaking
    
    return {
        attempt_id: `test-attempt-${attemptId.toString().padStart(3, '0')}`,
        user_id: userId,
        mcq_challenge_id: challengeId,
        score: score,
        total_questions: totalQuestions,
        percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
        time_taken: timeTaken,
        completed_at: Math.round(completedAt)
    };
}

/**
 * Shuffle array utility
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get total attempts count
 */
async function getTotalAttempts(storage) {
    try {
        const attempts = storage.getAllAttempts();
        return attempts.length;
    } catch (error) {
        console.error('Error getting total attempts:', error);
        return 0;
    }
}

/**
 * Clear all test data
 */
async function clearTestData() {
    console.log('🗑️ Clearing all test data...');
    
    const storage = await loadAttemptStorage();
    if (!storage) {
        console.error('❌ Could not load storage module');
        return;
    }
    
    const cleared = storage.clearAllAttempts();
    if (cleared) {
        console.log('✅ All test data cleared');
        console.log('🔄 Refresh the page to see empty leaderboard');
    } else {
        console.error('❌ Failed to clear test data');
    }
}

/**
 * Generate specific test scenario
 */
async function generateScenario(scenarioName) {
    const storage = await loadAttemptStorage();
    if (!storage) return;
    
    const { saveAttempt, clearAllAttempts } = storage;
    clearAllAttempts();
    
    const now = Date.now();
    
    switch (scenarioName) {
        case 'ties':
            console.log('🧪 Generating tie scenario...');
            // Create attempts with same percentage but different times
            const tieAttempts = [
                {
                    attempt_id: 'tie-001',
                    user_id: 'user_fast',
                    mcq_challenge_id: 'cloud-basics-001',
                    score: 4,
                    total_questions: 5,
                    percentage: 80.0,
                    time_taken: 120, // Faster time
                    completed_at: now - 1000
                },
                {
                    attempt_id: 'tie-002', 
                    user_id: 'user_slow',
                    mcq_challenge_id: 'cloud-basics-001',
                    score: 4,
                    total_questions: 5,
                    percentage: 80.0,
                    time_taken: 180, // Slower time
                    completed_at: now - 2000
                }
            ];
            tieAttempts.forEach(attempt => saveAttempt(attempt));
            break;
            
        case 'single':
            console.log('🧪 Generating single participant scenario...');
            saveAttempt({
                attempt_id: 'single-001',
                user_id: 'lonely_user',
                mcq_challenge_id: 'cloud-basics-001',
                score: 5,
                total_questions: 5,
                percentage: 100.0,
                time_taken: 150,
                completed_at: now
            });
            break;
            
        case 'empty':
            console.log('🧪 Generating empty scenario...');
            // Already cleared, nothing to add
            break;
    }
    
    console.log('✅ Scenario generated. Refresh page to see results.');
}

// Export functions to global scope for console use
window.generateTestData = generateTestData;
window.clearTestData = clearTestData;
window.generateScenario = generateScenario;

// Instructions
console.log('🧪 Leaderboard Test Data Generator Loaded');
console.log('');
console.log('Available Commands:');
console.log('• generateTestData()              - Generate realistic test data');
console.log('• clearTestData()                 - Clear all test data');
console.log('• generateScenario("ties")        - Generate tie-breaking scenario');
console.log('• generateScenario("single")      - Generate single participant');
console.log('• generateScenario("empty")       - Generate empty scenario');
console.log('');
console.log('Run: generateTestData() to populate leaderboard with sample data');