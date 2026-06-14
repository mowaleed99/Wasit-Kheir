import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { usePostApiNotificationsRegisterDevice } from "@/api/generated/notifications/notifications";
import { getAuthToken, removeAuthToken } from "@/api/mutator";
import { requestForToken } from "@/lib/firebase";
import { useUser } from "@/api";

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    data: userData,
    isLoading,
    error,
  } = useUser({
    query: {
      retry: false,
      refetchOnWindowFocus: false,  // Silent refresh interceptor handles token expiry
      refetchOnMount: true,
      // Don't fail on 401 - it's expected when not logged in
      throwOnError: false,
    },
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { mutate: registerDeviceToken } = usePostApiNotificationsRegisterDevice();

  useEffect(() => {
    console.log("AuthContext - userData:", userData, "error:", error, "isLoading:", isLoading);
    if (userData) {
      const userObj = (userData as any)?.data || userData;
      console.log("Setting user:", userObj);
      // Only set authenticated if we actually have user data
      if (userObj && (userObj.id || userObj.email)) {
        setUser(userObj);
        setIsAuthenticated(true);

        // Register device for push notifications
        requestForToken().then((token) => {
          if (token) {
            registerDeviceToken({ data: { token, platform: "web" } });
          }
        }).catch(err => console.error("Push registration error:", err));

      } else {
        console.log("User data exists but invalid, setting not authenticated");
        setUser(null);
        setIsAuthenticated(false);
      }
    } else if (error) {
      console.log("Auth error, setting not authenticated. Error:", error);
      // Check if it's a 401 (unauthorized) - that's expected when not logged in
      // Only treat as error if it's not a 401
      const errorResponse = (error as any)?.response;
      const status = errorResponse?.status;
      
      if (status === 401 || status === 403) {
        console.log(`${status} error - user not authenticated`);
        setUser(null);
        setIsAuthenticated(false);
        removeAuthToken();
      } else {
        // Other errors might be network issues. Don't drop session if we have a token!
        console.log("Non-401 error, keeping session if token exists. Error:", error);
        const hasToken = !!getAuthToken();
        if (hasToken && !isAuthenticated) {
           // We have a token but couldn't fetch user due to network/500 error.
           // Keep them "authenticated" so the app doesn't kick them to login screen.
           setIsAuthenticated(true);
        } else if (!hasToken) {
           setUser(null);
           setIsAuthenticated(false);
        }
      }
    } else if (!isLoading && !userData) {
      // Only set to not authenticated if we're done loading and have no data, AND no token exists
      const hasToken = !!getAuthToken();
      if (!hasToken) {
          console.log("No user data, not loading, and no token. Setting not authenticated.");
          setUser(null);
          setIsAuthenticated(false);
      } else if (!isAuthenticated) {
          // Token exists, maybe waiting for retry or hydration
          setIsAuthenticated(true);
      }
    }
  }, [userData, error, isLoading, isAuthenticated]);


  const logout = () => {
    // Clear the JWT token from localStorage
    removeAuthToken();
    // Clear any cookies as well (in case there are any)
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
