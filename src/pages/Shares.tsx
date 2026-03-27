import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
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
  CircularProgress,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  Snackbar,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { motion } from 'framer-motion'
import { listShares, createShare, revokeShare, type ShareMeta } from '../services/shares'
import { listDocuments, type DocumentMeta } from '../services/documents'
import ShareCard from '../components/wallet/ShareCard'
import PageTransition from '../components/layout/PageTransition'
import { pageTransition } from '../constants/animations'

const MotionBox = motion.create(Box)

export default function Shares() {
  const [shares, setShares] = useState<ShareMeta[]>([])
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [snackbar, setSnackbar] = useState('')

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [expiry, setExpiry] = useState('24h')
  const [maxViews, setMaxViews] = useState('')
  const [creating, setCreating] = useState(false)
  const [newShare, setNewShare] = useState<ShareMeta | null>(null)

  // Revoke confirm dialog
  const [revokeId, setRevokeId] = useState<string | null>(null)

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

  const handleOpenCreate = () => {
    setNewShare(null)
    setSelectedDocs([])
    setMaxViews('')
    setExpiry('24h')
    setCreateOpen(true)
  }

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
      setNewShare(share)
      setShares((prev) => [share, ...prev])
      setSelectedDocs([])
      setMaxViews('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share')
    } finally {
      setCreating(false)
    }
  }

  const handleRevokeConfirm = async () => {
    if (!revokeId) return
    try {
      await revokeShare(revokeId)
      setShares((prev) => prev.filter((s) => s.id !== revokeId))
      setSnackbar('Share card revoked')
      setRevokeId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke')
    }
  }

  const toggleDoc = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress sx={{ color: '#6366F1' }} />
      </Box>
    )
  }

  return (
    <PageTransition>
      <Box sx={{ maxWidth: 860, mx: 'auto', pb: 10 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h1" sx={{ mb: 0.5 }}>
              Your Cards
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
              {shares.length} active share{shares.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Empty state */}
        {shares.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              mt: 8,
              p: 4,
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px dashed rgba(255,255,255,0.1)',
            }}
          >
            <Typography variant="h2" sx={{ mb: 1, fontSize: '20px' }}>No share cards yet</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', mb: 3 }}>
              Create a share card to give someone access to your health documents
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              disabled={docs.length === 0}
              sx={{
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                borderRadius: 9999,
                px: 3,
                textTransform: 'none',
              }}
            >
              Create Share Card
            </Button>
            {docs.length === 0 && (
              <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', mt: 2 }}>
                Upload a document first
              </Typography>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
            }}
          >
            {shares.map((share, i) => (
              <MotionBox
                key={share.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...pageTransition.transition, delay: i * 0.06 }}
              >
                <ShareCard
                  shareId={share.id}
                  token={share.token}
                  expiresAt={share.expiresAt}
                  viewCount={share.viewCount}
                  maxViews={share.maxViews ?? undefined}
                  documentCount={share.documentIds.length}
                  onRevoke={(id) => setRevokeId(id)}
                />
              </MotionBox>
            ))}
          </Box>
        )}

        {/* FAB */}
        {docs.length > 0 && (
          <Fab
            onClick={handleOpenCreate}
            sx={{
              position: 'fixed',
              bottom: { xs: 80, sm: 32 },
              right: { xs: 16, sm: 32 },
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff',
              boxShadow: '0 4px 24px rgba(99,102,241,0.45)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5558E3, #7C4FE0)',
              },
            }}
          >
            <AddIcon />
          </Fab>
        )}

        {/* Create Share Dialog */}
        <Dialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(15,18,30,0.97)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
            },
          }}
        >
          <DialogTitle sx={{ color: '#fff', fontWeight: 700 }}>
            {newShare ? 'Share Card Created' : 'Create Share Card'}
          </DialogTitle>
          <DialogContent>
            {newShare ? (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center', mb: 1 }}>
                  Scan or copy the link below to share with someone.
                </Typography>
                <ShareCard
                  shareId={newShare.id}
                  token={newShare.token}
                  expiresAt={newShare.expiresAt}
                  viewCount={newShare.viewCount}
                  maxViews={newShare.maxViews ?? undefined}
                  documentCount={newShare.documentIds.length}
                  onRevoke={(id) => {
                    setRevokeId(id)
                    setCreateOpen(false)
                  }}
                  startFlipped
                />
              </Box>
            ) : (
              <>
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, color: 'rgba(255,255,255,0.7)' }}>
                  Select documents:
                </Typography>
                <List dense sx={{ mb: 1 }}>
                  {docs.map((doc) => (
                    <ListItem
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        '&:hover': { background: 'rgba(255,255,255,0.04)' },
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={selectedDocs.includes(doc.id)}
                          sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#6366F1' } }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.fileName}
                        primaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.85)', fontSize: '14px' } }}
                      />
                    </ListItem>
                  ))}
                </List>
                <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Expiry</InputLabel>
                  <Select
                    value={expiry}
                    label="Expiry"
                    onChange={(e) => setExpiry(e.target.value)}
                    sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' } }}
                  >
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
                  inputProps={{ min: 1 }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                    '& .MuiInputBase-input': { color: '#fff' },
                    '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.35)' },
                  }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setCreateOpen(false)}
              sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'none' }}
            >
              {newShare ? 'Done' : 'Cancel'}
            </Button>
            {!newShare && (
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={!selectedDocs.length || creating}
                sx={{
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  borderRadius: 9999,
                  px: 3,
                  textTransform: 'none',
                }}
              >
                {creating ? 'Creating...' : 'Create'}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Revoke Confirm Dialog */}
        <Dialog
          open={!!revokeId}
          onClose={() => setRevokeId(null)}
          PaperProps={{
            sx: {
              background: 'rgba(15,18,30,0.97)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
            },
          }}
        >
          <DialogTitle sx={{ color: '#fff' }}>Revoke Share Card?</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              This will permanently disable the share link. Recipients will no longer be able to access the shared documents.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setRevokeId(null)}
              sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleRevokeConfirm}
              sx={{ borderRadius: 9999, textTransform: 'none' }}
            >
              Revoke
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!snackbar}
          autoHideDuration={2500}
          onClose={() => setSnackbar('')}
          message={snackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </PageTransition>
  )
}
