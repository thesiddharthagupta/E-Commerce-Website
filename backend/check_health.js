const axios = require('axios');

async function checkHealth() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('--- TechMart Final Integration Check ---');

  try {
    const res = await axios.get(`${baseUrl}/auth/me`).catch(e => e.response);
    console.log('Auth Check (expect 401):', res.status);
    
    const products = await axios.get(`${baseUrl}/products`).catch(e => e.response);
    console.log('Products Check (expect 200):', products.status, `(Total: ${products.data?.total})`);

    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: 'test@invalid.com',
      password: 'wrongpassword'
    }).catch(e => e.response);
    console.log('Login Validation Check (expect 401):', loginRes.status, loginRes.data?.message);

  } catch (err) {
    console.error('Check failed:', err.message);
  }
}

checkHealth();
