import { http, HttpResponse } from 'msw';

interface LoginRequest {
  email: string;
  password: string;
}

interface GetMetricsRequest {
  serviceId: string;
}

interface GetTeamsRequest {
  // Add any query parameters or body properties here if needed
}

interface GetIncidentsRequest {
  // Add any query parameters or body properties here if needed
}

interface GetServicesRequest {
  // Add any query parameters or body properties here if needed
}

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as LoginRequest;
    const { email, password } = body;

    if (email === 'test@example.com' && password === 'password') {
      return HttpResponse.json({
        user: { id: '1', email, name: 'Test User' },
        token: 'fake-jwt-token',
      });
    }
    
    return new HttpResponse(null, {
      status: 401,
      statusText: 'Unauthorized',
    });
  }),

  // Services endpoints
  http.get('/api/services', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'API',
        status: 'operational',
        description: 'Main API service',
      },
      {
        id: '2',
        name: 'Website',
        status: 'degraded',
        description: 'Public website',
      },
    ]);
  }),

  // Incidents endpoints
  http.get('/api/incidents', () => {
    return HttpResponse.json([]);
  }),

  // Teams endpoints
  http.get('/api/teams', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Engineering',
        members: [
          { id: '1', name: 'Test User', role: 'admin' },
        ],
      },
    ]);
  }),

  // Metrics endpoints
  http.get('/api/metrics/:serviceId', ({ params }) => {
    const { serviceId } = params as GetMetricsRequest;
    return HttpResponse.json({
      uptime: 99.9,
      responseTime: 250,
      incidents: 1,
      lastIncident: new Date().toISOString(),
    });
  }),
];
