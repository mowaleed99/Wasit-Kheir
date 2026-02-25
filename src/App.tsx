import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { CategoryFilterProvider } from "./context/CategoryFilterContext";

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
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminReports } from "./pages/admin/AdminReports";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./i18n";
import "./styles/globals.css";
import { queryClient } from "./api";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <div>Error</div>,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },

      {
        path: "report/:id",
        element: (
          <ProtectedRoute>
            <ReportDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "chat",
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "chat/:sessionId",
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/:id",
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        ),
      },

      {
        path: "create-report",
        element: (
          <ProtectedRoute>
            <CreateReportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "user/:userId",
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "search",
        element: (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "nearby",
        element: (
          <ProtectedRoute>
            <NearbyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
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
        ]
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/verify", element: <Verify /> },
]);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsProvider>
            <CategoryFilterProvider>
              <RouterProvider router={router} />
            </CategoryFilterProvider>
          </SettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );

}

export default App;
