import React from 'react';
import { EvaluationMetrics } from '../services/geminiService';

interface ValidationAccuracyProps {
    metrics: EvaluationMetrics | null;
}

const ValidationAccuracy: React.FC<ValidationAccuracyProps> = ({ metrics }) => {
    if (!metrics) {
        return (
            <div className="mt-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Model Validation
                </h3>
                <p className="text-xs text-slate-400">Validating against NASA FIRMS data...</p>
            </div>
        );
    }

    const { accuracy, total_predictions, correct_predictions } = metrics;

    // Determine overall status
    const getStatusColor = (value: number) => {
        if (value >= 80) return 'text-green-400';
        if (value >= 60) return 'text-yellow-400';
        return 'text-orange-400';
    };

    const getBarColor = (value: number) => {
        if (value >= 80) return 'bg-green-500';
        if (value >= 60) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    return (
        <div className="mt-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Model Validation
                </h3>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] text-slate-400 font-medium">Live NASA FIRMS</span>
                </div>
            </div>

            {/* Accuracy Metric */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300 font-medium">Model Accuracy</span>
                    <span className={`text-2xl font-bold ${getStatusColor(accuracy)}`}>
                        {accuracy.toFixed(1)}%
                    </span>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full ${getBarColor(accuracy)} transition-all duration-500 rounded-full`}
                        style={{ width: `${accuracy}%` }}
                    ></div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/30 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[9px] text-slate-400 font-medium uppercase">Correct</span>
                    </div>
                    <p className="text-xl font-bold text-green-400">{correct_predictions}</p>
                </div>

                <div className="bg-slate-800/30 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[9px] text-slate-400 font-medium uppercase">Incorrect</span>
                    </div>
                    <p className="text-xl font-bold text-red-400">{total_predictions - correct_predictions}</p>
                </div>
            </div>

            {/* Info */}
            <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-[9px] text-slate-500 leading-relaxed">
                    <span className="font-bold">Validation:</span> Compared against NASA FIRMS fire detections within 20km radius
                </p>
            </div>
        </div>
    );
};

export default ValidationAccuracy;
