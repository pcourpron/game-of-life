// useGameControls.test.ts
import { act, renderHook } from "@testing-library/react";
import { ChangeEvent } from "react";
import { vi } from "vitest";
import { useGameControls } from "./useGameControls";

describe("useGameControls", () => {
  it("should initialize with isPlaying false and speed 500", () => {
    const nextGeneration = vi.fn();
    const { result } = renderHook(() =>
      useGameControls(nextGeneration, vi.fn())
    );

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.speed).toBe(500);
  });

  it("should toggle isPlaying when togglePlayPause is called", () => {
    const nextGeneration = vi.fn();
    const { result } = renderHook(() =>
      useGameControls(nextGeneration, vi.fn())
    );

    act(() => {
      result.current.togglePlayPause();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.togglePlayPause();
    });
    expect(result.current.isPlaying).toBe(false);
  });

  it("should update speed when handleSpeedChange is called", () => {
    const nextGeneration = vi.fn();
    const { result } = renderHook(() =>
      useGameControls(nextGeneration, vi.fn())
    );

    const event = {
      target: { value: "1000" },
    } as ChangeEvent<HTMLInputElement>;
    act(() => {
      result.current.handleSpeedChange(event);
    });

    expect(result.current.speed).toBe(1000);
  });

  it("should call nextGeneration at intervals when playing", () => {
    vi.useFakeTimers();
    const nextGeneration = vi.fn();
    const { result } = renderHook(() =>
      useGameControls(nextGeneration, vi.fn())
    );

    act(() => {
      result.current.togglePlayPause();
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(nextGeneration).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(nextGeneration).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("should update interval when speed changes", () => {
    vi.useFakeTimers();
    const nextGeneration = vi.fn();
    const { result } = renderHook(() =>
      useGameControls(nextGeneration, vi.fn())
    );

    // Start playing
    act(() => {
      result.current.togglePlayPause();
    });

    // Advance time by the initial speed
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(nextGeneration).toHaveBeenCalledTimes(1);

    // Change speed to 1000ms
    const event = {
      target: { value: "1000" },
    } as ChangeEvent<HTMLInputElement>;
    act(() => {
      result.current.handleSpeedChange(event);
    });

    // Advance time by the new speed
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(nextGeneration).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("should clear interval when paused", () => {
    vi.useFakeTimers();
    const nextGeneration = vi.fn();
    const { result } = renderHook(() =>
      useGameControls(nextGeneration, vi.fn())
    );

    // Start playing
    act(() => {
      result.current.togglePlayPause();
    });

    // Advance time and ensure nextGeneration is called
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(nextGeneration).toHaveBeenCalledTimes(1);

    // Pause the game
    act(() => {
      result.current.togglePlayPause();
    });

    // Advance time and ensure nextGeneration is not called again
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(nextGeneration).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
