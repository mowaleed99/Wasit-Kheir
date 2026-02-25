import { testPost } from './test_vercel_proxy.mjs';

async function run() {
    // Attempt to start a chat with userId=1 (or some other ID for test)
    console.log("Testing POST /api/chat/sessions/1");
    await testPost('/api/chat/sessions/1');
}

run();
