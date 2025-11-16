import { PresetsConfig, UserConfig, TypingMode } from "../types/config";
import { Line, Token } from "../types/snippet";

/**
 * Preset configurations for typing modes
 */
export const PRESETS: PresetsConfig = {
  minimal: {
    name: "Minimal",
    description: "Type only keywords and identifiers",
    exclude: [
      "parenthesis",
      "curly_brace",
      "square_bracket",
      "angle_bracket",
      "operator",
      "punctuation",
      "string_content",
      "string_delimiter",
      "comment",
    ],
  },
  standard: {
    name: "Standard",
    description: "Balanced practice without pinky strain (recommended)",
    exclude: [
      "curly_brace",
      "square_bracket",
      "angle_bracket",
      "string_content",
      "punctuation",
      "string_delimiter",
      "comment",
    ],
    includeSpecific: [":", ".", ",", "(", ")"],
  },
  full: {
    name: "Full",
    description: "Type everything except whitespace and comments",
    exclude: ["comment", "string_content"],
  },
};

/**
 * Default user configuration
 */
export const DEFAULT_CONFIG: UserConfig = {
  preset: "standard",
  language: "python",
};

/**
 * Apply exclusion config to line data based on selected preset
 * @param lineData - Line data to filter
 * @param preset - Selected typing mode preset
 * @returns Filtered line data with updated typeable flags
 */
export function applyExclusionConfig(lineData: Line, preset: TypingMode): Line {
  const config = PRESETS[preset];

  const filteredTokens: Token[] = lineData.display_tokens.map((token) => {
    let typeable = token.base_typeable;

    if (!typeable) {
      return { ...token, typeable };
    }

    if (!token.categories || token.categories.length === 0) {
      return { ...token, typeable: true };
    }

    // Check includeSpecific first (overrides exclusions)
    if (config.includeSpecific?.includes(token.text)) {
      return { ...token, typeable: true };
    }

    // Check if any category is excluded
    for (const category of token.categories) {
      if (config.exclude.includes(category)) {
        typeable = false;
        break;
      }
    }

    return { ...token, typeable };
  });

  // Regenerate typing sequence from filtered tokens
  const typingSequence = filteredTokens
    .filter((t) => t.typeable)
    .map((t) => t.text)
    .join("");

  // Regenerate char_map for filtered tokens
  const charMap: Line["char_map"] = {};
  let charIdx = 0;
  const typeableTokens = filteredTokens.filter((t) => t.typeable);

  typeableTokens.forEach((token, tokenIdx) => {
    for (let i = 0; i < token.text.length; i++) {
      charMap[String(charIdx)] = {
        token_idx: tokenIdx,
        display_col: token.start_col,
      };
      charIdx++;
    }
  });

  return {
    ...lineData,
    display_tokens: filteredTokens,
    typing_sequence: typingSequence,
    char_map: charMap,
  };
}

/**
 * Save user configuration to localStorage
 * @param config - User configuration to save
 */
export function saveConfig(config: UserConfig): void {
  localStorage.setItem("treetype_config", JSON.stringify(config));
}

/**
 * Load user configuration from localStorage
 * @returns User configuration or default if none saved
 */
export function loadConfig(): UserConfig {
  const saved = localStorage.getItem("treetype_config");
  return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
}
