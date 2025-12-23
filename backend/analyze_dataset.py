
import os
import glob
import json
import torch
import random
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration

# Configuration
DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dataset')
RESULTS_FILE = os.path.join(DATASET_DIR, 'analysis_results.json')
RISK_KEYWORDS = ["fire", "smoke", "flame", "burning", "forest fire", "wildfire"]

def load_model():
    print("Loading BLIP model...")
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)
    print(f"Model loaded on {device}")
    return processor, model, device

def analyze_image(image_path, processor, model, device):
    try:
        raw_image = Image.open(image_path).convert('RGB')
        # Conditional image captioning
        # text = "a photography of"
        # inputs = processor(raw_image, text, return_tensors="pt").to(device)
        
        # Unconditional image captioning
        inputs = processor(raw_image, return_tensors="pt").to(device)

        out = model.generate(**inputs)
        caption = processor.decode(out[0], skip_special_tokens=True)
        return caption
    except Exception as e:
        print(f"Error analyzing {image_path}: {e}")
        return None

def main():
    print(f"Analyzing images in: {DATASET_DIR}")
    
    if not os.path.exists(DATASET_DIR):
        print("Dataset directory not found!")
        return

    # Find images recursively
    image_extensions = ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.bmp', '**/*.gif']
    image_files = []
    for ext in image_extensions:
        image_files.extend(glob.glob(os.path.join(DATASET_DIR, ext), recursive=True))
    
    # Remove duplicates if any
    image_files = list(set(image_files))
    image_files.sort()
    
    print(f"Found {len(image_files)} images total.")

    if not image_files:
        print("No images found.")
        return

    # Sample for verification
    MAX_IMAGES = 20
    if len(image_files) > MAX_IMAGES:
        print(f"Sampling {MAX_IMAGES} random images for verification...")
        image_files = random.sample(image_files, MAX_IMAGES)

    processor, model, device = load_model()
    
    results = []
    
    print("-" * 50)
    for i, img_path in enumerate(image_files):
        filename = os.path.basename(img_path)
        caption = analyze_image(img_path, processor, model, device)
        
        if caption:
            # Check for risk
            Risk = "Low"
            detected_keywords = []
            for keyword in RISK_KEYWORDS:
                if keyword in caption.lower():
                    Risk = "High"
                    detected_keywords.append(keyword)
            
            print(f"[{i+1}/{len(image_files)}] {filename}: {caption} | Risk: {Risk}")
            
            results.append({
                "filename": filename,
                "caption": caption,
                "risk_level": Risk,
                "detected_keywords": detected_keywords
            })
        else:
            print(f"[{i+1}/{len(image_files)}] {filename}: Failed to analyze")

    # Save results
    with open(RESULTS_FILE, 'w') as f:
        json.dump(results, f, indent=2)
    
    print("-" * 50)
    print(f"Analysis complete. Results saved to {RESULTS_FILE}")

if __name__ == "__main__":
    main()
