import React, { useState, useMemo, useEffect } from 'react';
import { Disc, Play, Shuffle, HelpCircle, CheckCircle, ArrowDown, Award } from 'lucide-react';

export function SelectionWheel({ theme = 'dark', gaState, config, params }) {
  const isLight = theme === 'light';
  const population = gaState.population || [];
  const selectionMethod = params.selectionMethod || 'tournament';
  const popSize = population.length;

  const [spinAngle, setSpinAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSlice, setSelectedSlice] = useState(null);
  const [lastRandom, setLastRandom] = useState(null);

  // Vibrant palette for slices
  const sliceColors = [
    '#1f6feb', '#238636', '#d29922', '#8957e5', '#da3633',
    '#2da44e', '#58a6ff', '#bf8700', '#a371f7', '#f85149',
    '#388bfd', '#3fb950', '#e3b341', '#bc8cff', '#ff7b72',
    '#79c0ff', '#56d364', '#f1e05a', '#d2a8ff', '#ffa198'
  ];

  // Calculate slice geometry
  const slices = useMemo(() => {
    if (!population || population.length === 0) return [];

    let currentAngle = 0;
    return population.map((ind, idx) => {
      const prob = ind.selectionProb || (1 / popSize);
      const angle = prob * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const midAngle = startAngle + angle / 2;
      const midRad = (midAngle - 90) * (Math.PI / 180);

      return {
        idx,
        ind,
        prob,
        percent: (prob * 100).toFixed(1),
        startAngle,
        endAngle,
        midAngle,
        labelX: 140 + 80 * Math.cos(midRad),
        labelY: 140 + 80 * Math.sin(midRad),
        color: sliceColors[idx % sliceColors.length]
      };
    });
  }, [population, popSize]);

  // AUTO-CONNECT: When the simulation performs selection, spin/point to the selected parent!
  useEffect(() => {
    if (!slices || slices.length === 0) return;

    // Find any chromosome marked as selected
    const selectedIdx = population.findIndex(ind => ind.isSelected);
    if (selectedIdx !== -1 && slices[selectedIdx]) {
      const targetSlice = slices[selectedIdx];
      const targetMid = targetSlice.midAngle;
      // Rotate so this slice aligns with the top pointer (0 deg)
      setSpinAngle(prev => prev + 360 + (360 - (targetMid % 360)));
      setSelectedSlice(targetSlice);
    }
  }, [gaState.generation, gaState.currentStep]);

  // SVG arc path generator
  function describeArc(x, y, radius, startAngle, endAngle) {
    if (endAngle - startAngle >= 359.9) {
      return `M ${x - radius} ${y} A ${radius} ${radius} 0 1 0 ${x + radius} ${y} A ${radius} ${radius} 0 1 0 ${x - radius} ${y} Z`;
    }
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const x1 = x + radius * Math.cos(startRad);
    const y1 = y + radius * Math.sin(startRad);
    const x2 = x + radius * Math.cos(endRad);
    const y2 = y + radius * Math.sin(endRad);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return `M ${x} ${y} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  }

  // Interactive Spin Simulation
  function handleSpin() {
    if (isSpinning || slices.length === 0) return;
    setIsSpinning(true);
    setSelectedSlice(null);

    const randomVal = Math.random();
    setLastRandom(randomVal.toFixed(4));

    let cumulative = 0;
    let chosenIdx = 0;
    for (let i = 0; i < slices.length; i++) {
      cumulative += slices[i].prob;
      if (randomVal <= cumulative) {
        chosenIdx = i;
        break;
      }
    }

    const targetSlice = slices[chosenIdx];
    const targetMid = targetSlice.midAngle;
    const extraSpins = (4 + Math.floor(Math.random() * 3)) * 360;
    const finalAngle = spinAngle + extraSpins + (360 - targetMid);

    setSpinAngle(finalAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedSlice(targetSlice);
    }, 1500);
  }

  return (
    <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-3 text-xs flex flex-col gap-3">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <Disc className="w-4 h-4 text-[#58a6ff]" />
          <span className="font-bold text-[#f0f6fc]">
            Selection Roulette Wheel
          </span>
          <span className="text-[11px] text-[#8b949e]">
            (Fitter solutions get bigger slices)
          </span>
        </div>

        <button
          onClick={handleSpin}
          disabled={isSpinning || slices.length === 0}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1f6feb] hover:bg-[#388bfd] text-white font-semibold transition-colors cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isSpinning ? 'Spinning...' : 'Spin Practice Wheel'}</span>
        </button>
      </div>

      {/* Main Wheel View */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
        {/* SVG Roulette Wheel */}
        <div className="relative w-[240px] h-[240px] flex items-center justify-center">
          {/* Top Pointer Needle */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
            <div className="w-3.5 h-3.5 bg-[#f85149] rotate-45 transform origin-center shadow-lg" />
          </div>

          {/* Rotating SVG */}
          <svg
            viewBox="0 0 280 280"
            className="w-full h-full transform transition-transform duration-[1500ms] ease-out drop-shadow-md"
            style={{ transform: `rotate(${spinAngle}deg)` }}
          >
            {slices.map((slice) => {
              const isSelected = selectedSlice?.idx === slice.idx;
              return (
                <path
                  key={slice.idx}
                  d={describeArc(140, 140, 130, slice.startAngle, slice.endAngle)}
                  fill={slice.color}
                  stroke={isSelected ? '#ffffff' : '#0d1117'}
                  strokeWidth={isSelected ? 3 : 1}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedSlice(slice)}
                />
              );
            })}

            {/* Inner Hub */}
            <circle cx="140" cy="140" r="32" fill="#161b22" stroke="#30363d" strokeWidth="2" />
            <text
              x="140"
              y="144"
              fill="#f0f6fc"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              GA
            </text>
          </svg>
        </div>

        {/* Selected Parent Result Box */}
        <div className="w-full sm:w-60 bg-[#0d1117] border border-[#30363d] rounded-lg p-3 space-y-2 font-mono">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8b949e] uppercase font-bold tracking-wider">
            <Award className="w-3.5 h-3.5 text-[#d29922]" />
            <span>Chosen Parent</span>
          </div>

          {selectedSlice ? (
            <div className="space-y-1">
              <div className="text-base font-bold text-[#3fb950]">
                Individual #{selectedSlice.idx + 1}
              </div>
              <div className="text-xs text-[#f0f6fc]">
                Fitness: <strong>{selectedSlice.ind.fitness}</strong>
              </div>
              <div className="text-xs text-[#58a6ff]">
                Wheel Slice: <strong>{selectedSlice.percent}%</strong>
              </div>
              <div className="text-[10px] text-[#8b949e] pt-1">
                Probability p_i = {selectedSlice.prob.toFixed(4)}
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-[#8b949e]">
              Click "Spin Practice Wheel" or advance the simulation to see the wheel select a parent!
            </div>
          )}
        </div>
      </div>

      {/* Unrolled Cumulative Probability Bar (Goldberg 1989) */}
      <div className="space-y-1 font-mono text-[11px]">
        <div className="flex justify-between text-[#8b949e]">
          <span>Unrolled Probability Bar [0.0 → 1.0]:</span>
          <span>∑ p_i = 100%</span>
        </div>
        <div className="h-4 w-full bg-[#0d1117] border border-[#30363d] rounded flex overflow-hidden">
          {slices.map((slice) => (
            <div
              key={slice.idx}
              style={{ width: `${slice.percent}%`, backgroundColor: slice.color }}
              className={`h-full transition-opacity cursor-pointer ${
                selectedSlice?.idx === slice.idx ? 'ring-2 ring-white z-10' : 'opacity-85 hover:opacity-100'
              }`}
              title={`Individual #${slice.idx + 1}: ${slice.percent}% (Fitness: ${slice.ind.fitness})`}
              onClick={() => setSelectedSlice(slice)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
