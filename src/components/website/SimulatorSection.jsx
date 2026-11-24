import React, { useState, useEffect } from 'react';
import { TSPVisualizer } from '../visualizers/TSPVisualizer.jsx';
import { FunctionVisualizer } from '../visualizers/FunctionVisualizer.jsx';
import { KnapsackVisualizer } from '../visualizers/KnapsackVisualizer.jsx';
import { ChromosomeInspector } from '../panels/ChromosomeInspector.jsx';
import { SelectionWheel } from '../panels/SelectionWheel.jsx';
import { CrossoverCinema } from '../panels/CrossoverCinema.jsx';
import { ConvergenceChart } from '../panels/ConvergenceChart.jsx';
import { CityCoordinatesManager } from '../panels/CityCoordinatesManager.jsx';
import { sounds } from '../../utils/sound.js';
import {
  Play,
  Pause,
  SkipForward,
  FastForward,
  RotateCcw,
  Eye,
  Disc,
  Scissors,
  LineChart,
  Gauge,
  Sliders,
  Award,
  TrendingUp,
  ArrowRight,
  Sparkles,
  MapPin,
  Shuffle,
  Volume2,
  VolumeX
} from 'lucide-react';

export function SimulatorSection({
  theme = 'dark',
  problemId,
  config,
  params,
  customCities,
  gaState,
  isPlaying,
  speedMs,
  isStoryMode,
  setIsPlaying,
  setSpeedMs,
  stepForward,
  stepGeneration,
  resetGA,
  newRandomRun,
  changeProblem,
  updateParam,
  addCity,
  updateCityCoord,
  updateCityLabel,
  removeCity,
  randomizeCities,
  clearCities
}) {
  const [activeTab, setActiveTab] = useState('chromosomes');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking when unmounting
  useEffect(() => {
    return () => {
      sounds.stopSpeaking();
    };
  }, []);

  const handleToggleVoice = () => {
    if (isSpeaking) {
      sounds.stopSpeaking();
      setIsSpeaking(false);
    } else {
      const phaseNum = gaState.phaseNumber || (gaState.stepIndex + 1) || 1;
      const stepKey = gaState.currentStep || 'INITIAL';

      const phaseTexts = {
        INITIAL: `Phase 1: Population Initialization. Generated starting population of randomized candidate solutions across the search space.`,
        EVALUATE: `Phase 2: Fitness Evaluation. Scored candidate solutions using the objective fitness function.`,
        SELECT: `Phase 3: Parent Selection. Sampled parents into the mating pool with probability proportional to fitness.`,
        CROSSOVER: `Phase 4: Crossover Recombination. Paired parent chromosomes and exchanged genetic sequences to synthesize two offspring.`,
        MUTATE: `Phase 5: Mutation. Stochastically perturbed genes to maintain diversity and prevent premature convergence.`,
        ELITISM: `Phase 6: Elitism. Preserved the all-time best champion directly into the next generation.`,
        TERMINATE: `Phase 7: Termination Check. Verified stopping conditions. Next generation cycle is ready.`
      };

      const text = phaseTexts[stepKey] || `Phase ${phaseNum}: ${stepKey}.`;
      setIsSpeaking(true);
      sounds.speak(text, () => {
        setIsSpeaking(false);
      });
    }
  };

  const stats = gaState.stats || { best: 0, avg: 0 };
  const best = gaState.bestIndividual;
  const initialBest = gaState.initialBestIndividual;

  // Initial vs Current values for the comparison card
  let initialDisplayValue = 0;
  let currentDisplayValue = 0;
  let improvementText = '';
  let improvementPercent = '0%';
  let isPositive = false;

  if (problemId === 'tsp') {
    initialDisplayValue = initialBest?.phenotype?.distance || gaState.initialCost || 1500;
    currentDisplayValue = best?.phenotype?.distance || initialDisplayValue;
    const diff = initialDisplayValue - currentDisplayValue;
    isPositive = diff >= 0;
    const pct = initialDisplayValue > 0 ? ((diff / initialDisplayValue) * 100).toFixed(1) : '0';
    improvementPercent = `${pct}%`;
    improvementText = isPositive ? `${diff.toFixed(0)} px shorter route (${pct}% better)` : 'Initial state';
  } else if (problemId === 'knapsack' || problemId === 'worked_knapsack') {
    initialDisplayValue = initialBest?.phenotype?.totalValue || 0;
    currentDisplayValue = best?.phenotype?.totalValue || 0;
    const diff = currentDisplayValue - initialDisplayValue;
    isPositive = diff >= 0;
    const pct = initialDisplayValue > 0 ? ((diff / initialDisplayValue) * 100).toFixed(1) : currentDisplayValue > 0 ? '100' : '0';
    improvementPercent = `+${pct}%`;
    improvementText = diff > 0 ? `+${diff} value gained (+${pct}% better)` : 'Initial state';
  } else {
    initialDisplayValue = initialBest?.phenotype?.fx || 0;
    currentDisplayValue = best?.phenotype?.fx || 0;
    const diff = currentDisplayValue - initialDisplayValue;
    isPositive = diff >= 0;
    const pct = initialDisplayValue > 0 ? ((diff / initialDisplayValue) * 100).toFixed(1) : '0';
    improvementPercent = `+${pct}%`;
    improvementText = diff > 0 ? `+${diff.toFixed(2)} higher peak (+${pct}% better)` : 'Initial state';
  }

  // Friendly best solution label
  const bestDisplay = problemId === 'tsp'
    ? {
        label: `${best?.phenotype?.distance ?? 0} px`,
        sub: 'Total Tour Length'
      }
    : problemId === 'knapsack' || problemId === 'worked_knapsack'
    ? {
        label: `${best?.phenotype?.totalValue ?? 0} Profit`,
        sub: `Weight: ${best?.phenotype?.totalWeight ?? 0} / 15 kg`
      }
    : {
        label: `${best?.phenotype?.fx ?? 0}`,
        sub: `Peak Value at x = ${best?.phenotype?.x ?? 0}`
      };

  return (
    <div className="w-full max-w-[1540px] mx-auto py-3 sm:py-4 px-2.5 sm:px-6 flex-1 flex flex-col gap-3 sm:gap-3.5">

      {/* 1. TOP BAR: Problem Selector & Generation Status */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-2.5 sm:p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
        {/* Problem Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#8b949e]">Problem:</span>
          <div className="inline-flex max-w-full overflow-x-auto scrollbar-none rounded-lg border border-[#30363d] p-0.5 bg-[#0d1117] text-xs">
            <button
              onClick={() => changeProblem && changeProblem('tsp')}
              className={`px-2.5 sm:px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                problemId === 'tsp'
                  ? 'bg-[#1f6feb] text-white font-semibold shadow-sm'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              <span className="hidden sm:inline">Travelling Salesperson (TSP)</span>
              <span className="sm:hidden">TSP</span>
            </button>
            <button
              onClick={() => changeProblem && changeProblem('funcopt')}
              className={`px-2.5 sm:px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                problemId === 'funcopt'
                  ? 'bg-[#1f6feb] text-white font-semibold shadow-sm'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              <span className="hidden sm:inline">Function Optimization</span>
              <span className="sm:hidden">Function Opt</span>
            </button>
            <button
              onClick={() => changeProblem && changeProblem('knapsack')}
              className={`px-2.5 sm:px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                problemId === 'knapsack'
                  ? 'bg-[#1f6feb] text-white font-semibold shadow-sm'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              <span className="hidden sm:inline">0/1 Knapsack</span>
              <span className="sm:hidden">Knapsack</span>
            </button>
          </div>
        </div>

        {/* Current Generation and Phase */}
        <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
          <div className="w-full sm:w-auto bg-[#0d1117] border border-[#30363d] px-2.5 sm:px-3 py-1 rounded-md flex items-center justify-between sm:justify-start gap-2 text-[#c9d1d9]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1f6feb] animate-pulse"></span>
              <span>Gen <strong className="text-[#f0f6fc]">{gaState.generation}</strong> / {params.maxGenerations || 100}</span>
            </div>
            <span className="text-[#58a6ff] font-bold text-[11px] sm:text-xs">· Phase {gaState.phaseNumber || (gaState.stepIndex + 1)}/7 ({gaState.currentStep || 'INITIAL'})</span>
          </div>
        </div>
      </div>

      {/* 2. GENERATION COMPARISON & IMPROVEMENT SHOWCASE */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3 sm:p-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">

          {/* Left: Start (Gen 0) */}
          <div className="w-full sm:w-1/3 bg-[#0d1117] border border-[#30363d] rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider block">
                Starting Solution (Gen 0)
              </span>
              <span className="text-sm sm:text-base font-bold text-[#8b949e] font-mono">
                {problemId === 'tsp' ? `${initialDisplayValue} px` : `${initialDisplayValue}`}
              </span>
            </div>
            <span className="text-xs text-[#6e7681] font-mono">Random Start</span>
          </div>

          {/* Middle: Arrow & Improvement */}
          <div className="flex sm:flex-col items-center justify-center px-2 py-1 sm:py-0 text-center gap-2 sm:gap-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#3fb950] font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#d29922]" />
              <span>{improvementPercent} Better</span>
              <ArrowRight className="w-4 h-4 text-[#3fb950] hidden sm:inline" />
            </div>
            <span className="text-[11px] text-[#8b949e] sm:mt-0.5">
              {improvementText}
            </span>
          </div>

          {/* Right: Current Best */}
          <div className="w-full sm:w-1/3 bg-[#0d1117] border border-[#3fb950]/50 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1 text-[10px] text-[#3fb950] uppercase font-bold tracking-wider">
                <Award className="w-3 h-3 text-[#d29922]" />
                <span>Current Best (Gen {gaState.generation})</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-[#3fb950] font-mono">
                {bestDisplay.label}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#8b949e] block">Average</span>
              <span className="text-xs font-mono text-[#58a6ff] font-bold">{stats.avg}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKBENCH (Split Left Controls & Right Visualizer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">

        {/* LEFT COLUMN: Controls & Settings (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5 min-w-0">

          {/* Card 1: Controls (Play, Step, Reset, Speed) */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3 sm:p-3.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#30363d] text-xs">
              <span className="font-bold text-[#f0f6fc]">Controls</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[11px] font-mono text-[#58a6ff] uppercase font-semibold">
                  Phase {gaState.phaseNumber || (gaState.stepIndex + 1)}/7: {gaState.currentStep || 'INITIAL'}
                </span>
                <button
                  onClick={handleToggleVoice}
                  className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
                    isSpeaking
                      ? 'bg-[#1f6feb]/20 text-[#58a6ff] border-[#1f6feb] animate-pulse'
                      : 'bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] border-[#30363d]'
                  }`}
                  title={isSpeaking ? 'Stop voice explanation' : 'Listen to current phase explanation'}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3 h-3 text-[#f85149]" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 text-[#58a6ff]" />
                      <span>Voice</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Big Start / Pause button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm ${
                isPlaying
                  ? 'bg-[#d29922] hover:bg-[#bb8009] text-[#0d1117]'
                  : 'bg-[#238636] hover:bg-[#2ea043] text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Evolution</span>
                </>
              )}
            </button>

            {/* Step, Reset & New Run buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              <button
                onClick={stepForward}
                disabled={isPlaying}
                className="py-1.5 px-1.5 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm text-xs"
                title="Execute next single phase (1 of 7)"
              >
                <SkipForward className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Step</span>
              </button>

              <button
                onClick={stepGeneration}
                disabled={isPlaying}
                className="py-1.5 px-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                title="Run 1 full generation"
              >
                <FastForward className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Next Gen</span>
              </button>

              <button
                onClick={() => resetGA()}
                className="py-1.5 px-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f85149] border border-[#30363d] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer text-xs"
                title="Reset to Generation 0 (Replay current run from identical starting solution)"
              >
                <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Reset</span>
              </button>

              <button
                onClick={() => newRandomRun && newRandomRun()}
                className="py-1.5 px-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#58a6ff] border border-[#30363d] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer text-xs"
                title="Generate a brand-new random starting population"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#d29922] flex-shrink-0" />
                <span>New Run</span>
              </button>
            </div>

            {/* Speed slider */}
            <div className="flex items-center justify-between text-xs text-[#8b949e] pt-1.5 border-t border-[#30363d]/60 font-mono">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-[#58a6ff] flex-shrink-0" />
                <span>Speed:</span>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-[200px] justify-end">
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={1050 - (speedMs || 300)}
                  onChange={(e) => setSpeedMs(1050 - Number(e.target.value))}
                  className="w-20 sm:w-24 h-1.5 bg-[#30363d] rounded cursor-pointer"
                />
                <span className="w-12 text-right text-[#c9d1d9] font-bold">
                  {speedMs || 300}ms
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Edit City Locations (Only for TSP) */}
          {problemId === 'tsp' && (
            <CityCoordinatesManager
              theme={theme}
              cities={customCities}
              onUpdateCoord={updateCityCoord}
              onUpdateLabel={updateCityLabel}
              onRemoveCity={removeCity}
              onRandomize={randomizeCities}
              onResetDefault={clearCities}
              onAddCity={addCity}
            />
          )}

          {/* Card 3: Settings (Population Size, Crossover, Mutation, Selection) */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3 sm:p-3.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#30363d] text-xs">
              <span className="font-bold text-[#f0f6fc]">Settings</span>
              <button
                onClick={() => resetGA(problemId, config.defaultParams, customCities)}
                className="text-[11px] text-[#8b949e] hover:text-[#f0f6fc] transition-colors cursor-pointer"
              >
                Reset Defaults
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Population Size */}
              <div>
                <div className="flex justify-between text-[#8b949e] mb-1">
                  <span>Population Size:</span>
                  <span className="font-mono text-[#f0f6fc] font-bold">{params.popSize}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="2"
                  value={params.popSize}
                  onChange={(e) => {
                    updateParam('popSize', Number(e.target.value));
                    resetGA(problemId, { ...params, popSize: Number(e.target.value) }, customCities);
                  }}
                  className="w-full h-1 bg-[#30363d] rounded cursor-pointer"
                />
              </div>

              {/* Crossover Rate */}
              <div>
                <div className="flex justify-between text-[#8b949e] mb-1">
                  <span>Crossover Chance:</span>
                  <span className="font-mono text-[#3fb950] font-bold">{(params.crossoverRate * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.0"
                  step="0.05"
                  value={params.crossoverRate}
                  onChange={(e) => updateParam('crossoverRate', Number(e.target.value))}
                  className="w-full h-1 bg-[#30363d] rounded cursor-pointer"
                />
              </div>

              {/* Mutation Rate */}
              <div>
                <div className="flex justify-between text-[#8b949e] mb-1">
                  <span>Mutation Chance:</span>
                  <span className="font-mono text-[#d29922] font-bold">{(params.mutationRate * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.005"
                  max="0.20"
                  step="0.005"
                  value={params.mutationRate}
                  onChange={(e) => updateParam('mutationRate', Number(e.target.value))}
                  className="w-full h-1 bg-[#30363d] rounded cursor-pointer"
                />
              </div>

              {/* Selection Method */}
              <div>
                <span className="text-[#8b949e] block mb-1">Selection Method:</span>
                <select
                  value={params.selectionMethod || 'roulette'}
                  onChange={(e) => updateParam('selectionMethod', e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] text-[#f0f6fc] text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-[#58a6ff] cursor-pointer"
                >
                  <option value="roulette">Roulette Wheel (Fitness-Proportional)</option>
                  <option value="sus">Stochastic Universal Sampling (SUS)</option>
                  <option value="tournament">Tournament Selection</option>
                  <option value="rank">Linear Rank Selection</option>
                </select>

                {/* Tournament Size (k) selector */}
                {params.selectionMethod === 'tournament' && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[#8b949e] text-[11px]">Tournament Size (k):</span>
                    <div className="flex items-center gap-1 font-mono">
                      {[2, 3, 4].map((kVal) => (
                        <button
                          key={kVal}
                          type="button"
                          onClick={() => updateParam('tournamentSize', kVal)}
                          className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                            (params.tournamentSize || 3) === kVal
                              ? 'bg-[#1f6feb] text-white font-bold'
                              : 'bg-[#0d1117] text-[#8b949e] border border-[#30363d]'
                          }`}
                        >
                          k={kVal}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Elitism count with clear explanation */}
              <div className="pt-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#8b949e]">Elitism (Protect Best):</span>
                  <div className="flex items-center gap-1 font-mono">
                    {[0, 1, 2].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => updateParam('elitism', num)}
                        className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                          params.elitism === num
                            ? 'bg-[#1f6feb] text-white font-bold'
                            : 'bg-[#0d1117] text-[#8b949e] border border-[#30363d]'
                        }`}
                      >
                        {num === 0 ? 'Off' : `Keep ${num}`}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-[#8b949e] leading-tight">
                  Guarantees the top {params.elitism > 0 ? `${params.elitism} ` : ''}solution is carried into the next generation so your best score never gets lost.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visualizer Stage & Tabs (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3.5 min-w-0">

          {/* Visualizer Stage */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="px-3 sm:px-4 py-2 bg-[#1c2128] border-b border-[#30363d] flex items-center justify-between text-xs">
              <span className="font-bold text-[#f0f6fc] truncate">
                Visualizer: {config.title}
              </span>
              <span className="text-[11px] font-mono text-[#8b949e] hidden sm:inline">
                {problemId === 'tsp' ? 'Click canvas to add cities' : problemId === 'knapsack' ? 'Item packing binary bits' : 'Continuous fitness landscape'}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 bg-[#0d1117] flex-1 flex flex-col justify-center min-h-[300px] sm:min-h-[360px]">
              {problemId === 'tsp' && (
                <TSPVisualizer
                  theme={theme}
                  gaState={gaState}
                  cities={customCities}
                  onAddCity={addCity}
                  onResetCities={clearCities}
                  isStoryMode={isStoryMode}
                />
              )}
              {(problemId === 'funcopt' || problemId === 'worked_fx2' || problemId === 'worked_quad') && (
                <FunctionVisualizer theme={theme} gaState={gaState} isStoryMode={isStoryMode} />
              )}
              {(problemId === 'knapsack' || problemId === 'worked_knapsack') && (
                <KnapsackVisualizer theme={theme} gaState={gaState} isStoryMode={isStoryMode} />
              )}
            </div>
          </div>

          {/* Analytical Inspection Tabs (Population, Selection Wheel, Crossover, Progress Chart) */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden flex flex-col shadow-sm">
            {/* Tabs Header */}
            <div className="flex items-center border-b border-[#30363d] bg-[#1c2128] px-2 py-1 gap-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('chromosomes')}
                className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 text-xs rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'chromosomes'
                    ? 'bg-[#1f6feb] text-white font-semibold shadow-sm'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Population ({gaState.population.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('wheel')}
                className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 text-xs rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'wheel'
                    ? 'bg-[#1f6feb] text-white font-semibold shadow-sm'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                <Disc className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Selection Wheel</span>
              </button>

              <button
                onClick={() => setActiveTab('crossover')}
                className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 text-xs rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'crossover'
                    ? 'bg-[#1f6feb] text-white font-semibold shadow-sm'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">Crossover & Mutation</span>
                <span className="sm:hidden">Crossover</span>
              </button>

              <button
                onClick={() => setActiveTab('chart')}
                className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 text-xs rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'chart'
                    ? 'bg-[#1f6feb] text-white font-semibold shadow-sm'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                <LineChart className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Fitness Chart</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-2.5 sm:p-3 max-h-[440px] overflow-y-auto bg-[#161b22]">
              {activeTab === 'chromosomes' && (
                <ChromosomeInspector
                  gaState={gaState}
                  config={config}
                  contextData={customCities}
                  isStoryMode={isStoryMode}
                />
              )}

              {activeTab === 'wheel' && (
                <SelectionWheel
                  theme={theme}
                  gaState={gaState}
                  config={config}
                  params={params}
                />
              )}

              {activeTab === 'crossover' && (
                <CrossoverCinema
                  crossoverRecord={gaState.crossoverRecord}
                  mutationRecord={gaState.mutationRecord}
                  config={config}
                  isStoryMode={isStoryMode}
                />
              )}

              {activeTab === 'chart' && (
                <ConvergenceChart theme={theme} history={gaState.history} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
