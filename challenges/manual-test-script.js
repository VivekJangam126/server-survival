/**
 * Manual Test Script for MCQ Challenge Page
 * 
 * PURPOSE: Development and debugging tool for MCQ Challenge functionality
 * STATUS: Keep for ongoing testing and validation
 * 
 * Run this in browser console on challenges/challenges.html
 * 
 * Usage:
 * 1. Open challenges/challenges.html in browser
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Run: await runMCQTests()
 */

async function runMCQTests() {
    console.log('🧪 Starting MCQ Challenge Manual Tests...');
    
    const results = [];
    
    function logTest(name, success, message, details = null) {
        const result = { name, success, message, details, timestamp: new Date().toISOString() };
        results.push(result);
        
        const emoji = success ? '✅' : '❌';
        console.log(`${emoji} ${name}: ${message}`);
        if (details) console.log('   Details:', details);
    }
    
    // Test 1: Check if page loaded correctly
    try {
        const controller = window.ChallengesPageController;
        if (!controller) throw new Error('ChallengesPageController not found');
        
        logTest('Page Load', true, 'ChallengesPageController loaded successfully');
    } catch (error) {
        logTest('Page Load', false, error.message);
        return results;
    }
    
    // Test 2: Check challenge list loading
    try {
        const challengeList = document.getElementById('challenge-list');
        const challengeCards = document.querySelectorAll('.challenge-card');
        
        if (!challengeList) throw new Error('Challenge list container not found');
        if (challengeCards.length === 0) throw new Error('No challenge cards found');
        
        logTest('Challenge List', true, `Found ${challengeCards.length} challenge cards`, {
            containerExists: !!challengeList,
            cardCount: challengeCards.length
        });
    } catch (error) {
        logTest('Challenge List', false, error.message);
    }
    
    // Test 3: Test challenge start (simulate click)
    try {
        const firstChallengeBtn = document.querySelector('.challenge-start-btn');
        if (!firstChallengeBtn) throw new Error('No challenge start button found');
        
        // Store original state
        const originalView = window.ChallengesPageController.currentView;
        
        // Simulate click
        firstChallengeBtn.click();
        
        // Wait for view change
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newView = window.ChallengesPageController.currentView;
        const testView = document.getElementById('mcq-test-view');
        
        if (newView !== 'test') throw new Error(`Expected view 'test', got '${newView}'`);
        if (!testView || testView.classList.contains('hidden')) {
            throw new Error('Test view not visible');
        }
        
        logTest('Challenge Start', true, 'Challenge started successfully', {
            originalView,
            newView,
            testViewVisible: !testView.classList.contains('hidden')
        });
    } catch (error) {
        logTest('Challenge Start', false, error.message);
    }
    
    // Test 4: Check timer display
    try {
        const timerDisplay = document.getElementById('timer-display');
        if (!timerDisplay) throw new Error('Timer display not found');
        
        const timerText = timerDisplay.textContent;
        const timerPattern = /^\d{2}:\d{2}$/;
        
        if (!timerPattern.test(timerText)) {
            throw new Error(`Invalid timer format: ${timerText}`);
        }
        
        logTest('Timer Display', true, 'Timer displaying correctly', {
            timerText,
            element: !!timerDisplay
        });
    } catch (error) {
        logTest('Timer Display', false, error.message);
    }
    
    // Test 5: Check question display
    try {
        const questionCard = document.getElementById('question-card-container');
        const questionOptions = document.querySelectorAll('.question-option');
        
        if (!questionCard) throw new Error('Question card container not found');
        if (questionOptions.length === 0) throw new Error('No question options found');
        
        logTest('Question Display', true, 'Question and options displayed', {
            containerExists: !!questionCard,
            optionCount: questionOptions.length
        });
    } catch (error) {
        logTest('Question Display', false, error.message);
    }
    
    // Test 6: Test answer selection
    try {
        const firstOption = document.querySelector('.question-option');
        if (!firstOption) throw new Error('No question option found');
        
        // Simulate click
        firstOption.click();
        
        // Wait for selection
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const selectedOptions = document.querySelectorAll('.question-option.selected');
        
        if (selectedOptions.length === 0) {
            throw new Error('No option selected after click');
        }
        
        logTest('Answer Selection', true, 'Answer selection works', {
            selectedCount: selectedOptions.length,
            selectedOption: selectedOptions[0].getAttribute('data-option')
        });
    } catch (error) {
        logTest('Answer Selection', false, error.message);
    }
    
    // Test 7: Check navigation buttons
    try {
        const nextBtn = document.getElementById('next-question-btn');
        const submitBtn = document.getElementById('submit-challenge-btn');
        const prevBtn = document.getElementById('prev-question-btn');
        
        const controller = window.ChallengesPageController;
        const isLastQuestion = controller.currentQuestionIndex === controller.currentQuestions.length - 1;
        
        if (isLastQuestion) {
            if (!submitBtn) throw new Error('Submit button not found on last question');
            if (nextBtn) throw new Error('Next button should not exist on last question');
        } else {
            if (!nextBtn) throw new Error('Next button not found on non-last question');
        }
        
        logTest('Navigation Buttons', true, 'Navigation buttons correct for question position', {
            isLastQuestion,
            hasNextBtn: !!nextBtn,
            hasSubmitBtn: !!submitBtn,
            hasPrevBtn: !!prevBtn,
            currentIndex: controller.currentQuestionIndex,
            totalQuestions: controller.currentQuestions.length
        });
    } catch (error) {
        logTest('Navigation Buttons', false, error.message);
    }
    
    // Test 8: Test question navigation
    try {
        const controller = window.ChallengesPageController;
        const initialIndex = controller.currentQuestionIndex;
        const totalQuestions = controller.currentQuestions.length;
        
        if (initialIndex < totalQuestions - 1) {
            const nextBtn = document.getElementById('next-question-btn');
            if (nextBtn) {
                nextBtn.click();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const newIndex = controller.currentQuestionIndex;
                if (newIndex !== initialIndex + 1) {
                    throw new Error(`Expected index ${initialIndex + 1}, got ${newIndex}`);
                }
            }
        }
        
        logTest('Question Navigation', true, 'Question navigation works', {
            initialIndex,
            newIndex: controller.currentQuestionIndex,
            totalQuestions
        });
    } catch (error) {
        logTest('Question Navigation', false, error.message);
    }
    
    // Test 9: Check engine state consistency
    try {
        const controller = window.ChallengesPageController;
        const controllerState = controller.getState();
        
        // Import engine status (if available)
        if (window.getStatus) {
            const engineStatus = window.getStatus();
            
            if (engineStatus.totalQuestions !== controllerState.totalQuestions) {
                throw new Error('Question count mismatch between engine and controller');
            }
        }
        
        logTest('Engine Consistency', true, 'Engine and controller states consistent', {
            controllerState: {
                currentView: controllerState.currentView,
                questionIndex: controllerState.currentQuestionIndex,
                totalQuestions: controllerState.totalQuestions,
                answeredCount: controllerState.answeredCount
            }
        });
    } catch (error) {
        logTest('Engine Consistency', false, error.message);
    }
    
    // Test 10: Test complete workflow simulation
    try {
        const controller = window.ChallengesPageController;
        const totalQuestions = controller.currentQuestions.length;
        
        // Navigate to last question
        controller.currentQuestionIndex = totalQuestions - 1;
        controller.renderMCQTest();
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if submit button appears
        const submitBtn = document.getElementById('submit-challenge-btn');
        if (!submitBtn) throw new Error('Submit button not found on last question');
        
        logTest('Workflow Simulation', true, 'Complete workflow elements present', {
            totalQuestions,
            lastQuestionIndex: totalQuestions - 1,
            hasSubmitButton: !!submitBtn
        });
    } catch (error) {
        logTest('Workflow Simulation', false, error.message);
    }
    
    // Summary
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    const passRate = Math.round((passed / total) * 100);
    
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    console.log(`Passed: ${passed}/${total} (${passRate}%)`);
    console.log(`Status: ${passRate === 100 ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ⚠️'}`);
    
    if (passRate < 100) {
        console.log('\n❌ FAILED TESTS:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`   • ${r.name}: ${r.message}`);
        });
    }
    
    console.log('\n📋 DETAILED RESULTS:');
    console.table(results.map(r => ({
        Test: r.name,
        Status: r.success ? 'PASS' : 'FAIL',
        Message: r.message
    })));
    
    return results;
}

