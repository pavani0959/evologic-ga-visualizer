import React, { useState } from 'react';
import { MapPin, Plus, Shuffle, RotateCcw, Trash2, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';

export function CityCoordinatesManager({
  theme = 'dark',
  cities = [],
  onUpdateCoord,
  onUpdateLabel,
  onRemoveCity,
  onRandomize,
  onResetDefault,
  onAddCity
}) {
  const [isOpen, setIsOpen] = useState(true);
  const isLight = theme === 'light';

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-sm transition-colors">
      {/* Collapsible Header */}
      <div className="px-4 py-3 bg-[#1c2128] border-b border-[#30363d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#58a6ff]" />
          <span className="font-bold text-xs text-[#f0f6fc]">
            Edit City Locations (X, Y)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#1f6feb]/20 text-[#58a6ff] text-[11px] font-mono font-semibold border border-[#1f6feb]/40">
            {cities.length} Cities
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-[11px] text-[#8b949e] hover:text-[#f0f6fc] px-2 py-1 rounded bg-[#21262d] hover:bg-[#30363d] transition-colors cursor-pointer"
          >
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isOpen ? 'Collapse' : 'Edit (X, Y)'}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-3.5 space-y-3">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#8b949e] text-[11px]">
              Type exact coordinates or click anywhere on the canvas below:
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={onRandomize}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] text-[11px] font-medium transition-colors cursor-pointer"
                title="Scatter cities to random coordinates"
              >
                <Shuffle className="w-3 h-3 text-[#d29922]" />
                <span>Randomize (8)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const x = Math.round(50 + Math.random() * 440);
                  const y = Math.round(50 + Math.random() * 260);
                  onAddCity(x, y);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1f6feb] hover:bg-[#388bfd] text-white text-[11px] font-medium transition-colors cursor-pointer"
                title="Add a new city node"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add City</span>
              </button>

              <button
                type="button"
                onClick={onResetDefault}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f85149] border border-[#30363d] text-[11px] font-medium transition-colors cursor-pointer"
                title="Reset to default 8 Euclidean vertices"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Table of Cities */}
          <div className="overflow-x-auto max-h-[220px] overflow-y-auto border border-[#30363d] rounded-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1c2128] text-[#8b949e] text-[10px] uppercase border-b border-[#30363d] sticky top-0 z-10">
                <tr>
                  <th className="px-2.5 py-1.5 w-8">#</th>
                  <th className="px-2.5 py-1.5">City Label</th>
                  <th className="px-2.5 py-1.5 w-24">X (0-600)</th>
                  <th className="px-2.5 py-1.5 w-24">Y (0-380)</th>
                  <th className="px-2 py-1.5 w-10 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/50 bg-[#0d1117]">
                {cities.map((city, idx) => (
                  <tr key={city.id ?? idx} className="hover:bg-[#161b22] transition-colors">
                    <td className="px-2.5 py-1 text-[#8b949e] text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="px-2.5 py-1">
                      <input
                        type="text"
                        value={city.label || `City ${idx + 1}`}
                        onChange={(e) => onUpdateLabel && onUpdateLabel(idx, e.target.value)}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-[#f0f6fc] text-xs font-sans focus:outline-none focus:border-[#58a6ff]"
                        maxLength={16}
                      />
                    </td>

                    <td className="px-2.5 py-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#8b949e]">X:</span>
                        <input
                          type="number"
                          min="10"
                          max="620"
                          value={city.x}
                          onChange={(e) => onUpdateCoord && onUpdateCoord(idx, Number(e.target.value) || 0, city.y)}
                          className="w-16 bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-[#3fb950] font-bold text-xs focus:outline-none focus:border-[#58a6ff]"
                        />
                      </div>
                    </td>

                    <td className="px-2.5 py-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#8b949e]">Y:</span>
                        <input
                          type="number"
                          min="10"
                          max="400"
                          value={city.y}
                          onChange={(e) => onUpdateCoord && onUpdateCoord(idx, city.x, Number(e.target.value) || 0)}
                          className="w-16 bg-[#161b22] border border-[#30363d] rounded px-1.5 py-0.5 text-[#58a6ff] font-bold text-xs focus:outline-none focus:border-[#58a6ff]"
                        />
                      </div>
                    </td>

                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        disabled={cities.length <= 4}
                        onClick={() => onRemoveCity && onRemoveCity(idx)}
                        className="text-[#8b949e] hover:text-[#f85149] disabled:opacity-20 disabled:hover:text-[#8b949e] p-1 rounded transition-colors cursor-pointer"
                        title={cities.length <= 4 ? 'Minimum 4 cities required for tour' : `Delete ${city.label}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

