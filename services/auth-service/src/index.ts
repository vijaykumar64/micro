import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { runMigrations } from './db/pool';
import authRoutes from './routes/auth.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/', authRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

async function start() {
  try {
    await runMigrations();
    app.listen(PORT, () => console.log(`[auth-service] Running on port ${PORT}`));
  } catch (err) {
    console.error('[auth-service] Failed to start:', err);
    process.exit(1);
  }
}

start();
