import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea,
    ReferenceLine
} from 'recharts';
import { TimelineDataPoint, RiskLevel } from '../types';
import { format, parseISO } from 'date-fns';

interface TimelineChartProps {
    data: TimelineDataPoint[];
    isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as TimelineDataPoint;
        return (
            <div className="bg-slate-900 border border-white/10 p-3 rounded shadow-xl text-xs">
                <p className="font-bold text-white mb-1">{format(parseISO(data.date), 'MMMM yyyy')}</p>
                <p className={`font-semibold mb-2 ${data.riskLevel === RiskLevel.Extreme ? 'text-red-400' :
                    data.riskLevel === RiskLevel.High ? 'text-orange-400' :
                        data.riskLevel === RiskLevel.Medium ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                    Risk: {data.riskLevel}
                </p>
                <div className="space-y-1 text-slate-400">
                    <p>Temp: <span className="text-slate-200">{data.temperature.toFixed(1)}°C</span></p>
                    <p>Humidity: <span className="text-slate-200">{data.humidity.toFixed(0)}%</span></p>
                    <p>Wind: <span className="text-slate-200">{data.windSpeed.toFixed(1)} km/h</span></p>
                    <p>Rain: <span className="text-slate-200">{data.rainfall.toFixed(1)} mm</span></p>
                    <p>Confidence: <span className={`${data.confidence >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>{data.confidence}%</span></p>
                </div>
                {data.isProjected && (
                    <p className="mt-2 text-blue-400 italic text-[10px]">Projected Data</p>
                )}
            </div>
        );
    }
    return null;
};

const TimelineChart: React.FC<TimelineChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="h-48 w-full flex items-center justify-center bg-white/5 rounded-lg animate-pulse">
                <span className="text-slate-500 text-xs">Loading timeline data...</span>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-48 w-full flex items-center justify-center bg-white/5 rounded-lg">
                <span className="text-slate-500 text-xs">No timeline data available</span>
            </div>
        );
    }

    // Find the index where projection starts (first future date)
    const projectionStartIndex = data.findIndex(d => d.isProjected);
    const todayIndex = projectionStartIndex > 0 ? projectionStartIndex - 1 : data.length - 1;

    return (
        <div className="h-52 w-full mt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">1-Year Risk Forecast</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => format(parseISO(str), 'MMM yy')}
                        stroke="#94a3b8"
                        tick={{ fontSize: 10 }}
                        interval={2} // Show every 3rd month roughly
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fontSize: 10 }}
                        domain={[0, 15]} // Risk score domain
                        hide={true}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Reference line for Today */}
                    {projectionStartIndex > -1 && (
                        <ReferenceLine x={data[todayIndex].date} stroke="#60a5fa" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#60a5fa', fontSize: 10 }} />
                    )}

                    <Line
                        type="monotone"
                        dataKey="riskScore"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#fff' }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-between text-[10px] text-slate-500 px-2 mt-1">
                <span>Past Year</span>
                <span>Future Projection</span>
            </div>
        </div>
    );
};

export default TimelineChart;
