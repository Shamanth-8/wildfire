import { ActiveFire } from '../types';

// Fetches active fire data via our Backend Proxy to avoid CORS and improve speed.
export const fetchActiveFires = async (): Promise<ActiveFire[]> => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  try {
    // Call our own backend which proxies the request to NASA
    const response = await fetch('http://localhost:8000/active-fires');
    
    if (!response.ok) {
      throw new Error(`Backend Proxy responded with status: ${response.status}`);
    }
    
    const fireData = await response.json();
    return fireData;

  } catch (error) {
    console.error("Error fetching active fires:", error);
    // Mock data fallback if API key is missing or request fails
    // Mock data fallback with locations likely to have HIGH fire risk (Hot/Dry/Summer)
    // Locations: Alice Springs (Aus), Windhoek (Namibia), Santiago (Chile), Nagpur (India), Phoenix (USA - potentially cool but dry)
    console.warn("Falling back to mock data due to error: " + error);
    return [
      { lat: -23.6980, lon: 133.8807, brightness: 395, acq_date: dateStr }, // Alice Springs, Australia (Hot/Dry)
      { lat: -22.5609, lon: 17.0658, brightness: 385, acq_date: dateStr },  // Windhoek, Namibia
      { lat: -33.4489, lon: -70.6693, brightness: 375, acq_date: dateStr }, // Santiago, Chile
      { lat: 21.1458, lon: 79.0882, brightness: 365, acq_date: dateStr },   // Nagpur, India
      { lat: 12.8797, lon: 121.7740, brightness: 350, acq_date: dateStr },  // Philippines (Tropical)
      { lat: -15.7801, lon: -47.9292, brightness: 360, acq_date: dateStr }, // Brasilia, Brazil
    ];
  }
};
