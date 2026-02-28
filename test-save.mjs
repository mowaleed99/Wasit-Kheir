import fs from 'fs';

async function test() {
    try {
        // 1. Fresh login
        const loginRes = await fetch('https://wasitkheir.runasp.net/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "lost.found2026@gmail.com",
                password: "LostFound122456#msad4a!22ma"
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.data?.token || loginData.token || loginData.data?.accessToken;
        console.log("Got fresh token:", token?.substring(0, 20) + "...");

        // 2. Save report
        const url = 'https://wasitkheir.runasp.net/api/Reports/11/save';
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("POST /save Status:", res.status);
        const text = await res.text();
        console.log("POST /save Response:", text);
    } catch (e) {
        console.error(e);
    }
}
test();
