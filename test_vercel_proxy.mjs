import fetch from 'node-fetch'; // Requires node-fetch or native fetch in Node 18+

const vercelUrl = 'https://wasit-kheir-8xxe-9w1302nwk-mohamedwaleed92004-5766s-projects.vercel.app';
const token = 'YOUR_ADMIN_TOKEN_HERE'; // I will run this with the actual token passed as an env var or replaced

async function testVercelProxy() {
    console.log(`Testing Vercel Proxy at: ${vercelUrl}`);

    const endpoints = [
        '/api/Users/me',
        '/api/Categories/tree',
        '/api/Admin/reports?Status=Pending&PageSize=20&Page=1'
    ];

    for (const endpoint of endpoints) {
        console.log(`\n--- Testing ${endpoint} ---`);
        try {
            const startTime = Date.now();
            const response = await fetch(`${vercelUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`,
                    'Accept': 'application/json',
                    // Simulate a browser request coming from the same origin
                    'Origin': vercelUrl,
                    'Referer': `${vercelUrl}/admin`
                }
            });
            const duration = Date.now() - startTime;

            console.log(`Status: ${response.status} ${response.statusText} (${duration}ms)`);
            console.log(`Headers:`, Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                const data = await response.json();
                console.log(`Success! Data preview:`, typeof data === 'object' ? Object.keys(data) : 'Primitive data');
                if (data && data.success === false) {
                    console.log(`API returned Soft Error:`, data);
                }
            } else {
                const text = await response.text();
                console.log(`Proxy Error/Rejection Body: ${text.substring(0, 200)}`);
            }
        } catch (error) {
            console.error(`Fetch Exception on ${endpoint}:`, error.message);
        }
    }
}

testVercelProxy();
