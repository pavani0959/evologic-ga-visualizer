import React from 'react';
import { BrandLogo } from '../common/BrandLogo.jsx';

export function Footer({ onNavigate }) {
  function handleLink(view) {
    if (onNavigate) {
      onNavigate(view);
    }
  }

  return (
    <footer className="border-t border-[#30363d] bg-[#161b22] py-3 sm:py-4 px-3 sm:px-6 text-xs text-[#8b949e] mt-auto">
      <div className="max-w-[1540px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-center sm:text-left">

        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <BrandLogo className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
          <div>
            <span className="font-bold text-[#f0f6fc] text-xs">EvoLogic</span>
            <span className="text-[11px] text-[#8b949e] ml-1.5 sm:ml-2">Genetic Algorithm Visualizer</span>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium">
          <button onClick={() => handleLink('workbench')} className="hover:text-[#58a6ff] transition-colors cursor-pointer">Simulator</button>
          <button onClick={() => handleLink('blueprint')} className="hover:text-[#58a6ff] transition-colors cursor-pointer">Algorithm Lifecycle (7 Phases)</button>
        </div>
      </div>
    </footer>
  );
}
