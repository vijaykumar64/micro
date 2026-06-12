import { Request, Response } from 'express';
import * as svc from '../services/audit.service';

const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });
const err = (res: Response, e: unknown) => {
  const ex = e as { statusCode?: number; message?: string };
  res.status(ex.statusCode || 500).json({ success: false, error: ex.message });
};

export async function getLogs(req: Request, res: Response) {
  if (!['admin','moderator'].includes(req.headers['x-user-role'] as string)) { res.status(403).json({ success: false, error: 'Access denied' }); return; }
  try { ok(res, await svc.getLogs(Number(req.query['page'] || 1), Number(req.query['limit'] || 50), req.query as Record<string,string>)); } catch(e) { err(res, e); }
}
export async function getUserLogs(req: Request, res: Response) {
  if (req.headers['x-user-role'] !== 'admin') { res.status(403).json({ success: false, error: 'Admin only' }); return; }
  try { ok(res, await svc.getUserLogs(req.params['userId'], Number(req.query['page'] || 1))); } catch(e) { err(res, e); }
}
export async function getResourceHistory(req: Request, res: Response) {
  try { ok(res, await svc.getResourceHistory(req.params['resourceType'], req.params['resourceId'])); } catch(e) { err(res, e); }
}
export async function internalLog(req: Request, res: Response) {
  if (req.headers['x-internal-secret'] !== (process.env.INTERNAL_SERVICE_SECRET || 'internal_secret_dev')) { res.status(403).json({ success: false, error: 'Forbidden' }); return; }
  try {
    await svc.logEvent({ ...req.body, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    res.status(201).json({ success: true });
  } catch(e) { err(res, e); }
}
