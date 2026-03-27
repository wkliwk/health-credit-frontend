const BASE_URL = (import.meta as ImportMeta & { env: Record<string, string> }).env.VITE_API_URL;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface DocumentMeta {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  expiresAt: string | null;
}

export async function uploadDocument(
  encryptedBlob: ArrayBuffer,
  fileName: string,
  _mimeType?: string,
  retentionDays?: number,
): Promise<DocumentMeta> {
  const formData = new FormData();
  formData.append('file', new Blob([encryptedBlob], { type: 'application/octet-stream' }), fileName);
  formData.append('fileName', fileName);
  if (retentionDays) {
    formData.append('retentionDays', String(retentionDays));
  }

  const response = await fetch(`${BASE_URL}/api/documents`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return response.json();
}

export async function listDocuments(): Promise<DocumentMeta[]> {
  const response = await fetch(`${BASE_URL}/api/documents`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`List failed: ${response.status}`);
  }

  return response.json();
}

export async function deleteDocument(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/documents/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`);
  }
}

export async function downloadDocument(id: string): Promise<ArrayBuffer> {
  const response = await fetch(`${BASE_URL}/api/documents/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  return response.arrayBuffer();
}
