import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

// CSRF Token management
let csrfToken: string | null = null;

export const setCsrfToken = (token: string) => {
  csrfToken = token;
};

export const getCsrfToken = () => csrfToken;

// Rate limiting on client side
class RateLimiter {
  private requests: { [key: string]: number[] } = {};
  private limit: number;
  private windowMs: number;

  constructor(limit: number = 50, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  checkLimit(key: string): boolean {
    const now = Date.now();
    if (!this.requests[key]) {
      this.requests[key] = [now];
      return true;
    }

    // Clean old requests
    this.requests[key] = this.requests[key].filter(
      time => now - time < this.windowMs
    );

    if (this.requests[key].length >= this.limit) {
      return false;
    }

    this.requests[key].push(now);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

interface ErrorResponse {
  message: string;
  status: number;
}

export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      const message = axiosError.response.data?.message || 'An error occurred';
      
      switch (status) {
        case 401:
          toast.error('Authentication required. Please log in.');
          break;
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('The requested resource was not found.');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Internal server error. Please try again later.');
          break;
        default:
          toast.error(message);
      }
    } else if (axiosError.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred.');
  }
};

// Session management
export const checkSessionExpiry = (): boolean => {
  const expiryTime = localStorage.getItem('sessionExpiry');
  if (!expiryTime) return true;

  return Date.now() > parseInt(expiryTime);
};

export const refreshSession = async (): Promise<void> => {
  try {
    // Implement refresh token logic here
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to refresh session');
    }

    const data = await response.json();
    localStorage.setItem('sessionExpiry', (Date.now() + 30 * 60 * 1000).toString()); // 30 minutes
  } catch (error) {
    console.error('Session refresh failed:', error);
    window.location.href = '/login';
  }
};
