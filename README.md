# 🧬 EvoLogic — Interactive Genetic Algorithm Visualizer

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black&style=flat-square" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5.3.1-646CFF?logo=vite&logoColor=white&style=flat-square" alt="Vite 5" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.4-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Web_Speech_API-Enabled-3fb950?style=flat-square" alt="Voice Narration" />
  <img src="https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel&logoColor=white&style=flat-square" alt="Vercel Ready" />
</p>

> A high-performance, browser-based interactive visualizer for exploring the mechanisms, operators, and mathematics of Genetic Algorithms (GAs).

---

## 🌟 Overview

**EvoLogic** is an interactive educational suite designed to demystify **Genetic Algorithms (GAs)**. Featuring real-time evolutionary simulations, step-by-step phase execution, live chromosome inspection, and browser-native voice narration, EvoLogic bridges the gap between theoretical evolutionary biology and computational optimization.

The application follows clean, modern software engineering aesthetics (inspired by GitHub and VisuAlgo) with high-contrast surfaces, solid color accents, interactive SVG canvases, and dark/light mode persistence.

---

## ✨ Key Capabilities

### 1. 🎯 Three Canonical Benchmark Problems
- **Travelling Salesman Problem (TSP):**
  - Permutation chromosome representation with ordered crossover (OX) and swap mutation.
  - Interactive 2D coordinate canvas with live tour rendering.
  - Integrated **City Coordinates Manager** to add, remove, edit, or randomize waypoints on the fly.
- **Continuous Function Optimization ($f(x) = x \cdot \sin(x) + 32$):**
  - Binary-encoded floating point chromosome representation over $x \in [0, 20]$.
  - Real-time SVG fitness landscape showing candidate solutions climbing towards the global optimum.
- **0/1 Knapsack Problem ($W \le 15\text{ kg}$):**
  - Binary inclusion chromosome representation with capacity gauge.
  - Real-time item selection inspection and death penalty handling for infeasible solutions.

---

### 2. 🔄 7-Phase Algorithmic Lifecycle Execution
Step through the canonical evolutionary cycle with granular control:
1. **Population Initialization:** Uniform random generation across the problem search space.
2. **Fitness Evaluation:** Decoding genotype into phenotype and computing objective fitness.
3. **Parent Selection:** Fitness-proportionate sampling via Roulette Wheel or Tournament Selection ($k=2, 3, 4$).
4. **Crossover Recombination:** Exchanging genetic sequences between parent pairs to synthesize two offspring.
5. **Mutation:** Stochastic perturbation of alleles to preserve genetic diversity and prevent premature stagnation.
6. **Elitism Preservation:** Guaranteeing monotonic progress by carrying forward all-time best solutions.
7. **Termination Check:** Verifying stopping criteria and preparing the next generation.

---

### 3. 🔍 Deep-Dive Analytical Panels
- **Chromosome Inspector:** Real-time gene inspection, raw fitness, scaled selection probabilities, and phenotypes.
- **Selection Roulette Wheel:** Canvas-based interactive probability wheel with dynamic spin animation highlighting the selected parent.
- **Crossover Cinema:** Side-by-side dual-parent alignment showing cut points and assembly of both **Offspring 1** and **Offspring 2**.
- **Convergence Trajectory Chart:** Multi-series SVG graph charting Best and Average fitness over generations.
- **Voice Narration (Text-to-Speech):** Integrated Web Speech API narration that explains active evolutionary phases and lifecycle mechanisms aloud.
- **Deterministic Replay:** Dedicated **Reset** restores the exact Generation 0 population, while **New Run** initializes a fresh stochastic pool.

---

## 🏗️ Project Architecture

```
evologic-ga-visualizer/
├── public/                     # Static icons & metadata
├── src/
│   ├── components/             # Modular React UI components
│   │   ├── common/             # Reusable BrandLogo and UI controls
│   │   ├── modals/             # TutorialWalkthrough modal
│   │   ├── panels/             # Deep-dive analytical panels
│   │   │   ├── ChromosomeInspector.jsx
│   │   │   ├── CityCoordinatesManager.jsx
│   │   │   ├── ConvergenceChart.jsx
│   │   │   ├── CrossoverCinema.jsx
│   │   │   └── SelectionWheel.jsx
│   │   ├── visualizers/        # Problem-specific visual canvases
│   │   │   ├── FunctionVisualizer.jsx
│   │   │   ├── KnapsackVisualizer.jsx
│   │   │   └── TSPVisualizer.jsx
│   │   └── website/            # Application layout views
│   │       ├── Footer.jsx
│   │       ├── Navbar.jsx
│   │       ├── SimulatorSection.jsx
│   │       └── StagesSection.jsx
│   ├── engine/                 # Pure mathematical GA engine
│   │   ├── GeneticAlgorithm.js # State machine, selection, OX crossover, mutation
│   │   ├── Individual.js       # Genotype, phenotype, fitness evaluation
│   │   └── problems.js         # Benchmark datasets and coordinate bounds
│   ├── hooks/
│   │   └── useGeneticAlgorithm.js # React hook orchestrating GA execution loop
│   ├── utils/
│   │   └── sound.js            # Web Audio synthesis & Web Speech API manager
│   ├── App.jsx                 # Master application controller
│   ├── index.css               # Tailwind CSS utility layers & design tokens
│   └── main.jsx                # React root mount
├── index.html                  # HTML5 entrypoint
├── package.json                # Project dependencies & build scripts
├── tailwind.config.js          # Tailwind styling tokens
└── vite.config.js              # Vite bundler configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** `v18.0.0` or higher
- **npm:** `v9.0.0` or higher

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pavani0959/evologic-ga-visualizer.git
   cd evologic-ga-visualizer
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open **[http://localhost:5173](http://localhost:5173)** in your browser.

4. **Build production bundle:**
   ```bash
   npm run build
   ```
   The compiled, production-ready static files are generated in the `dist/` directory.

---

## 🌐 Deploying to Vercel

### Option 1: Automatic Git Deployment (Recommended)
1. Push your repository to GitHub.
2. Sign in to **[Vercel](https://vercel.com)** using your GitHub account.
3. Click **Add New...** $\rightarrow$ **Project**.
4. Select `evologic-ga-visualizer` from your repository list and click **Import**.
5. Framework preset will automatically detect **Vite**.
6. Click **Deploy**. Your application will be live with free global CDN and SSL within seconds!

### Option 2: Vercel CLI
```bash
npm install -g vercel
vercel
vercel --prod
```
