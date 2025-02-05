import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getCsrfToken, rateLimiter, handleApiError } from '../security';
import { monitoring } from '../monitoring';

// Request deduplication cache
const requestCache = new Map<string, Promise<any>>();
const pendingRequests = new Map<string, AbortController>();

const generateCacheKey = (config: InternalAxiosRequestConfig): string => {
  return `${config.method}-${config.url}-${JSON.stringify(config.params)}-${JSON.stringify(config.data)}`;
};

const clearCacheEntry = (key: string) => {
  requestCache.delete(key);
  pendingRequests.delete(key);
};

export const createApiClient = (): AxiosInstance => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const startTime = Date.now();
      
      // Add request timing to config for response interceptor
      (config as any).startTime = startTime;

      // Check rate limiting
      const endpoint = config.url || '';
      if (!rateLimiter.checkLimit(endpoint)) {
        throw new Error('Too many requests');
      }

      // Request deduplication for GET requests
      if (config.method?.toLowerCase() === 'get') {
        const cacheKey = generateCacheKey(config);
        const cachedRequest = requestCache.get(cacheKey);

        if (cachedRequest) {
          return Promise.resolve(cachedRequest);
        }

        // Create abort controller for the new request
        const controller = new AbortController();
        config.signal = controller.signal;
        pendingRequests.set(cacheKey, controller);

        // Cache the request promise
        const request = api(config).finally(() => clearCacheEntry(cacheKey));
        requestCache.set(cacheKey, request);
        return request;
      }

      // Add CSRF token
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers = {
          ...config.headers,
          'X-CSRF-Token': csrfToken,
        };
      }

      // Add auth token
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      return config;
    },
    (error: AxiosError) => {
      handleApiError(error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      const endTime = Date.now();
      const startTime = (response.config as any).startTime;
      const duration = endTime - startTime;

      // Track API call performance
      monitoring.trackApiCall(
        response.config.url || '',
        response.config.method || 'GET',
        startTime,
        endTime,
        response.status
      );

      // Log slow requests
      if (duration > 1000) {
        monitoring.log('warn', 'Slow API call', {
          url: response.config.url,
          duration,
        });
      }

      return response;
    },
    async (error: AxiosError) => {
      const endTime = Date.now();
      const startTime = (error.config as any)?.startTime || endTime;

      // Track failed API calls
      monitoring.trackApiCall(
        error.config?.url || '',
        error.config?.method || 'GET',
        startTime,
        endTime,
        error.response?.status || 0
      );

      // Handle specific error cases
      if (error.response?.status === 401) {
        // Cancel all pending requests
        pendingRequests.forEach(controller => controller.abort());
        pendingRequests.clear();
        requestCache.clear();

        // Try to refresh token
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post('/api/auth/refresh', {
              refreshToken,
            });
            localStorage.setItem('authToken', response.data.token);
            
            // Retry the original request
            if (error.config) {
              return api(error.config);
            }
          }
        } catch (refreshError) {
          // If refresh fails, redirect to login
          window.location.href = '/login';
        }
      }

      // Handle timeout errors
      if (error.code === 'ECONNABORTED') {
        monitoring.log('error', 'API request timeout', {
          url: error.config?.url,
          timeout: error.config?.timeout,
        });
      }

      // Handle network errors
      if (!error.response) {
        monitoring.log('error', 'Network error', {
          url: error.config?.url,
          message: error.message,
        });
      }

      handleApiError(error);
      return Promise.reject(error);
    }
  );

  return api;
};

// Cleanup function for unmounting
export const cleanup = () => {
  pendingRequests.forEach(controller => controller.abort());
  pendingRequests.clear();
  requestCache.clear();
};

export const api = createApiClient();
