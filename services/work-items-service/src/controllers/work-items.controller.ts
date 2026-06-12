import { Request, Response } from 'express';
import * as svc from '../services/work-items.service';

const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });
const err = (res: Response, e: unknown) => {
  const ex = e as { statusCode?: number; message?: string };
  res.status(ex.statusCode || 500).json({ success: false, error: ex.message });
};

export async function create(req: Request, res: Response) {
  try { ok(res, await svc.createItem(req.headers['x-user-id'] as string, req.body), 201); } catch(e) { err(res, e); }
}
export async function listMine(req: Request, res: Response) {
  try { ok(res, await svc.getMyItems(req.headers['x-user-id'] as string)); } catch(e) { err(res, e); }
}
export async function listAll(req: Request, res: Response) {
  if (!['admin','moderator'].includes(req.headers['x-user-role'] as string)) { res.status(403).json({ success: false, error: 'Access denied' }); return; }
  try { ok(res, await svc.getAllItems(Number(req.query['page'] || 1), Number(req.query['limit'] || 50))); } catch(e) { err(res, e); }
}
export async function getOne(req: Request, res: Response) {
  try { ok(res, await svc.getItemById(req.params['id'])); } catch(e) { err(res, e); }
}
export async function update(req: Request, res: Response) {
  try { ok(res, await svc.updateItem(req.params['id'], req.headers['x-user-id'] as string, req.headers['x-user-role'] as string, req.body)); } catch(e) { err(res, e); }
}
export async function updateStatus(req: Request, res: Response) {
  try { ok(res, await svc.updateStatus(req.params['id'], req.headers['x-user-id'] as string, req.headers['x-user-role'] as string, req.body.status)); } catch(e) { err(res, e); }
}
export async function internalCount(req: Request, res: Response) {
  if (req.headers['x-internal-secret'] !== (process.env.INTERNAL_SERVICE_SECRET || 'internal_secret_dev')) { res.status(403).json({ success: false, error: 'Forbidden' }); return; }
  try { ok(res, { openCount: await svc.getOpenCount() }); } catch(e) { err(res, e); }
}
