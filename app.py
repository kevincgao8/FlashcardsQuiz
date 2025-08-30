from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import random

app = FastAPI(title="Flashcards Quiz", version="1.0.0")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Data models
class Flashcard(BaseModel):
    id: int
    question: str
    answer: str
    options: List[str] = []

class QuizSession(BaseModel):
    cards: List[Flashcard]
    current_index: int = 0
    score: int = 0
    total_questions: int = 0

# In-memory storage
flashcards: List[Flashcard] = []
quiz_session: Optional[QuizSession] = None
next_id = 1

# Function to generate multiple choice options
def generate_options(correct_answer: str) -> List[str]:
    """Generate multiple choice options including the correct answer"""
    # Common wrong answers for different types of questions
    wrong_answers = {
        "Paris": ["London", "Berlin", "Madrid"],
        "4": ["5", "6", "3"],
        "Jupiter": ["Saturn", "Mars", "Venus"],
        "Washington D.C.": ["New York", "Los Angeles", "Chicago"],
        "Tokyo": ["Seoul", "Beijing", "Bangkok"],
        "Australia": ["New Zealand", "Fiji", "Papua New Guinea"],
        "Blue": ["Red", "Green", "Yellow"],
        "Shakespeare": ["Dickens", "Hemingway", "Tolstoy"],
        "DNA": ["RNA", "Protein", "Enzyme"],
        "Gravity": ["Magnetism", "Electricity", "Friction"]
    }
    
    # Get wrong answers for this specific answer, or use generic ones
    if correct_answer in wrong_answers:
        wrong_choices = wrong_answers[correct_answer]
    else:
        # Generic wrong answers for unknown questions
        wrong_choices = ["Option A", "Option B", "Option C"]
    
    # Create options list with correct answer and wrong answers
    options = [correct_answer] + wrong_choices[:3]
    
    # Shuffle the options so correct answer isn't always first
    random.shuffle(options)
    
    return options

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

@app.get("/api/cards")
async def get_cards():
    """Get all flashcards"""
    return {"cards": flashcards}

@app.post("/api/cards")
async def create_card(flashcard: dict):
    """Create a new flashcard"""
    global next_id
    
    # Generate multiple choice options
    options = generate_options(flashcard["answer"])
    
    new_card = Flashcard(
        id=next_id,
        question=flashcard["question"],
        answer=flashcard["answer"],
        options=options
    )
    flashcards.append(new_card)
    next_id += 1
    return {"message": "Card created", "card": new_card}

@app.delete("/api/cards/{card_id}")
async def delete_card(card_id: int):
    """Delete a flashcard by ID"""
    global flashcards
    original_length = len(flashcards)
    flashcards = [card for card in flashcards if card.id != card_id]
    
    if len(flashcards) == original_length:
        raise HTTPException(status_code=404, detail="Card not found")
    
    return {"message": "Card deleted"}

@app.post("/api/quiz/start")
async def start_quiz():
    """Start a new quiz session"""
    global quiz_session
    if not flashcards:
        raise HTTPException(status_code=400, detail="No flashcards available")
    
    # Shuffle cards for quiz
    shuffled_cards = flashcards.copy()
    random.shuffle(shuffled_cards)
    
    quiz_session = QuizSession(
        cards=shuffled_cards,
        current_index=0,
        score=0,
        total_questions=len(shuffled_cards)
    )
    
    return {
        "message": "Quiz started",
        "total_questions": quiz_session.total_questions,
        "current_card": quiz_session.cards[0] if quiz_session.cards else None
    }

@app.get("/api/quiz/current")
async def get_current_card():
    """Get the current card in the quiz"""
    if not quiz_session:
        raise HTTPException(status_code=400, detail="No active quiz session")
    
    if quiz_session.current_index >= len(quiz_session.cards):
        return {"message": "Quiz completed", "final_score": quiz_session.score, "total_questions": quiz_session.total_questions}
    
    return {
        "current_card": quiz_session.cards[quiz_session.current_index],
        "current_index": quiz_session.current_index + 1,
        "total_questions": quiz_session.total_questions,
        "score": quiz_session.score
    }

@app.post("/api/quiz/answer")
async def submit_answer(answer_data: dict):
    """Submit answer for current card and move to next"""
    global quiz_session
    if not quiz_session:
        raise HTTPException(status_code=400, detail="No active quiz session")
    
    if quiz_session.current_index >= len(quiz_session.cards):
        raise HTTPException(status_code=400, detail="Quiz already completed")
    
    # Check if answer is correct
    current_card = quiz_session.cards[quiz_session.current_index]
    is_correct = answer_data["selected_answer"] == current_card.answer
    
    # Update score
    if is_correct:
        quiz_session.score += 1
    
    # Move to next card
    quiz_session.current_index += 1
    
    # Check if quiz is complete
    if quiz_session.current_index >= len(quiz_session.cards):
        return {
            "message": "Quiz completed",
            "final_score": quiz_session.score,
            "total_questions": quiz_session.total_questions,
            "was_correct": is_correct
        }
    
    # Return next card
    return {
        "next_card": quiz_session.cards[quiz_session.current_index],
        "current_index": quiz_session.current_index + 1,
        "total_questions": quiz_session.total_questions,
        "score": quiz_session.score,
        "was_correct": is_correct
    }

@app.delete("/api/quiz")
async def end_quiz():
    """End the current quiz session"""
    global quiz_session
    quiz_session = None
    return {"message": "Quiz session ended"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
