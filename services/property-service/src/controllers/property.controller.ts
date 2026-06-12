import { Request, Response } from 'express';
import * as svc from '../services/property.service';

const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });
const err = (res: Response, e: unknown) => {
  const ex = e as { statusCode?: number; message?: string };
  res.status(ex.statusCode || 500).json({ success: false, error: ex.message });
};

export async function create(req: Request, res: Response) {
  try { ok(res, await svc.createProperty(req.headers['x-user-id'] as string, req.body), 201); } catch(e) { err(res, e); }
}
export async function list(req: Request, res: Response) {
  try { ok(res, await svc.listProperties(Number(req.query['page'] || 1), Number(req.query['limit'] || 20), req.query as Record<string,string>)); } catch(e) { err(res, e); }
}
export async function listMine(req: Request, res: Response) {
  try { ok(res, await svc.getMyProperties(req.headers['x-user-id'] as string, Number(req.query['page'] || 1), Number(req.query['limit'] || 20))); } catch(e) { err(res, e); }
}
export async function getOne(req: Request, res: Response) {
  try { ok(res, await svc.getPropertyById(req.params['id'])); } catch(e) { err(res, e); }
}
export async function update(req: Request, res: Response) {
  try { ok(res, await svc.updateProperty(req.params['id'], req.headers['x-user-id'] as string, req.headers['x-user-role'] as string, req.body)); } catch(e) { err(res, e); }
}
export async function remove(req: Request, res: Response) {
  try { await svc.deleteProperty(req.params['id'], req.headers['x-user-role'] as string); ok(res, { message: 'Deleted' }); } catch(e) { err(res, e); }
}
export async function internalCount(_req: Request, res: Response) {
  try { ok(res, { total: await svc.getTotalCount() }); } catch(e) { err(res, e); }
}
