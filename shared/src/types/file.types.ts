export interface FileRecord {
  id: string;
  userId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FileUploadResponse {
  file: FileRecord;
  message: string;
}

export interface PaginatedFiles {
  files: FileRecord[];
  total: number;
  page: number;
  limit: number;
}
