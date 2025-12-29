
import os
import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
import glob
import random

# Configuration
DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dataset', 'train')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'fine_tuned_blip')
BATCH_SIZE = 2
EPOCHS = 1
LEARNING_RATE = 5e-5

class WildfireDataset(Dataset):
    def __init__(self, dataset_dir, processor):
        self.processor = processor
        self.images = []
        self.captions = []

        # Load Wildfire Images
        print("Loading wildfire images...", flush=True)
        wildfire_dir = os.path.join(dataset_dir, 'wildfire')
        wildfire_imgs = glob.glob(os.path.join(wildfire_dir, '*.jpg')) # + other extensions
        # Limit for demo speed if needed, but let's take a reasonable chunk
        # wildfire_imgs = wildfire_imgs[:100] 
        
        for img_path in wildfire_imgs:
            self.images.append(img_path)
            self.captions.append("a satellite image of a wildfire")

        # Load Non-Wildfire Images
        nowildfire_dir = os.path.join(dataset_dir, 'nowildfire')
        nowildfire_imgs = glob.glob(os.path.join(nowildfire_dir, '*.jpg'))
        # nowildfire_imgs = nowildfire_imgs[:100]

        for img_path in nowildfire_imgs:
            self.images.append(img_path)
            self.captions.append("a satellite image of a forest")
            
        print(f"Loaded {len(self.images)} images for training.")

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path = self.images[idx]
        caption = self.captions[idx]
        
        image = Image.open(img_path).convert('RGB')
        
        encoding = self.processor(
            images=image,
            text=caption,
            padding="max_length",
            return_tensors="pt"
        )
        
        # remove batch dimension
        encoding = {k: v.squeeze(0) for k, v in encoding.items()}
        return encoding

def train():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Training on {device}")

    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
    model.to(device)
    model.train()

    dataset = WildfireDataset(DATASET_DIR, processor)
    
    # For real training, use a larger subset or the whole dataset
    print("Selecting subset...", flush=True)
    subset_indices = random.sample(range(len(dataset)), min(50, len(dataset)))
    subset = torch.utils.data.Subset(dataset, subset_indices)
    
    dataloader = DataLoader(subset, batch_size=BATCH_SIZE, shuffle=True)
    optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE)

    print("Starting training...")
    for epoch in range(EPOCHS):
        print(f"Epoch {epoch+1}/{EPOCHS}")
        for idx, batch in enumerate(dataloader):
            input_ids = batch.pop("input_ids").to(device)
            pixel_values = batch.pop("pixel_values").to(device)
            attention_mask = batch.pop("attention_mask").to(device)

            outputs = model(
                input_ids=input_ids,
                pixel_values=pixel_values,
                labels=input_ids, # Using input_ids as labels for causal LM
                attention_mask=attention_mask
            )
            
            loss = outputs.loss
            loss.backward()
            optimizer.step()
            optimizer.zero_grad()

            if idx % 5 == 0:
                print(f"Step {idx}, Loss: {loss.item()}", flush=True)

    print("Training complete. Saving model...", flush=True)
    model.save_pretrained(OUTPUT_DIR)
    processor.save_pretrained(OUTPUT_DIR)
    print(f"Model saved to {OUTPUT_DIR}", flush=True)

if __name__ == "__main__":
    train()
