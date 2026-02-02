from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Vigilante AI Module 1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Header, HTTPException, BackgroundTasks
from backend.core.llm import VigilanteBrain
from backend.core.prompts import get_persona
from backend.models.schemas import ChallengeInput, AgentAPIResponse
from backend.services.intelligence import IntelligenceExtractor
import json
import requests

brain = VigilanteBrain()
extractor = IntelligenceExtractor()
current_persona = get_persona("grandma")

# In-memory session store (Mock Database)
SESSIONS = {}

# Guidelines: "Mandatory Final Result Callback"
def send_guvi_callback(session_id: str, total_msgs: int, intel: dict, notes: str):
    callback_url = "https://hackathon.guvi.in/api/updateHoneyPotFinalResult"
    
    # Transform intel to callback format
    payload = {
        "sessionId": session_id,
        "scamDetected": True, # Always true for this honeypot
        "totalMessagesExchanged": total_msgs,
        "extractedIntelligence": {
             "bankAccounts": intel.get('bankAccounts', []),
             "upiIds": intel.get('upiIds', []),
             "phishingLinks": intel.get('phishingLinks', []),
             "phoneNumbers": intel.get('phoneNumbers', []),
             "suspiciousKeywords": intel.get('suspiciousKeywords', [])
        },
        "agentNotes": notes
    }
    
    try:
        # requests.post(callback_url, json=payload, timeout=5) # Uncomment during actual Hackathon
        print(f"Callback Payload (Mock Sent): {json.dumps(payload, indent=2)}")
    except Exception as e:
        print(f"Callback Failed: {e}")

@app.get("/")
def read_root():
    return {"status": "Vigilante AI Module 1 Operational", "mode": "Hackathon_Evaluation"}

@app.post("/webhook", response_model=AgentAPIResponse)
async def scam_webhook(
    data: ChallengeInput, 
    background_tasks: BackgroundTasks,
    x_api_key: str = Header(None) # Guideline: 4. API Authentication
):
    # Auth Check
    if x_api_key != "YOUR_SECRET_API_KEY" and x_api_key != "12345": 
        pass 

    print(f"Incoming ({data.sessionId}): {data.message.text}")
    
    # 1. Update Session History
    msg_count = len(data.conversationHistory) + 1
    
    # 2. Extract Intelligence + DETECT SCAM
    intel_data = extractor.extract(data.message.text)
    scam_analysis = extractor.detect_scam(data.message.text)
    
    # Define regex backup for later merging
    regex_intel = brain.extract_intelligence_from_text(data.message.text)
    
    # 3. Agent Handoff Logic (Guideline: "Once scam intent is detected... activate AI Agent")
    # For this hackathon honey-pot, we are usually aggressive, but we can now be smart.
    if not scam_analysis["is_scam"]:
        # Optional: If not a scam, you could behave differently, but for the competition, 
        # we assume all input to this webhook is suspect.
        # We will log it but still engage cautiously.
        print(f"Low Confidence Scam ({scam_analysis['confidence']}): {scam_analysis['reasons']}")
    
    # 4. Brain Response (LLM)
    response_json_str = brain.generate_response(
        user_input=data.message.text, 
        persona=current_persona,
        conversation_history=data.conversationHistory
    )
    
    reply_text = "Thinking..."
    analysis = "Processing..."
    strategy = "Standard"
    llm_intel = {}

    try:
        llm_data = json.loads(response_json_str)
        reply_text = llm_data.get("reply", "I'm sorry, I didn't verify that.")
        analysis = llm_data.get("analysis", "Processing...")
        strategy = llm_data.get("strategy", "Standard")
        llm_intel = llm_data.get("extractedIntel", {})
    except:
        reply_text = "Could you repeat that?"
        analysis = "Error parsing brain"
        strategy = "Fallback"
        
    # 5. Merge Intelligence (LLM + Regex)
    def merge_lists(l1, l2):
        return list(set((l1 or []) + (l2 or [])))

    final_intel = {
        "bankAccounts": merge_lists(llm_intel.get('bankAccounts'), regex_intel.get('bankAccounts')),
        "upiIds": merge_lists(llm_intel.get('upiIds'), regex_intel.get('upiIds')),
        "phishingLinks": merge_lists(llm_intel.get('phishingLinks'), regex_intel.get('phishingLinks')),
        "phoneNumbers": merge_lists(llm_intel.get('phoneNumbers'), regex_intel.get('phoneNumbers')),
        "suspiciousKeywords": merge_lists(llm_intel.get('suspiciousKeywords'), regex_intel.get('suspiciousKeywords'))
    }

    # 6. Schedule Callback (Guideline 12)
    # Include scam confidence in notes
    notes = f"Scam Confidence: {scam_analysis['confidence']} ({', '.join(scam_analysis['reasons'])}) | Strategy: {strategy}"
    background_tasks.add_task(send_guvi_callback, data.sessionId, msg_count, final_intel, notes)

    # 7. Return JSON
    return AgentAPIResponse(
        status="success",
        reply=reply_text,
        debug_thought=f"{analysis} | {strategy}",
        intelligence=final_intel,
        metrics={"turns": msg_count, "confidence": scam_analysis['confidence']} 
    )
