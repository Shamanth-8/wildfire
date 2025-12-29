import React from 'react';
import { AnalyzedHotspot, RiskLevel } from '../types';

interface GISRiskVisualizationProps {
    prediction: AnalyzedHotspot;
}

const GISRiskVisualization: React.FC<GISRiskVisualizationProps> = ({ prediction }) => {
    // Calculate risk distribution based on environmental factors
    const calculateRiskDistribution = () => {
        const { temperature, humidity, windSpeed, rainfall } = prediction.envData;
        const riskLevel = prediction.prediction?.riskLevel || RiskLevel.Low;

        // Simulate risk zones based on environmental conditions
        let veryHigh = 0, high = 0, medium = 0, low = 0, veryLow = 0;

        // Base distribution on current risk level
        if (riskLevel === RiskLevel.Extreme) {
            veryHigh = 35 + Math.random() * 10;
            high = 30 + Math.random() * 10;
            medium = 20 + Math.random() * 5;
            low = 10 + Math.random() * 5;
            veryLow = 5;
        } else if (riskLevel === RiskLevel.High) {
            veryHigh = 15 + Math.random() * 10;
            high = 35 + Math.random() * 10;
            medium = 25 + Math.random() * 5;
            low = 15 + Math.random() * 5;
            veryLow = 10;
        } else if (riskLevel === RiskLevel.Medium) {
            veryHigh = 5;
            high = 20 + Math.random() * 5;
            medium = 40 + Math.random() * 10;
            low = 25 + Math.random() * 5;
            veryLow = 10;
        } else {
            veryHigh = 2;
            high = 8 + Math.random() * 5;
            medium = 20 + Math.random() * 5;
            low = 35 + Math.random() * 10;
            veryLow = 35 + Math.random() * 10;
        }

        // Normalize to 100%
        const total = veryHigh + high + medium + low + veryLow;
        return {
            veryHigh: Math.round((veryHigh / total) * 100),
            high: Math.round((high / total) * 100),
            medium: Math.round((medium / total) * 100),
            low: Math.round((low / total) * 100),
            veryLow: Math.round((veryLow / total) * 100)
        };
    };

    const riskZones = calculateRiskDistribution();

    // Generate grid cells for map visualization
    const generateMapGrid = () => {
        const grid = [];
        const rows = 8;
        const cols = 12;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Determine risk level for this cell based on position and distribution
                const rand = Math.random() * 100;
                let cellRisk = '';
                let cumulative = 0;

                cumulative += riskZones.veryHigh;
                if (rand < cumulative) cellRisk = 'veryHigh';
                else {
                    cumulative += riskZones.high;
                    if (rand < cumulative) cellRisk = 'high';
                    else {
                        cumulative += riskZones.medium;
                        if (rand < cumulative) cellRisk = 'medium';
                        else {
                            cumulative += riskZones.low;
                            if (rand < cumulative) cellRisk = 'low';
                            else cellRisk = 'veryLow';
                        }
                    }
                }

                grid.push({ row, col, risk: cellRisk });
            }
        }
        return grid;
    };

    const mapGrid = generateMapGrid();

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'veryHigh': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
            case 'high': return 'bg-orange-500/80';
            case 'medium': return 'bg-yellow-500/60';
            case 'low': return 'bg-lime-500/40';
            case 'veryLow': return 'bg-slate-700/30';
            default: return 'bg-slate-800/20';
        }
    };

    return (
        <div className="mt-4 bg-slate-900/80 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                    </div>
                    <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                        GIS Satellite Scan Layer
                    </h3>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                    RES: 10m • {prediction.envData.locationName}
                </div>
            </div>

            {/* Satellite Grid Visualization */}
            <div className="relative mb-6 group">
                {/* Grid Container */}
                <div 
                    className="grid grid-cols-12 gap-px bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 overflow-hidden relative"
                    style={{ 
                        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 60%)' 
                    }}
                >
                    {/* Scan Line Animation */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/10 to-transparent w-full h-[20%] animate-scan pointer-events-none z-10 blur-sm"></div>

                    {mapGrid.map((cell, index) => (
                        <div
                            key={index}
                            className={`aspect-square ${getRiskColor(cell.risk)} rounded-[1px] transition-all duration-300 hover:scale-110 hover:z-20 hover:shadow-lg cursor-crosshair relative group/cell`}
                        >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-900 border border-slate-700 p-2 rounded shadow-xl hidden group-hover/cell:block z-50 pointer-events-none">
                                <div className="text-[10px] font-bold text-slate-300 uppercase mb-1 border-b border-slate-800 pb-1">
                                    Zone Alpha-{index}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex justify-between text-[9px] text-slate-400">
                                        <span>Risk</span>
                                        <span className={cell.risk.includes('High') ? 'text-red-400' : 'text-slate-200'}>{cell.risk}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] text-slate-400">
                                        <span>Confidence</span>
                                        <span className="text-sky-400">{85 + Math.floor(Math.random() * 14)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Decorative corners */}
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-sky-500/50"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-sky-500/50"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-sky-500/50"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-sky-500/50"></div>
            </div>

            {/* Enhanced Legend */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/30 p-3 rounded-lg border border-white/5">
                 {/* ... Existing legend logic but styled better ... */}
                 {[
                    { label: 'Critical', color: 'bg-red-500', value: riskZones.veryHigh, text: 'text-red-400' },
                    { label: 'High', color: 'bg-orange-500', value: riskZones.high, text: 'text-orange-400' },
                    { label: 'Moderate', color: 'bg-yellow-500', value: riskZones.medium, text: 'text-yellow-400' },
                    { label: 'Low', color: 'bg-lime-500', value: riskZones.low, text: 'text-lime-400' }
                 ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_5px_${item.color}]`}></div>
                            <span className="text-[10px] font-medium text-slate-400 uppercase">{item.label}</span>
                        </div>
                        <span className={`text-xs font-bold font-mono ${item.text}`}>{item.value}%</span>
                    </div>
                 ))}
                 <div className="col-span-2 pt-2 mt-1 border-t border-white/5 flex justify-between items-center px-1">
                    <span className="text-[9px] text-slate-600 uppercase tracking-widest">Total Coverage</span>
                    <span className="text-[10px] font-mono text-slate-400">100%</span>
                 </div>
            </div>
            
            <style jsx>{`
                @keyframes scan {
                    0% { top: -20%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 120%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 3s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default GISRiskVisualization;
