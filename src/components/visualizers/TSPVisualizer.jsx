import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Trash2 } from 'lucide-react';

export function TSPVisualizer({ theme = 'dark', gaState, cities, onAddCity, onResetCities, isStoryMode }) {
  const canvasRef = useRef(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [mousePos, setMousePos] = useState(null);

  const bestDistance = gaState.bestIndividual?.phenotype?.distance || 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const isLight = theme === 'light';

    // Solid background
    ctx.fillStyle = isLight ? '#ffffff' : '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines (standard VisuAlgo style)
    ctx.strokeStyle = isLight ? '#f0f2f5' : '#161b22';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const best = gaState.bestIndividual;

    // 1. Draw faint population sample routes
    if (gaState.population && gaState.population.length > 1) {
      ctx.lineWidth = 1;
      const ghostCount = Math.min(4, gaState.population.length);
      for (let g = 1; g < ghostCount; g++) {
        const ind = gaState.population[g];
        ctx.strokeStyle = isLight ? '#d0d7de' : '#21262d';
        ctx.beginPath();
        for (let i = 0; i < ind.genes.length; i++) {
          const c1 = cities[ind.genes[i]];
          const c2 = cities[ind.genes[(i + 1) % ind.genes.length]];
          if (c1 && c2) {
            ctx.moveTo(c1.x, c1.y);
            ctx.lineTo(c2.x, c2.y);
          }
        }
        ctx.stroke();
      }
    }

    // 2. Draw best tour in solid green
    if (best && best.genes && cities.length > 1) {
      ctx.strokeStyle = isLight ? '#1a7f37' : '#3fb950';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < best.genes.length; i++) {
        const c1 = cities[best.genes[i]];
        const c2 = cities[best.genes[(i + 1) % best.genes.length]];
        if (c1 && c2) {
          if (i === 0) ctx.moveTo(c1.x, c1.y);
          ctx.lineTo(c2.x, c2.y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 3. Draw city nodes
    cities.forEach((city, idx) => {
      const isStart = best && best.genes && best.genes[0] === idx;
      const isHovered = hoveredCity === idx;

      ctx.beginPath();
      ctx.arc(city.x, city.y, isHovered ? 11 : 9, 0, Math.PI * 2);
      ctx.fillStyle = isStart ? (isLight ? '#9a6700' : '#d29922') : (isLight ? '#0969da' : '#1f6feb');
      ctx.fill();
      ctx.strokeStyle = isLight ? '#ffffff' : '#f0f6fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Clean label
      ctx.font = '600 11px -apple-system, sans-serif';
      ctx.fillStyle = isLight ? '#1f2328' : '#f0f6fc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(city.label || `C${idx}`, city.x, city.y - 12);
    });

  }, [gaState, cities, hoveredCity, theme]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tooClose = cities.some(c => Math.hypot(c.x - x, c.y - y) < 25);
    if (!tooClose && x >= 20 && x <= rect.width - 20 && y >= 25 && y <= rect.height - 20) {
      onAddCity(x, y);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161b22] rounded border border-[#30363d] p-3">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2 border-b border-[#30363d] text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#58a6ff]" />
          <span className="font-semibold text-[#f0f6fc]">
            2D Coordinate Euclidean Space ({cities.length} Cities)
          </span>
          <span className="text-[#8b949e] hidden sm:inline">
            · Click canvas to add custom vertices
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#0d1117] border border-[#30363d] px-2.5 py-1 rounded font-mono text-xs">
            <span className="text-[#8b949e]">Tour Length: </span>
            <span className="text-[#3fb950] font-bold">{bestDistance} px</span>
          </div>

          <button
            onClick={onResetCities}
            className="flex items-center gap-1 text-[#8b949e] hover:text-[#f85149] bg-[#21262d] hover:bg-[#30363d] px-2 py-1 rounded transition-colors text-xs font-medium border border-[#30363d]"
            title="Reset to default 8-node configuration"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Nodes</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 min-h-[350px] rounded overflow-hidden border border-[#30363d] cursor-crosshair">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePos({
              x: Math.round(e.clientX - rect.left),
              y: Math.round(e.clientY - rect.top)
            });
          }}
          onMouseLeave={() => setMousePos(null)}
          className="w-full h-full block"
        />

        {/* Legend & Mouse Readout */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="bg-[#161b22] border border-[#30363d] px-2.5 py-1 rounded text-[11px] font-mono text-[#8b949e] flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]"></span> Best Tour
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#21262d] border border-[#30363d]"></span> Population Samples
            </span>
          </div>

          {mousePos && (
            <div className="bg-[#0d1117] border border-[#30363d] px-2.5 py-1 rounded text-[11px] font-mono text-[#58a6ff]">
              Click to add: ({mousePos.x}, {mousePos.y})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
