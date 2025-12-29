
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config';
import { AnalyzedHotspot } from '../types';

export interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    timestamp: Date;
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Using gemini-2.5-flash as it is the current supported model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateAnalystResponse = async (userMessage: string, context: AnalyzedHotspot | null): Promise<string> => {
    try {
        let prompt = `You are an expert Wildfire Risk Analyst AI. You help users understand wildfire risks based on environmental data.
        
User Question: "${userMessage}"
`;

        if (context) {
            prompt += `
Context - Selected Location: ${context.envData.locationName}
Risk Level: ${context.prediction?.riskLevel || 'Unknown'}
Environmental Data:
- Temp: ${context.envData.temperature}°C
- Humidity: ${context.envData.humidity}%
- Wind: ${context.envData.windSpeed} km/h
- Rain (24h): ${context.envData.rainfall} mm
- NDVI: ${context.envData.ndvi}
- Explanation: ${context.prediction?.explanation || 'No analysis available'}
`;
        } else {
            prompt += `\n(No specific location selected on map yet. Answer generally about wildfire safety or ask them to select a location.)`;
        }

        prompt += `\nKeep your response concise, helpful, and professional. limited to 2-3 sentences max unless detailed explanation is requested.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

    } catch (error: any) {
        console.error("Gemini Chat Error:", error);
        return "I apologize, I'm having trouble connecting to the analysis network right now. Please check your connection or API key.";
    }
};
