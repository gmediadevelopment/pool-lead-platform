#!/bin/bash

echo "=== Hostinger Deployment Verification Script ==="
echo ""

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found. Are you in the right directory?"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo ""

# Check critical files
echo "🔍 Checking critical files..."
files=("server.js" "package.json" "next.config.ts" ".next/BUILD_ID")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file MISSING!"
    fi
done

echo ""

# Check .htaccess
if [ -f ".htaccess" ]; then
    echo "⚠️  .htaccess exists (this might cause 404 errors)"
    echo "   Content:"
    head -n 5 .htaccess
else
    echo "✅ No .htaccess file (good)"
fi

echo ""

# Check environment variables
echo "🔐 Checking environment variables..."
env_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL" "NODE_ENV")

for var in "${env_vars[@]}"; do
    if [ -n "${!var}" ]; then
        echo "  ✅ $var is set"
    else
        echo "  ❌ $var is NOT set"
    fi
done

echo ""

# Check Node.js version
echo "📦 Node.js version: $(node --version)"
echo "📦 npm version: $(npm --version)"

echo ""

# Check if Next.js build exists
if [ -d ".next" ]; then
    echo "✅ .next build directory exists"
    if [ -f ".next/BUILD_ID" ]; then
        echo "   Build ID: $(cat .next/BUILD_ID)"
    fi
else
    echo "❌ .next build directory MISSING!"
    echo "   Run: npm run build"
fi

echo ""

# Check server.js process
echo "🔍 Checking for running Node.js processes..."
ps aux | grep "node.*server.js" | grep -v grep || echo "  ⚠️  No server.js process found"

echo ""
echo "=== Verification Complete ==="
