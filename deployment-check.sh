#!/bin/bash

# ================================================
# Deployment Readiness Check Script
# ================================================
# Ez a script ellenőrzi, hogy az alkalmazás készen áll-e a deployment-re
#
# Használat:
#   chmod +x deployment-check.sh
#   ./deployment-check.sh
#

echo "================================================"
echo "🔍 Anime Streamer - Deployment Readiness Check"
echo "================================================"
echo ""

ERRORS=0
WARNINGS=0

# Színek
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

check_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

check_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 1. Node.js verzió ellenőrzés
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Node.js Verzió Ellenőrzés"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        check_success "Node.js verzió: $(node -v) ✓"
    else
        check_warning "Node.js verzió: $(node -v) - Ajánlott: v20+"
    fi
else
    check_warning "Node.js nincs telepítve!"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 2. Package.json ellenőrzés
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Package.json Ellenőrzés"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "package.json" ]; then
    check_success "package.json létezik"
    
    # Ellenőrizzük a szükséges scripteket
    if grep -q '"build"' package.json; then
        check_success "Build script megtalálva"
    else
        check_warning "Build script hiányzik a package.json-ból"
    fi
    
    if grep -q '"start"' package.json; then
        check_success "Start script megtalálva"
    else
        check_warning "Start script hiányzik a package.json-ból"
    fi
else
    check_warning "package.json nem található!"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 3. Node modules ellenőrzés
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Dependencies Ellenőrzés"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "node_modules" ]; then
    check_success "node_modules mappa létezik"
else
    check_warning "node_modules nincs telepítve - futtasd: npm install"
fi

echo ""

# 4. Environment változók ellenőrzés
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Environment Változók Ellenőrzés"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".env" ]; then
    check_success ".env fájl létezik"
    
    # Ellenőrizzük a DATABASE_URL-t
    if grep -q "DATABASE_URL=" .env; then
        if grep -q "DATABASE_URL=postgresql" .env; then
            check_success "DATABASE_URL be van állítva"
        else
            check_warning "DATABASE_URL nincs proper formátumban"
        fi
    else
        check_warning "DATABASE_URL nincs definiálva a .env-ben"
    fi
    
    # Ellenőrizzük a SESSION_SECRET-et
    if grep -q "SESSION_SECRET=" .env; then
        SECRET_VALUE=$(grep "SESSION_SECRET=" .env | cut -d'=' -f2)
        SECRET_LENGTH=${#SECRET_VALUE}
        if [ $SECRET_LENGTH -ge 32 ]; then
            check_success "SESSION_SECRET be van állítva (${SECRET_LENGTH} karakter)"
        else
            check_warning "SESSION_SECRET túl rövid (${SECRET_LENGTH} karakter) - min. 32 ajánlott"
        fi
    else
        check_warning "SESSION_SECRET nincs definiálva a .env-ben"
    fi
    
    # NODE_ENV ellenőrzés
    if grep -q "NODE_ENV=production" .env; then
        check_success "NODE_ENV=production ✓"
    else
        check_info "NODE_ENV nincs production-ra állítva"
    fi
else
    check_warning ".env fájl nem található! Másold a .env.example-t .env néven"
fi

echo ""

# 5. Build könyvtár ellenőrzés
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  Build Könyvtár Ellenőrzés"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "dist" ]; then
    check_success "dist/ könyvtár létezik"
    
    if [ -f "dist/index.cjs" ]; then
        check_success "dist/index.cjs létezik"
    else
        check_warning "dist/index.cjs nem található - futtasd: npm run build"
    fi
    
    if [ -d "dist/client" ]; then
        check_success "dist/client/ könyvtár létezik"
    else
        check_warning "dist/client/ nem található - futtasd: npm run build"
    fi
else
    check_info "dist/ könyvtár nem létezik - Az első deployment előtt futtasd: npm run build"
fi

echo ""

# 6. Database schema ellenőrzés
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  Database Schema Ellenőrzés"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "shared/schema.ts" ]; then
    check_success "Database schema fájl létezik"
else
    check_warning "shared/schema.ts nem található"
fi

if [ -f "drizzle.config.ts" ]; then
    check_success "Drizzle config létezik"
else
    check_warning "drizzle.config.ts nem található"
fi

echo ""

# 7. Git ellenőrzés
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  Git Repository Ellenőrzés"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d ".git" ]; then
    check_success "Git repository inicializálva"
    
    # Uncommitted changes
    if git diff-index --quiet HEAD --; then
        check_success "Nincs uncommitted change"
    else
        check_info "Van uncommitted change - fontold meg a commit-olást deployment előtt"
    fi
    
    # .gitignore ellenőrzés
    if [ -f ".gitignore" ]; then
        check_success ".gitignore létezik"
        
        if grep -q "node_modules" .gitignore; then
            check_success ".gitignore tartalmazza a node_modules-t"
        fi
        
        if grep -q ".env" .gitignore; then
            check_success ".gitignore tartalmazza a .env-t"
        else
            check_warning ".env nincs a .gitignore-ban!"
        fi
    fi
else
    check_info "Git repository nincs inicializálva"
fi

echo ""

# 8. Port ellenőrzés
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8️⃣  Port Ellenőrzés"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".env" ]; then
    PORT=$(grep "PORT=" .env | cut -d'=' -f2)
    if [ -n "$PORT" ]; then
        check_info "Configured PORT: $PORT"
        
        # Ellenőrizzük, hogy a port szabad-e (csak Linux/Mac-en működik)
        if command -v lsof &> /dev/null; then
            if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
                check_warning "Port $PORT már használatban van!"
            else
                check_success "Port $PORT szabad"
            fi
        fi
    else
        check_info "PORT nincs beállítva - alapértelmezett: 5000"
    fi
fi

echo ""

# 9. TypeScript ellenőrzés
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9️⃣  TypeScript Ellenőrzés"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "tsconfig.json" ]; then
    check_success "tsconfig.json létezik"
else
    check_warning "tsconfig.json nem található"
fi

echo ""

# Összegzés
echo "================================================"
echo "📊 Összegzés"
echo "================================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Minden rendben! Az alkalmazás készen áll a deployment-re!${NC}"
    echo ""
    echo "Következő lépések:"
    echo "  1. npm run build    # Production build készítése"
    echo "  2. npm run start    # Helyi tesztelés production módban"
    echo "  3. Kövesd a DEPLOYMENT_GUIDE.md utasításait"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ${WARNINGS} figyelmeztetés található${NC}"
    echo ""
    echo "Az alkalmazás deployable, de javasolt a figyelmeztetések ellenőrzése."
    exit 0
else
    echo -e "${RED}❌ ${ERRORS} hiba és ${WARNINGS} figyelmeztetés található${NC}"
    echo ""
    echo "Javítsd a hibákat deployment előtt!"
    exit 1
fi
