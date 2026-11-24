import React from 'react';
import { Volume2, VolumeX, BookOpen, Sun, Moon, PlayCircle, BookCheck } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo.jsx';
import { sounds } from '../../utils/sound.js';

export function Navbar({
  activeView = 'workbench',
  onChangeView,
  soundEnabled,
  onToggleSound,
  onOpenTutorial,
  theme,
  onToggleTheme
}) {
  function handleSoundClick() {
    const next = !soundEnabled;
    onToggleSound();
    if (next) {
      sounds.playToggleChime(true);
    }
  }

  const navItems = [
    { id: 'workbench', label: 'Simulator', shortLabel: 'Simulator', icon: PlayCircle },
    { id: 'blueprint', label: 'Algorithm Lifecycle (7 Phases)', shortLabel: 'Lifecycle', icon: BookCheck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#161b22] border-b border-[#30363d] px-3 sm:px-6 py-2 sm:py-2.5 shadow-sm transition-colors">
      <div className="max-w-[1540px] mx-auto flex items-center justify-between gap-2 sm:gap-3">

        {/* Brand with Custom Helix Logo */}
        <button
          onClick={() => onChangeView('workbench')}
          className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer focus:outline-none flex-shrink-0"
        >
          <BrandLogo className="w-7 h-7 sm:w-8 h-8 flex-shrink-0" />
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-bold text-sm sm:text-base tracking-tight text-[#f0f6fc]">
              EvoLogic
            </span>
            <span className="text-xs text-[#8b949e] hidden md:inline">
              Genetic Algorithm Visualizer
            </span>
          </div>
        </button>

        {/* Clean, Simple 2-Tab Navigation */}
        <nav className="flex items-center gap-1 bg-[#0d1117] border border-[#30363d] p-0.5 sm:p-1 rounded-lg">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1f6feb] text-white shadow-sm'
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.shortLabel}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools (Theme, Sound, Guide) */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-md border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d29922]" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0969da]" />
            )}
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={handleSoundClick}
            className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-[#21262d] border-[#30363d] text-[#3fb950] hover:bg-[#30363d]'
                : 'bg-[#161b22] border-[#30363d] text-[#6e7681] hover:text-[#8b949e]'
            }`}
            title={soundEnabled ? 'Audio Effects are ON' : 'Audio Effects are OFF'}
            aria-label="Toggle audio effects"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {/* Guide Modal Trigger */}
          <button
            onClick={onOpenTutorial}
            className="flex items-center gap-1 sm:gap-1.5 text-xs font-medium bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] px-2 sm:px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
            title="Read Visualizer Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#58a6ff] flex-shrink-0" />
            <span className="hidden xs:inline sm:inline">Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
}
