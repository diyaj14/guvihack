import requests
import json

url = "http://localhost:8000/webhook"
payload = {
    "message": "Hello, this is the IRS. You owe $5000 taxes. Pay now via Target Gift Card.",
    "sender": "+15550199",
    "timestamp": 1234567890.0
}

try:
    print(f"Sending Threat: {payload['message']}")
    response = requests.post(url, json=payload)
    print("\n--- Vigilante AI Response ---")
    data = response.json()
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}. Is the server running?")
