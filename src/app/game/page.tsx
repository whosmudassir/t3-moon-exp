"use client";
import React, { useState, useEffect, useCallback } from "react";

const GRID_SIZE = 30;

type Grid = number[][];
type Position = [number, number];
type ValidLetter = "J" | "O" | "H" | "N";
type NamePattern = Record<ValidLetter, Position[]>;

const Game: React.FC = () => {
  const createGrid = (glider = false, randomize = false, name = ""): Grid => {
    // Initialize with explicit size and type
    const grid: Grid = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => 0),
    );

    if (randomize) {
      for (let i = 0; i < GRID_SIZE; i++) {
        const row = grid[i];
        if (row) {
          for (let j = 0; j < GRID_SIZE; j++) {
            row[j] = Math.random() < 0.3 ? 1 : 0;
          }
        }
      }
    }

    if (glider && GRID_SIZE > 3) {
      const gliderPattern: Position[] = [
        [1, 2],
        [2, 3],
        [3, 1],
        [3, 2],
        [3, 3],
      ];
      gliderPattern.forEach(([x, y]) => {
        const row = grid[x];
        if (row) {
          row[y] = 1;
        }
      });
    }

    if (name) {
      const namePattern: NamePattern = {
        J: [
          [0, 0],
          [1, 0],
          [2, 0],
          [2, 1],
          [1, 2],
          [0, 2],
          [0, 3],
        ],
        O: [
          [0, 0],
          [0, 3],
          [2, 0],
          [2, 3],
          [1, 1],
          [1, 2],
        ],
        H: [
          [0, 0],
          [1, 0],
          [2, 0],
          [1, 1],
          [0, 3],
          [1, 3],
          [2, 3],
        ],
        N: [
          [0, 0],
          [1, 1],
          [2, 2],
          [2, 3],
          [0, 3],
          [1, 2],
        ],
      };

      const startX = 5;
      let startY = 5;

      for (const char of name.toUpperCase()) {
        const letter = char as ValidLetter;
        if (Object.prototype.hasOwnProperty.call(namePattern, letter)) {
          const pattern = namePattern[letter];
          pattern.forEach(([dx, dy]) => {
            const x = startX + dx;
            const y = startY + dy;
            if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
              const row = grid[x];
              if (row) {
                row[y] = 1;
              }
            }
          });
        }
        startY += 5;
      }
    }

    return grid;
  };

  const [grid, setGrid] = useState<Grid>(createGrid(true));
  const [running, setRunning] = useState(false);

  const countNeighbors = useCallback(
    (grid: Grid, x: number, y: number): number => {
      const directions: Position[] = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];
      return directions.reduce((count, [dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
          const row = grid[newX];
          if (row) {
            count += row[newY] ?? 0;
          }
        }
        return count;
      }, 0);
    },
    [],
  );

  const nextGeneration = useCallback(() => {
    setGrid((currentGrid) =>
      currentGrid.map((row, x) =>
        row.map((cell, y) => {
          const neighbors = countNeighbors(currentGrid, x, y);
          if (cell === 1 && (neighbors < 2 || neighbors > 3)) {
            return 0; // Cell dies
          }
          if (cell === 0 && neighbors === 3) {
            return 1; // Cell becomes alive
          }
          return cell; // Remains the same
        }),
      ),
    );
  }, [countNeighbors]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      nextGeneration();
    }, 200);

    return () => clearInterval(interval);
  }, [running, nextGeneration]);

  const handleCellClick = (x: number, y: number) => {
    setGrid((currentGrid) => {
      const newGrid = currentGrid.map((row) => [...row]);
      const row = newGrid[x];
      if (row) {
        const currentRow = currentGrid[x];
        if (currentRow) {
          row[y] = currentRow[y] ? 0 : 1;
        }
      }
      return newGrid;
    });
  };

  return (
    <div className="flex flex-col items-center px-4 md:px-10">
      <p className="m-10 text-xl">Conway&apos;s Game of Life</p>
      <div
        className="grid gap-[1px]"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)` }}
      >
        {grid.flatMap((row, x) =>
          row.map((cell, y) => (
            <div
              key={`${x}-${y}`}
              onClick={() => handleCellClick(x, y)}
              className={`h-5 w-5 border ${cell ? "bg-black" : "bg-white"}`}
            />
          )),
        )}
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-2 space-x-2 md:space-x-4">
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={() => setRunning(!running)}
        >
          {running ? "Stop" : "Start"}
        </button>
        <button
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          onClick={() => setGrid(createGrid(true))}
        >
          Start with Glider
        </button>
        <button
          className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
          onClick={() => setGrid(createGrid(false, true))}
        >
          Randomize Grid
        </button>
        <button
          className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
          onClick={() => setGrid(createGrid(false, false, "JOHN"))}
        >
          Start with Name
        </button>
        <button
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          onClick={() => setGrid(createGrid())}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Game;
