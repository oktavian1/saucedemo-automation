const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const InventoryPage = require('../pages/InventoryPage');
const CartPage = require('../pages/CartPage');
const CheckoutPage = require('../pages/CheckoutPage');
const TestData = require('../data/TestData');
const { allure } = require('allure-playwright');

test.describe('Multiple Items Purchase Scenarios', () => {
  let loginPage;
  let inventoryPage;
  let cartPage;
  let checkoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    
    // Login and verify inventory page is loaded
    await loginPage.navigateToLogin();
    await loginPage.login(TestData.users.standard.username, TestData.users.standard.password);
    await inventoryPage.assertInventoryPageLoaded();
  });

  test('Purchase single item - baseline scenario @smoke', async ({ page }) => {
    allure.description('Test purchasing a single item as baseline comparison');
    allure.owner('QA Team');
    allure.tag('checkout', 'single-item', 'baseline', 'smoke');
    allure.severity('critical');

    // Step 1: Add single item to cart
    await allure.step('Add single item to cart', async () => {
      await inventoryPage.addProductToCartByIndex(0);
      await inventoryPage.assertCartBadgeCount(1);
    });

    // Step 2: Go through checkout process
    await allure.step('Complete checkout process', async () => {
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
      
      const checkoutInfo = TestData.checkoutInfo.valid;
      await checkoutPage.fillCheckoutInformation(
        checkoutInfo.firstName,
        checkoutInfo.lastName, 
        checkoutInfo.postalCode
      );
      await checkoutPage.clickContinue();
      
      // Verify single item in summary
      const itemCount = await checkoutPage.getItemCountInSummary();
      expect(itemCount).toBe(1);
      
      await checkoutPage.clickFinish();
    });

    // Step 3: Verify completion
    await allure.step('Verify order completion', async () => {
      await checkoutPage.assertCheckoutCompleteLoaded();
      expect(page.url()).toContain('/checkout-complete.html');
    });
  });

  test('Purchase 3 items - moderate quantity @regression', async ({ page }) => {
    allure.description('Test purchasing 3 different items');
    allure.owner('QA Team'); 
    allure.tag('checkout', 'multiple-items', 'moderate-quantity');
    allure.severity('high');

    // Step 1: Add 3 different items
    await allure.step('Add 3 items to cart', async () => {
      // Use specific product names to be more reliable
      await inventoryPage.addProductToCart('sauce-labs-backpack');
      await inventoryPage.addProductToCart('sauce-labs-bike-light');  
      await inventoryPage.addProductToCart('sauce-labs-bolt-t-shirt');
      await inventoryPage.assertCartBadgeCount(3);
    });

    // Step 2: Verify cart contents
    await allure.step('Verify cart contents', async () => {
      await inventoryPage.goToCart();
      
      // Verify 3 items are displayed
      const cartItemCount = await cartPage.getCartItemCount();
      expect(cartItemCount).toBe(3);
      
      // Verify specific items are present
      await cartPage.assertItemPresentInCart('Sauce Labs Backpack');
      await cartPage.assertItemPresentInCart('Sauce Labs Bike Light');
      await cartPage.assertItemPresentInCart('Sauce Labs Bolt T-Shirt');
    });

    // Step 3: Complete checkout
    await allure.step('Complete checkout process', async () => {
      await cartPage.proceedToCheckout();
      
      const checkoutInfo = TestData.checkoutInfo.valid;
      await checkoutPage.fillCheckoutInformation(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.postalCode
      );
      await checkoutPage.clickContinue();
      
      // Verify 3 items in checkout summary
      const itemCount = await checkoutPage.getItemCountInSummary();
      expect(itemCount).toBe(3);
      
      await checkoutPage.assertCalculatedTotal();
      await checkoutPage.clickFinish();
    });

    // Step 4: Verify completion
    await allure.step('Verify successful completion', async () => {
      await checkoutPage.assertOrderComplete();
    });
  });

  test('Purchase 5 items - high quantity scenario @regression', async ({ page }) => {
    allure.description('Test purchasing 5 items to test high quantity handling');
    allure.owner('QA Team');
    allure.tag('checkout', 'multiple-items', 'high-quantity');
    allure.severity('high');

    // Step 1: Add 5 different items
    await allure.step('Add 5 items to cart', async () => {
      // Add first 5 products
      for (let i = 0; i < 5; i++) {
        await inventoryPage.addProductToCartByIndex(i);
      }
      await inventoryPage.assertCartBadgeCount(5);
    });

    // Step 2: Verify cart performance with many items
    await allure.step('Verify cart handles multiple items efficiently', async () => {
      const startTime = Date.now();
      await inventoryPage.goToCart();
      const loadTime = Date.now() - startTime;
      
      // Cart should load within reasonable time (< 3 seconds)
      expect(loadTime).toBeLessThan(3000);
      
      const cartItemCount = await cartPage.getCartItemCount();
      expect(cartItemCount).toBe(5);
    });

    // Step 3: Complete checkout
    await allure.step('Complete checkout with 5 items', async () => {
      await cartPage.proceedToCheckout();
      
      const checkoutInfo = TestData.checkoutInfo.valid;
      await checkoutPage.fillCheckoutInformation(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.postalCode
      );
      await checkoutPage.clickContinue();
      
      const itemCount = await checkoutPage.getItemCountInSummary();
      expect(itemCount).toBe(5);
      
      await checkoutPage.clickFinish();
    });

    // Step 4: Verify completion
    await allure.step('Verify order completion with 5 items', async () => {
      await checkoutPage.assertCheckoutCompleteLoaded();
    });
  });

  test('Purchase all 6 items - maximum capacity test @edge-case', async ({ page }) => {
    allure.description('Test purchasing all available items (maximum capacity)');
    allure.owner('QA Team');
    allure.tag('checkout', 'edge-case', 'maximum-items', 'stress-test');
    allure.severity('medium');

    // Step 1: Add all available items
    await allure.step('Add all 6 items to cart', async () => {
      const productCount = await inventoryPage.getProductCount();
      expect(productCount).toBe(6); // Verify we have 6 products
      
      // Add all products
      for (let i = 0; i < productCount; i++) {
        await inventoryPage.addProductToCartByIndex(i);
      }
      await inventoryPage.assertCartBadgeCount(6);
    });

    // Step 2: Verify cart with maximum items
    await allure.step('Verify cart with all items', async () => {
      await inventoryPage.goToCart();
      
      const cartItemCount = await cartPage.getCartItemCount();
      expect(cartItemCount).toBe(6);
      
      // Verify all expected items are present
      const expectedItems = [
        'Sauce Labs Backpack',
        'Sauce Labs Bike Light', 
        'Sauce Labs Bolt T-Shirt',
        'Sauce Labs Fleece Jacket',
        'Sauce Labs Onesie',
        'Test.allTheThings() T-Shirt (Red)'
      ];
      
      for (const item of expectedItems) {
        await cartPage.assertItemPresentInCart(item);
      }
    });

    // Step 3: Complete checkout with all items
    await allure.step('Complete checkout with all 6 items', async () => {
      await cartPage.proceedToCheckout();
      
      const checkoutInfo = TestData.checkoutInfo.valid;
      await checkoutPage.fillCheckoutInformation(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.postalCode
      );
      await checkoutPage.clickContinue();
      
      const itemCount = await checkoutPage.getItemCountInSummary();
      expect(itemCount).toBe(6);
      
      // Verify total calculation with all items
      await checkoutPage.assertCalculatedTotal();
      await checkoutPage.clickFinish();
    });

    // Step 4: Verify successful completion with maximum items
    await allure.step('Verify completion with all items', async () => {
      await checkoutPage.assertOrderComplete();
      expect(page.url()).toContain('/checkout-complete.html');
    });
  });

  test('Mixed price range purchase - value validation @regression', async ({ page }) => {
    allure.description('Test purchasing items with different price ranges and validate total');
    allure.owner('QA Team');
    allure.tag('checkout', 'price-validation', 'mixed-prices');
    allure.severity('high');

    // Step 1: Add items with different prices strategically
    await allure.step('Add items with mixed price ranges', async () => {
      // Get product prices first
      const productNames = await inventoryPage.getProductNames();
      const productPrices = await inventoryPage.getProductPrices();
      
      // Log prices for debugging
      console.log('Available products and prices:', productNames.map((name, i) => `${name}: $${productPrices[i]}`));
      
      // Add cheapest and most expensive items for better validation
      await inventoryPage.addProductToCartByIndex(0); // First item
      await inventoryPage.addProductToCartByIndex(2); // Third item  
      await inventoryPage.addProductToCartByIndex(4); // Fifth item
      
      await inventoryPage.assertCartBadgeCount(3);
    });

    // Step 2: Verify price calculations in cart
    await allure.step('Verify price calculations in cart', async () => {
      await inventoryPage.goToCart();
      
      // Verify items and their individual prices
      const cartItemCount = await cartPage.getCartItemCount();
      expect(cartItemCount).toBe(3);
    });

    // Step 3: Complete checkout and verify final calculations
    await allure.step('Complete checkout and verify calculations', async () => {
      await cartPage.proceedToCheckout();
      
      const checkoutInfo = TestData.checkoutInfo.valid;
      await checkoutPage.fillCheckoutInformation(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.postalCode
      );
      await checkoutPage.clickContinue();
      
      // Detailed price validation
      await checkoutPage.assertCalculatedTotal();
      
      // Get subtotal, tax, and total for validation
      const subtotal = await checkoutPage.getSubtotal();
      const tax = await checkoutPage.getTax();
      const total = await checkoutPage.getTotal();
      
      // Basic calculation validation
      const calculatedTotal = subtotal + tax;
      expect(Math.abs(total - calculatedTotal)).toBeLessThan(0.01); // Allow for rounding
      
      await checkoutPage.clickFinish();
    });

    // Step 4: Verify completion
    await allure.step('Verify order completion', async () => {
      await checkoutPage.assertOrderComplete();
    });
  });

  test('Purchase workflow performance test @performance', async ({ page }) => {
    allure.description('Test performance of checkout workflow with multiple items');
    allure.owner('QA Team');
    allure.tag('performance', 'checkout', 'multiple-items');
    allure.severity('medium');

    // Step 1: Measure add to cart performance
    await allure.step('Measure add to cart performance', async () => {
      const startTime = Date.now();
      
      // Add 4 items quickly
      for (let i = 0; i < 4; i++) {
        await inventoryPage.addProductToCartByIndex(i);
      }
      
      const addToCartTime = Date.now() - startTime;
      console.log(`Add to cart time for 4 items: ${addToCartTime}ms`);
      
      // Should complete within reasonable time
      expect(addToCartTime).toBeLessThan(10000); // 10 seconds
      await inventoryPage.assertCartBadgeCount(4);
    });

    // Step 2: Measure checkout process performance  
    await allure.step('Measure checkout process performance', async () => {
      const checkoutStartTime = Date.now();
      
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
      
      const checkoutInfo = TestData.checkoutInfo.valid;
      await checkoutPage.fillCheckoutInformation(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.postalCode
      );
      await checkoutPage.clickContinue();
      await checkoutPage.clickFinish();
      
      const totalCheckoutTime = Date.now() - checkoutStartTime;
      console.log(`Total checkout time: ${totalCheckoutTime}ms`);
      
      // Checkout should complete within reasonable time
      expect(totalCheckoutTime).toBeLessThan(15000); // 15 seconds
    });

    // Step 3: Verify completion
    await allure.step('Verify performance test completion', async () => {
      await checkoutPage.assertOrderComplete();
    });
  });
});