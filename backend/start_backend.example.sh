#!/bin/bash

# Example startup script for the backend
# Copy this to start_backend.sh and add your API keys

# Set your Gemini API keys here
# export GEMINI_API_KEY="your_primary_key_here"
# export GEMINI_API_KEY_BACKUP="your_backup_key_here"

# Start the backend server
cd "$(dirname "$0")"
python3 main.py
