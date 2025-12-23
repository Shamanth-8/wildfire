// In a real-world application, this should be stored in a secure environment variable,
// not hardcoded in the source code.
export const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || '';
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
export const GEMINI_API_KEY_BACKUP = import.meta.env.VITE_GEMINI_API_KEY_BACKUP || '';
