import axios, { AxiosRequestConfig } from "axios";

// Always use relative paths - proxy handles routing in both dev (Vite) and prod (Vercel)
const getBaseURL = () => {
  return "";
};

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  // Removing withCredentials because the app uses Bearer tokens. 
  // Sending cookies (especially Vercel proxy cookies) confuses the ASP.NET Core authentication middleware causing 401s.
  timeout: 120000, // 120 seconds — AI endpoints can be slow due to Modal cold starts
});

// Token storage
export const getAuthToken = () => localStorage.getItem("authToken");
export const setAuthToken = (token: string) => {
  localStorage.setItem("authToken", token);
};
export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
};
export const getRefreshToken = () => localStorage.getItem("refreshToken");
export const setRefreshToken = (token: string) => {
  localStorage.setItem("refreshToken", token);
};

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method?.toUpperCase(), config.url);

    // Add Authorization header with Bearer token if available
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added Authorization header with token");
    }

    // Increase timeout for scraper endpoints since they can take several minutes
    if (config.url?.includes('/api/scraper/run')) {
      config.timeout = 300000; // 5 minutes
    }

    // Increase timeout for AI endpoints — Modal container may have a cold start
    if (config.url?.includes('/api/ai/')) {
      config.timeout = 180000; // 3 minutes
    }

    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Track if a refresh is already in flight to avoid multiple simultaneous refreshes
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Add response interceptor for better error handling and token extraction
apiClient.interceptors.response.use(
  (response) => {
    // Check if this is a login/google response and extract tokens
    const url = response.config.url || '';
    const method = response.config.method;
    const isAuthResponse =
      (url.includes('/api/auth/login') || url.includes('/api/auth/google')) &&
      method === 'post';

    if (isAuthResponse) {
      console.log("Auth response detected, checking for tokens...");
      const responseData = response.data;
      const data = responseData?.data || responseData;

      if (data?.accessToken) {
        console.log("Token found in auth response, storing it");
        setAuthToken(data.accessToken);
      }
      if (data?.refreshToken) {
        console.log("Refresh token found, storing it");
        setRefreshToken(data.refreshToken);
      }
    }

    return response;
  },
  async (error) => {
    console.error("API Response Error:", error);

    const originalRequest = error.config;

    // If we get a 401 and haven't already retried, attempt a token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken();

      // No refresh token available — clear session and reject
      if (!refreshToken) {
        console.log("401 Unauthorized and no refresh token — clearing session");
        removeAuthToken();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Another refresh is in flight — queue this request
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("Attempting silent token refresh...");
        const res = await apiClient.post('/api/auth/refresh-token', { refreshToken });
        const data = res.data?.data || res.data;
        const newAccessToken = data?.accessToken;
        const newRefreshToken = data?.refreshToken;

        if (newAccessToken) {
          setAuthToken(newAccessToken);
          if (newRefreshToken) setRefreshToken(newRefreshToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          onRefreshed(newAccessToken);
          console.log("Token refreshed silently ✅");
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } else {
          throw new Error("No access token in refresh response");
        }
      } catch (refreshError) {
        console.log("Token refresh failed — clearing session");
        removeAuthToken();
        refreshSubscribers = [];
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.code === "ECONNABORTED") {
      error.message = "Request timeout. Please check your internet connection.";
    } else if (error.message === "Network Error") {
      error.message = "Network error. Please check if the server is running and accessible.";
    }
    return Promise.reject(error);
  }
);


export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();

  // If the payload is already FormData, strip the hardcoded Content-Type header so Axios can inject the boundary string.
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  } else if (config.data instanceof URLSearchParams) {
    // URLSearchParams is used for form-urlencoded endpoints (e.g. /api/ai/search-text, /api/ai/add-text)
    // Axios handles it correctly — just ensure the Content-Type is set properly
    if (config.headers) {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
  } else if (config.data && typeof config.data === 'object') {
    const hasFiles = Object.values(config.data).some(value => {
      if (Array.isArray(value)) {
        return value.some(item => item instanceof File || item instanceof Blob);
      }
      return value instanceof File || value instanceof Blob;
    });

    if (hasFiles) {
      console.log("=== MUTATOR: Detected files in request, constructing FormData ===");
      console.log("Original data:", config.data);

      const formData = new FormData();

      Object.entries(config.data).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          console.log(`Skipping ${key}: value is`, value);
          return; // Skip undefined/null values
        }

        if (Array.isArray(value)) {
          console.log(`Processing array field '${key}' with ${value.length} items`);
          // Handle arrays (like Photos)
          value.forEach((item, index) => {
            if (item instanceof File || item instanceof Blob) {
              const fileName = item instanceof File ? item.name : 'blob';
              console.log(`  - Appending file ${index}:`, fileName, item.size, 'bytes');
              formData.append(key, item);
            } else {
              console.log(`  - Appending value ${index}:`, item);
              formData.append(key, String(item));
            }
          });
        } else if (value instanceof File || value instanceof Blob) {
          const fileName = value instanceof File ? value.name : 'blob';
          console.log(`Appending file '${key}':`, fileName, value.size, 'bytes');
          formData.append(key, value);
        } else {
          console.log(`Appending field '${key}':`, value);
          formData.append(key, String(value));
        }
      });

      console.log("FormData constructed, entries:");
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}:`, pair[1]);
      }

      config.data = formData;
      // Don't set Content-Type header - let axios set it with boundary
      delete config.headers?.['Content-Type'];
      console.log("=== MUTATOR: FormData ready, removed Content-Type header ===");
    }
  }

  const promise = apiClient({ ...config, cancelToken: source.token }).then(
    ({ data }) => data
  ) as Promise<T> & { cancel: () => void };

  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};
