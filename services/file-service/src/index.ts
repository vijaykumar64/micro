import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { runMigrations } from './db/pool';
import fileRoutes from './routes/file.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '3004');

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/', fileRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'file-service' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  const statusCode = (err as { statusCode?: number }).statusCode || 500;
  res.status(statusCode).json({ success: false, error: err.message || 'Internal server error' });
});

async function start() {
  try {
    await runMigrations();
    app.listen(PORT, () => console.log(`[file-service] Running on port ${PORT}`));
  } catch (err) {
    console.error('[file-service] Failed to start:', err);
    process.exit(1);
  }
}

start();
