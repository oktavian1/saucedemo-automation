const BasePage = require('./BasePage');
const { expect } = require('@playwright/test');

class CartPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectors
    this.cartList = '.cart_list';
    this.cartItems = '.cart_item';
    this.cartItemName = '.inventory_item_name';
    this.cartItemPrice = '.inventory_item_price';
    this.cartItemQuantity = '.cart_quantity';
    this.removeButton = 'button[id*="remove"]';
    this.continueShoppingButton = '#continue-shopping';
    this.checkoutButton = '#checkout';
    this.cartHeader = '.header_secondary_container';
    this.cartQuantityLabel = '.cart_quantity_label';
    this.cartDescLabel = '.cart_desc_label';
  }

  async assertCartPageLoaded() {
    await this.assertElementVisible(this.cartHeader, 'Cart header should be visible');
    await this.assertElementVisible(this.continueShoppingButton, 'Continue shopping button should be visible');
    await this.assertElementVisible(this.checkoutButton, 'Checkout button should be visible');
  }

  async getCartItemCount() {
    return await this.getElementCount(this.cartItems);
  }

  async getCartItemNames() {
    const items = await this.page.locator(this.cartItemName).all();
    const names = [];
    for (const item of items) {
      names.push(await item.textContent());
    }
    return names;
  }

  async getCartItemPrices() {
    const prices = await this.page.locator(this.cartItemPrice).all();
    const priceList = [];
    for (const price of prices) {
      const text = await price.textContent();
      priceList.push(text);
    }
    return priceList;
  }

  async removeItemFromCart(productName) {
    const productSelector = `[data-test="remove-${productName.toLowerCase().replace(/\s+/g, '-')}"]`;
    await this.clickElement(productSelector);
  }

  async removeItemByIndex(index) {
    const removeButtons = await this.page.locator(this.removeButton).all();
    if (index < removeButtons.length) {
      await removeButtons[index].click();
    } else {
      throw new Error(`Item at index ${index} does not exist in cart`);
    }
  }

  async continueShopping() {
    await this.clickElement(this.continueShoppingButton);
    await this.waitForNavigation();
  }

  async proceedToCheckout() {
    await this.clickElement(this.checkoutButton);
    await this.waitForNavigation();
  }

  async getCartItemDetails(index) {
    const items = await this.page.locator(this.cartItems).all();
    if (index < items.length) {
      const item = items[index];
      const name = await item.locator(this.cartItemName).textContent();
      const price = await item.locator(this.cartItemPrice).textContent();
      const quantity = await item.locator(this.cartItemQuantity).textContent();
      
      return { name, price, quantity };
    }
    throw new Error(`Cart item at index ${index} does not exist`);
  }

  async isCartEmpty() {
    const itemCount = await this.getCartItemCount();
    return itemCount === 0;
  }

  async assertCartIsEmpty() {
    const isEmpty = await this.isCartEmpty();
    expect(isEmpty).toBe(true);
  }

  async assertCartContainsItem(itemName) {
    const itemNames = await this.getCartItemNames();
    expect(itemNames).toContain(itemName);
  }

  async assertCartItemCount(expectedCount) {
    const actualCount = await this.getCartItemCount();
    expect(actualCount).toBe(expectedCount);
  }

  async clearCart() {
    const removeButtons = await this.page.locator(this.removeButton).all();
    for (let i = removeButtons.length - 1; i >= 0; i--) {
      await removeButtons[i].click();
      await this.page.waitForTimeout(500); // Wait for item removal animation
    }
  }

  async getTotalItemQuantity() {
    const quantities = await this.page.locator(this.cartItemQuantity).all();
    let total = 0;
    for (const qty of quantities) {
      const qtyText = await qty.textContent();
      total += parseInt(qtyText);
    }
    return total;
  }

  async assertCartLabelsVisible() {
    await this.assertElementVisible(this.cartQuantityLabel, 'Quantity label should be visible');
    await this.assertElementVisible(this.cartDescLabel, 'Description label should be visible');
  }

  async getItemQuantity(itemName) {
    const items = await this.page.locator(this.cartItems).all();
    for (const item of items) {
      const name = await item.locator(this.cartItemName).textContent();
      if (name === itemName) {
        const quantity = await item.locator(this.cartItemQuantity).textContent();
        return parseInt(quantity);
      }
    }
    throw new Error(`Item ${itemName} not found in cart`);
  }

  async assertItemPresentInCart(itemName) {
    const itemNames = await this.getCartItemNames();
    const isPresent = itemNames.some(name => name.includes(itemName) || name === itemName);
    expect(isPresent, `Item "${itemName}" should be present in cart. Available items: ${itemNames.join(', ')}`).toBe(true);
  }
}

module.exports = CartPage;