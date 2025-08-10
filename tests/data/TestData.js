const TestHelper = require('../utils/TestHelper');

class TestData {
  static get users() {
    return {
      standard: {
        username: TestHelper.getEnvVar('STANDARD_USER', 'standard_user'),
        password: TestHelper.getEnvVar('PASSWORD', 'secret_sauce')
      },
      locked: {
        username: TestHelper.getEnvVar('LOCKED_OUT_USER', 'locked_out_user'),
        password: TestHelper.getEnvVar('PASSWORD', 'secret_sauce')
      },
      problem: {
        username: TestHelper.getEnvVar('PROBLEM_USER', 'problem_user'),
        password: TestHelper.getEnvVar('PASSWORD', 'secret_sauce')
      },
      performance: {
        username: TestHelper.getEnvVar('PERFORMANCE_GLITCH_USER', 'performance_glitch_user'),
        password: TestHelper.getEnvVar('PASSWORD', 'secret_sauce')
      },
      error: {
        username: TestHelper.getEnvVar('ERROR_USER', 'error_user'),
        password: TestHelper.getEnvVar('PASSWORD', 'secret_sauce')
      },
      visual: {
        username: TestHelper.getEnvVar('VISUAL_USER', 'visual_user'),
        password: TestHelper.getEnvVar('PASSWORD', 'secret_sauce')
      },
      invalid: {
        username: 'invalid_user',
        password: 'invalid_password'
      }
    };
  }

  static get products() {
    return {
      backpack: {
        name: 'Sauce Labs Backpack',
        price: '$29.99',
        id: 'sauce-labs-backpack'
      },
      bikeLight: {
        name: 'Sauce Labs Bike Light',
        price: '$9.99',
        id: 'sauce-labs-bike-light'
      },
      boltTShirt: {
        name: 'Sauce Labs Bolt T-Shirt',
        price: '$15.99',
        id: 'sauce-labs-bolt-t-shirt'
      },
      fleeceJacket: {
        name: 'Sauce Labs Fleece Jacket',
        price: '$49.99',
        id: 'sauce-labs-fleece-jacket'
      },
      onesie: {
        name: 'Sauce Labs Onesie',
        price: '$7.99',
        id: 'sauce-labs-onesie'
      },
      redTShirt: {
        name: 'Test.allTheThings() T-Shirt (Red)',
        price: '$15.99',
        id: 'test-allthethings-t-shirt-red'
      }
    };
  }

  static get checkoutInfo() {
    return {
      valid: {
        firstName: 'John',
        lastName: 'Doe',
        postalCode: '12345'
      },
      incomplete: {
        firstName: 'Jane',
        lastName: '',
        postalCode: '67890'
      },
      special: {
        firstName: 'Test@#$',
        lastName: 'User!@#',
        postalCode: 'ABC123'
      }
    };
  }

  static get sortOptions() {
    return {
      nameAsc: 'az',
      nameDesc: 'za',
      priceLowHigh: 'lohi',
      priceHighLow: 'hilo'
    };
  }

  static get errorMessages() {
    return {
      lockedUser: 'Epic sadface: Sorry, this user has been locked out.',
      invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
      requiredUsername: 'Epic sadface: Username is required',
      requiredPassword: 'Epic sadface: Password is required',
      requiredFirstName: 'Error: First Name is required',
      requiredLastName: 'Error: Last Name is required',
      requiredPostalCode: 'Error: Postal Code is required'
    };
  }

  static get urls() {
    return {
      login: '/',
      inventory: '/inventory.html',
      cart: '/cart.html',
      checkout: '/checkout-step-one.html',
      checkoutStepTwo: '/checkout-step-two.html',
      checkoutComplete: '/checkout-complete.html'
    };
  }
}

module.exports = TestData;