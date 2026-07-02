import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import publicRoutes from './routes/public.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import healthRoutes from './routes/health.routes.js';
import sitemapRoutes from './routes/sitemap.routes.js';
import newsRoutes from './routes/news.routes.js';
import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { swaggerSpec } from './config/swagger.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();

// Render/most PaaS terminate TLS at a proxy. Trust it so express-rate-limit
// sees real client IPs and req.protocol is correct (used by the sitemap).
app.set('trust proxy', 1);

app.use(helmet());

const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
if (process.env.NODE_ENV === 'production' && allowed.length === 0) {
  logger.warn('ALLOWED_ORIGINS is empty in production: CORS will accept all origins. Set ALLOWED_ORIGINS to your frontend domain(s).');
}
const corsOptions = allowed.length ? { origin: (origin, cb) => {
  if (!origin) return cb(null, true);
  if (allowed.includes(origin)) return cb(null, true);
  return cb(new Error('Not allowed by CORS'));
}} : {};
app.use(cors(corsOptions));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const adminLimiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });
app.use('/api/admin', adminLimiter);

// API docs are public by default but can be disabled in production
// (set ENABLE_DOCS=false) to avoid advertising the full API surface.
if (process.env.ENABLE_DOCS !== 'false') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
}

app.use(healthRoutes);
app.use(sitemapRoutes);
app.use(publicRoutes);
app.use(adminRoutes);
app.use(uploadRoutes);
app.use(newsRoutes);
app.use(authRoutes);
app.use(accountRoutes);
app.use('/api/settings', settingsRoutes);

app.use((err, req, res, next) => {
  if (!err) return next();
  if (process.env.NODE_ENV === 'production') {
    logger.error({ err }, 'Unhandled error in production');
    return res.status(err.status || 500).json({ success: false, message: 'Internal Server Error' });
  }
  return errorHandler(err, req, res, next);
});

export default app;
