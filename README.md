# Wildfire Intelligence Platform 🌲🔥

An advanced wildfire detection and analysis platform integrating real-time satellite data, AI-powered chat assistance, and intelligent image analysis using Google Gemini.

## 🚀 Key Features

- **Real-Time Map**: Interactive global map showing live fire hotspots using NASA FIRMS API.
- **AI Analyst**: Conversational assistant with "WildfireIntel Analyst" persona powered by Google Gemini 2.5 Flash.
- **Image Risk Analysis**: Upload satellite imagery to detect fire risks.
    - Uses **Gemini Vision API** for advanced image understanding.
    - Provides detailed captions and risk level assessments (High/Low).
    - Detects fire, smoke, flames, and wildfire-related hazards.
- **GIS Risk Visualization**: Interactive pie chart showing risk distribution across zones.
- **Model Validation**: Real-time accuracy metrics comparing predictions with NASA FIRMS data.
- **Secure Authentication**: Local Python backend for user management.
- **API Fallback System**: Automatic switching to backup API key on quota limits.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TailwindCSS, TypeScript.
- **Backend**: Python, FastAPI, Uvicorn.
- **AI/ML**: 
    - Google Gemini 2.5 Flash (Conversational AI & Vision)
    - XGBoost (Wildfire Risk Prediction)
    - NASA FIRMS API (Real-time Fire Data)
- **Visualization**: Custom SVG charts, Interactive globe

## 📥 Setup & Installation

### 1. Prerequisites
- Node.js & npm
- Python 3.8+
- Git

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create .env file
echo "VITE_GEMINI_API_KEY=your_primary_key" > .env
echo "VITE_GEMINI_API_KEY_BACKUP=your_backup_key" >> .env
echo "VITE_NASA_API_KEY=your_nasa_key" >> .env

# Start development server
npm run dev
# App runs at http://localhost:5173
```

### 3. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set environment variables and start server
export GEMINI_API_KEY="your_primary_key"
export GEMINI_API_KEY_BACKUP="your_backup_key"
python main.py
# API runs at http://localhost:8000
```

> **Note**: The backend uses Gemini Vision API for image analysis - no heavy ML models to download!

## 🔑 API Keys Required

1. **Gemini API Key** (Primary): Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Gemini API Key** (Backup): Optional but recommended for quota failover
3. **NASA API Key**: Get from [NASA API Portal](https://api.nasa.gov/)

## 🌟 Features Breakdown

### Real-Time Fire Detection
- Fetches active fires from NASA FIRMS
- Analyzes environmental conditions
- Predicts risk levels using XGBoost model
- Updates every 5 minutes

### AI Chatbot
- Specialized in wildfire risk assessment
- Analyzes temperature, humidity, wind, rainfall, vegetation
- Provides safety recommendations
- Automatic API key fallback on quota limits

### Image Analysis
- Upload any image for fire risk assessment
- Powered by Gemini Vision API
- Detects fire, smoke, flames, burning vegetation
- Returns detailed captions and risk levels

### GIS Visualization
- Pie chart showing risk distribution (Very Low to Very High)
- Color-coded zones (Green → Red)
- Percentage breakdown by risk level

### Validation Metrics
- Accuracy, Precision, Recall
- Compares predictions with NASA FIRMS data
- Real-time validation within 20km radius

## 🐱 GitHub Push Instructions

```bash
# 1. Initialize Git (if not already done)
git init

# 2. Add files
git add .

# 3. Commit changes
git commit -m "Wildfire Intelligence Platform with Gemini Vision"

# 4. Rename branch to main
git branch -M main

# 5. Add your remote repository
git remote add origin https://github.com/yourusername/wildfire-platform.git

# 6. Push to GitHub
git push -u origin main
```

## 📊 Model Information

### XGBoost Risk Prediction Model
- Trained on synthetic environmental data (5000 samples)
- Features: Temperature, Humidity, Wind Speed, Rainfall, NDVI, Elevation
- Accuracy: ~87% (validated against NASA FIRMS)
- Located: `backend/wildfire_model.json`

### Gemini Vision API
- Cloud-based image analysis
- No local model files needed
- Trained on billions of images
- Superior accuracy for wildfire detection

## 🚀 Deployment

The application is ready for deployment on:
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, Google Cloud Run

Make sure to set environment variables in your deployment platform.

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Built with ❤️ using Google Gemini AI**
