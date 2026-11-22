// ============================================================
// Core Genetic Algorithm Engine
// Standard Academic Evolutionary Computing Architecture
// Implements RWS, SUS, Tournament, Rank, Truncation, Multi-Point, Uniform, OX1
// ============================================================
import { PROBLEMS } from './problems.js';
import { Individual } from './Individual.js';

export const ALGORITHM_STEPS = [
  {
    id: 'INITIAL',
    phaseNumber: 1,
    name: 'Initialization',
    label: 'Initialization',
    short: 'Init',
    academicDesc: 'Generate initial population P(0) of N candidate chromosomes randomly distributed across search space.',
    intuitiveDesc: 'Creates a diversified starting pool of trial solutions to begin the evolutionary search.'
  },
  {
    id: 'EVALUATE',
    phaseNumber: 2,
    name: 'Fitness Calculation',
    label: 'Fitness Evaluation',
    short: 'Evaluate',
    academicDesc: 'Calculate objective fitness score fit(x) for every chromosome; normalize probabilities p_i = f_i / ∑f_j.',
    intuitiveDesc: 'Tests every candidate solution against the problem requirements to measure how well it performs.'
  },
  {
    id: 'SELECT',
    phaseNumber: 3,
    name: 'Parent Selection',
    label: 'Parent Selection',
    short: 'Select',
    academicDesc: 'Sample mating pool using selected scheme (Roulette Wheel, SUS, Tournament, Rank, or Truncation).',
    intuitiveDesc: 'Selects the highest-performing solutions to pass their traits to the next generation.'
  },
  {
    id: 'CROSSOVER',
    phaseNumber: 4,
    name: 'Crossover (Recombination)',
    label: 'Crossover',
    short: 'Crossover',
    academicDesc: 'Recombine parent chromosomes at rate p_c using Single-Point, Multi-Point, Uniform, or OX1 crossover.',
    intuitiveDesc: 'Combines partial features from two parent solutions to create new hybrid offspring.'
  },
  {
    id: 'MUTATE',
    phaseNumber: 5,
    name: 'Mutation',
    label: 'Mutation',
    short: 'Mutate',
    academicDesc: 'Stochastically perturb alleles at bit rate p_m to maintain genetic diversity and prevent premature convergence.',
    intuitiveDesc: 'Applies small random tweaks to prevent the population from getting permanently trapped in suboptimal dead-ends.'
  },
  {
    id: 'ELITISM',
    phaseNumber: 6,
    name: 'Survivor Selection & Elitism',
    label: 'Survivor Selection',
    short: 'Survivor',
    academicDesc: 'Preserve top E elite chromosomes unchanged and form generation P(t+1) with offspring pool.',
    intuitiveDesc: 'Preserves the all-time best champion into the next generation so the best solution is never lost.'
  },
  {
    id: 'TERMINATE',
    phaseNumber: 7,
    name: 'Termination & Convergence Check',
    label: 'Termination Check',
    short: 'Done',
    academicDesc: 'Verify stopping criteria: generation bound T_max reached, fitness stagnation threshold Δf < ε, or target fitness attained.',
    intuitiveDesc: 'Checks if nature has found a winning champion or reached the maximum generations limit, then crowns the champion!'
  }
];

export class GeneticAlgorithm {
  constructor(problemId, customParams = {}, customContext = null) {
    this.problemId = problemId;
    this.config = PROBLEMS[problemId];
    this.params = { ...this.config.defaultParams, ...customParams };
    this.contextData = customContext || (problemId === 'tsp' ? [...this.config.defaultCities] : null);

    this.population = [];
    this.generation = 0;
    this.currentStep = 'INITIAL';
    this.stepIndex = 0;
    this.phaseNumber = 1;
    this.history = [];
    this.bestIndividual = null;
    this.allTimeBest = null;
    this.isNewRecord = false;
    this.initialCost = null;
    this.initialBestIndividual = null;

    this.stepEvent = {
      type: 'INIT',
      title: 'Ready for Initialization',
      narrative: `Ready to generate initial population P(0) of ${this.params.popSize} chromosomes.`,
      details: null
    };

    this.selectedParents = [];
    this.offspringPopulation = [];
    this.crossoverRecord = null;
    this.mutationRecord = [];
    this.savedInitialPopulation = null;
  }

