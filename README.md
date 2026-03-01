<div align="center">
  <img src="public/logo.jpg" alt="Waseet Kheir Logo" width="150" height="auto" />
  
  # وسيط خير - Waseet Kheir
  
  **A smart platform utilizing Artificial Intelligence to reunite lost items and missing persons with their families.**  
  **منصة ذكية تعتمد على الذكاء الاصطناعي لجمع المفقودات والأشخاص المفقودين بذويهم.**
</div>

<br />

## 📑 Table of Contents (جدول المحتويات)

1. [About The Project](#-about-the-project)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [Installation & Setup](#-installation--setup)
5. [Usage Guide](#-usage-guide)
6. [Screenshots & UI Overview](#-screenshots--ui-overview)
7. [Contributing](#-contributing)
8. [License & Credits](#-license--credits)

---

## 📖 About The Project

**Waseet Kheir (وسيط خير)** is a comprehensive community-driven application designed to help people find lost belongings and missing persons. By leveraging advanced AI matching algorithms (including facial recognition technology), the platform intelligently connects individuals who have found an item/person with those who have reported them missing.

---

## ✨ Key Features

*   🔍 **Lost Items Matching:** Instantly compares newly found items with existing lost item reports using intelligent property matching.
*   👤 **Lost Persons Matching (Face Verification):** Utilizes cutting-edge AI (like FaceNet) to verify and match photos of missing persons.
*   🤖 **AI Matching System:** Click "Run AI Match" on any report to find the most probable connections based on historical database records.
*   🔔 **Notifications System:** Real-time in-app alerts and Firebase Cloud Messaging (FCM) push notifications keep you updated on report matches and approvals.
*   🔖 **Saved Reports:** Bookmark interesting or relevant reports to view them later in your personalized "Saved Reports" dashboard.
*   🛡️ **Admin Dashboard:** A comprehensive moderation control panel allowing administrators to Approve, Reject, Flag, or Archive user reports, manage the category taxonomy, and oversee user accounts.
*   ⚙️ **User Profile Management:** Customize user details, review personal reporting history, and manage secure authentication.

---

## 🛠️ Tech Stack

### Frontend (Client-side)
*   **Framework:** React 18, TypeScript, Vite
*   **State Management & Data Fetching:** React Query (TanStack Query v5)
*   **Styling:** TailwindCSS, Radix UI Primitives
*   **Routing:** React Router DOM v6
*   **API Client Generation:** Orval (OpenAPI/Swagger to TypeScript)

### Backend (Server-side)
*   **Framework:** C# / ASP.NET Core
*   **Database:** SQL Server / Entity Framework Core
*   **AI Integration:** Python-based FaceNet models / Custom matching heuristics
*   **Push Notifications:** Firebase Cloud Messaging (FCM) API

---

## 🚀 Installation & Setup

Follow these steps to get a development environment running locally.

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/mowaleed99/Wasit-Kheir.git
cd Wasit-Kheir
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure your environment variables:
```env
# API URL (Local or Production)
VITE_API_URL=https://wasitkheir.runasp.net

# Optional: Mapbox setup (if geolocation features are used)
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

*Note: The Firebase SDK is configured in `src/lib/firebase.ts` and `public/firebase-messaging-sw.js`. Ensure the Firebase config details match your active Firebase project.*

### 4. Start the Development Server
```bash
npm run dev
# or
yarn dev
```
The application will be accessible at `http://localhost:5173`.

---

## 💡 Usage Guide

### 🧑‍💻 End Users
1.  **Authentication:** Navigate to `/login` or `/signup` to authenticate. The homepage and features are guarded by a `<ProtectedRoute>`.
2.  **Creating a Report:** Click the `+ Create Report` button. Select whether the item is "Lost" or "Found", fill in the details, subcategories, and upload images.
3.  **AI Matching:** Open any report you own and click the "Run Match" button. The backend will process the data and display similar matching reports in a dedicated UI tab.
4.  **Saving Reports:** Click the `Bookmark / Save` icon on any report card to add it to your `Saved Reports` page.
5.  **Notifications:** Check the Bell icon in the Navigation bar for real-time updates when an admin approves your report or when an AI Match is detected.

### 🛡️ Administrators
1.  **Dashboard Access:** Log in with an Admin account to see the `Admin Dashboard` link in the sidebar or navbar.
2.  **Reports Moderation:** Navigate to `/admin/reports` to see tabs for `Pending`, `Approved`, `Rejected`, `Flagged`, and `Archived` reports. Approve incoming user reports to make them public.
3.  **User Management:** Navigate to `/admin/users` to manually verify users or create entirely new Admin accounts.
4.  **Categories Taxonomy:** Navigate to `/admin/categories` to manage the Master Categories and Subcategories dropdowns that users select during report creation.

---

## 📸 Screenshots & UI Overview

*(Replace the placeholder links below with actual image paths once they are uploaded to the repository)*

### Home Feed
![Home Feed Placeholder](https://via.placeholder.com/800x450.png?text=Home+Feed+%28List+of+Reports%29)

### Report Details & AI Match
![AI Matching Placeholder](https://via.placeholder.com/800x450.png?text=Report+Details+and+AI+Matches)

### Admin Panel Analytics
![Admin Dashboard Placeholder](https://via.placeholder.com/800x450.png?text=Admin+Dashboard+with+Statistics)

### Push Notifications
![Notifications Placeholder](https://via.placeholder.com/800x450.png?text=In-app+and+Push+Notifications+Center)

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License & Credits

Distributed under the MIT License. See `LICENSE` for more information.

**Acknowledgments:**
*   Thanks to the developers of React Query and Vite for seamless frontend tooling.
*   Special thanks to the Open Source Computer Vision community for Face Verification insights.
