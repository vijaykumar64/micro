import { Request, Response } from 'express';
import * as fileService from '../services/file.service';

export async function uploadFile(req: Request, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file provided' });
      return;
    }
    const userId = req.headers['x-user-id'] as string;
    const file = await fileService.saveFileRecord(userId, req.file);
    res.status(201).json({ success: true, data: file });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode || 500).json({ success: false, error: e.message });
  }
}

export async function listFiles(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const data = await fileService.getFilesByUser(userId, page, limit);
    res.json({ success: true, data });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode || 500).json({ success: false, error: e.message });
  }
}

export async function downloadFile(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;
    const role = req.headers['x-user-role'] as string;
    const { stream, file } = await fileService.getFileStream(req.params['fileId'], userId, role);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.sizeBytes);
    stream.pipe(res);
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode || 500).json({ success: false, error: e.message });
  }
}

export async function deleteFile(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;
    const role = req.headers['x-user-role'] as string;
    await fileService.deleteFile(req.params['fileId'], userId, role);
    res.json({ success: true, message: 'File deleted' });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode || 500).json({ success: false, error: e.message });
  }
}
