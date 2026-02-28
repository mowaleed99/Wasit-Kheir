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

        if (!token) return;

        // Get all reports to find one to run a match on
        const reportsRes = await fetch('https://wasitkheir.runasp.net/api/Reports?PageSize=10', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const reportsData = await reportsRes.json();
        const reports = reportsData.data?.items || reportsData.data || [];

        if (reports.length > 0) {
            const reportId = reports[0].id;
            console.log("Found report ID:", reportId);

            // Try to get matches
            const matchRes = await fetch(`https://wasitkheir.runasp.net/api/Matching/${reportId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const matchData = await matchRes.json();
            fs.writeFileSync('test-match-data.json', JSON.stringify(matchData, null, 2));
        } else {
            console.log("No reports found at all.");
        }
    } catch (e) {
        console.error(e);
    }
}

test();
