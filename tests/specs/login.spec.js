const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const InventoryPage = require('../pages/InventoryPage');
const TestData = require('../data/TestData');
const { allure } = require('allure-playwright');

test.describe('Login Functionality', () => {
  let loginPage;
  let inventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.navigateToLogin();
  });

  test('Login with valid standard user credentials', async ({ page }) => {
    allure.description('Test successful login with valid standard user credentials');
    allure.owner('QA Team');
    allure.tag('login', 'positive', 'smoke');
    allure.severity('critical');

    // Step 1: Navigate to login page and verify elements
    await allure.step('Verify login page elements are displayed', async () => {
      await loginPage.assertLoginPageElements();
    });

    // Step 2: Enter valid credentials
    await allure.step('Enter valid username', async () => {
      await loginPage.enterUsername(TestData.users.standard.username);
    });

    await allure.step('Enter valid password', async () => {
      await loginPage.enterPassword(TestData.users.standard.password);
    });

    // Step 3: Click login button
    await allure.step('Click login button', async () => {
      await loginPage.clickLoginButton();
    });

    // Step 4: Verify successful login
    await allure.step('Verify redirect to inventory page', async () => {
      await inventoryPage.assertInventoryPageLoaded();
      expect(page.url()).toContain('/inventory.html');
    });
  });

  test('Login with locked out user', async ({ page }) => {
    allure.description('Test login attempt with locked out user credentials');
    allure.owner('QA Team');
    allure.tag('login', 'negative', 'security');
    allure.severity('high');

    // Step 1: Enter locked out user credentials
    await allure.step('Enter locked out username', async () => {
      await loginPage.enterUsername(TestData.users.locked.username);
    });

    await allure.step('Enter password', async () => {
      await loginPage.enterPassword(TestData.users.locked.password);
    });

    // Step 2: Attempt login
    await allure.step('Click login button', async () => {
      await loginPage.clickLoginButton();
    });

    // Step 3: Verify error message
    await allure.step('Verify locked out error message is displayed', async () => {
      await loginPage.assertErrorMessage(TestData.errorMessages.lockedUser);
    });

    // Step 4: Verify user remains on login page
    await allure.step('Verify user remains on login page', async () => {
      expect(page.url()).not.toContain('/inventory.html');
      await loginPage.assertLoginPageElements();
    });
  });

  test('Login with invalid credentials', async ({ page }) => {
    allure.description('Test login attempt with invalid user credentials');
    allure.owner('QA Team');
    allure.tag('login', 'negative', 'validation');
    allure.severity('high');

    // Step 1: Enter invalid credentials
    await allure.step('Enter invalid username', async () => {
      await loginPage.enterUsername(TestData.users.invalid.username);
    });

    await allure.step('Enter invalid password', async () => {
      await loginPage.enterPassword(TestData.users.invalid.password);
    });

    // Step 2: Attempt login
    await allure.step('Click login button', async () => {
      await loginPage.clickLoginButton();
    });

    // Step 3: Verify error message
    await allure.step('Verify invalid credentials error message', async () => {
      await loginPage.assertErrorMessage(TestData.errorMessages.invalidCredentials);
    });
  });

  test('Login with empty username', async ({ page }) => {
    allure.description('Test login attempt with empty username field');
    allure.owner('QA Team');
    allure.tag('login', 'negative', 'validation');
    allure.severity('medium');

    // Step 1: Enter only password
    await allure.step('Leave username empty and enter password', async () => {
      await loginPage.enterPassword(TestData.users.standard.password);
    });

    // Step 2: Attempt login
    await allure.step('Click login button', async () => {
      await loginPage.clickLoginButton();
    });

    // Step 3: Verify error message
    await allure.step('Verify username required error message', async () => {
      await loginPage.assertErrorMessage(TestData.errorMessages.requiredUsername);
    });
  });

  test('Login with empty password', async ({ page }) => {
    allure.description('Test login attempt with empty password field');
    allure.owner('QA Team');
    allure.tag('login', 'negative', 'validation');
    allure.severity('medium');

    // Step 1: Enter only username
    await allure.step('Enter username and leave password empty', async () => {
      await loginPage.enterUsername(TestData.users.standard.username);
    });

    // Step 2: Attempt login
    await allure.step('Click login button', async () => {
      await loginPage.clickLoginButton();
    });

    // Step 3: Verify error message
    await allure.step('Verify password required error message', async () => {
      await loginPage.assertErrorMessage(TestData.errorMessages.requiredPassword);
    });
  });

  test('Login with Enter key on password field', async ({ page }) => {
    allure.description('Test successful login using Enter key on password field');
    allure.owner('QA Team');
    allure.tag('login', 'positive', 'keyboard');
    allure.severity('medium');

    // Step 1: Enter credentials
    await allure.step('Enter valid credentials', async () => {
      await loginPage.enterUsername(TestData.users.standard.username);
      await loginPage.enterPassword(TestData.users.standard.password);
    });

    // Step 2: Press Enter on password field
    await allure.step('Press Enter key on password field', async () => {
      await loginPage.pressEnterOnPasswordField();
    });

    // Step 3: Verify successful login
    await allure.step('Verify redirect to inventory page', async () => {
      await inventoryPage.assertInventoryPageLoaded();
      expect(page.url()).toContain('/inventory.html');
    });
  });

  test('Verify login button state and text', async ({ page }) => {
    allure.description('Test login button properties and behavior');
    allure.owner('QA Team');
    allure.tag('login', 'ui', 'validation');
    allure.severity('low');

    // Step 1: Verify login button is enabled
    await allure.step('Verify login button is enabled', async () => {
      const isEnabled = await loginPage.isLoginButtonEnabled();
      expect(isEnabled).toBe(true);
    });

    // Step 2: Verify login button text
    await allure.step('Verify login button text', async () => {
      const buttonText = await loginPage.getLoginButtonText();
      expect(buttonText.toLowerCase()).toContain('login');
    });
  });
});