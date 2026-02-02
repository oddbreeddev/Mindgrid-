
# MindGrid: The Convenient Deployment Guide

## 1. The "Zero-Effort" Method (Vercel) - RECOMMENDED
Because this app uses `importmap` and no build step, you can deploy in 30 seconds:

1.  **Push your code to GitHub.**
2.  **Go to [Vercel.com](https://vercel.com).**
3.  **Import the repository.**
4.  **Add Environment Variable:** Under "Environment Variables", add `API_KEY` with your Google Gemini Key.
5.  **Deploy!** Vercel will automatically host the static files.

## 2. The "Drag and Drop" Method (Netlify Drop)
If you don't want to use GitHub:
1.  Go to [Netlify Drop](https://app.netlify.com/drop).
2.  Drag the folder containing all these files into the box.
3.  Once uploaded, go to **Site Settings > Environment Variables** and add your `API_KEY`.
4.  Your app is live!

## 3. SEO & Professionalism Checklist
*   **Custom Domain:** Connect a `.com.ng` or `.edu.ng` domain via Vercel/Netlify settings.
*   **Google Analytics:** Add your Global Site Tag (gtag.js) to the `index.html` `<head>`.
*   **PWA Support:** The `manifest.json` is already linked. Users on Chrome (Android) or Safari (iOS) will see an "Add to Home Screen" option, turning MindGrid into a mobile app.
*   **Search Console:** Submit your site to [Google Search Console](https://search.google.com/search-console) immediately after launch to index your JAMB/WAEC news.

## 4. AdSense Strategy
1.  Place your AdSense script in `index.html`.
2.  The `<AdPlaceholder />` components in the pages will hold space for ads while your account is pending approval.
