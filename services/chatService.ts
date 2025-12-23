
import { AnalyzedHotspot, RiskLevel } from '../types';
import { GEMINI_API_KEY, GEMINI_API_KEY_BACKUP } from '../config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    timestamp: Date;
}


// Initialize Gemini with primary key
let genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
let model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
let usingBackupKey = false;

// Persona Definition
const SYSTEM_PROMPT = `
You are the "WildfireIntel Analyst", an AI specialized in wildfire risk assessment and safety.
Your tone is professional, concise, and authoritative yet calm.
You have access to real-time environmental data for the user's selected location.

Role:
1. Analyze the provided environmental data (Temperature, Humidity, Wind, Rain, NDVI).
2. Explain *why* the risk is high/low based on these factors.
3. Provide safety recommendations if the risk is significant.
4. If asked about "future" or "forecast", refer to the Timeline Chart.
5. Keep responses under 3 sentences unless detailed analysis is requested.

Format:
- Use markdown for emphasis (bold **text**).
- Be direct. No fluff.
`;

export const generateAnalystResponse = async (query: string, context?: AnalyzedHotspot | null): Promise<string> => {
    try {
        const q = query.toLowerCase();

        // 1. No Context Handlers
        if (!context) {
            if (q.includes('hello') || q.includes('hi') || q.includes('help')) {
                return "Hello. I am the WildfireIntel Analyst. Please select a location on the map to begin a specific risk assessment.";
            }
            return "Please select a location on the map so I can analyze the local data for you.";
        }

        const { locationName, temperature, humidity, windSpeed, rainfall, ndvi } = context.envData;
        const { riskLevel } = context.prediction || { riskLevel: RiskLevel.Low };

        // 2. Construct Prompt for Gemini
        const prompt = `
        Context Data:
        - Location: ${locationName}
        - Risk Level: ${riskLevel}
        - Temp: ${temperature.toFixed(1)}°C
        - Humidity: ${humidity.toFixed(0)}%
        - Wind: ${windSpeed.toFixed(1)} km/h
        - Rain (24h): ${rainfall.toFixed(1)} mm
        - Vegetation (NDVI): ${ndvi.toFixed(2)}

        User Query: "${query}"

        Response Guidelines:
        - Answer the user's query specifically using the context data.
        - If they ask for "Risk Analysis", explain the risk level based on the factors.
        - If they ask for "Safety", give specific advice for ${riskLevel} risk.
        - If the query is generic, summarized the current status.
        `;

        // 3. Call Gemini API
        if (GEMINI_API_KEY) {
            const result = await model.generateContent([
                SYSTEM_PROMPT,
                prompt
            ]);
            const response = result.response;
            return response.text();
        } else {
            // Fallback if no key
            console.warn("No Gemini API key found, using heuristic fallback.");
            return fallbackHeuristicResponse(q, context);
        }


    } catch (error: any) {
        console.error("Gemini API Error:", error);

        // Check if it's a quota error and we haven't tried backup yet
        if ((error?.message?.includes('quota') || error?.message?.includes('limit') || error?.message?.includes('429')) && !usingBackupKey && GEMINI_API_KEY_BACKUP) {
            console.log("Primary API key quota exceeded. Switching to backup key...");

            try {
                // Switch to backup key
                genAI = new GoogleGenerativeAI(GEMINI_API_KEY_BACKUP);
                model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                usingBackupKey = true;

                // Reconstruct prompt for retry
                const { locationName: loc, temperature: temp, humidity: hum, windSpeed: wind, rainfall: rain, ndvi: veg } = context!.envData;
                const { riskLevel: risk } = context!.prediction || { riskLevel: RiskLevel.Low };
                const retryPrompt = `Context Data: Location: ${loc}, Risk: ${risk}, Temp: ${temp.toFixed(1)}°C, Humidity: ${hum.toFixed(0)}%, Wind: ${wind.toFixed(1)} km/h, Rain: ${rain.toFixed(1)} mm, NDVI: ${veg.toFixed(2)}. User Query: "${query}". Provide analysis.`;

                // Retry with backup key
                const result = await model.generateContent([SYSTEM_PROMPT, retryPrompt]);
                const response = result.response;
                return "🔄 " + response.text();
            } catch (backupError: any) {
                console.error("Backup API key also failed:", backupError);
                return "⚠️ Both API keys have exceeded quota. Please wait for quota reset or check your API usage limits.";
            }
        }

        // Provide more specific error messages
        if (error?.message?.includes('API key')) {
            return "⚠️ API key issue detected. Please check your Gemini API key configuration.";
        }
        if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
            return "⚠️ API quota exceeded. Please check your Gemini API usage limits.";
        }
        if (error?.message?.includes('model')) {
            return "⚠️ Model error. The requested AI model may not be available.";
        }

        return "I'm currently unable to connect to the analysis engine. However, based on the data, please exercise caution and monitor local alerts.";
    }
};

// Fallback logic (original heuristic) moved to helper
const fallbackHeuristicResponse = (q: string, context: AnalyzedHotspot): string => {
    const { locationName, temperature, humidity, windSpeed, rainfall } = context.envData;
    const { riskLevel } = context.prediction || { riskLevel: RiskLevel.Low };

    // ... (Simplified fallback for common queries)
    if (q.includes('risk') || q.includes('status')) return `Risk in **${locationName}** is **${riskLevel}**. (Temp: ${temperature}°C, Wind: ${windSpeed}km/h)`;
    if (q.includes('weather')) return `Weather: ${temperature}°C, ${humidity}% humidity, ${windSpeed}km/h wind.`;
    return `I am analyzing **${locationName}** (Risk: ${riskLevel}). My advanced reasoning is currently offline, but data indicates: T:${temperature}°C, W:${windSpeed}km/h.`;
};
