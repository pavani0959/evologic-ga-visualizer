import React, { useMemo } from 'react';
import { Target } from 'lucide-react';

export function FunctionVisualizer({ theme = 'dark', gaState, isStoryMode }) {
  const problemId = gaState.problemId || 'funcopt';
  const isLight = theme === 'light';

  const { curvePoints, minX, maxX, minY, maxY, globalMaxX, globalMaxY, formulaLabel, targetLabel } = useMemo(() => {
    const points = [];
    let min = Infinity;
    let max = -Infinity;
    let bestX = 0;
    let pMinX = 0;
    let pMaxX = 20;
    let step = 0.05;
    let fLabel = 'f(x) = x · sin(x) + 32';
    let tLabel = 'Target: x ≈ 17.58 (f = 49.33)';

    if (problemId === 'worked_fx2') {
      pMinX = 0;
      pMaxX = 31;
      step = 0.2;
      fLabel = 'Canonical: f(x) = x²';
      tLabel = 'Global Max: x = 31 (f = 961)';
      for (let x = pMinX; x <= pMaxX; x += step) {
        const y = x * x;
        points.push({ x, y });
        if (y < min) min = y;
        if (y > max) { max = y; bestX = x; }
      }
    } else if (problemId === 'worked_quad') {
      pMinX = 0;
      pMaxX = 2;
      step = 0.02;
      fLabel = 'Quadratic: f(x) = −x² + 2x';
      tLabel = 'Vertex Optimum: x = 1.0 (f = 1.0)';
      for (let x = pMinX; x <= pMaxX; x += step) {
        const y = Math.max(0, -(x * x) + 2 * x);
        points.push({ x, y });
        if (y < min) min = y;
        if (y > max) { max = y; bestX = x; }
      }
    } else {
      pMinX = 0;
      pMaxX = 20;
      step = 0.05;
      fLabel = 'f(x) = x · sin(x) + 32';
      tLabel = 'Global Peak: x ≈ 17.58 (f = 49.33)';
      for (let x = pMinX; x <= pMaxX; x += step) {
        const y = x * Math.sin(x) + 32;
        points.push({ x, y });
        if (y < min) min = y;
        if (y > max) { max = y; bestX = x; }
      }
    }

    return {
      curvePoints: points,
      minX: pMinX,
      maxX: pMaxX,
      minY: Math.floor(min) - (problemId === 'worked_fx2' ? 20 : 1),
      maxY: Math.ceil(max) + (problemId === 'worked_fx2' ? 50 : 2),
      globalMaxX: +bestX.toFixed(2),
      globalMaxY: +max.toFixed(2),
      formulaLabel: fLabel,
      targetLabel: tLabel
    };
  }, [problemId]);

  const svgWidth = 600;
  const svgHeight = 320;
  const padding = { top: 30, right: 30, bottom: 40, left: 55 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const toSvgX = (x) => padding.left + ((x - minX) / (maxX - minX)) * plotWidth;
  const toSvgY = (y) => padding.top + plotHeight - ((y - minY) / (maxY - minY)) * plotHeight;

  const pathD = useMemo(() => {
    return curvePoints.reduce((acc, p, idx) => {
      const sx = toSvgX(p.x);
      const sy = toSvgY(p.y);
      return idx === 0 ? `M ${sx} ${sy}` : `${acc} L ${sx} ${sy}`;
    }, '');
  }, [curvePoints, minY, maxY, minX, maxX]);

  const bestInd = gaState.bestIndividual;
  const bestX = bestInd?.phenotype?.x ?? 0;
  const bestY = bestInd?.phenotype?.fx ?? 0;

  // Ticks along X axis
  const xTicks = useMemo(() => {
    if (problemId === 'worked_fx2') return [0, 8, 16, 24, 31];
    if (problemId === 'worked_quad') return [0, 0.5, 1.0, 1.5, 2.0];
    return [0, 5, 10, 15, 20];
  }, [problemId]);

  return (
    <div className="flex flex-col h-full bg-[#161b22] rounded border border-[#30363d] p-2.5 sm:p-3">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 sm:pb-2.5 mb-2 sm:mb-2.5 border-b border-[#30363d] text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[#f0f6fc]">
            Landscape: {formulaLabel}
          </span>
          <span className="text-[#8b949e] font-mono text-[11px]">
            x &isin; [{minX}, {maxX}]
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono flex-wrap">
          <div className="flex items-center gap-1.5 text-[#8b949e] bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d] text-[11px]">
            <Target className="w-3.5 h-3.5 text-[#d29922]" />
            <span><strong className="text-[#d29922]">{targetLabel}</strong></span>
          </div>
          <div className="bg-[#0d1117] border border-[#30363d] px-2 py-0.5 rounded text-[#f0f6fc] text-[11px]">
            Best: <span className="text-[#3fb950] font-bold">x = {bestX} (f = {bestY})</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Plot */}
      <div className="relative flex-1 min-h-[260px] sm:min-h-[310px] bg-[#0d1117] rounded border border-[#30363d] flex items-center justify-center overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full max-h-[380px]">
          {/* Grid lines */}
          {xTicks.map(xVal => (
            <g key={`x-${xVal}`}>
              <line
                x1={toSvgX(xVal)}
                y1={padding.top}
                x2={toSvgX(xVal)}
                y2={padding.top + plotHeight}
                stroke={isLight ? '#e1e4e8' : '#161b22'}
                strokeWidth="1"
              />
              <text
                x={toSvgX(xVal)}
                y={svgHeight - 12}
                fill="#6e7681"
                fontSize="11"
                fontFamily="ui-monospace, monospace"
                textAnchor="middle"
              >
                {xVal}
              </text>
            </g>
          ))}

          {/* Continuous function curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#1f6feb"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Global Maximum Marker */}
          <g>
            <circle
              cx={toSvgX(globalMaxX)}
              cy={toSvgY(globalMaxY)}
              r="6"
              fill="#d29922"
              stroke={isLight ? '#1f2328' : '#ffffff'}
              strokeWidth="2"
            />
            <text
              x={toSvgX(globalMaxX)}
              y={toSvgY(globalMaxY) - 10}
              fill={isLight ? '#9a6700' : '#d29922'}
              fontSize="10"
              fontFamily="ui-monospace, monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              Peak ({globalMaxX}, {globalMaxY})
            </text>
          </g>

          {/* Candidate Population Dots */}
          {gaState.population && gaState.population.map((ind, idx) => {
            const indX = ind.phenotype?.x ?? 0;
            const indY = ind.phenotype?.fx ?? 0;
            const isTop = idx === 0;

            return (
              <circle
                key={`ind-${idx}`}
                cx={toSvgX(indX)}
                cy={toSvgY(indY)}
                r={isTop ? 6 : 3.5}
                fill={isTop ? (isLight ? '#1a7f37' : '#3fb950') : (isLight ? '#57606a' : '#8b949e')}
                stroke={isTop ? (isLight ? '#1f2328' : '#ffffff') : (isLight ? '#ffffff' : '#161b22')}
                strokeWidth={isTop ? 2 : 1}
                opacity={isTop ? 1 : 0.75}
              />
            );
          })}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-2 left-2 right-2 sm:left-3 sm:right-auto bg-[#161b22]/90 backdrop-blur-sm border border-[#30363d] px-2 py-1 rounded text-[10px] sm:text-[11px] font-mono text-[#8b949e] flex flex-wrap items-center gap-2 sm:gap-3 pointer-events-none">
          <span className="flex items-center gap-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#3fb950]"></span> Best
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#8b949e]"></span> Pop ({gaState.population?.length || 0})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#d29922]"></span> Peak
          </span>
        </div>
      </div>
    </div>
  );
}
