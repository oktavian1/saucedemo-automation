const { chromium } = require('playwright');

// Quick demo untuk menunjukkan bagaimana menemukan About element
async function demoAboutFinder() {
  console.log('🎯 DEMO: Finding About Element Selector');
  console.log('═'.repeat(50));
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate and login
    console.log('🌐 Loading SauceDemo...');
    await page.goto('https://www.saucedemo.com/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    await page.waitForLoadState('networkidle');
    
    // Open hamburger menu first (About is hidden in menu)
    console.log('🍔 Opening hamburger menu...');
    await page.click('#react-burger-menu-btn');
    await page.waitForSelector('.bm-menu', { state: 'visible', timeout: 5000 });
    await page.waitForTimeout(1000); // Wait for animation
    
    // Now find About element
    console.log('🔍 Analyzing About element...');
    
    const aboutElement = await page.$('#about_sidebar_link');
    if (aboutElement) {
      // Highlight the element
      await page.evaluate(() => {
        const el = document.querySelector('#about_sidebar_link');
        if (el) {
          el.style.outline = '3px solid red';
          el.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      
      // Get element details
      const details = await aboutElement.evaluate(el => ({
        tagName: el.tagName.toLowerCase(),
        text: el.textContent?.trim(),
        id: el.id,
        className: el.className,
        dataTest: el.getAttribute('data-test'),
        href: el.href,
        visible: el.offsetParent !== null,
        enabled: !el.disabled
      }));
      
      console.log('✅ About Element Found!');
      console.log(`   Tag: <${details.tagName}>`);
      console.log(`   Text: "${details.text}"`);
      console.log(`   ID: ${details.id}`);
      console.log(`   Data-test: ${details.dataTest}`);
      console.log(`   Classes: ${details.className}`);
      console.log(`   Href: ${details.href}`);
      console.log(`   Visible: ${details.visible}`);
      console.log(`   Enabled: ${details.enabled}`);
      
      console.log('\n🎯 RECOMMENDED SELECTORS (in priority order):');
      console.log('1. [data-test="about-sidebar-link"] ← Best (most stable)');
      console.log('2. #about_sidebar_link ← Good (unique ID)');
      console.log('3. text="About" ← OK (text-based)');
      console.log('4. .bm-item:has-text("About") ← OK (class + text)');
      
      // Test clicking
      console.log('\n🖱️ Testing click functionality...');
      await aboutElement.click();
      
      // Wait a bit to see if navigation happens
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      console.log(`   Current URL after click: ${currentUrl}`);
      
      if (currentUrl.includes('saucelabs.com')) {
        console.log('✅ Click successful - navigated to SauceLabs website!');
      } else {
        console.log('ℹ️  Click registered but no navigation occurred');
      }
      
    } else {
      console.log('❌ About element not found!');
    }
    
    // Take screenshot
    const filename = `about-element-demo-${Date.now()}.png`;
    await page.screenshot({ path: filename, fullPage: true });
    console.log(`\n📸 Screenshot saved: ${filename}`);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('\n💡 SUMMARY FOR ABOUT ELEMENT:');
  console.log('═'.repeat(50));
  console.log('🥇 Best selector: [data-test="about-sidebar-link"]');
  console.log('🥈 Backup: #about_sidebar_link');
  console.log('⚠️  Note: Element is initially hidden in hamburger menu');
  console.log('📝 Usage in Page Object:');
  console.log('   this.aboutLink = \'[data-test="about-sidebar-link"]\';');
  console.log('   await this.openMenu(); // Open hamburger menu first');
  console.log('   await this.clickElement(this.aboutLink);');
  
  await browser.close();
}

demoAboutFinder().catch(console.error);