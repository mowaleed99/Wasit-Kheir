# Agent Handoff Report

**Project**: Wasit-Kheir
**Last Updated**: June 14, 2026 — Session 9

This document is intended for any future AI agents or developers picking up this codebase. It outlines the most recent major updates, critical architectural quirks, and where we stopped.

---

## 1. Recent API Updates & Code Generation Quirks
The project uses `orval` to auto-generate React Query hooks and Axios clients from the backend's `swagger.json` (`npm run generate:api`).

*   **New Endpoints Added**: The backend recently introduced a suite of AI endpoints (`/api/ai/*`) for Image Search, Face Match, and Multimodal text+image search, as well as scraping endpoints and admin user deletion.
*   **CRITICAL GENERATION BUG**:
    When you run `npm run generate:api`, Orval incorrectly generates `FormData.append()` logic for array parameters. Specifically, in `src/api/generated/reports/reports.ts`, the `ImageIdsToRemove` loop inside `putApiReportsId` will throw a TypeScript error (`number not assignable to string | Blob`).
    **Fix**: Cast it using `as any`: `formData.append('ImageIdsToRemove', value as any)`. Re-apply this fix every time you regenerate!

*   **Scraper Run Params Shape**: `usePostApiScraperRun` takes `{ params?: PostApiScraperRunParams }` -- the params are **nested inside a `params` key**, not spread at the top level. Always call it as `runScraper({ params: { group_url, limit } }, ...)`.

---

## 2. Bug Fixes Applied
*   **Desktop Infinite Scroll**: Fixed in `src/pages/Home.tsx`. The `HomeLayout.tsx` scrollable container has `id="scrollable-feed"` and `InfiniteScroll` uses `scrollableTarget="scrollable-feed"`.
*   **AdminScraper TS Error**: Fixed wrong pagination params (`Page`/`PageSize` to `limit`/`offset`) to match `GetApiScraperPostsParams`.

---

## 3. Completed Features

### Phase 1-3 (Previous Sessions)
*   Fixed PC infinite scroll on Home.
*   4-mode `SearchPage.tsx` (Standard / AI Image / Face Match / Multimodal).
*   `AiReportCard.tsx` for N+1-free AI result rendering.

### Phase 4 -- Admin Dashboard Ecosystem
All admin pages fully redesigned with a **dark slate/stone + amber** premium aesthetic.

| File | What Changed |
|---|---|
| `src/components/layout/AdminLayout.tsx` | **Horizontal top nav bar** -- fixed at top, never scrolls. Dark `stone-950` background. Mobile drawer. No more sidebar or floating glassmorphism bar. |
| `src/pages/admin/AdminReports.tsx` | Premium dark-header metrics cards, full report table with actions. |
| `src/pages/admin/AdminUsers.tsx` | Card list view, status badges, **Verify User** + **Delete User** buttons per row. |
| `src/pages/admin/AdminCategories.tsx` | Interactive collapsible taxonomy tree for categories/subcategories. |
| `src/pages/admin/AdminScraper.tsx` | New page: displays scraped items grid. "Trigger Scraper Job" opens a warning modal with **Group URL** and **Post Limit** inputs before running. |

### Phase 5 -- Previous Session
| Feature | Files | Notes |
|---|---|---|
| **Scraper Modal Inputs** | `AdminScraper.tsx` | Modal now has `group_url` and `limit` fields matching `PostApiScraperRunParams`. |
| **Delete User** | `AdminUsers.tsx` | `useDeleteApiAdminUsersId` integrated. Red Trash icon button per user row, with `window.confirm` guard. Invalidates `/api/Users` on success. |
| **Google Sign-In (attempted)** | `src/hooks/useGoogleAuth.ts` (NEW), `LoginForm.tsx`, `SignupForm.tsx` | Hook created. Button removed from UI -- see blockers below. |
| **Admin Nav Redesign** | `AdminLayout.tsx` | Fixed horizontal top bar (`h-16`, `bg-stone-950`). Inline nav links. Mobile hamburger + slide-in drawer. |

### Phase 6 -- Previous Session (Firebase Auth & Auth UI Redesign)

| What | Files | Notes |
|---|---|---|
| **Firebase Auth shared instance** | `src/lib/firebase.ts` | Added `getAuth()` + `GoogleAuthProvider`. Now exports `auth` and `googleProvider`. |
| **Refactored `useGoogleAuth`** | `src/hooks/useGoogleAuth.ts` | Removed duplicate `firebaseConfig`. Uses `GoogleAuthProvider.credentialFromResult()`. |
| **Google Sign-In removed from UI** | `LoginForm.tsx`, `SignupForm.tsx` | Kept hook, but removed button from UI until backend mismatch is fixed. |
| **Auth Pages Redesign** | `Login.tsx`, `Signup.tsx`, `LoginForm.tsx`, `SignupForm.tsx` | Redesigned the authentication flow to a premium Split-Screen layout. Minimal, light-mode friendly form with Indigo accents. |

