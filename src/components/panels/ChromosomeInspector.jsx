import React, { useState } from 'react';
import { Eye, Crown, CheckCircle } from 'lucide-react';

export function ChromosomeInspector({ gaState, config, contextData, isStoryMode }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const population = gaState.population || [];

  return (
    <div className="flex flex-col h-full bg-[#161b22] rounded border border-[#30363d] p-2.5 sm:p-3 text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 mb-2 border-b border-[#30363d]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Eye className="w-4 h-4 text-[#58a6ff] flex-shrink-0" />
          <span className="font-bold text-[#f0f6fc] text-xs">
            Population Chromosome Matrix
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] text-[#8b949e] font-mono">
          Ranked by Fitness ({population.length} Candidates)
        </span>
      </div>

      {/* Population List */}
      <div className="flex-1 overflow-y-auto pr-0.5 sm:pr-1 space-y-1.5 max-h-[380px]">
        {population.map((ind, idx) => {
          const isTop = idx === 0;
          const isElite = ind.isElite;
          const isSelected = ind.isSelected;
          const isInspected = selectedIdx === idx;

          return (
            <div
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`p-2 rounded border transition-colors cursor-pointer flex flex-col gap-1.5 ${
                isInspected
                  ? 'bg-[#1c2128] border-[#58a6ff]'
                  : isTop
                  ? 'bg-[#161b22] border-[#3fb950]'
                  : 'bg-[#0d1117] border-[#30363d] hover:border-[#8b949e]'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#8b949e] text-xs">
                    #{idx + 1}
                  </span>
                  {isTop && (
                    <span className="text-[10px] text-[#3fb950] font-mono font-bold">
                      BEST
                    </span>
                  )}
                  {isElite && !isTop && (
                    <span className="text-[10px] text-[#d29922] font-mono font-semibold">
                      ELITE
                    </span>
                  )}
                  {isSelected && (
                    <span className="text-[10px] text-[#58a6ff] font-mono flex items-center gap-0.5">
                      <CheckCircle className="w-2.5 h-2.5" /> Selected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px]">
                  <span className="text-[#8b949e]">
                    Fit: <strong className={isTop ? 'text-[#3fb950] font-bold' : 'text-[#f0f6fc]'}>{ind.fitness}</strong>
                  </span>
                  <span className="text-[#6e7681]">
                    P: {(ind.selectionProb * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Gene Visualization */}
              <div className="flex items-center gap-0.5 overflow-x-auto py-0.5 scrollbar-none font-mono min-w-0 max-w-full">
                {ind.genes.map((gene, gIdx) => {
                  let blockStyle = 'bg-[#21262d] text-[#c9d1d9] border border-[#30363d]';
                  let label = gene;

                  if (config.geneType === 'permutation') {
                    const city = contextData && contextData[gene];
                    label = city ? city.label : gene;
                    blockStyle = 'bg-[#0d1117] text-[#58a6ff] border border-[#30363d] px-1';
                  } else {
                    blockStyle = gene === 1
                      ? 'bg-[#238636] text-white w-4 h-4 flex items-center justify-center text-[10px]'
                      : 'bg-[#0d1117] text-[#6e7681] border border-[#30363d] w-4 h-4 flex items-center justify-center text-[10px]';
                  }

                  return (
                    <span
                      key={gIdx}
                      className={`inline-flex items-center rounded text-[10px] font-bold flex-shrink-0 ${blockStyle}`}
                      title={`Gene ${gIdx}: ${label}`}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>

              {/* Selection Probability Bar */}
              <div className="w-full h-1 bg-[#0d1117] rounded-full overflow-hidden">
                <div
                  className={`h-full ${isTop ? 'bg-[#3fb950]' : 'bg-[#1f6feb]'}`}
                  style={{ width: `${Math.min(100, ind.selectionProb * 300)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
