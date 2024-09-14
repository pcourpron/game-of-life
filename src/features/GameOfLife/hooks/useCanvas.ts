import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cell } from "../GameOfLife.types";
import { getRandomColor } from "../GameOfLife.utils";

const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const MIN_ZOOM = 1; // Minimum zoom level, i.e., the grid is fully visible
const MAX_ZOOM = 10; // Maximum zoom level
const width = window.innerWidth * 0.8;

export const useCanvas = (
  size: number,
  grid: Cell[][],
  toggleCellState: (row: number, col: number) => void
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CELL_SIZE = useMemo(() => width / size, [size]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCommandPressed, setIsCommandPressed] = useState(false);
  const [lastToggledCell, setLastToggledCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  // if more than 100 cells, zoom in
  const [zoomLevel, setZoomLevel] = useState(size < 100 ? 1 : 5);

  // Function to limit the pan offset to the grid boundaries
  const limitPanOffset = useCallback(
    (offset: { x: number; y: number }, zoom: number = zoomLevel) => {
      const canvas = canvasRef.current;
      if (!canvas) return offset;

      const canvasWidth = canvas.width / zoom;
      const canvasHeight = canvas.height / zoom;

      const maxOffsetX = 0; // The maximum x offset (left edge of the grid)
      const minOffsetX = -(size * CELL_SIZE - canvasWidth); // Right edge of the grid
      const maxOffsetY = 0; // The maximum y offset (top edge of the grid)
      const minOffsetY = -(size * CELL_SIZE - canvasHeight); // Bottom edge of the grid

      return {
        x: Math.min(maxOffsetX, Math.max(minOffsetX, offset.x)),
        y: Math.min(maxOffsetY, Math.max(minOffsetY, offset.y)),
      };
    },
    [CELL_SIZE, size, zoomLevel]
  );

  // Ensure zoom level doesn't allow zooming out beyond the grid size
  const limitZoomLevel = useCallback(
    (newZoomLevel: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return newZoomLevel;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Minimum zoom where the grid is fully visible in the canvas
      const minZoom = Math.max(
        canvasWidth / (size * CELL_SIZE),
        canvasHeight / (size * CELL_SIZE),
        MIN_ZOOM
      );

      return Math.min(MAX_ZOOM, Math.max(minZoom, newZoomLevel));
    },
    [CELL_SIZE, size]
  );

  // Adjust the pan offset after zooming out to prevent zooming out of bounds
  const adjustPanForZoom = useCallback(
    (newZoomLevel: number) => {
      setPanOffset((prevOffset) => limitPanOffset(prevOffset, newZoomLevel));
    },
    [limitPanOffset]
  );

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(panOffset.x, panOffset.y);

    // Adjust the gridline thickness based on the size
    const lineWidth = Math.max(0.2, 2 / size);
    ctx.lineWidth = lineWidth; // Set dynamic line width

    // Draw grid lines
    ctx.strokeStyle = GRID_COLOR;
    for (let i = 0; i <= size; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, size * CELL_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(size * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();

      if (i < size) {
        for (let col = 0; col < size; col++) {
          const { alive, color } = grid[i][col];
          ctx.fillStyle = alive ? color || getRandomColor() : DEAD_COLOR;
          ctx.fillRect(
            col * CELL_SIZE + 0.2,
            i * CELL_SIZE + 0.2,
            CELL_SIZE - 0.4,
            CELL_SIZE - 0.4
          );
        }
      }
    }
    ctx.restore();
  }, [CELL_SIZE, grid, size, panOffset, zoomLevel]);

  const toggleCellOnDrag = useCallback(
    (row: number, col: number) => {
      if (isCommandPressed) return; // Only toggle cell when Command key is not pressed
      if (lastToggledCell?.row !== row || lastToggledCell?.col !== col) {
        toggleCellState(row, col);
        setLastToggledCell({ row, col });
      }
    },
    [lastToggledCell, toggleCellState, isCommandPressed]
  );

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (isCommandPressed) return; // Don't toggle cell if dragging
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (event.clientX - rect.left) / zoomLevel - panOffset.x;
      const y = (event.clientY - rect.top) / zoomLevel - panOffset.y;
      const col = Math.floor(x / CELL_SIZE);
      const row = Math.floor(y / CELL_SIZE);

      toggleCellState(row, col);
    },
    [CELL_SIZE, toggleCellState, zoomLevel, panOffset, isCommandPressed]
  );

  const handleCanvasMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDragging(true);
      handleCanvasClick(event);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (event.clientX - rect.left) / zoomLevel - panOffset.x;
      const y = (event.clientY - rect.top) / zoomLevel - panOffset.y;
      const col = Math.floor(x / CELL_SIZE);
      const row = Math.floor(y / CELL_SIZE);
      // Toggle cell to avoid flickering on first click and drag

      setLastToggledCell({ row, col });
    },
    [handleCanvasClick, zoomLevel, panOffset.x, panOffset.y, CELL_SIZE]
  );

  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (event.clientX - rect.left) / zoomLevel - panOffset.x;
      const y = (event.clientY - rect.top) / zoomLevel - panOffset.y;
      const col = Math.floor(x / CELL_SIZE);
      const row = Math.floor(y / CELL_SIZE);

      // Toggle cell only if the mouse has moved to a new cell
      toggleCellOnDrag(row, col);
    },
    [CELL_SIZE, isDragging, toggleCellOnDrag, zoomLevel, panOffset]
  );

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
    setLastToggledCell(null);
  }, []);

  const handleWheelZoom = useCallback(
    (event: WheelEvent) => {
      if (!isCommandPressed) return; // Only zoom when Command key is pressed
      event.preventDefault();
      const zoomSpeed = 0.001;
      const zoomDelta = event.deltaY * zoomSpeed;

      setZoomLevel((prevZoom) => {
        const newZoom = limitZoomLevel(prevZoom - zoomDelta);
        adjustPanForZoom(newZoom); // Adjust pan if zooming out beyond the grid
        return newZoom;
      });
    },
    [isCommandPressed, limitZoomLevel, adjustPanForZoom]
  );

  const handlePan = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isCommandPressed || !isDragging) return; // Only pan when Command is pressed and dragging
      const movementX = event.movementX / zoomLevel;
      const movementY = event.movementY / zoomLevel;

      setPanOffset((prev) =>
        limitPanOffset({
          x: prev.x + movementX,
          y: prev.y + movementY,
        })
      );
    },
    [isDragging, zoomLevel, isCommandPressed, limitPanOffset]
  );

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.metaKey) {
      setIsCommandPressed(true);
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!event.metaKey) {
      setIsCommandPressed(false);
    }
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheelZoom);
      return () => {
        canvas.removeEventListener("wheel", handleWheelZoom);
      };
    }
  }, [handleWheelZoom]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return {
    canvasRef,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handlePan,
    isDragging,
  };
};
