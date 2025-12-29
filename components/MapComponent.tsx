
import React, { useEffect, useRef } from 'react';
import { ActiveFire, AnalyzedHotspot, RiskLevel } from '../types';

declare const L: any; // Use Leaflet global object

interface MapComponentProps {
  allActiveFires: ActiveFire[];
  analyzedHotspots: AnalyzedHotspot[];
  focusedHotspot: AnalyzedHotspot | null;
  customPrediction: AnalyzedHotspot | null;
  onMapClick: (lat: number, lon: number) => void;
}

const getRiskColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
        case RiskLevel.High: return '#f97316'; // orange-500
        case RiskLevel.Extreme: return '#ef4444'; // red-500
        case RiskLevel.Medium: return '#eab308'; // yellow-500
        default: return '#84cc16'; // lime-500
    }
}

const MapComponent: React.FC<MapComponentProps> = ({ allActiveFires, analyzedHotspots, focusedHotspot, customPrediction, onMapClick }) => {
  const mapRef = useRef<any>(null);
  const generalFiresLayerRef = useRef<any>(null);
  const analyzedHotspotsLayerRef = useRef<any>(null);
  const customPredictionLayerRef = useRef<any>(null);
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map', { 
        zoomControl: false,
        minZoom: 3, // Prevent zooming out too far
        maxBounds: [[-90, -180], [90, 180]], // Restrict panning to the world
        maxBoundsViscosity: 1.0 // Sticky bounds
      }).setView([20, 0], 3);

      // 1. Satellite Base Layer (Esri World Imagery)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
        noWrap: true
      }).addTo(mapRef.current);

      // 2. Labels Overlay (Esri World Boundaries and Places)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        noWrap: true
      }).addTo(mapRef.current);
      
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
      
      // Add click handler for custom location analysis
      mapRef.current.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        onMapClick(lat, lng);
      });
    }
  }, [onMapClick]);
  
  // Fly to focused hotspot
  useEffect(() => {
      if (mapRef.current && focusedHotspot) {
          mapRef.current.flyTo([focusedHotspot.fireData.lat, focusedHotspot.fireData.lon], 8, {
              animate: true,
              duration: 1.5
          });
      }
  }, [focusedHotspot]);

  // Update map layers
  useEffect(() => {
    if (!mapRef.current) return;
    
    // 1. General fires layer (all fires)
    if (generalFiresLayerRef.current) {
        mapRef.current.removeLayer(generalFiresLayerRef.current);
    }
    const fireIcon = L.icon({
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Y5NzMxNiIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCI+PHBhdGggZD0iTTEyLjM3MywzLjQzNmMwLjE0My0wLjMzNiwwLjQ5My0wLjUzOSwwLjg2Ni0wLjUzOWMwLjM3MywwLDAuNzIzLDAuMjAzLDAuODY2LDAuNTM5bDAuMTA3LDAuMjQ4YzAuMzA2LDAuNzExLDAuOTgyLDEuNDIzLDEuODcxLDEuNzM1bDAsMGwwLDBsMC4xOTIsMC4wNTZjMC4zNDUsMC4xLDAuNTc5LDAuNDI3LDAuNTc5LDAuNzkxYzAsMC40NjYtMC4zNzgsMC44NDQtMC44NDMsMC44NDRoLTAuMTIxbC0wLjIwNi0wLjA2Yy0wLjg1Ny0wLjI1MS0xLjczMywwLjA2My0yLjI3OCwwLjY2NGMtMC41NDUsMC42MDEtMC43NjIsMS40MjQtMC42NDEsMi4yNDFsMC4wNDQsMC4zMDFjMC4wNzUsMC41MTYtMC4zMDgsMC45NzgtMC44MjYsMC45NzhoLTIuNTE2Yy0wLjUxOCwwLTAuOTAxLTAuNDYyLTAuODI2LTAuOTc4bDAuMDQ0LTAuMzAxYzAuMTIxLTAuODE4LTAuMDk2LTEuNjQtMC42NDEtMi4yNDFjLTAuNTQ1LTAuNjAxLTEuNDIxLTAuOTE1LTIuMjc4LTAuNjY0bC0wLjIwNiwwLjA2SCw1LjY3M2MtMC40NjUsMC0wLjg0My0wLjM3OC0wLjg0My0wLjg0NGMwLTAuMzY0LDAuMjM0LTAuNjkxLDAuNTc5LTAuNzkxbDAuMTkyLTAuMDU2YzAuODg5LTAuMzEyLDEuNTY1LTEuMDI0LDEuODcxLTEuNzM1bDAuMTA3LTAuMjQ4Wm0tMS41NDQsOS4yNTNjMC40ODIsMS4xODgsMS42NTgsMS45OTUsMi45NTIsMS45OTVzMi40NjktMC44MDcsMi45NTItMS45OTVsMS41NjQtMy44NTJjMC4zMDUtMC43NTItMC4yNTYtMS42MTItMS4wOTMtMS43NzhMNy45NzcsOC4wNDdjLTAuODM3LDAuMTY1LTAuODk5LDEuMDI3LTEuMDkzLDEuNzc4bDEuNTY0LDMuODUxWm0xLjA3NiwyLjA0MmMtMC4wNDIsMC41MTcsMC4zNTEsMC45NjEsMC44NTgsMC45NjFsMi40MjUsMGMwLjUwOCwwLDAuOTAxLTAuNDQ0LDAuODU4LTAuOTYxbC0wLjI2NC0zLjI1NWMtMC4wNTItMC42NDItMC41OTMtMS4xNDgtMS4yMzYtMS4xNDhzLTEuMTg0LDAuNTA2LTEuMjM2LDEuMTQ4bC0wLjI2NCwzLjI1NFoiLz48L3N2Zz4=',
        iconSize: [16, 16],
    });
    const fireMarkers = allActiveFires.map(fire => L.marker([fire.lat, fire.lon], { icon: fireIcon, opacity: 0.7 }));
    generalFiresLayerRef.current = L.layerGroup(fireMarkers).addTo(mapRef.current);
    
    // 2. Analyzed hotspots layer
    if (analyzedHotspotsLayerRef.current) {
        mapRef.current.removeLayer(analyzedHotspotsLayerRef.current);
    }
    const hotspotMarkers = analyzedHotspots.map(hotspot => {
        const riskColor = getRiskColor(hotspot.prediction!.riskLevel);
        const dangerMarker = L.circleMarker([hotspot.fireData.lat, hotspot.fireData.lon], {
            radius: 12,
            color: riskColor,
            fillColor: riskColor,
            fillOpacity: 0.4,
            weight: 2,
            className: 'pulsating-marker'
        });
        
        const sourceBadge = hotspot.prediction?.source === 'XGBoost' 
            ? `<span style="background-color: #2563eb; color: white; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: bold; margin-right: 5px; display: inline-flex; align-items: center;">⚡ XGBoost</span>` 
            : '';

        const popupContent = `
            <div class="p-1">
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    ${sourceBadge}
                    <h3 class="font-bold text-md" style="color:${riskColor}; margin: 0;">${hotspot.prediction?.riskLevel} Risk Zone</h3>
                </div>
                <p class="text-sm text-gray-300 mt-1">
                    ${hotspot.envData.locationName}
                </p>
            </div>
        `;
        dangerMarker.bindPopup(popupContent, { className: 'custom-popup', closeButton: false });
        
        return dangerMarker;
    });
    analyzedHotspotsLayerRef.current = L.layerGroup(hotspotMarkers).addTo(mapRef.current);
    
    // 3. Custom prediction marker
    if (customPredictionLayerRef.current) {
        mapRef.current.removeLayer(customPredictionLayerRef.current);
    }
    if (customPrediction) {
        const riskColor = getRiskColor(customPrediction.prediction!.riskLevel);
        const customMarker = L.circleMarker([customPrediction.fireData.lat, customPrediction.fireData.lon], {
            radius: 15,
            color: '#3b82f6', // blue-500
            fillColor: riskColor,
            fillOpacity: 0.6,
            weight: 3,
            className: 'custom-location-marker'
        });
        
        const sourceBadge = customPrediction.prediction?.source === 'XGBoost' 
            ? `<span style="background-color: #2563eb; color: white; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: bold; margin-right: 5px; display: inline-flex; align-items: center;">⚡ XGBoost</span>` 
            : '';

        const popupContent = `
            <div class="p-1">
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    ${sourceBadge}
                    <h3 class="font-bold text-md" style="color:${riskColor}; margin: 0;">📍 Custom Analysis</h3>
                </div>
                <p class="text-sm font-semibold" style="color:${riskColor}">${customPrediction.prediction?.riskLevel} Risk</p>
                <p class="text-sm text-gray-300 mt-1">
                    ${customPrediction.envData.locationName}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                    ${customPrediction.fireData.lat.toFixed(4)}, ${customPrediction.fireData.lon.toFixed(4)}
                </p>
            </div>
        `;
        customMarker.bindPopup(popupContent, { className: 'custom-popup', closeButton: false });
        customMarker.openPopup();
        
        customPredictionLayerRef.current = L.layerGroup([customMarker]).addTo(mapRef.current);
    }
    
  // Inject CSS for popups and animations
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-popup .leaflet-popup-content-wrapper {
            background: rgba(15, 23, 42, 0.95); /* Slate-900 */
            backdrop-filter: blur(10px);
            color: #E2E8F0; /* Slate-200 */
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
            padding: 0;
            overflow: hidden;
        }
        .custom-popup .leaflet-popup-content { margin: 0; width: 280px !important; }
        .custom-popup .leaflet-popup-tip { background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); }
        .leaflet-container a.leaflet-popup-close-button {
            color: #94A3B8;
            font-size: 18px;
            padding: 8px;
        }
        
        @keyframes radar-sweep {
            0% { transform: scale(0); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: scale(2.5); opacity: 0; }
        }
        
        .radar-marker {
            position: relative;
        }
        .radar-marker::before {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            width: 100%; height: 100%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: inherit;
            animation: radar-sweep 2s infinite ease-out;
            z-index: -1;
        }

        /* Map Legend Control */
        .info.legend {
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(4px);
            padding: 12px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.1);
            color: #cbd5e1;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 12px;
            line-height: 1.5;
        }
        .info.legend h4 {
            margin: 0 0 8px;
            font-weight: 700;
            color: #f8fafc;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
        }
        .info.legend i {
            width: 14px;
            height: 14px;
            float: left;
            margin-right: 8px;
            opacity: 0.9;
            border-radius: 3px;
        }
        .info.legend .row {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
        }
    `;
    document.head.appendChild(style);

    // 4. Legend Control
    const legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = `
            <h4>Risk Levels</h4>
            <div class="row"><i style="background: #ef4444"></i> Extreme Risk</div>
            <div class="row"><i style="background: #f97316"></i> High Risk</div>
            <div class="row"><i style="background: #eab308"></i> Medium Risk</div>
            <div class="row"><i style="background: #84cc16"></i> Low Risk</div>
            <div class="mt-2 pt-2 border-t border-slate-700"></div>
            <div class="row"><i style="background: none; border: 2px solid #ef4444; border-radius: 50%; width: 10px; height: 10px; margin: 2px 8px 2px 2px;"></i> Active Fire</div>
            <div class="row"><i style="background: #3b82f6; border-radius: 50%;"></i> Custom Analysis</div>
        `;
        return div;
    };
    legend.addTo(mapRef.current);

    return () => {
        if (mapRef.current) {
            legend.remove();
        }
        document.head.removeChild(style);
    };

  }, [allActiveFires, analyzedHotspots, customPrediction]);

  // Update logic for rendering markers matches new styles
  useEffect(() => {
    if(!mapRef.current) return;

     // 1. General fires layer
     if (generalFiresLayerRef.current) mapRef.current.removeLayer(generalFiresLayerRef.current);
     
     const fireIcon = L.divIcon({
         className: 'custom-fire-marker',
         html: `<div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%; border: 2px solid #7f1d1d; box-shadow: 0 0 10px #ef4444;"></div>`,
         iconSize: [12, 12]
     });

     const fireMarkers = allActiveFires.map(fire => L.marker([fire.lat, fire.lon], { icon: fireIcon }));
     generalFiresLayerRef.current = L.layerGroup(fireMarkers).addTo(mapRef.current);

     // 2. Analyzed hotspots
     if (analyzedHotspotsLayerRef.current) mapRef.current.removeLayer(analyzedHotspotsLayerRef.current);

     const hotspotMarkers = analyzedHotspots.map(hotspot => {
         const riskColor = getRiskColor(hotspot.prediction!.riskLevel);
         
         const dangerMarker = L.circleMarker([hotspot.fireData.lat, hotspot.fireData.lon], {
            radius: 12,
            color: riskColor,
            fillColor: riskColor,
            fillOpacity: 0.6,
            weight: 2,
            className: 'radar-marker' // Use new animation class
         });

         const { temperature, humidity, windSpeed, rainfall } = hotspot.envData;
         
         const popupContent = `
            <div class="flex flex-col">
                <div class="p-3 bg-slate-950 border-b border-slate-800">
                    <div class="flex items-center justify-between">
                         <span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background: ${riskColor}20; color: ${riskColor}; border: 1px solid ${riskColor}40">
                            ${hotspot.prediction?.riskLevel.toUpperCase()}
                         </span>
                         <span class="text-[10px] text-slate-400">ID: ${Math.floor(hotspot.fireData.lat * 100)}</span>
                    </div>
                    <h3 class="font-bold text-sm text-white mt-1 leading-tight">${hotspot.envData.locationName}</h3>
                </div>
                
                <div class="p-3 space-y-2">
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div class="bg-slate-800/50 p-1.5 rounded border border-slate-700">
                            <div class="text-slate-400 text-[10px] uppercase">Temp</div>
                            <div class="font-mono text-slate-200">${temperature}°C</div>
                        </div>
                        <div class="bg-slate-800/50 p-1.5 rounded border border-slate-700">
                            <div class="text-slate-400 text-[10px] uppercase">Humidity</div>
                            <div class="font-mono text-slate-200">${humidity}%</div>
                        </div>
                        <div class="bg-slate-800/50 p-1.5 rounded border border-slate-700">
                            <div class="text-slate-400 text-[10px] uppercase">Wind</div>
                            <div class="font-mono text-slate-200">${windSpeed} km/h</div>
                        </div>
                        <div class="bg-slate-800/50 p-1.5 rounded border border-slate-700">
                            <div class="text-slate-400 text-[10px] uppercase">Rain</div>
                            <div class="font-mono text-slate-200">${rainfall} mm</div>
                        </div>
                    </div>
                    
                    <div class="text-[10px] text-slate-500 pt-1 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        ${hotspot.fireData.lat.toFixed(4)}, ${hotspot.fireData.lon.toFixed(4)}
                    </div>
                </div>
            </div>
         `;
         
         dangerMarker.bindPopup(popupContent, { className: 'custom-popup', minWidth: 260 });
         return dangerMarker;
     });
     
     analyzedHotspotsLayerRef.current = L.layerGroup(hotspotMarkers).addTo(mapRef.current);
     
     // 3. Custom prediction (Simple update to match style)
     if (customPredictionLayerRef.current) mapRef.current.removeLayer(customPredictionLayerRef.current);
     if (customPrediction) {
         const riskColor = getRiskColor(customPrediction.prediction!.riskLevel);
         // ... (Logic mostly same, just ensuring style consistency if needed)
         // For brevity, using similar marker logic as analyzed hotspots but blue
          const customMarker = L.circleMarker([customPrediction.fireData.lat, customPrediction.fireData.lon], {
            radius: 12,
            color: '#3b82f6',
            fillColor: riskColor, 
            fillOpacity: 0.8,
            weight: 3,
            className: 'radar-marker'
         });
         
         // Reuse popup structure or simplify
         const { temperature, humidity, windSpeed, rainfall } = customPrediction.envData;
          const popupContent = `
            <div class="flex flex-col">
                <div class="p-3 bg-blue-950 border-b border-blue-900">
                    <span class="text-xs font-bold text-blue-300 uppercase tracking-widest">Custom Analysis</span>
                    <h3 class="font-bold text-sm text-white mt-1">${customPrediction.prediction?.riskLevel} Risk</h3>
                </div>
                 <div class="p-3 space-y-2">
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div class="bg-slate-800/50 p-1.5 rounded border border-slate-700"><div class="text-slate-400 text-[10px]">TEMP</div><div class="text-slate-200">${temperature}°C</div></div>
                        <div class="bg-slate-800/50 p-1.5 rounded border border-slate-700"><div class="text-slate-400 text-[10px]">HUMIDITY</div><div class="text-slate-200">${humidity}%</div></div>
                    </div>
                 </div>
            </div>
         `;
         customMarker.bindPopup(popupContent, { className: 'custom-popup' }).openPopup();
         customPredictionLayerRef.current = L.layerGroup([customMarker]).addTo(mapRef.current);
     }

  }, [allActiveFires, analyzedHotspots, customPrediction]);

  return <div id="map" className="h-full w-full bg-gray-900 border-l border-white/10" />;
};

export default MapComponent;
