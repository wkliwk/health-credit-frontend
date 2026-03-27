import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import ShareIcon from '@mui/icons-material/Share'
import { listShares, createShare, revokeShare, ShareMeta } from '../services/shares'
import { listDocuments, DocumentMeta } from '../services/documents'

export default function Shares() {
  const [shares, setShares] = useState<ShareMeta[]>([])
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [expiry, setExpiry] = useState('24h')
  const [maxViews, setMaxViews] = useState('')
  const [creating, setCreating] = useState(false)
  const [newShareUrl, setNewShareUrl] = useState('')

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sharesData, docsData] = await Promise.all([listShares(), listDocuments()])
      setShares(sharesData)
      setDocs(docsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!selectedDocs.length) return
    setCreating(true)
    setError('')

    try {
      const share = await createShare(
        selectedDocs,
        expiry,
        maxViews ? parseInt(maxViews, 10) : undefined,
      )
      const fullUrl = `${window.location.origin}/shared/${share.token}`
      setNewShareUrl(fullUrl)
      setShares((prev) => [share, ...prev])
      setSelectedDocs([])
      setMaxViews('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share')
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async () => {
    if (!deleteId) return
    try {
      await revokeShare(deleteId)
      setShares((prev) => prev.filter((s) => s.id !== deleteId))
      setSuccess('Share link revoked')
      setDeleteId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard')
    setTimeout(() => setSuccess(''), 2000)
  }

  const formatExpiry = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h remaining`
    return `${Math.floor(hours / 24)}d remaining`
  }

  const toggleDoc = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Share Links</Typography>
        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={() => { setCreateOpen(true); setNewShareUrl('') }}
          disabled={docs.length === 0}
        >
          Create Share Link
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {shares.length === 0 ? (
        <Alert severity="info">No active share links. Create one to share your documents.</Alert>
      ) : (
        shares.map((share) => (
          <Card key={share.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  /shared/{share.token.slice(0, 12)}...
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip label={`${share.documentIds.length} doc(s)`} size="small" />
                  <Chip label={formatExpiry(share.expiresAt)} size="small" color={
                    new Date(share.expiresAt).getTime() - Date.now() < 3600000 ? 'error' : 'default'
                  } />
                  <Chip label={`${share.viewCount}${share.maxViews ? `/${share.maxViews}` : ''} views`} size="small" />
                </Box>
              </Box>
              <Tooltip title="Copy link">
                <IconButton onClick={() => copyToClipboard(`${window.location.origin}/shared/${share.token}`)}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Revoke">
                <IconButton color="error" onClick={() => setDeleteId(share.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </CardContent>
          </Card>
        ))
      )}

      {/* Create Share Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Share Link</DialogTitle>
        <DialogContent>
          {newShareUrl ? (
            <Box sx={{ mt: 1 }}>
              <Alert severity="success" sx={{ mb: 2 }}>Share link created!</Alert>
              <TextField
                fullWidth
                value={newShareUrl}
                InputProps={{ readOnly: true }}
                sx={{ mb: 1 }}
              />
              <Button fullWidth variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => copyToClipboard(newShareUrl)}>
                Copy Link
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Select documents:</Typography>
              <List dense>
                {docs.map((doc) => (
                  <ListItem key={doc.id} onClick={() => toggleDoc(doc.id)} sx={{ cursor: 'pointer' }}>
                    <ListItemIcon>
                      <Checkbox checked={selectedDocs.includes(doc.id)} />
                    </ListItemIcon>
                    <ListItemText primary={doc.fileName} />
                  </ListItem>
                ))}
              </List>
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>Expiry</InputLabel>
                <Select value={expiry} label="Expiry" onChange={(e) => setExpiry(e.target.value)}>
                  <MenuItem value="1h">1 hour</MenuItem>
                  <MenuItem value="24h">24 hours</MenuItem>
                  <MenuItem value="7d">7 days</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Max views (optional)"
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                helperText="Leave empty for unlimited views"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>
            {newShareUrl ? 'Done' : 'Cancel'}
          </Button>
          {!newShareUrl && (
            <Button variant="contained" onClick={handleCreate} disabled={!selectedDocs.length || creating}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Revoke Share Link?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently disable the share link. Recipients will no longer be able to access the shared documents.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleRevoke}>Revoke</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
