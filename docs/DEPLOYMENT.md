# Deployment Guide

This guide covers deploying the Status Page application to different platforms.

## Prerequisites

1. Node.js 18 or higher
2. Auth0 account
3. SendGrid account (for email notifications)

## Environment Variables

Create a `.env` file with the following variables:

```env
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=your-auth0-audience
SENDGRID_API_KEY=your-sendgrid-api-key
VITE_API_URL=your-api-url
VITE_WS_URL=your-websocket-url
VITE_API_KEY=your-api-key
VITE_ALLOWED_ORIGINS=https://your-domain.com
```

## Build

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

## Deployment Options

### 1. Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard.

### 2. Docker

1. Build image:
   ```bash
   docker build -t status-page .
   ```

2. Run container:
   ```bash
   docker run -p 3000:3000 \
     -e VITE_AUTH0_DOMAIN=your-auth0-domain \
     -e VITE_AUTH0_CLIENT_ID=your-auth0-client-id \
     ... \
     status-page
   ```

### 3. AWS Elastic Beanstalk

1. Install EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize EB:
   ```bash
   eb init
   ```

3. Create environment:
   ```bash
   eb create production
   ```

4. Configure environment variables:
   ```bash
   eb setenv VITE_AUTH0_DOMAIN=your-auth0-domain ...
   ```

### 4. Heroku

1. Install Heroku CLI:
   ```bash
   npm install -g heroku
   ```

2. Deploy:
   ```bash
   git push heroku main
   ```

3. Configure environment:
   ```bash
   heroku config:set VITE_AUTH0_DOMAIN=your-auth0-domain ...
   ```

## SSL/TLS Configuration

Always use HTTPS in production. Configure SSL/TLS certificates:

### Using Let's Encrypt

```bash
certbot certonly --webroot -w /var/www/html -d your-domain.com
```

### Using Cloudflare

1. Enable Cloudflare for your domain
2. Use Cloudflare's SSL/TLS protection
3. Enable "Always Use HTTPS"

## Monitoring

### Health Checks

Configure platform-specific health checks to monitor:
- `/api/health` - API health
- `/api/health/db` - Database connectivity
- `/api/health/ws` - WebSocket availability

### Logging

1. Configure application logging:
   ```javascript
   console.log -> Winston/Pino
   ```

2. Set up log aggregation (e.g., CloudWatch, Datadog)

## Performance Optimization

1. Enable CDN caching for static assets
2. Configure Redis caching for API responses
3. Enable Gzip compression
4. Use PM2 for process management:
   ```bash
   pm2 start npm --name "status-page" -- start
   ```

## Security Checklist

1. Enable security headers (already configured)
2. Set up CORS properly
3. Enable rate limiting
4. Rotate API keys regularly
5. Configure CSP headers
6. Enable HSTS

## Scaling

### Horizontal Scaling

1. Use load balancer
2. Configure session affinity for WebSocket
3. Use Redis for shared state

### Database Scaling

1. Use connection pooling
2. Configure read replicas
3. Implement query caching

## Backup and Recovery

1. Configure automated backups
2. Test restore procedures
3. Document disaster recovery plan

## Monitoring and Alerting

1. Set up uptime monitoring
2. Configure error tracking
3. Set up performance monitoring
4. Configure alerts for:
   - High error rates
   - Increased latency
   - Low uptime
   - Resource utilization
