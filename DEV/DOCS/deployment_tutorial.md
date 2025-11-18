# Manual Deployment to GitHub Pages: A Practical Guide

**Based on real experience deploying TreeType - including what went wrong and how we fixed it**

---

## 🎯 What You'll Learn

This guide covers deploying a Vite-based TypeScript project to GitHub Pages, focusing on:

- The **critical base path configuration** (the #1 mistake)
- A battle-tested deployment script
- Manual deployment workflow
- Troubleshooting common issues

---

## Part 1: Understanding the Basics

### Development vs Production

**Development** (`pnpm dev`):

- Runs only on your machine (localhost:3000)
- TypeScript files served directly
- Hot Module Replacement (instant updates)
- Detailed error messages
- Large, unoptimized files

**Production** (after `pnpm build`):

- Compiled JavaScript (TypeScript → JS)
- Minified and bundled
- Small, optimized files
- Ready to deploy

### What is GitHub Pages?

**GitHub Pages** = Free static file hosting for GitHub repositories

**The Setup:**

- Your source code lives on the `main` branch
- Built files live on the `gh-pages` branch
- GitHub serves the `gh-pages` branch at `https://username.github.io/repo-name/`

**Why two branches?**

- Keeps source code separate from build artifacts
- No merge conflicts on generated files
- Clean git history

---

## Part 2: The Critical Configuration

### ⚠️ THE #1 MISTAKE: Missing Base Path

Your app will be served at `https://username.github.io/treetype/`, not at the root `/`.

**Without the base path**, Vite generates:

```html
<script src="/assets/main.js"></script>
```

Which tries to load from: `https://username.github.io/assets/main.js` ❌ (404!)

**With the base path**, Vite generates:

```html
<script src="/treetype/assets/main.js"></script>
```

Which loads from: `https://username.github.io/treetype/assets/main.js` ✅

### Fix: Update vite.config.ts

```typescript
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  base: "/treetype/", // ← CRITICAL! Replace 'treetype' with your repo name

  root: ".",
  build: {
    outDir: "dist",
    minify: "terser",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        library: resolve(__dirname, "library.html"), // If you have multiple pages
      },
    },
  },
  // ... rest of your config
});
```

**Replace `/treetype/`** with your actual repository name!

---

## Part 3: Package Scripts

### Add Deployment Scripts to package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:prod": "pnpm run type-check && pnpm run test && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist",
    "rebuild": "pnpm run clean && pnpm run build:prod"
  }
}
```

**Key scripts:**

- `build:prod` - Builds with safety checks (tests + type checking)
- `preview` - Test your production build locally
- `clean` - Remove old build artifacts

---

## Part 4: The Deployment Script

### Create deploy.sh

This script is battle-tested and handles edge cases that caused issues in early versions.

```bash
#!/bin/bash
# TreeType Deployment Script - Bulletproof Version

set -e  # Exit on any error

echo "🚀 TreeType Deployment Script"
echo "=============================="

# Safety check: Must be on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo "⚠️  Must be on main branch to deploy."
    exit 1
fi

# Safety check: No uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Uncommitted changes found. Please commit or stash."
    git status --short
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
if ! pnpm run test; then
    echo "❌ Tests failed! Fix errors before deploying."
    exit 1
fi
echo "   ✅ Tests passed"

# Type check
echo "📝 Type checking..."
if ! pnpm run type-check; then
    echo "❌ Type errors found! Fix errors before deploying."
    exit 1
fi
echo "   ✅ No type errors"

# Build
echo "📦 Building production bundle..."
if ! pnpm run build; then
    echo "❌ Build failed!"
    exit 1
fi

# Create temporary directory OUTSIDE the repo
# This is critical - don't use dist/ directly!
TMP_DIR=$(mktemp -d)
echo "   📁 Created temp directory: $TMP_DIR"

# Copy dist contents to temp (while still on main branch)
cp -r dist/* "$TMP_DIR/"
echo "   ✅ Build artifacts saved to temporary location"

# Prepare gh-pages branch
echo "🌿 Preparing gh-pages branch..."
git fetch origin

# Checkout gh-pages (create if doesn't exist)
if git rev-parse --verify origin/gh-pages > /dev/null 2>&1; then
    git checkout gh-pages
    git pull origin gh-pages
else
    git checkout --orphan gh-pages
fi

# Clean working directory - PRESERVE .git/
git rm -rf . 2>/dev/null || true
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

# Copy ONLY the build files from temp
cp -r "$TMP_DIR"/* .
touch .nojekyll  # Tells GitHub Pages not to use Jekyll

echo "📦 Files copied to gh-pages branch"

# Clean up temporary directory
rm -rf "$TMP_DIR"
echo "   🧹 Cleaned up temp directory"

# Show what we're deploying
echo ""
echo "📋 Files in gh-pages branch:"
ls -lh
echo ""

# Commit and push
git add .
if git diff --staged --quiet; then
    echo "ℹ️  No changes to deploy"
else
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "⬆️  Pushing to GitHub..."
    git push origin gh-pages
    echo "✅ Deployment successful!"
fi

# Return to main
git checkout main
echo "↩️  Switched back to main branch"
echo ""
echo "🌍 Your site will be live at: https://USERNAME.github.io/REPO-NAME/"
echo "   (Usually takes 30-60 seconds for first deployment)"
```

### Make Script Executable

```bash
chmod +x deploy.sh
```

### Update USERNAME and REPO-NAME

Edit the last line to use your actual GitHub username and repository name.

---

## Part 5: GitHub Pages Configuration

### One-Time Setup

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Source", select:
   - **Deploy from a branch**
   - Branch: **gh-pages**
   - Folder: **/ (root)**
