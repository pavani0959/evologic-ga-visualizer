import React, { useState, useEffect } from 'react';
import { useGeneticAlgorithm } from './hooks/useGeneticAlgorithm.js';
import { Navbar } from './components/website/Navbar.jsx';
import { SimulatorSection } from './components/website/SimulatorSection.jsx';
import { StagesSection } from './components/website/StagesSection.jsx';
import { Footer } from './components/website/Footer.jsx';
import { TutorialModal } from './components/modals/TutorialModal.jsx';

export default function App() {
  const {
    problemId,
    config,
    params,
    customCities,
    gaState,
    isPlaying,
    speedMs,
    isStoryMode,
    soundEnabled,
    setSoundEnabled,
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
  } = useGeneticAlgorithm('tsp');

  const [showTutorial, setShowTutorial] = useState(false);

  // Active view: 'workbench' | 'blueprint'
  const [activeView, setActiveView] = useState('workbench');

  // Light / Dark Mode state with persistence
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ga_theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    try {
      localStorage.setItem('ga_theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleNavigate = (newView) => {
    setActiveView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col font-sans selection:bg-[#1f6feb] selection:text-white transition-colors duration-150">
      {/* 1. Navigation Bar with Custom Logo */}
      <Navbar
        activeView={activeView}
        onChangeView={handleNavigate}
        theme={theme}
        onToggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenTutorial={() => setShowTutorial(true)}
      />

      {/* 2. Main Views (Simulator vs How It Works) */}
      <main className="flex-1 flex flex-col">
        {activeView === 'workbench' && (
          <SimulatorSection
            theme={theme}
            problemId={problemId}
            config={config}
            params={params}
            customCities={customCities}
            gaState={gaState}
            isPlaying={isPlaying}
            speedMs={speedMs}
            isStoryMode={isStoryMode}
            setIsPlaying={setIsPlaying}
            setSpeedMs={setSpeedMs}
            stepForward={stepForward}
            stepGeneration={stepGeneration}
            resetGA={resetGA}
            newRandomRun={newRandomRun}
            changeProblem={changeProblem}
            updateParam={updateParam}
            addCity={addCity}
            updateCityCoord={updateCityCoord}
            updateCityLabel={updateCityLabel}
            removeCity={removeCity}
            randomizeCities={randomizeCities}
            clearCities={clearCities}
          />
        )}

        {activeView === 'blueprint' && (
          <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 flex-1 w-full">
            <div className="mb-6 pb-4 border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#f0f6fc]">
                  Genetic Algorithm Lifecycle (7 Phases)
                </h1>
              </div>
              <button
                onClick={() => handleNavigate('workbench')}
                className="px-3.5 py-1.5 rounded-lg bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                ← Return to Simulator
              </button>
            </div>
            <StagesSection onNavigate={handleNavigate} />
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Visualizer Guide Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
}
