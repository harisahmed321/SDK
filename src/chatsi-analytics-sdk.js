/**
 * Chatsi Analytics SDK - Universal E-commerce Event Tracking
 *
 * Zero-configuration analytics SDK that automatically captures e-commerce events
 * across all platforms: SFCC, Shopify, Magento, WooCommerce, BigCommerce, etc.
 *
 * Just include the script with your merchant ID - that's it!
 *
 * @version 1.0.0
 * @author Chatsi
 * @license MIT
 */

((window, document) => {
  const SDK_VERSION = '1.0.0';

  // PostHog configuration (replace with your actual keys)
  const POSTHOG_API_KEY =
    process.env.NEXT_PUBLIC_POSTHOG_KEY || 'YOUR_POSTHOG_API_KEY';
  const POSTHOG_HOST =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  /**
   * Comprehensive event detection patterns for all major e-commerce platforms
   */
  const EVENT_PATTERNS = {
    // Add to Cart - covers SFCC, Shopify, Magento, WooCommerce, BigCommerce, etc.
    ADD_TO_CART: {
      selectors: [
        // Generic patterns
        '[class*="add-to-cart"]',
        '[class*="addtocart"]',
        '[class*="add-cart"]',
        '[class*="add-to-bag"]',
        '[class*="add-to-basket"]',
        '[id*="add-to-cart"]',
        '[id*="addtocart"]',
        'button[class*="cart"]',

        // Shopify specific
        '.product-form__submit',
        '.shopify-buy__btn',
        '[name="add"]',
        '.btn--add-to-cart',

        // WooCommerce specific
        '.single_add_to_cart_button',
        '.add_to_cart_button',
        '.product_type_simple',

        // Magento specific
        '.action.primary.tocart',
        '#product-addtocart-button',
        '.box-tocart button',

        // BigCommerce specific
        '[data-button-type="add-cart"]',
        '.add-to-cart-button',

        // SFCC specific
        '.add-to-cart-global',
        '.add-to-cart-button',

        // Generic fallbacks
        '.add-to-bag',
        '.add-to-basket',
        '.add-product',
        '.btn-add-cart',
        '.addtobag',
      ],
      textPatterns: [
        /add to (cart|bag|basket)/i,
        /add item/i,
        /buy now/i,
        /shop now/i,
        /purchase/i,
      ],
    },

    // Remove from Cart
    REMOVE_FROM_CART: {
      selectors: [
        '[class*="remove"]',
        '[class*="delete"]',
        '[class*="cart-item-remove"]',
        '[class*="remove-product"]',
        '[class*="delete-item"]',
        '.remove-product',
        '.delete-item',
        '.cart-delete',
        '.remove-from-cart',
        '[data-action="remove"]',
      ],
      textPatterns: [/remove/i, /delete/i],
    },

    // Product Links & Views
    PRODUCT_LINK: {
      selectors: [
        '[class*="product-link"]',
        '[class*="product-tile"]',
        '[class*="product-card"]',
        '[class*="product-item"]',
        '[class*="product-image"]',
        '.product-name a',
        '.product-title a',
        '[data-product-id]',
        '[data-pid]',
        '.product-photo',
        '.product-item-link',
      ],
    },

    // Checkout
    CHECKOUT: {
      selectors: [
        '[class*="checkout"]',
        '[class*="proceed-to-checkout"]',
        '[class*="go-to-checkout"]',
        '#checkout-btn',
        '.checkout-button',
        '.btn-checkout',
        '.cart-checkout',
        '[data-action="checkout"]',
      ],
      textPatterns: [
        /checkout/i,
        /proceed to checkout/i,
        /continue to checkout/i,
        /go to checkout/i,
        /complete purchase/i,
      ],
    },

    // Search
    SEARCH: {
      selectors: [
        '[class*="search"]',
        'input[type="search"]',
        'form[class*="search"]',
        '#search-form',
        '.search-form',
        '[role="search"]',
      ],
    },

    // Wishlist / Save for Later
    WISHLIST: {
      selectors: [
        '[class*="wishlist"]',
        '[class*="favorite"]',
        '[class*="add-to-wishlist"]',
        '[class*="save-for-later"]',
        '.save-for-later',
        '.add-to-favorites',
        '[data-action="wishlist"]',
      ],
      textPatterns: [
        /add to wishlist/i,
        /save for later/i,
        /add to favorites/i,
        /favorite/i,
      ],
    },

    // Newsletter Signup
    NEWSLETTER: {
      selectors: [
        '[class*="newsletter"]',
        '[class*="subscribe"]',
        '[class*="email-signup"]',
        'form[class*="email"]',
        '.newsletter-form',
        '.subscription-form',
      ],
      textPatterns: [/subscribe/i, /sign up/i, /join/i, /newsletter/i],
    },

    // Quick View
    QUICK_VIEW: {
      selectors: [
        '[class*="quick-view"]',
        '[class*="quickview"]',
        '[data-action="quick-view"]',
        '.quickview-button',
      ],
      textPatterns: [/quick view/i, /quick shop/i],
    },

    // Compare Products
    COMPARE: {
      selectors: [
        '[class*="compare"]',
        '[data-action="compare"]',
        '.add-to-compare',
      ],
      textPatterns: [/compare/i, /add to compare/i],
    },
  };

  /**
   * Main SDK class
   */
  class ChatsiAnalyticsSDK {
    constructor(config = {}) {
      this.config = {
        merchantId:
          config.merchantId || this._extractFromScript('data-merchant-id'),
        debug: config.debug || this._extractFromScript('data-debug') === 'true',
        distinctId: this._getOrCreateDistinctId(),
        sessionId: this._getOrCreateSessionId(),
      };

      this.initialized = false;
      this.eventQueue = [];
      this.posthogLoaded = false;

      if (this.config.debug) {
        console.log('[Chatsi SDK] v' + SDK_VERSION + ' initialized');
        console.log('[Chatsi SDK] Merchant ID:', this.config.merchantId);
      }
    }

    /**
     * Extract config from script tag attributes
     */
    _extractFromScript(attribute) {
      const scripts = document.querySelectorAll(
        'script[src*="chatsi-analytics"], script[src*="chatsi-sdk"]'
      );
      for (const script of scripts) {
        const value = script.getAttribute(attribute);
        if (value) return value;
      }
      return null;
    }

    /**
     * Initialize SDK
     */
    async init() {
      if (this.initialized) return;

      if (!this.config.merchantId) {
        console.error(
          '[Chatsi SDK] merchantId is required. Add data-merchant-id to script tag.'
        );
        return;
      }

      if (!POSTHOG_API_KEY || POSTHOG_API_KEY === 'YOUR_POSTHOG_API_KEY') {
        console.error('[Chatsi SDK] PostHog API key not configured.');
        return;
      }

      if (this.config.debug) {
        console.log(
          '[Chatsi SDK] 🚀 Initializing with PostHog key:',
          POSTHOG_API_KEY.substring(0, 10) + '...'
        );
        console.log('[Chatsi SDK] PostHog host:', POSTHOG_HOST);
      }

      try {
        // Load PostHog
        await this._loadPostHog();

        if (this.config.debug) {
          console.log(
            '[Chatsi SDK] After _loadPostHog, window.posthog exists:',
            !!window.posthog
          );
        }

        // Initialize PostHog with embedded API key
        if (window.posthog) {
          if (this.config.debug) {
            console.log('[Chatsi SDK] Calling posthog.init()...');
          }

          window.posthog.init(POSTHOG_API_KEY, {
            api_host: POSTHOG_HOST,
            autocapture: false,
            capture_pageview: false,
            persistence: 'localStorage',
            loaded: (ph) => {
              this.posthogLoaded = true;

              // Opt in to capturing (important: main app opts out by default)
              if (typeof ph.opt_in_capturing === 'function') {
                ph.opt_in_capturing();
                if (this.config.debug) {
                  console.log('[Chatsi SDK] ✅ Opted in to capturing');
                }
              }

              this._processQueue();

              if (this.config.debug) {
                console.log('[Chatsi SDK] ✅ PostHog loaded successfully');
                console.log('[Chatsi SDK] PostHog instance:', ph);
              }
            },
          });
        } else {
          console.error(
            '[Chatsi SDK] ❌ PostHog library loaded but window.posthog is undefined'
          );
        }

        this.initialized = true;

        // Start auto-capture
        this._startAutoCapture();

        if (this.config.debug) {
          console.log('[Chatsi SDK] ✅ Auto-capture enabled');
        }
      } catch (error) {
        console.error('[Chatsi SDK] ❌ Init failed:', error);
      }
    }

    /**
     * Load PostHog library
     */
    _loadPostHog() {
      return new Promise((resolve, reject) => {
        if (window.posthog) {
          if (this.config.debug) {
            console.log('[Chatsi SDK] PostHog already loaded');
          }
          resolve();
          return;
        }

        if (this.config.debug) {
          console.log('[Chatsi SDK] Loading PostHog library...');
        }

        const script = document.createElement('script');
        // Try unpkg CDN (more reliable than jsdelivr for some networks)
        script.src = 'https://unpkg.com/posthog-js@1.96.1/dist/array.full.js';
        script.async = true;
        script.onload = () => {
          if (this.config.debug) {
            console.log('[Chatsi SDK] PostHog library loaded from CDN');
            console.log(
              '[Chatsi SDK] window.posthog available:',
              !!window.posthog
            );
          }
          // PostHog array.full.js initializes immediately
          setTimeout(resolve, 100);
        };
        script.onerror = (error) => {
          console.error(
            '[Chatsi SDK] Failed to load PostHog library from unpkg'
          );

          // Fallback to another CDN
          const fallbackScript = document.createElement('script');
          fallbackScript.src =
            'https://cdn.jsdelivr.net/npm/posthog-js@1.96.1/dist/array.full.js';
          fallbackScript.async = true;
          fallbackScript.onload = () => {
            if (this.config.debug) {
              console.log(
                '[Chatsi SDK] PostHog loaded from fallback CDN (jsdelivr)'
              );
            }
            setTimeout(resolve, 100);
          };
          fallbackScript.onerror = () => {
            console.error('[Chatsi SDK] All CDN attempts failed');
            reject(new Error('Failed to load PostHog from any CDN'));
          };
          document.head.appendChild(fallbackScript);
        };
        document.head.appendChild(script);
      });
    }

    /**
     * Get or create distinct ID
     */
    _getOrCreateDistinctId() {
      try {
        const stored = localStorage.getItem('chatsi_distinct_id');
        if (stored) return stored;

        const id = 'user_' + this._generateId();
        localStorage.setItem('chatsi_distinct_id', id);
        return id;
      } catch {
        return 'user_' + this._generateId();
      }
    }

    /**
     * Get or create session ID
     */
    _getOrCreateSessionId() {
      try {
        const stored = sessionStorage.getItem('chatsi_session_id');
        if (stored) return stored;

        const id = 'session_' + this._generateId();
        sessionStorage.setItem('chatsi_session_id', id);
        return id;
      } catch {
        return 'session_' + this._generateId();
      }
    }

    /**
     * Generate random ID
     */
    _generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Process queued events
     */
    _processQueue() {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        this._sendEvent(event.name, event.properties);
      }
    }

    /**
     * Send event to PostHog
     */
    _sendEvent(eventName, properties = {}) {
      if (!this.posthogLoaded || !window.posthog) {
        if (this.config.debug) {
          console.log(
            '[Chatsi SDK] Queueing event (PostHog not ready):',
            eventName
          );
        }
        this.eventQueue.push({ name: eventName, properties });
        return;
      }

      const enrichedProperties = {
        ...properties,
        merchantId: this.config.merchantId,
        sessionId: this.config.sessionId,
        sdk_version: SDK_VERSION,
        timestamp: Date.now(),
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
      };

      try {
        if (this.config.debug) {
          console.log('[Chatsi SDK] 📊 Capturing event:', eventName);
          console.log('[Chatsi SDK] Properties:', enrichedProperties);
          console.log('[Chatsi SDK] PostHog instance:', window.posthog);
        }

        // Use the same capture method as the main project
        window.posthog.capture(eventName, enrichedProperties);

        if (this.config.debug) {
          console.log('[Chatsi SDK] ✅ Event captured successfully');
        }
      } catch (error) {
        console.error('[Chatsi SDK] ❌ Capture failed:', error);
      }
    }

    /**
     * Start automatic event capture
     */
    _startAutoCapture() {
      // Capture page view immediately
      this._capturePageView();

      // Set up click tracking
      this._setupClickTracking();

      // Set up form tracking
      this._setupFormTracking();

      // Set up mutation observer for dynamically added elements
      this._setupMutationObserver();

      // Detect page type and capture relevant events
      this._detectPageType();

      // Track page unload
      this._setupUnloadTracking();
    }

    /**
     * Capture page view
     */
    _capturePageView() {
      this._sendEvent('page_view', {
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        device_type: this._getDeviceType(),
      });
    }

    /**
     * Get device type
     */
    _getDeviceType() {
      const ua = navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
      }
      if (
        /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
          ua
        )
      ) {
        return 'mobile';
      }
      return 'desktop';
    }

    /**
     * Set up click tracking
     */
    _setupClickTracking() {
      document.addEventListener(
        'click',
        (e) => {
          const target = e.target;
          if (!target) return;

          // Check for Add to Cart
          if (this._matchesPattern(target, EVENT_PATTERNS.ADD_TO_CART)) {
            this._handleAddToCart(target);
          }
          // Check for Remove from Cart
          else if (
            this._matchesPattern(target, EVENT_PATTERNS.REMOVE_FROM_CART)
          ) {
            this._handleRemoveFromCart(target);
          }
          // Check for Checkout
          else if (this._matchesPattern(target, EVENT_PATTERNS.CHECKOUT)) {
            this._handleCheckout(target);
          }
          // Check for Product Link
          else if (this._matchesPattern(target, EVENT_PATTERNS.PRODUCT_LINK)) {
            this._handleProductClick(target);
          }
          // Check for Wishlist
          else if (this._matchesPattern(target, EVENT_PATTERNS.WISHLIST)) {
            this._handleWishlistAdd(target);
          }
          // Check for Quick View
          else if (this._matchesPattern(target, EVENT_PATTERNS.QUICK_VIEW)) {
            this._handleQuickView(target);
          }
          // Check for Compare
          else if (this._matchesPattern(target, EVENT_PATTERNS.COMPARE)) {
            this._handleCompare(target);
          }
        },
        true
      );
    }

    /**
     * Set up form tracking
     */
    _setupFormTracking() {
      document.addEventListener(
        'submit',
        (e) => {
          const form = e.target;
          if (!form || form.tagName !== 'FORM') return;

          // Search forms
          if (this._matchesPattern(form, EVENT_PATTERNS.SEARCH)) {
            this._handleSearch(form);
          }
          // Newsletter forms
          else if (this._matchesPattern(form, EVENT_PATTERNS.NEWSLETTER)) {
            this._handleNewsletter(form);
          }
        },
        true
      );
    }

    /**
     * Check if element matches pattern
     */
    _matchesPattern(element, pattern) {
      if (!element) return false;

      // Check selectors
      if (pattern.selectors) {
        for (const selector of pattern.selectors) {
          try {
            if (element.matches && element.matches(selector)) return true;
            if (element.closest && element.closest(selector)) return true;
          } catch (e) {
            // Invalid selector, continue
          }
        }
      }

      // Check text patterns
      if (pattern.textPatterns) {
        const text = element.textContent || element.value || '';
        for (const regex of pattern.textPatterns) {
          if (regex.test(text)) return true;
        }
      }

      return false;
    }

    /**
     * Extract product data from element
     */
    _extractProductData(element) {
      const product = {};

      // Try to find product container
      const container =
        element.closest('[data-product-id], [data-pid], [class*="product"]') ||
        element;

      // Extract ID
      product.id =
        container.getAttribute('data-product-id') ||
        container.getAttribute('data-pid') ||
        container.getAttribute('data-itemid') ||
        container.getAttribute('data-id') ||
        this._extractFromUrl(container.href, ['pid', 'id', 'product']);

      // Extract name
      const nameEl =
        container.querySelector(
          '[class*="product-name"], [class*="product-title"], .name, .title'
        ) || container.querySelector('h1, h2, h3, h4');
      product.name =
        container.getAttribute('data-product-name') ||
        container.getAttribute('data-name') ||
        (nameEl ? nameEl.textContent.trim() : '');

      // Extract price
      const priceEl = container.querySelector(
        '[class*="price"]:not([class*="original"]), [data-price]'
      );
      const priceText =
        container.getAttribute('data-price') ||
        container.getAttribute('data-product-price') ||
        (priceEl ? priceEl.textContent : '');
      product.price = this._parsePrice(priceText);

      // Extract category
      product.category =
        container.getAttribute('data-category') ||
        container.getAttribute('data-product-category') ||
        this._extractCategoryFromBreadcrumb();

      // Extract image
      const imgEl = container.querySelector('img');
      product.image_url = imgEl ? imgEl.src : '';

      // Extract SKU
      product.sku =
        container.getAttribute('data-sku') ||
        container.getAttribute('data-product-sku');

      return product;
    }

    /**
     * Parse price from text
     */
    _parsePrice(text) {
      if (!text) return null;
      const match = text.match(/[\d,]+\.?\d*/);
      return match ? parseFloat(match[0].replace(/,/g, '')) : null;
    }

    /**
     * Extract value from URL
     */
    _extractFromUrl(url, keys) {
      if (!url) return null;
      try {
        const urlObj = new URL(url, window.location.origin);
        for (const key of keys) {
          const value = urlObj.searchParams.get(key);
          if (value) return value;
        }
      } catch (e) {}
      return null;
    }

    /**
     * Extract category from breadcrumb
     */
    _extractCategoryFromBreadcrumb() {
      const breadcrumb = document.querySelector('[class*="breadcrumb"]');
      if (!breadcrumb) return null;

      const links = breadcrumb.querySelectorAll('a');
      return links.length > 1
        ? links[links.length - 2].textContent.trim()
        : null;
    }

    /**
     * Handle Add to Cart click
     */
    _handleAddToCart(element) {
      const product = this._extractProductData(element);

      this._sendEvent('add_to_cart', {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_category: product.category,
        product_image: product.image_url,
        product_sku: product.sku,
        quantity: 1,
        currency: this._detectCurrency(),
        button_text: element.textContent?.trim(),
        button_class: element.className,
      });
    }

    /**
     * Handle Remove from Cart click
     */
    _handleRemoveFromCart(element) {
      const product = this._extractProductData(element);

      this._sendEvent('remove_from_cart', {
        product_id: product.id,
        product_name: product.name,
      });
    }

    /**
     * Handle Checkout click
     */
    _handleCheckout(element) {
      const cartData = this._extractCartData();

      this._sendEvent('checkout_started', {
        cart_value: cartData.total,
        cart_items: cartData.itemCount,
        currency: this._detectCurrency(),
      });
    }

    /**
     * Handle Product click
     */
    _handleProductClick(element) {
      const product = this._extractProductData(element);

      this._sendEvent('product_clicked', {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_category: product.category,
        product_url: element.href,
      });
    }

    /**
     * Handle Wishlist add
     */
    _handleWishlistAdd(element) {
      const product = this._extractProductData(element);

      this._sendEvent('wishlist_add', {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
      });
    }

    /**
     * Handle Quick View
     */
    _handleQuickView(element) {
      const product = this._extractProductData(element);

      this._sendEvent('quick_view', {
        product_id: product.id,
        product_name: product.name,
      });
    }

    /**
     * Handle Compare
     */
    _handleCompare(element) {
      const product = this._extractProductData(element);

      this._sendEvent('product_compare', {
        product_id: product.id,
        product_name: product.name,
      });
    }

    /**
     * Handle Search submit
     */
    _handleSearch(form) {
      const input = form.querySelector(
        'input[type="search"], input[name*="search"], input[name="q"]'
      );
      const query = input ? input.value : '';

      this._sendEvent('search', {
        search_query: query,
        search_type: 'submit',
      });
    }

    /**
     * Handle Newsletter submit
     */
    _handleNewsletter(form) {
      this._sendEvent('newsletter_signup', {
        form_location: this._getElementLocation(form),
      });
    }

    /**
     * Extract cart data from page
     */
    _extractCartData() {
      const data = { total: null, itemCount: null };

      // Try to find cart total
      const totalEl = document.querySelector(
        '[class*="cart-total"], [class*="grand-total"], .total-price, .cart-total-price'
      );
      if (totalEl) {
        data.total = this._parsePrice(totalEl.textContent);
      }

      // Try to find item count
      const countEl = document.querySelector(
        '[class*="cart-count"], [class*="item-count"], .cart-quantity, .minicart-quantity'
      );
      if (countEl) {
        const match = countEl.textContent.match(/\d+/);
        data.itemCount = match ? parseInt(match[0]) : null;
      }

      return data;
    }

    /**
     * Detect currency from page
     */
    _detectCurrency() {
      const currencyEl = document.querySelector(
        '[class*="currency"], [data-currency]'
      );
      if (currencyEl) {
        const text =
          currencyEl.textContent || currencyEl.getAttribute('data-currency');
        const match = text.match(/[A-Z]{3}/);
        if (match) return match[0];
      }

      // Check for currency symbols
      const pageText = document.body.textContent;
      if (pageText.includes('$')) return 'USD';
      if (pageText.includes('€')) return 'EUR';
      if (pageText.includes('£')) return 'GBP';
      if (pageText.includes('¥')) return 'JPY';
      if (pageText.includes('₹')) return 'INR';

      return 'USD'; // default
    }

    /**
     * Detect page type
     */
    _detectPageType() {
      const url = window.location.pathname.toLowerCase();
      const body = document.body;

      // Product Detail Page
      if (
        url.includes('/product') ||
        url.includes('/p/') ||
        body.classList.contains('product-detail') ||
        body.classList.contains('product-page')
      ) {
        const product = this._extractProductData(document.body);
        if (product.id) {
          this._sendEvent('product_view', {
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
            product_category: product.category,
          });
        }
      }
      // Category/Listing Page
      else if (
        url.includes('/category') ||
        url.includes('/search') ||
        url.includes('/c/') ||
        body.classList.contains('category-page')
      ) {
        const products = document.querySelectorAll(
          '[data-product-id], [data-pid], [class*="product-tile"]'
        );
        this._sendEvent('category_view', {
          products_count: products.length,
        });
      }
      // Cart Page
      else if (
        url.includes('/cart') ||
        url.includes('/basket') ||
        body.classList.contains('cart-page')
      ) {
        const cartData = this._extractCartData();
        this._sendEvent('cart_view', {
          cart_value: cartData.total,
          cart_items: cartData.itemCount,
        });
      }
      // Checkout Page
      else if (
        url.includes('/checkout') ||
        body.classList.contains('checkout-page')
      ) {
        this._sendEvent('checkout_view', {
          step: this._detectCheckoutStep(),
        });
      }
    }

    /**
     * Detect checkout step
     */
    _detectCheckoutStep() {
      const url = window.location.pathname;
      if (url.includes('shipping')) return 'shipping';
      if (url.includes('billing') || url.includes('payment')) return 'payment';
      if (url.includes('review')) return 'review';
      if (url.includes('confirmation')) return 'confirmation';
      return 'start';
    }

    /**
     * Get element location on page
     */
    _getElementLocation(element) {
      if (element.id) return `#${element.id}`;

      const classes = Array.from(element.classList);
      if (classes.length > 0) return `.${classes[0]}`;

      return element.tagName.toLowerCase();
    }

    /**
     * Set up mutation observer for dynamic content
     */
    _setupMutationObserver() {
      const observer = new MutationObserver((mutations) => {
        // Re-detect page type when DOM changes significantly
        if (mutations.length > 5) {
          this._detectPageType();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    /**
     * Set up unload tracking
     */
    _setupUnloadTracking() {
      window.addEventListener('beforeunload', () => {
        const timeOnPage = Date.now() - performance.timing.navigationStart;

        this._sendEvent('page_exit', {
          time_on_page: timeOnPage,
        });
      });
    }

    /**
     * Public API for manual event tracking
     */
    capture(eventName, properties = {}) {
      this._sendEvent(eventName, properties);
    }

    identify(userId, traits = {}) {
      if (window.posthog && typeof window.posthog.identify === 'function') {
        window.posthog.identify(userId, traits);

        if (this.config.debug) {
          console.log('[Chatsi SDK] 👤 User identified:', userId);
        }
      }
    }

    reset() {
      if (window.posthog && typeof window.posthog.reset === 'function') {
        window.posthog.reset();
        this.config.distinctId = this._getOrCreateDistinctId();
        this.config.sessionId = this._getOrCreateSessionId();

        if (this.config.debug) {
          console.log('[Chatsi SDK] 🔄 User reset');
        }
      }
    }
  }

  // Auto-initialize on script load
  const sdk = new ChatsiAnalyticsSDK();

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => sdk.init());
  } else {
    sdk.init();
  }

  // Expose globally
  window.ChatsiAnalytics = ChatsiAnalyticsSDK;
  window.chatsiSDK = sdk;
})(window, document);
