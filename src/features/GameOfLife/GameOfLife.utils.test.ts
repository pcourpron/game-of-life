import { describe, expect, it } from "vitest";
import { Cell } from "./GameOfLife.types";
import {
  countAliveNeighbors,
  findPrevalentColor,
  generateEmptyGrid,
  hasCorrectPopulationForBirth,
  hasCorrectPopulationForSurvival,
} from "./GameOfLife.utils";

describe("Game of Life Utility Functions", () => {
  describe("hasCorrectPopulationForSurvival", () => {
    it.each([
      [0, false], // fewer than 2 neighbors => die
      [1, false],
      [2, true], // exactly 2 alive neighbors => survive
      [3, true], // exactly 3 alive neighbors => survive
      [4, false], // more than 3 neighbors => die
      [5, false],
      [6, false],
      [7, false],
      [8, false],
    ])(
      "should return %s for %i alive neighbors",
      (aliveNeighbors, expected) => {
        expect(hasCorrectPopulationForSurvival(aliveNeighbors)).toBe(expected);
      }
    );
  });

  describe("hasCorrectPopulationForBirth", () => {
    it.each([
      [0, false],
      [1, false],
      [2, false],
      [3, true], // exactly 3 alive neighbors => birth
      [4, false],
      [5, false],
      [6, false],
      [7, false],
      [8, false],
    ])(
      "should return %s for %i alive neighbors",
      (aliveNeighbors, expected) => {
        expect(hasCorrectPopulationForBirth(aliveNeighbors)).toBe(expected);
      }
    );
  });

  describe("generateEmptyGrid", () => {
    it("should generate a grid of the specified size with all cells dead", () => {
      const size = 5;
      const grid = generateEmptyGrid(size);

      expect(grid.length).toBe(size);

      grid.forEach((row) => {
        expect(row.length).toBe(size);
        row.forEach((cell) => {
          expect(cell.alive).toBe(false);
          expect(cell.color).toBeNull();
        });
      });
    });
  });

  describe("countAliveNeighbors", () => {
    const grid: Cell[][] = [
      [
        { alive: false, color: null },
        { alive: true, color: null },
        { alive: false, color: null },
      ],
      [
        { alive: true, color: null },
        { alive: true, color: null },
        { alive: false, color: null },
      ],
      [
        { alive: false, color: null },
        { alive: false, color: null },
        { alive: false, color: null },
      ],
    ];

    /**
     * Grid:
     * 0 1 0
     * 1 1 0
     * 0 0 0
     */

    it.each([
      // [row, column, grid size, expected alive neighbors]
      [1, 1, 3, 2], // center cell with 2 alive neighbors
      [0, 0, 3, 3], // top-left corner with 3 alive neighbors
      [2, 2, 3, 1], // bottom-right corner with 1 alive neighbor
      [0, 1, 3, 2], // top-center with 2 alive neighbors
    ])(
      "cell in position (%i, %i) in grid of size %i should have %i alive neighbors",
      (row, col, size, expectedAliveCount) => {
        expect(countAliveNeighbors(row, col, size, grid)).toBe(
          expectedAliveCount
        );
      }
    );
  });

  describe("findPrevalentColor", () => {
    const grid: Cell[][] = [
      [
        { alive: false, color: null },
        { alive: true, color: "#FF0000" },
        { alive: false, color: null },
      ],
      [
        { alive: true, color: "#00FF00" },
        { alive: true, color: "#00FF00" },
        { alive: false, color: null },
      ],
      [
        { alive: false, color: null },
        { alive: false, color: null },
        { alive: false, color: null },
      ],
    ];

    /**
     * Grid:
     * 0        #FF000   0
     * #00FF00  #00FF00  0
     * 0        0        0
     **/

    it.each([
      [1, 1, 3, "#FF0000"], // center cell should get the most prevalent color #00FF00
      [0, 0, 3, "#00FF00"], // top-left corner with color #FF0000
      [2, 2, 3, "#00FF00"], // bottom-right with no alive neighbors
    ])(
      " for cell (%i, %i) in a %i grid should return %i",
      (row, col, size, expectedColor) => {
        expect(findPrevalentColor(row, col, size, grid)).toBe(expectedColor);
      }
    );

    it("should return null if no alive neighbors with colors are found", () => {
      const size = 3;
      const grid: Cell[][] = [
        [
          { alive: false, color: null },
          { alive: true, color: null },
          { alive: false, color: null },
        ],
        [
          { alive: true, color: null },
          { alive: true, color: null },
          { alive: false, color: null },
        ],
        [
          { alive: false, color: null },
          { alive: false, color: null },
          { alive: false, color: null },
        ],
      ];

      expect(findPrevalentColor(1, 1, size, grid)).toBeNull();
    });
  });
});
