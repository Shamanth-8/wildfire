
export interface LatLon {
    lat: number;
    lng: number;
}

export interface ActiveFire {
    lat: number;
    lon: number;
    brightness: number;
    acq_date: string;
}

export enum RiskLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Extreme = 'Extreme',
}

export interface WildfireInputData {
    locationName: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    rainfall: number;
    ndvi: number;
    elevation: number;
    slope: number;
}

export interface PredictionResult {
    riskLevel: RiskLevel;
    explanation: string;
    source?: 'XGBoost' | 'Gemini';
}

export interface AnalyzedHotspot {
    id: string; // Unique ID based on lat/lon
    fireData: ActiveFire;
    envData: WildfireInputData;
    prediction?: PredictionResult;
}

export interface TimelineDataPoint {
    date: string; // ISO date string or formatted date
    riskScore: number;
    riskLevel: RiskLevel;
    temperature: number;
    humidity: number;
    windSpeed: number;
    rainfall: number;
    isProjected: boolean; // true for future dates
    confidence: number; // 0-100 score indicating prediction reliability
}
