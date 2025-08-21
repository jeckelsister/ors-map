#!/bin/bash

# 🚦 Script de validation avant déploiement
# Ce script reproduit tous les checks de la pipeline CI/CD

set -e  # Arrêter en cas d'erreur

echo "🚀 Validation des checks de déploiement..."
echo "================================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_step() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Variables de contrôle
FAILED=0
WARNINGS=0

# 1. Tests unitaires et couverture
print_step "1️⃣  Tests unitaires et couverture..."
if npm run test:coverage > /tmp/test_output 2>&1; then
    print_success "Tests passed"

    # Vérifier la couverture
    if [ -f "coverage/coverage-summary.json" ]; then
        COVERAGE=$(node -e "
            const fs = require('fs');
            const summary = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
            console.log(summary.total.statements.pct);
        ")

        if (( $(echo "$COVERAGE >= 60" | bc -l) )); then
            print_success "Coverage: ${COVERAGE}% (Good)"
        else
            print_warning "Coverage: ${COVERAGE}% (Consider adding more tests)"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
else
    print_error "Tests failed"
    cat /tmp/test_output
    FAILED=$((FAILED + 1))
fi

echo ""

# 2. Lint et formatage
print_step "2️⃣  Lint et formatage..."
if npm run lint > /tmp/lint_output 2>&1; then
    print_success "Lint passed"
else
    # Vérifier si ce sont juste des warnings
    if grep -q "warning" /tmp/lint_output && ! grep -q "error" /tmp/lint_output; then
        print_warning "Lint has warnings (but no errors)"
        cat /tmp/lint_output
        WARNINGS=$((WARNINGS + 1))
    else
        print_error "Lint failed"
        cat /tmp/lint_output
        FAILED=$((FAILED + 1))
    fi
fi

echo ""

# 3. TypeScript
print_step "3️⃣  TypeScript check..."
if npm run type-check > /tmp/ts_output 2>&1; then
    print_success "TypeScript passed"
else
    print_error "TypeScript failed"
    cat /tmp/ts_output
    FAILED=$((FAILED + 1))
fi

echo ""

# 4. Sécurité
print_step "4️⃣  Audit de sécurité..."
if npm run security:audit > /tmp/security_output 2>&1; then
    print_success "Security audit passed"
else
    print_error "Security vulnerabilities found"
    cat /tmp/security_output
    FAILED=$((FAILED + 1))
fi

echo ""

# 5. Build
print_step "5️⃣  Build de production..."
if npm run build > /tmp/build_output 2>&1; then
    print_success "Build successful"

    # Vérifier la taille
    BUILD_SIZE_MB=$(du -sm dist | cut -f1)
    if [ $BUILD_SIZE_MB -gt 50 ]; then
        print_warning "Build size is large: ${BUILD_SIZE_MB}MB (consider optimization)"
        WARNINGS=$((WARNINGS + 1))
    else
        print_success "Build size: ${BUILD_SIZE_MB}MB"
    fi

    # Vérifier les fichiers critiques
    if [ ! -f "dist/index.html" ]; then
        print_error "Missing index.html in build"
        FAILED=$((FAILED + 1))
    elif [ ! -d "dist/assets" ] && [ ! -d "dist/js" ]; then
        print_error "Missing assets/js directory in build"
        FAILED=$((FAILED + 1))
    else
        print_success "Critical build files validated"
    fi
else
    print_error "Build failed"
    cat /tmp/build_output
    FAILED=$((FAILED + 1))
fi

echo ""

# 6. Knip (optionnel)
print_step "6️⃣  Code cleanup check (Knip)..."
if npx knip --reporter json > knip-report.json 2>/dev/null; then
    if [ -s knip-report.json ]; then
        print_warning "Unused dependencies/exports found"
        echo "Run 'npx knip' to see details"
        WARNINGS=$((WARNINGS + 1))
    else
        print_success "No unused dependencies found"
    fi
else
    print_success "Knip check completed"
fi

# Nettoyage
rm -f /tmp/test_output /tmp/lint_output /tmp/ts_output /tmp/security_output /tmp/build_output knip-report.json

echo ""
echo "================================================="

# Résumé final
if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        print_success "🎉 All checks passed! Ready to deploy! 🚀"
        exit 0
    else
        print_warning "✅ All critical checks passed with ${WARNINGS} warning(s)"
        echo -e "${YELLOW}You can deploy, but consider fixing the warnings${NC}"
        exit 0
    fi
else
    print_error "❌ ${FAILED} check(s) failed! Deployment will be blocked!"
    echo -e "${RED}Fix the issues above before deploying${NC}"
    exit 1
fi
