# Deployment Guide for AI Academic SPA

This guide will help you fix the 404 errors that occur when navigating in your Single Page Application (SPA) in production.

## Problem
When you deploy a React SPA using React Router with `BrowserRouter`, the server needs to be configured to serve the `index.html` file for all routes that don't correspond to actual files. Without this configuration, direct access to routes like `/article-writer` or browser refresh/back button will result in 404 errors.

## Solution
The following configuration files have been added to support different hosting platforms:

## 1. Netlify (_redirects)
File: `public/_redirects`
```
/*    /index.html   200
```
This tells Netlify to serve `index.html` for all routes with a 200 status code.

## 2. Vercel (vercel.json)
File: `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 3. Apache (.htaccess)
File: `public/.htaccess`
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

## 4. Nginx
File: `nginx.conf.example`
Add this to your nginx server block:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 5. GitHub Pages
File: `public/404.html`
A special 404.html page that redirects to the main app for GitHub Pages deployment.

## Deployment Steps

### For Netlify:
1. Build your app: `npm run build`
2. Deploy the `dist` folder
3. The `_redirects` file will be automatically included

### For Vercel:
1. The `vercel.json` file will be automatically detected
2. Deploy using Vercel CLI or GitHub integration

### For Apache/cPanel:
1. Build your app: `npm run build`
2. Upload contents of `dist` folder to your web root
3. The `.htaccess` file will be included automatically

### For GitHub Pages:
1. Build your app: `npm run build`
2. Deploy the `dist` folder contents
3. The `404.html` will handle routing

## Testing
After deployment:
1. Navigate to your main page
2. Go to any feature page (e.g., `/article-writer`)
3. Refresh the page or use browser back button
4. The page should load correctly without 404 errors

## Additional Notes
- Make sure your hosting platform serves the `index.html` file for unknown routes
- If using a custom server, implement the SPA fallback logic
- The configuration files are placed in `public/` so they get copied to the build output

## Build Commands
- Development build: `npm run build:dev`
- Production build: `npm run build`
- Preview build locally: `npm run preview`