const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const InventoryPage = require('../pages/InventoryPage');
const CartPage = require('../pages/CartPage');
const CheckoutPage = require('../pages/CheckoutPage');
const TestData = require('../data/TestData');
const { allure } = require('allure-playwright');

test.describe('Checkout Process Functionality', () => {
  let loginPage;
  let inventoryPage;
  let cartPage;
  let checkoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    
    // Login, add items to cart, and navigate to checkout
    await loginPage.navigateToLogin();
    await loginPage.login(TestData.users.standard.username, TestData.users.standard.password);
    await inventoryPage.assertInventoryPageLoaded();
    await inventoryPage.addProductToCartByIndex(0);
    await inventoryPage.addProductToCartByIndex(1);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
  });

  test('Complete checkout with valid information', async ({ page }) => {
    allure.description('Test successful completion of checkout process with valid information');
    allure.owner('QA Team');
    allure.tag('checkout', 'positive', 'e2e');
    allure.severity('critical');

    // Step 1: Verify checkout step one page
    await allure.step('Verify checkout step one page loads', async () => {
      await checkoutPage.assertCheckoutStepOneLoaded();
      expect(page.url()).toContain('/checkout-step-one.html');
    });

    // Step 2: Fill checkout information
    await allure.step('Fill valid checkout information', async () => {
      const checkoutInfo = TestData.checkoutInfo.valid;
      await checkoutPage.fillCheckoutInformation(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.postalCode
      );
    });

    // Step 3: Continue to step two
    await allure.step('Click continue to proceed to step two', async () => {
      await checkoutPage.clickContinue();
    });

    // Step 4: Verify checkout step two page
    await allure.step('Verify checkout step two page loads', async () => {
      await checkoutPage.assertCheckoutStepTwoLoaded();
      expect(page.url()).toContain('/checkout-step-two.html');
    });

    // Step 5: Verify order summary
    await allure.step('Verify order summary displays correctly', async () => {
      await checkoutPage.assertOrderSummary();
      const itemCount = await checkoutPage.getItemCountInSummary();
      expect(itemCount).toBe(2);
    });

    // Step 6: Verify price calculations
    await allure.step('Verify price calculations are correct', async () => {
      await checkoutPage.assertCalculatedTotal();
    });

    // Step 7: Complete the order
    await allure.step('Click finish to complete the order', async () => {
      await checkoutPage.clickFinish();
    });

    // Step 8: Verify order completion
    await allure.step('Verify order completion page', async () => {
      await checkoutPage.assertCheckoutCompleteLoaded();
      expect(page.url()).toContain('/checkout-complete.html');
      await checkoutPage.assertOrderComplete();
    });
  });

  test('Checkout validation - missing first name', async ({ page }) => {
    allure.description('Test checkout validation when first name is missing');
    allure.owner('QA Team');
    allure.tag('checkout', 'negative', 'validation');
    allure.severity('high');

    // Step 1: Fill incomplete information (missing first name)
    await allure.step('Fill checkout info without first name', async () => {
      await checkoutPage.fillLastName(TestData.checkoutInfo.valid.lastName);
      await checkoutPage.fillPostalCode(TestData.checkoutInfo.valid.postalCode);
    });

    // Step 2: Attempt to continue
    await allure.step('Click continue button', async () => {
      await checkoutPage.clickContinue();
    });

    // Step 3: Verify error message
    await allure.step('Verify first name required error message', async () => {
      await checkoutPage.assertErrorMessage(TestData.errorMessages.requiredFirstName);
    });

    // Step 4: Verify user remains on step one
    await allure.step('Verify user remains on checkout step one', async () => {
      expect(page.url()).toContain('/checkout-step-one.html');
    });
  });

  test('Checkout validation - missing last name', async ({ page }) => {
    allure.description('Test checkout validation when last name is missing');
    allure.owner('QA Team');
    allure.tag('checkout', 'negative', 'validation');
    allure.severity('high');

    // Step 1: Fill incomplete information (missing last name)
    await allure.step('Fill checkout info without last name', async () => {
      await checkoutPage.fillFirstName(TestData.checkoutInfo.valid.firstName);
      await checkoutPage.fillPostalCode(TestData.checkoutInfo.valid.postalCode);
    });

    // Step 2: Attempt to continue
    await allure.step('Click continue button', async () => {
      await checkoutPage.clickContinue();
    });

    // Step 3: Verify error message
    await allure.step('Verify last name required error message', async () => {
      await checkoutPage.assertErrorMessage(TestData.errorMessages.requiredLastName);
    });
  });

  test('Checkout validation - missing postal code', async ({ page }) => {
    allure.description('Test checkout validation when postal code is missing');
    allure.owner('QA Team');
    allure.tag('checkout', 'negative', 'validation');
    allure.severity('high');

    // Step 1: Fill incomplete information (missing postal code)
    await allure.step('Fill checkout info without postal code', async () => {
      await checkoutPage.fillFirstName(TestData.checkoutInfo.valid.firstName);
      await checkoutPage.fillLastName(TestData.checkoutInfo.valid.lastName);
    });

    // Step 2: Attempt to continue
    await allure.step('Click continue button', async () => {
      await checkoutPage.clickContinue();
    });

    // Step 3: Verify error message
    await allure.step('Verify postal code required error message', async () => {
      await checkoutPage.assertErrorMessage(TestData.errorMessages.requiredPostalCode);
    });
  });

  test('Cancel checkout from step one', async ({ page }) => {
    allure.description('Test canceling checkout process from step one');
    allure.owner('QA Team');
    allure.tag('checkout', 'navigation', 'cancel');
    allure.severity('medium');

    // Step 1: Fill some information
    await allure.step('Fill partial checkout information', async () => {
      await checkoutPage.fillFirstName(TestData.checkoutInfo.valid.firstName);
    });

    // Step 2: Cancel checkout
    await allure.step('Click cancel button', async () => {
      await checkoutPage.clickCancel();
    });

    // Step 3: Verify navigation back to cart
    await allure.step('Verify redirect back to cart page', async () => {
      expect(page.url()).toContain('/cart.html');
      await cartPage.assertCartPageLoaded();
    });
  });

  test('Cancel checkout from step two', async ({ page }) => {
    allure.description('Test canceling checkout process from step two');
    allure.owner('QA Team');
    allure.tag('checkout', 'navigation', 'cancel');
    allure.severity('medium');

    // Step 1: Complete step one
    await allure.step('Complete checkout step one', async () => {
      const checkoutInfo = TestData.checkoutInfo.valid;
      await checkoutPage.fillCheckoutInformation(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.postalCode
      );
      await checkoutPage.clickContinue();
      await checkoutPage.assertCheckoutStepTwoLoaded();
    });

    // Step 2: Cancel from step two
    await allure.step('Click cancel button on step two', async () => {
      await checkoutPage.clickCancelStepTwo();
    });

    // Step 3: Verify navigation back to inventory
    await allure.step('Verify redirect to inventory page', async () => {
      expect(page.url()).toContain('/inventory.html');
      await inventoryPage.assertInventoryPageLoaded();
    });
  });

  test('Verify order summary details', async ({ page }) => {
    allure.description('Test that order summary shows correct item details and calculations');
    allure.owner('QA Team');
    allure.tag('checkout', 'summary', 'validation');
    allure.severity('medium');

    // Step 1: Complete step one
    await allure.step('Complete checkout step one', async () => {
      const checkoutInfo = TestData.checkoutInfo.valid;
      await checkoutPage.fillCheckoutInformation(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.postalCode
      );
      await checkoutPage.clickContinue();
    });

    // Step 2: Verify summary items
    await allure.step('Verify order summary contains correct items', async () => {
      const summaryItems = await checkoutPage.getOrderSummaryItems();
      expect(summaryItems).toHaveLength(2);
      
      summaryItems.forEach(item => {
        expect(item.name).toBeTruthy();
        expect(item.price).toContain('$');
        expect(item.quantity).toBe('1');
      });
    });

    // Step 3: Verify price calculations
    await allure.step('Verify price breakdown is correct', async () => {
      const subtotal = await checkoutPage.getSubtotal();
      const tax = await checkoutPage.getTax();
      const total = await checkoutPage.getTotal();
      
      expect(subtotal).toBeGreaterThan(0);
      expect(tax).toBeGreaterThan(0);
      expect(total).toBeGreaterThan(subtotal);
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });
  });

  test('Complete checkout and return to products', async ({ page }) => {
    allure.description('Test completing checkout and returning to products page');
    allure.owner('QA Team');
    allure.tag('checkout', 'complete', 'navigation');
    allure.severity('medium');

    // Step 1: Complete entire checkout flow
    await allure.step('Complete full checkout process', async () => {
      const checkoutInfo = TestData.checkoutInfo.valid;
      await checkoutPage.completeCheckoutFlow(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.postalCode
      );
    });

    // Step 2: Click back home
    await allure.step('Click back home button', async () => {
      await checkoutPage.clickBackHome();
    });

    // Step 3: Verify navigation to inventory
    await allure.step('Verify redirect to inventory page', async () => {
      expect(page.url()).toContain('/inventory.html');
      await inventoryPage.assertInventoryPageLoaded();
    });

    // Step 4: Verify cart is empty
    await allure.step('Verify cart is empty after order completion', async () => {
      await inventoryPage.assertCartBadgeCount(0);
    });
  });

  test('Checkout with special characters in form fields', async ({ page }) => {
    allure.description('Test checkout process with special characters in form fields');
    allure.owner('QA Team');
    allure.tag('checkout', 'validation', 'edge-case');
    allure.severity('low');

    // Step 1: Fill form with special characters
    await allure.step('Fill checkout form with special characters', async () => {
      const checkoutInfo = TestData.checkoutInfo.special;
      await checkoutPage.fillCheckoutInformation(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.postalCode
      );
    });

    // Step 2: Proceed with checkout
    await allure.step('Continue to step two', async () => {
      await checkoutPage.clickContinue();
    });

    // Step 3: Verify checkout can proceed
    await allure.step('Verify checkout step two loads successfully', async () => {
      await checkoutPage.assertCheckoutStepTwoLoaded();
    });

    // Step 4: Complete the order
    await allure.step('Complete the checkout process', async () => {
      await checkoutPage.clickFinish();
      await checkoutPage.assertCheckoutCompleteLoaded();
    });
  });
});