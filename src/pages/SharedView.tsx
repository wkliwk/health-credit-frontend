import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { accessShare, downloadSharedDocument, ShareAccess, SharedDocument } from '../services/shares'
import { decryptFile } from '../services/crypto'

export default function SharedView() {
  const { token } = useParams<{ token: string }>()
  const [shareData, setShareData] = useState<ShareAccess | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [decrypting, setDecrypting] = useState(false)
  const [decryptedFiles, setDecryptedFiles] = useState<Map<string, string>>(new Map())
  const [decryptError, setDecryptError] = useState('')

  useEffect(() => {
    if (!token) return

    const fetchShare = async () => {
      try {
        const data = await accessShare(token)
        setShareData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load share')
      } finally {
        setLoading(false)
      }
    }

    fetchShare()
  }, [token])

  const handleDecrypt = async () => {
    if (!token || !shareData || !password) return
    setDecrypting(true)
    setDecryptError('')

    try {
      const newDecrypted = new Map<string, string>()

      for (const doc of shareData.documents) {
        const encryptedData = await downloadSharedDocument(token, doc.id)
        const decrypted = await decryptFile(encryptedData, password, doc.encryptionSalt, doc.encryptionIV)

        const blob = new Blob([decrypted], { type: doc.mimeType })
        const url = URL.createObjectURL(blob)
        newDecrypted.set(doc.id, url)
      }

      setDecryptedFiles(newDecrypted)
    } catch {
      setDecryptError('Decryption failed. Please check your password.')
    } finally {
      setDecrypting(false)
    }
  }

  const renderDocument = (doc: SharedDocument) => {
    const url = decryptedFiles.get(doc.id)
    if (!url) return null

    if (doc.mimeType.startsWith('image/')) {
      return <img src={url} alt={doc.fileName} style={{ maxWidth: '100%', borderRadius: 8 }} />
    }

    if (doc.mimeType === 'application/pdf') {
      return (
        <object data={url} type="application/pdf" width="100%" height="600px">
          <Typography>Unable to display PDF. Your browser may not support inline PDF viewing.</Typography>
        </object>
      )
    }

    return <Typography color="text.secondary">Preview not available for this file type.</Typography>
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!shareData) return null

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, px: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Shared Health Documents
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip label={`${shareData.documents.length} document(s)`} />
          <Chip label={`${shareData.viewCount} view(s)`} />
          <Chip
            label={`Expires ${new Date(shareData.expiresAt).toLocaleDateString()}`}
            color="warning"
            variant="outlined"
          />
        </Box>

        {decryptedFiles.size === 0 && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              These documents are encrypted. Enter the password provided by the sender to view them.
            </Alert>

            {decryptError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {decryptError}
              </Alert>
            )}

            <TextField
              fullWidth
              type="password"
              label="Decryption Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              disabled={decrypting}
            />

            <Button
              variant="contained"
              fullWidth
              startIcon={<LockOpenIcon />}
              onClick={handleDecrypt}
              disabled={!password || decrypting}
            >
              {decrypting ? 'Decrypting...' : 'Decrypt & View'}
            </Button>
          </>
        )}
      </Paper>

      {decryptedFiles.size > 0 &&
        shareData.documents.map((doc) => (
          <Card key={doc.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {doc.fileName}
              </Typography>
              {renderDocument(doc)}
            </CardContent>
          </Card>
        ))}
    </Box>
  )
}
