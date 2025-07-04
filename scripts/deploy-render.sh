#!/bin/bash

# Fantasy Golf Game - Render Deployment Script

echo "🚀 Preparing Fantasy Golf Game for Render deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install all dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "frontend/build" ]; then
    echo "❌ Error: Frontend build failed"
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Push your code to GitHub/GitLab"
echo "2. Connect your repository to Render"
echo "3. Render will automatically detect the render.yaml configuration"
echo "4. Your app will be deployed to: https://your-app-name.onrender.com"
echo ""
echo "📝 Make sure to:"
echo "- Set NODE_ENV=production in Render environment variables"
echo "- Check that all API endpoints are working"
echo "- Test the deployed application thoroughly" 