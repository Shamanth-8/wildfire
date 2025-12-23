#!/bin/bash

# Load environment variables from .env file
export GEMINI_API_KEY="AIzaSyBBefJqfhnb-67SKXJ8KnkEdZgpVhE6YaY"
export GEMINI_API_KEY_BACKUP="AIzaSyBl0-MpQeYcykzwASMLgOUn8gjoeyeuk-Q"

# Start the backend server
cd "$(dirname "$0")"
python3 main.py
