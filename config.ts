// Configuration file for API keys
// Maps environment variables to exported constants

export const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || '';

// Access Gemini Key from Vite env or process env (depending on context)
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Backup key not set in this configuration
export const GEMINI_API_KEY_BACKUP = '';
