# 🎯 Chatsi Analytics SDK - Quick Reference

## Installation (Copy & Paste)

```html
<script
  src="https://chatsi.app/chatsi-analytics-sdk.min.js"
  data-merchant-id="YOUR_MERCHANT_ID">
</script>
```

## Events Tracked Automatically

| Event | Trigger |
|-------|---------|
| `page_view` | Page load |
| `product_view` | Product page visit |
| `product_clicked` | Product link click |
| `add_to_cart` | Add to cart button |
| `remove_from_cart` | Remove button |
| `checkout_started` | Checkout button |
| `wishlist_add` | Wishlist button |
| `search` | Search form submit |
| `newsletter_signup` | Newsletter form |
| `cart_view` | Cart page visit |
| `category_view` | Category page visit |

## CSS Classes Recognized

### Add to Cart (20+ patterns)
```css
.add-to-cart
.addtocart
.add-to-bag
.product-form__submit        /* Shopify */
.single_add_to_cart_button   /* WooCommerce */
.action.primary.tocart       /* Magento */
[data-button-type="add-cart"]/* BigCommerce */
```

### Remove from Cart
```css
.remove-from-cart
.cart-item-remove
.remove-product
```

### Checkout
```css
.checkout-button
.proceed-to-checkout
.btn-checkout
#checkout-btn
```

### Wishlist
```css
.add-to-wishlist
.save-for-later
.add-to-favorites
```

## Manual Tracking

```javascript
// Custom event
window.chatsiSDK.capture('event_name', {
  property: 'value'
});

// Identify user
window.chatsiSDK.identify('user_123', {
  email: 'user@example.com',
  name: 'John Doe'
});

// Reset (logout)
window.chatsiSDK.reset();
```

## Debug Mode

```html
<script
  src="https://chatsi.app/chatsi-analytics-sdk.min.js"
  data-merchant-id="YOUR_MERCHANT_ID"
  data-debug="true">
</script>
```

Check browser console for event logs.

## Data Attributes (Optional)

Add to buttons for richer tracking:

```html
<button
  class="add-to-cart"
  data-product-id="123"
  data-product-name="Cool Product"
  data-product-price="99.99"
  data-category="Electronics">
  Add to Cart
</button>
```

## File Size

- Minified: **12 KB**
- Gzipped: **~4 KB**

## Browser Support

✅ Chrome 60+
✅ Firefox 60+
✅ Safari 12+
✅ Edge 79+

## Platform Support

✅ Salesforce Commerce Cloud (SFCC)
✅ Shopify
✅ Magento / Adobe Commerce
✅ WooCommerce
✅ BigCommerce
✅ Custom HTML stores

## Common Issues

### Events not appearing in PostHog?
1. Check merchant ID is correct
2. Enable debug mode
3. Check browser console for errors
4. Wait 1-2 minutes for PostHog to process

### SDK not loading?
1. Check URL is correct
2. Check network tab in dev tools
3. Verify CORS is allowed

### Buttons not tracked?
1. Check button has a recognized class name
2. Or add text like "Add to Cart"
3. Or use manual tracking

## Contact

📧 support@chatsi.com
🌐 https://chatsi.app
📚 Full docs: https://docs.chatsi.app
