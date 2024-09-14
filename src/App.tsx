import { useState } from "react";
import "./App.css";
import { GameOfLife } from "./features";

export default function App() {
  const [cellCount, setCellCount] = useState(3); // Cell count value (between 3-1000)
  const [showGame, setShowGame] = useState(false); // State to toggle between input and game

  return (
    <div>
      {!showGame ? (
        <div>
          <p>
            Pick an initial grid size for the Game of Life between 3 and 1000.
          </p>
          <div style={{ marginTop: "10px" }}>
            <p>
              You can pan around the grid using your mouse while pressing the
              command button while dragging. and zoom in or out to see more or
              fewer cells by scrolling while pressing the command key.
            </p>
            <p>
              By default, the game will begin zoomed in if you add more than 100
              cells.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "10px 0 10px 0",
            }}
          >
            <input
              type="range"
              min="3"
              max="1000"
              value={cellCount}
              onChange={(event) => setCellCount(Number(event.target.value))}
            />
            <input
              type="number"
              min="3"
              max="1000"
              value={cellCount}
              onChange={(event) => setCellCount(Number(event.target.value))}
              style={{ marginLeft: "10px", width: "60px" }}
            />
          </div>
          <button
            onClick={() => setShowGame(true)}
            style={{ marginTop: "10px" }}
          >
            Start Game
          </button>
        </div>
      ) : (
        <div>
          <GameOfLife size={cellCount} />
          <button
            onClick={() => setShowGame(false)}
            style={{ marginTop: "10px" }}
          >
            Go back
          </button>
        </div>
      )}
    </div>
  );
}
