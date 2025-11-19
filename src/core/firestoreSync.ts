import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";
import { SnippetStats } from "../types/state";

const COLLECTION_NAME = "users";
const STATS_SUBCOLLECTION = "stats";

export const firestoreSync = {
  /**
   * Save a single snippet's stats to Firestore
   */
  async saveStat(
    userId: string,
    snippetId: string,
    stats: SnippetStats
  ): Promise<void> {
    try {
      const statRef = doc(
        db,
        COLLECTION_NAME,
        userId,
        STATS_SUBCOLLECTION,
        snippetId
      );
      await setDoc(statRef, stats);
    } catch (error) {
      console.error("Firestore save failed:", error);
      // We don't throw here to prevent disrupting the user experience
      // The local storage remains the source of truth for the session
    }
  },

  /**
   * Load all stats for a user from Firestore
   */
  async loadAllStats(userId: string): Promise<Record<string, SnippetStats>> {
    try {
      const statsRef = collection(
        db,
        COLLECTION_NAME,
        userId,
        STATS_SUBCOLLECTION
      );
      const snapshot = await getDocs(statsRef);
      const results: Record<string, SnippetStats> = {};

      snapshot.forEach((doc) => {
        results[doc.id] = doc.data() as SnippetStats;
      });

      return results;
    } catch (error) {
      console.error("Firestore load failed:", error);
      return {}; // Return empty on failure so local stats are preserved
    }
  },
};