# Smart Resume Builder

A modern, AI-powered resume builder with inline editing capabilities.

## Features
- Template selection with multiple professional designs
- Inline editing for all resume sections
- Dynamic section management (add/remove/reorder)
- AI-powered content suggestions using Gemini
- PDF export functionality
- Draft saving and resume management

## Tech Stack
- Frontend: React.js with Tailwind CSS
- Backend: Python (Flask)
- Database: SQLite
- AI: Google Gemini API
- PDF Generation: jsPDF

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Environment Variables
Create `.env` files in both frontend and backend directories:

Backend `.env`:
```
GEMINI_API_KEY=your_gemini_api_key
```
