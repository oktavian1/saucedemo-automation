const BasePage = require('./BasePage');
const { expect } = require('@playwright/test');

class InventoryPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectors
    this.inventoryContainer = '.inventory_container';
    this.inventoryList = '.inventory_list';
    this.inventoryItems = '.inventory_item';
    this.productSort = '[data-test="product-sort-container"]';
    this.shoppingCartLink = '.shopping_cart_link';
    this.shoppingCartBadge = '.shopping_cart_badge';
    this.menuButton = '#react-burger-menu-btn';
    this.menuItems = '.bm-item-list';
    this.logoutLink = '#logout_sidebar_link';
    this.appLogo = '.app_logo';
    
    // Product selectors
    this.productName = '.inventory_item_name';
    this.productDescription = '.inventory_item_desc';
    this.productPrice = '.inventory_item_price';
    this.addToCartButton = 'button[id*="add-to-cart"]';
    this.removeButton = 'button[id*="remove"]';
    
    // Pagination selectors (future implementation)
    this.pagination = '.pagination';
    this.paginationItems = '.pagination .page-item';
    this.paginationActive = '.pagination .page-item.active, .pagination .page-item.current';
    this.paginationNext = '.pagination .next, .pagination .page-item:last-child';
    this.paginationPrev = '.pagination .prev, .pagination .previous, .pagination .page-item:first-child';
    this.itemsPerPageSelect = 'select[data-test*="items-per-page"], .items-per-page select';
    this.searchInput = 'input[data-test*="search"], .search-input';
    this.loadMoreButton = 'button:has-text("Load More"), button:has-text("Show More"), button:has-text("View More")';
  }

  async assertInventoryPageLoaded() {
    await this.assertElementVisible(this.appLogo, 'App logo should be visible');
    await this.assertElementVisible(this.inventoryContainer, 'Inventory container should be visible');
    await this.assertElementVisible(this.productSort, 'Product sort dropdown should be visible');
    await this.assertElementVisible(this.shoppingCartLink, 'Shopping cart link should be visible');
  }

  async getProductCount() {
    return await this.getElementCount(this.inventoryItems);
  }

  async getProductNames() {
    const products = await this.page.locator(this.productName).all();
    const names = [];
    for (const product of products) {
      names.push(await product.textContent());
    }
    return names;
  }

  async getProductPrices() {
    const prices = await this.page.locator(this.productPrice).all();
    const priceList = [];
    for (const price of prices) {
      const text = await price.textContent();
      priceList.push(parseFloat(text.replace('$', '')));
    }
    return priceList;
  }

  async sortProducts(sortOption) {
    await this.selectDropdownOption(this.productSort, sortOption);
    await this.page.waitForTimeout(1000); // Wait for sorting animation
  }

  async addProductToCart(productName) {
    const productSelector = `[data-test="add-to-cart-${productName.toLowerCase().replace(/\s+/g, '-')}"]`;
    await this.clickElement(productSelector);
  }

  async removeProductFromCart(productName) {
    const productSelector = `[data-test="remove-${productName.toLowerCase().replace(/\s+/g, '-')}"]`;
    await this.clickElement(productSelector);
  }

  async addProductToCartByIndex(index) {
    await this.waitForElement(this.inventoryList);
    const inventoryItems = await this.page.locator(this.inventoryItems).all();
    
    if (index >= 0 && index < inventoryItems.length) {
      const addButton = inventoryItems[index].locator('button[id*="add-to-cart"]');
      const removeButton = inventoryItems[index].locator('button[id*="remove"]');
      
      if (await addButton.isVisible()) {
        await addButton.click();
      } else if (await removeButton.isVisible()) {
        throw new Error(`Product at index ${index} is already in cart`);
      } else {
        throw new Error(`No add/remove button found for product at index ${index}`);
      }
      
      await this.page.waitForTimeout(500);
    } else {
      throw new Error(`Product at index ${index} does not exist. Available products: ${inventoryItems.length}`);
    }
  }

  async getCartItemCount() {
    if (await this.isElementVisible(this.shoppingCartBadge)) {
      const badgeText = await this.getElementText(this.shoppingCartBadge);
      return parseInt(badgeText);
    }
    return 0;
  }

  async goToCart() {
    await this.clickElement(this.shoppingCartLink);
    await this.waitForNavigation();
  }

  async openMenu() {
    await this.clickElement(this.menuButton);
    await this.waitForElement(this.menuItems);
  }

  async logout() {
    await this.openMenu();
    await this.waitForElement(this.logoutLink);
    await this.clickElement(this.logoutLink);
    await this.waitForNavigation();
  }

  async getProductDetails(index) {
    const items = await this.page.locator(this.inventoryItems).all();
    if (index < items.length) {
      const item = items[index];
      const name = await item.locator(this.productName).textContent();
      const description = await item.locator(this.productDescription).textContent();
      const price = await item.locator(this.productPrice).textContent();
      
      return { name, description, price };
    }
    throw new Error(`Product at index ${index} does not exist`);
  }

  async clickProductName(productName) {
    const productSelector = `text=${productName}`;
    await this.clickElement(productSelector);
    await this.waitForNavigation();
  }

  async assertProductsAreSorted(sortOption) {
    const productNames = await this.getProductNames();
    const productPrices = await this.getProductPrices();
    
    switch (sortOption) {
      case 'az':
        const sortedNamesAsc = [...productNames].sort();
        expect(productNames).toEqual(sortedNamesAsc);
        break;
      case 'za':
        const sortedNamesDesc = [...productNames].sort().reverse();
        expect(productNames).toEqual(sortedNamesDesc);
        break;
      case 'lohi':
        const sortedPricesAsc = [...productPrices].sort((a, b) => a - b);
        expect(productPrices).toEqual(sortedPricesAsc);
        break;
      case 'hilo':
        const sortedPricesDesc = [...productPrices].sort((a, b) => b - a);
        expect(productPrices).toEqual(sortedPricesDesc);
        break;
    }
  }

  async assertCartBadgeCount(expectedCount) {
    if (expectedCount > 0) {
      await this.assertElementVisible(this.shoppingCartBadge, 'Cart badge should be visible');
      const actualCount = await this.getCartItemCount();
      expect(actualCount).toBe(expectedCount);
    } else {
      const isBadgeVisible = await this.isElementVisible(this.shoppingCartBadge);
      expect(isBadgeVisible).toBe(false);
    }
  }

  // Pagination Methods (Future Implementation)
  async isPaginationPresent() {
    return await this.isElementVisible(this.pagination);
  }

  async getPaginationItemsCount() {
    if (await this.isPaginationPresent()) {
      return await this.getElementCount(this.paginationItems);
    }
    return 0;
  }

  async getCurrentPage() {
    if (await this.isPaginationPresent()) {
      const activePageElement = this.page.locator(this.paginationActive);
      const pageText = await activePageElement.textContent();
      return parseInt(pageText.trim());
    }
    return 1; // Default to page 1 if no pagination
  }

  async goToNextPage() {
    if (await this.isPaginationPresent()) {
      const nextButton = this.page.locator(this.paginationNext);
      const isEnabled = !(await nextButton.isDisabled());
      if (isEnabled) {
        await nextButton.click();
        await this.waitForElement(this.inventoryList);
        return true;
      }
    }
    return false;
  }

  async goToPreviousPage() {
    if (await this.isPaginationPresent()) {
      const prevButton = this.page.locator(this.paginationPrev);
      const isEnabled = !(await prevButton.isDisabled());
      if (isEnabled) {
        await prevButton.click();
        await this.waitForElement(this.inventoryList);
        return true;
      }
    }
    return false;
  }

  async goToPage(pageNumber) {
    if (await this.isPaginationPresent()) {
      const pageButton = this.page.locator(`${this.paginationItems}:has-text("${pageNumber}")`);
      if (await pageButton.isVisible()) {
        await pageButton.click();
        await this.waitForElement(this.inventoryList);
        return true;
      }
    }
    return false;
  }

  async setItemsPerPage(itemCount) {
    if (await this.isElementVisible(this.itemsPerPageSelect)) {
      await this.page.selectOption(this.itemsPerPageSelect, itemCount.toString());
      await this.waitForElement(this.inventoryList);
      return true;
    }
    return false;
  }

  async searchProducts(searchTerm) {
    if (await this.isElementVisible(this.searchInput)) {
      await this.fillElement(this.searchInput, searchTerm);
      await this.page.keyboard.press('Enter');
      await this.waitForElement(this.inventoryList);
      return true;
    }
    return false;
  }

  async clearSearch() {
    if (await this.isElementVisible(this.searchInput)) {
      await this.fillElement(this.searchInput, '');
      await this.page.keyboard.press('Enter');
      await this.waitForElement(this.inventoryList);
      return true;
    }
    return false;
  }

  async isNextPageEnabled() {
    if (await this.isPaginationPresent()) {
      const nextButton = this.page.locator(this.paginationNext);
      return !(await nextButton.isDisabled());
    }
    return false;
  }

  async isPreviousPageEnabled() {
    if (await this.isPaginationPresent()) {
      const prevButton = this.page.locator(this.paginationPrev);
      return !(await prevButton.isDisabled());
    }
    return false;
  }

  async getTotalPages() {
    if (await this.isPaginationPresent()) {
      const pageItems = await this.page.locator(`${this.paginationItems}:not(.prev):not(.next)`).all();
      return pageItems.length;
    }
    return 1;
  }

  async validatePaginationControls() {
    const results = {
      paginationPresent: await this.isPaginationPresent(),
      currentPage: await this.getCurrentPage(),
      totalPages: await this.getTotalPages(),
      nextEnabled: await this.isNextPageEnabled(),
      prevEnabled: await this.isPreviousPageEnabled(),
      itemsPerPageAvailable: await this.isElementVisible(this.itemsPerPageSelect),
      searchAvailable: await this.isElementVisible(this.searchInput)
    };
    return results;
  }
}

module.exports = InventoryPage;