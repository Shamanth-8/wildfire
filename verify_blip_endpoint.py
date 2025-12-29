import requests
import os
import sys

# Path to a test image
# Using the one found in artifacts
artifacts_dir = r"C:\Users\anves\.gemini\antigravity\brain\b22a832e-6e8a-46c0-a7cc-1473b28e8f72"
image_filename = "test_wildfire_1766599604638.png"
image_path = os.path.join(artifacts_dir, image_filename)

if not os.path.exists(image_path):
    print(f"Error: Test image not found at {image_path}")
    # Try to find any png in the directory
    files = [f for f in os.listdir(artifacts_dir) if f.endswith('.png')]
    if files:
        image_path = os.path.join(artifacts_dir, files[0])
        print(f"Using alternative image: {image_path}")
    else:
        sys.exit(1)

url = "http://localhost:8000/predict/image"

try:
    with open(image_path, 'rb') as f:
        files = {'file': (image_filename, f, 'image/png')}
        print(f"Sending request to {url} with {image_path}...")
        response = requests.post(url, files=files)
        
    if response.status_code == 200:
        print("Success!")
        print("Response:", response.json())
    else:
        print(f"Failed with status code: {response.status_code}")
        print("Response:", response.text)

except Exception as e:
    print(f"An error occurred: {e}")
