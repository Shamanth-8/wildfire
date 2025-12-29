
import torch
import os
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
import io

# Global variables to hold model in memory
_processor = None
_model = None
_device = None

RISK_KEYWORDS = ["fire", "smoke", "flame", "burning", "forest fire", "wildfire"]


def load_model():
    global _processor, _model, _device
    if _model is None:
        # Check if local model exists and is valid (not just an LFS pointer)
        fine_tuned_path = os.path.dirname(__file__)
        use_local_model = False
        
        if os.path.exists(fine_tuned_path):
            safetensors_path = os.path.join(fine_tuned_path, 'model.safetensors')
            if os.path.exists(safetensors_path):
                file_size = os.path.getsize(safetensors_path)
                if file_size > 1024 * 1024: # Must be > 1MB
                    use_local_model = True
                    print(f"Loading Fine-Tuned BLIP model from {fine_tuned_path} ...")
                    model_path = fine_tuned_path
                else:
                     print(f"Local model found but filesize is small ({file_size} bytes). Likely a Git LFS pointer. Falling back to base model.")
            else:
                 print("Local model directory exists but no weights found. Falling back to base model.")
        
        if not use_local_model:
            print("Loading Base BLIP model (Salesforce/blip-image-captioning-base)...")
            model_path = "Salesforce/blip-image-captioning-base"
            
        _processor = BlipProcessor.from_pretrained(model_path)
        _model = BlipForConditionalGeneration.from_pretrained(model_path)
        _device = "cuda" if torch.cuda.is_available() else "cpu"
        _model.to(_device)
        print(f"BLIP Model loaded on {_device}")
    return _processor, _model, _device

def analyze_image_bytes(image_bytes):
    processor, model, device = load_model()
    
    try:
        raw_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Unconditional image captioning
        inputs = processor(raw_image, return_tensors="pt").to(device)

        out = model.generate(**inputs)
        caption = processor.decode(out[0], skip_special_tokens=True)
        
        # Risk Analysis
        risk_level = "Low"
        detected_keywords = []
        for keyword in RISK_KEYWORDS:
            if keyword in caption.lower():
                risk_level = "High"
                detected_keywords.append(keyword)
                
        return {
            "caption": caption,
            "risk_level": risk_level,
            "detected_keywords": detected_keywords
        }
    except Exception as e:
        print(f"Error in BLIP analysis: {e}")
        raise e
