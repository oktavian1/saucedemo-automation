const { chromium } = require('playwright');

/**
 * Selector Finder - Tool untuk mencari selector unik dari multiple elements
 * Usage: node selector-finder.js [base-selector] [target-text/index]
 * Example: node selector-finder.js "button" "Add to cart"
 * Example: node selector-finder.js ".inventory_item button" 0
 */

class SelectorFinder {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init(headless = false) {
    this.browser = await chromium.launch({ headless, slowMo: 500 });
    this.page = await this.browser.newPage();
  }

  async navigateAndLogin() {
    console.log('🌐 Loading SauceDemo and logging in...');
    await this.page.goto('https://www.saucedemo.com/');
    await this.page.fill('[data-test="username"]', 'standard_user');
    await this.page.fill('[data-test="password"]', 'secret_sauce');
    await this.page.click('[data-test="login-button"]');
    await this.page.waitForLoadState('networkidle');
    console.log('✅ Login completed\n');
  }

  async findUniqueSelector(baseSelector, targetIdentifier) {
    console.log(`🔍 Finding unique selector for: ${baseSelector}`);
    console.log(`🎯 Target identifier: ${targetIdentifier}\n`);
    
    const elements = await this.page.$$(baseSelector);
    
    if (elements.length === 0) {
      console.log('❌ No elements found with base selector');
      return null;
    }
    
    console.log(`📊 Found ${elements.length} elements with base selector`);
    console.log('─'.repeat(60));
    
    // Get details for all elements
    const elementDetails = [];
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      
      try {
        const details = await this.getElementDetails(element, i);
        elementDetails.push(details);
        
        // Display element info
        console.log(`[${i}] ${details.tagName.toUpperCase()}`);
        console.log(`    Text: "${details.text}"`);
        console.log(`    Visible: ${details.isVisible} | Enabled: ${details.isEnabled}`);
        
        if (details.attributes.id) console.log(`    ID: ${details.attributes.id}`);
        if (details.attributes['data-test']) console.log(`    Data-test: ${details.attributes['data-test']}`);
        if (details.attributes.class) console.log(`    Classes: ${details.attributes.class}`);
        if (details.attributes.name) console.log(`    Name: ${details.attributes.name}`);
        if (details.attributes.value) console.log(`    Value: ${details.attributes.value}`);
        
        console.log('');
        
      } catch (error) {
        console.log(`[${i}] Error getting details: ${error.message}\n`);
        elementDetails.push(null);
      }
    }
    
    // Find target element
    let targetIndex = -1;
    let targetElement = null;
    
    // Check if targetIdentifier is numeric (index)
    if (!isNaN(targetIdentifier)) {
      targetIndex = parseInt(targetIdentifier);
      if (targetIndex >= 0 && targetIndex < elements.length) {
        targetElement = elementDetails[targetIndex];
        console.log(`🎯 Selected element by index: ${targetIndex}`);
      } else {
        console.log(`❌ Index ${targetIndex} out of range (0-${elements.length - 1})`);
        return null;
      }
    } else {
      // Search by text content
      const searchText = targetIdentifier.toLowerCase();
      for (let i = 0; i < elementDetails.length; i++) {
        if (elementDetails[i] && elementDetails[i].text.toLowerCase().includes(searchText)) {
          targetIndex = i;
          targetElement = elementDetails[i];
          console.log(`🎯 Found element by text match: "${elementDetails[i].text}" at index ${i}`);
          break;
        }
      }
      
      if (targetIndex === -1) {
        console.log(`❌ No element found containing text: "${targetIdentifier}"`);
        return null;
      }
    }
    
    console.log('\n🔨 Generating unique selectors...\n');
    
    // Generate unique selectors
    const uniqueSelectors = await this.generateUniqueSelectors(targetElement, baseSelector, targetIndex);
    
