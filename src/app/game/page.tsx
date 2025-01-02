"use client";
import React, { useState, useEffect, useCallback } from "react";

const GRID_SIZE = 30;

type Grid = number[][];

const Game: React.FC = () => {
  // Function to create an empty grid with all cells dead
  const createGrid = (glider = false, randomize = false, name = ""): Grid => {
    const grid: Grid = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => 0),
    );

    if (randomize) {
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          grid[i][j] = Math.random() < 0.3 ? 1 : 0;
        }
      }
    }

    if (glider) {
      grid[1][2] = 1;
      grid[2][3] = 1;
      grid[3][1] = 1;
      grid[3][2] = 1;
      grid[3][3] = 1;
    }

    if (name) {
      const namePattern: Record<string, [number, number][]> = {
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

      let startX = 5;
      let startY = 5;
      for (const letter of name.toUpperCase()) {
        if (namePattern[letter]) {
          namePattern[letter].forEach(([dx, dy]) => {
            const x = startX + dx;
            const y = startY + dy;
            if (x < GRID_SIZE && y < GRID_SIZE) grid[x][y] = 1;
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
      const directions = [
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
          count += grid[newX][newY];
        }
        return count;
      }, 0);
    },
    [],
  );

  const nextGeneration = useCallback(() => {
    setGrid((currentGrid) => {
      return currentGrid.map((row, x) =>
        row.map((cell, y) => {
          const neighbors = countNeighbors(currentGrid, x, y);
          if (cell === 1 && (neighbors < 2 || neighbors > 3)) {
            return 0;
          }
          if (cell === 0 && neighbors === 3) {
            return 1;
          }
          return cell;
        }),
      );
    });
  }, [countNeighbors]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      nextGeneration();
    }, 200);

    return () => clearInterval(interval);
  }, [running, nextGeneration]);

  return (
    <div className="flex flex-col items-center">
      <p className="m-10 text-xl"> Conway's Game of Life </p>
      <div
        className={`grid gap-[1px]`}
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)` }}
      >
        {grid.flatMap((row, x) =>
          row.map((cell, y) => (
            <div
              key={`${x}-${y}`}
              onClick={() => {
                const newGrid = grid.map((row) => [...row]);
                newGrid[x][y] = grid[x][y] ? 0 : 1;
                setGrid(newGrid);
              }}
              className={`h-5 w-5 border ${cell ? "bg-black" : "bg-white"}`}
            />
          )),
        )}
      </div>
      <div className="mt-10 flex space-x-2">
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
          onClick={() => setGrid(createGrid(false, false, "John"))}
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
