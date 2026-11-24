import React from 'react';
import { Briefcase, AlertTriangle, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { PROBLEMS } from '../../engine/problems.js';

export function KnapsackVisualizer({ gaState, isStoryMode }) {
  const prob = PROBLEMS.knapsack;
  const bestInd = gaState.bestIndividual;
  const phenotype = bestInd?.phenotype || {
    totalWeight: 0,
    totalValue: 0,
    capacity: prob.capacity,
    isValid: true,
    packedItems: []
  };

  const isOverCapacity = phenotype.totalWeight > prob.capacity;
  const weightPercent = Math.min(100, Math.round((phenotype.totalWeight / prob.capacity) * 100));

  return (
    <div className="flex flex-col h-full bg-[#161b22] rounded border border-[#30363d] p-2.5 sm:p-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 sm:pb-2.5 mb-2 sm:mb-2.5 border-b border-[#30363d] text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Briefcase className="w-4 h-4 text-[#58a6ff] flex-shrink-0" />
          <span className="font-semibold text-[#f0f6fc]">
            0/1 Knapsack Constraint Matrix
          </span>
          <span className="text-[#8b949e] text-[11px]">
            · Limit: {prob.capacity} kg
          </span>
        </div>

        <div>
          {phenotype.isValid ? (
            <span className="flex items-center gap-1 text-[#3fb950] bg-[#0d1117] border border-[#238636] px-2 py-0.5 rounded text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Feasible
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#f85149] bg-[#0d1117] border border-[#f85149] px-2 py-0.5 rounded text-[11px] font-mono">
              <AlertTriangle className="w-3.5 h-3.5" /> Over Capacity (-{(phenotype.totalWeight - prob.capacity) * 6} pts)
            </span>
          )}
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded p-2 sm:p-2.5 mb-2.5 sm:mb-3">
        <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
          <span className="text-[#8b949e]">Total Weight: {phenotype.totalWeight} / {prob.capacity} kg</span>
          <span className={isOverCapacity ? 'text-[#f85149] font-bold' : 'text-[#3fb950] font-bold'}>
            {weightPercent}% Utilized
          </span>
        </div>
        <div className="w-full h-2 bg-[#21262d] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-150 ${
              isOverCapacity ? 'bg-[#f85149]' : 'bg-[#3fb950]'
            }`}
            style={{ width: `${Math.min(100, (phenotype.totalWeight / prob.capacity) * 100)}%` }}
          />
        </div>
      </div>

      {/* Item Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-0.5 sm:pr-1 min-h-[180px] max-h-[300px]">
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {prob.items.map((item, idx) => {
            const isPacked = bestInd?.genes ? bestInd.genes[idx] === 1 : false;

            return (
              <div
                key={item.id}
                className={`p-2 sm:p-2.5 rounded border text-xs flex flex-col justify-between transition-colors ${
                  isPacked
                    ? 'bg-[#1c2128] border-[#3fb950]'
                    : 'bg-[#0d1117] border-[#30363d] opacity-50'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-xs sm:text-sm font-mono text-[#8b949e]">Item #{idx}</span>
                  {isPacked ? (
                    <span className="text-[#3fb950] font-mono text-[10px] font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> IN
                    </span>
                  ) : (
                    <span className="text-[#6e7681] font-mono text-[10px] flex items-center gap-0.5">
                      <XCircle className="w-3 h-3" /> OUT
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-[#f0f6fc] truncate text-xs">{item.name}</div>
                  <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-[#8b949e] mt-1 font-mono">
                    <span>{item.weight} kg</span>
                    <span className="text-[#f0f6fc] font-bold">+{item.value} pts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="mt-2.5 pt-2 border-t border-[#30363d] flex flex-wrap items-center justify-between gap-2 text-xs bg-[#0d1117] px-2.5 sm:px-3 py-1.5 rounded font-mono">
        <div className="text-[#8b949e]">
          Selected: <strong className="text-[#f0f6fc]">{phenotype.packedItems.length} of {prob.items.length}</strong>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <span className="text-[#8b949e]">Raw: <strong className="text-[#f0f6fc]">{phenotype.totalValue}</strong></span>
          <span className="text-[#8b949e]">Score: <strong className="text-[#3fb950]">{bestInd?.fitness || 0}</strong></span>
        </div>
      </div>
    </div>
  );
}
