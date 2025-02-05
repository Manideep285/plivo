import { StatusCheckConfig, StatusCheckResult, StatusCheckStats } from '@/types/statusCheck';
import { statusCheckService } from '@/lib/statusCheck';
import { rateLimit } from '@/lib/rateLimit';

export async function createStatusCheck(req: Request): Promise<Response> {
  const rateLimitResult = await rateLimit(req, 'status_check_create', 10);
  if (!rateLimitResult.success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  try {
    const config: StatusCheckConfig = await req.json();
    await statusCheckService.startCheck(config);
    return new Response(JSON.stringify({ success: true, data: config }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getStatusCheckResults(req: Request): Promise<Response> {
  const rateLimitResult = await rateLimit(req, 'status_check_results', 100);
  if (!rateLimitResult.success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  const url = new URL(req.url);
  const checkId = url.searchParams.get('checkId');
  const limit = parseInt(url.searchParams.get('limit') || '100');

  if (!checkId) {
    return new Response(JSON.stringify({ success: false, error: 'Missing checkId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const results = statusCheckService.getLatestResults(checkId, limit);
  return new Response(JSON.stringify({ success: true, data: results }), {
    headers: {
      'Content-Type': 'application/json',
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'Cache-Control': 'public, max-age=60'
    }
  });
}

export async function getStatusCheckStats(req: Request): Promise<Response> {
  const rateLimitResult = await rateLimit(req, 'status_check_stats', 100);
  if (!rateLimitResult.success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  const url = new URL(req.url);
  const checkId = url.searchParams.get('checkId');

  if (!checkId) {
    return new Response(JSON.stringify({ success: false, error: 'Missing checkId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const stats = statusCheckService.getStats(checkId);
  return new Response(JSON.stringify({ success: true, data: stats }), {
    headers: {
      'Content-Type': 'application/json',
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'Cache-Control': 'public, max-age=60'
    }
  });
}
