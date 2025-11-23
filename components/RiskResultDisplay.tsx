
import React from 'react';
import { RiskLevel, AnalyzedHotspot } from '../types';

interface RiskResultDisplayProps {
  hotspot: AnalyzedHotspot;
  onSelect: () => void;
  isSelected: boolean;
}

const getRiskStyles = (riskLevel: RiskLevel | undefined) => {
  switch (riskLevel) {
    case RiskLevel.Low:
      return {
        borderColor: 'border-green-500/50',
        textColor: 'text-green-400',
        bgColor: 'bg-green-500/10',
        badgeColor: 'bg-green-500 text-green-900',
        label: 'Low Risk'
      };
    case RiskLevel.Medium:
      return {
        borderColor: 'border-yellow-500/50',
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        badgeColor: 'bg-yellow-500 text-yellow-900',
        label: 'Medium Risk'
      };
    case RiskLevel.High:
      return {
        borderColor: 'border-orange-500/50',
        textColor: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        badgeColor: 'bg-orange-500 text-orange-900',
        label: 'High Risk'
      };
    case RiskLevel.Extreme:
      return {
        borderColor: 'border-red-600/50',
        textColor: 'text-red-500',
        bgColor: 'bg-red-600/10',
        badgeColor: 'bg-red-600 text-red-100',
        label: 'Extreme Risk'
      };
    default:
      return {
        borderColor: 'border-gray-700/50',
        textColor: 'text-gray-400',
        bgColor: 'bg-gray-900/50',
        badgeColor: 'bg-gray-600 text-gray-100',
        label: 'Analyzing...'
      };
  }
};

const RiskResultDisplay: React.FC<RiskResultDisplayProps> = ({ hotspot, onSelect, isSelected }) => {
  const result = hotspot.prediction;
  const styles = getRiskStyles(result?.riskLevel);

  return (
    <div 
        onClick={onSelect}
        className={`p-4 rounded-lg border ${isSelected ? `bg-blue-900/30 border-blue-500` : `${styles.borderColor} ${styles.bgColor}`} transition-all duration-300 cursor-pointer hover:border-blue-500/80 hover:bg-gray-800/50`}
    >
      <div className="flex items-center justify-between gap-4 mb-3">
         <div className="flex-1 min-w-0">
            <h3 className={`text-md font-semibold truncate ${styles.textColor}`} title={hotspot.envData.locationName}>
              {hotspot.envData.locationName}
            </h3>
         </div>
         {result && (
            <div className={`text-sm font-bold px-3 py-1 rounded-full ${styles.badgeColor} whitespace-nowrap`}>
              {styles.label}
            </div>
         )}
      </div>
      <div className="space-y-2">
        <p className="text-gray-300 text-sm">{result?.explanation || 'AI is currently assessing environmental factors...'}</p>
        <div className="text-xs text-gray-400 border-t border-gray-700/50 pt-2">
            <span className="font-semibold text-gray-300">NASA Fire Intensity:</span> {hotspot.fireData.brightness.toFixed(1)} K
        </div>
      </div>
    </div>
  );
};

export default RiskResultDisplay;
