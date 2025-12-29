import os
import io
from PIL import Image
import base64
import requests
import json

# Gemini API configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_API_KEY_BACKUP = os.getenv('GEMINI_API_KEY_BACKUP', '')

RISK_KEYWORDS = ["fire", "smoke", "flame", "burning", "forest fire", "wildfire", "ash", "ember"]

def analyze_image_with_key(image_bytes, api_key):
    """Helper function to analyze image with a specific API key"""
    # Convert image bytes to base64
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # Save to bytes buffer
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    # Prepare Gemini API request
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [{
            "parts": [
                {
                    "text": "Analyze this image and describe what you see. Focus on identifying any signs of fire, smoke, flames, burning vegetation, or wildfire-related hazards. Provide a detailed but concise description."
                },
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": img_base64
                    }
                }
            ]
        }]
    }
    
    # Call Gemini API
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    
    if response.status_code != 200:
        raise Exception(f"Gemini API error: {response.status_code} - {response.text}")
    
    result = response.json()
    
    # Extract caption from response
    caption = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'Unable to analyze image')
    
    return caption

def analyze_image_bytes(image_bytes):
    """
    Analyze image using Gemini Vision API with automatic fallback to backup key
    """
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY environment variable not set")
    
    try:
        # Try with primary key
        caption = analyze_image_with_key(image_bytes, GEMINI_API_KEY)
        
    except Exception as e:
        error_str = str(e)
        # Check if it's a quota error and we have a backup key
        if ('429' in error_str or 'quota' in error_str.lower() or 'limit' in error_str.lower()) and GEMINI_API_KEY_BACKUP:
            print("Primary API key quota exceeded. Switching to backup key...")
            try:
                caption = analyze_image_with_key(image_bytes, GEMINI_API_KEY_BACKUP)
                caption = "🔄 " + caption  # Indicate backup key was used
            except Exception as backup_error:
                print(f"Backup API key also failed: {backup_error}")
                raise Exception("Both API keys have exceeded quota or failed")
        else:
            print(f"Error in Gemini Vision analysis: {e}")
            raise e
    
    # Risk Analysis
    risk_level = "Low"
    detected_keywords = []
    caption_lower = caption.lower()
    
    for keyword in RISK_KEYWORDS:
        if keyword in caption_lower:
            risk_level = "High"
            detected_keywords.append(keyword)
    
    return {
        "caption": caption,
        "risk_level": risk_level,
        "detected_keywords": detected_keywords
    }
