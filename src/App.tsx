import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { CategoryFilterProvider } from "./context/CategoryFilterContext";
import { ThemeProvider } from "./context/ThemeContext";

import { HomeLayout } from "./components/layout/HomeLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Verify } from "./pages/Verify";
import { Home } from "./pages/Home";
import { ChatPage } from "./pages/ChatPage";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { Notifications } from "./pages/Notifications";
import { CreateReportPage } from "./pages/CreateReportPage";
import { ReportDetails } from "./pages/ReportDetails";
import { UserProfile } from "./pages/UserProfile";
import { SearchPage } from "./pages/SearchPage";
import { NearbyPage } from "./pages/NearbyPage";
import { SavedReports } from "./pages/SavedReports";
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminReports } from "./pages/admin/AdminReports";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { AdminScraper } from "./pages/admin/AdminScraper";
import { Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./i18n";
import "./styles/globals.css";
import { queryClient } from "./api";

const router = createBrowserRouter([
  // Public routes that use HomeLayout
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <div>Error</div>,
    children: [
      {
        path: "report/:id",
        element: <ReportDetails />,
      },
    ],
  },
  // Protected routes that use HomeLayout
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <HomeLayout />
      </ProtectedRoute>
    ),
    errorElement: <div>Error</div>,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "chat/:sessionId",
        element: <ChatPage />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "profile/:id",
        element: <UserProfile />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "create-report",
        element: <CreateReportPage />,
      },
      {
        path: "user/:userId",
        element: <UserProfile />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "nearby",
        element: <NearbyPage />,
      },
      {
        path: "saved-reports",
        element: <SavedReports />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="reports" replace /> },
      { path: "reports", element: <AdminReports /> },
      { path: "users", element: <AdminUsers /> },
      { path: "categories", element: <AdminCategories /> },
      { path: "scraper", element: <AdminScraper /> },
    ]
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/verify", element: <Verify /> },
]);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="wasit-kheir-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SettingsProvider>
              <CategoryFilterProvider>
                <RouterProvider router={router} />
              </CategoryFilterProvider>
            </SettingsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );

}

export default App;
