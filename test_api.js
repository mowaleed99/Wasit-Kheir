const axios = require('axios');

async function testApi() {
    try {
        const loginRes = await axios.post('https://wasitkheir.runasp.net/api/auth/login', {
            email: 'lost.found2026@gmail.com',
            password: 'LostFound122456#msad4a!22ma'
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const token = loginRes.data.data ? loginRes.data.data.accessToken : loginRes.data.accessToken;
        console.log('Login successful.');

        const headers = { Authorization: `Bearer ${token}` };

        const endpoints = [
            '/api/Users/me',
            '/api/Categories/tree',
            '/api/Reports',
            '/api/chat/sessions'
        ];

        for (const ep of endpoints) {
            try {
                const res = await axios.get(`https://wasitkheir.runasp.net${ep}`, { headers });
                console.log(`[OK] ${ep} - Status: ${res.status}`);
            } catch (e) {
                console.log(`[FAIL] ${ep} - Status: ${e.response ? e.response.status : 'Network Error'} - ${e.message}`);
            }
        }
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
    }
}

testApi();
