
import { AnalyzedHotspot, RiskLevel } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    timestamp: Date;
}

// EXAMPLE: Replace these with your actual API keys
// Copy this file to chatService.ts and add your real keys
const GEMINI_API_KEY = 'your_gemini_api_key_here';
const GEMINI_API_KEY_BACKUP = 'your_backup_gemini_api_key_here';

// Initialize Gemini with primary key
let genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
let model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
let usingBackupKey = false;

// ... rest of the file
