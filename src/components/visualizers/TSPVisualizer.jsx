import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MapPin, Trash2 } from 'lucide-react';

export function TSPVisualizer({ theme = 'dark', gaState, cities, onAddCity, onResetCities, isStoryMode }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [canvasDim, setCanvasDim] = useState({ width: 600, height: 350 });

  const bestDistance = gaState.bestIndividual?.phenotype?.distance || 0;

  // Base reference coordinate domain
  const baseW = 600;
  const baseH = 380;
  const pad = 24;

  const getTransform = useCallback((w, h) => {
    const maxCityX = Math.max(520, ...cities.map(c => c.x || 0));
    const maxCityY = Math.max(320, ...cities.map(c => c.y || 0));
    const domainW = Math.max(baseW, maxCityX + 40);
    const domainH = Math.max(baseH, maxCityY + 40);

    const availW = Math.max(100, w - pad * 2);
    const availH = Math.max(100, h - pad * 2);

    const scale = Math.min(availW / domainW, availH / domainH);
    const offsetX = pad + (availW - domainW * scale) / 2;
    const offsetY = pad + (availH - domainH * scale) / 2;

    return { scale, offsetX, offsetY, domainW, domainH };
  }, [cities]);

  // Window / container resize observer to keep canvas sharp & responsive on all viewports
  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasDim({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvasDim.width;
    const height = rect.height || canvasDim.height;
    if (width <= 0 || height <= 0) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const isLight = theme === 'light';

    // Solid background
    ctx.fillStyle = isLight ? '#ffffff' : '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Subtle responsive grid lines
    ctx.strokeStyle = isLight ? '#f0f2f5' : '#161b22';
    ctx.lineWidth = 1;
    const gridStep = Math.max(25, Math.min(40, Math.round(width / 15)));
    for (let x = 0; x < width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const { scale, offsetX, offsetY } = getTransform(width, height);
    const toScreenX = (vx) => offsetX + vx * scale;
    const toScreenY = (vy) => offsetY + vy * scale;

    const best = gaState.bestIndividual;

    // 1. Draw faint population sample routes
    if (gaState.population && gaState.population.length > 1) {
      ctx.lineWidth = Math.max(1, 1 * scale);
      const ghostCount = Math.min(4, gaState.population.length);
      for (let g = 1; g < ghostCount; g++) {
        const ind = gaState.population[g];
        ctx.strokeStyle = isLight ? '#d0d7de' : '#21262d';
        ctx.beginPath();
        for (let i = 0; i < ind.genes.length; i++) {
          const c1 = cities[ind.genes[i]];
          const c2 = cities[ind.genes[(i + 1) % ind.genes.length]];
          if (c1 && c2) {
            ctx.moveTo(toScreenX(c1.x), toScreenY(c1.y));
            ctx.lineTo(toScreenX(c2.x), toScreenY(c2.y));
          }
        }
        ctx.stroke();
      }
    }

    // 2. Draw best tour in solid green
    if (best && best.genes && cities.length > 1) {
      ctx.strokeStyle = isLight ? '#1a7f37' : '#3fb950';
      ctx.lineWidth = Math.max(2, 2.5 * Math.min(1.2, scale));
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < best.genes.length; i++) {
        const c1 = cities[best.genes[i]];
        const c2 = cities[best.genes[(i + 1) % best.genes.length]];
        if (c1 && c2) {
          const sx1 = toScreenX(c1.x);
          const sy1 = toScreenY(c1.y);
          const sx2 = toScreenX(c2.x);
          const sy2 = toScreenY(c2.y);
          if (i === 0) ctx.moveTo(sx1, sy1);
          ctx.lineTo(sx2, sy2);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 3. Draw city nodes
    const cityRadius = Math.max(7, Math.min(10, 8 * Math.sqrt(scale)));
    cities.forEach((city, idx) => {
      const isStart = best && best.genes && best.genes[0] === idx;
      const isHovered = hoveredCity === idx;
      const sx = toScreenX(city.x);
      const sy = toScreenY(city.y);
      const rad = isHovered ? cityRadius + 3 : cityRadius;

      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, Math.PI * 2);
      ctx.fillStyle = isStart ? (isLight ? '#9a6700' : '#d29922') : (isLight ? '#0969da' : '#1f6feb');
      ctx.fill();
      ctx.strokeStyle = isLight ? '#ffffff' : '#f0f6fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Clean responsive label
      ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = isLight ? '#1f2328' : '#f0f6fc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(city.label || `C${idx}`, sx, sy - rad - 2);
    });

  }, [gaState, cities, hoveredCity, theme, canvasDim, getTransform]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const { scale, offsetX, offsetY, domainW, domainH } = getTransform(rect.width, rect.height);
    const virtX = Math.round((clickX - offsetX) / scale);
    const virtY = Math.round((clickY - offsetY) / scale);

    if (virtX >= 10 && virtX <= domainW - 10 && virtY >= 10 && virtY <= domainH - 10) {
      const tooClose = cities.some(c => Math.hypot(c.x - virtX, c.y - virtY) < 25);
      if (!tooClose) {
        onAddCity(virtX, virtY);
      }
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const { scale, offsetX, offsetY } = getTransform(rect.width, rect.height);
    const virtX = Math.round((clickX - offsetX) / scale);
    const virtY = Math.round((clickY - offsetY) / scale);

    const hovered = cities.findIndex(c => {
      const sx = offsetX + c.x * scale;
      const sy = offsetY + c.y * scale;
      return Math.hypot(sx - clickX, sy - clickY) <= 14;
    });
    setHoveredCity(hovered !== -1 ? hovered : null);

    if (virtX >= 0 && virtX <= 620 && virtY >= 0 && virtY <= 400) {
      setMousePos({ x: virtX, y: virtY });
    } else {
      setMousePos(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161b22] rounded border border-[#30363d] p-2.5 sm:p-3">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 sm:pb-2.5 mb-2 border-b border-[#30363d] text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <MapPin className="w-4 h-4 text-[#58a6ff] flex-shrink-0" />
          <span className="font-semibold text-[#f0f6fc]">
            2D Coordinate Space ({cities.length} Cities)
          </span>
          <span className="text-[#8b949e] hidden sm:inline text-[11px]">
            · Click canvas to add custom vertices
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="bg-[#0d1117] border border-[#30363d] px-2 sm:px-2.5 py-1 rounded font-mono text-xs">
            <span className="text-[#8b949e]">Tour: </span>
            <span className="text-[#3fb950] font-bold">{bestDistance} px</span>
          </div>

          <button
            onClick={onResetCities}
            className="flex items-center gap-1 text-[#8b949e] hover:text-[#f85149] bg-[#21262d] hover:bg-[#30363d] px-2 py-1 rounded transition-colors text-xs font-medium border border-[#30363d] cursor-pointer"
            title="Reset to default 8-node configuration"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[260px] sm:min-h-[350px] rounded overflow-hidden border border-[#30363d] cursor-crosshair touch-manipulation"
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setMousePos(null);
            setHoveredCity(null);
          }}
          className="w-full h-full block"
        />

        {/* Legend & Mouse Readout */}
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-2.5 sm:left-3 sm:right-3 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
          <div className="bg-[#161b22]/90 backdrop-blur-sm border border-[#30363d] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono text-[#8b949e] flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1 sm:gap-1.5">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#3fb950]"></span> Best Tour
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#21262d] border border-[#30363d]"></span> Samples
            </span>
          </div>

          {mousePos && (
            <div className="bg-[#0d1117]/90 backdrop-blur-sm border border-[#30363d] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono text-[#58a6ff]">
              ({mousePos.x}, {mousePos.y})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
