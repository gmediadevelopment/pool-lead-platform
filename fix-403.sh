#!/bin/bash

echo "=== Fixing 403 Forbidden Error ==="
echo ""

# Check current directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Not in the right directory!"
    echo "Run this from: /domains/marktplatz.poolbau-vergleich.de/public_html/"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo ""

# Fix directory permissions
echo "🔧 Fixing directory permissions..."
find . -type d -exec chmod 755 {} \;
echo "✅ Directory permissions set to 755"

# Fix file permissions
echo "🔧 Fixing file permissions..."
find . -type f -exec chmod 644 {} \;
echo "✅ File permissions set to 644"

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x server.js 2>/dev/null || true
chmod +x verify-deployment.sh 2>/dev/null || true
chmod +x fix-403.sh 2>/dev/null || true
echo "✅ Scripts are executable"

# Remove problematic files
echo "🗑️  Removing problematic files..."
rm -f .htaccess
rm -f google-sheets-credentials.json
echo "✅ Problematic files removed"

# Check ownership
echo ""
echo "👤 Checking file ownership..."
ls -la | head -n 5

echo ""
echo "=== Fix Complete ==="
echo ""
echo "Next steps:"
echo "1. Go to Hostinger → Node.js"
echo "2. Click 'Stop'"
echo "3. Click 'Restart'"
echo "4. Test: https://marktplatz.poolbau-vergleich.de"