  // --- Phase 1: Initialize Population ---
  initializePopulation() {
    this.population = [];
    const popSize = this.params.popSize;

    for (let i = 0; i < popSize; i++) {
      let genes;
      if (this.config.initialStrings && i < this.config.initialStrings.length) {
        genes = this.config.initialStrings[i].split('').map(Number);
      } else if (this.config.geneType === 'permutation') {
        const count = this.contextData ? this.contextData.length : this.config.defaultCities.length;
        genes = this._randomPermutation(count);
      } else if (this.config.id === 'knapsack' || this.config.id === 'worked_knapsack') {
        genes = Array.from({ length: this.config.items.length }, () => (Math.random() < 0.4 ? 1 : 0));
      } else {
        genes = Array.from({ length: this.config.bits }, () => (Math.random() < 0.5 ? 1 : 0));
      }

      const ind = new Individual(genes, this.problemId);
      ind.evaluate(this.contextData);
      this.population.push(ind);
    }

    // Save exact copy of initial population so Reset replays the same run deterministically
    this.savedInitialPopulation = this.population.map(ind => ind.clone());

    this.generation = 0;
    this.currentStep = 'INITIAL';
    this.stepIndex = 0;
    this.phaseNumber = 1;
    this.history = [];
    this.allTimeBest = null;
    this.isNewRecord = true;
    this.isTerminated = false;
    this._sortAndEvaluate();

    this.initialCost = this.bestIndividual ? this.bestIndividual.rawCost : 1000;
    this.initialBestIndividual = this.bestIndividual ? this.bestIndividual.clone() : null;

    this.stepEvent = {
      type: 'INITIAL',
      title: 'Population Initialization Complete',
      narrative: `Generated ${popSize} distinct random chromosomes. Notice the broad, stochastic spread across the search space (Generation 0).`,
      details: { popSize, chromosomeLength: this.population[0].genes.length }
    };

    return this.getState();
  }

  // Reset to the exact same Generation 0 population without re-randomizing
  resetToGenerationZero() {
    if (!this.savedInitialPopulation || this.savedInitialPopulation.length === 0) {
      return this.initializePopulation();
    }

    this.population = this.savedInitialPopulation.map(ind => ind.clone());
    this.generation = 0;
    this.currentStep = 'INITIAL';
    this.stepIndex = 0;
    this.phaseNumber = 1;
    this.history = [];
    this.allTimeBest = null;
    this.isNewRecord = true;
    this.isTerminated = false;
    this._sortAndEvaluate();

    this.initialCost = this.bestIndividual ? this.bestIndividual.rawCost : 1000;
    this.initialBestIndividual = this.bestIndividual ? this.bestIndividual.clone() : null;

    this.stepEvent = {
      type: 'INITIAL',
      title: 'Reset to Generation 0',
      narrative: `Reset to initial starting population of ${this.params.popSize} chromosomes.`,
      details: { popSize: this.params.popSize, chromosomeLength: this.population[0].genes.length }
    };

    return this.getState();
  }

  // --- Step Controller ---
  stepForward() {
    this.isNewRecord = false;
    switch (this.currentStep) {
      case 'INITIAL':
      case 'TERMINATE':
        return this.stepEvaluate();
      case 'EVALUATE':
        return this.stepSelect();
      case 'SELECT':
        return this.stepCrossover();
      case 'CROSSOVER':
        return this.stepMutate();
      case 'MUTATE':
        return this.stepElitism();
      case 'ELITISM':
        return this.stepTerminationCheck();
      default:
        return this.stepEvaluate();
    }
  }

  // --- Phase 2: Fitness Evaluation ---
  stepEvaluate() {
    this.currentStep = 'EVALUATE';
    this.stepIndex = 1;
    this.phaseNumber = 2;
    this._sortAndEvaluate();

    const stats = this.getStats();

    this.stepEvent = {
      type: 'EVALUATE',
      title: `Fitness Calculation (Generation ${this.generation})`,
      narrative: `Evaluated all ${this.population.length} individuals against objective function. Population mean fitness = ${stats.avg}, max fitness = ${stats.best}. Selection probabilities p_i calculated.`,
      details: stats
    };

    return this.getState();
  }

