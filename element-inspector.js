const { chromium } = require('playwright');

/**
 * Element Inspector - Advanced debugging tool for specific element types
 * Usage: node element-inspector.js [type]
 * Types: buttons, inputs, links, dropdowns, cart, menu, products, all
 */

const ELEMENT_GROUPS = {
  buttons: {
    name: '🔘 Buttons',
    selectors: [
      '[data-test="login-button"]',
      '[data-test*="add-to-cart"]',
      '[data-test*="remove"]',
      '.btn_primary',
      '.btn_secondary',
      '.btn_action',
      'button',
      'input[type="submit"]',
      'input[type="button"]'
    ]
  },
  
  inputs: {
    name: '📝 Input Fields',
    selectors: [
      '[data-test="username"]',
      '[data-test="password"]',
      '[data-test="firstName"]',
      '[data-test="lastName"]',
      '[data-test="postalCode"]',
      '#user-name',
      '#password',
      'input[type="text"]',
      'input[type="password"]'
    ]
  },
  
  links: {
    name: '🔗 Links & Navigation',
    selectors: [
      '.shopping_cart_link',
      '[data-test="shopping-cart-link"]',
      '.inventory_item_name a',
      '.app_logo',
      '#logout_sidebar_link',
      '[data-test="logout-sidebar-link"]',
      'a[href]'
    ]
  },
  
  dropdowns: {
    name: '📋 Dropdowns & Selects',
    selectors: [
      '[data-test="product-sort-container"]',
      '.product_sort_container',
      'select',
      '[role="combobox"]'
    ]
  },
  
  cart: {
    name: '🛒 Cart Elements',
    selectors: [
      '.shopping_cart_link',
      '.shopping_cart_badge',
      '[data-test="shopping-cart-badge"]',
      '.cart_item',
      '.cart_quantity',
      '[data-test="continue-shopping"]',
      '[data-test="checkout"]'
    ]
  },
  
  menu: {
    name: '🍔 Menu Elements',
    selectors: [
      '#react-burger-menu-btn',
      '.bm-burger-button',
      '.bm-menu',
      '.bm-item-list',
      '.bm-item',
      '#logout_sidebar_link',
      '[data-test="logout-sidebar-link"]',
      '.bm-overlay'
    ]
  },
  
  products: {
    name: '📦 Product Elements',
    selectors: [
      '.inventory_list',
      '.inventory_item',
      '.inventory_item_name',
      '.inventory_item_desc',
      '.inventory_item_price',
      '.inventory_item_img',
      '.pricebar',
      '[data-test*="sauce-labs"]'
    ]
  }
};

class ElementInspector {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await chromium.launch({ headless: false, slowMo: 500 });
    this.page = await this.browser.newPage();
    
