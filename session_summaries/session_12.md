# Session 12 Summary: Phase 5 Strategic Planning & Design Decisions

## Session Overview

This session focused on **strategic planning** for Phase 5 rather than implementation. We discussed the philosophy behind the app, clarified technical constraints, and made key design decisions for the Configuration UI feature.

---

## Key Discussions

### 1. **App Philosophy & Constraints Clarified**

**Target User:** You (the developer) - building for personal use first, not attempting to serve everyone.

**Core Purpose:** Practice typing code to build muscle memory for TS, TSX, Python, and JS.

**Non-Negotiable Features:**
- **Auto-jump whitespace** (spaces, tabs, newlines) - this is a core differentiator
- **User-provided code** - the killer feature (own scripts, others' code, LLM-generated patterns)
- **Simple, maintainable parser** - prioritize debuggability over optimization

**Current Problem Identified:**
- The hardcoded "Minimal" mode is too extreme
- Users currently type ONLY keywords and identifiers (e.g., `constresultcalculatexy` for `const result = calculate(x + y);`)
- This misses important syntax patterns like operators (`=`, `+`) and punctuation (`:`, `;`)

---

### 2. **Multi-line Comments/Docstrings Research**

**Question:** Are multi-line comments/docstrings safe to make typeable, or will they break the parser?

**Research Findings (100% Confidence):**
- ✅ Tree-sitter parses multi-line nodes as **single nodes** with spans across multiple rows
- ✅ This is Tree-sitter's **correct, documented behavior** (not a bug)
- ✅ The `atomic_types` approach in `get_leaves()` is a **design choice**, not a workaround
- ✅ Removing `'comment'` from `atomic_types` will NOT break parsing

**Technical Challenge Identified:**
- Current `char_map` only stores column position: `{'display_col': int}`
- Multi-line typeable nodes would require: `{'display_row': int, 'display_col': int}`
- This is a **small refactor**, not a fundamental architecture problem

**Decision:** Keep comments/docstrings **NON-TYPEABLE** in Phase 5 for simplicity. Export category metadata so they CAN be made typeable in a future phase if desired.

---

### 3. **Preset System Design**

**Agreed Presets:**

#### **Preset 1: "Minimal"** (Current Behavior)
- **User types:** Keywords + Identifiers only
- **Auto-jumped:** Operators, punctuation, brackets, quotes, string content, comments
- **Use case:** Fastest typing, pure vocabulary focus
- **Example:** `const result = calculate(x + y);` → user types `constresultcalculatexy`

#### **Preset 2: "Standard"** ⭐ (Recommended Default)
- **User types:** Keywords, identifiers, operators (`=`, `+`, `-`, `*`, `/`), some punctuation (`:`, `;`)
- **Auto-jumped:** Brackets (`()`, `[]`, `{}`, `<>`), quotes (`"`, `'`, `` ` ``), string content, comments, commas, periods
- **Use case:** Realistic typing experience without awkward bracket reaches
- **Rationale:** Sweet spot between speed and comprehensive practice

#### **Preset 3: "Full"** (Maximum Practice)
- **User types:** Everything except whitespace and comments/string content
- **Auto-jumped:** Only whitespace (spaces, tabs, newlines), comments, string content
- **Use case:** Most comprehensive muscle memory building
- **Note:** Still excludes comments/string content to avoid typing prose and to keep Phase 5 implementation simple

---

### 4. **Token Categories System**

**Agreed Categories:**
1. `comment` - Single-line and multi-line comments
2. `string_content` - Content inside string literals (excluding delimiters)
3. `string_delimiter` - Quotes: `"`, `'`, `` ` ``
4. `punctuation` - `:`, `;`, `,`, `.`
5. `bracket` - `(`, `)`, `[`, `]`, `{`, `}`, `<`, `>`
6. `operator` - `=`, `+`, `-`, `*`, `/`, `%`, `!`, `&`, `|`, `^`, `~`, `->`, `=>`, `++`, `--`, `+=`, `-=`, `*=`, `/=`, `?`

**Note:** JSX-specific syntax (`</`, `/>`) should be categorized appropriately.

---

### 5. **Configuration UI Design**

**Agreed Approach: Simple Radio Button Presets**

```
┌─────────────────────────────────────┐
│ Typing Mode:                        │
│  ○ Minimal    ● Standard   ○ Full   │
└─────────────────────────────────────┘
```

**Rationale:**
- No checkboxes initially (reduces complexity)
- Three clear presets that cover the spectrum
- Can expand to granular controls later if needed
- Fits naturally next to language selector in controls area

**Placement:** Always visible in the controls area (above code display), next to the language selector.

**Default:** "Standard" preset (recommended for balanced experience).

---

## Decisions Made for Phase 5 Implementation

### ✅ **Phase 5.1: Parser Refactor**

**Changes to `parse_json.py`:**

1. **Keep `atomic_types` as-is** (comments and string_content remain atomic):
   ```python
   atomic_types = {'string_content', 'comment'}
   ```

2. **Refactor `is_non_typeable()`:**
   - Only mark **structural whitespace** as truly non-typeable
   - Everything else gets `base_typeable: true` in JSON

3. **Add `categorize_token()` function:**
   ```python
   def categorize_token(token_type, token_text):
       """Classify tokens into categories for frontend filtering"""
       categories = []
       
       if 'comment' in token_type.lower():
           categories.append('comment')
       if 'string' in token_type.lower() and 'content' in token_type.lower():
           categories.append('string_content')
       if token_text in {'"', "'", '`'}:
           categories.append('string_delimiter')
       if token_text in {':', ';', ',', '.'}:
           categories.append('punctuation')
       if token_text in {'(', ')', '[', ']', '{', '}', '<', '>'}:
           categories.append('bracket')
       if token_text in {'=', '+', '-', '*', '/', '%', '!', '&', '|', '^', '~', '->', '=>', '++', '--', '+=', '-=', '*=', '/=', '?'}:
           categories.append('operator')
       
       return categories
   ```

4. **Export enhanced JSON:**
   ```json
   {
     "text": "=",
     "type": "operator",
     "categories": ["operator"],
     "base_typeable": true,
     "start_col": 10,
     "end_col": 11
   }
   ```

**Time Estimate:** 2-3 hours

---

### ✅ **Phase 5.2: Configuration UI**

**Add to `render_code.html` controls area:**

```html
<div class="mb-6 flex gap-4 items-center">
  <label class="text-gray-300">Language:</label>
  <select id="languageSelect" class="bg-gray-800 text-white px-4 py-2 rounded border border-gray-600">
    <!-- existing options -->
  </select>

  <!-- NEW: Typing Mode Selector -->
  <label class="text-gray-300 ml-6">Typing Mode:</label>
  <div class="flex gap-2">
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="radio" name="typingMode" value="minimal" class="cursor-pointer">
      <span class="text-sm">Minimal</span>
    </label>
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="radio" name="typingMode" value="standard" checked class="cursor-pointer">
      <span class="text-sm">Standard</span>
    </label>
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="radio" name="typingMode" value="full" class="cursor-pointer">
      <span class="text-sm">Full</span>
    </label>
  </div>

  <button id="resetBtn" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
    Reset (Esc)
  </button>

  <div id="testStatus" class="ml-auto text-sm">
    <span class="text-gray-400">Press any key to start...</span>
  </div>
</div>
```

**Time Estimate:** 1 hour

---

### ✅ **Phase 5.3: Client-Side Filtering**

**Add preset configuration logic:**

```javascript
const PRESETS = {
  minimal: {
    exclude: ['bracket', 'operator', 'punctuation', 'string_content', 'string_delimiter', 'comment']
  },
  standard: {
    exclude: ['bracket', 'string_content', 'string_delimiter', 'comment']
    // User types: keywords, identifiers, operators, some punctuation (:;)
  },
  full: {
    exclude: ['comment', 'string_content']
    // User types: everything except whitespace, comments, and string literals
  }
};

function applyExclusionConfig(lineData, preset) {
  const config = PRESETS[preset];
  
  // Filter tokens based on preset
  const filteredTokens = lineData.display_tokens.map(token => {
    let typeable = token.base_typeable;
    
    // Check if any of the token's categories are in the exclusion list
    if (token.categories) {
      for (const category of token.categories) {
        if (config.exclude.includes(category)) {
          typeable = false;
          break;
        }
      }
    }
    
    return { ...token, typeable };
  });
  
  // Regenerate typing_sequence
  const typingSequence = filteredTokens
    .filter(t => t.typeable)
    .map(t => t.text)
    .join('');
  
  // Regenerate char_map
  const charMap = {};
  let charIdx = 0;
  filteredTokens.forEach((token, tokenIdx) => {
    if (token.typeable) {
      for (let i = 0; i < token.text.length; i++) {
        charMap[String(charIdx)] = {
          token_idx: tokenIdx,
          display_col: token.start_col
        };
        charIdx++;
      }
    }
  });
  
  return {
    ...lineData,
    display_tokens: filteredTokens,
    typing_sequence: typingSequence,
    char_map: charMap
  };
}
```

**Apply on language load and config change:**

```javascript
async function loadLanguage(language) {
  const response = await fetch(`output/json_samples/${language}_sample.json`);
  const rawData = await response.json();
  
  // Get current preset
  const preset = document.querySelector('input[name="typingMode"]:checked').value;
  
  // Apply filtering to all lines
  currentData = {
    ...rawData,
    lines: rawData.lines.map(line => applyExclusionConfig(line, preset))
  };
  
  resetTest();
}

// Add event listener for preset changes
document.querySelectorAll('input[name="typingMode"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (currentData) {
      loadLanguage(document.getElementById('languageSelect').value);
    }
  });
});
```

**Time Estimate:** 2-3 hours

---

### ✅ **Phase 5.4: Persist User Preferences**

**Save/load config from localStorage:**

```javascript
const DEFAULT_CONFIG = {
  preset: 'standard',
  language: 'python'
};

