const axios = require('axios');

async function testFlow() {
  const baseUrl = 'http://localhost:5000/api';
  const testEmail = 'tester' + Math.floor(Math.random() * 10000) + '@example.com';
  
  console.log('--- Testing Registration Flow ---');
  try {
    const regRes = await axios.post(`${baseUrl}/auth/register`, {
      name: 'Tester Bot',
      email: testEmail,
      password: 'password123'
    }).catch(e => e.response);
    
    console.log('Registration Status:', regRes.status, regRes.data?.message);
    
    console.log('\n--- Testing Login with Correct Password (should trigger 2FA) ---');
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: testEmail,
      password: 'password123'
    }).catch(e => e.response);
    
    console.log('Login Status:', loginRes.status);
    console.log('Login Data:', JSON.stringify(loginRes.data, null, 2));

  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testFlow();
