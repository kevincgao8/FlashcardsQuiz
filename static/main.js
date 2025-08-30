// Global state
let currentQuizSession = null;
let selectedAnswer = null;
let currentCard = null;

// API base URL
const API_BASE = '';

// Debug logging
console.log('Flashcards Quiz JavaScript loaded successfully!');

// Utility functions
function showAlert(message, type = 'info') {
    console.log(`Showing alert: ${message} (${type})`);
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Insert at the top of content
    const content = document.querySelector('.content');
    if (content) {
        content.insertBefore(alertDiv, content.firstChild);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    } else {
        console.error('Content element not found');
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    } else {
        console.error(`Element with id '${elementId}' not found`);
    }
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
    } else {
        console.error(`Element with id '${elementId}' not found`);
    }
}

// API functions
async function apiCall(endpoint, options = {}) {
    console.log(`Making API call to: ${endpoint}`, options);
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        console.log(`API response status: ${response.status}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`API response data:`, data);
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showAlert(`Error: ${error.message}`, 'danger');
        throw error;
    }
}

// Card management functions
async function createCard() {
    console.log('createCard function called');
    const question = document.getElementById('question').value.trim();
    const answer = document.getElementById('answer').value.trim();
    
    console.log(`Creating card - Question: "${question}", Answer: "${answer}"`);
    
    if (!question || !answer) {
        showAlert('Please fill in both question and answer fields.', 'danger');
        return;
    }
    
    try {
        const result = await apiCall('/api/cards', {
            method: 'POST',
            body: JSON.stringify({ question, answer })
        });
        
        console.log('Card created successfully:', result);
        
        // Clear form
        document.getElementById('question').value = '';
        document.getElementById('answer').value = '';
        
        // Refresh cards list
        await loadCards();
        
        showAlert('Card created successfully!', 'success');
    } catch (error) {
        console.error('Error creating card:', error);
    }
}

async function deleteCard(cardId) {
    console.log(`deleteCard function called with id: ${cardId}`);
    if (!confirm('Are you sure you want to delete this card?')) {
        return;
    }
    
    try {
        await apiCall(`/api/cards/${cardId}`, {
            method: 'DELETE'
        });
        
        await loadCards();
        showAlert('Card deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting card:', error);
    }
}

async function loadCards() {
    console.log('loadCards function called');
    try {
        const data = await apiCall('/api/cards');
        console.log('Cards loaded:', data);
        displayCards(data.cards);
    } catch (error) {
        console.error('Error loading cards:', error);
        const cardsList = document.getElementById('cardsList');
        if (cardsList) {
            cardsList.innerHTML = '<div class="loading">Error loading cards. Please try again.</div>';
        }
    }
}

function displayCards(cards) {
    console.log('displayCards function called with:', cards);
    const cardsList = document.getElementById('cardsList');
    
    if (!cardsList) {
        console.error('cardsList element not found');
        return;
    }
    
    if (cards.length === 0) {
        cardsList.innerHTML = '<div class="loading">No flashcards yet. Create your first one above!</div>';
        return;
    }
    
    cardsList.innerHTML = cards.map(card => `
        <div class="card-item">
            <div class="card-question">${escapeHtml(card.question)}</div>
            <div class="card-answer">${escapeHtml(card.answer)}</div>
            <button class="btn btn-danger" onclick="deleteCard(${card.id})" style="margin-top: 10px;">
                Delete
            </button>
        </div>
    `).join('');
    
    console.log(`Displayed ${cards.length} cards`);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Quiz functions
async function startQuiz() {
    console.log('startQuiz function called');
    try {
        const data = await apiCall('/api/quiz/start', {
            method: 'POST'
        });
        
        console.log('Quiz started:', data);
        
        currentQuizSession = data;
        currentCard = data.current_card;
        selectedAnswer = null;
        
        showElement('quizCard');
        hideElement('quizControls');
        hideElement('quizResults');
        
        displayQuizCard(currentCard, 1, data.total_questions, 0);
        showAlert('Quiz started! Good luck!', 'success');
    } catch (error) {
        console.error('Error starting quiz:', error);
    }
}

function displayQuizCard(card, currentIndex, totalQuestions, score) {
    console.log('displayQuizCard function called:', { card, currentIndex, totalQuestions, score });
    
    const quizQuestion = document.getElementById('quizQuestion');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const quizOptions = document.getElementById('quizOptions');
    
    if (!quizQuestion || !scoreDisplay || !quizOptions) {
        console.error('Required quiz elements not found');
        return;
    }
    
    quizQuestion.textContent = card.question;
    scoreDisplay.textContent = `Question ${currentIndex} of ${totalQuestions} | Score: ${score}`;
    
    // Display multiple choice options
    quizOptions.innerHTML = card.options.map((option, index) => `
        <button class="btn-option" onclick="selectAnswer('${option}')" data-option="${option}">
            ${String.fromCharCode(65 + index)}. ${escapeHtml(option)}
        </button>
    `).join('');
    
    // Reset state
    selectedAnswer = null;
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.disabled = true;
    hideElement('feedback');
    hideElement('nextBtn');
    showElement('submitBtn');
    
    // Reset option styles
    document.querySelectorAll('.btn-option').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'incorrect');
    });
    
    console.log('Quiz card displayed successfully');
}

function selectAnswer(answer) {
    console.log('selectAnswer function called with:', answer);
    selectedAnswer = answer;
    
    // Update button styles
    document.querySelectorAll('.btn-option').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.option === answer) {
            btn.classList.add('selected');
        }
    });
    
    // Enable submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.disabled = false;
}

async function submitAnswer() {
    console.log('submitAnswer function called');
    if (!selectedAnswer) {
        showAlert('Please select an answer first.', 'danger');
        return;
    }
    
    try {
        const data = await apiCall('/api/quiz/answer', {
            method: 'POST',
            body: JSON.stringify({ selected_answer: selectedAnswer })
        });
        
        console.log('Answer submitted:', data);
        
        // Show feedback
        showAnswerFeedback(data.was_correct);
        
        if (data.message === 'Quiz completed') {
            // Quiz is complete
            setTimeout(() => {
                showQuizResults(data.final_score, data.total_questions);
            }, 2000);
        } else {
            // Move to next card
            currentCard = data.next_card;
            setTimeout(() => {
                displayQuizCard(data.next_card, data.current_index, data.total_questions, data.score);
            }, 2000);
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
    }
}

function showAnswerFeedback(isCorrect) {
    console.log('showAnswerFeedback function called with:', isCorrect);
    
    const feedback = document.getElementById('feedback');
    const submitBtn = document.getElementById('submitBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!feedback || !submitBtn || !nextBtn) {
        console.error('Required feedback elements not found');
        return;
    }
    
    // Update option styles to show correct/incorrect
    document.querySelectorAll('.btn-option').forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        if (btn.dataset.option === currentCard.answer) {
            btn.classList.add('correct');
        } else if (btn.dataset.option === selectedAnswer && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });
    
    // Show feedback message
    feedback.textContent = isCorrect ? '✅ Correct!' : '❌ Incorrect!';
    feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    showElement('feedback');
    
    // Update buttons
    hideElement('submitBtn');
    showElement('nextBtn');
    
    // Disable option selection
    document.querySelectorAll('.btn-option').forEach(btn => {
        btn.style.pointerEvents = 'none';
    });
}

function nextQuestion() {
    console.log('nextQuestion function called');
    // This will be handled by the setTimeout in submitAnswer
    // Just hide the next button to prevent multiple clicks
    hideElement('nextBtn');
}

function showQuizResults(finalScore, totalQuestions) {
    console.log('showQuizResults function called:', { finalScore, totalQuestions });
    
    hideElement('quizCard');
    showElement('quizResults');
    
    const percentage = Math.round((finalScore / totalQuestions) * 100);
    const message = `You got ${finalScore} out of ${totalQuestions} questions correct (${percentage}%)`;
    
    const finalScoreElement = document.getElementById('finalScore');
    if (finalScoreElement) {
        finalScoreElement.textContent = message;
    }
    
    if (percentage >= 80) {
        showAlert('🎉 Excellent work! You\'re a master!', 'success');
    } else if (percentage >= 60) {
        showAlert('👍 Good job! Keep practicing!', 'success');
    } else {
        showAlert('📚 Keep studying! Practice makes perfect!', 'info');
    }
}

async function endQuiz() {
    console.log('endQuiz function called');
    try {
        await apiCall('/api/quiz', {
            method: 'DELETE'
        });
        
        currentQuizSession = null;
        currentCard = null;
        selectedAnswer = null;
        hideElement('quizResults');
        showElement('quizControls');
        
        showAlert('Quiz session ended.', 'info');
    } catch (error) {
        console.error('Error ending quiz:', error);
    }
}

// Make functions globally accessible
window.createCard = createCard;
window.deleteCard = deleteCard;
window.startQuiz = startQuiz;
window.selectAnswer = selectAnswer;
window.submitAnswer = submitAnswer;
window.nextQuestion = nextQuestion;
window.endQuiz = endQuiz;

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Flashcards Quiz app initializing...');
    
    try {
        await loadCards();
        
        // Add some sample cards if none exist
        setTimeout(async () => {
            try {
                const data = await apiCall('/api/cards');
                if (data.cards.length === 0) {
                    // Add sample cards
                    const sampleCards = [
                        { question: "What is the capital of France?", answer: "Paris" },
                        { question: "What is 2 + 2?", answer: "4" },
                        { question: "What is the largest planet in our solar system?", answer: "Jupiter" }
                    ];
                    
                    for (const card of sampleCards) {
                        await apiCall('/api/cards', {
                            method: 'POST',
                            body: JSON.stringify(card)
                        });
                    }
                    
                    await loadCards();
                    showAlert('Sample flashcards added to get you started!', 'info');
                }
            } catch (error) {
                console.log('Could not add sample cards:', error);
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showAlert('Error initializing the app. Please refresh the page.', 'danger');
    }
});
