const axios = require('axios');

async function simpleSettingsTest() {
  console.log('🧪 SIMPLE SETTINGS SAVE TEST');
  console.log('============================================================');
  
  try {
    // Step 1: Login and get token
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('  User:', loginResponse.data.user.name);
    console.log('  Restaurant ID:', loginResponse.data.user.restaurant_id);
    
    // Step 2: Test simple settings save
    console.log('\n💾 Step 2: Testing simple settings save...');
    const simpleSettings = {
      restaurantName: 'Simple Test Restaurant',
      phone: '+9999999999',
      email: 'simple@test.com'
    };
    
    console.log('Sending settings:', simpleSettings);
    
    const saveResponse = await axios.post('http://localhost:5000/api/settings', simpleSettings, {
      headers: {
        'Content-Type': 'application/json',
        'X-Restaurant-Slug': 'admin2',
        'X-Session-Id': 'test-session-' + Date.now(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Save response:');
    console.log('  Status:', saveResponse.status);
    console.log('  Message:', saveResponse.data.message);
    
    // Step 3: Verify the save
    console.log('\n📥 Step 3: Verifying the save...');
    const verifyResponse = await axios.get('http://localhost:5000/api/settings', {
      headers: {
        'X-Restaurant-Slug': 'admin2',
        'X-Session-Id': 'test-session-' + Date.now()
      }
    });
    
    console.log('✅ Verification:');
    console.log('  Restaurant Name:', verifyResponse.data.restaurant_name);
    console.log('  Phone:', verifyResponse.data.phone);
    console.log('  Email:', verifyResponse.data.email);
    
    // Check if data matches
    const matches = verifyResponse.data.restaurant_name === simpleSettings.restaurantName &&
                   verifyResponse.data.phone === simpleSettings.phone &&
                   verifyResponse.data.email === simpleSettings.email;
    
    console.log('\n============================================================');
    console.log('📊 SIMPLE TEST RESULTS');
    console.log('============================================================');
    console.log(`✅ Settings Save: ${saveResponse.status === 200 ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Data Persistence: ${matches ? 'PASS' : 'FAIL'}`);
    console.log('============================================================');
    
    if (saveResponse.status === 200 && matches) {
      console.log('🎉 SIMPLE TEST PASSED! Admin panel settings save is working!');
      return true;
    } else {
      console.log('❌ SIMPLE TEST FAILED!');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Run the test
simpleSettingsTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });

