import api from './api.client';
import { FileRecord } from '../types';

export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<FileRecord> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<{ success: boolean; data: FileRecord }>('/files/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return res.data.data;
}

export async function listFiles(page = 1, limit = 20): Promise<{ files: FileRecord[]; total: number }> {
  const res = await api.get<{ success: boolean; data: { files: FileRecord[]; total: number } }>(
    `/files?page=${page}&limit=${limit}`
  );
  return res.data.data;
}

export async function downloadFile(fileId: string, filename: string): Promise<void> {
  const res = await api.get(`/files/${fileId}/download`, { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([res.data as BlobPart]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function deleteFile(fileId: string): Promise<void> {
  await api.delete(`/files/${fileId}`);
}
