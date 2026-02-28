import fs from 'fs';

async function test() {
    try {
        const loginRes = await fetch('https://wasitkheir.runasp.net/api/Auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'lost.found2026@gmail.com',
                password: 'LostFound122456#msad4a!22ma'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData?.data?.accessToken;

        if (!token) {
            console.error('No token found in response:', loginData);
            return;
        }

        const sessionsRes = await fetch('https://wasitkheir.runasp.net/api/chat/sessions', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const sessionsData = await sessionsRes.json();
        fs.writeFileSync('test-chat-sessions.json', JSON.stringify(sessionsData, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
