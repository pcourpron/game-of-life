import React from "react";
import { GameOfLifeProps } from "./GameOfLife.types";
import { useCanvas, useGameControls, useGridState } from "./hooks";

// Constants for cell size and grid color

const width = window.innerWidth * 0.8;
export const GameOfLife: React.FC<GameOfLifeProps> = ({ size }) => {
  const {
    grid,
    toggleCellState,
    nextGeneration,
    goToPreviousState,
    goToNextState,
    clearGrid,
    currentStep,
    history,
    clearHistory,
  } = useGridState(size);

  const {
    canvasRef,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handlePan,
  } = useCanvas(size, grid, toggleCellState);

  const { isPlaying, togglePlayPause, handleSpeedChange, speed } =
    useGameControls(nextGeneration, clearHistory);

  return (
    <div>
      <h1>Game of Life</h1>
      <div
        className="controls"
        style={{
          display: "flex",
          gap: "5px",
          justifyContent: "center",
          marginBottom: "5px",
        }}
      >
        <button onClick={togglePlayPause}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={goToPreviousState}
          disabled={currentStep === 0 || isPlaying}
        >
          Previous
        </button>
        <button
          onClick={goToNextState}
          disabled={currentStep === history.length || isPlaying}
        >
          Next
        </button>
        <button onClick={clearGrid}>Clear</button>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="range"
            min="500"
            max="1000"
            value={speed}
            onChange={handleSpeedChange}
          />
          <span>Step time: {speed} ms</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={size * (width / size)}
        height={size * (width / size)}
        style={{
          border: "1px solid black",
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onMouseMoveCapture={handlePan}
      />
    </div>
  );
};
