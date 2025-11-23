
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ActiveFire, AnalyzedHotspot, RiskLevel } from './types';
import { fetchActiveFires } from './services/nasaFirmsService';
import { fetchEnvironmentalDataForCoords, fetchWildfirePrediction } from './services/geminiService';
import MapComponent from './components/MapComponent';
import RiskResultDisplay from './components/RiskResultDisplay';
import CoordinateInput from './components/CoordinateInput';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_HOTSPOTS_TO_ANALYZE = 10;

function App() {
  const [allActiveFires, setAllActiveFires] = useState<ActiveFire[]>([]);
  const [analyzedHotspots, setAnalyzedHotspots] = useState<AnalyzedHotspot[]>([]);
  const [focusedHotspot, setFocusedHotspot] = useState<AnalyzedHotspot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [customPrediction, setCustomPrediction] = useState<AnalyzedHotspot | null>(null);
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState<boolean>(false);
  
  const analysisInProgress = useRef(false);

  const runAnalysis = useCallback(async () => {
    if (analysisInProgress.current) return;
    analysisInProgress.current = true;

    setIsLoading(true);
    setError(null);
    try {
      const fires = await fetchActiveFires();
      setAllActiveFires(fires);

      const sortedFires = [...fires].sort((a, b) => b.brightness - a.brightness);
      const topFires = sortedFires.slice(0, MAX_HOTSPOTS_TO_ANALYZE);

      // Analyze fires in parallel
      const analysisPromises = topFires.map(async (fire): Promise<AnalyzedHotspot | null> => {
        try {
          const id = `${fire.lat.toFixed(4)}_${fire.lon.toFixed(4)}`;
          const envData = await fetchEnvironmentalDataForCoords(fire.lat, fire.lon);
          const prediction = await fetchWildfirePrediction(envData, fire.lat, fire.lon);
          return { id, fireData: fire, envData, prediction };
        } catch (e) {
          console.error(`Failed to analyze hotspot at ${fire.lat}, ${fire.lon}:`, e);
          return null; // Ignore hotspots that fail analysis
        }
      });
      
      const results = (await Promise.all(analysisPromises)).filter(Boolean) as AnalyzedHotspot[];
      
      const sortedResults = results.sort((a, b) => {
        const riskOrder = [RiskLevel.Extreme, RiskLevel.High, RiskLevel.Medium, RiskLevel.Low];
        return riskOrder.indexOf(a.prediction!.riskLevel) - riskOrder.indexOf(b.prediction!.riskLevel);
      });

      setAnalyzedHotspots(sortedResults);
      setLastUpdated(new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      analysisInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    runAnalysis(); // Initial run
    const intervalId = setInterval(runAnalysis, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [runAnalysis]);

  const analyzeCustomLocation = useCallback(async (lat: number, lon: number) => {
    setIsAnalyzingCustom(true);
    setError(null);
    try {
      const id = `custom_${lat.toFixed(4)}_${lon.toFixed(4)}`;
      const envData = await fetchEnvironmentalDataForCoords(lat, lon);
      const prediction = await fetchWildfirePrediction(envData, lat, lon);
      
      const customHotspot: AnalyzedHotspot = {
        id,
        fireData: { lat, lon, brightness: 0, acq_date: new Date().toISOString() },
        envData,
        prediction
      };
      
      setCustomPrediction(customHotspot);
      setFocusedHotspot(customHotspot);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze location.';
      setError(errorMessage);
    } finally {
      setIsAnalyzingCustom(false);
    }
  }, []);

  return (
    <div className="h-screen w-screen flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[450px] flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-r border-gray-700 flex flex-col">
        <header className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
            Wildfire Intelligence
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Automated Risk Analysis Dashboard
          </p>
        </header>
        
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
            <div className='text-xs text-gray-500'>
                {isLoading ? "Updating..." : `Last updated: ${lastUpdated?.toLocaleTimeString() || 'N/A'}`}
            </div>
            <button onClick={runAnalysis} disabled={isLoading} className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:cursor-wait flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Refresh Now
            </button>
        </div>
        
        <CoordinateInput 
          onAnalyze={analyzeCustomLocation}
          isAnalyzing={isAnalyzingCustom}
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && analyzedHotspots.length === 0 && (
            <div className="text-center text-gray-400 py-10">
                <svg className="animate-spin h-8 w-8 text-white mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8-0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing global fire data...
            </div>
          )}
          {!isLoading && error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg" role="alert">
                <strong className="font-bold">Analysis Failed: </strong>
                <span>{error}</span>
            </div>
          )}
          {customPrediction && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Custom Analysis</h3>
              <RiskResultDisplay 
                key={customPrediction.id}
                hotspot={customPrediction}
                onSelect={() => setFocusedHotspot(customPrediction)}
                isSelected={focusedHotspot?.id === customPrediction.id}
              />
            </div>
          )}
          {analyzedHotspots.length > 0 && (
            <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide pt-2 border-t border-gray-700">Active Hotspots</h3>
          )}
          {analyzedHotspots.map(hotspot => (
            <RiskResultDisplay 
              key={hotspot.id}
              hotspot={hotspot}
              onSelect={() => setFocusedHotspot(hotspot)}
              isSelected={focusedHotspot?.id === hotspot.id}
            />
          ))}
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 h-full w-full">
        <MapComponent 
            allActiveFires={allActiveFires}
            analyzedHotspots={analyzedHotspots}
            focusedHotspot={focusedHotspot}
            customPrediction={customPrediction}
            onMapClick={analyzeCustomLocation}
        />
      </main>
    </div>
  );
}

export default App;