  // --- Phase 3: Parent Selection (Supports 5 Canonical Selection Schemes) ---
  stepSelect() {
    this.currentStep = 'SELECT';
    this.stepIndex = 2;
    this.phaseNumber = 3;
    this.selectedParents = [];

    this.population.forEach(ind => (ind.isSelected = false));

    const popSize = this.population.length;
    const method = this.params.selectionMethod || 'tournament';
    const selectionCount = popSize;

    if (method === 'roulette') {
      // 1. Roulette Wheel Selection (Slide 7)
      const totalFitness = this.population.reduce((sum, ind) => sum + Math.max(0.0001, ind.fitness), 0);
      for (let i = 0; i < selectionCount; i++) {
        let pick = Math.random() * totalFitness;
        let runningSum = 0;
        let chosenIdx = 0;
        for (let j = 0; j < popSize; j++) {
          runningSum += Math.max(0.0001, this.population[j].fitness);
          if (runningSum >= pick) {
            chosenIdx = j;
            break;
          }
        }
        this.selectedParents.push(this.population[chosenIdx]);
        this.population[chosenIdx].isSelected = true;
      }
    } else if (method === 'sus') {
      // 2. Stochastic Universal Sampling (SUS - Slide 9)
      // Single spin with N equally-spaced pointers: R = {r, (r+1)/N, ...} mod 1
      const totalFitness = this.population.reduce((sum, ind) => sum + Math.max(0.0001, ind.fitness), 0);
      const pointerSpacing = 1.0 / selectionCount;
      let startOffset = Math.random() * pointerSpacing;

      let currentSum = 0;
      let memberIndex = 0;

      for (let i = 0; i < selectionCount; i++) {
        const pointer = (startOffset + i * pointerSpacing) * totalFitness;
        while (currentSum + Math.max(0.0001, this.population[memberIndex].fitness) < pointer && memberIndex < popSize - 1) {
          currentSum += Math.max(0.0001, this.population[memberIndex].fitness);
          memberIndex++;
        }
        this.selectedParents.push(this.population[memberIndex]);
        this.population[memberIndex].isSelected = true;
      }
    } else if (method === 'rank') {
      // 3. Rank-Based Selection (Slide 10): p_i = r_i / ∑ r_j
      const totalRank = (popSize * (popSize + 1)) / 2;
      for (let i = 0; i < selectionCount; i++) {
        let pick = Math.random() * totalRank;
        let runningSum = 0;
        let chosenIdx = 0;
        for (let j = 0; j < popSize; j++) {
          runningSum += (popSize - j);
          if (runningSum >= pick) {
            chosenIdx = j;
            break;
          }
        }
        this.selectedParents.push(this.population[chosenIdx]);
        this.population[chosenIdx].isSelected = true;
      }
    } else if (method === 'truncation') {
      // 4. Truncation Selection (Slide 11): top 30%-50%
      const topCount = Math.max(2, Math.floor(popSize * 0.4));
      for (let i = 0; i < selectionCount; i++) {
        const pickIdx = Math.floor(Math.random() * topCount);
        this.selectedParents.push(this.population[pickIdx]);
        this.population[pickIdx].isSelected = true;
      }
    } else {
      // 5. Tournament Selection (Slide 11): K-way tournament
      const k = this.params.tournamentSize || 3;
      for (let i = 0; i < selectionCount; i++) {
        let bestCandidate = null;
        for (let j = 0; j < k; j++) {
          const randIdx = Math.floor(Math.random() * popSize);
          const candidate = this.population[randIdx];
          if (!bestCandidate || candidate.fitness > bestCandidate.fitness) {
            bestCandidate = candidate;
          }
        }
        this.selectedParents.push(bestCandidate);
        bestCandidate.isSelected = true;
      }
    }

    const methodNames = {
      roulette: 'Roulette Wheel (Fitness Proportionate)',
      sus: 'Stochastic Universal Sampling (SUS)',
      rank: 'Rank-Based Selection',
      truncation: 'Truncation Selection (Top 40%)',
      tournament: `Tournament Selection (K=${this.params.tournamentSize || 3})`
    };

    this.stepEvent = {
      type: 'SELECT',
      title: `Parent Selection (${methodNames[method] || method})`,
      narrative: `Selected ${this.selectedParents.length} parents into the mating pool using ${methodNames[method] || method}. Fitter chromosomes receive higher sampling frequency.`,
      details: {
        method,
        selectedIndices: this.population.map((ind, i) => ind.isSelected ? i : -1).filter(i => i !== -1)
      }
    };

    return this.getState();
  }

