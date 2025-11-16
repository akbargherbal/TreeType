# Phase 6 Implementation Plan (Revised)
## TreeType: Custom Snippet Library

**Status**: Ready to implement  
**Estimated effort**: 10-12 hours (3-4 sessions)  
**Prerequisites**: Phases 1-5 complete ✅

---

## 🎯 Goals

Allow users to practice their own code snippets with minimal backend complexity.

**What we're building**:
1. Offline snippet generation workflow (Python script)
2. Static snippet hosting (GitHub Pages)
3. Snippet library browser UI
4. User stats tracking (localStorage)
5. Export/Import for data backup

**What we're NOT building** (future phases):
- ❌ Backend API for parsing
- ❌ Database (Cloud SQL, Firestore)
- ❌ User accounts/authentication
- ❌ Real-time features
- ❌ Community snippet sharing

---

## 🏗️ Architecture Overview

### **Core Principle: Static-First**

```
Your Machine (Offline)
├── Source code files (.py, .js, .ts, .tsx)
├── parse_json.py (generates JSON)
└── build_metadata.py (creates index)
        │
        │ git commit + push
        ▼
GitHub Repository
├── index.html (typing game)
├── library.html (snippet browser)
└── snippets/
    ├── metadata.json (master index)
    ├── python/
    │   ├── django_views.json
    │   └── flask_routes.json
    └── javascript/
        └── react_hooks.json
        │
        │ GitHub Pages (auto-deploy)
        ▼
Live Website (https://yourusername.github.io/TreeType/)
        │
        │ User visits
        ▼
User's Browser
├── Loads snippets from GitHub (static files)
└── Saves stats to localStorage (personal data)
```

**Key insight**: Parser runs OFFLINE on your machine. GitHub Pages hosts static JSON files. No backend needed.

---

## 📁 File Structure (Target)

```
TreeType/
├── index.html                      # Main typing game (renamed from render_code.html)
├── library.html                    # Snippet browser (NEW)
│
├── assets/                         # Static assets
│   ├── styles.css
│   └── app.js
│
├── snippets/                       # Static snippet library (committed to Git)
│   ├── metadata.json               # Master index (NEW)
│   ├── python/
│   │   ├── django_views.json
│   │   └── flask_routes.json
│   ├── javascript/
│   │   └── react_hooks.json
│   ├── typescript/
│   └── tsx/
│
├── sources/                        # Source code files (NEW, gitignored)
│   ├── python/
│   ├── javascript/
│   └── typescript/
│
├── build/                          # Build scripts (NEW)
│   ├── parse_json.py               # Refactored parser
│   ├── build_metadata.py           # Generates metadata.json
│   └── add_snippet.sh              # Helper script
│
├── output/                         # (DEPRECATED - remove after Phase 6)
│   └── json_samples/
│
├── .gitignore                      # Ignore sources/, keep snippets/
└── README.md                       # Updated with snippet creation guide
```

---

## 📋 Implementation Plan

### **Session 19: Repository Setup & Metadata Builder** (3-4 hours)

#### Goals
1. Restructure repo for GitHub Pages hosting
2. Create metadata builder script
3. Refactor parser for batch processing
4. Test locally with static file server

#### Tasks

**Task 19.1: Repository Restructure** (30 min)
- [ ] Rename `render_code.html` → `index.html`
- [ ] Create `snippets/` folder structure
- [ ] Move existing JSON samples to `snippets/python/`, etc.
- [ ] Create `sources/` folder (gitignored)
- [ ] Create `build/` folder
- [ ] Update `.gitignore`

**Task 19.2: Metadata Builder Script** (1.5 hours)
- [ ] Create `build/build_metadata.py`
- [ ] Scan `snippets/` folder for all JSON files
- [ ] Generate `metadata.json` with snippet info:
  - id, name, language, path, lines, difficulty, tags, dateAdded
- [ ] Validate JSON structure
- [ ] Test with existing samples

**Task 19.3: Refactor Parser** (1 hour)
- [ ] Copy `parse_json.py` → `build/parse_json.py`
- [ ] Add batch processing (accept folder of files)
- [ ] Add output path configuration
- [ ] Add validation (5-200 lines, valid extensions)
- [ ] Test with multiple files

