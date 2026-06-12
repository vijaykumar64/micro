import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';

export async function getStats(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;
    const stats = await dashboardService.getUserStats(userId);
    res.json({ success: true, data: stats });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode || 500).json({ success: false, error: e.message });
  }
}

export async function getAdminStats(req: Request, res: Response) {
  const role = req.headers['x-user-role'] as string;
  if (role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }
  try {
    const stats = await dashboardService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode || 500).json({ success: false, error: e.message });
  }
}

export async function getActivity(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const data = await dashboardService.getRecentActivity(userId, page, limit);
    res.json({ success: true, data });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode || 500).json({ success: false, error: e.message });
  }
}

export async function logActivityInternal(req: Request, res: Response) {
  const secret = req.headers['x-internal-secret'];
  if (secret !== process.env.INTERNAL_SERVICE_SECRET) {
    res.status(403).json({ success: false, error: 'Forbidden' });
    return;
  }
  try {
    const { userId, action, metadata } = req.body;
    await dashboardService.logActivity(userId, action, metadata);
    res.status(201).json({ success: true });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode || 500).json({ success: false, error: e.message });
  }
}
