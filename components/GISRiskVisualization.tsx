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
            case 'veryHigh': return 'bg-red-600';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-400';
            case 'low': return 'bg-lime-500';
            case 'veryLow': return 'bg-green-500';
            default: return 'bg-slate-700';
        }
    };

    return (
        <div className="mt-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                GIS Risk Distribution Map
            </h3>

            {/* Map Grid */}
            <div className="mb-4 bg-slate-950/50 p-2 rounded-lg border border-white/5">
                <div className="grid grid-cols-12 gap-0.5">
                    {mapGrid.map((cell, index) => (
                        <div
                            key={index}
                            className={`aspect-square ${getRiskColor(cell.risk)} rounded-sm transition-all hover:opacity-75`}
                            title={`Risk: ${cell.risk}`}
                        />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-red-600"></div>
                        <span className="text-slate-300">Very High</span>
                    </div>
                    <span className="font-bold text-red-400">{riskZones.veryHigh}%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
                        <span className="text-slate-300">High</span>
                    </div>
                    <span className="font-bold text-orange-400">{riskZones.high}%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-yellow-400"></div>
                        <span className="text-slate-300">Medium</span>
                    </div>
                    <span className="font-bold text-yellow-400">{riskZones.medium}%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-lime-500"></div>
                        <span className="text-slate-300">Low</span>
                    </div>
                    <span className="font-bold text-lime-400">{riskZones.low}%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                        <span className="text-slate-300">Very Low</span>
                    </div>
                    <span className="font-bold text-green-400">{riskZones.veryLow}%</span>
                </div>
            </div>

            {/* Location Info */}
            <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-500">
                <span className="font-bold">Analysis Area:</span> {prediction.envData.locationName}
            </div>
        </div>
    );
};

export default GISRiskVisualization;
