import { useCallback, useEffect, useRef, useState } from "react";

// Hook to manage game controls (play, pause, speed, etc.)
export const useGameControls = (
  nextGeneration: () => void,
  onPlay: () => void
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // Speed in milliseconds
  const intervalRef = useRef<number | null>(null);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
    if (!isPlaying) {
      onPlay();
    }
  }, [isPlaying, onPlay]);

  const handleSpeedChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newSpeed = Number(event.target.value);
      setSpeed((prevSpeed) => (newSpeed !== prevSpeed ? newSpeed : prevSpeed)); // Only update if value changed
    },
    []
  );

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(nextGeneration, speed);
    } else if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, nextGeneration]);

  return { isPlaying, togglePlayPause, handleSpeedChange, speed };
};
