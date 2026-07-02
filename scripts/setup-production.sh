#!/bin/bash
# Setup script to install git hooks and prepare for production deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Huellitas Barinas - Production Setup Script              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Check if we're in git repo
if [ ! -d .git ]; then
    echo -e "${RED}❌ Error: Not a git repository${NC}"
    exit 1
fi

# Check if scripts directory exists
if [ ! -d scripts ]; then
    echo -e "${RED}❌ Error: scripts directory not found${NC}"
    exit 1
fi

# Step 1: Install pre-push hook
echo -e "${YELLOW}[1/4] Installing pre-push git hook...${NC}"
HOOKS_DIR=".git/hooks"
mkdir -p "$HOOKS_DIR"

if [ -f "$HOOKS_DIR/pre-push" ]; then
    echo -e "${YELLOW}⚠️  pre-push hook already exists. Overwrite? (y/n)${NC}"
    read -r RESPONSE
    if [[ ! "$RESPONSE" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Skipping pre-push hook installation${NC}"
    else
        cp scripts/pre-push "$HOOKS_DIR/pre-push"
        chmod +x "$HOOKS_DIR/pre-push"
        echo -e "${GREEN}✅ pre-push hook installed${NC}"
    fi
else
    cp scripts/pre-push "$HOOKS_DIR/pre-push"
    chmod +x "$HOOKS_DIR/pre-push"
    echo -e "${GREEN}✅ pre-push hook installed${NC}"
fi

# Step 2: Create .env file from template
echo -e "\n${YELLOW}[2/4] Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env from template${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env and fill in your values${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  .env already exists (not overwriting)${NC}"
fi

# Step 3: Verify Python dependencies
echo -e "\n${YELLOW}[3/4] Checking Python validation script...${NC}"
if [ -f scripts/validate_production_settings.py ]; then
    # Try to run validator
    if python scripts/validate_production_settings.py >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Validation script ready${NC}"
    else
        echo -e "${YELLOW}⚠️  Validation script found but check failed (this may be normal if env vars not set)${NC}"
    fi
else
    echo -e "${RED}❌ Validation script not found${NC}"
    exit 1
fi

# Step 4: Setup instructions
echo -e "\n${YELLOW}[4/4] Setup complete!${NC}"

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  📋 NEXT STEPS                                             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}1. Configure Environment Variables:${NC}"
echo -e "   ${YELLOW}Edit .env and set all required values${NC}"
echo -e "   Use .env.example as reference\n"

echo -e "${BLUE}2. Run Validation (before every push to production):${NC}"
echo -e "   ${YELLOW}python scripts/validate_production_settings.py --check-secrets${NC}\n"

echo -e "${BLUE}3. Setup Frontend:${NC}"
echo -e "   ${YELLOW}cd frontend && npm install${NC}\n"

echo -e "${BLUE}4. Setup Backend:${NC}"
echo -e "   ${YELLOW}python -m venv venv${NC}"
echo -e "   ${YELLOW}source venv/bin/activate  # On Windows: venv\\Scripts\\activate${NC}"
echo -e "   ${YELLOW}pip install -r backend/requirements.txt${NC}"
echo -e "   ${YELLOW}cd backend && python manage.py migrate${NC}\n"

echo -e "${BLUE}5. Test Locally:${NC}"
echo -e "   ${YELLOW}docker-compose up${NC}\n"

echo -e "${BLUE}6. Deploy to Production:${NC}"
echo -e "   ${YELLOW}git push origin main  # Pre-push hook will run checks${NC}\n"

echo -e "${GREEN}✅ Setup complete! You're ready to deploy.${NC}\n"
