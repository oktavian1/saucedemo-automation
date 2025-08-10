const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const InventoryPage = require('../pages/InventoryPage');
const TestData = require('../data/TestData');
const { allure } = require('allure-playwright');

test.describe('Inventory Page Functionality', () => {
  let loginPage;
  let inventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    
    // Login before each test
    await loginPage.navigateToLogin();
    await loginPage.login(TestData.users.standard.username, TestData.users.standard.password);
    await inventoryPage.assertInventoryPageLoaded();
  });

  test('Verify inventory page displays all products', async ({ page }) => {
    allure.description('Test that all products are displayed on inventory page');
    allure.owner('QA Team');
    allure.tag('inventory', 'display', 'smoke');
    allure.severity('high');

    // Step 1: Verify product count
    await allure.step('Verify expected number of products are displayed', async () => {
      const productCount = await inventoryPage.getProductCount();
      expect(productCount).toBe(6); // SauceDemo has 6 products
    });

    // Step 2: Verify all product names are displayed
    await allure.step('Verify all product names are visible', async () => {
      const productNames = await inventoryPage.getProductNames();
      expect(productNames.length).toBe(6);
      expect(productNames).toContain(TestData.products.backpack.name);
      expect(productNames).toContain(TestData.products.bikeLight.name);
    });

    // Step 3: Verify all products have prices
    await allure.step('Verify all products display prices', async () => {
      const productPrices = await inventoryPage.getProductPrices();
      expect(productPrices.length).toBe(6);
      productPrices.forEach(price => {
        expect(price).toBeGreaterThan(0);
      });
    });
  });

  test('Sort products by name A-Z', async ({ page }) => {
    allure.description('Test sorting products alphabetically from A to Z');
    allure.owner('QA Team');
    allure.tag('inventory', 'sorting', 'functionality');
    allure.severity('medium');

    // Step 1: Sort products by name A-Z
    await allure.step('Select sort option: Name A to Z', async () => {
      await inventoryPage.sortProducts(TestData.sortOptions.nameAsc);
    });

    // Step 2: Verify products are sorted correctly
    await allure.step('Verify products are sorted alphabetically A-Z', async () => {
      await inventoryPage.assertProductsAreSorted(TestData.sortOptions.nameAsc);
    });
  });

  test('Sort products by name Z-A', async ({ page }) => {
    allure.description('Test sorting products alphabetically from Z to A');
    allure.owner('QA Team');
    allure.tag('inventory', 'sorting', 'functionality');
    allure.severity('medium');

    // Step 1: Sort products by name Z-A
    await allure.step('Select sort option: Name Z to A', async () => {
      await inventoryPage.sortProducts(TestData.sortOptions.nameDesc);
    });

    // Step 2: Verify products are sorted correctly
    await allure.step('Verify products are sorted alphabetically Z-A', async () => {
      await inventoryPage.assertProductsAreSorted(TestData.sortOptions.nameDesc);
    });
  });

  test('Sort products by price low to high', async ({ page }) => {
    allure.description('Test sorting products by price from low to high');
    allure.owner('QA Team');
    allure.tag('inventory', 'sorting', 'functionality');
    allure.severity('medium');

    // Step 1: Sort products by price low to high
    await allure.step('Select sort option: Price low to high', async () => {
      await inventoryPage.sortProducts(TestData.sortOptions.priceLowHigh);
    });

    // Step 2: Verify products are sorted correctly
    await allure.step('Verify products are sorted by price low to high', async () => {
      await inventoryPage.assertProductsAreSorted(TestData.sortOptions.priceLowHigh);
    });
  });

  test('Sort products by price high to low', async ({ page }) => {
    allure.description('Test sorting products by price from high to low');
    allure.owner('QA Team');
    allure.tag('inventory', 'sorting', 'functionality');
    allure.severity('medium');

    // Step 1: Sort products by price high to low
    await allure.step('Select sort option: Price high to low', async () => {
      await inventoryPage.sortProducts(TestData.sortOptions.priceHighLow);
    });

    // Step 2: Verify products are sorted correctly
    await allure.step('Verify products are sorted by price high to low', async () => {
      await inventoryPage.assertProductsAreSorted(TestData.sortOptions.priceHighLow);
    });
  });

  test('Add single product to cart', async ({ page }) => {
    allure.description('Test adding a single product to shopping cart');
    allure.owner('QA Team');
    allure.tag('inventory', 'cart', 'functionality');
    allure.severity('high');

    // Step 1: Add product to cart
    await allure.step('Add Sauce Labs Backpack to cart', async () => {
      await inventoryPage.addProductToCartByIndex(0);
    });

    // Step 2: Verify cart badge shows correct count
    await allure.step('Verify cart badge shows 1 item', async () => {
      await inventoryPage.assertCartBadgeCount(1);
    });

    // Step 3: Verify cart count matches expected
    await allure.step('Verify cart item count is correct', async () => {
      const cartCount = await inventoryPage.getCartItemCount();
      expect(cartCount).toBe(1);
    });
  });

  test('Add multiple products to cart', async ({ page }) => {
    allure.description('Test adding multiple products to shopping cart');
    allure.owner('QA Team');
    allure.tag('inventory', 'cart', 'functionality');
    allure.severity('high');

    // Step 1: Add first product to cart
    await allure.step('Add first product to cart', async () => {
      await inventoryPage.addProductToCartByIndex(0);
    });

    // Step 2: Add second product to cart
    await allure.step('Add second product to cart', async () => {
      await inventoryPage.addProductToCartByIndex(1);
    });

    // Step 3: Add third product to cart
    await allure.step('Add third product to cart', async () => {
      await inventoryPage.addProductToCartByIndex(2);
    });

    // Step 4: Verify cart badge shows correct count
    await allure.step('Verify cart badge shows 3 items', async () => {
      await inventoryPage.assertCartBadgeCount(3);
    });
  });

  test('Remove product from cart', async ({ page }) => {
    allure.description('Test removing a product from shopping cart');
    allure.owner('QA Team');
    allure.tag('inventory', 'cart', 'functionality');
    allure.severity('medium');

    // Step 1: Add products to cart
    await allure.step('Add two products to cart', async () => {
      await inventoryPage.addProductToCartByIndex(0);
      await inventoryPage.addProductToCartByIndex(1);
      await inventoryPage.assertCartBadgeCount(2);
    });

    // Step 2: Remove one product from cart
    await allure.step('Remove first product from cart', async () => {
      const productName = (await inventoryPage.getProductNames())[0];
      const productId = productName.toLowerCase().replace(/\s+/g, '-');
      await inventoryPage.removeProductFromCart(productId);
    });

    // Step 3: Verify cart count decreased
    await allure.step('Verify cart badge shows 1 item', async () => {
      await inventoryPage.assertCartBadgeCount(1);
    });
  });

  test('Navigate to shopping cart', async ({ page }) => {
    allure.description('Test navigating to shopping cart page');
    allure.owner('QA Team');
    allure.tag('inventory', 'navigation', 'functionality');
    allure.severity('medium');

    // Step 1: Add item to cart
    await allure.step('Add product to cart', async () => {
      await inventoryPage.addProductToCartByIndex(0);
      await inventoryPage.assertCartBadgeCount(1);
    });

    // Step 2: Navigate to cart
    await allure.step('Click shopping cart icon', async () => {
      await inventoryPage.goToCart();
    });

    // Step 3: Verify navigation to cart page
    await allure.step('Verify redirect to cart page', async () => {
      expect(page.url()).toContain('/cart.html');
    });
  });

  test('Logout from inventory page', async ({ page }) => {
    allure.description('Test logout functionality from inventory page');
    allure.owner('QA Team');
    allure.tag('inventory', 'logout', 'functionality');
    allure.severity('medium');

    // Step 1: Click logout option (which will also open menu)
    await allure.step('Click logout option', async () => {
      await inventoryPage.logout();
    });

    // Step 3: Verify redirect to login page
    await allure.step('Verify redirect to login page', async () => {
      expect(page.url()).not.toContain('/inventory.html');
      await loginPage.assertLoginPageElements();
    });
  });

  test('Verify product details display', async ({ page }) => {
    allure.description('Test that product details are properly displayed');
    allure.owner('QA Team');
    allure.tag('inventory', 'display', 'validation');
    allure.severity('low');

    // Step 1: Get first product details
    await allure.step('Verify first product has all required details', async () => {
      const productDetails = await inventoryPage.getProductDetails(0);
      
      expect(productDetails.name).toBeTruthy();
      expect(productDetails.description).toBeTruthy();
      expect(productDetails.price).toBeTruthy();
      expect(productDetails.price).toContain('$');
    });

    // Step 2: Verify all products have details
    await allure.step('Verify all products have complete information', async () => {
      const productCount = await inventoryPage.getProductCount();
      
      for (let i = 0; i < productCount; i++) {
        const details = await inventoryPage.getProductDetails(i);
        expect(details.name).toBeTruthy();
        expect(details.description).toBeTruthy();
        expect(details.price).toBeTruthy();
      }
    });
  });
});