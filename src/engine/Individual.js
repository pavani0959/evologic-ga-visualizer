// ============================================================
// Individual Class: Encapsulates Genotype & Phenotype
// ============================================================
import { PROBLEMS } from './problems.js';

export class Individual {
  constructor(genes, problemId) {
    this.genes = [...genes];
    this.problemId = problemId;
    this.fitness = 0;
    this.rawCost = 0;
    this.phenotype = null;
    this.selectionProb = 0;
    this.isElite = false;
    this.isSelected = false;
  }

  evaluate(contextData) {
    const prob = PROBLEMS[this.problemId];

    if (this.problemId === 'tsp') {
      const cities = contextData || prob.defaultCities;
      let totalDistance = 0;
      const n = this.genes.length;

      for (let i = 0; i < n; i++) {
        const c1 = cities[this.genes[i]];
        const c2 = cities[this.genes[(i + 1) % n]];
        if (c1 && c2) {
          totalDistance += Math.hypot(c1.x - c2.x, c1.y - c2.y);
        }
      }

      this.rawCost = Math.round(totalDistance * 10) / 10;
      // Fitness: inversely proportional to distance (higher is better)
      this.fitness = totalDistance > 0 ? +(10000 / totalDistance).toFixed(4) : 0;
      this.phenotype = {
        distance: this.rawCost,
        routeStr: this.genes.map(idx => (cities[idx] ? cities[idx].label : idx)).join(' → ')
      };

    } else if (this.problemId === 'funcopt' || this.problemId === 'worked_fx2' || this.problemId === 'worked_quad') {
      const bits = this.genes.length;
      const intVal = this.genes.reduce((acc, bit, idx) => acc + (bit * Math.pow(2, bits - 1 - idx)), 0);

      if (this.problemId === 'worked_fx2') {
        const x = intVal; // x is integer 0..31
        const fx = x * x;
        this.rawCost = fx;
        this.fitness = fx;
        this.phenotype = { x, fx, binaryStr: this.genes.join('') };
      } else if (this.problemId === 'worked_quad') {
        const x = +( (2 / 31) * intVal ).toFixed(4);
        const fx = Math.max(0, +( -(x * x) + 2 * x ).toFixed(4));
        this.rawCost = fx;
        this.fitness = fx;
        this.phenotype = { x, fx, binaryStr: this.genes.join('') };
      } else {
        // Standard funcopt: f(x) = x * sin(x) + 32
        const maxInt = Math.pow(2, bits) - 1;
        const x = +(prob.xMin + (intVal / maxInt) * (prob.xMax - prob.xMin)).toFixed(4);
        const fx = +(x * Math.sin(x) + 32).toFixed(4);
        this.rawCost = fx;
        this.fitness = fx;
        this.phenotype = { x, fx, binaryStr: this.genes.join('') };
      }

    } else if (this.problemId === 'knapsack' || this.problemId === 'worked_knapsack') {
      const items = prob.items;
      let totalWeight = 0;
      let totalValue = 0;
      const packedItems = [];

      this.genes.forEach((bit, i) => {
        if (bit === 1 && items[i]) {
          totalWeight += items[i].weight;
          totalValue += items[i].value;
          packedItems.push(items[i].name);
        }
      });

      this.rawCost = totalValue;
      // Penalty function for capacity violation
      if (totalWeight <= prob.capacity) {
        this.fitness = totalValue;
      } else {
        const excess = totalWeight - prob.capacity;
        this.fitness = Math.max(0, +(totalValue - excess * 6).toFixed(2));
      }

      this.phenotype = {
        totalWeight,
        totalValue,
        capacity: prob.capacity,
        isValid: totalWeight <= prob.capacity,
        packedItems
      };
    }

    return this.fitness;
  }

  clone() {
    const copy = new Individual(this.genes, this.problemId);
    copy.fitness = this.fitness;
    copy.rawCost = this.rawCost;
    copy.phenotype = this.phenotype ? JSON.parse(JSON.stringify(this.phenotype)) : null;
    copy.selectionProb = this.selectionProb;
    copy.isElite = this.isElite;
    copy.isSelected = this.isSelected;
    return copy;
  }
}

