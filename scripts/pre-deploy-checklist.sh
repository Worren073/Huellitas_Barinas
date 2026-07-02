#!/bin/bash
# Production Deployment Checklist
# Uso: bash scripts/pre-deploy-checklist.sh

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  HUELLITAS BARINAS - PRE-DEPLOYMENT CHECKLIST              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

passed=0
failed=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((passed++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((failed++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ============================================================================
# 1. GIT CHECKS
# ============================================================================
echo -e "${YELLOW}[1/7] GIT CHECKS${NC}\n"

if [ ! -d .git ]; then
    check_fail "Not a git repository"
else
    check_pass "Git repository found"
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ] && [ "$BRANCH" != "production" ]; then
    check_warn "Currently on branch: $BRANCH (deploying from develop? merge to main first)"
else
    check_pass "On production branch: $BRANCH"
fi

if git diff --cached --name-only | grep -E '\.env$|\.env\.production|secrets'; then
    check_fail "Environment files or secrets staged for commit!"
else
    check_pass "No .env files staged"
fi

# ============================================================================
# 2. PRODUCTION SETTINGS
# ============================================================================
echo -e "\n${YELLOW}[2/7] PRODUCTION SETTINGS VALIDATION${NC}\n"

if ! python scripts/validate_production_settings.py >/dev/null 2>&1; then
    check_fail "Production settings validation failed"
    python scripts/validate_production_settings.py
else
    check_pass "Production settings validated"
fi

# ============================================================================
# 3. SECRETS CHECK
# ============================================================================
echo -e "\n${YELLOW}[3/7] SECRETS SCAN${NC}\n"

if python scripts/validate_production_settings.py --check-secrets 2>/dev/null | grep -q "ERROR"; then
    check_fail "Hardcoded secrets found in production.py"
else
    check_pass "No hardcoded secrets in production.py"
fi

# ============================================================================
# 4. BACKEND CHECKS
# ============================================================================
echo -e "\n${YELLOW}[4/7] BACKEND CHECKS${NC}\n"

if [ ! -f backend/requirements.txt ]; then
    check_fail "requirements.txt not found"
else
    check_pass "requirements.txt found"
fi

if [ ! -f backend/manage.py ]; then
    check_fail "manage.py not found"
else
    check_pass "Django project structure found"
fi

# Try to import Django
if python -c "import django" 2>/dev/null; then
    check_pass "Django importable"
else
    check_warn "Django not installed locally (ok if using Docker)"
fi

# ============================================================================
# 5. FRONTEND CHECKS
# ============================================================================
echo -e "\n${YELLOW}[5/7] FRONTEND CHECKS${NC}\n"

if [ ! -f frontend/package.json ]; then
    check_fail "package.json not found"
else
    check_pass "Next.js project found"
fi

if [ ! -f frontend/Dockerfile.prod ]; then
    check_fail "frontend/Dockerfile.prod not found"
else
    check_pass "Production Dockerfile found"
fi

if [ ! -f frontend/.env.local ]; then
    check_warn "frontend/.env.local not found (will use NEXT_PUBLIC_API_URL from env)"
else
    check_pass ".env.local found"
fi

# ============================================================================
# 6. DOCKER CHECKS
# ============================================================================
echo -e "\n${YELLOW}[6/7] DOCKER CONFIGURATION${NC}\n"

if [ ! -f docker-compose.yml ]; then
    check_fail "docker-compose.yml not found"
else
    check_pass "docker-compose.yml found"
fi

if [ ! -f backend/Dockerfile ]; then
    check_fail "backend/Dockerfile not found"
else
    check_pass "backend Dockerfile found"
fi

if [ ! -f render.yaml ]; then
    check_fail "render.yaml not found"
else
    check_pass "render.yaml found"
fi

# ============================================================================
# 7. DOCUMENTATION
# ============================================================================
echo -e "\n${YELLOW}[7/7] DOCUMENTATION${NC}\n"

if [ ! -f README.md ]; then
    check_fail "README.md not found"
else
    check_pass "README.md found"
fi

if [ ! -f DEPLOYMENT.md ]; then
    check_fail "DEPLOYMENT.md not found"
else
    check_pass "DEPLOYMENT.md found"
fi

if [ ! -f .env.example ]; then
    check_fail ".env.example not found"
else
    check_pass ".env.example found"
fi

if [ ! -f FIXES_SUMMARY.md ]; then
    check_warn "FIXES_SUMMARY.md not found (documentation of changes)"
else
    check_pass "FIXES_SUMMARY.md found"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SUMMARY                                                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

total=$((passed + failed))
percentage=$((passed * 100 / total))

echo -e "${GREEN}Passed: $passed${NC}"
echo -e "${RED}Failed: $failed${NC}"
echo -e "Total: $total"
echo -e "Score: $percentage%\n"

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT!${NC}"
    echo -e "${GREEN}${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "  1. Review DEPLOYMENT.md"
    echo -e "  2. Configure environment variables in Render"
    echo -e "  3. git push origin main"
    echo -e "  4. Monitor logs in Render Dashboard\n"
    
    exit 0
else
    echo -e "${RED}${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}❌ CHECKS FAILED - FIX ISSUES BEFORE DEPLOYING${NC}"
    echo -e "${RED}${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${YELLOW}Failed checks must be fixed before deployment.${NC}"
    echo -e "${YELLOW}Warnings can proceed with caution.\n"
    
    exit 1
fi
