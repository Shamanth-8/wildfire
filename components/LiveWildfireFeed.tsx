import React from 'react';
import { AnalyzedHotspot } from '../types';

interface LiveWildfireFeedProps {
    hotspots: AnalyzedHotspot[];
    onSelect: (hotspot: AnalyzedHotspot) => void;
}

const LiveWildfireFeed: React.FC<LiveWildfireFeedProps> = ({ hotspots, onSelect }) => {
    // Take top 5 for the feed
    const feedItems = hotspots.slice(0, 5);

    return (
        <div className="mt-4 bg-slate-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                        Live Satellite Feed
                    </h3>
                </div>
                <div className="text-[9px] font-mono text-slate-500 uppercase">
                    NASA FIRMS • REAL-TIME
                </div>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                {feedItems.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-[10px] text-slate-500 font-mono animate-pulse">SCANNING GLOBE FOR THERMAL ANOMALIES...</p>
                    </div>
                ) : (
                    feedItems.map((hotspot) => (
                        <div 
                            key={hotspot.id}
                            onClick={() => onSelect(hotspot)}
                            className="bg-slate-800/40 hover:bg-slate-700/50 p-2 rounded border border-white/5 hover:border-red-500/30 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 w-full">
                                        <span className="text-[10px] bg-red-500/20 text-red-300 px-1 rounded border border-red-500/20 font-bold whitespace-nowrap">
                                            DETECTED
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono text-right flex-1 truncate">
                                            {formatTime(hotspot.fireData.acq_date)}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-200 mt-1 truncate group-hover:text-white transition-colors">
                                        {hotspot.envData.locationName}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                         <span className="text-[9px] text-slate-500 font-mono">
                                            Coords: {hotspot.fireData.lat.toFixed(2)}, {hotspot.fireData.lon.toFixed(2)}
                                         </span>
                                    </div>
                                </div>
                                <div className="ml-2 flex flex-col items-end">
                                     <div className={`w-1.5 h-1.5 rounded-full ${hotspot.prediction?.riskLevel === 'Extreme' ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-orange-500'} mb-1`}></div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {feedItems.length > 0 && (
                <div className="mt-2 text-[9px] text-slate-600 font-mono text-center border-t border-white/5 pt-1">
                    Displaying top {feedItems.length} critical incidents
                </div>
            )}
        </div>
    );
};

// Helper to format date relative to now or just time
const formatTime = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        // If date is invalid, return raw string or 'Now'
        if (isNaN(date.getTime())) return 'LIVE';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return 'LIVE';
    }
};

export default LiveWildfireFeed;
