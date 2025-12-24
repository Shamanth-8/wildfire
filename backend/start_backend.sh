#!/bin/bash

# Load environment variables from .env file or set them before running
# Example: export GEMINI_API_KEY="your_key_here"

# Start the backend server
cd "$(dirname "$0")"
python3 main.py