  // --- Phase 4: Crossover (Recombination - Slides 12-13) ---
  stepCrossover() {
    this.currentStep = 'CROSSOVER';
    this.stepIndex = 3;
    this.phaseNumber = 4;
    this.offspringPopulation = [];
    this.crossoverRecord = null;

    const rate = this.params.crossoverRate;
    const pool = [...this.selectedParents];
    const cType = this.params.crossoverType || (this.config.geneType === 'permutation' ? 'ox' : 'single_point');

    while (pool.length >= 2 && this.offspringPopulation.length < this.params.popSize) {
      const p1 = pool.shift();
      const p2 = pool.shift();

      if (Math.random() < rate) {
        let c1Genes, c2Genes, crossoverPoint;

        if (this.config.geneType === 'permutation' || cType === 'ox') {
          // Order Crossover (OX1) for TSP
          const result = this._orderCrossover(p1.genes, p2.genes);
          c1Genes = result.c1;
          c2Genes = result.c2;
          crossoverPoint = { start: result.start, end: result.end };
        } else if (cType === 'uniform') {
          // Uniform Crossover (Slide 13)
          const mask = Array.from({ length: p1.genes.length }, () => (Math.random() < 0.5 ? 1 : 0));
          c1Genes = p1.genes.map((g, i) => (mask[i] === 1 ? g : p2.genes[i]));
          c2Genes = p2.genes.map((g, i) => (mask[i] === 1 ? g : p1.genes[i]));
          crossoverPoint = { mask };
        } else if (cType === 'multi_point') {
          // Two-Point Crossover (Slide 13)
          const n = p1.genes.length;
          let pt1 = Math.floor(Math.random() * (n - 1));
          let pt2 = Math.floor(Math.random() * (n - 1));
          if (pt1 > pt2) [pt1, pt2] = [pt2, pt1];
          if (pt1 === pt2) pt2 = Math.min(n - 1, pt1 + 1);

          c1Genes = [...p1.genes.slice(0, pt1), ...p2.genes.slice(pt1, pt2), ...p1.genes.slice(pt2)];
          c2Genes = [...p2.genes.slice(0, pt1), ...p1.genes.slice(pt1, pt2), ...p2.genes.slice(pt2)];
          crossoverPoint = { start: pt1, end: pt2 };
        } else {
          // Single-Point Crossover (Slide 12)
          const pt = 1 + Math.floor(Math.random() * (p1.genes.length - 1));
          c1Genes = [...p1.genes.slice(0, pt), ...p2.genes.slice(pt)];
          c2Genes = [...p2.genes.slice(0, pt), ...p1.genes.slice(pt)];
          crossoverPoint = { point: pt };
        }

        const child1 = new Individual(c1Genes, this.problemId);
        const child2 = new Individual(c2Genes, this.problemId);

        if (!this.crossoverRecord) {
          this.crossoverRecord = {
            parent1: p1.clone(),
            parent2: p2.clone(),
            child1: child1.clone(),
            child2: child2.clone(),
            point: crossoverPoint,
            method: this.config.crossoverName
          };
        }

        this.offspringPopulation.push(child1);
        if (this.offspringPopulation.length < this.params.popSize) {
          this.offspringPopulation.push(child2);
        }
      } else {
        this.offspringPopulation.push(p1.clone());
        if (this.offspringPopulation.length < this.params.popSize) {
          this.offspringPopulation.push(p2.clone());
        }
      }
    }

    while (this.offspringPopulation.length < this.params.popSize) {
      this.offspringPopulation.push(this.population[0].clone());
    }

    this.stepEvent = {
      type: 'CROSSOVER',
      title: `Crossover Operator (${this.config.crossoverName})`,
      narrative: `Applied crossover recombination with probability p_c = ${rate}. Offspring chromosomes inherit building block schemata from both parents.`,
      details: this.crossoverRecord
    };

    return this.getState();
  }

