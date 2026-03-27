import { useState, useEffect, useCallback } from 'react'
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
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import GppBadIcon from '@mui/icons-material/GppBad'
import { accessShare, downloadSharedDocument, type ShareAccess, type SharedDocument } from '../services/shares'
import { decryptFile } from '../services/crypto'
import { detectDocumentType, CARD_GRADIENTS, CARD_ICONS } from '../constants/gradients'
import theme from '../theme'
import TrustHeader from '../components/TrustHeader'
import { getExpiryState } from '../components/ExpiryCountdown'

const MotionBox = motion.create(Box)

// ────────────────────────────────────────────────────────────
// DocCardPreview
// ────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────
// Full-page error states
// ────────────────────────────────────────────────────────────

function ExpiredState() {
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
      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
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
        <Box sx={{ mb: 2 }}>
          <AccessTimeIcon sx={{ fontSize: 52, color: '#EF4444' }} />
        </Box>
        <Typography variant="h2" sx={{ color: '#fff', mb: 1.5, fontSize: '20px', fontWeight: 700 }}>
          This link has expired
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: 1.6 }}>
          Request a new link from the sender.
        </Typography>
      </MotionBox>
    </Box>
  )
}

interface NotFoundStateProps {
  message: string
}

function NotFoundState({ message }: NotFoundStateProps) {
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
      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
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
        <Box sx={{ mb: 2 }}>
          <GppBadIcon sx={{ fontSize: 52, color: '#EF4444' }} />
        </Box>
        <Typography variant="h2" sx={{ color: '#fff', mb: 1.5, fontSize: '20px', fontWeight: 700 }}>
          Link not found or revoked
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: 1.6 }}>
          {message}
        </Typography>
      </MotionBox>
    </Box>
  )
}

// ────────────────────────────────────────────────────────────
// SharedViewInner
// ────────────────────────────────────────────────────────────

function SharedViewInner() {
  const { token } = useParams<{ token: string }>()
  const [shareData, setShareData] = useState<ShareAccess | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [decrypting, setDecrypting] = useState(false)
  const [decryptedFiles, setDecryptedFiles] = useState<Map<string, string>>(new Map())
  const [decryptError, setDecryptError] = useState('')
  const [showDecryptSuccess, setShowDecryptSuccess] = useState(false)
  const [clientExpired, setClientExpired] = useState(false)

  useEffect(() => {
    if (!token) return

    const fetchShare = async () => {
      try {
        const data = await accessShare(token)
        setShareData(data)
        if (getExpiryState(data.expiresAt) === 'expired') {
          setClientExpired(true)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load share')
      } finally {
        setLoading(false)
      }
    }

    fetchShare()
  }, [token])

  const handleExpired = useCallback(() => {
    setClientExpired(true)
  }, [])

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
      setShowDecryptSuccess(true)
      setTimeout(() => setShowDecryptSuccess(false), 2000)
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

  // Loading
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

  // Error (not found / revoked)
  if (error) {
    const isExpiredError = error.toLowerCase().includes('expired')
    if (isExpiredError) return <ExpiredState />
    return <NotFoundState message={error} />
  }

  if (!shareData) return null

  // Client-side expiry gate
  if (clientExpired) return <ExpiredState />

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
        {/* Trust header — loads first, always visible */}
        <TrustHeader
          token={token ?? ''}
          shareData={shareData}
          onExpired={handleExpired}
        />

        {/* Document card previews */}
        <MotionBox
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
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
              transition={{ duration: 0.25, delay: 0.25 }}
            >
              {/* Animated border pulse while waiting for input */}
              <Box
                component={motion.div}
                animate={{
                  boxShadow: password
                    ? ['0 0 0 0px rgba(99,102,241,0)', '0 0 0 3px rgba(99,102,241,0.25)', '0 0 0 0px rgba(99,102,241,0)']
                    : '0 0 0 0px rgba(99,102,241,0)',
                }}
                transition={password ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
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
              </Box>
            </MotionBox>
          ) : (
            <MotionBox
              key="decrypted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Decrypt success indicator */}
              <AnimatePresence>
                {showDecryptSuccess && (
                  <MotionBox
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    sx={{
                      mb: 2,
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>
                      Decrypted successfully
                    </Typography>
                  </MotionBox>
                )}
              </AnimatePresence>

              {/* Staggered document cards */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                  hidden: {},
                }}
              >
                {shareData.documents.map((doc) => (
                  <motion.div
                    key={doc.id}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                    }}
                  >
                    <Box
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
                  </motion.div>
                ))}
              </motion.div>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Share footer */}
        <Box sx={{ textAlign: 'center', mt: 3, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
          <LockIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }} />
          <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
            Powered by Health Credit — privacy-first health sharing
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
