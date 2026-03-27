const BASE_URL = (import.meta as ImportMeta & { env: Record<string, string> }).env.VITE_API_URL

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export interface ShareMeta {
  id: string
  token: string
  url: string
  documentIds: string[]
  expiresAt: string
  maxViews: number | null
  viewCount: number
  createdAt: string
}

export interface SharedDocument {
  id: string
  fileName: string
  mimeType: string
  size: number
  encryptionSalt: string
  encryptionIV: string
  createdAt: string
}

export interface ShareAccess {
  documents: SharedDocument[]
  viewCount: number
  expiresAt: string
  maxViews: number | null
}

export async function createShare(
  documentIds: string[],
  expiry: string,
  maxViews?: number,
): Promise<ShareMeta> {
  const res = await fetch(`${BASE_URL}/api/shares`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ documentIds, expiry, maxViews: maxViews || undefined }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Failed to create share')
  }

  return res.json()
}

export async function listShares(): Promise<ShareMeta[]> {
  const res = await fetch(`${BASE_URL}/api/shares`, {
    headers: getAuthHeaders(),
  })

  if (!res.ok) throw new Error('Failed to list shares')
  return res.json()
}

export async function revokeShare(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/shares/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  if (!res.ok) throw new Error('Failed to revoke share')
}

export async function accessShare(token: string): Promise<ShareAccess> {
  const res = await fetch(`${BASE_URL}/api/shares/${token}`)

  if (res.status === 410) throw new Error('This share link has expired')
  if (res.status === 404) throw new Error('Share link not found')
  if (!res.ok) throw new Error('Failed to access share')

  return res.json()
}

export async function downloadSharedDocument(token: string, docId: string): Promise<ArrayBuffer> {
  const res = await fetch(`${BASE_URL}/api/shares/${token}/documents/${docId}`)

  if (!res.ok) throw new Error('Failed to download document')
  return res.arrayBuffer()
}
