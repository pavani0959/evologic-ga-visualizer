import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, Shuffle, GitMerge, Zap, ShieldCheck, CheckCircle2, PlayCircle, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../../utils/sound.js';

export function StagesSection({ onNavigate }) {
  const [speakingNum, setSpeakingNum] = useState(null);

  useEffect(() => {
    return () => {
      sounds.stopSpeaking();
    };
  }, []);

  const handleToggleVoice = (step) => {
    if (speakingNum === step.num) {
      sounds.stopSpeaking();
      setSpeakingNum(null);
    } else {
      sounds.stopSpeaking();
      setSpeakingNum(step.num);
      const speechText = `Phase ${step.num}: ${step.name}. ${step.summary} Mechanism: ${step.mechanism}`;
      sounds.speak(speechText, () => {
        setSpeakingNum(null);
      });
    }
  };

  const steps = [
    {
      num: 1,
      name: 'Population Initialization',
      icon: Sparkles,
      color: '#58a6ff',
      summary: 'Generates an initial population of N candidate chromosomes randomly distributed across the search space to begin optimization.',
      mechanism: 'Uniform random sampling across search hyperspace Ω with unbiased allele distribution.',
      formula: '|Ω| = 2^L  or  (N - 1)! / 2'
    },
    {
      num: 2,
      name: 'Fitness Evaluation',
      icon: Activity,
      color: '#3fb950',
      summary: 'Evaluates each candidate solution using the objective fitness function to determine its performance quality.',
      mechanism: 'Decodes genotype into phenotype and evaluates scalar objective score fit(x).',
      formula: 'f_i = fit(C_i) > 0'
    },
    {
      num: 3,
      name: 'Parent Selection',
      icon: Shuffle,
      color: '#d29922',
      summary: 'Samples parent chromosomes into the mating pool with selection probability proportional to relative fitness.',
      mechanism: 'Fitness-proportionate sampling via Roulette Wheel, Stochastic Universal Sampling, or Tournament.',
      formula: 'p_i = f_i / ∑ f_j'
    },
    {
      num: 4,
      name: 'Crossover (Recombination)',
      icon: GitMerge,
      color: '#bc8cff',
      summary: 'Pairs parent chromosomes and exchanges genetic sub-sequences at crossover rate p_c to synthesize two offspring.',
      mechanism: 'Recombines building blocks from both parents to produce two complementary offspring chromosomes.',
      formula: 'P_surv(H) ≥ 1 - p_c · [δ(H) / (L - 1)]'
    },
    {
      num: 5,
      name: 'Mutation',
      icon: Zap,
      color: '#ff7b72',
      summary: 'Stochastically perturbs individual gene alleles at mutation rate p_m to maintain diversity and prevent premature convergence.',
      mechanism: 'Per-locus bit-flips or pairwise allele swaps restoring search ergodicity.',
      formula: 'p_m ∈ [0.01, 0.05] per locus'
    },
    {
      num: 6,
      name: 'Elitism (Survivor Selection)',
      icon: ShieldCheck,
      color: '#2ea043',
      summary: 'Preserves the top E champion solutions directly into the next generation, guaranteeing discovered progress is never lost.',
      mechanism: 'Deterministic preservation ensuring monotonic fitness progress: f_max(t+1) ≥ f_max(t).',
      formula: 'f_max(t+1) ≥ f_max(t)'
    },
    {
      num: 7,
      name: 'Termination & Convergence Check',
      icon: CheckCircle2,
      color: '#58a6ff',
      summary: 'Verifies stopping criteria to halt the evolutionary loop once an optimal solution or generation limit is attained.',
      mechanism: 'Halting check evaluating maximum generation bound T_max or stagnation threshold Δf < ε.',
      formula: 't ≥ T_max  ∨  Δf < ε'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 sm:p-5 shadow-sm">
        <h2 className="text-base sm:text-lg font-bold text-[#f0f6fc] mb-1">
          Genetic Algorithm Lifecycle
        </h2>
        <p className="text-xs text-[#8b949e] leading-relaxed max-w-3xl">
          Every generation executes this seven-stage evolutionary cycle. Fitter candidate solutions are
          selected, recombined, and preserved, enabling convergence toward optimal solutions across complex search spaces.
        </p>
      </div>

      {/* 7 Canonical Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className="bg-[#161b22] border border-[#30363d] rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-sm hover:border-[#58a6ff]/50 transition-colors"
            >
              <div>
                {/* Stage header */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
                      style={{ backgroundColor: `${s.color}20`, color: s.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8b949e] font-mono font-bold uppercase block">
                        Phase {s.num} of 7
                      </span>
                      <h3 className="font-bold text-sm text-[#f0f6fc]">
                        {s.name}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleVoice(s)}
                    className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer flex items-center gap-1 flex-shrink-0 ${
                      speakingNum === s.num
                        ? 'bg-[#1f6feb]/20 text-[#58a6ff] border-[#1f6feb] animate-pulse'
                        : 'bg-[#0d1117] text-[#8b949e] hover:text-[#f0f6fc] border-[#30363d]'
                    }`}
                    title={speakingNum === s.num ? 'Stop voice' : `Listen to Phase ${s.num}`}
                  >
                    {speakingNum === s.num ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-[#f85149]" />
                        <span className="text-[10px]">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-[#58a6ff]" />
                        <span className="text-[10px]">Listen</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Explanation */}
                <p className="text-xs text-[#c9d1d9] mb-3 leading-relaxed">
                  {s.summary}
                </p>

                {/* Mechanism Box */}
                <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d] text-[11px] text-[#8b949e] mb-3">
                  <strong className="text-[#f0f6fc] block mb-0.5">Mechanism:</strong>
                  {s.mechanism}
                </div>
              </div>

              {/* Formula Footer */}
              <div className="pt-2 border-t border-[#30363d]/60 flex items-center justify-between text-[11px] font-mono text-[#58a6ff] gap-2 flex-wrap">
                <span className="text-[#8b949e]">Formulation:</span>
                <span className="bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d] text-[#3fb950] font-bold text-[10px] sm:text-[11px] break-all">
                  {s.formula}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Return to Simulator Action */}
      {onNavigate && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => onNavigate('workbench')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1f6feb] hover:bg-[#388bfd] text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Open Simulator</span>
          </button>
        </div>
      )}
    </div>
  );
}
