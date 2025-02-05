/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_AUTH0_AUDIENCE: string;
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly SENDGRID_API_KEY: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_ENVIRONMENT: 'development' | 'staging' | 'production';
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_MOCK_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  glob: (pattern: string) => Record<string, unknown>;
  globEager: (pattern: string) => Record<string, unknown>;
}

// Add Node.js types
declare namespace NodeJS {
  interface ProcessEnv extends ImportMetaEnv {}
  interface Timeout {}
}

// Add module declarations
declare module 'axios' {
  export interface AxiosRequestConfig {
    signal?: AbortSignal;
  }
}

declare module 'zustand' {
  export function create<T>(fn: (set: Function, get: Function) => T): (selector?: (state: T) => any) => T;
}

declare module 'msw/node' {
  export function setupServer(...handlers: any[]): any;
}

// Utility type for environment variables
type EnvVar<T> = T | undefined;

// Environment variable validation
export const validateEnv = (): void => {
  const required: (keyof ImportMetaEnv)[] = [
    'VITE_API_URL',
    'VITE_WS_URL',
    'VITE_ENVIRONMENT'
  ];

  const missing = required.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};
