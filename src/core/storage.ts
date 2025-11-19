import { SnippetStats } from "../types/state";
import { firestoreSync } from "./firestoreSync";

// State for sync
let currentUserId: string | null = null;
let isSyncing = false;

/**
 * Load all snippet statistics from localStorage
 * Note: This remains synchronous to ensure UI renders immediately.
 * The sync process updates localStorage in the background.
 */
export function loadSnippetStats(): Record<string, SnippetStats> {
  const saved = localStorage.getItem("treetype_snippet_stats");
  return saved ? JSON.parse(saved) : {};
}

/**
 * Save or update snippet statistics
 * Implements "Dual-Write": Always Local, optionally Cloud
 */
export async function saveSnippetStats(
  snippetId: string,
  wpm: number,
  accuracy: number
): Promise<void> {
  // 1. Load current local state
  const stats = loadSnippetStats();

  // 2. Update logic (same as before)
  if (!stats[snippetId]) {
    stats[snippetId] = {
      bestWPM: wpm,
      bestAccuracy: accuracy,
      practiceCount: 1,
      lastPracticed: new Date().toISOString(),
    };
  } else {
    stats[snippetId].bestWPM = Math.max(stats[snippetId].bestWPM || 0, wpm);
    stats[snippetId].bestAccuracy = Math.max(
      stats[snippetId].bestAccuracy || 0,
      accuracy
    );
    stats[snippetId].practiceCount = (stats[snippetId].practiceCount || 0) + 1;
    stats[snippetId].lastPracticed = new Date().toISOString();
  }

  // 3. Save to LocalStorage (Immediate)
  localStorage.setItem("treetype_snippet_stats", JSON.stringify(stats));
  console.log("Stats saved locally:", snippetId, stats[snippetId]);

  // 4. Save to Firestore (Async, if logged in)
  if (currentUserId) {
    await firestoreSync.saveStat(currentUserId, snippetId, stats[snippetId]);
    console.log("Stats synced to cloud:", snippetId);
  }
}

/**
 * Enable sync for a specific user
 * Triggers an immediate merge of Local + Cloud data
 */
export async function enableFirebaseSync(userId: string): Promise<void> {
  console.log("Enabling Firebase sync for:", userId);
  currentUserId = userId;
  await performSync();
}

/**
 * Disable sync (e.g. on logout)
 */
export function disableFirebaseSync(): void {
  console.log("Disabling Firebase sync");
  currentUserId = null;
}

/**
 * Merge Local and Cloud stats
 * Strategy: Max(WPM, Acc, Count), Newest(Date)
 */
async function performSync() {
  if (!currentUserId || isSyncing) return;
  isSyncing = true;

  try {
    const localStats = loadSnippetStats();
    const remoteStats = await firestoreSync.loadAllStats(currentUserId);
    const mergedStats = { ...localStats };
    let hasChanges = false;

    // Merge Remote into Local
    for (const [id, rStat] of Object.entries(remoteStats)) {
      const lStat = localStats[id];

      if (!lStat) {
        // Remote has it, Local doesn't -> Add it
        mergedStats[id] = rStat;
        hasChanges = true;
      } else {
        // Both have it -> Merge
        const bestWPM = Math.max(lStat.bestWPM, rStat.bestWPM);
        const bestAccuracy = Math.max(lStat.bestAccuracy, rStat.bestAccuracy);
        const practiceCount = Math.max(lStat.practiceCount, rStat.practiceCount);
        
        // Compare dates safely
        const lDate = new Date(lStat.lastPracticed).getTime();
        const rDate = new Date(rStat.lastPracticed).getTime();
        const lastPracticed = lDate > rDate ? lStat.lastPracticed : rStat.lastPracticed;

        // Check if anything actually changed
        if (
          bestWPM !== lStat.bestWPM ||
          bestAccuracy !== lStat.bestAccuracy ||
          practiceCount !== lStat.practiceCount ||
          lastPracticed !== lStat.lastPracticed
        ) {
          mergedStats[id] = {
            bestWPM,
            bestAccuracy,
            practiceCount,
            lastPracticed,
          };
          hasChanges = true;
        }
      }
    }

    // If we merged anything new from cloud, update LocalStorage
    if (hasChanges) {
      localStorage.setItem("treetype_snippet_stats", JSON.stringify(mergedStats));
      console.log("Sync complete: LocalStorage updated with cloud data");
    }

    // "Migration" Step: Ensure Cloud has the full merged state
    // This handles the case where Local had data that Remote didn't
    const updatePromises = Object.entries(mergedStats).map(([id, stat]) => 
      firestoreSync.saveStat(currentUserId!, id, stat)
    );
    
    await Promise.all(updatePromises);
    console.log("Sync complete: Cloud updated with local data");

  } catch (error) {
    console.error("Sync process failed:", error);
  } finally {
    isSyncing = false;
  }
}