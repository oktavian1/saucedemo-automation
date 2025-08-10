const BasePage = require('./BasePage');
const { expect } = require('@playwright/test');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectors
    this.usernameInput = '#user-name';
    this.passwordInput = '#password';
    this.loginButton = '#login-button';
    this.errorMessage = '[data-test="error"]';
    this.loginLogo = '.login_logo';
    this.loginCredentials = '#login_credentials';
    this.loginPassword = '.login_password';
  }

  async navigateToLogin() {
    await this.navigate('/');
    await this.waitForElement(this.loginLogo);
  }

  async enterUsername(username) {
    await this.fillElement(this.usernameInput, username);
  }

  async enterPassword(password) {
    await this.fillElement(this.passwordInput, password);
  }

  async clickLoginButton() {
    await this.clickElement(this.loginButton);
  }

  async login(username, password) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
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

  async clearLoginForm() {
    await this.clearAndType(this.usernameInput, '');
    await this.clearAndType(this.passwordInput, '');
  }

  async isLoginFormDisplayed() {
    const usernameVisible = await this.isElementVisible(this.usernameInput);
    const passwordVisible = await this.isElementVisible(this.passwordInput);
    const buttonVisible = await this.isElementVisible(this.loginButton);
    
    return usernameVisible && passwordVisible && buttonVisible;
  }

  async getPlaceholderText(selector) {
    return await this.page.getAttribute(selector, 'placeholder');
  }

  async assertLoginPageElements() {
    await this.assertElementVisible(this.loginLogo, 'Login logo should be visible');
    await this.assertElementVisible(this.usernameInput, 'Username input should be visible');
    await this.assertElementVisible(this.passwordInput, 'Password input should be visible');
    await this.assertElementVisible(this.loginButton, 'Login button should be visible');
    await this.assertElementVisible(this.loginCredentials, 'Login credentials info should be visible');
    await this.assertElementVisible(this.loginPassword, 'Login password info should be visible');
  }

  async isLoginButtonEnabled() {
    return await this.page.isEnabled(this.loginButton);
  }

  async pressEnterOnPasswordField() {
    await this.page.focus(this.passwordInput);
    await this.pressKey('Enter');
  }

  async getLoginButtonText() {
    return await this.page.getAttribute(this.loginButton, 'value');
  }
}

module.exports = LoginPage;