const TestHelper = require('../utils/TestHelper');

class BasePage {
  constructor(page) {
    this.page = page;
    this.baseURL = TestHelper.getEnvVar('BASE_URL', 'https://www.saucedemo.com');
  }

  async navigate(path = '') {
    const url = path ? `${this.baseURL}${path}` : this.baseURL;
    await this.page.goto(url);
    await TestHelper.waitForPageLoad(this.page);
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async getCurrentURL() {
    return this.page.url();
  }

  async takeScreenshot(name) {
    await TestHelper.takeScreenshot(this.page, name);
  }

  async waitForElement(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async clickElement(selector) {
    await TestHelper.waitAndClick(this.page, selector);
  }

  async fillElement(selector, text) {
    await TestHelper.waitAndFill(this.page, selector, text);
  }

  async getElementText(selector) {
    return await TestHelper.waitAndGetText(this.page, selector);
  }

  async isElementVisible(selector) {
    return await TestHelper.isElementVisible(this.page, selector);
  }

  async assertElementVisible(selector, message) {
    await TestHelper.assertElementVisible(this.page, selector, message);
  }

  async assertElementHasText(selector, expectedText) {
    await TestHelper.assertElementHasText(this.page, selector, expectedText);
  }

  async getElementCount(selector) {
    const elements = await this.page.locator(selector);
    return await elements.count();
  }

  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  async scrollToElement(selector) {
    await TestHelper.scrollIntoView(this.page, selector);
  }

  async selectDropdownOption(selector, value) {
    await this.page.selectOption(selector, value);
  }

  async hover(selector) {
    await this.page.hover(selector);
  }

  async doubleClick(selector) {
    await this.page.dblclick(selector);
  }

  async rightClick(selector) {
    await this.page.click(selector, { button: 'right' });
  }

  async pressKey(key) {
    await this.page.keyboard.press(key);
  }

  async clearAndType(selector, text) {
    await TestHelper.clearAndFill(this.page, selector, text);
  }
}

module.exports = BasePage;