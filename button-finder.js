const { chromium } = require('playwright');

/**
 * Button Finder - Tool khusus untuk mencari selector unik untuk button elements
 * Usage: node button-finder.js
 */

class ButtonFinder {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await chromium.launch({ headless: false, slowMo: 500 });
    this.page = await this.browser.newPage();
    
    console.log('🌐 Loading SauceDemo and logging in...');
    await this.page.goto('https://www.saucedemo.com/');
    await this.page.fill('[data-test="username"]', 'standard_user');
    await this.page.fill('[data-test="password"]', 'secret_sauce');
    await this.page.click('[data-test="login-button"]');
    await this.page.waitForLoadState('networkidle');
    console.log('✅ Ready!\n');
  }

  async findAllButtons() {
    console.log('🔍 Scanning for all button elements...\n');
    
    // Common button selectors
    const buttonSelectors = [
      'button',
      'input[type="submit"]',
      'input[type="button"]',
      '[role="button"]',
      '.btn',
      '[class*="button"]',
      '[id*="button"]',
      '[data-test*="add-to-cart"]',
      '[data-test*="remove"]',
      '[data-test*="checkout"]',
      '[data-test*="login"]'
    ];
    
    const allButtons = new Map();
    
    for (const selector of buttonSelectors) {
      try {
        const elements = await this.page.$$(selector);
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const details = await this.getButtonDetails(element, selector, i);
          
          // Use a unique key to avoid duplicates
          const key = `${details.tagName}-${details.text}-${details.attributes.id || ''}-${details.attributes['data-test'] || ''}`;
          
          if (!allButtons.has(key)) {
            allButtons.set(key, details);
          }
        }
      } catch (error) {
        // Skip invalid selectors
      }
    }
    
    return Array.from(allButtons.values());
  }

  async getButtonDetails(element, baseSelector, index) {
    const [isVisible, isEnabled, tagName, text, attributes, boundingBox] = await Promise.all([
      element.isVisible(),
      element.isEnabled(),
      element.evaluate(el => el.tagName.toLowerCase()),
      element.textContent(),
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
      element,
      baseSelector,
      index,
      tagName,
      text: text?.trim() || '',
      isVisible,
      isEnabled,
      attributes,
      boundingBox
    };
  }

  async generateUniqueSelectors(button) {
    const selectors = [];
    const attrs = button.attributes;
    const text = button.text;
    
    // 1. data-test (highest priority)
    if (attrs['data-test']) {
      selectors.push({
        selector: `[data-test="${attrs['data-test']}"]`,
        type: '🎯 data-test',
        reliability: 'Very High',
        description: `Test attribute: ${attrs['data-test']}`
      });
    }
    
    // 2. ID
    if (attrs.id) {
      selectors.push({
        selector: `#${attrs.id}`,
        type: '🆔 ID',
        reliability: 'High',
        description: `Element ID: ${attrs.id}`
      });
    }
    
    // 3. name attribute
    if (attrs.name) {
      selectors.push({
        selector: `[name="${attrs.name}"]`,
        type: '📛 Name',
        reliability: 'High',
        description: `Name attribute: ${attrs.name}`
      });
    }
    
    // 4. Text-based selectors
    if (text && text.length > 0) {
      selectors.push({
        selector: `text="${text}"`,
        type: '📝 Text (exact)',
        reliability: 'Medium-High',
        description: `Exact text: "${text}"`
      });
      
      selectors.push({
        selector: `${button.tagName}:has-text("${text}")`,
        type: '📝 Tag + Text',
        reliability: 'Medium-High',
        description: `${button.tagName} containing "${text}"`
      });
    }
    
    // 5. Class-based
    if (attrs.class) {
      const classes = attrs.class.split(' ').filter(c => c.length > 0);
      
      // Full class combination
      selectors.push({
        selector: `.${classes.join('.')}`,
        type: '🎨 Classes (all)',
        reliability: 'Medium',
        description: `All classes: ${classes.join(', ')}`
      });
      
      // Individual specific classes
      classes.forEach(className => {
        if (className.length > 3 && !['btn', 'button'].includes(className.toLowerCase())) {
          selectors.push({
            selector: `.${className}`,
            type: '🎨 Class (single)',
            reliability: 'Medium',
            description: `Single class: ${className}`
          });
        }
      });
    }
    
    // 6. Attribute combinations
    if (attrs.type && button.tagName === 'input') {
      selectors.push({
        selector: `input[type="${attrs.type}"]`,
        type: '⚙️ Input type',
        reliability: 'Low',
        description: `Input with type: ${attrs.type}`
      });
    }
    
    // Test uniqueness
    const testedSelectors = [];
    for (const selectorObj of selectors) {
      try {
        const elements = await this.page.$$(selectorObj.selector);
        selectorObj.matchCount = elements.length;
        selectorObj.isUnique = elements.length === 1;
        
        if (elements.length === 1) {
          // Verify it's the correct element
          const foundText = await elements[0].textContent();
          selectorObj.isCorrect = foundText?.trim() === text;
        } else {
          selectorObj.isCorrect = false;
        }
        
        testedSelectors.push(selectorObj);
      } catch (error) {
        selectorObj.error = error.message;
        selectorObj.matchCount = 0;
        selectorObj.isUnique = false;
        selectorObj.isCorrect = false;
        testedSelectors.push(selectorObj);
      }
    }
    
    return testedSelectors;
  }

  displayButtons(buttons) {
    console.log('📋 FOUND BUTTONS');
    console.log('═'.repeat(80));
    
    buttons.forEach((button, index) => {
      const status = button.isVisible ? '👁️ Visible' : '🔲 Hidden';
      const enabled = button.isEnabled ? '✅ Enabled' : '❌ Disabled';
      
      console.log(`[${index}] ${button.tagName.toUpperCase()}`);
      console.log(`    Text: "${button.text}" | ${status} | ${enabled}`);
      
      if (button.attributes.id) console.log(`    ID: ${button.attributes.id}`);
      if (button.attributes['data-test']) console.log(`    Data-test: ${button.attributes['data-test']}`);
      if (button.attributes.class) console.log(`    Classes: ${button.attributes.class}`);
      if (button.attributes.name) console.log(`    Name: ${button.attributes.name}`);
      
      console.log('');
    });
  }

  async analyzeButton(button) {
    console.log('🎯 ANALYZING SELECTED BUTTON');
    console.log('═'.repeat(80));
    console.log(`Tag: <${button.tagName}>`);
    console.log(`Text: "${button.text}"`);
    console.log(`Visible: ${button.isVisible} | Enabled: ${button.isEnabled}`);
    
    if (Object.keys(button.attributes).length > 0) {
      console.log('\nAttributes:');
      Object.entries(button.attributes).forEach(([key, value]) => {
        console.log(`  ${key}: "${value}"`);
      });
    }
    
    console.log('\n🔍 GENERATING UNIQUE SELECTORS...\n');
    
    const selectors = await this.generateUniqueSelectors(button);
    
    // Show best recommendations first
    const validSelectors = selectors.filter(s => s.isUnique && s.isCorrect);
    
    if (validSelectors.length > 0) {
      console.log('✅ RECOMMENDED SELECTORS (Unique & Correct):');
      console.log('─'.repeat(60));
      
      validSelectors.forEach((sel, index) => {
        console.log(`${index + 1}. ${sel.selector}`);
        console.log(`   ${sel.type} | Reliability: ${sel.reliability}`);
        console.log(`   ${sel.description}`);
        console.log('');
      });
    }
    
    // Show all selectors with status
    console.log('📊 ALL GENERATED SELECTORS:');
    console.log('─'.repeat(60));
    
    selectors.forEach((sel, index) => {
      const status = sel.isUnique 
        ? (sel.isCorrect ? '✅ Unique & Correct' : '⚠️  Unique but wrong element')
        : `❌ Not unique (${sel.matchCount} matches)`;
      
      console.log(`${index + 1}. ${sel.selector}`);
      console.log(`   Status: ${status}`);
      console.log(`   ${sel.type} | Reliability: ${sel.reliability}`);
      console.log(`   ${sel.description}`);
      if (sel.error) console.log(`   Error: ${sel.error}`);
      console.log('');
    });
    
    // Return best selector
    return validSelectors.length > 0 ? validSelectors[0] : null;
  }

  async highlightElement(selector) {
    try {
      await this.page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) {
          element.style.border = '3px solid red';
          element.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, selector);
      console.log(`🎯 Element highlighted!`);
    } catch (error) {
      console.log(`❌ Could not highlight: ${error.message}`);
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const finder = new ButtonFinder();
  
  try {
    await finder.init();
    
    // Find all buttons
    const buttons = await finder.findAllButtons();
    
    if (buttons.length === 0) {
      console.log('❌ No buttons found on the page');
      await finder.close();
      return;
    }
    
    // Interactive mode
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const askForSelection = async () => {
      finder.displayButtons(buttons);
      
      rl.question(`\n💭 Select button index (0-${buttons.length - 1}) or 'exit': `, async (input) => {
        if (input.toLowerCase() === 'exit') {
          await finder.close();
          rl.close();
          return;
        }
        
        const index = parseInt(input);
        if (isNaN(index) || index < 0 || index >= buttons.length) {
          console.log('❌ Invalid index. Please try again.\n');
          askForSelection();
          return;
        }
        
        const selectedButton = buttons[index];
        console.log(`\n🎯 Selected: "${selectedButton.text}"\n`);
        
        const bestSelector = await finder.analyzeButton(selectedButton);
        
        if (bestSelector) {
          console.log(`💡 BEST SELECTOR: ${bestSelector.selector}`);
          console.log(`   Copy this to your Page Object Model!\n`);
          
          await finder.highlightElement(bestSelector.selector);
        }
        
        rl.question('\n📸 Take screenshot? (y/n): ', async (answer) => {
          if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            const filename = `button-finder-${Date.now()}.png`;
            await finder.page.screenshot({ path: filename, fullPage: true });
            console.log(`📸 Screenshot saved: ${filename}`);
          }
          
          rl.question('\n🔄 Analyze another button? (y/n): ', async (continueAnswer) => {
            if (continueAnswer.toLowerCase() === 'y' || continueAnswer.toLowerCase() === 'yes') {
              askForSelection();
            } else {
              await finder.close();
              rl.close();
              console.log('👋 Goodbye!');
            }
          });
        });
      });
    };
    
    await askForSelection();
    
  } catch (error) {
    console.error('❌ Error:', error);
    await finder.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = ButtonFinder;