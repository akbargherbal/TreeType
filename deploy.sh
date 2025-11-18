#!/bin/bash
# TreeType Deployment Script - Clean gh-pages Method (v3 - Robust)

set -e

echo "🚀 TreeType Deployment Script"
echo "=============================="

# ... (Safety checks are the same) ...
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then echo "⚠️ Must be on main branch to deploy."; exit 1; fi
if [[ -n $(git status --porcelain) ]]; then echo "⚠️ Uncommitted changes found. Please commit or stash."; git status --short; exit 1; fi

echo "🔬 Running tests..." && pnpm run test > /dev/null && echo "   ✅ Tests passed"
echo "📝 Type checking..." && pnpm run type-check > /dev/null && echo "   ✅ No type errors"

echo "📦 Building production bundle..."
pnpm run build

# Create a temporary directory for the build output
TMP_DIR=$(mktemp -d)
cp -r dist/* "$TMP_DIR"
echo "   Build artifacts saved to temporary location."

echo "🌿 Preparing gh-pages branch..."
# Fetch the latest branches
git fetch origin
# Checkout gh-pages, or create it if it doesn't exist
if git rev-parse --verify origin/gh-pages > /dev/null 2>&1; then
    git checkout gh-pages
    git pull origin gh-pages
else
    git checkout --orphan gh-pages
fi

# Clean the working directory
git rm -rf .

# Copy the build files from the temporary directory
cp -r "$TMP_DIR"/* .
touch .nojekyll

# Clean up the temporary directory
rm -rf "$TMP_DIR"

echo "🚚 Files copied to gh-pages branch."

git add .
if git diff --staged --quiet; then
    echo "ℹ️ No changes to deploy."
else
    git commit -m "Deploy: $(date)"
    echo "⬆️ Pushing to GitHub..."
    git push origin gh-pages
fi

echo "✅ Deployment process complete."
git checkout main
echo "↩️ Switched back to main branch."
echo "🌍 Your site will be live shortly at: https://akbargherbal.github.io/treetype/"
