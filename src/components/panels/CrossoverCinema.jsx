import React from 'react';
import { Scissors, ArrowDown, Zap, Sparkles } from 'lucide-react';

export function CrossoverCinema({ crossoverRecord, mutationRecord, config }) {
  if (!crossoverRecord) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-[#8b949e] bg-[#161b22] rounded-lg border border-[#30363d]">
        <Scissors className="w-8 h-8 text-[#58a6ff] mb-2 animate-pulse" />
        <p className="text-xs font-bold text-[#f0f6fc]">Crossover & Mutation</p>
        <p className="text-[11px] text-[#8b949e] mt-1 max-w-sm">
          Run the simulation or click <strong className="text-[#58a6ff]">Step</strong> to see two parents recombine and create two offspring!
        </p>
      </div>
    );
  }

  const { parent1, parent2, child1, child2, point, method } = crossoverRecord;

  // Check if any mutation occurred
  const hasMutations = mutationRecord && mutationRecord.length > 0;
  const firstMutation = hasMutations ? mutationRecord[0] : null;

  return (
    <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-3 text-xs flex flex-col gap-3">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-[#58a6ff]" />
          <span className="font-bold text-[#f0f6fc]">
            {method || 'Crossover Recombination'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#8b949e] bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
          {point.point !== undefined
            ? `Cut Point k = ${point.point}`
            : point.mask
            ? `Uniform Mask (${point.mask.length} bits)`
            : `Swath [${point.start ?? 0}, ${point.end ?? 0}]`}
        </span>
      </div>

      {/* PARENTS (2 Parents) */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase font-bold text-[#8b949e] tracking-wider block">
          Selected Parents (Mating Pool)
        </span>

        {/* Parent 1 */}
        <div className="p-2 bg-[#0d1117] rounded border border-[#30363d]">
          <div className="flex justify-between items-center text-[11px] mb-1 font-mono">
            <span className="font-bold text-[#58a6ff]">Parent 1</span>
            <span className="text-[#8b949e]">Fitness: {parent1?.fitness ?? 0}</span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none font-mono">
            {parent1?.genes?.map((g, i) => {
              const isCut = point.point !== undefined ? i === point.point : point.mask ? point.mask[i] === 1 : i === point.start;
              return (
                <div key={i} className="relative flex items-center">
                  {isCut && (
                    <div className="absolute -left-0.5 top-0 bottom-0 w-1 bg-[#f85149] z-10 rounded-full" />
                  )}
                  <span className="w-6 h-6 rounded bg-[#161b22] border border-[#1f6feb] text-[#58a6ff] flex items-center justify-center font-bold text-xs">
                    {g}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Parent 2 */}
        <div className="p-2 bg-[#0d1117] rounded border border-[#30363d]">
          <div className="flex justify-between items-center text-[11px] mb-1 font-mono">
            <span className="font-bold text-[#d29922]">Parent 2</span>
            <span className="text-[#8b949e]">Fitness: {parent2?.fitness ?? 0}</span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none font-mono">
            {parent2?.genes?.map((g, i) => {
              const isCut = point.point !== undefined ? i === point.point : point.mask ? point.mask[i] === 0 : i === point.start;
              return (
                <div key={i} className="relative flex items-center">
                  {isCut && (
                    <div className="absolute -left-0.5 top-0 bottom-0 w-1 bg-[#f85149] z-10 rounded-full" />
                  )}
                  <span className="w-6 h-6 rounded bg-[#161b22] border border-[#d29922] text-[#d29922] flex items-center justify-center font-bold text-xs">
                    {g}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Down arrow icon */}
      <div className="flex items-center justify-center gap-2 py-0.5 text-xs text-[#8b949e] font-mono">
        <ArrowDown className="w-3.5 h-3.5 text-[#3fb950]" />
        <span>2 Parents Exchange DNA → Produce 2 Offspring</span>
        <ArrowDown className="w-3.5 h-3.5 text-[#3fb950]" />
      </div>

      {/* OFFSPRING (Both Offspring 1 and Offspring 2) */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase font-bold text-[#3fb950] tracking-wider block">
          Generated Offspring (Children)
        </span>

        {/* Offspring 1 */}
        {child1 && (
          <div className="p-2 bg-[#0d1117] rounded border border-[#30363d]">
            <div className="flex justify-between items-center text-[11px] mb-1 font-mono">
              <span className="font-bold text-[#3fb950]">Offspring 1</span>
              <span className="text-[#8b949e]">Inherited: Parent 1 + Parent 2</span>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none font-mono">
              {child1.genes.map((g, i) => {
                const fromP1 = point.point !== undefined
                  ? i < point.point
                  : point.mask
                  ? point.mask[i] === 1
                  : (i >= (point.start ?? 0) && i <= (point.end ?? 0));
                return (
                  <span
                    key={i}
                    className={`w-6 h-6 rounded border flex items-center justify-center font-bold text-xs ${
                      fromP1
                        ? 'bg-[#161b22] border-[#1f6feb] text-[#58a6ff]'
                        : 'bg-[#161b22] border-[#d29922] text-[#d29922]'
                    }`}
                    title={fromP1 ? 'Inherited from Parent 1' : 'Inherited from Parent 2'}
                  >
                    {g}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Offspring 2 */}
        {child2 && (
          <div className="p-2 bg-[#0d1117] rounded border border-[#30363d]">
            <div className="flex justify-between items-center text-[11px] mb-1 font-mono">
              <span className="font-bold text-[#3fb950]">Offspring 2</span>
              <span className="text-[#8b949e]">Inherited: Parent 2 + Parent 1</span>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none font-mono">
              {child2.genes.map((g, i) => {
                const fromP2 = point.point !== undefined
                  ? i < point.point
                  : point.mask
                  ? point.mask[i] === 0
                  : (i >= (point.start ?? 0) && i <= (point.end ?? 0));
                return (
                  <span
                    key={i}
                    className={`w-6 h-6 rounded border flex items-center justify-center font-bold text-xs ${
                      fromP2
                        ? 'bg-[#161b22] border-[#d29922] text-[#d29922]'
                        : 'bg-[#161b22] border-[#1f6feb] text-[#58a6ff]'
                    }`}
                    title={fromP2 ? 'Inherited from Parent 2' : 'Inherited from Parent 1'}
                  >
                    {g}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MUTATION EVENT SHOWCASE */}
      {hasMutations && (
        <div className="p-2.5 bg-[#0d1117] rounded border border-[#d29922]/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#d29922]" />
            <span className="text-[#f0f6fc] font-semibold">
              Random Mutation Event:
            </span>
            <span className="text-[#8b949e]">
              Perturbed {firstMutation?.mutatedPositions?.length || 1} gene position(s) at locus #{firstMutation?.mutatedPositions?.[0] ?? 0}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#d29922]/20 text-[#d29922] font-mono text-[11px] font-bold">
            p_m active
          </span>
        </div>
      )}
    </div>
  );
}
