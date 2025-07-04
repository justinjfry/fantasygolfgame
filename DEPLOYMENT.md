# Fantasy Golf Game - Deployment Guide

This guide covers multiple deployment options to get your Fantasy Golf Game online for others to test.

## Option 1: Render (Recommended - Free & Easy)

Render is perfect for full-stack apps and offers a generous free tier.

### Steps:

1. **Sign up for Render**
   - Go to [render.com](https://render.com) and create an account

2. **Connect your repository**
   - Connect your GitHub/GitLab repository to Render
   - Render will automatically detect the `render.yaml` configuration

3. **Deploy automatically**
   - Render will build and deploy both your backend and frontend
   - Your app will be available at: `https://your-app-name.onrender.com`

4. **Environment Variables** (if needed)
   - Go to your service dashboard
   - Add any environment variables under "Environment"

### What happens:
- Backend deploys as a web service on port 10000
- Frontend builds and deploys as a static site
- Frontend automatically connects to your backend API

## Option 2: Vercel + Railway

### Frontend on Vercel:
1. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com) and create an account

2. **Deploy frontend**
   ```bash
   cd frontend
   npm install -g vercel
   vercel
   ```

3. **Set environment variable**
   - In Vercel dashboard, add: `REACT_APP_API_URL=https://your-backend-url.railway.app`

### Backend on Railway:
1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app) and create an account

2. **Deploy backend**
   - Connect your repository
   - Set the root directory to `backend`
   - Railway will automatically detect it's a Node.js app

## Option 3: Netlify + Heroku

### Frontend on Netlify:
1. **Sign up for Netlify**
   - Go to [netlify.com](https://netlify.com) and create an account

2. **Deploy settings**
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/build`
   - Add environment variable: `REACT_APP_API_URL=https://your-backend-url.herokuapp.com`

### Backend on Heroku:
1. **Sign up for Heroku**
   - Go to [heroku.com](https://heroku.com) and create an account

2. **Deploy backend**
   ```bash
   cd backend
   heroku create your-golf-game-backend
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

## Option 4: DigitalOcean App Platform

1. **Sign up for DigitalOcean**
   - Go to [digitalocean.com](https://digitalocean.com) and create an account

2. **Create App**
   - Connect your repository
   - DigitalOcean will detect both services automatically
   - Set environment variables as needed

## Local Testing Before Deployment

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Test production build locally**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

3. **Visit** `http://localhost:5000` to test the production build

## Environment Variables

### Frontend:
- `REACT_APP_API_URL`: URL of your backend API (e.g., `https://your-backend.onrender.com`)

### Backend:
- `NODE_ENV`: Set to `production` for production builds
- `PORT`: Port number (usually set by the hosting platform)

## Troubleshooting

### Common Issues:

1. **CORS errors**
   - Make sure your backend CORS settings allow your frontend domain
   - Check that `REACT_APP_API_URL` is set correctly

2. **Build failures**
   - Ensure all dependencies are in `package.json`
   - Check that Node.js version is compatible (v16+)

3. **API not found**
   - Verify the backend is running and accessible
   - Check that API routes are working locally first

### Debug Commands:
```bash
# Test backend locally
cd backend && npm start

# Test frontend locally
cd frontend && npm start

# Build frontend
cd frontend && npm run build
```

## Cost Comparison

| Platform | Frontend | Backend | Monthly Cost |
|----------|----------|---------|--------------|
| Render | Free | Free | $0 |
| Vercel + Railway | Free | Free | $0 |
| Netlify + Heroku | Free | Free | $0 |
| DigitalOcean | $5 | $5 | $10 |

## Next Steps

After deployment:
1. Test all features thoroughly
2. Share the URL with your testers
3. Monitor for any issues
4. Consider adding a database for persistent data storage

## Support

If you encounter issues:
1. Check the platform's documentation
2. Review the logs in your hosting platform's dashboard
3. Test locally to isolate the problem
4. Check that all environment variables are set correctly 