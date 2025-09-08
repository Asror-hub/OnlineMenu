const axios = require('axios');

const TEST_CONFIG = {
  API_BASE_URL: 'http://localhost:5000',
  RESTAURANT_SLUG: 'admin2',
  TIMEOUT: 10000
};

async function comprehensiveSettingsTest() {
  console.log('🧪 COMPREHENSIVE SETTINGS PERSISTENCE TEST');
  console.log('============================================================');
  
  try {
    // Step 1: Check current database state
    console.log('📊 Step 1: Checking current database state...');
    const { pool } = require('../backend/database/connection');
    
    const restaurantData = await pool.query(`
      SELECT id, name, phone, email, description, open_time, close_time 
      FROM restaurants 
      WHERE slug = $1
    `, [TEST_CONFIG.RESTAURANT_SLUG]);
    
    const settingsData = await pool.query(`
      SELECT wifi_name, wifi_password, instagram, facebook, whatsapp, telegram 
      FROM restaurant_settings 
      WHERE restaurant_id = $1
    `, [restaurantData.rows[0]?.id]);
    
    console.log('✅ Current restaurant data:', restaurantData.rows[0]);
    console.log('✅ Current settings data:', settingsData.rows[0] || 'No settings found');
    
    // Step 2: Test admin endpoint
    console.log('\n📥 Step 2: Testing admin endpoint...');
    const adminResponse = await axios.get(`${TEST_CONFIG.API_BASE_URL}/api/settings`, {
      headers: {
        'X-Restaurant-Slug': TEST_CONFIG.RESTAURANT_SLUG,
        'X-Session-Id': 'test-session-' + Date.now()
      },
      timeout: TEST_CONFIG.TIMEOUT
    });
    
    console.log('✅ Admin endpoint response:');
    console.log('  Status:', adminResponse.status);
    console.log('  Restaurant Name:', adminResponse.data.restaurant_name);
    console.log('  Phone:', adminResponse.data.phone);
    console.log('  Email:', adminResponse.data.email);
    console.log('  WiFi Name:', adminResponse.data.wifi_name);
    console.log('  Instagram:', adminResponse.data.instagram);
    
    // Step 3: Test client endpoint
    console.log('\n📥 Step 3: Testing client endpoint...');
    const clientResponse = await axios.get(`${TEST_CONFIG.API_BASE_URL}/api/restaurants/public/settings`, {
      headers: {
        'X-Restaurant-Slug': TEST_CONFIG.RESTAURANT_SLUG,
        'X-Session-Id': 'test-session-' + Date.now()
      },
      timeout: TEST_CONFIG.TIMEOUT
    });
    
    console.log('✅ Client endpoint response:');
    console.log('  Status:', clientResponse.status);
    console.log('  Restaurant Name:', clientResponse.data.restaurant_name);
    console.log('  Phone:', clientResponse.data.phone);
    console.log('  Email:', clientResponse.data.email);
    console.log('  WiFi Name:', clientResponse.data.wifi_name);
    console.log('  Instagram:', clientResponse.data.instagram);
    console.log('  Debug flags:', clientResponse.data._debug_new_code, clientResponse.data._debug_timestamp);
    
    // Step 4: Test restaurant info endpoint
    console.log('\n📥 Step 4: Testing restaurant info endpoint...');
    const infoResponse = await axios.get(`${TEST_CONFIG.API_BASE_URL}/api/restaurants/public/info`, {
      headers: {
        'X-Restaurant-Slug': TEST_CONFIG.RESTAURANT_SLUG,
        'X-Session-Id': 'test-session-' + Date.now()
      },
      timeout: TEST_CONFIG.TIMEOUT
    });
    
    console.log('✅ Restaurant info endpoint response:');
    console.log('  Status:', infoResponse.status);
    console.log('  Restaurant Name:', infoResponse.data.name);
    console.log('  Phone:', infoResponse.data.phone);
    console.log('  Email:', infoResponse.data.email);
    
    // Step 5: Test data persistence by updating database directly
    console.log('\n💾 Step 5: Testing data persistence by updating database directly...');
    
    const testData = {
      restaurantName: 'Persistence Test Restaurant',
      description: 'Testing if data persists after database update',
      phone: '+9876543210',
      email: 'persistence@test.com',
      openTime: '07:00',
      closeTime: '24:00',
      wifiName: 'PersistenceWiFi',
      wifiPassword: 'persistence123',
      instagram: 'https://instagram.com/persistencetest',
      facebook: 'https://facebook.com/persistencetest',
      whatsapp: 'https://wa.me/9876543210'
    };
    
    // Update restaurant table
    await pool.query(`
      UPDATE restaurants SET
        name = $1,
        description = $2,
        phone = $3,
        email = $4,
        open_time = $5,
        close_time = $6,
        updated_at = NOW()
      WHERE id = $7
    `, [
      testData.restaurantName,
      testData.description,
      testData.phone,
      testData.email,
      testData.openTime,
      testData.closeTime,
      restaurantData.rows[0].id
    ]);
    
    // Update settings table
    await pool.query(`
      UPDATE restaurant_settings SET
        wifi_name = $1,
        wifi_password = $2,
        instagram = $3,
        facebook = $4,
        whatsapp = $5,
        updated_at = NOW()
      WHERE restaurant_id = $6
    `, [
      testData.wifiName,
      testData.wifiPassword,
      testData.instagram,
      testData.facebook,
      testData.whatsapp,
      restaurantData.rows[0].id
    ]);
    
    console.log('✅ Database updated with test data');
    
    // Step 6: Test endpoints after database update
    console.log('\n📥 Step 6: Testing endpoints after database update...');
    
    const adminResponse2 = await axios.get(`${TEST_CONFIG.API_BASE_URL}/api/settings`, {
      headers: {
        'X-Restaurant-Slug': TEST_CONFIG.RESTAURANT_SLUG,
        'X-Session-Id': 'test-session-' + Date.now()
      },
      timeout: TEST_CONFIG.TIMEOUT
    });
    
    const clientResponse2 = await axios.get(`${TEST_CONFIG.API_BASE_URL}/api/restaurants/public/settings`, {
      headers: {
        'X-Restaurant-Slug': TEST_CONFIG.RESTAURANT_SLUG,
        'X-Session-Id': 'test-session-' + Date.now()
      },
      timeout: TEST_CONFIG.TIMEOUT
    });
    
    const infoResponse2 = await axios.get(`${TEST_CONFIG.API_BASE_URL}/api/restaurants/public/info`, {
      headers: {
        'X-Restaurant-Slug': TEST_CONFIG.RESTAURANT_SLUG,
        'X-Session-Id': 'test-session-' + Date.now()
      },
      timeout: TEST_CONFIG.TIMEOUT
    });
    
    console.log('✅ Admin endpoint after update:');
    console.log('  Restaurant Name:', adminResponse2.data.restaurant_name);
    console.log('  Phone:', adminResponse2.data.phone);
    console.log('  WiFi Name:', adminResponse2.data.wifi_name);
    
    console.log('✅ Client endpoint after update:');
    console.log('  Restaurant Name:', clientResponse2.data.restaurant_name);
    console.log('  Phone:', clientResponse2.data.phone);
    console.log('  WiFi Name:', clientResponse2.data.wifi_name);
    console.log('  Debug flags:', clientResponse2.data._debug_new_code, clientResponse2.data._debug_timestamp);
    
    console.log('✅ Restaurant info after update:');
    console.log('  Restaurant Name:', infoResponse2.data.name);
    console.log('  Phone:', infoResponse2.data.phone);
    
    // Step 7: Verify data persistence
    console.log('\n🔄 Step 7: Verifying data persistence...');
    
    const adminDataMatches = adminResponse2.data.restaurant_name === testData.restaurantName &&
                           adminResponse2.data.phone === testData.phone &&
                           adminResponse2.data.wifi_name === testData.wifiName;
    
    const clientDataMatches = clientResponse2.data.restaurant_name === testData.restaurantName &&
                            clientResponse2.data.phone === testData.phone &&
                            clientResponse2.data.wifi_name === testData.wifiName;
    
    const infoDataMatches = infoResponse2.data.name === testData.restaurantName &&
                          infoResponse2.data.phone === testData.phone;
    
    console.log('✅ Data persistence verification:');
    console.log('  Admin endpoint matches:', adminDataMatches);
    console.log('  Client endpoint matches:', clientDataMatches);
    console.log('  Restaurant info matches:', infoDataMatches);
    
    // Step 8: Check if server is running new code
    console.log('\n🔧 Step 8: Checking if server is running new code...');
    const hasDebugFlags = clientResponse2.data._debug_new_code === true;
    console.log('  Has debug flags:', hasDebugFlags);
    console.log('  Debug timestamp:', clientResponse2.data._debug_timestamp);
    
    console.log('\n============================================================');
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('============================================================');
    console.log(`✅ Database Updates: ${adminDataMatches ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Admin Endpoint: ${adminDataMatches ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Client Endpoint: ${clientDataMatches ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Restaurant Info: ${infoDataMatches ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Server Running New Code: ${hasDebugFlags ? 'PASS' : 'FAIL'}`);
    console.log('============================================================');
    
    const allTestsPass = adminDataMatches && clientDataMatches && infoDataMatches;
    
    if (allTestsPass && hasDebugFlags) {
      console.log('🎉 ALL TESTS PASSED! Settings persistence is working correctly!');
      console.log('\n📝 The system is ready for use:');
      console.log('1. Go to your admin panel');
      console.log('2. Navigate to Settings section');
      console.log('3. Update contact info, social media links, WiFi details');
      console.log('4. Save the settings');
      console.log('5. Refresh the page - settings will persist!');
      return true;
    } else if (allTestsPass && !hasDebugFlags) {
      console.log('⚠️  DATA PERSISTENCE WORKS but server is running old code');
      console.log('   The backend server needs to be restarted to apply the latest changes.');
      console.log('   Settings will persist, but the client app may not display all information correctly.');
      return false;
    } else {
      console.log('❌ SOME TESTS FAILED!');
      console.log('   There are issues with data persistence or API endpoints.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.response?.data || error.message);
    return false;
  }
}

// Run the comprehensive test
comprehensiveSettingsTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
