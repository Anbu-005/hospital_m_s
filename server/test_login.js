const axios = require('axios');

async function testLogin(email, password) {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        console.log(`Login successful for ${email}:`, res.data);
    } catch (err) {
        console.error(`Login failed for ${email}:`, err.response?.data || err.message);
    }
}

async function runTests() {
    console.log('Testing Admin Login...');
    await testLogin('admin@hms.com', 'admin123');

    console.log('\nTesting Doctor Login...');
    await testLogin('sarah@hms.com', 'admin123');

    console.log('\nTesting Patient Login...');
    await testLogin('john@hms.com', 'admin123');
}

runTests();