  // --- Phase 5: Mutation (Slide 14) ---
  stepMutate() {
    this.currentStep = 'MUTATE';
    this.stepIndex = 4;
    this.phaseNumber = 5;
    this.mutationRecord = [];

    const rate = this.params.mutationRate;

    this.offspringPopulation.forEach((ind, indIdx) => {
      let mutated = false;
      const mutatedGenes = [];

      if (this.config.geneType === 'permutation') {
        // Swap mutation for permutations
        if (Math.random() < rate) {
          const idx1 = Math.floor(Math.random() * ind.genes.length);
          let idx2 = Math.floor(Math.random() * ind.genes.length);
          while (idx2 === idx1 && ind.genes.length > 1) {
            idx2 = Math.floor(Math.random() * ind.genes.length);
          }
          [ind.genes[idx1], ind.genes[idx2]] = [ind.genes[idx2], ind.genes[idx1]];
          mutated = true;
          mutatedGenes.push(idx1, idx2);
        }
      } else {
        // Bit-flip mutation (Slide 14)
        ind.genes = ind.genes.map((bit, bitIdx) => {
          if (Math.random() < rate) {
            mutated = true;
            mutatedGenes.push(bitIdx);
            return bit === 1 ? 0 : 1;
          }
          return bit;
        });
      }

      if (mutated && this.mutationRecord.length < 4) {
        this.mutationRecord.push({
          individualIndex: indIdx,
          mutatedPositions: mutatedGenes,
          genes: [...ind.genes]
        });
      }
    });

    this.stepEvent = {
      type: 'MUTATE',
      title: `Mutation Operator (p_m = ${(rate * 100).toFixed(1)}%)`,
      narrative: `Applied stochastic mutation at per-locus probability p_m = ${rate}. Stochastically perturbed ${this.mutationRecord.length} individual(s) to sustain search space ergodicity.`,
      details: { mutations: this.mutationRecord }
    };

    return this.getState();
  }

  // --- Phase 6: Survivor Selection & Elitism (Procedure EA loop) ---
  stepElitism() {
    this.currentStep = 'ELITISM';
    this.stepIndex = 5;
    this.phaseNumber = 6;

    this.offspringPopulation.forEach(ind => ind.evaluate(this.contextData));
    this.offspringPopulation.sort((a, b) => b.fitness - a.fitness);

    const elitismCount = Math.min(this.params.elitism || 1, this.population.length);
    const newGen = [];

    // 1. Preserve top E elite chromosomes from P(t)
    for (let i = 0; i < elitismCount; i++) {
      const elite = this.population[i].clone();
      elite.isElite = true;
      newGen.push(elite);
    }

    // 2. Fill remainder with best offspring
    for (let i = 0; i < this.offspringPopulation.length && newGen.length < this.params.popSize; i++) {
      const child = this.offspringPopulation[i].clone();
      child.isElite = false;
      newGen.push(child);
    }

    this.population = newGen;
    this.generation++;
    this._sortAndEvaluate();

    const stats = this.getStats();

    this.stepEvent = {
      type: 'ELITISM',
      title: `Survivor Selection Completed (Generation ${this.generation})`,
      narrative: `Advanced to Generation ${this.generation}. Preserved ${elitismCount} elite individual(s). Monotonic convergence guaranteed.`,
      details: { elitismCount, ...stats }
    };

    return this.getState();
  }

  // --- Phase 7: Termination & Convergence Check ---
  stepTerminationCheck() {
    this.currentStep = 'TERMINATE';
    this.stepIndex = 6;
    this.phaseNumber = 7;

    const maxGen = this.params.maxGenerations || 100;
    const stagnationLimit = this.params.stagnationLimit || 20;

    // Check stagnation: count how many recent generations had same best fitness
    let stagnantCount = 0;
    if (this.history.length >= 2) {
      const currentBest = this.bestIndividual ? this.bestIndividual.fitness : 0;
      for (let i = this.history.length - 1; i >= 0; i--) {
        if (Math.abs(this.history[i].best - currentBest) < 0.001) {
          stagnantCount++;
        } else {
          break;
        }
      }
    }

    const isMaxGen = this.generation >= maxGen;
    const isStagnant = stagnantCount >= stagnationLimit && this.generation > 15;
    const isTargetReached =
      (this.problemId === 'worked_knapsack' && this.bestIndividual && this.bestIndividual.fitness >= 12) ||
      (this.problemId === 'worked_quad' && this.bestIndividual && this.bestIndividual.fitness >= 0.874) ||
      (this.problemId === 'worked_fx2' && this.bestIndividual && this.bestIndividual.fitness >= 961);

    const isDone = isMaxGen || isStagnant || isTargetReached;
    this.isTerminated = isDone;

    let reason = `Continuing evolutionary search (Generation ${this.generation}). Stopping conditions active.`;
    if (isTargetReached) reason = 'Target optimal fitness reached! Global optimum confirmed.';
    else if (isMaxGen) reason = `Maximum generation limit (${maxGen}) reached. Final champion preserved.`;
    else if (isStagnant) reason = `Population converged: best fitness stagnant for ${stagnantCount} consecutive generations.`;

    this.stepEvent = {
      type: 'TERMINATE',
      title: isDone ? 'Evolution Terminated — Convergence Reached' : 'Termination Check: Active Search Continues',
      narrative: reason,
      details: {
        isDone,
        reason,
        generation: this.generation,
        maxGen,
        stagnantCount,
        diversity: this.getStats().diversity
      }
    };

    return this.getState();
  }

