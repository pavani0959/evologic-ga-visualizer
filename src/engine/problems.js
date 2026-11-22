// ============================================================
// Problem Configurations — Genetic Algorithm Visualizer
// EvoLogic · Interactive Educational Platform
// ============================================================

export const PROBLEMS = {
  tsp: {
    id: 'tsp',
    title: 'Travelling Salesman Problem (TSP)',
    badge: 'Combinatorial Optimization',
    category: 'Permutation Encoding',
    summary: 'Find the minimum Euclidean distance closed tour visiting every city exactly once and returning to the origin.',
    description: 'A canonical NP-hard problem. Solutions are encoded as permutation chromosomes where gene order matters and duplicate alleles are prohibited. Recombination uses Order Crossover (OX1) to preserve valid tours.',
    geneType: 'permutation',
    fitnessGoal: 'minimize',
    defaultCities: [
      { id: 0, label: 'City A', x: 260, y: 60 },
      { id: 1, label: 'City B', x: 440, y: 90 },
      { id: 2, label: 'City C', x: 480, y: 200 },
      { id: 3, label: 'City D', x: 380, y: 280 },
      { id: 4, label: 'City E', x: 220, y: 290 },
      { id: 5, label: 'City F', x: 90,  y: 240 },
      { id: 6, label: 'City G', x: 80,  y: 130 },
      { id: 7, label: 'City H', x: 230, y: 170 }
    ],
    defaultParams: {
      popSize: 20,
      crossoverRate: 0.85,
      mutationRate: 0.05,
      elitism: 2,
      selectionMethod: 'tournament',
      tournamentSize: 3,
      crossoverType: 'ox',
      mutationType: 'swap'
    },
    crossoverName: 'Order Crossover (OX1)',
    mutationName: '2-Opt Swap Mutation'
  },

  funcopt: {
    id: 'funcopt',
    title: 'Non-Linear Function Optimization',
    badge: 'Continuous / Multimodal Benchmark',
    category: 'Binary Encoding with Phenotype Decoding',
    summary: 'Find the global maximum of non-linear multimodal function f(x) = x · sin(x) + 32 over domain x ∈ [0, 20].',
    description: 'Demonstrates classical binary string encoding. 14-bit binary chromosomes are decoded into continuous real values via the standard decoding formula: X = X_L + [(X_U - X_L) / (2^n - 1)] · Decimal(X_B).',
    geneType: 'binary',
    bits: 14,
    xMin: 0,
    xMax: 20,
    formulaStr: 'f(x) = x \\cdot \\sin(x) + 32',
    fitnessGoal: 'maximize',
    defaultParams: {
      popSize: 20,
      crossoverRate: 0.80,
      mutationRate: 0.02,
      elitism: 1,
      selectionMethod: 'roulette',
      tournamentSize: 3,
      crossoverType: 'single_point',
      mutationType: 'bit_flip'
    },
    crossoverName: 'Single-Point Crossover',
    mutationName: 'Bit-Flip Mutation'
  },

  knapsack: {
    id: 'knapsack',
    title: '0/1 Knapsack Optimization',
    badge: 'Constrained Combinatorial',
    category: 'Binary Subset Selection',
    summary: 'Select a subset of items to maximize total profit while satisfying the maximum knapsack weight capacity (W ≤ 15 kg).',
    description: 'Constrained binary optimization. Each gene (0 or 1) decides whether to include an item. Solutions exceeding the weight capacity receive zero fitness via a death penalty constraint.',
    geneType: 'binary',
    capacity: 15,
    items: [
      { id: 0, name: 'Item A', weight: 7, value: 5, tag: 'High-Weight' },
      { id: 1, name: 'Item B', weight: 2, value: 4, tag: 'Medium-Ratio' },
      { id: 2, name: 'Item C', weight: 1, value: 7, tag: 'High-Ratio (Optimal)' },
      { id: 3, name: 'Item D', weight: 9, value: 2, tag: 'Suboptimal' },
      { id: 4, name: 'Item E', weight: 4, value: 6, tag: 'Supplemental' },
      { id: 5, name: 'Item F', weight: 3, value: 5, tag: 'Supplemental' },
      { id: 6, name: 'Item G', weight: 2, value: 3, tag: 'Supplemental' },
      { id: 7, name: 'Item H', weight: 5, value: 8, tag: 'Supplemental' }
    ],
    fitnessGoal: 'maximize',
    defaultParams: {
      popSize: 20,
      crossoverRate: 0.85,
      mutationRate: 0.03,
      elitism: 1,
      selectionMethod: 'tournament',
      tournamentSize: 3,
      crossoverType: 'single_point',
      mutationType: 'bit_flip'
    },
    crossoverName: 'Single-Point / Uniform Crossover',
    mutationName: 'Bit-Flip Mutation'
  },

  worked_fx2: {
    id: 'worked_fx2',
    title: 'Worked Benchmark: f(x) = x²',
    badge: 'Goldberg Canonical (5-Bit)',
    category: 'Integer Binary Encoding',
    summary: 'Maximize f(x) = x² over x ∈ [0, 31] with 4 canonical strings: 01100, 11001, 00101, 10011.',
    description: 'The canonical 5-bit problem from Goldberg (1989). Demonstrates how Roulette Wheel Selection rapidly drives mean fitness from 288.75 to 493.0 in a single generation.',
    geneType: 'binary',
    bits: 5,
    xMin: 0,
    xMax: 31,
    formulaStr: 'f(x) = x^2',
    fitnessGoal: 'maximize',
    initialStrings: ['01100', '11001', '00101', '10011'],
    defaultParams: {
      popSize: 4,
      crossoverRate: 1.0,
      mutationRate: 0.01,
      elitism: 1,
      selectionMethod: 'roulette',
      tournamentSize: 3,
      crossoverType: 'single_point',
      mutationType: 'bit_flip'
    },
    crossoverName: 'Single-Point Crossover',
    mutationName: 'Bit-Flip Mutation'
  },

  worked_quad: {
    id: 'worked_quad',
    title: 'Worked Benchmark: f(x) = −x² + 2x',
    badge: 'Continuous Decoding Benchmark',
    category: 'Continuous Real-Valued Decoding',
    summary: 'Maximize f(x) = −x² + 2x over x ∈ [0, 2] with strings: 11010, 00111, 10110, 00101.',
    description: 'Demonstrates continuous decoding via x = (2/31)·Dec. At locus 2 crossover, child C3 (x=1.355, f=0.874) outperforms both parent chromosomes.',
    geneType: 'binary',
    bits: 5,
    xMin: 0,
    xMax: 2,
    formulaStr: 'f(x) = -x^2 + 2x',
    fitnessGoal: 'maximize',
    initialStrings: ['11010', '00111', '10110', '00101'],
    defaultParams: {
      popSize: 4,
      crossoverRate: 1.0,
      mutationRate: 0.0,
      elitism: 1,
      selectionMethod: 'roulette',
      tournamentSize: 3,
      crossoverType: 'single_point',
      mutationType: 'bit_flip'
    },
    crossoverName: 'Single-Point Crossover (Locus 2)',
    mutationName: 'Bit-Flip Mutation'
  },

  worked_knapsack: {
    id: 'worked_knapsack',
    title: 'Worked Benchmark: 0/1 Knapsack (4 Items)',
    badge: 'Constrained Feasibility Benchmark',
    category: 'Binary Subset Selection',
    summary: 'Items A(7kg, 5), B(2kg, 4), C(1kg, 7), D(9kg, 2). Optimum: 1010 (Weight 8kg, Value 12).',
    description: 'Discrete constrained benchmark with 4 items and capacity 15 kg. Shows how death penalties penalize infeasible combinations like 1111 (19 kg).',
    geneType: 'binary',
    capacity: 15,
    items: [
      { id: 0, name: 'Item A', weight: 7, value: 5, tag: '7kg, $5' },
      { id: 1, name: 'Item B', weight: 2, value: 4, tag: '2kg, $4' },
      { id: 2, name: 'Item C', weight: 1, value: 7, tag: '1kg, $7' },
      { id: 3, name: 'Item D', weight: 9, value: 2, tag: '9kg, $2' }
    ],
    initialStrings: ['0100', '0101', '1111', '0010', '1000', '1010'],
    fitnessGoal: 'maximize',
    defaultParams: {
      popSize: 6,
      crossoverRate: 0.85,
      mutationRate: 0.02,
      elitism: 1,
      selectionMethod: 'tournament',
      tournamentSize: 3,
      crossoverType: 'single_point',
      mutationType: 'bit_flip'
    },
    crossoverName: 'Single-Point Crossover',
    mutationName: 'Bit-Flip Mutation'
  }
};

