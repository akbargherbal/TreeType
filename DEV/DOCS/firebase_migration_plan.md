# Firebase Integration Plan - TreeType (Streamlined)

**Current State**: Phase 6 complete, TypeScript migration done, localStorage working  
**Goal**: Add optional Firebase auth + cloud sync, keep localStorage as fallback  
**Estimated Time**: 8-10 hours across 2-3 sessions

---

## 🎯 Overview

Add Firebase to enable:

- ✅ Cross-device stats sync (practice on laptop, continue on desktop)
- ✅ Persistent cloud storage (survive browser clears)
- ✅ Future: Leaderboards, shared snippets, progress analytics

**Non-Goals**:

- ❌ Don't break existing localStorage behavior
- ❌ Don't require users to sign in
- ❌ Don't add complex backend logic

---

## 📦 Phase 8: Firebase Foundation

### **Session 8.1: Setup & Authentication** (3-4 hours)

#### Goal

Get Firebase running with Google sign-in. Users can log in, see their email, log out.

#### Tasks

**8.1.1: Firebase Project Setup** (30 min)

- Create project at [console.firebase.google.com](https://console.firebase.google.com)
- Add web app, get config object
- Enable Authentication → Google provider + Email/Password
- Install: `pnpm add firebase`

**Key Decision**: Where to store API keys?

- ✅ Use `.env` file (already in your `.gitignore` pattern)
- ✅ Vite supports `import.meta.env.VITE_*` natively

**8.1.2: Firebase Init Module** (30 min)

- Create `src/core/firebase.ts` - initialize Firebase SDK
- Create `.env` with `VITE_FIREBASE_*` variables
- Export `auth` and `db` singletons (matches your existing pattern)

**8.1.3: AuthManager Service** (1.5 hours)

- Create `src/core/auth.ts` - class-based like your other services
- Methods: `signInWithGoogle()`, `signInWithEmail()`, `signOut()`, `isAuthenticated()`
- Uses Firebase's `onAuthStateChanged` listener
- Pattern: Matches your `Storage`, `Timer` modules (functional exports)

**Key Decision**: How to integrate with `TreeTypeApp`?

- ✅ Initialize in constructor (like `renderer`, `storage`)
- ✅ Register auth state callback that triggers UI updates
- ✅ Pass user state to `Storage` service for sync enable/disable

**8.1.4: Auth UI Integration** (1 hour)

- Add sign-in button to header (near language selector)
- Add modal for Google/Email sign-in (matches your completion modal style)
- Show user email when signed in
- Wire up in `TreeTypeApp.setupEventListeners()`

**Success Criteria**:

- Click "Sign In" → Google popup works
- After sign-in → see email in header
- Refresh page → still signed in
- Click "Sign Out" → returns to guest state

---

### **Session 8.2: Cloud Stats Sync** (2-3 hours)

#### Goal

Stats save to Firestore for logged-in users with progressive rollout strategy.

#### Philosophy: Safety Net → Validation → Clean Cut

- **Phase 1** (Week 1-2): Dual-write to both localStorage + Firestore (prove it works)
- **Phase 2** (Week 3): Firestore primary, localStorage as emergency backup (validate stability)
- **Phase 3** (Week 4+): Firestore only, remove localStorage stats code (single responsibility)

#### Tasks

**8.2.1: Firestore Security Rules** (15 min)

- Set rules: users can only read/write `/users/{userId}/*`
- Deploy via Firebase Console → Firestore → Rules tab

**8.2.2: Firestore Sync Service** (45 min)

- Create `src/core/firestoreSync.ts` (new service, optional dependency)
- Methods: `saveSnippetStats()`, `loadSnippetStats()`, `loadAllSnippetStats()`
- Pattern: Async functions returning `Promise<SnippetStats>`

**8.2.3: Storage Layer with Feature Flag** (1.5 hours)

- Update `src/core/storage.ts` with progressive rollout support
- Add feature flag: `FIREBASE_SYNC_MODE = 'dual-write' | 'firestore-primary' | 'firestore-only'`
- Add `enableFirebaseSync(userId)` / `disableFirebaseSync()` methods
- **Strategy (Phase 1 - Dual Write)**:
  - Guest users: localStorage only (acknowledged temporary hack)
  - Authenticated users: Save to BOTH localStorage + Firestore
  - On load: Try Firestore first, fall back to localStorage if it fails
  - On first sign-in: Migrate localStorage → Firestore (one-time)

**Key Decision**: How to handle offline/failure scenarios?

- ✅ Firestore SDK handles offline caching automatically
- ✅ If Firestore save fails: localStorage has backup (Phase 1 only)
- ✅ If Firestore load fails: Read from localStorage (Phase 1-2 only)
- ✅ Phase 3: Remove fallbacks, trust Firestore's built-in reliability

**8.2.4: Migration Helper** (30 min)

- Add one-time migration on first sign-in
- Copy all localStorage stats → Firestore
- Set `treetype_migrated` flag to prevent re-migration
- Keep localStorage intact during Phase 1 (safety net)

**8.2.5: Wire Auth → Storage** (15 min)

- In `TreeTypeApp.handleAuthStateChange()`:
  - If user signs in → `storage.enableFirebaseSync(user.uid)`
  - If user signs out → `storage.disableFirebaseSync()`
- Update `saveSnippetStats()` call in `completeTest()` to be async

**Success Criteria (Phase 1)**:

- Guest user completes snippet → saves to localStorage only
- Signed-in user completes snippet → saves to BOTH localStorage + Firestore
- Open on different browser (signed in) → stats appear from Firestore
- If Firestore fails → localStorage fallback works
- After 1-2 weeks: "Has Firestore been reliable?"

**Rollout Plan**:

1. **Deploy with `dual-write`** - Test for 1-2 weeks
2. **Switch to `firestore-primary`** - Validate for 1 week
3. **Switch to `firestore-only`** - Delete localStorage stats code
4. **Result**: Cleaner codebase, single responsibility achieved

---

### **Session 8.3: Firebase Hosting** (1-2 hours) _[OPTIONAL]_

#### Goal

Deploy to Firebase Hosting instead of GitHub Pages (faster CDN, easier SSL).

#### Tasks

**8.3.1: Firebase CLI Setup** (15 min)

- Install: `npm install -g firebase-tools`
- Run: `firebase login && firebase init hosting`
- Configure: `dist` as public directory, SPA rewrites = Yes

**8.3.2: Update Build Config** (15 min)

- Update `vite.config.ts`: Remove `base: '/treetype/'` (Firebase uses root)
- Add script: `"deploy": "pnpm build && firebase deploy --only hosting"`

**8.3.3: Deploy & Test** (30 min)

- Run: `pnpm deploy`
- Test at `https://treetype.web.app`
- Verify auth + stats sync work on live site

**Success Criteria**:

- Site loads at Firebase URL
- All features work (auth, sync, offline fallback)
- Deployment repeatable with single command

---

## 🔑 Key Design Decisions

### 1. **Where to initialize Firebase?**

- ✅ In `src/core/firebase.ts` as a singleton (imported by services)
- Pattern matches your existing module structure

### 2. **How to handle auth state changes?**

- ✅ `AuthManager` has `onAuthChange(callback)` method
- ✅ `TreeTypeApp` registers callback in constructor
- ✅ Callback toggles `Storage.enableFirebaseSync()`

### 3. **How to avoid breaking localStorage?**

- ✅ **Dual-write strategy**: Always write to localStorage first
- ✅ Firestore writes are async, non-blocking, fail-safe
- ✅ If Firestore fails → app keeps working with localStorage

### 4. **How to merge stats from multiple sources?**

- ✅ Take **maximum** of `bestWPM`, `bestAccuracy`, `practiceCount`
- ✅ Take **most recent** `lastPracticed` date
- ✅ Simple, deterministic, idempotent

### 5. **What about preferences (language, mode)?**

- ✅ **Preferences stay in localStorage** (instant load, works offline)
- ✅ Phase 8 focuses on **stats only** (simpler validation)
- ✅ Future: Can add preference sync if you want cross-device consistency

### 6. **How long to keep the safety net?**

- ✅ **Week 1-2**: Dual-write (prove Firestore works in production)
- ✅ **Week 3**: Firestore primary (validate no failures)
- ✅ **Week 4+**: Clean cut (delete localStorage stats code, single responsibility)
- ✅ Feature flag makes rollout/rollback trivial (change one constant)

---

## 📊 What You'll Leave to Coding Sessions

### Implementation Details (Not in This Plan)

- Exact Firebase API call signatures (docs will guide you)
- UI component HTML/CSS details (you'll match existing modal style)
- Error message wording (you'll write naturally during coding)
- Animation/transition timings (you'll feel it out in browser)

### Testing & Iteration

- Edge cases you discover during implementation
- UI polish after seeing it live
- Performance tuning if needed
- Error handling refinements

---

## ✅ Success Metrics

After Phase 8, your app will:

- ✅ Work identically for guest users (no changes to existing experience)
- ✅ Offer optional sign-in with Google/Email
- ✅ Sync stats across devices for logged-in users
- ✅ Survive offline/online transitions gracefully
- ✅ Migrate existing localStorage data on first sign-in
- ✅ Deploy to fast, reliable Firebase Hosting (optional)

---

## 🚀 Next Steps

1. **Review this plan** - Does the structure make sense?
2. **Adjust time estimates** - Based on your schedule
3. **Start Session 8.1** - Firebase setup + auth UI
4. **Test incrementally** - Each session has clear success criteria
5. **Deploy when ready** - Session 8.3 is optional but recommended

---

## 🎨 Why This Approach Works

**Matches your philosophy**:

- "See if it works; otherwise roll back" → Feature flag enables instant rollback
- "Once stable, localStorage is redundant" → Phase 3 removes it
- "Single responsibility" → Firestore becomes sole owner of stats

**Matches your existing patterns**:

- Class-based services (like `CodeRenderer`, `KeyboardHandler`)
- Functional exports (like `storage.ts`, `timer.ts`, `config.ts`)
- Clear separation of concerns (auth, sync, UI are independent)

**Risk-averse like TypeScript migration**:

- Dual-write safety net proves Firebase in production
- Easy rollback at any phase (change one constant)
- No breaking changes to existing features
- Clean endgame removes technical debt

---

**Ready to start? Share any questions or concerns before diving into Session 8.1!**