function saveConfig() {
  const config = {
    preset: document.querySelector('input[name="typingMode"]:checked').value,
    language: document.getElementById('languageSelect').value
  };
  localStorage.setItem('treetype_config', JSON.stringify(config));
}

function loadConfig() {
  const saved = localStorage.getItem('treetype_config');
  return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
}

// On page load
document.addEventListener('DOMContentLoaded', () => {
  const config = loadConfig();
  
  // Set preset
  document.querySelector(`input[name="typingMode"][value="${config.preset}"]`).checked = true;
  
  // Set language
  document.getElementById('languageSelect').value = config.language;
  
  // Load
  loadLanguage(config.language);
  document.getElementById('codeDisplay').focus();
});

// Save on change
document.querySelectorAll('input[name="typingMode"]').forEach(radio => {
  radio.addEventListener('change', saveConfig);
});

document.getElementById('languageSelect').addEventListener('change', saveConfig);
```

**Time Estimate:** 1 hour

---

### ✅ **Phase 5.5: Testing**

**Test Matrix:**

| Language   | Minimal | Standard | Full |
|------------|---------|----------|------|
| Python     | ✅      | ✅       | ✅   |
| JavaScript | ✅      | ✅       | ✅   |
| TypeScript | ✅      | ✅       | ✅   |
| TSX        | ✅      | ✅       | ✅   |

**Validation Checks:**
- ✅ Progressive reveal works correctly in all modes
- ✅ Typing sequence matches expectations for each preset
- ✅ Character highlighting accurate
- ✅ Config persists across page reloads
- ✅ Switching presets mid-test resets correctly
- ✅ All 4 languages render identically per preset

**Time Estimate:** 2 hours

---

## Total Phase 5 Time Estimate

**8-10 hours total:**
- 5.1 Parser Refactor: 2-3 hours
- 5.2 Config UI: 1 hour
- 5.3 Client-Side Filtering: 2-3 hours
- 5.4 Persist Preferences: 1 hour
- 5.5 Testing: 2 hours

---

## Future Considerations (Post-Phase 5)

### **Phase 6.5 or 7: Advanced Features**
- **Typeable Comments/Docstrings** (requires `char_map` refactor to track `display_row`)
- **Granular Checkboxes** (if users want more control than presets)
- **Custom Token Exclusions** (advanced users can define their own rules)

### **Phase 6: File Upload (As Planned)**
- User can upload their own code files
- Parser runs on backend (or WASM client-side)
- Configuration system applies to uploaded code automatically

---

## Next Session (Session 13): Phase 5 Implementation

**Goals:**
1. Implement 5.1: Parser refactor with category metadata
2. Regenerate JSON samples for all 4 languages
3. Verify enhanced JSON structure

**Your Preparation:**
- Review this summary
- Familiarize yourself with the preset system design
- Be ready to test the parser output

**First Task:** Modify `parse_json.py` to add `categorize_token()` and update JSON export.

---

## Session Metrics

- **Duration:** Planning session (no coding)
- **Key Achievement:** Clarified app philosophy and made critical design decisions for Phase 5
- **Blockers Removed:** Multi-line comment parsing concern resolved through research
- **Next Milestone:** Phase 5.1 complete (parser refactor)

---

**Status:** Phase 5 design complete. Ready for implementation in Session 13. 🚀