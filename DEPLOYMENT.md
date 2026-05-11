# Deployment Guide

## Prerequisites
1. Backend deployed and accessible online
2. Backend URL (e.g., https://your-backend.onrender.com)

## Step 1: Update Backend URL
Edit `.env.production` and replace `https://your-backend-url.com` with your actual backend URL.

## Step 2: Commit and Push Changes
```bash
git add .
git commit -m "Add production config and deployment files"
git push origin main
```

## Option A: Deploy to Vercel (Recommended)

### Method 1: Using Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

### Method 2: Using Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Add `VITE_API_BASE_URL` with your backend URL
5. Click "Deploy"

## Option B: Deploy to Netlify

### Method 1: Using Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize and deploy:
   ```bash
   netlify init
   netlify deploy --prod
   ```

### Method 2: Using Netlify Dashboard
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment Variables: Add `VITE_API_BASE_URL` with your backend URL
5. Click "Deploy site"

## After Deployment

1. You'll receive a live URL (e.g., `https://your-app.vercel.app` or `https://your-app.netlify.app`)
2. Test all features:
   - Upload files
   - Chat functionality
   - Workflow execution
   - Trace inspection
3. Optionally, add a custom domain in platform settings

## Troubleshooting

- If API calls fail, verify `VITE_API_BASE_URL` is correctly set
- Check browser console for CORS errors (backend needs to allow your frontend domain)
- Ensure backend is running and accessible
