#!/bin/bash

# Ensure script stops on errors
set -e

echo "🚀 Setting up Moemen Team System..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+."
    exit 1
fi
echo "✅ Node.js is installed."

# Copy .env.example to .env if not exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "📝 Copying .env.example to .env..."
        cp .env.example .env
    else
        echo "⚠️  No .env.example found. Creating default .env file..."
        echo 'DATABASE_URL="file:./dev.db"' > .env
        echo 'NEXTAUTH_SECRET="moemen-team-super-secure-nextauth-secret-key-2026"' >> .env
        echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env
    fi
else
    echo "✅ .env file already exists."
fi

echo "📦 Installing dependencies..."
npm install

echo "⚙️  Generating Prisma client..."
npx prisma generate

echo "🔄 Initializing database schema..."
npx prisma db push

echo "🌱 Seeding the database with real company data..."
npx prisma db seed

echo "=========================================="
echo "🎉 Setup complete! You can now start the development server:"
echo "   npm run dev"
echo ""
echo "🔐 Default Admin Credentials:"
echo "   Email: admin@moemen-team.tech"
echo "   Password: admin123"
echo "=========================================="
