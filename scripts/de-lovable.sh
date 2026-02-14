#!/usr/bin/env bash
# ==============================================
# de-lovable.sh - Entfernt alle Lovable-Artefakte
# Für alle Fintutto Standalone-Apps
# ==============================================
# Usage: cd /path/to/repo && bash de-lovable.sh
# ==============================================

set -euo pipefail
REPO_NAME=$(basename "$(pwd)")
echo "🔧 De-Lovable: $REPO_NAME"
echo "================================"

# 1. Remove .lovable directory
if [ -d ".lovable" ]; then
  rm -rf .lovable
  echo "✓ .lovable/ entfernt"
fi

# 2. Remove committed .env (SECURITY!)
if [ -f ".env" ]; then
  rm .env
  echo "✓ .env entfernt (war committed!)"
fi

# 3. Ensure .env is in .gitignore
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
  echo ".env" >> .gitignore
  echo "✓ .env zu .gitignore hinzugefügt"
fi

# 4. Remove node_modules from git if committed
if git ls-files --error-unmatch node_modules/.package-lock.json >/dev/null 2>&1; then
  echo "node_modules" >> .gitignore
  git rm -r --cached node_modules >/dev/null 2>&1
  echo "✓ node_modules aus Git-Tracking entfernt"
fi

# 5. Remove lovable-tagger from vite.config.ts
if [ -f "vite.config.ts" ]; then
  sed -i '/import.*componentTagger.*lovable-tagger/d' vite.config.ts
  sed -i 's/mode === "development" && componentTagger(),\?//g' vite.config.ts
  # Clean up empty plugin arrays
  sed -i 's/\[react(),\s*\]/[react()]/g' vite.config.ts
  sed -i 's/\[react(), \]/[react()]/g' vite.config.ts
  echo "✓ lovable-tagger aus vite.config.ts entfernt"
fi

# 6. Remove Lovable deps from package.json
if [ -f "package.json" ]; then
  # Remove @lovable.dev/cloud-auth-js
  sed -i '/"@lovable.dev\/cloud-auth-js"/d' package.json
  # Remove lovable-tagger
  sed -i '/"lovable-tagger"/d' package.json
  # Fix trailing commas in JSON (basic)
  sed -i ':a;N;$!ba;s/,\n\s*}/\n}/g' package.json
  echo "✓ Lovable-Dependencies aus package.json entfernt"
fi

# 7. Replace Lovable OAuth with native Supabase OAuth
if [ -f "src/integrations/lovable/index.ts" ]; then
  cat > src/integrations/lovable/index.ts << 'OAUTH'
// Lovable OAuth removed - using native Supabase OAuth instead.
import { supabase } from "../supabase/client";

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple", opts?: { redirect_uri?: string }) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirect_uri || window.location.origin,
        },
      });
      if (error) return { error, redirected: false };
      return { redirected: true, error: null };
    },
  },
};
OAUTH
  echo "✓ Lovable OAuth → Supabase OAuth"
fi

# 8. Replace lovable.dev OG images in index.html
if [ -f "index.html" ]; then
  sed -i 's|https://lovable.dev/opengraph-image-p98pqg.png|/placeholder.svg|g' index.html
  echo "✓ lovable.dev OG-Images ersetzt"
fi

# 9. Remove hardcoded Supabase fallbacks in client.ts
SUPABASE_CLIENT=$(find src -name "client.ts" -path "*/supabase/*" 2>/dev/null | head -1)
if [ -n "$SUPABASE_CLIENT" ]; then
  # Remove || 'https://...' fallbacks but keep the env var
  sed -i "s/ || 'https:\/\/[^']*'//g" "$SUPABASE_CLIENT"
  sed -i "s/ || 'eyJ[^']*'//g" "$SUPABASE_CLIENT"
  echo "✓ Hardcoded Supabase-Fallbacks entfernt"
fi

# 10. Add vercel.json if missing
if [ ! -f "vercel.json" ]; then
  cat > vercel.json << 'VERCEL'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
VERCEL
  echo "✓ vercel.json erstellt"
fi

echo ""
echo "================================"
echo "✅ $REPO_NAME de-lovabled!"
echo ""
echo "Nächste Schritte:"
echo "  git add -A"
echo "  git commit -m 'Remove Lovable, configure for Vercel'"
echo "  git push origin main"
