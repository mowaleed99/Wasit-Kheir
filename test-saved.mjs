import fs from 'fs';

async function test() {
    try {
        const loginData = JSON.parse(fs.readFileSync('test-chat-login.json', 'utf8'));
        const token = loginData.data?.token || loginData.token || loginData.data?.accessToken;

        const url = 'https://wasitkheir.runasp.net/api/Users/me/saved-reports';
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response Text:", text);
    } catch (e) {
        console.error(e);
    }
}
test();