// Canonical GA Worked Examples (Reference: Goldberg 1989, Holland 1975)
export const LECTURE_WORKED_EXAMPLES = {
  example1: {
    title: 'Example 1: Maximize f(x) = x², 0 ≤ x ≤ 31',
    encoding: '5-bit binary string (2⁵ = 32 levels), N = 4',
    formula: 'X = decimal value of 5-bit chromosome; fit(x) = x²',
    randomNumbers: [0.40, 0.15, 0.70, 0.90],
    data: [
      { id: 1, string: '01100', x: 12, fitness: 144, prob: '0.1247', cumRange: '0.000 – 0.125', expected: 0.50, actual: 0 },
      { id: 2, string: '11001', x: 25, fitness: 625, prob: '0.5411', cumRange: '0.125 – 0.666', expected: 2.16, actual: 2 },
      { id: 3, string: '00101', x: 5,  fitness: 25,  prob: '0.0216', cumRange: '0.666 – 0.687', expected: 0.09, actual: 0 },
      { id: 4, string: '10011', x: 19, fitness: 361, prob: '0.3126', cumRange: '0.687 – 1.000', expected: 1.25, actual: 2 }
    ],
    totalFitness: 1155,
    meanInitial: 288.75,
    meanAfterGen1: 493.00,
    matingPool: ['11001', '11001', '10011', '10011'],
    observation: 'Average fitness rose from 288.75 to 493 in a single generation. Note that diversity collapsed to only two distinct strings, illustrating Roulette Wheel Selection’s vulnerability to premature convergence (genetic drift).'
  },

  example2: {
    title: 'Example 2: Maximize f(x) = −x² + 2x, 0 ≤ x ≤ 2',
    encoding: '5-bit binary string, X_L = 0, X_U = 2, n = 5',
    formula: 'X = X_L + [(X_U - X_L) / (2^n - 1)] · X_B = (2 / 31) · (decimal value)',
    theoreticalOptimum: 'x* = 1.0, f(1) = 1.0 (vertex of parabola)',
    data: [
      { id: 1, string: '11010', dec: 26, x: '1.6774', fitness: '0.5411', prob: '0.2077' },
      { id: 2, string: '00111', dec: 7,  x: '0.4516', fitness: '0.6993', prob: '0.2684' },
      { id: 3, string: '10110', dec: 22, x: '1.4194', fitness: '0.8241', prob: '0.3163' },
      { id: 4, string: '00101', dec: 5,  x: '0.3226', fitness: '0.5411', prob: '0.2077' }
    ],
    totalFitness: '2.6055',
    crossoverDetail: {
      cutPoint: 'After bit 2 (locus 2)',
      pair1: '00|111 × 11|010 ➔ C1 = 00010 (x=0.129, f=0.241), C2 = 11111 (x=2.000, f=0.000)',
      pair2: '10|110 × 00|101 ➔ C3 = 10101 (x=1.355, f=0.874), C4 = 00110 (x=0.387, f=0.624)'
    },
    observation: 'Offspring C3 (x = 1.355, f = 0.874) is fitter than both of its parents (0.824 and 0.699), proving crossover can synthesize superior schemata. Although C2 regressed, weak solutions are discarded in subsequent selection rounds.'
  },

  example3: {
    title: 'Example 3: 0/1 Knapsack (4 Items, Capacity = 15 kg)',
    items: [
      { label: 'Item A', weight: 7, value: 5 },
      { label: 'Item B', weight: 2, value: 4 },
      { label: 'Item C', weight: 1, value: 7 },
      { label: 'Item D', weight: 9, value: 2 }
    ],
    capacity: 15,
    data: [
      { id: 1, bits: '0 1 0 0', weight: 2,  cost: 4,  prob: '0.117', range: '0.000 – 0.117' },
      { id: 2, bits: '0 1 0 1', weight: 11, cost: 6,  prob: '0.176', range: '0.117 – 0.293' },
      { id: 3, bits: '1 1 1 1', weight: 19, cost: 0,  prob: '0.000', range: 'Violates W ≤ 15 (Penalized to 0)' },
      { id: 4, bits: '0 0 1 0', weight: 1,  cost: 7,  prob: '0.205', range: '0.293 – 0.498' },
      { id: 5, bits: '1 0 0 0', weight: 7,  cost: 5,  prob: '0.147', range: '0.498 – 0.645' },
      { id: 6, bits: '1 0 1 0', weight: 8,  cost: 12, prob: '0.352', range: '0.645 – 1.000' }
    ],
    totalFitness: 34,
    optimalString: '1 0 1 0',
    optimalDetail: 'Pack Item A + Item C: Weight = 8 kg ≤ 15 kg, Total Value = 12 (Global Optimum).',
    observation: 'Chromosome 3 (1111, weight 19 kg) violates the capacity constraint and is penalized to zero fitness. Fitter string 6 (1010) is sampled twice into the mating pool, lifting mean fitness from 5.67 to 7.67.'
  },

  schemaTheorem: {
    title: 'Holland’s Schema Theorem & Building Block Hypothesis',
    alphabet: '{0, 1, *} where * is the wildcard / don’t-care symbol',
    formula: 'm(H, t+1) ≥ m(H, t) · [f(H) / f̄] · [1 − p_c · δ(H) / (L − 1) − o(H) · p_m]',
    definitions: [
      { term: 'Order o(H)', desc: 'Number of fixed (non-*) positions in the schema. Governs mutation survival.' },
      { term: 'Defining Length δ(H)', desc: 'Distance between first and last fixed position. Governs crossover disruption.' },
      { term: 'Selection Term [f(H) / f̄]', desc: 'Schemata with above-average fitness grow geometrically in copy count.' },
      { term: 'Crossover Survival [1 − p_c · δ(H) / (L − 1)]', desc: 'Short defining length minimizes probability of a cut falling inside H.' },
      { term: 'Mutation Survival [1 − o(H) · p_m]', desc: 'Low-order schemata have fewer bits at risk of random perturbation.' }
    ],
    workedExample: {
      populationSize: 4,
      length: 5,
      schema: 'H = 1 * * * * (Order o = 1, Defining Length δ = 0)',
      params: 'p_c = 0.6, p_m = 0.01, f(H) = 493, f̄ = 288.75',
      calculation: 'm(H, t+1) ≥ 2 · (493 / 288.75) · [1 − 0.6 · 0/4 − 1 · 0.01] = 2 · 1.707 · 0.99 = 3.38 ≈ 3 to 4 copies',
      conclusion: 'The representation of building block H doubles from 2 to 4 copies in a single generation, confirming the Building Block Hypothesis.'
    }
  }
};
