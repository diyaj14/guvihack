import re
from pydantic import BaseModel

class ExtractedIntelligence(BaseModel):
    upi_ids: list[str] = []
    phone_numbers: list[str] = []
    urls: list[str] = []
    bank_details: list[str] = []

class IntelligenceExtractor:
    def extract(self, text: str) -> ExtractedIntelligence:
        intel = ExtractedIntelligence()
        
        # UPI IDs (e.g., name@upi, name@oksbi)
        intel.upi_ids = re.findall(r'[a-zA-Z0-9.\-_]+@[a-zA-Z]+', text)
        
        # Phone Numbers (International & Indian regex)
        # Matches: +91-9876543210, 9876543210, +1 555...
        intel.phone_numbers = re.findall(r'(\+?\d{1,4}[-.\s]?\d{3,5}[-.\s]?\d{4,6})', text)
        
        # URLs/Links
        intel.urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', text)
        
        # Bank Keywords (Simple Context check)
        keywords = ["account number", "ifsc", "routing number", "iban"]
        if any(k in text.lower() for k in keywords):
            # Capture potential number sequences near these keywords could be advanced, 
            # for now we just flag the context
            intel.bank_details.append("Bank context detected")

        return intel

    def detect_scam(self, text: str) -> dict:
        """
        Analyzes message for scam intent using keywords and patterns.
        """
        score = 0
        reasons = []
        text_lower = text.lower()
        
        # 1. Urgency & Threats
        urgency_keywords = ['urgent', 'immediately', 'suspended', 'blocked', 'arrest', 'warrant', 'expire', 'lapse']
        if any(w in text_lower for w in urgency_keywords):
            score += 0.4
            reasons.append("Urgency/Threat detected")
            
        # 2. Financial Requests
        money_keywords = ['pay', 'transfer', 'upi', 'bank', 'refund', 'gpay', 'paytm', 'credit card', 'kyc']
        if any(w in text_lower for w in money_keywords):
            score += 0.3
            reasons.append("Financial request detected")
            
        # 3. Suspicious Links/Actions
        action_keywords = ['click here', 'link', 'download', 'apk', 'form']
        if any(w in text_lower for w in action_keywords):
            score += 0.3
            reasons.append("Suspicious action requested")
            
        # 4. Pattern Matching (Links/Phones)
        if re.search(r'http[s]?://', text):
            score += 0.2
            reasons.append("Contains URL")
            
        is_scam = score >= 0.4
        
        return {
            "is_scam": is_scam,
            "confidence": min(score, 1.0),
            "reasons": reasons
        }
