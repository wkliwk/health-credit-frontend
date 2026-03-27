import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import LockIcon from '@mui/icons-material/Lock'
import ShieldIcon from '@mui/icons-material/Shield'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { accessShare, downloadSharedDocument, type ShareAccess, type SharedDocument } from '../services/shares'
import { decryptFile } from '../services/crypto'
import { detectDocumentType, CARD_GRADIENTS, CARD_ICONS } from '../constants/gradients'
import theme from '../theme'

const MotionBox = motion.create(Box)

function getExpiryLabel(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return `${Math.floor(diff / 60000)}m remaining`
  if (hours < 24) return `${hours}h remaining`
  return `${Math.floor(hours / 24)}d remaining`
}

interface DocCardProps {
  doc: SharedDocument
}

function DocCardPreview({ doc }: DocCardProps) {
  const type = detectDocumentType(doc.fileName)
  const gradient = CARD_GRADIENTS[type]
  const icon = CARD_ICONS[type]

  return (
    <Box
      sx={{
        borderRadius: '16px',
        background: gradient,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 100,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 20 }}>{icon}</Typography>
        <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>
          {type}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#fff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {doc.fileName}
      </Typography>
    </Box>
  )
}

interface TrustStripProps {
  shareData: ShareAccess
}

function TrustStrip({ shareData }: TrustStripProps) {
  const expiryLabel = getExpiryLabel(shareData.expiresAt)
  const items = [
    { icon: LockIcon, label: 'End-to-end encrypted', color: '#6366F1' },
    { icon: AccessTimeIcon, label: `Expires in ${expiryLabel}`, color: '#F59E0B' },
    { icon: VisibilityIcon, label: `${shareData.viewCount} view${shareData.viewCount !== 1 ? 's' : ''}`, color: '#3B82F6' },
  ]

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
      {items.map(({ icon: Icon, label, color }) => (
        <Box
          key={label}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: 9999,
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Icon sx={{ fontSize: 13, color }} />
          <Typography sx={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

function SharedViewInner() {
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
      return (
        <img
          src={url}
          alt={doc.fileName}
          style={{ maxWidth: '100%', borderRadius: 12 }}
        />
      )
    }

    if (doc.mimeType === 'application/pdf') {
      return (
        <object data={url} type="application/pdf" width="100%" height="600px">
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            Unable to display PDF. Your browser may not support inline PDF viewing.
          </Typography>
        </object>
      )
    }

    return (
      <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
        Preview not available for this file type.
      </Typography>
    )
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0E1A',
        }}
      >
        <CircularProgress sx={{ color: '#6366F1' }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0E1A',
          p: 3,
        }}
      >
        <Box
          sx={{
            maxWidth: 400,
            width: '100%',
            textAlign: 'center',
            p: 4,
            borderRadius: '24px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <Typography sx={{ fontSize: 48, mb: 2 }}>🔒</Typography>
          <Typography variant="h2" sx={{ color: '#fff', mb: 1, fontSize: '20px' }}>
            Unable to load share
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            {error}
          </Typography>
        </Box>
      </Box>
    )
  }

  if (!shareData) return null

  const unlocked = decryptedFiles.size > 0

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#0A0E1A',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)',
        p: { xs: 2, sm: 4 },
      }}
    >
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          sx={{ textAlign: 'center', mb: 4, mt: 2 }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.75,
              borderRadius: 9999,
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)',
              mb: 2,
            }}
          >
            <ShieldIcon sx={{ fontSize: 14, color: '#6366F1' }} />
            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#6366F1', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              HC Trust
            </Typography>
          </Box>
          <Typography variant="h1" sx={{ color: '#fff', fontSize: { xs: '22px', sm: '28px' }, mb: 0.5 }}>
            Shared with you
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
            {shareData.documents.length} document{shareData.documents.length !== 1 ? 's' : ''} shared privately
          </Typography>
        </MotionBox>

        {/* Trust strip */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          sx={{ mb: 3 }}
        >
          <TrustStrip shareData={shareData} />
        </MotionBox>

        {/* Document card previews */}
        <MotionBox
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 1.5,
            mb: 3,
          }}
        >
          {shareData.documents.map((doc) => (
            <DocCardPreview key={doc.id} doc={doc} />
          ))}
        </MotionBox>

        {/* Password / decrypt panel */}
        <AnimatePresence mode="wait">
          {!unlocked ? (
            <MotionBox
              key="password"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, delay: 0.2 }}
              sx={{
                p: 3,
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: 'rgba(99,102,241,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LockIcon sx={{ fontSize: 18, color: '#6366F1' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
                    Enter decryption password
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                    Provided by the sender
                  </Typography>
                </Box>
              </Box>

              {decryptError && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1.5,
                    borderRadius: '10px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <Typography sx={{ fontSize: '13px', color: '#EF4444' }}>
                    {decryptError}
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleDecrypt() }}
                disabled={decrypting}
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                fullWidth
                startIcon={decrypting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <LockOpenIcon />}
                onClick={handleDecrypt}
                disabled={!password || decrypting}
                sx={{
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  borderRadius: 9999,
                  py: 1.25,
                  fontWeight: 600,
                  fontSize: '14px',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5558E3, #7C4FE0)',
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.25)',
                  },
                }}
              >
                {decrypting ? 'Decrypting...' : 'Decrypt & View'}
              </Button>
            </MotionBox>
          ) : (
            <MotionBox
              key="decrypted"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {shareData.documents.map((doc) => (
                <Box
                  key={doc.id}
                  sx={{
                    mb: 2,
                    p: 2.5,
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#fff', mb: 2 }}>
                    {doc.fileName}
                  </Typography>
                  {renderDocument(doc)}
                </Box>
              ))}
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Footer trust note */}
        <Box sx={{ textAlign: 'center', mt: 3, mb: 2 }}>
          <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
            Powered by HC Trust · Zero-knowledge encryption
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default function SharedView() {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <SharedViewInner />
    </MuiThemeProvider>
  )
}
