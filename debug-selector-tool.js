const { chromium } = require('playwright');

/**
 * Debug tool for inspecting selectors on SauceDemo website
 * Usage: node debug-selector-tool.js [url] [username] [password]
 * Example: node debug-selector-tool.js https://www.saucedemo.com standard_user secret_sauce
 */

class SelectorDebugger {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init(headless = false) {
    this.browser = await chromium.launch({ 
      headless,
      slowMo: 1000 // Slow down for better visibility when headed
    });
    this.page = await this.browser.newPage();
  }

  async navigateAndLogin(url, username = 'standard_user', password = 'secret_sauce') {
    console.log(`\n🌐 Navigating to: ${url}`);
    await this.page.goto(url);
    
    if (username && password) {
      console.log(`🔐 Logging in with username: ${username}`);
      await this.page.fill('[data-test="username"]', username);
      await this.page.fill('[data-test="password"]', password);
      await this.page.click('[data-test="login-button"]');
      await this.page.waitForLoadState('networkidle');
      console.log('✅ Login completed');
    }
  }

  async debugSelector(selector) {
    console.log(`\n🔍 Debugging selector: ${selector}`);
    console.log('─'.repeat(50));
    
    try {
      const element = await this.page.$(selector);
      
      if (!element) {
        console.log('❌ Element not found!');
        return false;
      }
      
      console.log('✅ Element found!');
      
      // Get basic properties
      const isVisible = await element.isVisible();
      const isEnabled = await element.isEnabled();
      const tagName = await element.evaluate(el => el.tagName);
      const textContent = await element.textContent();
      const innerHTML = await element.innerHTML();
      
      console.log(`📊 Properties:`);
      console.log(`   Tag Name: ${tagName}`);
      console.log(`   Visible: ${isVisible}`);
      console.log(`   Enabled: ${isEnabled}`);
      console.log(`   Text Content: "${textContent}"`);
      console.log(`   Inner HTML: "${innerHTML.substring(0, 100)}${innerHTML.length > 100 ? '...' : ''}"`);
      
      // Get all attributes
      const attributes = await element.evaluate(el => {
        const attrs = {};
        for (const attr of el.attributes) {
          attrs[attr.name] = attr.value;
        }
        return attrs;
      });
      
      console.log(`📋 Attributes:`);
      Object.entries(attributes).forEach(([key, value]) => {
        console.log(`   ${key}: "${value}"`);
      });
      
      // Get CSS classes if any
      if (attributes.class) {
        console.log(`🎨 CSS Classes: [${attributes.class.split(' ').join(', ')}]`);
      }
      
      // Check if it's an input and get value
      if (tagName === 'INPUT') {
        const value = await element.getAttribute('value');
        const type = await element.getAttribute('type');
        const placeholder = await element.getAttribute('placeholder');
        
        console.log(`📝 Input Properties:`);
        console.log(`   Type: ${type}`);
        console.log(`   Value: "${value}"`);
        console.log(`   Placeholder: "${placeholder}"`);
      }
      
      // Get bounding box
      const boundingBox = await element.boundingBox();
      if (boundingBox) {
        console.log(`📐 Position & Size:`);
        console.log(`   x: ${boundingBox.x}, y: ${boundingBox.y}`);
        console.log(`   width: ${boundingBox.width}, height: ${boundingBox.height}`);
      }
      
      return true;
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      return false;
    }
  }

  async findSimilarSelectors(baseSelector) {
    console.log(`\n🔎 Finding similar selectors to: ${baseSelector}`);
    console.log('─'.repeat(50));
    
    const similarSelectors = [];
    
    // Extract data-test value if exists
    const dataTestMatch = baseSelector.match(/data-test="([^"]+)"/);
    if (dataTestMatch) {
      const dataTestValue = dataTestMatch[1];
      const variations = [
        `[data-test="${dataTestValue}"]`,
        `[data-test="${dataTestValue.replace(/_/g, '-')}"]`,
        `[data-test="${dataTestValue.replace(/-/g, '_')}"]`,
        `.${dataTestValue}`,
        `.${dataTestValue.replace(/_/g, '-')}`,
        `.${dataTestValue.replace(/-/g, '_')}`,
        `#${dataTestValue}`,
        `#${dataTestValue.replace(/_/g, '-')}`,
        `#${dataTestValue.replace(/-/g, '_')}`
      ];
      similarSelectors.push(...variations);
    }
    
