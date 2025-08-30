# 🎯 Flashcards Quiz

A simple, fast flashcards quiz application built with FastAPI and vanilla JavaScript. Create your own study cards and test your knowledge with an interactive quiz mode!

## ✨ Features

- **Create Flashcards**: Add custom questions and answers
- **Interactive Quiz Mode**: Test yourself with shuffled cards
- **Score Tracking**: See your progress and final results
- **No Database Required**: Everything runs in memory for speed
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Keyboard Shortcuts**: Quick navigation during quizzes

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- pip

### Installation

1. **Clone or download the project**
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```bash
   python app.py
   ```

4. **Open your browser and go to:**
   ```
   http://localhost:8000
   ```

## 🎮 How to Use

### Creating Flashcards
1. Type your question in the "Question" field
2. Type the answer in the "Answer" field
3. Click "Add Card" to save your flashcard

### Taking a Quiz
1. Click "Start Quiz" to begin
2. Read the question and think of your answer
3. Click "Reveal Answer" to see the correct answer
4. Mark whether you "Got it! ✅" or "Missed ❌"
5. Continue through all cards to see your final score

### Keyboard Shortcuts (during quiz)
- **R**: Reveal answer
- **1**: Mark as "Got it!"
- **2**: Mark as "Missed"

## 🏗️ Architecture

- **Backend**: FastAPI with in-memory storage
- **Frontend**: Vanilla JavaScript with modern CSS
- **API**: RESTful endpoints for card management and quiz sessions
- **Storage**: Session-based in-memory storage (no persistence)

## 📁 Project Structure

```
FlashcardsQuiz/
├── app.py              # FastAPI backend server
├── requirements.txt    # Python dependencies
├── static/            # Frontend files
│   ├── index.html     # Main HTML interface
│   └── main.js        # JavaScript functionality
└── README.md          # This file
```

## 🔧 API Endpoints

- `GET /` - Main application page
- `GET /api/cards` - Get all flashcards
- `POST /api/cards` - Create a new flashcard
- `DELETE /api/cards/{id}` - Delete a flashcard
- `POST /api/quiz/start` - Start a new quiz session
- `GET /api/quiz/current` - Get current quiz card
- `POST /api/quiz/answer` - Submit quiz answer
- `DELETE /api/quiz` - End quiz session

## 💡 Perfect For

- **Quick Study Sessions**: No setup required, just start studying
- **Live Demos**: Great for presentations and interviews
- **Learning New Topics**: Create cards as you learn
- **Memory Training**: Regular practice to improve retention

## 🎨 Customization

The app is designed to be easily customizable:
- Modify colors and styling in `static/index.html`
- Add new features in `static/main.js`
- Extend the API in `app.py`

## 🚀 Future Enhancements

- Card categories and tags
- Export/import functionality
- Spaced repetition algorithms
- User accounts and progress tracking
- Mobile app version

---

**Happy Studying! 🎓**
