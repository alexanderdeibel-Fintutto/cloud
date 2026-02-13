#!/bin/bash
# Integration script for Domain Management pages into fintutto-admin-hub
# Run this from the fintutto-admin-hub root directory:
#   bash ~/fintutto-ecosystem/admin-hub-pages/integrate.sh

set -e

ADMIN_HUB_DIR="${1:-.}"
APP_TSX="$ADMIN_HUB_DIR/src/App.tsx"
SIDEBAR_TSX=$(find "$ADMIN_HUB_DIR/src" -name "Sidebar.tsx" -type f | head -1)

echo "=== Fintutto Admin Hub - Domain Management Integration ==="
echo ""

# Verify we're in the right place
if [ ! -f "$APP_TSX" ]; then
  echo "ERROR: Cannot find $APP_TSX"
  echo "Please run this script from your fintutto-admin-hub directory,"
  echo "or pass the path as argument: bash integrate.sh /path/to/fintutto-admin-hub"
  exit 1
fi

echo "Found App.tsx: $APP_TSX"
echo "Found Sidebar.tsx: $SIDEBAR_TSX"
echo ""

# ============================================================
# 1. Patch App.tsx - Add imports and routes
# ============================================================
echo "--- Patching App.tsx ---"

# Add imports (after the last existing page import)
if grep -q "import Domains" "$APP_TSX"; then
  echo "  Imports already present, skipping."
else
  # Find the last "import ... from ./pages/..." line and add after it
  sed -i.bak '/import.*from "\.\/pages\/[^"]*";/{
    H
    $!d
    x
    s/$/\
\
\/\/ Domain Management pages\
import Domains from ".\/pages\/Domains";\
import DomainDetail from ".\/pages\/DomainDetail";\
import LinkChecker from ".\/pages\/LinkChecker";/
  }' "$APP_TSX"

  # If the complex sed didn't work, try a simpler approach
  if ! grep -q "import Domains" "$APP_TSX"; then
    # Restore backup and use Python instead
    cp "$APP_TSX.bak" "$APP_TSX"

    python3 -c "
import re
with open('$APP_TSX', 'r') as f:
    content = f.read()

# Add imports after the last page import
page_imports = list(re.finditer(r'import \w+ from [\"\\']\.\/pages\/\w+[\"\\'];?\n', content))
if page_imports:
    pos = page_imports[-1].end()
    insert = '''\n// Domain Management pages
import Domains from \"./pages/Domains\";
import DomainDetail from \"./pages/DomainDetail\";
import LinkChecker from \"./pages/LinkChecker\";
'''
    content = content[:pos] + insert + content[pos:]

# Add routes before the catch-all route
route_insert = '''
            {/* Domain Management */}
            <Route path=\"/domains\" element={<Domains />} />
            <Route path=\"/domains/:id\" element={<DomainDetail />} />
            <Route path=\"/link-checker\" element={<LinkChecker />} />
'''
content = content.replace(
    '<Route path=\"*\"',
    route_insert + '\n            <Route path=\"*\"'
)

with open('$APP_TSX', 'w') as f:
    f.write(content)
print('  Added imports and routes via Python.')
"
  else
    echo "  Added imports via sed."
    # Now add routes before the catch-all
    sed -i '/path="\*"/i\
\            {/* Domain Management */}\
\            <Route path="/domains" element={<Domains />} />\
\            <Route path="/domains/:id" element={<DomainDetail />} />\
\            <Route path="/link-checker" element={<LinkChecker />} />\
' "$APP_TSX"
    echo "  Added routes."
  fi
fi

# ============================================================
# 2. Patch Sidebar.tsx - Add icons and nav items
# ============================================================
if [ -n "$SIDEBAR_TSX" ]; then
  echo ""
  echo "--- Patching Sidebar.tsx ---"

  if grep -q "Domain-Verwaltung" "$SIDEBAR_TSX"; then
    echo "  Nav items already present, skipping."
  else
    python3 -c "
import re
with open('$SIDEBAR_TSX', 'r') as f:
    content = f.read()

# Add Globe, Link2 to lucide-react imports
lucide_match = re.search(r'(import\s*\{[^}]*)(}\s*from\s*[\"\\']lucide-react[\"\\'])', content)
if lucide_match:
    existing_icons = lucide_match.group(1)
    closing = lucide_match.group(2)
    if 'Globe' not in existing_icons:
        # Add before closing brace
        new_icons = existing_icons.rstrip().rstrip(',') + ',\n  Globe,\n  Link2,\n' + closing
        content = content[:lucide_match.start()] + new_icons + content[lucide_match.end():]
        print('  Added Globe, Link2 icons.')

# Add nav items before Settings
settings_pattern = r'(\{\s*path:\s*[\"\\'][/]?settings[\"\\'])'
settings_match = re.search(settings_pattern, content, re.IGNORECASE)
if settings_match:
    insert = '''  { path: \"/domains\", label: \"Domain-Verwaltung\", icon: Globe },
  { path: \"/link-checker\", label: \"Link Checker\", icon: Link2 },
  '''
    content = content[:settings_match.start()] + insert + content[settings_match.start():]
    print('  Added nav items before Settings.')

with open('$SIDEBAR_TSX', 'w') as f:
    f.write(content)
"
  fi
else
  echo ""
  echo "WARNING: Could not find Sidebar.tsx. You may need to add nav items manually."
fi

# Cleanup backup files
find "$ADMIN_HUB_DIR/src" -name "*.bak" -delete 2>/dev/null || true

echo ""
echo "=== Integration complete! ==="
echo ""
echo "New routes available:"
echo "  /domains        - Domain-Verwaltung (Übersicht)"
echo "  /domains/:id    - Domain Detail (Unterseiten + Checkboxen)"
echo "  /link-checker   - Link Checker (kaputte Links finden)"
echo ""
echo "Don't forget to run the Supabase migration:"
echo "  supabase db push"
echo ""
