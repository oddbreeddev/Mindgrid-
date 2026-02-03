# 🚀 MindGrid Nigeria: Launch Guide

Congratulations on securing your domain from HostAfrica! Follow these steps to get **mindgrid.com.ng** live.

## Step 1: Choose Your Host
For a Vite/React app, **do not** use traditional cPanel hosting. Use **Netlify** (e.g., netlify.com) or **Vercel** (vercel.com). They are optimized for this tech stack.

## Step 2: Connect GitHub & Deploy
1.  Push your code to a GitHub repository.
2.  Login to Netlify/Vercel and "Import Project" from GitHub.
3.  **Crucial:** In the "Environment Variables" section of the host dashboard, add:
    *   Key: `API_KEY`
    *   Value: `[Your-Actual-Gemini-API-Key]`
4.  Click **Deploy**. Your site will be live at a temporary address (e.g., `mindgrid.netlify.app`).

## Step 3: Point HostAfrica to your Host
1.  In your Host (Netlify/Vercel), go to **Domain Settings** > **Add Custom Domain**.
2.  Type in `mindgrid.com.ng`.
3.  The host will give you 4 **Nameservers** (e.g., `dns1.p01.nsone.net`, etc.).
4.  **Go to HostAfrica Client Area:**
    *   Navigate to **Domains** -> **My Domains**.
    *   Click on the wrench icon (Manage) next to `mindgrid.com.ng`.
    *   Click **Nameservers** on the left sidebar.
    *   Select "Use custom nameservers" and paste the 4 addresses from your host.
    *   Click **Change Nameservers**.

## Step 4: Verification (The "Wait" Period)
*   **Propagation:** It takes anywhere from 1 hour to 24 hours for the new address to "spread" across the internet (DNS propagation). 
*   **SSL:** Once the domain is connected, your host (Netlify/Vercel) will automatically issue a free Let's Encrypt SSL certificate.

## Step 5: SEO & Webmaster Tools
1.  **Google Search Console:** Submit your `sitemap.xml` (provided in this project) so Google starts indexing your JAMB and Career updates.
2.  **AdSense:** Now that you have a top-level domain (`.com.ng`), you can submit your site for AdSense approval using the `ads.txt` file included in this project.

## Troubleshooting
*   **Blank Page?** Ensure you are using `HashRouter` (already implemented in `App.tsx`) to prevent 404s on page refreshes.
*   **AI Not Responding?** Double-check that the `API_KEY` environment variable in your host dashboard does not have any extra spaces.
