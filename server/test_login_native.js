const http = require('http');

function testLogin(email, password) {
    const data = JSON.stringify({ email, password });
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log(`\nResults for ${email}:`);
            console.log(`Status: ${res.statusCode}`);
            console.log(`Body: ${body}`);
        });
    });

    req.on('error', (error) => {
        console.error(`Error testing ${email}:`, error.message);
    });

    req.write(data);
    req.end();
}

console.log('Testing logins...');
testLogin('admin@hms.com', 'admin123');
testLogin('sarah@hms.com', 'admin123');
testLogin('john@hms.com', 'admin123');
