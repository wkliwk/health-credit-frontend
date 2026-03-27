import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Chip, Typography, CircularProgress } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ShieldIcon from '@mui/icons-material/Shield'
import LockIcon from '@mui/icons-material/Lock'
import ShareIcon from '@mui/icons-material/Share'
import HealthCard from '../components/wallet/HealthCard'
import TrustBadge from '../components/wallet/TrustBadge'
import PageTransition from '../components/layout/PageTransition'
import { listDocuments, type DocumentMeta } from '../services/documents'
import { useAuth } from '../context/AuthContext'

function Home() {
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    listDocuments()
      .then(setDocs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
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
      <Box sx={{ maxWidth: 500, mx: 'auto' }}>
        {/* Greeting */}
        <Typography variant="h1" gutterBottom>
          {greeting()}{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </Typography>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
          <Chip label={`${docs.length} document${docs.length !== 1 ? 's' : ''}`} />
          <TrustBadge variant="encrypted" />
        </Box>

        {/* Card Stack or Empty State */}
        {docs.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            {docs.map((doc) => (
              <HealthCard
                key={doc.id}
                fileName={doc.fileName}
                date={doc.createdAt}
                expiresAt={doc.expiresAt}
                onTap={() => navigate('/documents')}
              />
            ))}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/upload')}
                sx={{ borderRadius: 9999, px: 3 }}
              >
                Upload
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => navigate('/shares')}
                sx={{ borderRadius: 9999, px: 3 }}
              >
                Share
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <ShieldIcon sx={{ fontSize: 64, color: '#64748B', mb: 2 }} />
            <Typography variant="h2" gutterBottom>
              Your wallet is empty
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Upload your first health document to get started
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('/upload')}
              sx={{ borderRadius: 9999, px: 4, py: 1.5 }}
            >
              Upload Document
            </Button>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
              <Chip icon={<LockIcon sx={{ fontSize: 14 }} />} label="End-to-end encrypted" size="small" />
              <Chip icon={<ShareIcon sx={{ fontSize: 14 }} />} label="You control sharing" size="small" />
            </Box>
          </Box>
        )}
      </Box>
    </PageTransition>
  )
}

export default Home
