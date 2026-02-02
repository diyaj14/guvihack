import os
import re
import json
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path
from .prompts import Persona

# Robstly load .env from the backend directory
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Fallback: try loading from CWD if specific path fails or just to be safe
load_dotenv()

MSG_HISTORY = []


class VigilanteBrain:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY", "gsk_placeholder"))
        
    def generate_response(self, user_input: str, persona: Persona, conversation_history: list = None):
        """
        Generates a response with intelligence extraction focus
        """
        
        # Build conversation context
        context = ""
        if conversation_history:
            context = "\n\nCONVERSATION SO FAR:\n"
            for msg in conversation_history[-6:]:  # Last 6 messages for context
                # Support both Dictionary and Pydantic Model (MessageObj)
                if isinstance(msg, dict):
                    text = msg.get('text') or msg.get('content') or ""
                    sender_raw = msg.get('sender') or msg.get('role') or "user"
                else:
                    # Pydantic (MessageObj has .text and .sender)
                    text = getattr(msg, 'text', getattr(msg, 'content', ''))
                    sender_raw = getattr(msg, 'sender', getattr(msg, 'role', 'user'))
                
                # Map to prompt format: 'user' in guidelines = Our Agent (YOU). 'scammer' = SCAMMER.
                label = "YOU" if sender_raw == 'user' or sender_raw == 'assistant' else "SCAMMER"
                context += f"{label}: {text}\n"
        
        system_msg = f"""
{persona.system_prompt}

🎯 INTELLIGENCE TARGETS FOR THIS CONVERSATION:
You need to extract: {', '.join(persona.intelligence_targets)}

📊 CURRENT EXTRACTION STATUS:
Based on conversation history, identify what intelligence you've already extracted and what's still missing.

🎭 RESPONSE STRATEGY:
Your next response should:
1. Stay in character completely
2. Extract at least ONE piece of new intelligence if possible
3. Keep the scammer engaged and confident
4. Use natural conversation flow (don't interrogate obviously)
5. Be 2-4 sentences long (not too short, not too long)

{context}

🤖 LATEST SCAMMER MESSAGE: "{user_input}"

IMPORTANT: You must respond in valid JSON format ONLY.
{{
    "analysis": "What intelligence the scammer is revealing or trying to hide",
    "extractionTarget": "What specific intel you're trying to get in this response (e.g., 'phone number', 'UPI ID', 'phishing link')",
    "strategy": "Your approach for this message (e.g., 'Asking for callback number by pretending phone might disconnect', 'Requesting link spelling due to technical issues')",
    "reply": "Your in-character response (2-4 sentences)",
    "extractedIntel": {{
        "bankAccounts": [],
        "upiIds": [],
        "phishingLinks": [],
        "phoneNumbers": [],
        "suspiciousKeywords": []
    }}
}}

In extractedIntel, include ONLY new intelligence found in the scammer's latest message.
Leave arrays empty [] if that type of intel wasn't in this message.
"""
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": user_input}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.7,
                max_tokens=1000,
                response_format={"type": "json_object"}
            )
            
            response_text = chat_completion.choices[0].message.content
            
            # Parse and validate
            return response_text
            
        except Exception as e:
            print(f"LLM Error: {str(e)}")
            # Fallback JSON
            return json.dumps({
                "analysis": "Error occurred",
                "extractionTarget": "none",
                "strategy": "Error recovery",
                "reply": "I'm sorry dear, I didn't catch that. Could you say that again?",
                "extractedIntel": {}
            })

    def extract_intelligence_from_text(self, text: str) -> dict:
        """
        Fallback regex-based intelligence extraction
        Use this in addition to LLM extraction for redundancy
        """
        intel = {
            "bankAccounts": [],
            "upiIds": [],
            "phishingLinks": [],
            "phoneNumbers": [],
            "suspiciousKeywords": []
        }
        
        # Bank account patterns (Indian format)
        bank_patterns = [
            r'\b\d{9,18}\b',  # 9-18 digit account numbers
            r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'  # Formatted
        ]
        for pattern in bank_patterns:
            matches = re.findall(pattern, text)
            intel["bankAccounts"].extend(matches)
        
        # UPI IDs
        upi_pattern = r'\b[\w\.\-]+@[\w]+\b'
        intel["upiIds"] = re.findall(upi_pattern, text)
        
        # Phone numbers (Indian format)
        phone_patterns = [
            r'\+91[-\s]?\d{10}',
            r'\b[6-9]\d{9}\b',
            r'\b\d{3}[-\s]\d{3}[-\s]\d{4}\b'
        ]
        for pattern in phone_patterns:
            matches = re.findall(pattern, text)
            intel["phoneNumbers"].extend(matches)
        
        # URLs/Links
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        intel["phishingLinks"] = re.findall(url_pattern, text)
        
        # Suspicious keywords
        keywords = [
            'urgent', 'verify', 'suspended', 'blocked', 'immediately',
            'account', 'security', 'update', 'confirm', 'expire',
            'risk', 'unauthorized', 'unusual activity', 'click here',
            'limited time', 'act now', 'verify now', 'customer care',
            'prize', 'winner', 'congratulations', 'refund', 'KYC'
        ]
        found_keywords = [kw for kw in keywords if kw.lower() in text.lower()]
        intel["suspiciousKeywords"] = found_keywords
        
        # Remove duplicates
        for key in intel:
            intel[key] = list(set(intel[key]))
        
        return intel
