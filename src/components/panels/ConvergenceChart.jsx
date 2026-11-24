import React, { useMemo } from 'react';
import { LineChart } from 'lucide-react';

export function ConvergenceChart({ theme = 'dark', history }) {
  const isLight = theme === 'light';
  const chartWidth = 560;
  const chartHeight = 170;
  const pad = { top: 15, right: 20, bottom: 25, left: 45 };

  const w = chartWidth - pad.left - pad.right;
  const h = chartHeight - pad.top - pad.bottom;

  const { minFit, maxFit, bestPath, avgPath, worstPath } = useMemo(() => {
    if (!history || history.length < 2) {
      return { minFit: 0, maxFit: 100, bestPath: '', avgPath: '', worstPath: '' };
    }

    let min = Infinity;
    let max = -Infinity;

    history.forEach(pt => {
      if (pt.worst < min) min = pt.worst;
      if (pt.best > max) max = pt.best;
    });

    if (min === max) {
      min -= 1;
      max += 1;
    }

    const n = history.length;
    const toX = (idx) => pad.left + (idx / (n - 1)) * w;
    const toY = (val) => pad.top + h - ((val - min) / (max - min)) * h;

    let bPath = '';
    let aPath = '';
    let wPath = '';

    history.forEach((pt, i) => {
      const x = toX(i);
      const by = toY(pt.best);
      const ay = toY(pt.avg);
      const wy = toY(pt.worst);

      if (i === 0) {
        bPath = `M ${x} ${by}`;
        aPath = `M ${x} ${ay}`;
        wPath = `M ${x} ${wy}`;
      } else {
        bPath += ` L ${x} ${by}`;
        aPath += ` L ${x} ${ay}`;
        wPath += ` L ${x} ${wy}`;
      }
    });

    return {
      minFit: Math.floor(min),
      maxFit: Math.ceil(max),
      bestPath: bPath,
      avgPath: aPath,
      worstPath: wPath
    };
  }, [history]);

  const latest = history[history.length - 1] || { best: 0, avg: 0, worst: 0, generation: 0 };

  return (
    <div className="bg-[#161b22] rounded border border-[#30363d] p-2.5 sm:p-3 text-xs flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-1.5 border-b border-[#30363d]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LineChart className="w-4 h-4 text-[#58a6ff] flex-shrink-0" />
          <span className="font-bold text-[#f0f6fc]">Convergence Trajectory</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono">
          <span className="flex items-center gap-1 text-[#3fb950]">
            <span className="w-2 h-2 rounded-full bg-[#3fb950]"></span> Best: {latest.best}
          </span>
          <span className="flex items-center gap-1 text-[#58a6ff]">
            <span className="w-2 h-2 rounded-full bg-[#58a6ff]"></span> Avg: {latest.avg}
          </span>
          <span className="flex items-center gap-1 text-[#8b949e]">
            <span className="w-2 h-2 rounded-full bg-[#6e7681]"></span> Worst: {latest.worst}
          </span>
        </div>
      </div>

      {/* SVG Line Graph */}
      <div className="relative flex-1 min-h-[140px] bg-[#0d1117] rounded border border-[#30363d] flex items-center justify-center p-2 overflow-hidden">
        {history.length < 2 ? (
          <div className="text-[#8b949e] text-center py-6 text-xs font-mono px-2">
            Execute at least 2 generations to observe fitness convergence across epochs.
          </div>
        ) : (
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full max-h-[170px]">
            <text x={pad.left - 6} y={pad.top + 8} fill="#6e7681" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="end">
              {maxFit}
            </text>
            <text x={pad.left - 6} y={pad.top + h} fill="#6e7681" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="end">
              {minFit}
            </text>
            <text x={pad.left} y={chartHeight - 6} fill="#6e7681" fontSize="10" fontFamily="ui-monospace, monospace">
              Gen 0
            </text>
            <text x={chartWidth - pad.right} y={chartHeight - 6} fill="#6e7681" fontSize="10" fontFamily="ui-monospace, monospace" textAnchor="end">
              Gen {latest.generation}
            </text>

            <line
              x1={pad.left}
              y1={pad.top + h / 2}
              x2={chartWidth - pad.right}
              y2={pad.top + h / 2}
              stroke={isLight ? '#e1e4e8' : '#21262d'}
              strokeDasharray="2 2"
            />

            <path d={worstPath} fill="none" stroke={isLight ? '#8c959f' : '#6e7681'} strokeWidth="1" strokeDasharray="2 2" />
            <path d={avgPath} fill="none" stroke={isLight ? '#0969da' : '#58a6ff'} strokeWidth="1.5" />
            <path d={bestPath} fill="none" stroke={isLight ? '#1a7f37' : '#3fb950'} strokeWidth="2" />
          </svg>
        )}
      </div>
    </div>
  );
}
