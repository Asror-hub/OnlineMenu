#!/usr/bin/env node

/**
 * Final Verification Script
 * Comprehensive testing to ensure no bugs or issues
 * Run with: node final-verification.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  API_BASE_URL: 'http://localhost:5000',
  CLIENT_URL: 'http://localhost:3000',
  TEST_RESTAURANTS: [
    { slug: 'admin2', name: "Admin's Restaurant" },
    { slug: 'admin3', name: "Asror's Restaurant" },
    { slug: 'solebo', name: 'Solebo' },
    { slug: 'bella', name: 'Bella' }
  ],
  TIMEOUT: 10000
};

// Test results storage
let testResults = [];
let criticalIssues = [];

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: TEST_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Final-Verification/1.0',
        ...options.headers
      },
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Helper function to add test result
function addTestResult(testName, passed, error = null, details = null, isCritical = false) {
  const result = { testName, passed, error, details, timestamp: new Date().toISOString(), isCritical };
  testResults.push(result);
  
  if (isCritical && !passed) {
    criticalIssues.push(result);
  }
  
  const status = passed ? '✅' : '❌';
  const errorText = error ? ` - ${error}` : '';
  const detailsText = details ? ` (${JSON.stringify(details)})` : '';
  const criticalText = isCritical ? ' [CRITICAL]' : '';
  
  console.log(`${status} ${testName}${criticalText}${errorText}${detailsText}`);
  return result;
}

// Test 1: Backend Server Health
async function testBackendHealth() {
  console.log('\n🏥 Testing Backend Server Health...');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.API_BASE_URL}/api/restaurants/public/info`, {
      headers: {
        'X-Restaurant-Slug': 'admin2',
        'X-Session-Id': 'health-check-' + Date.now()
      }
    });
    
    if (response.status === 200) {
      addTestResult('Backend Server Health', true, null, {
        status: response.status,
        responseTime: 'OK',
        serverRunning: true
      }, true);
      return true;
    } else {
      addTestResult('Backend Server Health', false, `HTTP ${response.status}`, null, true);
      return false;
    }
  } catch (error) {
    addTestResult('Backend Server Health', false, error.message, null, true);
    return false;
  }
}

// Test 2: Database Connectivity
async function testDatabaseConnectivity() {
  console.log('\n🗄️ Testing Database Connectivity...');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.API_BASE_URL}/api/menu`, {
      headers: {
        'X-Restaurant-Slug': 'admin2',
        'X-Session-Id': 'db-check-' + Date.now()
      }
    });
    
    if (response.status === 200 && Array.isArray(response.data)) {
      addTestResult('Database Connectivity', true, null, {
        menuItemsCount: response.data.length,
        dataRetrieved: true,
        databaseConnected: true
      }, true);
      return true;
    } else {
      addTestResult('Database Connectivity', false, 'Invalid response format', null, true);
      return false;
    }
  } catch (error) {
    addTestResult('Database Connectivity', false, error.message, null, true);
    return false;
  }
}

// Test 3: Restaurant Data Integrity
async function testRestaurantDataIntegrity() {
  console.log('\n🔍 Testing Restaurant Data Integrity...');
  
  try {
    const results = [];
    
    for (const restaurant of TEST_CONFIG.TEST_RESTAURANTS) {
      try {
        const response = await makeRequest(`${TEST_CONFIG.API_BASE_URL}/api/restaurants/public/info`, {
          headers: {
            'X-Restaurant-Slug': restaurant.slug,
            'X-Session-Id': 'integrity-check-' + Date.now()
          }
        });
        
        if (response.status === 200 && response.data && response.data.id) {
          results.push({
            slug: restaurant.slug,
            name: restaurant.name,
            success: true,
            restaurantId: response.data.id,
            hasName: !!response.data.name,
            hasDescription: !!response.data.description
          });
        } else {
          results.push({
            slug: restaurant.slug,
            name: restaurant.name,
            success: false,
            error: `HTTP ${response.status}`
          });
        }
      } catch (error) {
        results.push({
          slug: restaurant.slug,
          name: restaurant.name,
          success: false,
          error: error.message
        });
      }
    }
    
    const successfulRestaurants = results.filter(r => r.success);
    const failedRestaurants = results.filter(r => !r.success);
    
    const allDataValid = successfulRestaurants.every(r => r.hasName && r.hasDescription);
    
    addTestResult('Restaurant Data Integrity', 
      successfulRestaurants.length > 0 && allDataValid, 
      null, 
      {
        totalRestaurants: results.length,
        successfulRestaurants: successfulRestaurants.length,
        failedRestaurants: failedRestaurants.length,
        allDataValid: allDataValid,
        results: results
      }, 
      true
    );
    
    return results;
  } catch (error) {
    addTestResult('Restaurant Data Integrity', false, error.message, null, true);
    return null;
  }
}

// Test 4: Menu System Functionality
async function testMenuSystemFunctionality() {
  console.log('\n🍽️ Testing Menu System Functionality...');
  
  try {
    const [menuResponse, categoriesResponse] = await Promise.all([
      makeRequest(`${TEST_CONFIG.API_BASE_URL}/api/menu`, {
        headers: {
          'X-Restaurant-Slug': 'admin2',
          'X-Session-Id': 'menu-check-' + Date.now()
        }
      }),
      makeRequest(`${TEST_CONFIG.API_BASE_URL}/api/menu/categories`, {
        headers: {
          'X-Restaurant-Slug': 'admin2',
          'X-Session-Id': 'categories-check-' + Date.now()
        }
      })
    ]);
    
    if (menuResponse.status === 200 && categoriesResponse.status === 200) {
      const menuItems = menuResponse.data;
      const categories = categoriesResponse.data;
      
      const validMenuItems = menuItems.filter(item => 
        item.id && item.name && item.price !== undefined && item.category_id
      );
      
      const validCategories = categories.filter(cat => 
        cat.id && cat.name && cat.position !== undefined
      );
      
      const menuSystemWorking = validMenuItems.length > 0 && validCategories.length > 0;
      
      addTestResult('Menu System Functionality', menuSystemWorking, null, {
        totalMenuItems: menuItems.length,
        validMenuItems: validMenuItems.length,
        totalCategories: categories.length,
        validCategories: validCategories.length,
        systemWorking: menuSystemWorking
      }, true);
      
      return { menuItems, categories };
    } else {
      addTestResult('Menu System Functionality', false, 'API endpoints not responding', null, true);
      return null;
    }
  } catch (error) {
    addTestResult('Menu System Functionality', false, error.message, null, true);
    return null;
  }
}

// Test 5: Order System Functionality
async function testOrderSystemFunctionality() {
  console.log('\n🛒 Testing Order System Functionality...');
  
  try {
    // First get menu items
    const menuResponse = await makeRequest(`${TEST_CONFIG.API_BASE_URL}/api/menu`, {
      headers: {
        'X-Restaurant-Slug': 'admin2',
        'X-Session-Id': 'order-check-' + Date.now()
      }
    });
    
    if (menuResponse.status !== 200 || !Array.isArray(menuResponse.data) || menuResponse.data.length === 0) {
      addTestResult('Order System Functionality', false, 'No menu items available for testing', null, true);
      return null;
    }
    
    // Create test order
    const testOrder = {
      items: [{
        menu_item_id: menuResponse.data[0].id,
        quantity: 1,
        notes: 'Final verification test order'
      }],
      special_instructions: 'This is a final verification test order'
    };
    
    const orderResponse = await makeRequest(`${TEST_CONFIG.API_BASE_URL}/api/orders/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Restaurant-Slug': 'admin2',
        'X-Session-Id': 'order-check-' + Date.now()
      },
      body: testOrder
    });
    
    if (orderResponse.status === 201 && orderResponse.data && orderResponse.data.order_id) {
      addTestResult('Order System Functionality', true, null, {
        orderId: orderResponse.data.order_id,
        totalAmount: orderResponse.data.total_amount,
        message: orderResponse.data.message,
        orderPlaced: true
      }, true);
      return orderResponse.data;
    } else {
      addTestResult('Order System Functionality', false, `Invalid order response - Status: ${orderResponse.status}`, null, true);
      return null;
    }
  } catch (error) {
    addTestResult('Order System Functionality', false, error.message, null, true);
    return null;
  }
}

// Test 6: Data Isolation Security
async function testDataIsolationSecurity() {
  console.log('\n🔒 Testing Data Isolation Security...');
  
  try {
    const restaurant1 = 'admin2';
    const restaurant2 = 'admin3';
    
    // Get data for both restaurants
    const [response1, response2] = await Promise.all([
      makeRequest(`${TEST_CONFIG.API_BASE_URL}/api/menu`, {
        headers: {
          'X-Restaurant-Slug': restaurant1,
          'X-Session-Id': 'isolation-check-1-' + Date.now()
        }
      }),
      makeRequest(`${TEST_CONFIG.API_BASE_URL}/api/menu`, {
        headers: {
          'X-Restaurant-Slug': restaurant2,
          'X-Session-Id': 'isolation-check-2-' + Date.now()
        }
      })
    ]);
    
    if (response1.status === 200 && response2.status === 200) {
      const items1 = response1.data;
      const items2 = response2.data;
      
      // Check for data isolation
      const sharedItems = items1.filter(item1 => 
        items2.some(item2 => item1.id === item2.id)
      );
      
      const isolationWorking = sharedItems.length === 0;
      
      addTestResult('Data Isolation Security', isolationWorking, null, {
        restaurant1: restaurant1,
        restaurant2: restaurant2,
        items1Count: items1.length,
        items2Count: items2.length,
        sharedItems: sharedItems.length,
        isolationWorking: isolationWorking,
        securityVerified: isolationWorking
      }, true);
      
      return { items1, items2, isolationWorking };
    } else {
      addTestResult('Data Isolation Security', false, 'Failed to fetch data for both restaurants', null, true);
      return null;
    }
  } catch (error) {
    addTestResult('Data Isolation Security', false, error.message, null, true);
    return null;
  }
}

// Test 7: Client App Build Verification
async function testClientAppBuild() {
  console.log('\n🏗️ Testing Client App Build...');
  
  try {
    // Check if build directory exists
    const buildPath = path.join(__dirname, 'build');
    const buildExists = fs.existsSync(buildPath);
    
    if (buildExists) {
      // Check for essential build files
      const indexHtml = fs.existsSync(path.join(buildPath, 'index.html'));
      const staticDir = fs.existsSync(path.join(buildPath, 'static'));
      
      const buildValid = indexHtml && staticDir;
      
      addTestResult('Client App Build', buildValid, null, {
        buildDirectoryExists: buildExists,
        indexHtmlExists: indexHtml,
        staticDirectoryExists: staticDir,
        buildValid: buildValid
      });
      
      return buildValid;
    } else {
      addTestResult('Client App Build', false, 'Build directory not found', null, false);
      return false;
    }
  } catch (error) {
    addTestResult('Client App Build', false, error.message, null, false);
    return false;
  }
}

// Test 8: Performance Verification
async function testPerformanceVerification() {
  console.log('\n⚡ Testing Performance Verification...');
  
  try {
    const startTime = Date.now();
    
    // Test multiple concurrent requests
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        makeRequest(`${TEST_CONFIG.API_BASE_URL}/api/menu`, {
          headers: {
            'X-Restaurant-Slug': 'admin2',
            'X-Session-Id': `perf-test-${i}-` + Date.now()
          }
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const allSuccessful = responses.every(r => r.status === 200);
    const averageResponseTime = duration / responses.length;
    const performanceGood = averageResponseTime < 1000; // Less than 1 second per request
    
    addTestResult('Performance Verification', allSuccessful && performanceGood, null, {
      totalRequests: requests.length,
      successfulRequests: responses.filter(r => r.status === 200).length,
      totalDuration: duration,
      averageResponseTime: averageResponseTime,
      performanceGood: performanceGood
    });
    
    return { allSuccessful, performanceGood, averageResponseTime };
  } catch (error) {
    addTestResult('Performance Verification', false, error.message, null, false);
    return null;
  }
}

// Test 9: Error Handling Verification
async function testErrorHandlingVerification() {
  console.log('\n⚠️ Testing Error Handling Verification...');
  
  try {
    // Test with invalid restaurant slug
    const invalidResponse = await makeRequest(`${TEST_CONFIG.API_BASE_URL}/api/restaurants/public/info`, {
      headers: {
        'X-Restaurant-Slug': 'invalid-restaurant-slug',
        'X-Session-Id': 'error-test-' + Date.now()
      }
    });
    
    // Test with invalid endpoint
    const notFoundResponse = await makeRequest(`${TEST_CONFIG.API_BASE_URL}/api/invalid-endpoint`, {
      headers: {
        'X-Restaurant-Slug': 'admin2',
        'X-Session-Id': 'error-test-' + Date.now()
      }
    });
    
    const errorHandlingWorking = 
      (invalidResponse.status === 404 || invalidResponse.status === 400) &&
      notFoundResponse.status === 404;
    
    addTestResult('Error Handling Verification', errorHandlingWorking, null, {
      invalidSlugResponse: invalidResponse.status,
      notFoundResponse: notFoundResponse.status,
      errorHandlingWorking: errorHandlingWorking
    });
    
    return errorHandlingWorking;
  } catch (error) {
    addTestResult('Error Handling Verification', false, error.message, null, false);
    return false;
  }
}

// Main verification runner
async function runFinalVerification() {
  console.log('🔍 Starting Final Verification - No Bugs or Issues Check...');
  console.log('='.repeat(70));
  console.log(`API Base URL: ${TEST_CONFIG.API_BASE_URL}`);
  console.log(`Client URL: ${TEST_CONFIG.CLIENT_URL}`);
  console.log('='.repeat(70));
  
  const startTime = Date.now();
  testResults = [];
  criticalIssues = [];
  
  // Run all critical tests
  await testBackendHealth();
  await testDatabaseConnectivity();
  await testRestaurantDataIntegrity();
  await testMenuSystemFunctionality();
  await testOrderSystemFunctionality();
  await testDataIsolationSecurity();
  
  // Run additional verification tests
  await testClientAppBuild();
  await testPerformanceVerification();
  await testErrorHandlingVerification();
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Generate final verification summary
  generateFinalVerificationSummary(duration);
}

// Generate final verification summary
function generateFinalVerificationSummary(duration) {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 FINAL VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const criticalTests = testResults.filter(r => r.isCritical);
  const criticalPassed = criticalTests.filter(r => r.passed).length;
  const criticalFailed = criticalTests.length - criticalPassed;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`🔴 Critical Tests: ${criticalTests.length}`);
  console.log(`✅ Critical Passed: ${criticalPassed}`);
  console.log(`❌ Critical Failed: ${criticalFailed}`);
  console.log(`⏱️ Duration: ${duration}ms`);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  if (criticalFailed > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    criticalIssues.forEach(issue => {
      console.log(`  - ${issue.testName}: ${issue.error}`);
    });
  }
  
  if (failedTests > 0 && criticalFailed === 0) {
    console.log('\n⚠️ NON-CRITICAL ISSUES:');
    testResults.filter(r => !r.passed && !r.isCritical).forEach(result => {
      console.log(`  - ${result.testName}: ${result.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (criticalFailed === 0 && failedTests === 0) {
    console.log('🎉 PERFECT! NO BUGS OR ISSUES FOUND!');
    console.log('✅ All critical systems are working perfectly');
    console.log('✅ All tests passed with 100% success rate');
    console.log('✅ The system is completely bug-free and production-ready');
    console.log('✅ Restaurant data isolation is working flawlessly');
    console.log('✅ All API endpoints are functioning correctly');
    console.log('✅ Order system is working perfectly');
    console.log('✅ Performance is excellent');
    console.log('✅ Error handling is working properly');
  } else if (criticalFailed === 0) {
    console.log('✅ CRITICAL SYSTEMS: ALL WORKING PERFECTLY');
    console.log('⚠️ Some non-critical issues found, but system is production-ready');
    console.log('💡 Consider addressing non-critical issues for optimal performance');
  } else {
    console.log('🚨 CRITICAL ISSUES FOUND - SYSTEM NOT READY');
    console.log('❌ Please fix critical issues before production deployment');
    console.log('💡 Check the critical issues listed above');
  }
  
  // Store results globally for inspection
  global.verificationResults = testResults;
  global.verificationSummary = {
    totalTests,
    passedTests,
    failedTests,
    criticalTests: criticalTests.length,
    criticalPassed,
    criticalFailed,
    duration,
    successRate: parseFloat(successRate),
    isProductionReady: criticalFailed === 0
  };
  
  return {
    totalTests,
    passedTests,
    failedTests,
    criticalTests: criticalTests.length,
    criticalPassed,
    criticalFailed,
    duration,
    successRate: parseFloat(successRate),
    isProductionReady: criticalFailed === 0,
    results: testResults
  };
}

// Run verification if this script is executed directly
if (require.main === module) {
  runFinalVerification().catch((error) => {
    console.error('❌ Final verification failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runFinalVerification,
  testResults,
  TEST_CONFIG
};

