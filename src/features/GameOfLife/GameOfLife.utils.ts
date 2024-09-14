import { Cell } from "./GameOfLife.types";

export const hasCorrectPopulationForSurvival = (aliveNeighbors: number) => {
  return aliveNeighbors === 2 || aliveNeighbors === 3;
};
export const hasCorrectPopulationForBirth = (aliveNeighbors: number) => {
  return aliveNeighbors === 3;
};

export const getRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

// Generate an empty grid with dead cells
export function generateEmptyGrid(size: number): Cell[][] {
  return Array.from({ length: size }, () =>
    Array(size).fill({ alive: false, color: null })
  );
}

// Count alive neighbors for a specific cell
export const countAliveNeighbors = (
  row: number,
  col: number,
  size: number,
  grid: Cell[][]
): number => {
  let aliveCount = 0;

  const startRow = Math.max(row - 1, 0);
  const endRow = Math.min(row + 1, size - 1);
  const startCol = Math.max(col - 1, 0);
  const endCol = Math.min(col + 1, size - 1);

  for (let i = startRow; i <= endRow; i++) {
    for (let j = startCol; j <= endCol; j++) {
      if (i === row && j === col) continue; // Skip the cell itself
      if (grid[i][j].alive) aliveCount++;
    }
  }

  return aliveCount;
};

// Find the most prevalent color among alive neighbors
export const findPrevalentColor = (
  row: number,
  col: number,
  size: number,
  grid: Cell[][]
): string | null => {
  const colorCounts: { [key: string]: number } = {};

  const startRow = Math.max(row - 1, 0);
  const endRow = Math.min(row + 1, size - 1);
  const startCol = Math.max(col - 1, 0);
  const endCol = Math.min(col + 1, size - 1);

  for (let i = startRow; i <= endRow; i++) {
    for (let j = startCol; j <= endCol; j++) {
      if (i === row && j === col) continue; // Skip the cell itself
      const neighbor = grid[i][j];
      if (neighbor.alive && neighbor.color) {
        colorCounts[neighbor.color] = (colorCounts[neighbor.color] || 0) + 1;
      }
    }
  }

  let prevalentColor: string | null = null;
  let maxCount = 0;

  for (const color in colorCounts) {
    if (colorCounts[color] > maxCount) {
      prevalentColor = color;
      maxCount = colorCounts[color];
    }
  }

  return prevalentColor;
};
