import { SnippetStats } from "../types/state";

/**
 * Load all snippet statistics from localStorage
 * @returns Record of snippet IDs to their statistics
 */
export function loadSnippetStats(): Record<string, SnippetStats> {
  const saved = localStorage.getItem("treetype_snippet_stats");
  return saved ? JSON.parse(saved) : {};
}

/**
 * Save or update snippet statistics
 * @param snippetId - Unique identifier for the snippet
 * @param wpm - Words per minute achieved
 * @param accuracy - Accuracy percentage achieved
 */
export function saveSnippetStats(
  snippetId: string,
  wpm: number,
  accuracy: number
): void {
  const stats = loadSnippetStats();

  if (!stats[snippetId]) {
    // First time practicing this snippet
    stats[snippetId] = {
      bestWPM: wpm,
      bestAccuracy: accuracy,
      practiceCount: 1,
      lastPracticed: new Date().toISOString(),
    };
  } else {
    // Update existing stats with best scores
    stats[snippetId].bestWPM = Math.max(stats[snippetId].bestWPM || 0, wpm);
    stats[snippetId].bestAccuracy = Math.max(
      stats[snippetId].bestAccuracy || 0,
      accuracy
    );
    stats[snippetId].practiceCount = (stats[snippetId].practiceCount || 0) + 1;
    stats[snippetId].lastPracticed = new Date().toISOString();
  }

  localStorage.setItem("treetype_snippet_stats", JSON.stringify(stats));
  console.log("Stats saved:", snippetId, stats[snippetId]);
}
