require('dotenv').config();
const { expect } = require('@playwright/test');

class TestHelper {
  static getEnvVar(name, defaultValue = '') {
    return process.env[name] || defaultValue;
  }

  static async waitForPageLoad(page, timeout = 30000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async takeScreenshot(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `reports/screenshots/${name}_${timestamp}.png`,
      fullPage: true 
    });
  }

  static async scrollIntoView(page, selector) {
    await page.locator(selector).scrollIntoViewIfNeeded();
  }

  static async waitAndClick(page, selector, timeout = 10000) {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
  }

  static async waitAndFill(page, selector, text, timeout = 10000) {
    await page.waitForSelector(selector, { timeout });
    await page.fill(selector, text);
  }

  static async waitAndGetText(page, selector, timeout = 10000) {
    await page.waitForSelector(selector, { timeout });
    return await page.textContent(selector);
  }

  static async isElementVisible(page, selector, timeout = 5000) {
    try {
      await page.waitForSelector(selector, { timeout, state: 'visible' });
      return true;
    } catch {
      return false;
    }
  }

  static async assertElementVisible(page, selector, message = '') {
    const isVisible = await this.isElementVisible(page, selector);
    expect(isVisible, message || `Element ${selector} should be visible`).toBe(true);
  }

  static async assertElementHasText(page, selector, expectedText) {
    const actualText = await this.waitAndGetText(page, selector);
    expect(actualText).toContain(expectedText);
  }

  static async assertElementCount(page, selector, expectedCount) {
    const elements = await page.locator(selector);
    const actualCount = await elements.count();
    expect(actualCount).toBe(expectedCount);
  }

  static async clearAndFill(page, selector, text) {
    await page.fill(selector, '');
    await page.fill(selector, text);
  }

  static generateRandomEmail() {
    const timestamp = Date.now();
    return `test${timestamp}@example.com`;
  }

  static generateRandomString(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

module.exports = TestHelper;