import { describe, test, expect, beforeEach } from "vitest";
import { TestState, SnippetInfo } from "../../src/types/state";
import { SnippetData, Line, Token } from "../../src/types/snippet";
import { applyExclusionConfig } from "../../src/core/config";
import { getElapsedTime, calculateWPM, calculateAccuracy } from "../../src/core/timer";

/**
 * Integration Tests: Complete Typing Flows
 * 
 * These tests validate end-to-end workflows that span multiple modules,
 * ensuring that timer, config, and state management work together correctly.
 */
describe("Complete Typing Flow Integration", () => {
  let mockSnippet: SnippetData;
  let state: TestState;

  beforeEach(() => {
    // Create a realistic two-line snippet
    mockSnippet = {
      language: "python",
      total_lines: 2,
      lines: [
        {
          line_number: 0,
          indent_level: 0,
          display_tokens: [
            {
              text: "def",
              type: "keyword",
              typeable: true,
              base_typeable: true,
              start_col: 0,
              end_col: 3,
              categories: ["keyword"],
            },
            {
              text: " ",
              type: "whitespace",
              typeable: false,
              base_typeable: false,
              start_col: 3,
              end_col: 4,
              categories: [],
            },
            {
              text: "test",
              type: "identifier",
              typeable: true,
              base_typeable: true,
              start_col: 4,
              end_col: 8,
              categories: ["identifier"],
            },
            {
              text: "(",
              type: "(",
              typeable: true,
              base_typeable: true,
              start_col: 8,
              end_col: 9,
              categories: ["parenthesis"],
            },
            {
              text: ")",
              type: ")",
              typeable: true,
              base_typeable: true,
              start_col: 9,
              end_col: 10,
              categories: ["parenthesis"],
            },
            {
              text: ":",
              type: ":",
              typeable: true,
              base_typeable: true,
              start_col: 10,
              end_col: 11,
              categories: ["punctuation"],
            },
          ],
          typing_sequence: "deftest():",
          char_map: {
            "0": { token_idx: 0, display_col: 0 },
            "1": { token_idx: 0, display_col: 0 },
            "2": { token_idx: 0, display_col: 0 },
            "3": { token_idx: 2, display_col: 4 },
            "4": { token_idx: 2, display_col: 4 },
            "5": { token_idx: 2, display_col: 4 },
            "6": { token_idx: 2, display_col: 4 },
            "7": { token_idx: 3, display_col: 8 },
            "8": { token_idx: 4, display_col: 9 },
            "9": { token_idx: 5, display_col: 10 },
          },
        },
        {
          line_number: 1,
          indent_level: 1,
          display_tokens: [
            {
              text: "    ",
              type: "whitespace",
              typeable: false,
              base_typeable: false,
              start_col: 0,
              end_col: 4,
              categories: [],
            },
            {
              text: "return",
              type: "keyword",
              typeable: true,
              base_typeable: true,
              start_col: 4,
              end_col: 10,
              categories: ["keyword"],
            },
            {
              text: " ",
              type: "whitespace",
              typeable: false,
              base_typeable: false,
              start_col: 10,
              end_col: 11,
              categories: [],
            },
            {
              text: "True",
              type: "boolean",
              typeable: true,
              base_typeable: true,
              start_col: 11,
              end_col: 15,
              categories: [],
            },
          ],
          typing_sequence: "returnTrue",
          char_map: {
            "0": { token_idx: 1, display_col: 4 },
            "1": { token_idx: 1, display_col: 4 },
            "2": { token_idx: 1, display_col: 4 },
            "3": { token_idx: 1, display_col: 4 },
            "4": { token_idx: 1, display_col: 4 },
            "5": { token_idx: 1, display_col: 4 },
            "6": { token_idx: 3, display_col: 11 },
            "7": { token_idx: 3, display_col: 11 },
            "8": { token_idx: 3, display_col: 11 },
            "9": { token_idx: 3, display_col: 11 },
          },
        },
      ],
    };

    // Initialize test state
    state = {
      active: false,
      paused: false,
      startTime: null,
      endTime: null,
      pauseStartTime: null,
      totalPausedTime: 0,
      currentLineIndex: 0,
      currentCharIndex: 0,
      totalCharsTyped: 0,
      totalErrors: 0,
      completedLines: new Set(),
      errorOnCurrentChar: false,
    };
  });

  test("complete typing test without errors", () => {
    // Simulate a complete typing session
    
    // 1. Start test
    state.active = true;
    state.startTime = Date.now();

    // 2. Type first line: "deftest():" (10 chars)
    const firstLine = mockSnippet.lines[0];
    expect(firstLine.typing_sequence).toBe("deftest():");

    for (let i = 0; i < firstLine.typing_sequence.length; i++) {
      state.currentCharIndex++;
      state.totalCharsTyped++;
    }

    expect(state.totalCharsTyped).toBe(10);
    expect(state.totalErrors).toBe(0);

    // 3. Move to second line
    state.completedLines.add(0);
    state.currentLineIndex = 1;
    state.currentCharIndex = 0;

    expect(state.completedLines.size).toBe(1);
    expect(state.completedLines.has(0)).toBe(true);

    // 4. Type second line: "returnTrue" (10 chars)
    const secondLine = mockSnippet.lines[1];
    expect(secondLine.typing_sequence).toBe("returnTrue");

    for (let i = 0; i < secondLine.typing_sequence.length; i++) {
      state.currentCharIndex++;
      state.totalCharsTyped++;
    }

    expect(state.totalCharsTyped).toBe(20); // 10 + 10

    // 5. Complete test
    state.active = false;
    state.endTime = Date.now();
    state.completedLines.add(1);

    // Verify final state
    expect(state.totalCharsTyped).toBe(20);
    expect(state.totalErrors).toBe(0);
    expect(state.completedLines.size).toBe(2);
    expect(state.active).toBe(false);

    // Calculate final metrics
    const elapsed = getElapsedTime(state);
    const wpm = calculateWPM(state.totalCharsTyped, elapsed);
    const accuracy = calculateAccuracy(state.totalCharsTyped, state.totalErrors);

    expect(accuracy).toBe(100); // No errors
    expect(wpm).toBeGreaterThanOrEqual(0);
  });

  test("typing test with pause preserves accuracy", () => {
    // Simulate a typing session with pause
    const now = Date.now();

    // 1. Start test 60 seconds ago
    state.active = true;
    state.startTime = now - 60000;

    // 2. Type some characters
    state.totalCharsTyped = 300;
    state.totalErrors = 15;

    // 3. Pause for 30 seconds (from 30s ago to now)
    state.paused = true;
    state.pauseStartTime = now - 30000;
    state.totalPausedTime = 0; // No previous pauses

    // Calculate metrics while paused
    const elapsedWhilePaused = getElapsedTime(state);
    
    // Should be: 60s total - 30s current pause = 30s of actual typing
    expect(elapsedWhilePaused).toBeCloseTo(30, 0);

    // 4. Resume and add more pause time
    state.paused = false;
    state.pauseStartTime = null;
    state.totalPausedTime = 30000; // Record the pause

    // 5. Continue typing
    state.totalCharsTyped = 450;
    state.totalErrors = 20;

    // Final calculation
    const finalElapsed = getElapsedTime(state);
    const wpm = calculateWPM(state.totalCharsTyped, finalElapsed);
    const accuracy = calculateAccuracy(state.totalCharsTyped, state.totalErrors);

    // Verify pause time excluded from WPM calculation
    expect(finalElapsed).toBeCloseTo(30, 0); // 60s - 30s pause
    expect(wpm).toBeCloseTo(180, 0); // 450 chars / 5 / 0.5 min = 180 WPM
    expect(accuracy).toBe(96); // (450-20)/450 = 95.56 → 96
  });

  test("mode switching regenerates typing sequence correctly", () => {
    // Test that changing modes updates typing sequences appropriately
    const line = mockSnippet.lines[0];

    // Original typing sequence (full mode)
    expect(line.typing_sequence).toBe("deftest():");

    // 1. Apply MINIMAL mode (excludes parentheses and punctuation)
    const minimalResult = applyExclusionConfig(line, "minimal");
    expect(minimalResult.typing_sequence).toBe("deftest");
    
    // Verify tokens are correctly marked
    expect(minimalResult.display_tokens[0].typeable).toBe(true);  // def
    expect(minimalResult.display_tokens[2].typeable).toBe(true);  // test
    expect(minimalResult.display_tokens[3].typeable).toBe(false); // (
    expect(minimalResult.display_tokens[4].typeable).toBe(false); // )
    expect(minimalResult.display_tokens[5].typeable).toBe(false); // :

    // 2. Apply STANDARD mode (includes () and : via includeSpecific)
    const standardResult = applyExclusionConfig(line, "standard");
    expect(standardResult.typing_sequence).toBe("deftest():");

    // Verify includeSpecific works
    expect(standardResult.display_tokens[3].typeable).toBe(true); // (
    expect(standardResult.display_tokens[4].typeable).toBe(true); // )
    expect(standardResult.display_tokens[5].typeable).toBe(true); // :

    // 3. Apply FULL mode (includes everything)
    const fullResult = applyExclusionConfig(line, "full");
    expect(fullResult.typing_sequence).toBe("deftest():");

    // All non-whitespace tokens should be typeable
    fullResult.display_tokens.forEach((token) => {
      if (token.text.trim() !== "") {
        expect(token.typeable).toBe(true);
      }
    });

    // 4. Verify consistency: same source data, different filters
    expect(minimalResult.display_tokens.length).toBe(line.display_tokens.length);
    expect(standardResult.display_tokens.length).toBe(line.display_tokens.length);
    expect(fullResult.display_tokens.length).toBe(line.display_tokens.length);

    // 5. Verify char_map regeneration
    expect(Object.keys(minimalResult.char_map).length).toBe(7);  // "deftest"
    expect(Object.keys(standardResult.char_map).length).toBe(10); // "deftest():"
    expect(Object.keys(fullResult.char_map).length).toBe(10);    // "deftest():"
  });

  test("multi-line typing with errors updates state correctly", () => {
    // Simulate typing with mistakes
    
    // Start test
    state.active = true;
    state.startTime = Date.now();

    // Type first line with 2 errors
    const firstLine = mockSnippet.lines[0];
    state.totalCharsTyped = firstLine.typing_sequence.length;
    state.totalErrors = 2;
    state.currentCharIndex = firstLine.typing_sequence.length;

    expect(state.totalCharsTyped).toBe(10);
    expect(state.totalErrors).toBe(2);

    // Move to second line
    state.completedLines.add(0);
    state.currentLineIndex = 1;
    state.currentCharIndex = 0;

    // Type second line with 1 error
    const secondLine = mockSnippet.lines[1];
    state.totalCharsTyped += secondLine.typing_sequence.length;
    state.totalErrors += 1;
    state.currentCharIndex = secondLine.typing_sequence.length;

    expect(state.totalCharsTyped).toBe(20);
    expect(state.totalErrors).toBe(3);

    // Complete test
    state.active = false;
    state.endTime = Date.now();
    state.completedLines.add(1);

    // Calculate accuracy
    const accuracy = calculateAccuracy(state.totalCharsTyped, state.totalErrors);
    expect(accuracy).toBe(85); // (20-3)/20 = 0.85 → 85%

    // Verify state consistency
    expect(state.completedLines.size).toBe(2);
    expect(state.currentLineIndex).toBe(1);
  });

  test("JSX snippet typing flow with mode filtering", () => {
    // Create a TSX snippet with JSX content
    const jsxSnippet: SnippetData = {
      language: "tsx",
      total_lines: 1,
      lines: [
        {
          line_number: 0,
          indent_level: 0,
          display_tokens: [
            {
              text: "return",
              type: "return",
              typeable: true,
              base_typeable: true,
              start_col: 0,
              end_col: 6,
              categories: ["keyword"],
            },
            {
              text: " ",
              type: "whitespace",
              typeable: false,
              base_typeable: false,
              start_col: 6,
              end_col: 7,
              categories: [],
            },
            {
              text: "<",
              type: "<",
              typeable: true,
              base_typeable: true,
              start_col: 7,
              end_col: 8,
              categories: ["angle_bracket"],
            },
            {
              text: "div",
              type: "identifier",
              typeable: true,
              base_typeable: true,
              start_col: 8,
              end_col: 11,
              categories: [],
            },
            {
              text: ">",
              type: ">",
              typeable: true,
              base_typeable: true,
              start_col: 11,
              end_col: 12,
              categories: ["angle_bracket"],
            },
            {
              text: "Hello",
              type: "jsx_text",
              typeable: true,
              base_typeable: true,
              start_col: 12,
              end_col: 17,
              categories: [],
            },
            {
              text: "</",
              type: "</",
              typeable: true,
              base_typeable: true,
              start_col: 17,
              end_col: 19,
              categories: ["angle_bracket"],
            },
            {
              text: "div",
              type: "identifier",
              typeable: true,
              base_typeable: true,
              start_col: 19,
              end_col: 22,
              categories: [],
            },
            {
              text: ">",
              type: ">",
              typeable: true,
              base_typeable: true,
              start_col: 22,
              end_col: 23,
              categories: ["angle_bracket"],
            },
          ],
          typing_sequence: "return<div>Hello</div>",
          char_map: {},
        },
      ],
    };

    const line = jsxSnippet.lines[0];

    // Test MINIMAL mode: Should exclude JSX tags but include text content
    const minimalResult = applyExclusionConfig(line, "minimal");
    expect(minimalResult.typing_sequence).toBe("returnHello");
    
    // Verify JSX tag names excluded
    expect(minimalResult.display_tokens[3].typeable).toBe(false); // div (opening)
    expect(minimalResult.display_tokens[7].typeable).toBe(false); // div (closing)
    
    // Verify text content included
    expect(minimalResult.display_tokens[5].typeable).toBe(true); // Hello

    // Test STANDARD mode: Same as minimal for JSX
    const standardResult = applyExclusionConfig(line, "standard");
    expect(standardResult.typing_sequence).toBe("returnHello");

    // Test FULL mode: Should include everything
    const fullResult = applyExclusionConfig(line, "full");
    expect(fullResult.typing_sequence).toBe("return<div>Hello</div>");
    
    // All non-whitespace tokens typeable in full mode
    fullResult.display_tokens.forEach((token) => {
      if (token.text.trim() !== "") {
        expect(token.typeable).toBe(true);
      }
    });

    // Simulate typing this in minimal mode
    state.active = true;
    state.startTime = Date.now();
    
    const expectedSequence = "returnHello"; // 11 chars
    state.totalCharsTyped = expectedSequence.length;
    state.totalErrors = 0;

    expect(state.totalCharsTyped).toBe(11);
    
    const accuracy = calculateAccuracy(state.totalCharsTyped, state.totalErrors);
    expect(accuracy).toBe(100);
  });
});