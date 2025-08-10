const { chromium } = require('playwright');

/**
 * Universal Unique Selector Finder
 * Tool untuk mencari selector unik dari element apapun dengan cara visual/interactive
 * Usage: node unique-selector-finder.js
 */

class UniqueSelectorFinder {
  constructor() {
    this.browser = null;
    this.page = null;
    this.highlightedElements = [];
  }

  async init() {
    this.browser = await chromium.launch({ 
      headless: false, 
      slowMo: 300,
      args: ['--start-maximized']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🌐 Loading SauceDemo...');
    await this.page.goto('https://www.saucedemo.com/');
    await this.page.fill('[data-test="username"]', 'standard_user');
    await this.page.fill('[data-test="password"]', 'secret_sauce');
    await this.page.click('[data-test="login-button"]');
    await this.page.waitForLoadState('networkidle');
    
    // Inject hover highlighting script
    await this.injectHoverScript();
    
    console.log('✅ Ready! Move your mouse over elements to see them highlighted.\n');
  }

  async injectHoverScript() {
    await this.page.addInitScript(() => {
      let lastHighlighted = null;
      
      document.addEventListener('mouseover', (e) => {
        // Remove previous highlight
        if (lastHighlighted) {
          lastHighlighted.style.outline = '';
          lastHighlighted.style.backgroundColor = '';
        }
        
        // Add new highlight
        e.target.style.outline = '2px solid blue';
        e.target.style.backgroundColor = 'rgba(0, 100, 255, 0.1)';
        lastHighlighted = e.target;
        
        // Update info in console (we'll handle this differently)
        window.hoveredElement = {
          tagName: e.target.tagName.toLowerCase(),
          text: e.target.textContent?.trim().substring(0, 50) || '',
          id: e.target.id || '',
          className: e.target.className || '',
          dataTest: e.target.getAttribute('data-test') || ''
        };
      });
      
      // Click handler for selection
      document.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) { // Ctrl+Click or Cmd+Click to select
          e.preventDefault();
          e.stopPropagation();
          
          // Highlight selected element differently
          e.target.style.outline = '3px solid red';
          e.target.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
          
          window.selectedElement = e.target;
          console.log('Element selected!', e.target);
          return false;
        }
      }, true);
    });
  }

  async waitForElementSelection() {
    console.log('🎯 ELEMENT SELECTION MODE');
    console.log('═'.repeat(60));
    console.log('👆 Move mouse over elements to highlight them');
    console.log('⌨️  Ctrl+Click (or Cmd+Click on Mac) to SELECT an element');
    console.log('💡 Or type a base selector to see matching elements');
    console.log('❌ Type "exit" to quit\n');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const checkForSelection = async () => {
      try {
        const selectedElement = await this.page.evaluate(() => window.selectedElement);
        if (selectedElement) {
          // Clear the selection
          await this.page.evaluate(() => { window.selectedElement = null; });
          return selectedElement;
        }
      } catch (error) {
        // Element might not be available yet
      }
      return null;
    };
    
    return new Promise((resolve) => {
      const askForInput = () => {
        rl.question('💭 Enter base selector or wait for Ctrl+Click selection: ', async (input) => {
          input = input.trim();
          
          if (input.toLowerCase() === 'exit') {
            rl.close();
            resolve(null);
            return;
          }
          
          if (input) {
            // User entered a selector
            try {
              const elements = await this.page.$$(input);
              if (elements.length === 0) {
                console.log('❌ No elements found with that selector\n');
                askForInput();
                return;
              }
              
              console.log(`\n🔍 Found ${elements.length} elements with selector: ${input}`);
              
              if (elements.length === 1) {
                console.log('✅ Only one element found - analyzing it...\n');
                const elementInfo = await this.getElementInfo(elements[0]);
                rl.close();
                resolve({ element: elements[0], info: elementInfo, selector: input });
                return;
              }
              
              // Multiple elements - let user choose
              await this.highlightMultipleElements(elements);
              
              rl.question(`\n🎯 Choose element index (0-${elements.length - 1}): `, async (indexInput) => {
                const index = parseInt(indexInput);
                if (isNaN(index) || index < 0 || index >= elements.length) {
                  console.log('❌ Invalid index\n');
                  askForInput();
                  return;
                }
                
                const elementInfo = await this.getElementInfo(elements[index]);
                rl.close();
                resolve({ element: elements[index], info: elementInfo, selector: input, index });
              });
              
            } catch (error) {
              console.log(`❌ Error with selector: ${error.message}\n`);
              askForInput();
            }
          } else {
            // Check for Ctrl+Click selection
            const selected = await checkForSelection();
            if (selected) {
              console.log('\n✅ Element selected via Ctrl+Click!');
              rl.close();
              resolve({ selected: true });
            } else {
              // Continue waiting
              setTimeout(() => askForInput(), 100);
            }
          }
        });
      };
      
      askForInput();
    });
  }

  async highlightMultipleElements(elements) {
    console.log('\n📋 Multiple elements found:');
    console.log('─'.repeat(40));
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const info = await this.getElementInfo(element);
      
      // Highlight with different colors
      const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan'];
      const color = colors[i % colors.length];
      
      await element.evaluate((el, color, index) => {
        el.style.outline = `3px solid ${color}`;
        el.style.backgroundColor = `rgba(255, 0, 0, 0.1)`;
        
        // Add index label
        const label = document.createElement('div');
        label.textContent = index.toString();
        label.style.position = 'absolute';
        label.style.top = '-10px';
        label.style.left = '-10px';
        label.style.background = color;
        label.style.color = 'white';
        label.style.padding = '2px 6px';
        label.style.borderRadius = '3px';
        label.style.fontSize = '12px';
        label.style.fontWeight = 'bold';
        label.style.zIndex = '9999';
        el.style.position = 'relative';
        el.appendChild(label);
      }, color, i);
      
      console.log(`[${i}] ${info.tagName.toUpperCase()}: "${info.text}" ${info.visible ? '👁️' : '🔲'}`);
    }
  }

  async getElementInfo(element) {
    return await element.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        tagName: el.tagName.toLowerCase(),
        text: el.textContent?.trim().substring(0, 100) || '',
        visible: rect.width > 0 && rect.height > 0,
        id: el.id || '',
        className: el.className || '',
        dataTest: el.getAttribute('data-test') || '',
        attributes: Array.from(el.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}),
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        }
      };
    });
  }

  async analyzeSelectedElement() {
    let elementInfo;
    
    // Get the selected element info
    try {
      elementInfo = await this.page.evaluate(() => {
        const el = window.selectedElement;
        if (!el) return null;
        
        const rect = el.getBoundingClientRect();
        return {
          tagName: el.tagName.toLowerCase(),
          text: el.textContent?.trim() || '',
          visible: rect.width > 0 && rect.height > 0,
          id: el.id || '',
          className: el.className || '',
          dataTest: el.getAttribute('data-test') || '',
          name: el.getAttribute('name') || '',
          type: el.getAttribute('type') || '',
          value: el.value || el.getAttribute('value') || '',
          href: el.href || el.getAttribute('href') || '',
          attributes: Array.from(el.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}),
          rect
        };
      });
      
      if (!elementInfo) {
        console.log('❌ No element was selected');
        return null;
      }
      
    } catch (error) {
      console.log('❌ Error getting element info:', error.message);
      return null;
    }
    
    return await this.generateUniqueSelectors(elementInfo);
  }

  async generateUniqueSelectors(elementInfo) {
    console.log('\n🎯 SELECTED ELEMENT ANALYSIS');
    console.log('═'.repeat(80));
    console.log(`Tag: <${elementInfo.tagName}>`);
    console.log(`Text: "${elementInfo.text}"`);
    console.log(`Visible: ${elementInfo.visible}`);
    console.log(`Position: x=${Math.round(elementInfo.rect.x)}, y=${Math.round(elementInfo.rect.y)}`);
    
    if (Object.keys(elementInfo.attributes).length > 0) {
      console.log('\nAttributes:');
      Object.entries(elementInfo.attributes).forEach(([key, value]) => {
        if (value && value.length < 100) { // Skip very long attributes
          console.log(`  ${key}: "${value}"`);
        }
      });
    }
    
    console.log('\n🔨 GENERATING UNIQUE SELECTORS...\n');
    
    const selectors = [];
    const attrs = elementInfo.attributes;
    const text = elementInfo.text;
    
    // Priority selectors
    const selectorGenerators = [
      // 1. data-test (highest priority)
      () => attrs['data-test'] && {
        selector: `[data-test="${attrs['data-test']}"]`,
        type: '🎯 data-test',
        priority: 1,
        description: `Test attribute: ${attrs['data-test']}`
      },
      
      // 2. ID
      () => attrs.id && {
        selector: `#${attrs.id}`,
        type: '🆔 ID',
        priority: 2,
        description: `Element ID: ${attrs.id}`
      },
      
      // 3. name attribute
      () => attrs.name && {
        selector: `[name="${attrs.name}"]`,
        type: '📛 Name',
        priority: 3,
        description: `Name attribute: ${attrs.name}`
      },
      
      // 4. class combinations
      () => attrs.class && {
        selector: `.${attrs.class.split(' ').filter(c => c).join('.')}`,
        type: '🎨 All Classes',
        priority: 4,
        description: `All CSS classes: ${attrs.class.split(' ').filter(c => c).join(', ')}`
      },
      
      // 5. Text-based
      () => text && text.length > 0 && text.length < 50 && {
        selector: `text="${text}"`,
        type: '📝 Exact Text',
        priority: 5,
        description: `Exact text match: "${text}"`
      },
      
      // 6. Tag + text
      () => text && text.length > 0 && text.length < 50 && {
        selector: `${elementInfo.tagName}:has-text("${text}")`,
        type: '📝 Tag + Text',
        priority: 6,
        description: `${elementInfo.tagName} containing "${text}"`
      },
      
      // 7. Specific attributes
      () => attrs.type && {
        selector: `${elementInfo.tagName}[type="${attrs.type}"]`,
        type: '⚙️ Tag + Type',
        priority: 7,
        description: `${elementInfo.tagName} with type: ${attrs.type}`
      },
      
      // 8. href for links
      () => attrs.href && {
        selector: `[href="${attrs.href}"]`,
        type: '🔗 Link href',
        priority: 8,
        description: `Link with href: ${attrs.href}`
      },
      
      // 9. Individual classes (for unique classes)
      () => attrs.class && attrs.class.split(' ').filter(c => c.length > 3).map(className => ({
        selector: `.${className}`,
        type: '🎨 Single Class',
        priority: 9,
        description: `Single class: ${className}`
      }))
    ];
    
    // Generate all possible selectors
    selectorGenerators.forEach(generator => {
      try {
        const result = generator();
        if (result) {
          if (Array.isArray(result)) {
            selectors.push(...result);
          } else {
            selectors.push(result);
          }
        }
      } catch (error) {
        // Skip invalid generators
      }
    });
    
    // Test each selector for uniqueness
    const testedSelectors = [];
    
    for (const selectorObj of selectors) {
      try {
        const elements = await this.page.$$(selectorObj.selector);
        selectorObj.matchCount = elements.length;
        selectorObj.isUnique = elements.length === 1;
        
        if (elements.length === 1) {
          // Verify it's the correct element by comparing text
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
    
    // Sort by priority and success
    testedSelectors.sort((a, b) => {
      if (a.isUnique && a.isCorrect && !(b.isUnique && b.isCorrect)) return -1;
      if (b.isUnique && b.isCorrect && !(a.isUnique && a.isCorrect)) return 1;
      return a.priority - b.priority;
    });
    
    // Display results
    const validSelectors = testedSelectors.filter(s => s.isUnique && s.isCorrect);
    
    if (validSelectors.length > 0) {
      console.log('✅ VALID UNIQUE SELECTORS (Recommended):');
      console.log('─'.repeat(60));
      
      validSelectors.slice(0, 3).forEach((sel, index) => {
        console.log(`${index + 1}. ${sel.selector}`);
        console.log(`   ${sel.type} | Priority: ${sel.priority}`);
        console.log(`   ${sel.description}`);
        console.log('');
      });
      
      // Highlight with the best selector
      const bestSelector = validSelectors[0];
      try {
        await this.page.evaluate((selector) => {
          const el = document.querySelector(selector);
          if (el) {
            el.style.outline = '4px solid green';
            el.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, bestSelector.selector);
        
        console.log(`🎯 Element highlighted with best selector: ${bestSelector.selector}`);
      } catch (error) {
        console.log('❌ Could not highlight element');
      }
    }
    
    // Show all tested selectors
    console.log('\n📊 ALL TESTED SELECTORS:');
    console.log('─'.repeat(60));
    
    testedSelectors.forEach((sel, index) => {
      const status = sel.isUnique 
        ? (sel.isCorrect ? '✅ Unique & Correct' : '⚠️  Unique but different element')
        : `❌ Not unique (${sel.matchCount} matches)`;
      
      console.log(`${index + 1}. ${sel.selector}`);
      console.log(`   Status: ${status}`);
      console.log(`   ${sel.type} | Priority: ${sel.priority}`);
      console.log(`   ${sel.description}`);
      if (sel.error) console.log(`   Error: ${sel.error}`);
      console.log('');
    });
    
    return { elementInfo, validSelectors, allSelectors: testedSelectors };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const finder = new UniqueSelectorFinder();
  
  try {
    await finder.init();
    
    while (true) {
      const result = await finder.waitForElementSelection();
      
      if (!result) break; // User chose to exit
      
      let analysisResult;
      
      if (result.selected) {
        // Element was selected via Ctrl+Click
        analysisResult = await finder.analyzeSelectedElement();
      } else if (result.element) {
        // Element was found via selector
        analysisResult = await finder.generateUniqueSelectors(result.info);
      }
      
      if (analysisResult && analysisResult.validSelectors.length > 0) {
        const bestSelector = analysisResult.validSelectors[0];
        
        console.log('\n🏆 FINAL RECOMMENDATION');
        console.log('═'.repeat(40));
        console.log(`Best selector: ${bestSelector.selector}`);
        console.log(`Type: ${bestSelector.type}`);
        console.log(`Description: ${bestSelector.description}`);
        console.log('\n📋 Copy this to your Page Object Model!');
      }
      
      // Take screenshot
      const filename = `unique-selector-${Date.now()}.png`;
      await finder.page.screenshot({ path: filename, fullPage: true });
      console.log(`\n📸 Screenshot saved: ${filename}`);
      
      console.log('\n' + '='.repeat(80));
      console.log('🔄 Ready for next element selection...\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await finder.close();
    console.log('\n👋 Goodbye!');
  }
}

if (require.main === module) {
  main();
}

module.exports = UniqueSelectorFinder;