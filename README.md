# Vigilante AI - Module 1 (Text HoneyPot)

This project contains the implementation of Module 1: The Text HoneyPot with a Visual "War Room" Dashboard.

## Prerequisites
- Node.js & npm
- Python 3.10+
- Groq API Key (Put in `backend/.env`)

## Structure
- `frontend/`: Next.js 14 App with Cyberpunk UI.
- `backend/`: FastAPI application with Groq/LLM integration.

## Setup

1. **Frontend Setup** (if not already done):
   ```bash
   cd frontend
   npm install
   ```

2. **Backend Setup**:
   ```bash
   pip install -r backend/requirements.txt
   ```

## Running the Application

You need two terminal windows:

**Terminal 1: Start the Backend (The Brain)**
```bash
python -m uvicorn backend.main:app --reload
```

**Terminal 2: Start the Frontend (The Dashboard)**
```bash
cd frontend
npm run dev
```

## How to Demo (Wow Factor)

1. Open **http://localhost:3000**.
2. **Observe**: The dashboard runs in "Auto-Pilot" mode, simulating network traffic.
3. **Trigger**: Click the **"SIMULATE CALL"** button to inject a fake scam threat (e.g., "IRS Warrant").
4. **Watch**: 
   - The "Neural Core" lights up RED.
   - The AI "Thoughts" are displayed (Analysis -> Strategy).
   - The AI responds with a persona (e.g., Grandma).
5. **Interact**: Click **"MANUAL TAKEOVER"** to type your own response while keeping the cool UI.

## Testing Backend Only
Run the test script to see the JSON output from the LLM:
```bash
python backend/test_backend.py
```