4. Click **Save**

**That's it!** GitHub will now automatically serve your gh-pages branch.

---

## Part 6: The Deployment Workflow

### Step-by-Step Process

```bash
# 1. Make changes on main branch
vim src/app.ts

# 2. Test locally
pnpm dev  # or pnpm test

# 3. Commit your changes
git add .
git commit -m "feat: Add new feature"

# 4. Deploy
./deploy.sh

# The script automatically:
# - ✅ Verifies you're on main branch
# - ✅ Checks for uncommitted changes
# - ✅ Runs tests
# - ✅ Type checks
# - ✅ Builds production bundle
# - ✅ Switches to gh-pages branch
# - ✅ Copies build files
# - ✅ Commits and pushes
# - ✅ Returns to main branch
```

### What Happens on GitHub

```
You push to gh-pages
    ↓
GitHub detects change
    ↓
GitHub Pages rebuilds (30-60 seconds)
    ↓
Site is live!
```

---

## Part 7: Testing Before Deployment

### Always Test the Production Build Locally

```bash
# Build
pnpm run build

# Preview (serves the dist/ folder)
pnpm run preview
```

**Visit**: `http://localhost:4173/treetype/`

**Notice**: The URL now includes `/treetype/` - this simulates GitHub Pages!

**Verify**:

- ✅ App loads correctly
- ✅ All features work
- ✅ No console errors
- ✅ Assets load properly

**If it works locally**, it will work on GitHub Pages.

---

## Part 8: Common Issues & Solutions

### Issue #1: Empty Page / Blank Screen

**Symptom**: Site loads but shows nothing, no console errors

**Cause**: Missing or incorrect `base` path in vite.config.ts

**Solution**:

```typescript
export default defineConfig({
  base: "/your-repo-name/", // ← Must match your GitHub repo name!
  // ...
});
```

**Verify**: Check browser DevTools → Network tab. Look for 404 errors on asset files.

### Issue #2: 404 on All Assets

**Symptom**: Console shows multiple 404 errors for JS/CSS files

**Cause**: Same as Issue #1 - incorrect base path

**How to check**:

1. Open DevTools → Network tab
2. Look at failed requests
3. If they're trying to load from `https://username.github.io/assets/...` (missing repo name), base path is wrong
4. Should be: `https://username.github.io/repo-name/assets/...`

### Issue #3: Deployment Script Fails with "Uncommitted changes"

**Symptom**: Script exits with uncommitted changes warning

**Cause**: You have changes that aren't committed

**Solution**:

```bash
git status  # See what changed
git add .
git commit -m "Your commit message"
./deploy.sh
```

### Issue #4: Old Version Still Showing After Deploy

**Symptom**: Deployed but site shows old version

**Cause**: Browser cache

**Solution**: Hard refresh

- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### Issue #5: DEV/ or Other Folders Deployed to gh-pages

**Symptom**: Development files visible on gh-pages branch

**Cause**: Script copied entire repo instead of just dist/

**Solution**: The script above is fixed! It uses a temporary directory to only copy dist/ contents. If using an older script version, update to the version shown above.

---

## Part 9: Verifying Deployment

### Check Deployment Status

Visit: `https://github.com/username/repo-name/deployments`

You'll see:

- ✅ Active deployment (green checkmark)
- Commit that was deployed
- When it went live
- Direct link to live site

### Manual Verification Checklist

Visit your live site: `https://username.github.io/repo-name/`

- [ ] Page loads (not blank)
- [ ] Main functionality works
- [ ] No console errors (F12 → Console)
- [ ] All pages load (if multi-page app)
- [ ] Assets load (check Network tab)
- [ ] Styles applied correctly
- [ ] JavaScript executes

---

## Part 10: Understanding What Gets Deployed

### main branch (Source Code)

```
src/                    # TypeScript source
tests/                  # Test files
public/                 # Static assets
package.json            # Dependencies
tsconfig.json           # TypeScript config
vite.config.ts          # Build config
dist/                   # ← In .gitignore (not committed)
```

### gh-pages branch (Built Files)

