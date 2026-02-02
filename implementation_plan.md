# Vigilante AI: Module 1 (Text HoneyPot) - "Shock & Awe" Implementation Plan

## 1. The Core Concept: "The Scamsquasher"
We aren't just building a chatbot; we are building an **active counter-measure system**. 
To stand out, we move beyond "detection" to **"active engagement & time-wasting"**.

**The "Wow" Factors (Judge-Centric):**
1.  **The "Mind Reader" UI**: Don't just show the chat. Show the AI's *internal monologue*.
    *   *Visual*: A glowing "Cortex" panel that logs: "Analysis: Urgency Detected (98%)" -> "Strategy: Act Confused" -> "Generating: 'Wait, my grandson said...'"
2.  **Dynamic Persona Switching**:
    *   *Visual*: When the scammer gets aggressive, show a card flip animation changing the AI persona from "Helpful" to "Hard-of-hearing Grandma" to frustrate them further.
3.  **Real-Time "Wasted" Metrics**:
    *   *Visual*: A big ticking counter: "Scammer Time Wasted: 4m 12s" and "Potential Victim $$ Saved: $5,000".

## 2. Tech Stack (Optimized for Speed & Visuals)
*   **Frontend (The "Wow")**: Next.js 14 (App Router), Tailwind CSS, **Framer Motion** (critical for animations), **Lucide React** (icons).
*   **Backend (The "Brain")**: FastAPI (Python), **Groq API** (for Llama 3 - insane speed is a wow factor itself).
*   **Database**: In-memory (Python Dicts) or SQLite for simplicity/speed during demo.

## 3. Implementation Steps

### Phase 1: The "Brain" (Backend)
**Goal**: A super-fast FastAPI server that handles webhooks and manages state.

1.  **Setup FastAPI Project**:
    *   `POST /webhook`: Receives "scammer" messages.
    *   `GET /stream`: Server-Sent Events (SSE) to push updates to the UI in real-time.
2.  **The "Intelligence Core" (Service Layer)**:
    *   `ScamDetector`: Regular expressions + Keyword weights (fast check).
    *   `PersonaEngine`: A class that holds the prompt templates (Grandma, Tech Bro, Clueless Boomer).
    *   `LLMClient`: Groq Integration for sub-second text generation.
3.  **The "Internal Monologue" Generator**:
    *   Instead of just returning text, the LLM returns a JSON: `{ "thoughts": "He wants money. I will pretend I dropped my glasses.", "response": "Oh dear, I can't read the numbers..." }`
    *   This logic is key for the UI visualization.

### Phase 2: The "War Room" (Frontend)
**Goal**: A dashboard that looks like a CIA/FBI operational center.

1.  **Terminal-Style Layout**:
    *   Dark Mode default. Neon Green/Red accents.
    *   **Left Panel**: "Incoming Threat Stream" (The Chat).
    *   **Center Panel**: "Neural Activity" (The AI's thoughts/strategy).
    *   **Right Panel**: "Target Profile" (Extracted info: Bank Name, Phone, UPI ID).
2.  **Components**:
    *   `LiveChat`: Animated message bubbles.
    *   `ThoughtStream`: Typewriter effect showing the AI "thinking".
    *   `ThreatGauge`: A radial semi-circle gauge going from Green to Red based on scam probability.
3.  **The "Takeover" Button**:
    *   A massive, pulsing red button: "ENGAGE MANUAL OVERRIDE". Clicking it allows YOU to type, and the AI mimics the current persona's style.

### Phase 3: The Demo Script (How to Present)
1.  **Start with the Dashboard empty**.
2.  **Send a "Scam" message** (e.g., "Your KYP is expired, update immediately") via a mock tool.
3.  **Moment of Magic**:
    *   Dashboard turns RED.
    *   Alarm sound (subtle).
    *   AI "Thinking" log appears: *"Threat Detected. Strategy: Feign Ignorance."*
    *   AI replies: *"What is KYP? Is that a type of soup?"*
4.  **Escalate**: Send an angry message ("Update now or jail!").
5.  **Moment of Magic 2**: 
    *   AI switches Persona to "Panic Mode".
    *   AI replies: *"Oh god! Jail? Please don't arrest me!"*
6.  **Victory**: The "Time Wasted" counter keeps ticking up.

## 4. Directory Structure
```
/guvihack
  /backend (FastAPI)
    main.py
    /core
      llm.py (Groq)
      prompts.py
    /models
      schemas.py
  /frontend (Next.js)
    /app
      page.tsx
    /components
      /dashboard
        ChatWindow.tsx
        BrainMonitor.tsx
        StatsPanel.tsx
  README.md
```