### Phase 7 -- This Session (Admin Dashboard UI Polish)

| What | Files | Notes |
|---|---|---|
| **SaaS Minimal Aesthetic** | All `Admin*.tsx` pages | Completely replaced the dark stone/amber gradient look with a minimal Light/Dark mode SaaS aesthetic. Indigo primary colors (`indigo-600`), gray backgrounds, rounded sleek borders (`rounded-xl`), and modern segmented tabs. |
| **Responsive Top Bar** | `AdminLayout.tsx` | Minimal top bar, hidden sidebar on mobile (drawer), aligned with modern React/Tailwind SaaS templates. |
| **Modern Cards & Tables** | `AdminDashboard.tsx`, `AdminReports.tsx`, `AdminUsers.tsx`, `AdminCategories.tsx`, `AdminScraper.tsx` | Replaced floating elements and neon shadows with clean card layouts, discrete action buttons, and clear typography. Dark mode is handled via `dark:` variants. |

### Phase 8 -- This Session (Translation Expansion)
| Feature | Files | Notes |
|---|---|---|
| **Admin Pages Translations** | All `Admin*.tsx` pages | Replaced hardcoded english text with `t()` translation keys for full localization. |
| **Language Files Updated** | `ar.json`, `en.json` | Added missing translation keys under the `"admin"` scope (sidebar, dashboard, users, etc). |
| **Language Toggle Added** | `AdminLayout.tsx` | Added a button to change language between Arabic/English in the top nav (desktop) and side drawer (mobile). |

### Phase 9 -- This Session (UI Polish, Logout UX, Bug Fixes)

| What | Files | Notes |
|---|---|---|
| **App Logo in Admin Panel** | `AdminLayout.tsx` | Replaced the indigo "W" letter placeholder with the actual app logo (`/logo2.png`) in both the desktop top-bar and mobile drawer header. Removed unused `LayoutDashboard` import that was causing a Vercel build failure (`TS6133`). |
| **AiReportCard Refactor** | `src/components/reports/AiReportCard.tsx` | Simplified: now passes `aiScore` directly as a prop to `ReportCard` instead of wrapping it in an extra `<div>` with an absolute-positioned badge. |
| **ReportCard AI Score Badge** | `src/components/reports/ReportCard.tsx` | Added `aiScore?: number` prop. AI Match badge is now rendered inline next to the type badge. Removed lifecycle status display and subcategory tag (`subCategoryName`) from the card footer. |
| **Easy Logout — User Navbar** | `src/components/layout/Navbar.tsx` | Avatar click now opens a dropdown menu showing user name, email, a **Profile** link, and a red **Log out** button. Dropdown closes on outside click or `Escape`. |
| **Easy Logout — Admin Panel** | `src/components/layout/AdminLayout.tsx` | Added a **Log out** button (red, with `LogOut` icon) in the desktop top-bar (next to "Back to App") and in the mobile drawer footer. Uses `useAuth().logout()`. |
| **Dropdown Overflow Fix (1)** | `src/components/layout/Navbar.tsx` | Switched dropdown from `position: absolute` to `position: fixed` (anchored via `getBoundingClientRect()`) to prevent any horizontal page overflow when the menu opens. |
| **Dropdown Overflow Fix (2) — RTL** | `src/components/layout/Navbar.tsx` | In Arabic/RTL mode the avatar sits on the **left** side of the navbar. The old `right: window.innerWidth - rect.right` calculation produced a huge value that pushed the dropdown off-screen, causing a horizontal scrollbar. Fixed by detecting RTL (`document.documentElement.dir === "rtl"`) and switching to `left: rect.left` anchoring instead. |

### Phase 10 -- This Session (Auth Flows & Full API Integration)

| What | Files | Notes |
|---|---|---|
| **Forgot & Reset Password** | `ForgotPassword.tsx`, `ResetPassword.tsx`, `App.tsx` | Created new pages for the full password recovery flow. Added a link to the forgot password page in `LoginForm.tsx`. |
| **Settings Auth Actions** | `Settings.tsx` | Integrated `usePostApiAuthChangePassword`, `usePostApiAuthChangeEmailRequest`, `usePostApiAuthChangeEmailConfirm`, and `useDeleteApiAuthDeleteAccount`. Added collapsible sections for each action, including a 2-step flow for email change and a danger zone for account deletion. |
| **Chat Connection** | `ReportDetails.tsx` | Added a "Chat about Report" button for non-owners using `usePostApiChatConnectPostId`, allowing users to link a new chat session to a specific report context. |
| **Report Interaction Modals** | `ReportDetails.tsx`, `components/reports/` | Refactored report actions (Edit, Report Abuse, Update Status) into dedicated UI modals. Integrated "I'm Interested" (`usePostApiReportsIdInterested`). |
| **Admin Reports Edit** | `AdminReports.tsx` | Integrated the newly created `EditReportModal` into the admin reports table so admins can edit posts directly. |
| **Global Scrollbar Cleanup** | `globals.css` | Added `@layer utilities { .no-scrollbar { ... } }` and fixed HSL color syntax warnings. |

