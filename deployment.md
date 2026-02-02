# MindGrid: Deployment Guide (Fixed Blank Page)

The blank page was caused by a conflict between the `importmap` and the Vite build system. I have removed the `importmap` so that Vite can correctly bundle your app for production.

## 1. Deploying to Netlify (Recommended for this setup)
1.  **Push your code to GitHub.**
2.  **Log in to Netlify.**
3.  **Click "Add new site" > "Import an existing project".**
4.  **Select your repository.**
5.  **Build Settings (Netlify should auto-detect these):**
    *   **Build Command:** `npm run build`
    *   **Publish directory:** `dist`
6.  **Environment Variables:**
    *   Go to **Site Configuration > Environment Variables**.
    *   Add `API_KEY` with your Gemini API Key.
7.  **Deploy!**

## 2. Deploying to Vercel
1.  **Import the repo into Vercel.**
    *   Vercel will auto-detect "Vite" as the Framework Preset.
2.  **Add Environment Variable:**
    *   Add `API_KEY` in the project settings.
3.  **Deploy!**

## 3. Why it works now
Vite is a bundler. It takes your `.tsx` files and your `import` statements (like `import React from 'react'`) and combines them into optimized JavaScript files. By removing the `importmap`, we let Vite do its job without the browser trying to fetch extra modules from external URLs that might clash with the bundled code.