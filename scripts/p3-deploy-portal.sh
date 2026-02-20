#!/bin/bash
# ============================================================================
# P3: Deploy fintutto-portal to Vercel
#
# Deploys apps/fintutto-portal to portal.fintutto.cloud
#
# Prerequisites:
#   - Vercel CLI installed: npm i -g vercel
#   - Logged in: vercel login
#   - VITE_SUPABASE_ANON_KEY ready (from Supabase Dashboard > Settings > API)
#
# Usage: ./scripts/p3-deploy-portal.sh
# ============================================================================

set -euo pipefail

PORTAL_DIR="$(cd "$(dirname "$0")/../apps/fintutto-portal" && pwd)"

echo "=============================================="
echo "  P3: Deploy fintutto-portal to Vercel"
echo "=============================================="
echo ""

# Check prerequisites
if ! command -v vercel &>/dev/null; then
  echo "ERROR: Vercel CLI not installed."
  echo "Install: npm i -g vercel"
  echo "Login:   vercel login"
  exit 1
fi

echo "Step 1: Set Vercel Environment Variables"
echo "========================================="
echo ""
echo "Before deploying, ensure these Team-level variables are set:"
echo "  vercel.com/fintutto/~/settings/environment-variables"
echo ""
echo "  REQUIRED:"
echo "    VITE_SUPABASE_URL = https://aaefocdqgdgexkcrjhks.supabase.co"
echo "    VITE_SUPABASE_ANON_KEY = (from Supabase Dashboard > Settings > API)"
echo ""
echo "  ALREADY SET (from existing apps):"
echo "    VITE_STRIPE_PUBLISHABLE_KEY"
echo "    STRIPE_SECRET_KEY"
echo "    STRIPE_WEBHOOK_SECRET"
echo "    SUPABASE_URL"
echo "    SUPABASE_SERVICE_ROLE_KEY"
echo "    ANTHROPIC_API_KEY"
echo "    BREVO_API_KEY"
echo ""

read -p "Are the env variables set? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Set the variables first, then re-run this script."
  exit 0
fi

echo ""
echo "Step 2: Deploy to Vercel"
echo "========================"
echo ""
echo "Deploying from: $PORTAL_DIR"
echo ""

cd "$PORTAL_DIR"

# Link to existing Vercel project or create new one
echo "Linking to Vercel project 'fintutto-portal'..."
vercel link --yes 2>/dev/null || true

# Deploy to production
echo "Deploying to production..."
vercel --prod

echo ""
echo "Step 3: Configure Custom Domain"
echo "================================"
echo ""
echo "To add the custom domain portal.fintutto.cloud:"
echo ""
echo "  Option A (CLI):"
echo "    vercel domains add portal.fintutto.cloud"
echo ""
echo "  Option B (Dashboard):"
echo "    1. Go to your Vercel project settings"
echo "    2. Domains > Add domain"
echo "    3. Enter: portal.fintutto.cloud"
echo "    4. Add DNS record as instructed (CNAME to cname.vercel-dns.com)"
echo ""
echo "Step 4: Update DNS (in your DNS provider)"
echo "==========================================="
echo ""
echo "Add CNAME record:"
echo "  portal.fintutto.cloud -> cname.vercel-dns.com"
echo ""
echo "All other recommended subdomains:"
echo "  vermietify.fintutto.cloud -> cname.vercel-dns.com"
echo "  ablesung.fintutto.cloud   -> cname.vercel-dns.com"
echo "  mieter.fintutto.cloud     -> cname.vercel-dns.com"
echo "  hausmeister.fintutto.cloud-> cname.vercel-dns.com"
echo "  admin.fintutto.cloud      -> cname.vercel-dns.com"
echo ""
echo "=============================================="
echo "  Deployment complete!"
echo "=============================================="
