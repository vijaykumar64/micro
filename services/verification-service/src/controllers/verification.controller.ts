import { Request, Response } from 'express';
import * as svc from '../services/verification.service';

const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });
const err = (res: Response, e: unknown) => {
  const ex = e as { statusCode?: number; message?: string };
  res.status(ex.statusCode || 500).json({ success: false, error: ex.message });
};

export async function submit(req: Request, res: Response) {
  try { ok(res, await svc.submitRequest(req.headers['x-user-id'] as string, req.body.type), 201); } catch(e) { err(res, e); }
}
export async function listMine(req: Request, res: Response) {
  try { ok(res, await svc.getMyRequests(req.headers['x-user-id'] as string)); } catch(e) { err(res, e); }
}
export async function listPending(req: Request, res: Response) {
  if (!['admin','moderator'].includes(req.headers['x-user-role'] as string)) { res.status(403).json({ success: false, error: 'Access denied' }); return; }
  try { ok(res, await svc.getPendingRequests(Number(req.query['page'] || 1), Number(req.query['limit'] || 20))); } catch(e) { err(res, e); }
}
export async function getOne(req: Request, res: Response) {
  try { ok(res, await svc.getById(req.params['id'], req.headers['x-user-id'] as string, req.headers['x-user-role'] as string)); } catch(e) { err(res, e); }
}
export async function review(req: Request, res: Response) {
  try { ok(res, await svc.reviewRequest(req.params['id'], req.headers['x-user-id'] as string, req.headers['x-user-role'] as string, req.body.status, req.body.notes)); } catch(e) { err(res, e); }
}
export async function internalCount(req: Request, res: Response) {
  if (req.headers['x-internal-secret'] !== process.env.INTERNAL_SERVICE_SECRET) { res.status(403).json({ success: false, error: 'Forbidden' }); return; }
  try { ok(res, { pendingCount: await svc.getPendingCount() }); } catch(e) { err(res, e); }
}
