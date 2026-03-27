import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  Button,
  IconButton,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import ShareIcon from '@mui/icons-material/Share'
import CloseIcon from '@mui/icons-material/Close'
import { useNavigate } from 'react-router-dom'
import { listDocuments, deleteDocument, type DocumentMeta } from '../services/documents'
import HealthCard from '../components/wallet/HealthCard'
import TrustBadge from '../components/wallet/TrustBadge'
import PageTransition from '../components/layout/PageTransition'

export default function Documents() {
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<DocumentMeta | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    listDocuments()
      .then(setDocs)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id)
      setDocs((prev) => prev.filter((d) => d.id !== id))
      setSelectedDoc(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
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
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="h1">My Documents</Typography>
          <TrustBadge variant="encrypted" label={`${docs.length} encrypted`} size="md" />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {docs.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h2" gutterBottom>No documents yet</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Upload your first health document
            </Typography>
            <Button variant="contained" onClick={() => navigate('/upload')}>
              Upload Document
            </Button>
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2,
            justifyItems: 'center',
          }}>
            {docs.map((doc) => (
              <HealthCard
                key={doc.id}
                fileName={doc.fileName}
                date={doc.createdAt}
                expiresAt={doc.expiresAt}
                size="compact"
                onTap={() => setSelectedDoc(doc)}
              />
            ))}
          </Box>
        )}

        {/* Document detail dialog */}
        <Dialog
          open={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { backgroundColor: '#111827', overflow: 'visible' } }}
        >
          {selectedDoc && (
            <DialogContent sx={{ p: 3, textAlign: 'center' }}>
              <IconButton
                onClick={() => setSelectedDoc(null)}
                sx={{ position: 'absolute', top: 8, right: 8, color: '#94A3B8' }}
              >
                <CloseIcon />
              </IconButton>

              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <HealthCard
                  fileName={selectedDoc.fileName}
                  date={selectedDoc.createdAt}
                  expiresAt={selectedDoc.expiresAt}
                  size="full"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<ShareIcon />}
                  onClick={() => navigate('/shares')}
                  sx={{ borderRadius: 9999 }}
                >
                  Share
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(selectedDoc.id)}
                  sx={{ borderRadius: 9999 }}
                >
                  Delete
                </Button>
              </Box>
            </DialogContent>
          )}
        </Dialog>
      </Box>
    </PageTransition>
  )
}
