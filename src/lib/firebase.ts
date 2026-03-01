// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyA7-b3_C17VB6s9DrYqIYhIJRABiE4K5eo",
    authDomain: "wasit-kheir.firebaseapp.com",
    projectId: "wasit-kheir",
    storageBucket: "wasit-kheir.firebasestorage.app",
    messagingSenderId: "671286897310",
    appId: "1:671286897310:web:c4a84e37ed0989ebc7e98f",
    measurementId: "G-LRK94PDR60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
    try {
        const currentToken = await getToken(messaging, {
            // Note: Without a VAPID key provided by the user, Firebase Web Push might fail or use a default if configured in the Firebase Console.
            // If a VAPID key is required, pass it as `vapidKey: "YOUR_PUBLIC_VAPID_KEY_HERE"`
            // vapidKey: "" 
        });

        if (currentToken) {
            console.log('FCM Token generated:', currentToken);
            return currentToken;
        } else {
            console.log('No registration token available. Request permission to generate one.');
            return null;
        }
    } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

export { messaging };
