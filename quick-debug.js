const { chromium } = require('playwright');

/**
 * Quick selector debug tool
 * Usage: node quick-debug.js "selector1,selector2,selector3"
 * Example: node quick-debug.js "[data-test='product-sort-container'],.shopping_cart_link,#login-button"
 */

async function quickDebug(selectorsString) {
  const selectors = selectorsString.split(',').map(s => s.trim());
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🌐 Loading SauceDemo...');
  await page.goto('https://www.saucedemo.com/');
  
  console.log('🔐 Logging in...');
  await page.fill('[data-test="username"]', 'standard_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');
  await page.waitForLoadState('networkidle');
  
  console.log('\n📋 SELECTOR DEBUG RESULTS');
  console.log('='.repeat(80));
  
  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i];
    console.log(`\n[${i + 1}/${selectors.length}] Testing: ${selector}`);
    console.log('─'.repeat(60));
    
    try {
      const element = await page.$(selector);
      
      if (!element) {
        console.log('❌ NOT FOUND');
        continue;
      }
      
      const [isVisible, isEnabled, tagName, text, attributes] = await Promise.all([
        element.isVisible(),
        element.isEnabled(),
        element.evaluate(el => el.tagName),
        element.textContent(),
        element.evaluate(el => {
          const attrs = {};
          for (const attr of el.attributes) {
            attrs[attr.name] = attr.value;
          }
          return attrs;
        })
      ]);
      
      console.log(`✅ FOUND - ${tagName} | Visible: ${isVisible} | Enabled: ${isEnabled}`);
      
      if (text && text.trim()) {
        console.log(`📝 Text: "${text.trim()}"`);
      }
      
      // Show key attributes
      const keyAttrs = ['id', 'class', 'data-test', 'name', 'type', 'value', 'placeholder'];
      const importantAttrs = Object.entries(attributes)
        .filter(([key]) => keyAttrs.includes(key))
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      
      if (importantAttrs) {
        console.log(`🏷️  Attrs: ${importantAttrs}`);
      }
      
      // Special handling for input elements
      if (tagName === 'INPUT' && attributes.value) {
        console.log(`💡 Input value: "${attributes.value}"`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
  }
  
  console.log('\n📸 Taking screenshot...');
  await page.screenshot({ path: `quick-debug-${Date.now()}.png`, fullPage: true });
  
  console.log('\n✨ Debug complete! Press Enter to close browser...');
  
  // Wait for user input before closing
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('', async () => {
    await browser.close();
    rl.close();
    console.log('👋 Browser closed');
  });
}

// Get selectors from command line argument
const selectorsArg = process.argv[2];

if (!selectorsArg) {
  console.log('❌ Please provide selectors to debug');
  console.log('Usage: node quick-debug.js "selector1,selector2,selector3"');
  console.log('Example: node quick-debug.js "[data-test=\'login-button\'],.shopping_cart_link,#user-name"');
  process.exit(1);
}

quickDebug(selectorsArg).catch(console.error);