```
index.html              # Built HTML
library.html            # Additional pages (if any)
assets/
  main-[hash].js        # Your compiled, minified app
  config-[hash].js      # Code chunks
  timer-[hash].js
  *.css                 # Compiled styles
snippets/               # Static data (from public/)
  metadata.json
  python/*.json
  javascript/*.json
.nojekyll               # Tells GitHub: don't use Jekyll
```

**Key point**: gh-pages has NO source code, only the built files needed to run the app.

---

## Part 11: The .gitignore Configuration

### Ensure dist/ is Ignored on main

Your `.gitignore` should include:

```gitignore
# Build output
dist/
dist-ssr/
*.local

# Dependencies
node_modules/

# Environment files
.env
.env.local
.env.production
```

**Why?** We don't want build artifacts in our source code repository. They belong only on gh-pages.

---

## Part 12: Quick Reference

### Essential Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm test                   # Run tests
pnpm run type-check         # Check types

# Building
pnpm run build              # Build production
pnpm run preview            # Preview production build locally

# Deploying
./deploy.sh                 # Deploy to GitHub Pages

# Troubleshooting
pnpm run clean              # Remove old build
pnpm run rebuild            # Clean + build
git checkout gh-pages       # Inspect deployed files
git checkout main           # Return to source
```

### File Locations Reference

```
vite.config.ts              # ← Add base: '/repo-name/' here!
package.json                # ← Build scripts
deploy.sh                   # ← Deployment automation
.gitignore                  # ← Ensure dist/ is listed
```

---

## Part 13: What We Learned (Lessons from Real Deployment)

### The Original Script Issues (Fixed in Current Version)

**Problem 1**: Script copied entire repo to gh-pages

- **Impact**: Source code, DEV folders deployed publicly
- **Fix**: Use temporary directory, copy only dist/ contents

**Problem 2**: No temporary directory cleanup

- **Impact**: Failed deployments left garbage in git
- **Fix**: Proper temp directory handling with cleanup

**Problem 3**: Base path not in tutorial

- **Impact**: Most critical issue - app wouldn't load
- **Fix**: Explicit base path configuration as primary step

### Best Practices Discovered

1. **Always test production build locally first**

   - Catches 90% of deployment issues
   - Use `pnpm run preview` before deploying

2. **Hard refresh after deployment**

   - Browser cache causes confusion
   - Ctrl+Shift+R is your friend

3. **Check Network tab for 404s**

   - DevTools Network tab reveals path issues immediately
   - Look for asset loading failures

4. **Verify gh-pages branch contents**

   - `git checkout gh-pages` and inspect
   - Should contain ONLY dist/ contents

5. **Use safety checks in deployment script**
   - Branch verification
   - Uncommitted changes check
   - Test + type check before deploy

---

## Part 14: Next Steps

### After First Successful Deployment

1. **Update your README.md**:

   ```markdown
   ## 🚀 Live Demo

   Visit: https://username.github.io/repo-name/
   ```

2. **Optional: Custom domain**

   - You can use a custom domain with GitHub Pages
   - Add CNAME file to gh-pages branch
   - Configure DNS settings

3. **Optional: GitHub Actions**

   - Automate deployment on every push
   - See CI/CD tutorials for this
   - But master manual deployment first!

4. **Share your project**
   - Your app is now public!
   - Add the link to your portfolio
   - Share with others

---

## Appendix: Debugging Checklist

When deployment fails, check in this order:

### 1. Build Process

```bash
pnpm run build
# Does it complete without errors?
# Check dist/ folder was created
```

### 2. Base Path

```bash
# Check vite.config.ts has base: '/repo-name/'
cat vite.config.ts | grep base
```

### 3. GitHub Pages Settings

- Repo → Settings → Pages
- Source: gh-pages branch, / (root)

### 4. Browser Cache

- Hard refresh (Ctrl+Shift+R)
- Or open in incognito mode

### 5. GitHub Pages Build

- Check deployments page
- Wait 60 seconds after push
- Look for error messages

### 6. Console Errors

- Open DevTools (F12)
- Console tab - any errors?
- Network tab - any 404s?

### 7. Deployed Files

```bash
git checkout gh-pages
ls -la  # Verify files are there
cat index.html | head -20  # Check script paths
git checkout main
```

---

## Summary

**The Three Critical Points:**

1. **Base Path Configuration** - `base: '/repo-name/'` in vite.config.ts
2. **Proper Deployment Script** - Uses temp directory, copies only dist/
3. **Test Locally First** - `pnpm run preview` catches issues before deployment

Follow these, and manual deployment to GitHub Pages is straightforward!

---

**Your deployment is working when:**

- ✅ Site loads at https://username.github.io/repo-name/
- ✅ All features function correctly
- ✅ No console errors
- ✅ Assets load (check Network tab)
- ✅ Navigation works (if multi-page)

**Happy deploying!** 🚀
