from pydantic import BaseModel, Field
from typing import List, Optional

class MessageObj(BaseModel):
    sender: str
    text: str
    timestamp: Optional[str] = None

class MetadataObj(BaseModel):
    channel: str = "SMS"
    language: str = "English"
    locale: str = "IN"

class ChallengeInput(BaseModel):
    sessionId: str
    message: MessageObj
    conversationHistory: List[MessageObj] = []
    metadata: Optional[MetadataObj] = None

# For the Dashboard/Internal use (extends basic reply)
class AgentAPIResponse(BaseModel):
    status: str
    reply: str
    # Hidden fields for Dashboard (Optional)
    debug_thought: Optional[str] = None
    intelligence: Optional[dict] = None
    metrics: Optional[dict] = None