    await this.page.goto('https://www.saucedemo.com/');
    await this.page.fill('[data-test="username"]', 'standard_user');
    await this.page.fill('[data-test="password"]', 'secret_sauce');
    await this.page.click('[data-test="login-button"]');
    await this.page.waitForLoadState('networkidle');
  }

  async inspectElement(selector, index = 0) {
    const elements = await this.page.$$(selector);
    
    if (elements.length === 0) {
      return {
        found: false,
        selector,
        reason: 'No elements found'
      };
    }
    
    if (index >= elements.length) {
      return {
        found: false,
        selector,
        reason: `Index ${index} out of range (found ${elements.length} elements)`
      };
    }
    
    const element = elements[index];
    
    try {
      const [isVisible, isEnabled, tagName, textContent, innerHTML, boundingBox, attributes] = await Promise.all([
        element.isVisible(),
        element.isEnabled(),
        element.evaluate(el => el.tagName.toLowerCase()),
        element.textContent(),
        element.innerHTML(),
        element.boundingBox(),
        element.evaluate(el => {
          const attrs = {};
          for (const attr of el.attributes) {
            attrs[attr.name] = attr.value;
          }
          return attrs;
        })
      ]);
      
      return {
        found: true,
        selector,
        index,
        totalFound: elements.length,
        tagName,
        isVisible,
        isEnabled,
        textContent: textContent?.trim(),
        innerHTML: innerHTML?.substring(0, 200) + (innerHTML?.length > 200 ? '...' : ''),
        boundingBox,
        attributes,
        specialProperties: await this.getSpecialProperties(element, tagName, attributes)
      };
      
    } catch (error) {
      return {
        found: false,
        selector,
        reason: `Error inspecting element: ${error.message}`
      };
    }
  }

  async getSpecialProperties(element, tagName, attributes) {
    const props = {};
    
    // Input specific properties
    if (tagName === 'input') {
      props.type = attributes.type;
      props.value = attributes.value;
      props.placeholder = attributes.placeholder;
      props.disabled = await element.isDisabled();
      props.readonly = attributes.readonly === 'readonly';
    }
    
    // Select specific properties
    if (tagName === 'select') {
      const options = await element.$$eval('option', opts => 
        opts.map(opt => ({ value: opt.value, text: opt.textContent, selected: opt.selected }))
      );
      props.options = options;
      props.selectedValue = await element.inputValue();
    }
    
    // Link specific properties
    if (tagName === 'a') {
      props.href = attributes.href;
      props.target = attributes.target;
    }
    
    // Button specific properties
    if (tagName === 'button' || (tagName === 'input' && ['button', 'submit'].includes(attributes.type))) {
      props.disabled = await element.isDisabled();
      if (attributes.type) props.buttonType = attributes.type;
    }
    
    return props;
  }

  async inspectGroup(groupName) {
    const group = ELEMENT_GROUPS[groupName];
    if (!group) {
      console.log(`❌ Unknown group: ${groupName}`);
      return;
    }
    
    console.log(`\n${group.name}`);
    console.log('='.repeat(80));
    
    for (const selector of group.selectors) {
      console.log(`\n🔍 ${selector}`);
      console.log('─'.repeat(60));
      
      const result = await this.inspectElement(selector);
      
      if (!result.found) {
        console.log(`❌ ${result.reason}`);
        continue;
      }
      
      // Basic info
      console.log(`✅ Found ${result.totalFound} element(s) - <${result.tagName}>`);
      console.log(`   Visible: ${result.isVisible} | Enabled: ${result.isEnabled}`);
      
      // Text content
      if (result.textContent) {
        console.log(`   Text: "${result.textContent}"`);
      }
      
      // Key attributes
      const keyAttrs = ['id', 'class', 'data-test', 'name', 'type'];
      const displayAttrs = keyAttrs
        .filter(attr => result.attributes[attr])
        .map(attr => `${attr}="${result.attributes[attr]}"`)
        .join(' ');
      
      if (displayAttrs) {
        console.log(`   Attributes: ${displayAttrs}`);
      }
      
      // Special properties
      if (Object.keys(result.specialProperties).length > 0) {
        console.log(`   Special: ${JSON.stringify(result.specialProperties, null, 2).replace(/\n/g, '').replace(/ {2,}/g, ' ')}`);
      }
      
      // Position info
      if (result.boundingBox) {
        console.log(`   Position: x=${result.boundingBox.x}, y=${result.boundingBox.y}, w=${result.boundingBox.width}, h=${result.boundingBox.height}`);
      }
      
      // Multiple elements warning
      if (result.totalFound > 1) {
        console.log(`   ⚠️  Multiple elements found (${result.totalFound}). Showing first one.`);
      }
    }
  }

  async takeScreenshot(filename) {
    await this.page.screenshot({ 
      path: filename, 
      fullPage: true,
      animations: 'disabled'
    });
    console.log(`📸 Screenshot saved: ${filename}`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const type = process.argv[2] || 'all';
  const inspector = new ElementInspector();
  
  try {
    console.log('🚀 Starting Element Inspector...');
    await inspector.init();
    
    if (type === 'all') {
      for (const [groupName, group] of Object.entries(ELEMENT_GROUPS)) {
        await inspector.inspectGroup(groupName);
        console.log('\n' + '='.repeat(80));
      }
    } else if (ELEMENT_GROUPS[type]) {
      await inspector.inspectGroup(type);
    } else {
      console.log(`❌ Unknown type: ${type}`);
      console.log('Available types:', Object.keys(ELEMENT_GROUPS).join(', '), 'all');
      return;
    }
    
    await inspector.takeScreenshot(`inspector-${type}-${Date.now()}.png`);
    
    console.log('\n✨ Inspection complete! Press Enter to close...');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('', async () => {
      await inspector.close();
      rl.close();
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    await inspector.close();
  }
}

if (require.main === module) {
  main();
}