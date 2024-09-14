import { useCallback, useState } from "react";
import { Cell } from "../GameOfLife.types";
import {
  countAliveNeighbors,
  findPrevalentColor,
  generateEmptyGrid,
  getRandomColor,
  hasCorrectPopulationForBirth,
  hasCorrectPopulationForSurvival,
} from "../GameOfLife.utils";

// Hook to manage grid state, including next generation calculation and toggling cells
export const useGridState = (size: number) => {
  const [grid, setGrid] = useState<Cell[][]>(() => generateEmptyGrid(size)); // Lazy initialization
  const [history, setHistory] = useState<Cell[][][]>([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const toggleCellState = useCallback((row: number, col: number) => {
    setGrid((prevGrid) => {
      const newRow = [...prevGrid[row]];
      const cell = newRow[col];
      newRow[col] = {
        ...cell,
        alive: !cell.alive,
        color: !cell.alive ? getRandomColor() : null,
      };

      const newGrid = [...prevGrid];
      newGrid[row] = newRow;
      return newGrid;
    });
  }, []);

  const nextGeneration = useCallback(() => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row, rIndex) =>
        row.map((cell, cIndex) => {
          const aliveNeighbors = countAliveNeighbors(
            rIndex,
            cIndex,
            size,
            prevGrid
          );
          const prevalentColor = findPrevalentColor(
            rIndex,
            cIndex,
            size,
            prevGrid
          );

          if (cell.alive && hasCorrectPopulationForSurvival(aliveNeighbors)) {
            return { ...cell }; // Survive
          } else if (
            !cell.alive &&
            hasCorrectPopulationForBirth(aliveNeighbors)
          ) {
            return { alive: true, color: prevalentColor ?? getRandomColor() }; // Birth
          } else {
            return { ...cell, alive: false, color: null }; // Death
          }
        })
      );

      setHistory((prevHistory) => [...prevHistory, prevGrid]);
      setCurrentStep((prevStep) => prevStep + 1);
      return newGrid;
    });
  }, [size]);

  const goToPreviousState = useCallback(() => {
    if (currentStep > 0) {
      setGrid(history[currentStep - 1]);
      setCurrentStep((prevStep) => prevStep - 1);
    }
  }, [currentStep, history]);

  const goToNextState = useCallback(() => {
    if (currentStep < history.length - 1) {
      setGrid(history[currentStep + 1]);
      setCurrentStep((prevStep) => prevStep + 1);
    }
  }, [currentStep, history]);

  const clearGrid = useCallback(() => {
    setGrid(generateEmptyGrid(size));
    setHistory([]);
    setCurrentStep(0);
  }, [size]);

  const clearHistory = useCallback(
    (step: number = currentStep) => {
      setHistory(history.slice(0, step));
    },
    [history, currentStep]
  );

  return {
    grid,
    toggleCellState,
    nextGeneration,
    goToPreviousState,
    goToNextState,
    clearGrid,
    clearHistory,
    currentStep,
    history,
  };
};
