export function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  // Security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CORS headers
  headers.set('Access-Control-Allow-Origin', import.meta.env.VITE_ALLOWED_ORIGINS || '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  // Content Security Policy
  headers.set('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' ${import.meta.env.VITE_API_URL} ${import.meta.env.VITE_WS_URL};
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
  `.replace(/\s+/g, ' ').trim());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function handleCORS(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': import.meta.env.VITE_ALLOWED_ORIGINS || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      }
    });
  }
  return null;
}

export function validateApiKey(req: Request): boolean {
  const apiKey = req.headers.get('X-API-Key');
  if (!apiKey) return false;
  
  // In a real implementation, you would validate against a database of API keys
  // For now, we'll just check against the environment variable
  return apiKey === import.meta.env.VITE_API_KEY;
}

export function rotateApiKey(): string {
  // Generate a new API key
  const newApiKey = crypto.randomUUID();
  
  // In a real implementation, you would:
  // 1. Store the new API key in your database
  // 2. Set an expiration time for the old key
  // 3. Notify the user of the new key
  // 4. Schedule cleanup of old keys
  
  return newApiKey;
}
