const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const SRC_FILE = path.join(__dirname, 'src', 'chatsi-analytics-sdk.js');
const DIST_FILE = path.join(__dirname, 'dist', 'chatsi-analytics-sdk.min.js');
const DIST_DEBUG_FILE = path.join(__dirname, 'dist', 'chatsi-analytics-sdk.js');

async function build() {
  try {
    console.log('🔨 Building Chatsi Analytics SDK...');

    // Read source file
    let source = fs.readFileSync(SRC_FILE, 'utf8');

    // Replace environment variables with actual values from local .env.local
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');

      for (const line of lines) {
        if (line.trim() && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts
            .join('=')
            .trim()
            .replace(/^["']|["']$/g, '');

          if (key.includes('POSTHOG')) {
            const placeholder = `process.env.${key.trim()}`;
            source = source.replace(new RegExp(placeholder, 'g'), `'${value}'`);
          }
        }
      }
    } else {
      console.warn('⚠️  .env.local file not found. Using default values.');
    }

    // Replace any remaining process.env references with defaults
    source = source.replace(
      /process\.env\.NEXT_PUBLIC_POSTHOG_KEY/g,
      "'YOUR_POSTHOG_API_KEY'"
    );
    source = source.replace(
      /process\.env\.NEXT_PUBLIC_POSTHOG_HOST/g,
      "'https://us.i.posthog.com'"
    );

    // Copy unminified version to dist
    fs.writeFileSync(DIST_DEBUG_FILE, source);
    console.log('✅ Created unminified version: dist/chatsi-analytics-sdk.js');

    // Minify
    const result = await minify(source, {
      compress: {
        drop_console: false, // Keep console for debug mode
        dead_code: true,
        passes: 2,
      },
      mangle: {
        reserved: ['ChatsiAnalytics', 'chatsiSDK'], // Keep these names
      },
      format: {
        comments: false,
        preamble:
          '/*! Chatsi Analytics SDK v1.0.0 | (c) Chatsi | MIT License */',
      },
    });

    if (result.code) {
      fs.writeFileSync(DIST_FILE, result.code);

      const originalSize = (source.length / 1024).toFixed(2);
      const minifiedSize = (result.code.length / 1024).toFixed(2);
      const savings = (
        ((source.length - result.code.length) / source.length) *
        100
      ).toFixed(1);

      console.log('✅ Minified successfully!');
      console.log(`📦 Original size: ${originalSize} KB`);
      console.log(`📦 Minified size: ${minifiedSize} KB`);
      console.log(`💾 Saved: ${savings}%`);
      console.log(`📁 Output: ${DIST_FILE}`);
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
