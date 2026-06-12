import { useEffect, useState, useRef, DragEvent } from 'react';
import { FileRecord } from '../types';
import * as fileService from '../services/file.service';

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) return '📄';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return '🖼️';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['xls', 'xlsx'].includes(ext)) return '📊';
  if (['txt', 'md', 'csv'].includes(ext)) return '📃';
  if (['zip', 'rar', '7z'].includes(ext)) return '🗜️';
  return '📎';
}

export function Files() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const limit = 10;

  const loadFiles = async (p: number) => {
    setLoading(true);
    try {
      const data = await fileService.listFiles(p, limit);
      setFiles(data.files);
      setTotal(data.total);
    } catch {
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFiles(page); }, [page]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setError('');
    try {
      await fileService.uploadFile(file, setUploadProgress);
      await loadFiles(1);
      setPage(1);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;
    try {
      await fileService.deleteFile(fileId);
      setFiles((f) => f.filter((x) => x.id !== fileId));
      setTotal((t) => t - 1);
    } catch {
      setError('Failed to delete file');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 700, color: '#1e293b' }}>Files</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          {total} file{total !== 1 ? 's' : ''} stored — upload PDFs, images, documents and more
        </p>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {/* Upload zone */}
      <div
        style={{
          ...dropZoneStyle,
          borderColor: dragging ? '#6366f1' : '#d1d5db',
          background: dragging ? '#eef2ff' : '#fff',
          boxShadow: dragging ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          style={{ display: 'none' }}
          accept=".pdf,.png,.jpg,.jpeg,.docx,.txt,.xlsx"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
        />
        {uploading ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏫</div>
            <p style={{ margin: '0 0 10px', color: '#6366f1', fontWeight: 600 }}>Uploading... {uploadProgress}%</p>
            <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '6px', width: '220px', margin: '0 auto' }}>
              <div style={{ background: '#6366f1', width: `${uploadProgress}%`, height: '100%', borderRadius: '999px', transition: 'width 0.2s' }} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '44px', marginBottom: '12px', opacity: dragging ? 1 : 0.7 }}>📁</div>
            <p style={{ margin: '0 0 6px', color: '#374151', fontSize: '15px', fontWeight: 600 }}>
              {dragging ? 'Drop to upload' : 'Click to browse or drag & drop'}
            </p>
            <p style={{ margin: '0 0 14px', color: '#94a3b8', fontSize: '13px' }}>Files up to 10 MB</p>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['PDF', 'PNG', 'JPG', 'DOCX', 'XLSX', 'TXT'].map(t => (
                <span key={t} style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* File list */}
      {loading ? (
        <div style={tableContainer}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px' }} className="skeleton" />
              <div style={{ flex: 1, height: '16px' }} className="skeleton" />
              <div style={{ width: '60px', height: '14px' }} className="skeleton" />
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
          <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: '#374151' }}>No files yet</p>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Upload your first file using the zone above.</p>
        </div>
      ) : (
        <>
          <div style={tableContainer}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}></th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Size</th>
                  <th style={thStyle}>Uploaded</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.id} style={{ transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ ...tdStyle, width: '44px', textAlign: 'center', fontSize: '18px' }}>
                      {getFileIcon(f.originalName)}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500, color: '#1e293b' }}>{f.originalName}</td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{formatSize(f.sizeBytes)}</td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <button onClick={() => fileService.downloadFile(f.id, f.originalName)} style={actionBtn('#6366f1')}>↓ Download</button>
                      <button onClick={() => handleDelete(f.id)} className="btn-danger" style={actionBtn('#ef4444')}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center', alignItems: 'center' }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>← Prev</button>
              <span style={{ fontSize: '14px', color: '#64748b', minWidth: '80px', textAlign: 'center' }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pageBtn}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const dropZoneStyle: React.CSSProperties = {
  border: '2px dashed #d1d5db',
  borderRadius: '12px',
  padding: '40px 24px',
  cursor: 'pointer',
  marginBottom: '20px',
  transition: 'all 0.2s',
};
const tableContainer: React.CSSProperties = { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' };
const thStyle: React.CSSProperties = { padding: '11px 16px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f1f5f9' };
const actionBtn = (color: string): React.CSSProperties => ({ background: 'transparent', border: `1px solid ${color}`, color, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', marginRight: '6px', fontWeight: 500 });
const pageBtn: React.CSSProperties = { padding: '7px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 500 };
const errorStyle: React.CSSProperties = { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fecaca' };
