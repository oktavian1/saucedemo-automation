const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const InventoryPage = require('../pages/InventoryPage');
const CartPage = require('../pages/CartPage');
const TestData = require('../data/TestData');
const { allure } = require('allure-playwright');

test.describe('Shopping Cart Functionality', () => {
  let loginPage;
  let inventoryPage;
  let cartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    
    // Login and navigate to inventory
    await loginPage.navigateToLogin();
    await loginPage.login(TestData.users.standard.username, TestData.users.standard.password);
    await inventoryPage.assertInventoryPageLoaded();
  });

  test('Verify cart page displays correctly with items', async ({ page }) => {
    allure.description('Test that cart page displays correctly when items are added');
    allure.owner('QA Team');
    allure.tag('cart', 'display', 'smoke');
    allure.severity('high');

    // Step 1: Add items to cart from inventory
    await allure.step('Add two products to cart', async () => {
      await inventoryPage.addProductToCartByIndex(0);
      await inventoryPage.addProductToCartByIndex(1);
      await inventoryPage.assertCartBadgeCount(2);
    });

    // Step 2: Navigate to cart
    await allure.step('Navigate to cart page', async () => {
      await inventoryPage.goToCart();
    });

    // Step 3: Verify cart page elements
    await allure.step('Verify cart page loads correctly', async () => {
      await cartPage.assertCartPageLoaded();
    });

    // Step 4: Verify items in cart
    await allure.step('Verify cart contains 2 items', async () => {
      await cartPage.assertCartItemCount(2);
    });

    // Step 5: Verify cart labels are visible
    await allure.step('Verify cart labels are displayed', async () => {
      await cartPage.assertCartLabelsVisible();
    });
  });

  test('Verify empty cart page', async ({ page }) => {
    allure.description('Test that empty cart page displays correctly');
    allure.owner('QA Team');
    allure.tag('cart', 'display', 'edge-case');
    allure.severity('medium');

    // Step 1: Navigate to cart without adding items
    await allure.step('Navigate to cart page without adding items', async () => {
      await inventoryPage.goToCart();
    });

    // Step 2: Verify cart page loads
    await allure.step('Verify cart page loads correctly', async () => {
      await cartPage.assertCartPageLoaded();
    });

    // Step 3: Verify cart is empty
    await allure.step('Verify cart is empty', async () => {
      await cartPage.assertCartIsEmpty();
    });
  });

  test('Remove single item from cart', async ({ page }) => {
    allure.description('Test removing a single item from shopping cart');
    allure.owner('QA Team');
    allure.tag('cart', 'functionality', 'remove');
    allure.severity('high');

    // Step 1: Add items to cart
    await allure.step('Add three products to cart', async () => {
      await inventoryPage.addProductToCartByIndex(0);
      await inventoryPage.addProductToCartByIndex(1);
      await inventoryPage.addProductToCartByIndex(2);
      await inventoryPage.assertCartBadgeCount(3);
    });

    // Step 2: Navigate to cart
    await allure.step('Navigate to cart page', async () => {
      await inventoryPage.goToCart();
    });

    // Step 3: Remove first item
    await allure.step('Remove first item from cart', async () => {
      await cartPage.removeItemByIndex(0);
    });

    // Step 4: Verify item count decreased
    await allure.step('Verify cart now has 2 items', async () => {
      await cartPage.assertCartItemCount(2);
    });
  });

  test('Remove all items from cart', async ({ page }) => {
    allure.description('Test removing all items from shopping cart');
    allure.owner('QA Team');
    allure.tag('cart', 'functionality', 'remove');
    allure.severity('medium');

    // Step 1: Add items to cart
    await allure.step('Add two products to cart', async () => {
      await inventoryPage.addProductToCartByIndex(0);
      await inventoryPage.addProductToCartByIndex(1);
      await inventoryPage.assertCartBadgeCount(2);
    });

    // Step 2: Navigate to cart
    await allure.step('Navigate to cart page', async () => {
      await inventoryPage.goToCart();
    });

    // Step 3: Clear all items
    await allure.step('Remove all items from cart', async () => {
      await cartPage.clearCart();
    });

    // Step 4: Verify cart is empty
    await allure.step('Verify cart is now empty', async () => {
      await cartPage.assertCartIsEmpty();
    });
  });

  test('Continue shopping from cart', async ({ page }) => {
    allure.description('Test continue shopping functionality from cart page');
    allure.owner('QA Team');
    allure.tag('cart', 'navigation', 'functionality');
    allure.severity('medium');

    // Step 1: Add item to cart
    await allure.step('Add product to cart', async () => {
      await inventoryPage.addProductToCartByIndex(0);
      await inventoryPage.assertCartBadgeCount(1);
    });

    // Step 2: Navigate to cart
    await allure.step('Navigate to cart page', async () => {
      await inventoryPage.goToCart();
    });

    // Step 3: Click continue shopping
    await allure.step('Click continue shopping button', async () => {
      await cartPage.continueShopping();
    });

    // Step 4: Verify navigation back to inventory
    await allure.step('Verify redirect to inventory page', async () => {
      expect(page.url()).toContain('/inventory.html');
      await inventoryPage.assertInventoryPageLoaded();
    });

    // Step 5: Verify cart badge still shows item count
    await allure.step('Verify cart badge still shows 1 item', async () => {
      await inventoryPage.assertCartBadgeCount(1);
    });
  });

  test('Proceed to checkout from cart', async ({ page }) => {
    allure.description('Test proceeding to checkout from cart page');
    allure.owner('QA Team');
    allure.tag('cart', 'checkout', 'functionality');
    allure.severity('high');

    // Step 1: Add items to cart
    await allure.step('Add products to cart', async () => {
      await inventoryPage.addProductToCartByIndex(0);
      await inventoryPage.addProductToCartByIndex(1);
      await inventoryPage.assertCartBadgeCount(2);
    });

    // Step 2: Navigate to cart
    await allure.step('Navigate to cart page', async () => {
      await inventoryPage.goToCart();
    });

    // Step 3: Verify items in cart
    await allure.step('Verify cart contains items', async () => {
      await cartPage.assertCartItemCount(2);
    });

    // Step 4: Proceed to checkout
    await allure.step('Click checkout button', async () => {
      await cartPage.proceedToCheckout();
    });

    // Step 5: Verify navigation to checkout
    await allure.step('Verify redirect to checkout page', async () => {
      expect(page.url()).toContain('/checkout-step-one.html');
    });
  });

  test('Verify cart item details', async ({ page }) => {
    allure.description('Test that cart items display correct details');
    allure.owner('QA Team');
    allure.tag('cart', 'display', 'validation');
    allure.severity('medium');

    // Step 1: Get product details from inventory
    await allure.step('Get first product details from inventory', async () => {
      const inventoryDetails = await inventoryPage.getProductDetails(0);
      
      // Add to cart
      await inventoryPage.addProductToCartByIndex(0);
      await inventoryPage.goToCart();
      
      // Get cart item details
      const cartDetails = await cartPage.getCartItemDetails(0);
      
      // Verify details match
      expect(cartDetails.name).toBe(inventoryDetails.name);
      expect(cartDetails.price).toBe(inventoryDetails.price);
      expect(cartDetails.quantity).toBe('1');
    });
  });

  test('Verify cart item quantity display', async ({ page }) => {
    allure.description('Test that cart items show correct quantity');
    allure.owner('QA Team');
    allure.tag('cart', 'display', 'quantity');
    allure.severity('low');

    // Step 1: Add same product multiple times
    await allure.step('Add product to cart', async () => {
      await inventoryPage.addProductToCartByIndex(0);
      await inventoryPage.goToCart();
    });

    // Step 2: Verify quantity shows as 1
    await allure.step('Verify quantity shows 1', async () => {
      const details = await cartPage.getCartItemDetails(0);
      expect(details.quantity).toBe('1');
    });

    // Step 3: Go back and add more items
    await allure.step('Add another product', async () => {
      await cartPage.continueShopping();
      await inventoryPage.addProductToCartByIndex(1);
      await inventoryPage.goToCart();
    });

    // Step 4: Verify total quantity
    await allure.step('Verify cart has 2 items', async () => {
      const totalQuantity = await cartPage.getTotalItemQuantity();
      expect(totalQuantity).toBe(2);
    });
  });

  test('Verify cart maintains state across navigation', async ({ page }) => {
    allure.description('Test that cart maintains items when navigating between pages');
    allure.owner('QA Team');
    allure.tag('cart', 'persistence', 'navigation');
    allure.severity('medium');

    // Step 1: Add items to cart
    await allure.step('Add products to cart', async () => {
      await inventoryPage.addProductToCartByIndex(0);
      await inventoryPage.addProductToCartByIndex(1);
      await inventoryPage.assertCartBadgeCount(2);
    });

    // Step 2: Navigate to cart and back
    await allure.step('Navigate to cart and back to inventory', async () => {
      await inventoryPage.goToCart();
      await cartPage.assertCartItemCount(2);
      await cartPage.continueShopping();
      await inventoryPage.assertCartBadgeCount(2);
    });

    // Step 3: Navigate to cart again
    await allure.step('Navigate to cart again and verify items', async () => {
      await inventoryPage.goToCart();
      await cartPage.assertCartItemCount(2);
    });
  });
});