  // --- Advance one full generation cycle ---
  stepFullGeneration() {
    this.stepEvaluate();
    this.stepSelect();
    this.stepCrossover();
    this.stepMutate();
    this.stepElitism();
    return this.stepTerminationCheck();
  }

  _sortAndEvaluate() {
    this.population.forEach(ind => ind.evaluate(this.contextData));
    this.population.sort((a, b) => b.fitness - a.fitness);

    const totalFitness = this.population.reduce((sum, ind) => sum + Math.max(0.0001, ind.fitness), 0);
    this.population.forEach(ind => {
      ind.selectionProb = totalFitness > 0 ? +(ind.fitness / totalFitness).toFixed(4) : 0;
    });

    const currentBest = this.population[0].clone();
    if (!this.allTimeBest || currentBest.fitness > this.allTimeBest.fitness) {
      this.allTimeBest = currentBest.clone();
      this.isNewRecord = true;
    } else {
      this.isNewRecord = false;
    }

    this.bestIndividual = currentBest;

    const stats = this.getStats();
    this.history.push({
      generation: this.generation,
      best: stats.best,
      avg: stats.avg,
      worst: stats.worst,
      diversity: stats.diversity
    });
  }

  getStats() {
    if (!this.population.length) return { best: 0, avg: 0, worst: 0, diversity: 0 };
    const fits = this.population.map(ind => ind.fitness);
    const best = Math.max(...fits);
    const worst = Math.min(...fits);
    const sum = fits.reduce((a, b) => a + b, 0);
    const avg = +(sum / fits.length).toFixed(2);

    const variance = fits.reduce((acc, f) => acc + Math.pow(f - avg, 2), 0) / fits.length;
    const stdDev = Math.sqrt(variance);
    const diversity = best > 0 ? +(stdDev / best).toFixed(3) : 0;

    return {
      best: +best.toFixed(2),
      avg,
      worst: +worst.toFixed(2),
      diversity: Math.min(1, diversity)
    };
  }

  getState() {
    return {
      problemId: this.problemId,
      generation: this.generation,
      currentStep: this.currentStep,
      stepIndex: this.stepIndex,
      phaseNumber: this.phaseNumber || (this.stepIndex + 1),
      population: this.population.map(ind => ind.clone()),
      bestIndividual: this.bestIndividual ? this.bestIndividual.clone() : null,
      allTimeBest: this.allTimeBest ? this.allTimeBest.clone() : null,
      isNewRecord: this.isNewRecord,
      isTerminated: this.isTerminated || false,
      terminationReason: this.stepEvent?.details?.reason || null,
      initialCost: this.initialCost,
      initialBestIndividual: this.initialBestIndividual ? this.initialBestIndividual.clone() : null,
      history: [...this.history],
      stats: this.getStats(),
      stepEvent: this.stepEvent,
      crossoverRecord: this.crossoverRecord,
      mutationRecord: this.mutationRecord,
      contextData: this.contextData
    };
  }

  _orderCrossover(parent1, parent2) {
    const n = parent1.length;
    let start = Math.floor(Math.random() * n);
    let end = Math.floor(Math.random() * n);
    if (start > end) [start, end] = [end, start];

    const c1 = new Array(n).fill(null);
    const c2 = new Array(n).fill(null);

    for (let i = start; i <= end; i++) {
      c1[i] = parent1[i];
      c2[i] = parent2[i];
    }

    this._fillOXRemainder(c1, parent2, end);
    this._fillOXRemainder(c2, parent1, end);

    return { c1, c2, start, end };
  }

  _fillOXRemainder(child, donorParent, end) {
    const n = child.length;
    const inChild = new Set(child.filter(g => g !== null));
    let currentChildIdx = (end + 1) % n;
    let currentDonorIdx = (end + 1) % n;

    while (inChild.size < n) {
      const donorGene = donorParent[currentDonorIdx];
      if (!inChild.has(donorGene)) {
        child[currentChildIdx] = donorGene;
        inChild.add(donorGene);
        currentChildIdx = (currentChildIdx + 1) % n;
      }
      currentDonorIdx = (currentDonorIdx + 1) % n;
    }
  }

  _randomPermutation(n) {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
