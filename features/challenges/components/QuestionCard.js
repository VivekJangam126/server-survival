/**
 * QuestionCard Component
 * Renders a single MCQ question with options
 * Pure rendering component - no business logic
 */

class QuestionCard {
    /**
     * Render question card
     * @param {Object} data - Question data
     * @param {Object} data.question - Question object
     * @param {number} data.questionNumber - Current question number (1-based)
     * @param {number} data.totalQuestions - Total number of questions
     * @param {string|null} data.selectedAnswer - Currently selected answer
     * @param {Function} data.onAnswerSelect - Callback when answer is selected
     */
    static render(data) {
        const container = document.getElementById('question-card-container');
        if (!container) {
            console.error('Question card container not found');
            return;
        }

        const { question, questionNumber, totalQuestions, selectedAnswer, onAnswerSelect } = data;

        if (!question) {
            container.innerHTML = this.renderErrorState('Question not found');
            return;
        }

        container.innerHTML = `
            <div class="glass-panel rounded-xl p-8 max-w-4xl mx-auto">
                <!-- Question Header -->
                <div class="flex justify-between items-center mb-6">
                    <div class="flex items-center gap-4">
                        <span class="text-sm font-medium text-gray-400">
                            Question ${questionNumber} of ${totalQuestions}
                        </span>
                        <div class="flex-1 bg-gray-700 rounded-full h-2">
                            <div class="bg-blue-500 h-2 rounded-full progress-bar" 
                                 style="width: ${(questionNumber / totalQuestions) * 100}%"></div>
                        </div>
                    </div>
                </div>

                <!-- Question Text -->
                <div class="mb-8">
                    <h2 class="text-xl font-bold text-white leading-relaxed">
                        ${this.escapeHtml(question.question_text)}
                    </h2>
                </div>

                <!-- Answer Options -->
                <div class="space-y-4">
                    ${this.renderOptions(question.options, selectedAnswer, onAnswerSelect)}
                </div>

                <!-- Question Info -->
                <div class="mt-6 pt-6 border-t border-gray-700">
                    <div class="flex items-center justify-between text-sm text-gray-400">
                        <span>Select your answer above</span>
                        <span class="flex items-center gap-2">
                            ${selectedAnswer ? 
                                `<span class="text-green-400">✓ Answer selected: ${selectedAnswer}</span>` : 
                                '<span class="text-yellow-400">⚠ No answer selected</span>'
                            }
                        </span>
                    </div>
                </div>
            </div>
        `;

        // Attach event listeners
        this.attachEventListeners(onAnswerSelect);
    }

    /**
     * Render answer options
     * @param {Object} options - Options object (A, B, C, D)
     * @param {string|null} selectedAnswer - Currently selected answer
     * @param {Function} onAnswerSelect - Selection callback
     * @returns {string} HTML string
     */
    static renderOptions(options, selectedAnswer, onAnswerSelect) {
        const optionKeys = ['A', 'B', 'C', 'D'];
        
        return optionKeys.map(key => {
            const optionText = options[key];
            if (!optionText) return '';

            const isSelected = selectedAnswer === key;
            const selectedClass = isSelected ? 'selected border-blue-500 bg-blue-500/20' : 'border-gray-600';

            return `
                <div class="question-option border-2 ${selectedClass} rounded-lg p-4 cursor-pointer transition-all duration-200"
                     data-option="${key}">
                    <div class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full border-2 ${isSelected ? 'border-blue-400 bg-blue-400' : 'border-gray-500'} 
                                    flex items-center justify-center text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-400'}">
                            ${key}
                        </div>
                        <div class="flex-1 text-gray-200 leading-relaxed">
                            ${this.escapeHtml(optionText)}
                        </div>
                        ${isSelected ? 
                            '<div class="flex-shrink-0 text-blue-400"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div>' : 
                            ''
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Attach event listeners to options
     * @param {Function} onAnswerSelect - Selection callback
     */
    static attachEventListeners(onAnswerSelect) {
        document.querySelectorAll('.question-option').forEach(option => {
            option.addEventListener('click', () => {
                const selectedOption = option.getAttribute('data-option');
                if (selectedOption && onAnswerSelect) {
                    onAnswerSelect(selectedOption);
                }
            });
        });
    }

    /**
     * Render error state
     * @param {string} message - Error message
     * @returns {string} HTML string
     */
    static renderErrorState(message) {
        return `
            <div class="glass-panel rounded-xl p-8 max-w-4xl mx-auto text-center">
                <div class="text-6xl mb-4">⚠️</div>
                <h3 class="text-xl font-bold mb-2 text-red-400">Error</h3>
                <p class="text-gray-400">${this.escapeHtml(message)}</p>
            </div>
        `;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    static escapeHtml(text) {
        if (typeof text !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update selected answer without full re-render
     * @param {string} selectedAnswer - New selected answer
     */
    static updateSelectedAnswer(selectedAnswer) {
        // Remove previous selection
        document.querySelectorAll('.question-option').forEach(option => {
            option.classList.remove('selected', 'border-blue-500', 'bg-blue-500/20');
            option.classList.add('border-gray-600');
            
            const circle = option.querySelector('.w-8.h-8');
            const checkmark = option.querySelector('.text-blue-400');
            
            if (circle) {
                circle.classList.remove('border-blue-400', 'bg-blue-400', 'text-white');
                circle.classList.add('border-gray-500', 'text-gray-400');
            }
            
            if (checkmark) {
                checkmark.remove();
            }
        });

        // Add new selection
        const selectedOption = document.querySelector(`[data-option="${selectedAnswer}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected', 'border-blue-500', 'bg-blue-500/20');
            selectedOption.classList.remove('border-gray-600');
            
            const circle = selectedOption.querySelector('.w-8.h-8');
            if (circle) {
                circle.classList.add('border-blue-400', 'bg-blue-400', 'text-white');
                circle.classList.remove('border-gray-500', 'text-gray-400');
            }
            
            // Add checkmark
            const checkmarkHtml = '<div class="flex-shrink-0 text-blue-400"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div>';
            const contentDiv = selectedOption.querySelector('.flex.items-start.gap-4');
            if (contentDiv && !contentDiv.querySelector('.text-blue-400')) {
                contentDiv.insertAdjacentHTML('beforeend', checkmarkHtml);
            }
        }
    }
}

// Export for global access
window.QuestionCard = QuestionCard;