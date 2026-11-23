// ============================================================
// Custom React Hook: useGeneticAlgorithm
// Coordinates simulation, audio feedback, confetti, and story mode
// ============================================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { GeneticAlgorithm } from '../engine/GeneticAlgorithm.js';
import { PROBLEMS } from '../engine/problems.js';
import { sounds } from '../utils/sound.js';
import confetti from 'canvas-confetti';

export function useGeneticAlgorithm(initialProblemId = 'tsp') {
  const [problemId, setProblemId] = useState(initialProblemId);
  const [params, setParams] = useState(PROBLEMS[initialProblemId].defaultParams);
  const [customCities, setCustomCities] = useState(PROBLEMS.tsp.defaultCities);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playMode, setPlayMode] = useState('generation'); // 'step' or 'generation'
  const [speedMs, setSpeedMs] = useState(300);
  const [isStoryMode, setIsStoryMode] = useState(true); // Default to beginner-friendly Story Mode!
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    sounds.enabled = soundEnabled;
    if (!soundEnabled) {
      sounds.stopSpeaking();
    }
  }, [soundEnabled]);

  const gaRef = useRef(null);

  const [gaState, setGaState] = useState(() => {
    const ga = new GeneticAlgorithm(initialProblemId, PROBLEMS[initialProblemId].defaultParams, PROBLEMS.tsp.defaultCities);
    ga.initializePopulation();
    gaRef.current = ga;
    return ga.getState();
  });

  const fireConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
      });
    } catch (e) {}
  }, []);

  const resetGA = useCallback((overrideProblemId, overrideParams, overrideCities, forceNewRandom = false) => {
    setIsPlaying(false);

    // If resetGA() is called without arguments, replay the exact same Generation 0 population deterministically!
    const isSimpleReset = !forceNewRandom && !overrideProblemId && !overrideParams && !overrideCities;
    if (isSimpleReset && gaRef.current) {
      gaRef.current.resetToGenerationZero();
      setGaState(gaRef.current.getState());
      return;
    }

    // Guard against React SyntheticEvent or non-string values passed via onClick={resetGA}
    const targetProblem = (typeof overrideProblemId === 'string' && PROBLEMS[overrideProblemId])
      ? overrideProblemId
      : problemId;
    const targetParams = (overrideParams && typeof overrideParams === 'object' && !overrideParams.nativeEvent)
      ? overrideParams
      : params;
    const targetCities = Array.isArray(overrideCities)
      ? overrideCities
      : customCities;

    const newGA = new GeneticAlgorithm(
      targetProblem,
      targetParams,
      targetProblem === 'tsp' ? targetCities : null
    );
    newGA.initializePopulation();
    gaRef.current = newGA;
    setGaState(newGA.getState());
  }, [problemId, params, customCities]);

  const newRandomRun = useCallback(() => {
    resetGA(problemId, params, customCities, true);
  }, [resetGA, problemId, params, customCities]);

  const changeProblem = useCallback((newProbId) => {
    setIsPlaying(false);
    setProblemId(newProbId);
    setParams(PROBLEMS[newProbId].defaultParams);
    resetGA(newProbId, PROBLEMS[newProbId].defaultParams, customCities);
  }, [customCities, resetGA]);

  const stepForward = useCallback(() => {
    if (!gaRef.current) return;
    gaRef.current.isTerminated = false;
    gaRef.current.stepForward();
    const state = gaRef.current.getState();

    if (soundEnabled) {
      if (state.isNewRecord && state.generation > 1) {
        sounds.playRecord();
        fireConfetti();
      } else {
        sounds.playClick();
      }
    }

    setGaState(state);
  }, [soundEnabled, fireConfetti]);

  const stepGeneration = useCallback(() => {
    if (!gaRef.current) return;
    gaRef.current.isTerminated = false;
    gaRef.current.stepFullGeneration();
    const state = gaRef.current.getState();

    if (soundEnabled) {
      if (state.isNewRecord && state.generation > 1) {
        sounds.playRecord();
        fireConfetti();
      } else {
        sounds.playClick();
      }
    }

    setGaState(state);
  }, [soundEnabled, fireConfetti]);

  const updateParam = useCallback((paramKey, value) => {
    setParams(prev => {
      const next = { ...prev, [paramKey]: value };
      if (gaRef.current) {
        gaRef.current.params[paramKey] = value;
      }
      return next;
    });
  }, []);

  const addCity = useCallback((x, y) => {
    if (problemId !== 'tsp') return;
    const letter = String.fromCharCode(65 + (customCities.length % 26));
    const label = `City ${letter}`;

    const nextCities = [...customCities, {
      id: customCities.length,
      label,
      x: Math.round(x),
      y: Math.round(y)
    }];
    setCustomCities(nextCities);
    resetGA('tsp', params, nextCities);
  }, [customCities, problemId, params, resetGA]);

  const updateCityCoord = useCallback((cityIndex, newX, newY) => {
    if (problemId !== 'tsp') return;
    const nextCities = customCities.map((c, i) => {
      if (i === cityIndex) {
        return {
          ...c,
          x: Math.max(10, Math.min(620, Math.round(newX))),
          y: Math.max(10, Math.min(420, Math.round(newY)))
        };
      }
      return c;
    });
    setCustomCities(nextCities);
    resetGA('tsp', params, nextCities);
  }, [customCities, problemId, params, resetGA]);

  const updateCityLabel = useCallback((cityIndex, newLabel) => {
    if (problemId !== 'tsp') return;
    const nextCities = customCities.map((c, i) => {
      if (i === cityIndex) {
        return { ...c, label: newLabel || `City ${i + 1}` };
      }
      return c;
    });
    setCustomCities(nextCities);
    resetGA('tsp', params, nextCities);
  }, [customCities, problemId, params, resetGA]);

  const removeCity = useCallback((cityIndex) => {
    if (problemId !== 'tsp' || customCities.length <= 4) return;
    const nextCities = customCities
      .filter((_, i) => i !== cityIndex)
      .map((c, i) => ({ ...c, id: i }));
    setCustomCities(nextCities);
    resetGA('tsp', params, nextCities);
  }, [customCities, problemId, params, resetGA]);

  const randomizeCities = useCallback(() => {
    if (problemId !== 'tsp') return;
    const nextCities = customCities.map((c, i) => ({
      ...c,
      id: i,
      label: c.label || `City ${String.fromCharCode(65 + (i % 26))}`,
      x: Math.round(60 + Math.random() * 420),
      y: Math.round(50 + Math.random() * 240)
    }));
    setCustomCities(nextCities);
    resetGA('tsp', params, nextCities);
  }, [customCities, problemId, params, resetGA]);

  const clearCities = useCallback(() => {
    if (problemId !== 'tsp') return;
    const initialCities = PROBLEMS.tsp.defaultCities;
    setCustomCities(initialCities);
    resetGA('tsp', params, initialCities);
  }, [problemId, params, resetGA]);

  // Autoplay loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalId = setInterval(() => {
      if (!gaRef.current) return;
      if (playMode === 'step') {
        gaRef.current.stepForward();
      } else {
        gaRef.current.stepFullGeneration();
      }
      const state = gaRef.current.getState();

      if (soundEnabled) {
        if ((state.isNewRecord && state.generation > 1) || state.isTerminated) {
          sounds.playRecord();
          fireConfetti();
        } else {
          sounds.playClick();
        }
      }

      if (state.isTerminated) {
        setIsPlaying(false);
      }

      setGaState(state);
    }, speedMs);

    return () => clearInterval(intervalId);
  }, [isPlaying, playMode, speedMs, soundEnabled, fireConfetti]);

  const loadWorkedExample = useCallback((exampleKey) => {
    setIsPlaying(false);
    let targetProb = 'worked_fx2';
    if (exampleKey === 'ex1' || exampleKey === 'worked_fx2' || exampleKey === 'fitness') {
      targetProb = 'worked_fx2';
    } else if (exampleKey === 'ex2' || exampleKey === 'worked_quad' || exampleKey === 'continuous') {
      targetProb = 'worked_quad';
    } else if (exampleKey === 'ex3' || exampleKey === 'worked_knapsack' || exampleKey === 'knapsack') {
      targetProb = 'worked_knapsack';
    }

    setProblemId(targetProb);
    setParams(PROBLEMS[targetProb].defaultParams);
    resetGA(targetProb, PROBLEMS[targetProb].defaultParams, null);

    const simElem = document.getElementById('simulator');
    if (simElem) {
      simElem.scrollIntoView({ behavior: 'smooth' });
    }
  }, [resetGA]);

  // Sync sound setting
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  return {
    problemId,
    config: PROBLEMS[problemId],
    params,
    customCities,
    gaState,
    isPlaying,
    playMode,
    speedMs,
    isStoryMode,
    soundEnabled,
    setIsStoryMode,
    setSoundEnabled,
    setIsPlaying,
    setPlayMode,
    setSpeedMs,
    stepForward,
    stepGeneration,
    resetGA,
    newRandomRun,
    changeProblem,
    loadWorkedExample,
    updateParam,
    addCity,
    updateCityCoord,
    updateCityLabel,
    removeCity,
    randomizeCities,
    clearCities
  };
}
