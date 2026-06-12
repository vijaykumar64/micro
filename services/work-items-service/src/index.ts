import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { runMigrations } from './db/pool';
import routes from './routes/work-items.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '3007');
app.use(helmet()); app.use(cors()); app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'work-items-service' }));
app.use('/', routes);
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ success: false, error: err.message });
});
async function start() {
  try { await runMigrations(); app.listen(PORT, () => console.log(`[work-items-service] Running on port ${PORT}`)); }
  catch (e) { console.error('[work-items-service] Failed to start:', e); process.exit(1); }
}
start();
