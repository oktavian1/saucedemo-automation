const BasePage = require('./BasePage');
const { expect } = require('@playwright/test');

class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Step One Selectors
    this.firstNameInput = '#first-name';
    this.lastNameInput = '#last-name';
    this.postalCodeInput = '#postal-code';
    this.continueButton = '#continue';
    this.cancelButton = '#cancel';
    this.errorMessage = '[data-test="error"]';
    
    // Step Two Selectors
    this.summaryContainer = '.checkout_summary_container';
    this.cartItems = '.cart_item';
    this.summaryInfo = '.summary_info';
    this.summarySubtotal = '.summary_subtotal_label';
    this.summaryTax = '.summary_tax_label';
    this.summaryTotal = '.summary_total_label';
    this.finishButton = '#finish';
    this.cancelButtonStepTwo = '#cancel';
    
    // Complete Selectors
    this.completeHeader = '.complete-header';
    this.completeText = '.complete-text';
    this.backHomeButton = '#back-to-products';
    this.ponyExpressImage = '.pony_express';
  }

  // Step One Methods
  async fillCheckoutInformation(firstName, lastName, postalCode) {
    await this.fillElement(this.firstNameInput, firstName);
    await this.fillElement(this.lastNameInput, lastName);
    await this.fillElement(this.postalCodeInput, postalCode);
  }

  async fillFirstName(firstName) {
    await this.fillElement(this.firstNameInput, firstName);
  }

  async fillLastName(lastName) {
    await this.fillElement(this.lastNameInput, lastName);
  }

  async fillPostalCode(postalCode) {
    await this.fillElement(this.postalCodeInput, postalCode);
  }

  async clickContinue() {
    await this.clickElement(this.continueButton);
    await this.waitForNavigation();
  }

  async clickCancel() {
    await this.clickElement(this.cancelButton);
    await this.waitForNavigation();
  }

  async getErrorMessage() {
    await this.waitForElement(this.errorMessage);
    return await this.getElementText(this.errorMessage);
  }

  async isErrorMessageDisplayed() {
    return await this.isElementVisible(this.errorMessage);
  }

  async assertErrorMessage(expectedMessage) {
    await this.assertElementVisible(this.errorMessage, 'Error message should be visible');
    const actualMessage = await this.getErrorMessage();
    expect(actualMessage).toContain(expectedMessage);
  }

  async assertCheckoutStepOneLoaded() {
    await this.assertElementVisible(this.firstNameInput, 'First name input should be visible');
    await this.assertElementVisible(this.lastNameInput, 'Last name input should be visible');
    await this.assertElementVisible(this.postalCodeInput, 'Postal code input should be visible');
    await this.assertElementVisible(this.continueButton, 'Continue button should be visible');
    await this.assertElementVisible(this.cancelButton, 'Cancel button should be visible');
  }

  // Step Two Methods
  async assertCheckoutStepTwoLoaded() {
    await this.assertElementVisible(this.summaryContainer, 'Summary container should be visible');
    await this.assertElementVisible(this.finishButton, 'Finish button should be visible');
    await this.assertElementVisible(this.cancelButtonStepTwo, 'Cancel button should be visible');
  }

  async getOrderSummaryItems() {
    const items = await this.page.locator(this.cartItems).all();
    const orderItems = [];
    for (const item of items) {
      const name = await item.locator('.inventory_item_name').textContent();
      const price = await item.locator('.inventory_item_price').textContent();
      const quantity = await item.locator('.cart_quantity').textContent();
      orderItems.push({ name, price, quantity });
    }
    return orderItems;
  }

  async getSubtotal() {
    const subtotalText = await this.getElementText(this.summarySubtotal);
    return parseFloat(subtotalText.replace('Item total: $', ''));
  }

  async getTax() {
    const taxText = await this.getElementText(this.summaryTax);
    return parseFloat(taxText.replace('Tax: $', ''));
  }

  async getTotal() {
    const totalText = await this.getElementText(this.summaryTotal);
    return parseFloat(totalText.replace('Total: $', ''));
  }

  async clickFinish() {
    await this.clickElement(this.finishButton);
    await this.waitForNavigation();
  }

  async clickCancelStepTwo() {
    await this.clickElement(this.cancelButtonStepTwo);
    await this.waitForNavigation();
  }

  async assertOrderSummary() {
    await this.assertElementVisible(this.summaryInfo, 'Summary info should be visible');
    await this.assertElementVisible(this.summarySubtotal, 'Subtotal should be visible');
    await this.assertElementVisible(this.summaryTax, 'Tax should be visible');
    await this.assertElementVisible(this.summaryTotal, 'Total should be visible');
  }

  async calculateExpectedTotal() {
    const subtotal = await this.getSubtotal();
    const tax = await this.getTax();
    return subtotal + tax;
  }

  async assertCalculatedTotal() {
    const expectedTotal = await this.calculateExpectedTotal();
    const actualTotal = await this.getTotal();
    expect(actualTotal).toBeCloseTo(expectedTotal, 2);
  }

  // Complete Methods
  async assertCheckoutCompleteLoaded() {
    await this.assertElementVisible(this.completeHeader, 'Complete header should be visible');
    await this.assertElementVisible(this.completeText, 'Complete text should be visible');
    await this.assertElementVisible(this.backHomeButton, 'Back home button should be visible');
    await this.assertElementVisible(this.ponyExpressImage, 'Pony express image should be visible');
  }

  async getCompleteHeader() {
    return await this.getElementText(this.completeHeader);
  }

  async getCompleteText() {
    return await this.getElementText(this.completeText);
  }

  async clickBackHome() {
    await this.clickElement(this.backHomeButton);
    await this.waitForNavigation();
  }

  async assertOrderComplete() {
    const header = await this.getCompleteHeader();
    const text = await this.getCompleteText();
    
    expect(header).toContain('Thank you for your order!');
    expect(text).toContain('Your order has been dispatched');
  }

  // Utility Methods
  async completeCheckoutFlow(firstName, lastName, postalCode) {
    await this.fillCheckoutInformation(firstName, lastName, postalCode);
    await this.clickContinue();
    await this.assertCheckoutStepTwoLoaded();
    await this.clickFinish();
    await this.assertCheckoutCompleteLoaded();
  }

  async getItemCountInSummary() {
    return await this.getElementCount(this.cartItems);
  }

  async clearCheckoutForm() {
    await this.clearAndType(this.firstNameInput, '');
    await this.clearAndType(this.lastNameInput, '');
    await this.clearAndType(this.postalCodeInput, '');
  }
}

module.exports = CheckoutPage;