    // Extract class if exists
    const classMatch = baseSelector.match(/\.([^.\s\[]+)/);
    if (classMatch) {
      const className = classMatch[1];
      const variations = [
        `.${className}`,
        `[class*="${className}"]`,
        `[class^="${className}"]`,
        `[class$="${className}"]`
      ];
      similarSelectors.push(...variations);
    }
    
    // Extract ID if exists
    const idMatch = baseSelector.match(/#([^#\s\[]+)/);
    if (idMatch) {
      const idValue = idMatch[1];
      const variations = [
        `#${idValue}`,
        `[id="${idValue}"]`,
        `[id*="${idValue}"]`
      ];
      similarSelectors.push(...variations);
    }
    
    // Test each variation
    for (const selector of [...new Set(similarSelectors)]) {
      const element = await this.page.$(selector);
      if (element) {
        const isVisible = await element.isVisible();
        console.log(`✅ ${selector} - ${isVisible ? 'Visible' : 'Hidden'}`);
      } else {
        console.log(`❌ ${selector} - Not found`);
      }
    }
  }

  async debugMultipleSelectors(selectors) {
    console.log(`\n📝 Testing multiple selectors:`);
    console.log('='.repeat(60));
    
    for (const selector of selectors) {
      await this.debugSelector(selector);
      console.log(''); // Empty line for separation
    }
  }

  async takeScreenshot(filename = 'debug-screenshot.png') {
    await this.page.screenshot({ path: filename, fullPage: true });
    console.log(`📸 Screenshot saved as: ${filename}`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n👋 Browser closed');
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const url = args[0] || 'https://www.saucedemo.com';
  const username = args[1] || 'standard_user';
  const password = args[2] || 'secret_sauce';
  
  const debugger = new SelectorDebugger();
  
  try {
    await debugger.init(false); // Set to true for headless mode
    await debugger.navigateAndLogin(url, username, password);
    
    console.log('\n🎯 SELECTOR DEBUGGER READY!');
    console.log('='.repeat(60));
    console.log('Available commands:');
    console.log('1. Enter a selector to debug (e.g., .product_sort_container)');
    console.log('2. Type "screenshot" to take a screenshot');
    console.log('3. Type "similar <selector>" to find similar selectors');
    console.log('4. Type "multiple <selector1>,<selector2>,..." to test multiple');
    console.log('5. Type "common" to test common SauceDemo selectors');
    console.log('6. Type "exit" to quit');
    console.log('─'.repeat(60));
    
    // Interactive mode
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const askQuestion = () => {
      rl.question('\n💭 Enter command or selector: ', async (input) => {
        input = input.trim();
        
        if (input === 'exit') {
          rl.close();
          await debugger.close();
          return;
        }
        
        if (input === 'screenshot') {
          await debugger.takeScreenshot(`debug-${Date.now()}.png`);
        } else if (input.startsWith('similar ')) {
          const selector = input.substring(8);
          await debugger.findSimilarSelectors(selector);
        } else if (input.startsWith('multiple ')) {
          const selectors = input.substring(9).split(',').map(s => s.trim());
          await debugger.debugMultipleSelectors(selectors);
        } else if (input === 'common') {
          const commonSelectors = [
            '[data-test="product-sort-container"]',
            '.shopping_cart_link',
            '.shopping_cart_badge',
            '#react-burger-menu-btn',
            '#logout_sidebar_link',
            '[data-test="login-button"]',
            '.inventory_item',
            '.inventory_item_name',
            '.add-to-cart-sauce-labs-backpack'
          ];
          await debugger.debugMultipleSelectors(commonSelectors);
        } else if (input) {
          await debugger.debugSelector(input);
        }
        
        askQuestion(); // Continue the loop
      });
    };
    
    askQuestion();
    
  } catch (error) {
    console.error('❌ Error:', error);
    await debugger.close();
  }
}

// Export for use as module
module.exports = SelectorDebugger;

// Run if called directly
if (require.main === module) {
  main();
}