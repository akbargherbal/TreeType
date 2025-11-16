#!/bin/bash
# TreeType → treetype Reference Update Script
# This updates GitHub URLs and project names, but preserves local paths

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Updating TreeType → treetype references...${NC}"

# Update README.md
echo "Updating README.md..."
sed -i 's|github\.com/yourusername/TreeType|github.com/yourusername/treetype|g' README.md
sed -i 's|# TreeType -|# treetype -|' README.md
sed -i 's|## 🎯 What is TreeType?|## 🎯 What is treetype?|' README.md
sed -i 's|TreeType is a specialized|treetype is a specialized|' README.md
sed -i 's|Unlike traditional typing games that use natural language, TreeType focuses|Unlike traditional typing games that use natural language, treetype focuses|' README.md
sed -i 's|git clone https://github.com/yourusername/TreeType.git|git clone https://github.com/yourusername/treetype.git|' README.md
sed -i 's|cd TreeType|cd treetype|' README.md
sed -i 's|TreeType uses a \*\*static-first|treetype uses a **static-first|' README.md
sed -i 's|^TreeType/$|treetype/|' README.md
sed -i 's|TreeType uses \[Tree-Sitter\]|treetype uses [Tree-Sitter]|' README.md
sed -i 's|\[yourusername/TreeType\]|[yourusername/treetype]|' README.md

# Update build scripts (only display names, not system paths)
echo "Updating build/add_snippet.sh..."
sed -i 's|# TreeType Snippet|# treetype Snippet|' build/add_snippet.sh
sed -i 's|echo -e "${GREEN}TreeType Snippet|echo -e "${GREEN}treetype Snippet|' build/add_snippet.sh

echo "Updating build/parse_json.py..."
sed -i 's|TreeType Parser|treetype Parser|g' build/parse_json.py
sed -i 's|to TreeType JSON format|to treetype JSON format|' build/parse_json.py
sed -i 's|description="TreeType Parser|description="treetype Parser|' build/parse_json.py

echo "Updating build/build_metadata.py..."
sed -i 's|TreeType Metadata Builder|treetype Metadata Builder|' build/build_metadata.py

echo -e "${GREEN}✓ All references updated!${NC}"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Rename repo on GitHub: Settings → Repository name → 'treetype'"
echo "3. Update git remote: git remote set-url origin https://github.com/akbargherbal/treetype.git"
echo "4. Optionally rename local directory: cd .. && mv TreeType treetype"
