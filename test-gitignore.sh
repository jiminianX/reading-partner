#!/bin/bash
echo "🔍 Testing .gitignore..."

cd backend
touch .env.test
git add .env.test 2>/dev/null

if git status --porcelain | grep -q ".env.test"; then
    echo "❌ DANGER: .env files are NOT being ignored!"
    git reset HEAD .env.test 2>/dev/null
else
    echo "✅ Good: .env files are being ignored"
fi

rm .env.test
cd ..
