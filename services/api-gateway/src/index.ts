import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { generalLimiter, authLimiter } from './middleware/rateLimiter';

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

const AUTH_URL         = process.env.AUTH_SERVICE_URL         || 'http://localhost:3001';
const USER_URL         = process.env.USER_SERVICE_URL         || 'http://localhost:3002';
const DASHBOARD_URL    = process.env.DASHBOARD_SERVICE_URL    || 'http://localhost:3003';
const FILE_URL         = process.env.FILE_SERVICE_URL         || 'http://localhost:3004';
const PROPERTY_URL     = process.env.PROPERTY_SERVICE_URL     || 'http://localhost:3005';
const VERIFICATION_URL = process.env.VERIFICATION_SERVICE_URL || 'http://localhost:3006';
const WORK_ITEMS_URL   = process.env.WORK_ITEMS_SERVICE_URL   || 'http://localhost:3007';
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008';
const AUDIT_URL        = process.env.AUDIT_SERVICE_URL        || 'http://localhost:3009';

app.set('trust proxy', 1);
app.use(helmet());
const rawOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || rawOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(generalLimiter);

// Auth routes bypass JWT check entirely
app.use(
  '/api/auth',
  authLimiter,
  createProxyMiddleware({
    target: AUTH_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' },
  })
);

app.use(authMiddleware);

app.use(
  '/api/users',
  createProxyMiddleware({
    target: USER_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '' },
  })
);

app.use(
  '/api/dashboard',
  createProxyMiddleware({
    target: DASHBOARD_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/dashboard': '' },
  })
);

app.use(
  '/api/files',
  createProxyMiddleware({
    target: FILE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/files': '' },
    onError: (err: Error, _req: express.Request, res: express.Response) => {
      console.error('[gateway] proxy error:', err);
      res.status(502).json({ success: false, error: 'Service unavailable' });
    },
  })
);

app.use('/api/properties',    createProxyMiddleware({ target: PROPERTY_URL,     changeOrigin: true, pathRewrite: { '^/api/properties': '' } }));
app.use('/api/verifications', createProxyMiddleware({ target: VERIFICATION_URL, changeOrigin: true, pathRewrite: { '^/api/verifications': '' } }));
app.use('/api/work-items',    createProxyMiddleware({ target: WORK_ITEMS_URL,   changeOrigin: true, pathRewrite: { '^/api/work-items': '' } }));
app.use('/api/notifications', createProxyMiddleware({ target: NOTIFICATION_URL, changeOrigin: true, pathRewrite: { '^/api/notifications': '' } }));
app.use('/api/audit',         createProxyMiddleware({ target: AUDIT_URL,        changeOrigin: true, pathRewrite: { '^/api/audit': '' } }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

app.listen(PORT, () => console.log(`[api-gateway] Running on port ${PORT}`));