    return {
      targetIndex,
      targetElement,
      uniqueSelectors,
      totalElements: elements.length
    };
  }

  async getElementDetails(element, index) {
    const [isVisible, isEnabled, tagName, text, innerHTML, attributes, boundingBox] = await Promise.all([
      element.isVisible(),
      element.isEnabled(), 
      element.evaluate(el => el.tagName.toLowerCase()),
      element.textContent(),
      element.innerHTML(),
      element.evaluate(el => {
        const attrs = {};
        for (const attr of el.attributes) {
          attrs[attr.name] = attr.value;
        }
        return attrs;
      }),
      element.boundingBox()
    ]);
    
    return {
      index,
      element,
      tagName,
      text: text?.trim() || '',
      innerHTML: innerHTML?.substring(0, 100),
      isVisible,
      isEnabled,
      attributes,
      boundingBox
    };
  }

  async generateUniqueSelectors(targetElement, baseSelector, targetIndex) {
    const selectors = [];
    const attrs = targetElement.attributes;
    const text = targetElement.text;
    
    // Priority 1: data-test attribute
    if (attrs['data-test']) {
      selectors.push({
        selector: `[data-test="${attrs['data-test']}"]`,
        type: 'data-test',
        priority: 1,
        description: 'Most reliable - uses data-test attribute'
      });
    }
    
    // Priority 2: ID attribute
    if (attrs.id) {
      selectors.push({
        selector: `#${attrs.id}`,
        type: 'id',
        priority: 2,
        description: 'Very reliable - uses unique ID'
      });
    }
    
    // Priority 3: name attribute
    if (attrs.name) {
      selectors.push({
        selector: `[name="${attrs.name}"]`,
        type: 'name',
        priority: 3,
        description: 'Reliable - uses name attribute'
      });
    }
    
    // Priority 4: Specific class combinations
    if (attrs.class) {
      const classes = attrs.class.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        // Try most specific class combination first
        selectors.push({
          selector: `.${classes.join('.')}`,
          type: 'class-combo',
          priority: 4,
          description: `Uses all classes: ${classes.join(', ')}`
        });
        
        // Try individual classes that look unique
        classes.forEach(className => {
          if (className.length > 3 && !['btn', 'button'].includes(className.toLowerCase())) {
            selectors.push({
              selector: `.${className}`,
              type: 'class',
              priority: 5,
              description: `Uses single class: ${className}`
            });
          }
        });
      }
    }
    
    // Priority 5: Text-based selectors
    if (text && text.length > 0) {
      selectors.push({
        selector: `text="${text}"`,
        type: 'text-exact',
        priority: 6,
        description: `Exact text match: "${text}"`
      });
      
      selectors.push({
        selector: `text=/.*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*/i`,
        type: 'text-partial',
        priority: 7,
        description: `Partial text match: contains "${text}"`
      });
    }
    
    // Priority 6: nth-child selectors
    selectors.push({
      selector: `${baseSelector}:nth-child(${targetIndex + 1})`,
      type: 'nth-child',
      priority: 8,
      description: `Position-based: ${targetIndex + 1}st element`
    });
    
    // Priority 7: nth-of-type selectors  
    selectors.push({
      selector: `${targetElement.tagName}:nth-of-type(${targetIndex + 1})`,
      type: 'nth-of-type',
      priority: 9,
      description: `Type-based: ${targetIndex + 1}st ${targetElement.tagName}`
    });
    
    // Priority 8: Combined selectors for extra specificity
    if (attrs.class && text) {
      const mainClass = attrs.class.split(' ')[0];
      selectors.push({
        selector: `.${mainClass}:has-text("${text}")`,
        type: 'class-text',
        priority: 6,
        description: `Class + text combination`
      });
    }
    
    // Test each selector for uniqueness
    console.log('🧪 Testing selector uniqueness...\n');
    
    const validSelectors = [];
    for (const selectorObj of selectors) {
      try {
        const elements = await this.page.$$(selectorObj.selector);
        const isUnique = elements.length === 1;
        
        selectorObj.isUnique = isUnique;
        selectorObj.matchCount = elements.length;
        
        if (isUnique) {
          // Verify it's the correct element
          const element = elements[0];
          const elementText = await element.textContent();
          const isCorrect = elementText?.trim() === text;
          
          selectorObj.isCorrect = isCorrect;
          if (isCorrect) {
            validSelectors.push(selectorObj);
          }
        }
        
      } catch (error) {
        selectorObj.error = error.message;
        selectorObj.isUnique = false;
        selectorObj.matchCount = 0;
      }
    }
    
    return {
      allSelectors: selectors.sort((a, b) => a.priority - b.priority),
      validSelectors: validSelectors.sort((a, b) => a.priority - b.priority)
    };
  }

  async displayResults(result) {
    console.log('🎯 TARGET ELEMENT ANALYSIS');
    console.log('═'.repeat(80));
    console.log(`Selected: Element ${result.targetIndex} out of ${result.totalElements} total elements`);
    console.log(`Tag: <${result.targetElement.tagName}>`);
    console.log(`Text: "${result.targetElement.text}"`);
    console.log(`Visible: ${result.targetElement.isVisible} | Enabled: ${result.targetElement.isEnabled}`);
    
    if (Object.keys(result.targetElement.attributes).length > 0) {
      console.log('\nAttributes:');
      Object.entries(result.targetElement.attributes).forEach(([key, value]) => {
        console.log(`  ${key}: "${value}"`);
      });
    }
    
    console.log('\n🔍 SELECTOR ANALYSIS');
    console.log('═'.repeat(80));
    
    // Show valid unique selectors first
    if (result.uniqueSelectors.validSelectors.length > 0) {
      console.log('✅ VALID UNIQUE SELECTORS (Recommended):');
      console.log('─'.repeat(50));
      
      result.uniqueSelectors.validSelectors.forEach((sel, index) => {
        console.log(`${index + 1}. ${sel.selector}`);
        console.log(`   Type: ${sel.type} | Priority: ${sel.priority}`);
        console.log(`   ${sel.description}`);
        console.log(`   ✅ Unique & Correct\n`);
      });
    }
    
    // Show all selectors with their status
    console.log('📊 ALL TESTED SELECTORS:');
    console.log('─'.repeat(50));
    
    result.uniqueSelectors.allSelectors.forEach((sel, index) => {
      const status = sel.isUnique 
        ? (sel.isCorrect ? '✅ Unique & Correct' : '⚠️  Unique but incorrect element')
        : `❌ Not unique (${sel.matchCount} matches)`;
      
      console.log(`${index + 1}. ${sel.selector}`);
      console.log(`   Status: ${status}`);
      console.log(`   Type: ${sel.type} | Priority: ${sel.priority}`);
      console.log(`   ${sel.description}`);
      if (sel.error) console.log(`   Error: ${sel.error}`);
      console.log('');
    });
    
    // Recommendations
    console.log('💡 RECOMMENDATIONS');
    console.log('═'.repeat(50));
    
    if (result.uniqueSelectors.validSelectors.length > 0) {
      const best = result.uniqueSelectors.validSelectors[0];
      console.log(`🥇 Best selector: ${best.selector}`);
      console.log(`   Reason: ${best.description}`);
      
      if (result.uniqueSelectors.validSelectors.length > 1) {
        const backup = result.uniqueSelectors.validSelectors[1];
        console.log(`🥈 Backup selector: ${backup.selector}`);
        console.log(`   Reason: ${backup.description}`);
      }
    } else {
      console.log('⚠️  No unique selectors found that correctly identify the target element.');
      console.log('   Consider using a more specific base selector or combining multiple attributes.');
    }
  }

  async highlightElement(selector) {
    try {
      await this.page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) {
          element.style.border = '3px solid red';
          element.style.backgroundColor = 'yellow';
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, selector);
      console.log(`🎯 Element highlighted with selector: ${selector}`);
    } catch (error) {
      console.log(`❌ Could not highlight element: ${error.message}`);
    }
  }

  async takeScreenshot() {
    const filename = `selector-finder-${Date.now()}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const baseSelector = process.argv[2];
  const targetIdentifier = process.argv[3];
  
  if (!baseSelector || !targetIdentifier) {
    console.log('❌ Missing required arguments');
    console.log('Usage: node selector-finder.js [base-selector] [target-text/index]');
    console.log('');
    console.log('Examples:');
    console.log('  node selector-finder.js "button" "Add to cart"');
    console.log('  node selector-finder.js ".inventory_item button" 0');
    console.log('  node selector-finder.js "[data-test*=\\"add-to-cart\\"]" "sauce-labs-backpack"');
    console.log('  node selector-finder.js "input" "Login"');
    process.exit(1);
  }
  
  const finder = new SelectorFinder();
  
  try {
    await finder.init(false); // Set to true for headless
    await finder.navigateAndLogin();
    
    const result = await finder.findUniqueSelector(baseSelector, targetIdentifier);
    
    if (result) {
      await finder.displayResults(result);
      
      // Highlight the best selector if available
      if (result.uniqueSelectors.validSelectors.length > 0) {
        const bestSelector = result.uniqueSelectors.validSelectors[0].selector;
        await finder.highlightElement(bestSelector);
      }
      
      await finder.takeScreenshot();
      
      console.log('\n✨ Analysis complete! Press Enter to close browser...');
      
      // Wait for user input
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('', async () => {
        await finder.close();
        rl.close();
      });
    } else {
      await finder.close();
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    await finder.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = SelectorFinder;