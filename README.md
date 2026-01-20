# Chatsi Analytics SDK

Universal e-commerce analytics SDK with automatic event tracking for all platforms.

## 🚀 Quick Start

### 1. Build the SDK

```bash
cd chatsi-analytics-sdk
npm install
npm run build
```

This will create:
- `dist/chatsi-analytics-sdk.min.js` - Minified production version
- `dist/chatsi-analytics-sdk.js` - Unminified debug version

### 2. Integration

Just add one line to your HTML:

```html
<script
  src="https://cdn.chatsi.com/chatsi-analytics-sdk.min.js"
  data-merchant-id="YOUR_MERCHANT_ID"
  data-debug="true">
</script>
```

That's it! The SDK will automatically track all e-commerce events.

## 📦 What's Tracked Automatically

✅ **Add to Cart** - All button variations (add-to-cart, buy-now, etc.)
✅ **Remove from Cart** - Delete/remove buttons
✅ **Product Views** - Product page visits
✅ **Product Clicks** - Product card/link clicks
✅ **Checkout** - Checkout button clicks
✅ **Search** - Search form submissions
✅ **Wishlist** - Add to wishlist/favorites
✅ **Newsletter** - Email signup forms
✅ **Page Views** - All page visits
✅ **Cart Views** - Cart page visits
✅ **Category Views** - Category page visits

## 🏗️ Build Instructions

### Prerequisites

```bash
npm install
```

### Build Commands

```bash
# Build minified version
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Test locally
npm run serve
# Then open http://localhost:8080/examples/test-page.html
```

## 📝 Configuration

The SDK reads PostHog credentials from its own `.env.local` file in the `chatsi-analytics-sdk/` folder:

1. Create or edit `.env.local` in the SDK folder:

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

2. These credentials are automatically embedded during build.

**Note:** The SDK is self-contained and uses its own `.env.local` file, making it easy to move to a separate project.

## 🌐 CDN Upload

### Option 1: Use Vercel/Next.js Public Folder

1. Copy to public folder:
```bash
cp dist/chatsi-analytics-sdk.min.js ../public/
```

2. Access at:
```
https://your-domain.com/chatsi-analytics-sdk.min.js
```

### Option 2: Upload to CDN (Cloudflare, AWS S3, etc.)

#### Cloudflare R2 / Workers

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Upload
wrangler r2 object put chatsi-cdn/chatsi-analytics-sdk.min.js --file=dist/chatsi-analytics-sdk.min.js
```

#### AWS S3

```bash
aws s3 cp dist/chatsi-analytics-sdk.min.js s3://your-bucket/chatsi-analytics-sdk.min.js --acl public-read
```

#### Manual CDN Services

Upload `dist/chatsi-analytics-sdk.min.js` to:
- jsDelivr (via GitHub)
- unpkg (via npm)
- cdnjs
- Your own server

## 🎯 Supported Platforms

Works automatically with:
- ✅ **Salesforce Commerce Cloud (SFCC)**
- ✅ **Shopify**
- ✅ **Magento / Adobe Commerce**
- ✅ **WooCommerce (WordPress)**
- ✅ **BigCommerce**
- ✅ **Custom stores**
- ✅ **Any HTML/JavaScript store**

## 🧪 Testing

1. Start local server:
```bash
npm run serve
```

2. Open test page:
```
http://localhost:8080/examples/test-page.html
```

3. Click buttons and check:
   - Browser console for debug logs
   - PostHog dashboard for events

## 📊 Event Types Captured

| Event | Properties |
|-------|-----------|
| `page_view` | url, title, viewport, device |
| `product_view` | product_id, name, price, category |
| `product_clicked` | product_id, name, url |
| `add_to_cart` | product_id, name, price, quantity |
| `remove_from_cart` | product_id, name |
| `checkout_started` | cart_value, cart_items |
| `checkout_view` | step |
| `cart_view` | cart_value, cart_items |
| `category_view` | products_count |
| `search` | search_query |
| `wishlist_add` | product_id, name, price |
| `newsletter_signup` | form_location |

## 🔧 Manual Tracking

```javascript
// Custom event
window.chatsiSDK.capture('button_clicked', {
  button_id: 'cta-hero',
  page: 'homepage'
});

// Identify user
window.chatsiSDK.identify('user_123', {
  email: 'user@example.com',
  name: 'John Doe'
});

// Reset (logout)
window.chatsiSDK.reset();
```

## 📁 Project Structure

```
chatsi-analytics-sdk/
├── src/
│   └── chatsi-analytics-sdk.js    # Source code
├── dist/
│   ├── chatsi-analytics-sdk.min.js # Minified
│   └── chatsi-analytics-sdk.js     # Debug version
├── examples/
│   └── test-page.html              # Test page
├── package.json
├── build.js                        # Build script
└── README.md
```

## 🐛 Debug Mode

Enable debug logging:

```html
<script
  src="chatsi-analytics-sdk.min.js"
  data-merchant-id="YOUR_ID"
  data-debug="true">
</script>
```

Check browser console for:
- `[Chatsi SDK] ✅` - Success messages
- `[Chatsi SDK] 📊` - Captured events
- `[Chatsi SDK] ❌` - Errors

## 📈 File Sizes

- **Source:** ~25 KB
- **Minified:** ~12 KB
- **Gzipped:** ~4 KB

## 🔒 Security

- PostHog API key is embedded during build (server-side only)
- No sensitive data exposed to client
- All events sent securely to PostHog

## 📄 License

MIT

## 🤝 Support

For issues or questions, contact: support@chatsi.com
