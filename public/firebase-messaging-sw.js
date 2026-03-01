importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

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
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.jpg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
