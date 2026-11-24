import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

export function TutorialModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Genetic Algorithm Optimization Mechanics',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-[#c9d1d9]">
          <p>
            A <strong>Genetic Algorithm (GA)</strong> is an iterative heuristic optimization method inspired by natural evolution:
          </p>
          <div className="space-y-2 bg-[#0d1117] border border-[#30363d] p-3 rounded">
            <div>
              <strong>1. Initialization:</strong> Generates a diverse initial pool of candidate solutions distributed across the problem space.
            </div>
            <div>
              <strong>2. Recombination (Crossover):</strong> Selects higher-fitness solutions and recombines their building blocks to form offspring.
            </div>
            <div>
              <strong>3. Mutation:</strong> Applies small stochastic perturbations to maintain diversity and avoid local optima.
            </div>
          </div>
          <p className="text-[#3fb950] font-semibold">
            Across successive generations, the population progressively converges toward optimal solutions.
          </p>
        </div>
      )
    },
    {
      title: 'Why Brute-Force Search Fails (Combinatorial Explosion)',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-[#c9d1d9]">
          <p>
            Consider a Travelling Salesman Problem with <strong>15 cities</strong>:
          </p>
          <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded font-mono text-[#f0f6fc]">
            <div>15! = 15 × 14 × 13 × ... × 1 = 1,307,674,368,000 routes</div>
            <div className="text-[11px] text-[#8b949e] mt-1 font-sans">
              Checking all 1.3 trillion combinations would take years on a typical CPU.
            </div>
          </div>
          <p>
            Genetic algorithms sample only a tiny fraction of the search space, using recombination to discard bad sub-tours and discover near-optimal solutions in milliseconds.
          </p>
        </div>
      )
    },
    {
      title: 'The Six Algorithmic Lifecycle Phases',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-[#0d1117] p-2 rounded border border-[#30363d]">
            <div className="font-bold text-[#58a6ff]">1. Initialize</div>
            <div className="text-[11px] text-[#8b949e]">Generate randomized candidate chromosomes.</div>
          </div>
          <div className="bg-[#0d1117] p-2 rounded border border-[#30363d]">
            <div className="font-bold text-[#d29922]">2. Evaluate</div>
            <div className="text-[11px] text-[#8b949e]">Score candidates with objective fitness function.</div>
          </div>
          <div className="bg-[#0d1117] p-2 rounded border border-[#30363d]">
            <div className="font-bold text-[#bc8cff]">3. Select</div>
            <div className="text-[11px] text-[#8b949e]">Pick mating parents biased by relative fitness.</div>
          </div>
          <div className="bg-[#0d1117] p-2 rounded border border-[#30363d]">
            <div className="font-bold text-[#f0883e]">4. Crossover</div>
            <div className="text-[11px] text-[#8b949e]">Recombine parent DNA at designated cut points.</div>
          </div>
          <div className="bg-[#0d1117] p-2 rounded border border-[#30363d]">
            <div className="font-bold text-[#f85149]">5. Mutate</div>
            <div className="text-[11px] text-[#8b949e]">Introduce stochastic bit flips to avoid local traps.</div>
          </div>
          <div className="bg-[#0d1117] p-2 rounded border border-[#30363d]">
            <div className="font-bold text-[#3fb950]">6. Elitism</div>
            <div className="text-[11px] text-[#8b949e]">Preserve best solution into the next epoch.</div>
          </div>
        </div>
      )
    },
    {
      title: 'Controls & Interaction Overview',
      content: (
        <div className="space-y-2 text-xs text-[#c9d1d9]">
          <p>You can interact with every parameter in the simulation:</p>
          <ul className="space-y-1.5 list-disc list-inside text-[#8b949e]">
            <li><strong>Run Evolution:</strong> Starts continuous generation advancement.</li>
            <li><strong>Step Phase:</strong> Moves through each phase individually for detailed inspection.</li>
            <li><strong>Add Custom Cities:</strong> Click directly on the TSP canvas to place new nodes.</li>
            <li><strong>Hyperparameters:</strong> Modify population size, mutation rate, and selection method.</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-lg max-h-[90vh] shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 sm:p-3.5 border-b border-[#30363d] flex items-center justify-between bg-[#1c2128]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono bg-[#21262d] text-[#8b949e] border border-[#30363d] px-2 py-0.5 rounded">
              Step {step + 1} of {slides.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 min-h-[200px] overflow-y-auto">
          <h3 className="text-sm font-bold text-[#f0f6fc] mb-3">
            {slides[step].title}
          </h3>
          {slides[step].content}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-3.5 border-t border-[#30363d] flex items-center justify-between bg-[#1c2128]">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#f0f6fc] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-1">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i === step ? 'bg-[#58a6ff]' : 'bg-[#30363d]'}`}
              />
            ))}
          </div>

          {step < slides.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 bg-[#1f6feb] hover:bg-[#388bfd] text-white px-3 py-1 rounded text-xs font-semibold cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1 bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1 rounded text-xs font-semibold cursor-pointer"
            >
              Start Simulator <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
