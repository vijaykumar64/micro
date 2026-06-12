import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export async function getOwnProfile(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;
    const profile = await userService.getProfile(userId);
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode || 500).json({ success: false, error: e.message });
  }
}

export async function updateOwnProfile(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;
    const profile = await userService.updateProfile(userId, req.body);
    res.json({ success: true, data: profile });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode || 500).json({ success: false, error: e.message });
  }
}

export async function listAllProfiles(req: Request, res: Response) {
  const role = req.headers['x-user-role'] as string;
  if (role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const data = await userService.getAllProfiles(page, limit);
    res.json({ success: true, data });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode || 500).json({ success: false, error: e.message });
  }
}

export async function deleteUserProfile(req: Request, res: Response) {
  const role = req.headers['x-user-role'] as string;
  if (role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }
  try {
    await userService.deleteProfile(req.params['userId']);
    res.json({ success: true, message: 'Profile deleted' });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode || 500).json({ success: false, error: e.message });
  }
}

export async function createInternalProfile(req: Request, res: Response) {
  const secret = req.headers['x-internal-secret'];
  if (secret !== (process.env.INTERNAL_SERVICE_SECRET || 'internal_secret_dev')) {
    res.status(403).json({ success: false, error: 'Forbidden' });
    return;
  }
  try {
    const { userId, firstName, lastName } = req.body;
    const profile = await userService.createProfile(userId, firstName, lastName);
    res.status(201).json({ success: true, data: profile });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode || 500).json({ success: false, error: e.message });
  }
}