**Task 19.4: Helper Scripts** (30 min)
- [ ] Create `build/add_snippet.sh` helper
- [ ] Automates: parse → build metadata → git add
- [ ] Test end-to-end workflow

**Task 19.5: Local Testing** (30 min)
- [ ] Run local HTTP server: `python -m http.server 8000`
- [ ] Test snippet loading from `snippets/metadata.json`
- [ ] Verify static file paths work
- [ ] Test with all 4 languages

#### Deliverables
- ✅ Restructured repository
- ✅ `build/build_metadata.py` - Metadata generator
- ✅ `build/parse_json.py` - Refactored parser
- ✅ `build/add_snippet.sh` - Helper script
- ✅ `snippets/metadata.json` - Sample index
- ✅ Working local test setup

---

### **Session 20: GitHub Pages Deployment & Library UI** (3-4 hours)

#### Goals
1. Deploy to GitHub Pages
2. Build snippet library browser
3. Integrate with existing typing game
4. Test live deployment

#### Tasks

**Task 20.1: GitHub Pages Setup** (30 min)
- [ ] Push restructured repo to GitHub
- [ ] Enable GitHub Pages (Settings → Pages)
- [ ] Configure source: `main` branch, root folder
- [ ] Wait for deployment (~2 min)
- [ ] Test live URL: `https://yourusername.github.io/TreeType/`

**Task 20.2: Library Page Structure** (1 hour)
- [ ] Create `library.html` with basic layout
- [ ] Header: "Snippet Library"
- [ ] Filter controls: Language dropdown, search box
- [ ] Snippet grid: Cards with metadata
- [ ] Link to main typing game

**Task 20.3: Snippet Loading Logic** (1 hour)
- [ ] Fetch `snippets/metadata.json`
- [ ] Parse and display snippet cards
- [ ] Show: name, language, lines, tags, difficulty
- [ ] Implement filtering by language
- [ ] Implement search by name/tags

**Task 20.4: Integration with Typing Game** (1 hour)
- [ ] "Practice" button on each snippet card
- [ ] URL parameter passing: `index.html?snippet=python-django-views`
- [ ] Load snippet JSON dynamically in `index.html`
- [ ] Replace hardcoded sample with dynamic loading
- [ ] Test snippet switching

**Task 20.5: UI Polish** (30 min)
- [ ] Loading spinner while fetching metadata
- [ ] Empty state (no snippets found)
- [ ] Error handling (network failures)
- [ ] Responsive design (mobile-friendly)

#### Deliverables
- ✅ Live GitHub Pages deployment
- ✅ `library.html` - Functional snippet browser
- ✅ Dynamic snippet loading in `index.html`
- ✅ URL-based snippet selection
- ✅ Basic filtering/search

---

### **Session 21: Stats Tracking & Export/Import** (3-4 hours)

#### Goals
1. Track user stats in localStorage
2. Display stats in library
3. Build export/import functionality
4. Add settings panel

#### Tasks

**Task 21.1: localStorage Stats Schema** (1 hour)
- [ ] Define data structure:
  ```javascript
  {
    snippet_stats: {
      "python-django-views": {
        timesCompleted: 5,
        bestWPM: 42,
        averageAccuracy: 94.5,
        lastPracticed: "2025-01-15T14:30:00Z",
        sessions: [...]
      }
    },
    user_stats: {
      totalSessions: 25,
      totalTimeSpent: 3600,
      averageWPM: 40,
      favoriteLanguage: "python"
    },
    preferences: {
      theme: "dark",
      preset: "minimal"
    },
    schemaVersion: "1.0"
  }
  ```
- [ ] Implement save/load functions
- [ ] Add schema versioning check
- [ ] Test with sample data

**Task 21.2: Stats Integration** (1 hour)
- [ ] Update typing game completion handler
- [ ] Save stats after each session
- [ ] Update global stats (total sessions, time, etc.)
- [ ] Display stats on snippet cards (library.html)
- [ ] Show "Best WPM", "Times practiced" badges

**Task 21.3: Export/Import Feature** (1.5 hours)
- [ ] "Export Stats" button in settings
- [ ] Generate JSON file with all data
- [ ] Download as `treetype-stats-YYYY-MM-DD.json`
- [ ] "Import Stats" button
- [ ] File upload handler
- [ ] Validate imported data structure
- [ ] Merge or replace existing data (user choice)
- [ ] Test export/import cycle