// Quick test functions for individual components
window.testChallengeStart = async function() {
    console.log('🧪 Testing challenge start...');
    const btn = document.querySelector('.challenge-start-btn');
    if (btn) {
        btn.click();
        console.log('✅ Challenge start button clicked');
    } else {
        console.log('❌ No challenge start button found');
    }
};

window.testAnswerSelection = function() {
    console.log('🧪 Testing answer selection...');
    const option = document.querySelector('.question-option');
    if (option) {
        option.click();
        console.log('✅ Answer option clicked');
    } else {
        console.log('❌ No answer option found');
    }
};

window.testNavigation = function() {
    console.log('🧪 Testing navigation...');
    const nextBtn = document.getElementById('next-question-btn');
    const submitBtn = document.getElementById('submit-challenge-btn');
    
    if (nextBtn) {
        nextBtn.click();
        console.log('✅ Next button clicked');
    } else if (submitBtn) {
        console.log('⚠️ On last question - submit button available');
    } else {
        console.log('❌ No navigation button found');
    }
};

window.checkControllerState = function() {
    console.log('🧪 Checking controller state...');
    const controller = window.ChallengesPageController;
    if (controller) {
        const state = controller.getState();
        console.log('Controller State:', state);
        return state;
    } else {
        console.log('❌ Controller not found');
        return null;
    }
};

// Instructions
console.log('🧪 MCQ Challenge Manual Test Script Loaded');
console.log('');
console.log('Available Commands:');
console.log('• await runMCQTests()           - Run full test suite');
console.log('• testChallengeStart()          - Test challenge start');
console.log('• testAnswerSelection()         - Test answer selection');
console.log('• testNavigation()              - Test navigation');
console.log('• checkControllerState()        - Check controller state');
console.log('');
console.log('Run: await runMCQTests() to start comprehensive testing');