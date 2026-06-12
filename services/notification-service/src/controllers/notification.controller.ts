import { Request, Response } from 'express';
import * as svc from '../services/notification.service';

const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });
const err = (res: Response, e: unknown) => {
  const ex = e as { statusCode?: number; message?: string };
  res.status(ex.statusCode || 500).json({ success: false, error: ex.message });
};

export async function list(req: Request, res: Response) {
  try { ok(res, await svc.getNotifications(req.headers['x-user-id'] as string, Number(req.query['page'] || 1), Number(req.query['limit'] || 20))); } catch(e) { err(res, e); }
}
export async function unreadCount(req: Request, res: Response) {
  try { ok(res, { count: await svc.getUnreadCount(req.headers['x-user-id'] as string) }); } catch(e) { err(res, e); }
}
export async function markRead(req: Request, res: Response) {
  try { await svc.markRead(req.params['id'], req.headers['x-user-id'] as string); ok(res, { message: 'Marked as read' }); } catch(e) { err(res, e); }
}
export async function markAllRead(req: Request, res: Response) {
  try { await svc.markAllRead(req.headers['x-user-id'] as string); ok(res, { message: 'All marked as read' }); } catch(e) { err(res, e); }
}
export async function getPrefs(req: Request, res: Response) {
  try { ok(res, await svc.getPreferences(req.headers['x-user-id'] as string)); } catch(e) { err(res, e); }
}
export async function updatePrefs(req: Request, res: Response) {
  try { ok(res, await svc.updatePreferences(req.headers['x-user-id'] as string, req.body)); } catch(e) { err(res, e); }
}
export async function internalSend(req: Request, res: Response) {
  if (req.headers['x-internal-secret'] !== process.env.INTERNAL_SERVICE_SECRET) { res.status(403).json({ success: false, error: 'Forbidden' }); return; }
  try {
    const { userId, type, title, message, metadata } = req.body;
    ok(res, await svc.sendNotification(userId, type, title, message, metadata), 201);
  } catch(e) { err(res, e); }
}