### Phase 11 -- This Session (Browser Dialog Migration)

| What | Files | Notes |
|---|---|---|
| **Global Dialog & Toast** | `DialogContext.tsx`, `Toaster.tsx`, `App.tsx` | Added Sonner for toasts and built a custom `useAppDialog` context that provides an async `confirm()` and `prompt()` UI, replacing the browser native `window.confirm`, `window.alert`, and `window.prompt`. |
| **Admin Panel Migration** | `AdminCategories.tsx`, `AdminUsers.tsx` | Migrated native `window.prompt` (for adding categories) and `window.confirm` (for deleting items and users) to `useAppDialog`'s async methods. |
| **Settings Migration** | `Settings.tsx` | Replaced `window.confirm` with `useAppDialog().confirm` for Account Deletion, and swapped all `alert()` calls for `toast.success`/`toast.error`. |
| **Toast Conversions** | `ReportDetails.tsx`, `NearbyPage.tsx`, `UserProfile.tsx`, `MapPicker.tsx`, `ResetPassword.tsx`, `ForgotPassword.tsx`, `VerifyEmail.tsx`, `ReportAbuseModal.tsx`, `EditProfileModal.tsx` | Mass replaced all `alert()` usages across pages and modals with modern `toast()` notifications for better UX. |

---

## 4. Architecture & Key Files

### Auth
- `src/context/AuthContext.tsx` -- main auth state. Reads user from `/api/Users/me`.
- `src/api/index.ts` -- exports `useLogin`, `queryClient`, etc.
- `src/hooks/useGoogleAuth.ts` -- Firebase Google popup → backend `/api/auth/google`. **NOT used in UI** -- kept for future use once the backend is fixed.
- `src/lib/firebase.ts` -- shared Firebase app. Exports `messaging`, `auth`, `googleProvider`.

### Admin
- All admin pages live in `src/pages/admin/`.
- Admin routes are registered in `src/App.tsx` under `/admin/*` wrapped in `ProtectedRoute`.
- The `useDeleteApiAdminUsersId` and `useDeleteApiAdminReportsId` hooks are in `src/api/generated/admin/admin.ts`.
- **Note**: The entire generated Admin API (Reports, Users, Categories, Scraper) is now 100% integrated and actively used in the UI.

### Scraper
- `src/api/generated/scraper/scraper.ts` -- `useGetApiScraperPosts` and `usePostApiScraperRun`.
- `PostApiScraperRunParams` = `{ limit?: number; group_url?: string }`.
- `GetApiScraperPostsParams` = `{ type?: string; limit?: number; offset?: number }`.

### Styling
- Global: Tailwind + `src/styles/globals.css`.
- Admin design system: SaaS-style light/dark minimal aesthetic.
- Auth pages: indigo/purple gradient background with glassmorphic white card.

---

## 5. Known Pending Items / Blockers

1.  **Google Sign-In is blocked -- backend misconfiguration.**
    The backend (`wasitkheir.runasp.net`) is an ASP.NET API originally built for Flutter clients. Its `GoogleAuth:ClientId` in `appsettings.json` is configured for a Flutter/Android OAuth client, NOT the Firebase Web Client ID.

    The Firebase Web Client ID the frontend sends (token audience `aud`):
    ```
    671286897310-3tt9a0pvkn903ecs0a6g1gjg1ikc6eup.apps.googleusercontent.com
    ```
    Backend returns `401 "Invalid Google ID token"` because the audience does not match.

    **To fix**: Ask the backend developer to update `appsettings.json`:
    ```json
    "GoogleAuth": {
      "ClientId": "671286897310-3tt9a0pvkn903ecs0a6g1gjg1ikc6eup.apps.googleusercontent.com"
    }
    ```
    Once fixed, re-enable the Google button by importing `useGoogleAuth` back into `LoginForm.tsx` and `SignupForm.tsx` -- the hook is fully written and ready.

2.  **Re-apply FormData `as any` fix after any `npm run generate:api` run.**
    File: `src/api/generated/reports/reports.ts`, line with `ImageIdsToRemove.forEach(...)`.

---

## 6. What To Work On Next (Suggestions)

- [ ] Contact backend developer → fix `GoogleAuth:ClientId` → re-enable Google Sign-In button.
- [ ] Add pagination to the Scraper page (currently fetches first 50 with `offset: 0`).
- [ ] Consider adding an admin-only route guard that checks `user.role === 'Admin'` rather than just `isAuthenticated`.
- [ ] The `ReportDetails.tsx` "Run AI Match" button is still present -- confirm with user if it should remain.