**Task 21.4: Settings Panel** (30 min)
- [ ] Create settings modal/page
- [ ] Theme toggle (dark/light)
- [ ] Preset selection (Minimal/Standard/Full)
- [ ] Export/Import buttons
- [ ] Clear all data button (with confirmation)
- [ ] Link from main page

#### Deliverables
- ✅ localStorage stats tracking
- ✅ Stats display in library
- ✅ Export stats to JSON file
- ✅ Import stats from JSON file
- ✅ Settings panel

---

## 📊 Data Schemas

### **metadata.json** (Master Snippet Index)

```json
{
  "version": "1.0",
  "generatedAt": "2025-01-15T10:30:00Z",
  "snippets": [
    {
      "id": "python-django-views",
      "name": "Django Class-Based Views",
      "language": "python",
      "path": "snippets/python/django_views.json",
      "lines": 15,
      "difficulty": "intermediate",
      "tags": ["django", "web", "views"],
      "dateAdded": "2025-01-15"
    },
    {
      "id": "js-react-hooks",
      "name": "React useState & useEffect",
      "language": "javascript",
      "path": "snippets/javascript/react_hooks.json",
      "lines": 12,
      "difficulty": "beginner",
      "tags": ["react", "hooks"],
      "dateAdded": "2025-01-16"
    }
  ]
}
```

### **localStorage Schema**

```javascript
// Key: treetype_snippet_stats
{
  "python-django-views": {
    "timesCompleted": 5,
    "bestWPM": 42,
    "averageAccuracy": 94.5,
    "lastPracticed": "2025-01-15T14:30:00Z",
    "sessions": [
      {"date": "2025-01-15", "wpm": 42, "accuracy": 95, "timeSpent": 120},
      {"date": "2025-01-14", "wpm": 38, "accuracy": 94, "timeSpent": 135}
    ]
  }
}

// Key: treetype_user_stats
{
  "totalSessions": 25,
  "totalTimeSpent": 3600,
  "totalCharsTyped": 50000,
  "averageWPM": 40,
  "currentStreak": 5,
  "favoriteLanguage": "python",
  "joinDate": "2025-01-01"
}

// Key: treetype_preferences
{
  "theme": "dark",
  "preset": "minimal",
  "lastSnippet": "python-django-views"
}

// Key: treetype_schema_version
"1.0"
```

---

## 🔄 Snippet Creation Workflow

### **Adding a New Snippet** (5 minutes)

```bash
# 1. Add source file to sources/
cp ~/my-code/views.py sources/python/django_views.py

# 2. Run helper script
./build/add_snippet.sh sources/python/django_views.py \
  --name "Django Class-Based Views" \
  --difficulty intermediate \
  --tags "django,web,views"

# This script does:
# - Runs parse_json.py on the file
# - Moves JSON to snippets/python/
# - Updates metadata.json
# - git add snippets/

# 3. Commit and push
git commit -m "Add Django views snippet"
git push

# 4. Wait ~1 minute for GitHub Pages to deploy
# 5. Snippet now appears in library!
```

---

## 🎯 Success Criteria

### **Must Have**
- ✅ Can add new snippets via offline workflow
- ✅ Snippets appear in library browser
- ✅ Can practice any snippet from library
- ✅ Stats persist across sessions (localStorage)
- ✅ Can export/import stats for backup
- ✅ Respects global preset (Minimal/Standard/Full)
- ✅ All 4 languages work identically
- ✅ Works on GitHub Pages (live deployment)

### **Nice to Have** (if time permits)
- ✅ Drag-and-drop file upload (future: inline parsing)
- ✅ Loading spinners and error states
- ✅ Snippet difficulty badges
- ✅ Sort library by: name, date, times practiced, WPM

---

## 💰 Cost & Hosting

| Component | Solution | Cost |
|-----------|----------|------|
| **Frontend Hosting** | GitHub Pages | $0/month |
| **Snippet Storage** | Git repository | $0/month |
| **User Data** | localStorage | $0/month |
| **Parsing** | Offline (local machine) | $0/month |
| **Total** | | **$0/month** |

