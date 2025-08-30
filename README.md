# FlashcardsQuiz
A tiny full-stack app to create flashcards and quiz yourself.

## What it does
- Add cards (`front`, `back`) and view them in a list.
- Start a quiz: see the front, click Reveal to show the back, mark Got it / Missed.
- No database; data lives in memory for the session. Static files are served from `/`.

## Acceptance Criteria
- `GET /api/health` → `{"ok": true}`
- `GET /api/cards` → list of existing cards (in memory)
- `POST /api/cards {front, back}` → creates a card; returns it with an `id`
- Frontend (vanilla JS) can: add cards, list cards, run a simple quiz (client-side)

## Run
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
# open http://127.0.0.1:8000
