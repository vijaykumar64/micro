import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { runMigrations } from './db/pool';
import routes from './routes/notification.routes';

const app = express();
const PORT = parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3008');
app.use(helmet()); app.use(cors()); app.use(express.json());
app.use('/', routes);
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ success: false, error: err.message });
});
async function start() {
  try { await runMigrations(); app.listen(PORT, () => console.log(`[notification-service] Running on port ${PORT}`)); }
  catch (e) { console.error('[notification-service] Failed to start:', e); process.exit(1); }
}
start();