**Bandwidth**: GitHub Pages allows 100GB/month (soft limit) - enough for thousands of users.

---

## 🚀 Future Migration Path (Post-Phase 6)

### **If You Ever Need...**

**Cross-device sync** (practice on phone + laptop):
- Add Firebase Authentication
- Move stats from localStorage → Firestore
- **Effort**: 1-2 weeks
- **Cost**: $0-5/month

**Community features** (share snippets with others):
- Add user-uploaded snippets to Firestore
- Add public snippet library
- **Effort**: 2-3 weeks
- **Cost**: $5-25/month

**Backend parsing** (upload files in browser):
- Build Flask API on Cloud Run
- Deploy parser as microservice
- **Effort**: 1 week
- **Cost**: $0-10/month

**For now**: None of this is needed. Static hosting is perfect.

---

## 📝 Documentation Updates Needed

### **README.md Additions**

```markdown
## Adding Custom Snippets

1. Place your code file in `sources/<language>/`
2. Run: `./build/add_snippet.sh sources/<language>/myfile.py --name "My Snippet"`
3. Commit and push to GitHub
4. Wait ~1 minute for deployment
5. Snippet appears in library!

## Backing Up Your Stats

- Click ⚙️ Settings → Export Stats
- Save the JSON file somewhere safe
- To restore: Import Stats → Choose file

## Local Development

```bash
# Start local server
python -m http.server 8000

# Visit: http://localhost:8000
```
```

---

## ⚠️ Known Limitations

### **localStorage Limitations**
- **5-10MB storage limit** (but stats are tiny ~50KB for 100 snippets)
- **Lost if browser cache cleared** (Export/Import mitigates this)
- **Not synced across devices** (future: Firebase if needed)

### **GitHub Pages Limitations**
- **No server-side code** (but we don't need it!)
- **No databases** (but Git is our "database")
- **Public repo = public snippets** (use private repo if needed, requires GitHub Pro)

### **Parsing Limitations**
- **Manual workflow** (not browser-based upload yet)
- **Requires Python locally** (but you already have it)
- **No validation UI** (future enhancement)

---

## 🎉 What You Get After Phase 6

### **Capabilities**
- ✅ Practice custom code snippets
- ✅ Track progress per snippet
- ✅ View aggregate stats (total sessions, avg WPM)
- ✅ Export stats for backup
- ✅ Browse snippet library
- ✅ Filter by language
- ✅ Search by name/tags

### **Infrastructure**
- ✅ Zero hosting costs
- ✅ Zero maintenance (no backend to keep alive)
- ✅ Fast loading (static files, CDN-backed)
- ✅ Version controlled snippets (Git history)

### **Development Velocity**
- ✅ Add snippets in 5 minutes
- ✅ Deploy in 1 minute (git push)
- ✅ No complex build process
- ✅ No backend debugging

---

## 📅 Timeline Summary

| Session | Focus | Hours | Cumulative |
|---------|-------|-------|------------|
| **Session 19** | Repo setup + metadata builder | 3-4h | 3-4h |
| **Session 20** | GitHub Pages + library UI | 3-4h | 6-8h |
| **Session 21** | Stats tracking + export/import | 3-4h | 9-12h |

**Total Phase 6**: 9-12 hours (3 sessions)

---

## ✅ Ready to Start

**Next session (Session 20) starts with**:
1. Task 19.1: Repository restructure
2. Review file structure decisions
3. Build metadata generator

**No blockers. Ready to code.** 🚀

---

## 📌 Key Decisions Locked

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Hosting** | GitHub Pages | Free, simple, fast |
| **Parsing** | Offline (Python) | Parser already works, no backend needed |
| **Storage** | localStorage | Appropriate for personal data, instant reads |
| **Backup** | Export/Import | Safety net for localStorage |
| **Snippets** | Git repository | Version control, free hosting |
| **Future** | Migrate when needed | Don't over-engineer now |

**Philosophy**: Build the simplest thing that works. Add complexity only when necessary.

---

_Phase 6 will transform TreeType from a demo with sample snippets into a personalized typing trainer. The static-first architecture keeps costs at zero while maintaining flexibility for future growth._ ✨
