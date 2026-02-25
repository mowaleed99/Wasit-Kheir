import axios, { AxiosRequestConfig } from "axios";

// Use proxy in development, or direct URL in production
const getBaseURL = () => {
  // In development, use empty string to leverage Vite proxy
  if (import.meta.env.DEV) {
    return "";
  }
  // In production, use the environment variable or default
  return import.meta.env.VITE_API_URL || "";
};

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Token storage
export const getAuthToken = () => localStorage.getItem("authToken");
export const setAuthToken = (token: string) => {
  localStorage.setItem("authToken", token);
};
export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
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

    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling and token extraction
apiClient.interceptors.response.use(
  (response) => {
    // Check if this is a login or signup response and extract the token
    const url = response.config.url || '';
    const method = response.config.method;
    const isAuthResponse =
      (url.includes('/api/auth/login') || url.includes('/api/auth/signup')) &&
      method === 'post';

    if (isAuthResponse) {
      console.log("Auth response detected, checking for token...");
      const responseData = response.data;

      // Handle the API response structure: { success, message, data: { user, accessToken, expiresAt }, errors }
      if (responseData?.data?.accessToken) {
        const token = responseData.data.accessToken;
        console.log("Token found in auth response, storing it");
        setAuthToken(token);
      } else if (responseData?.accessToken) {
        // Fallback if token is at root level
        const token = responseData.accessToken;
        console.log("Token found in auth response (root level), storing it");
        setAuthToken(token);
      } else {
        console.warn("Auth response received but no token found:", responseData);
      }
    }

    return response;
  },
  (error) => {
    console.error("API Response Error:", error);

    // If we get a 401, clear the stored token
    if (error.response?.status === 401) {
      console.log("401 Unauthorized - clearing stored token");
      removeAuthToken();
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

  // Handle FormData for file uploads
  if (config.data && typeof config.data === 'object') {
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
