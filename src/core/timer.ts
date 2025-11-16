import { TestState } from "../types/state";

/**
 * Calculate elapsed time excluding pauses
 * @param state - Current test state
 * @returns Elapsed time in seconds
 */
export function getElapsedTime(state: TestState): number {
  if (!state.active || !state.startTime) return 0;

  const now = Date.now();
  let elapsedMs = now - state.startTime - state.totalPausedTime;

  // If currently paused, exclude the current pause duration
  if (state.paused && state.pauseStartTime) {
    const currentPauseDuration = now - state.pauseStartTime;
    elapsedMs -= currentPauseDuration;
  }

  return elapsedMs / 1000; // Return seconds
}

/**
 * Calculate words per minute
 * Standard: 5 characters = 1 word
 * @param charsTyped - Total characters typed
 * @param elapsedSeconds - Time elapsed in seconds
 * @returns WPM rounded to nearest integer
 */
export function calculateWPM(
  charsTyped: number,
  elapsedSeconds: number
): number {
  if (elapsedSeconds <= 0) return 0;
  const elapsedMinutes = elapsedSeconds / 60;
  return Math.round(charsTyped / 5 / elapsedMinutes);
}

/**
 * Calculate typing accuracy percentage
 * @param totalChars - Total characters typed
 * @param errors - Number of errors made
 * @returns Accuracy percentage (0-100)
 */
export function calculateAccuracy(totalChars: number, errors: number): number {
  if (totalChars === 0) return 100;
  return Math.round(((totalChars - errors) / totalChars) * 100);
}

/**
 * Format elapsed time as MM:SS
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
