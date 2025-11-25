
import React from 'react';
import { RiskLevel, AnalyzedHotspot } from '../types';

import { EvaluationMetrics } from '../services/geminiService';

interface RiskResultDisplayProps {
  hotspot: AnalyzedHotspot;
  onSelect: () => void;
  isSelected: boolean;
  metrics?: EvaluationMetrics | null;
}

const getRiskStyles = (riskLevel: RiskLevel | undefined) => {
  switch (riskLevel) {
    case RiskLevel.Low:
      return {
        borderColor: 'border-emerald-500/30',
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        label: 'Low Risk'
      };
    case RiskLevel.Medium:
      return {
        borderColor: 'border-amber-500/30',
        textColor: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        label: 'Medium Risk'
      };
    case RiskLevel.High:
      return {
        borderColor: 'border-orange-500/30',
        textColor: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        badgeColor: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
        label: 'High Risk'
      };
    case RiskLevel.Extreme:
      return {
        borderColor: 'border-red-500/30',
        textColor: 'text-red-400',
        bgColor: 'bg-red-500/10',
        badgeColor: 'bg-red-500/20 text-red-300 border border-red-500/30',
        label: 'Extreme Risk'
      };
    default:
      return {
        borderColor: 'border-slate-700',
        textColor: 'text-slate-400',
        bgColor: 'bg-slate-800/50',
        badgeColor: 'bg-slate-700 text-slate-300',
        label: 'Analyzing...'
      };
  }
};

const RiskResultDisplay: React.FC<RiskResultDisplayProps> = ({ hotspot, onSelect, isSelected, metrics }) => {
  const result = hotspot.prediction;
  const styles = getRiskStyles(result?.riskLevel);

  return (
    <div
      onClick={onSelect}
      className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer group relative overflow-hidden ${isSelected ? `bg-blue-900/20 border-blue-500/50 ring-1 ring-blue-500/20` : `glass-card border-white/5 hover:border-white/10`}`}
    >
      {isSelected && <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`text-md font-semibold truncate ${styles.textColor}`} title={hotspot.envData.locationName}>
            {hotspot.envData.locationName}
          </h3>
        </div>
        {result && (
          <div className="flex gap-2">
            {result.source === 'XGBoost' && (
              <div className="text-xs font-bold px-2 py-1 rounded-full bg-blue-600 text-white whitespace-nowrap flex items-center shadow-sm border border-blue-400">
                ⚡ XGBoost
              </div>
            )}
            <div className={`text-sm font-bold px-3 py-1 rounded-full ${styles.badgeColor} whitespace-nowrap`}>
              {styles.label}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {metrics ? (
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="bg-slate-800/50 p-2 rounded border border-slate-700 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Accuracy</div>
              <div className="text-lg font-bold text-white">{metrics.accuracy.toFixed(2)}%</div>
            </div>
            <div className="bg-slate-800/50 p-2 rounded border border-slate-700 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Precision</div>
              <div className="text-lg font-bold text-blue-400">{metrics.precision.toFixed(2)}%</div>
            </div>
            <div className="bg-slate-800/50 p-2 rounded border border-slate-700 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Recall</div>
              <div className="text-lg font-bold text-green-400">{metrics.recall.toFixed(2)}%</div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-300 text-sm">{result?.explanation || 'AI is currently assessing environmental factors...'}</p>
            {hotspot.fireData.brightness > 0 && (
              <div className="text-xs text-gray-400 border-t border-gray-700/50 pt-2">
                <span className="font-semibold text-gray-300">NASA Fire Intensity:</span> {hotspot.fireData.brightness.toFixed(1)} K
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RiskResultDisplay;
