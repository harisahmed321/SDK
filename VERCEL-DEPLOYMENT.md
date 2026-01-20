# Vercel Deployment Guide

## Prerequisites

- Vercel CLI installed: `npm i -g vercel`
- Vercel account (free tier works)

## Quick Deploy

### Option 1: Deploy with Vercel CLI (Recommended)

1. **Login to Vercel:**

   ```bash
   vercel login
   ```

2. **Deploy from project directory:**

   ```bash
   vercel --prod
   ```

3. **Your SDK will be available at:**
   ```
   https://your-project.vercel.app/chatsi-analytics-sdk.min.js
   https://your-project.vercel.app/chatsi-analytics-sdk.js
   ```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Vercel will auto-detect the configuration
5. Click "Deploy"

## Usage After Deployment

Once deployed, use your SDK in any HTML page:

```html
<script src="https://your-project.vercel.app/chatsi-analytics-sdk.min.js"></script>
<script>
  // Initialize SDK
  const analytics = new ChatsiAnalytics({
    posthogApiKey: 'YOUR_POSTHOG_KEY',
    posthogHost: 'https://us.i.posthog.com',
    platform: 'shopify',
    debug: true,
  });

  // Track events
  analytics.trackViewedProduct({
    product_id: '123',
    name: 'Product Name',
    price: 29.99,
  });
</script>
```

## Environment Variables

If you need to configure PostHog credentials:

1. Create `.env.local` file:

   ```env
   NEXT_PUBLIC_POSTHOG_KEY=your_posthog_api_key
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   ```

2. Rebuild:
   ```bash
   npm run build
   ```

## Files Structure

```
public/
  ├── chatsi-analytics-sdk.min.js    (Minified - Production use)
  └── chatsi-analytics-sdk.js        (Debug version)
```

## Vercel Configuration

The `vercel.json` file includes:

- ✅ CORS headers (allows cross-origin requests)
- ✅ Cache headers (1 year cache for immutable files)
- ✅ Proper Content-Type for JavaScript files

## Updating Your Deployment

1. Make changes to `src/chatsi-analytics-sdk.js`
2. Run `npm run build`
3. Commit changes
4. Push to Git (auto-deploys) or run `vercel --prod`

## Troubleshooting

- **CORS errors**: Check that `Access-Control-Allow-Origin: *` is set in response headers
- **404 errors**: Ensure files exist in `public/` directory
- **Old version loading**: Clear browser cache or increment version number

## Performance

- **Minified size**: ~14 KB
- **Gzipped**: ~5 KB
- **CDN**: Globally distributed via Vercel Edge Network
- **Cache**: 1 year cache with immutable flag
