async function testApi() {
    try {
        const loginRes = await fetch('https://wasitkheir.runasp.net/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'lost.found2026@gmail.com',
                password: 'LostFound122456#msad4a!22ma'
            })
        });

        if (!loginRes.ok) {
            console.log('Login failed', loginRes.status);
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData?.data?.accessToken || loginData?.accessToken;
        console.log('Login successful. Token:', token.substring(0, 10) + '...');

        const headers = { Authorization: `Bearer ${token}` };

        const endpoints = [
            '/api/Users/me',
            '/api/Categories/tree',
            '/api/Reports',
            '/api/chat/sessions'
        ];

        for (const ep of endpoints) {
            try {
                const res = await fetch(`https://wasitkheir.runasp.net${ep}`, { headers });
                console.log(`[OK] ${ep} - Status: ${res.status}`);
            } catch (e) {
                console.log(`[FAIL] ${ep} - Status: Network Error - ${e.message}`);
            }
        }
    } catch (error) {
        console.error('Script failed:', error.message);
    }
}

testApi();
