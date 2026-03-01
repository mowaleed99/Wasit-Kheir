import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useUser } from "@/api";
import { removeAuthToken } from "@/api/mutator";
import { requestForToken } from "@/lib/firebase";
import { usePostApiNotificationsRegisterDevice } from "@/api/generated/notifications/notifications";

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
      refetchOnWindowFocus: true,
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
      if (errorResponse?.status === 401) {
        console.log("401 error - user not authenticated");
        setUser(null);
        setIsAuthenticated(false);
      } else {
        // Other errors might be network issues, but we'll treat as not authenticated
        console.log("Non-401 error, treating as not authenticated");
        setUser(null);
        setIsAuthenticated(false);
      }
    } else if (!isLoading) {
      // Only set to not authenticated if we're done loading and have no data
      console.log("No user data and not loading, setting not authenticated");
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [userData, error, isLoading]);


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
