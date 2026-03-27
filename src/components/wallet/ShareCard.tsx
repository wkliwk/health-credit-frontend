import { useState } from 'react'
import { Box, Typography, IconButton, Tooltip } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckIcon from '@mui/icons-material/Check'
import { cardFlip } from '../../constants/animations'
import TrustBadge from './TrustBadge'

export interface ShareCardProps {
  shareId: string
  token: string
  expiresAt: string
  viewCount: number
  maxViews?: number
  documentCount: number
  onRevoke: (id: string) => void
  startFlipped?: boolean
}

const MotionBox = motion.create(Box)

function getExpiryLabel(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return `${Math.floor(diff / 60000)}m remaining`
  if (hours < 24) return `${hours}h remaining`
  return `${Math.floor(hours / 24)}d remaining`
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now()
}

export default function ShareCard({
  shareId,
  token,
  expiresAt,
  viewCount,
  maxViews,
  documentCount,
  onRevoke,
  startFlipped = false,
}: ShareCardProps) {
  const [flipped, setFlipped] = useState(startFlipped)
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/shared/${token}`
  const truncatedToken = `${token.slice(0, 8)}...${token.slice(-4)}`
  const expiryLabel = getExpiryLabel(expiresAt)
  const expired = isExpired(expiresAt)
  const viewsLabel = maxViews ? `${viewCount}/${maxViews} views` : `${viewCount} views`

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRevoke = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRevoke(shareId)
  }

  const cardStyle = {
    width: '100%',
    maxWidth: 380,
    height: 220,
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: expired
      ? '0 8px 32px rgba(0,0,0,0.4)'
      : '0 8px 32px rgba(99,102,241,0.2)',
    cursor: 'pointer',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 380,
        height: 220,
        perspective: '1000px',
        position: 'relative',
        mx: 'auto',
      }}
    >
      <MotionBox
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: cardFlip.duration, ease: cardFlip.ease }}
        onClick={() => setFlipped((f) => !f)}
        sx={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {/* Front face */}
        <Box sx={{ ...cardStyle, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Top row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography
                variant="overline"
                sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}
              >
                HC Trust · Share Card
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.85)',
                  mt: 0.25,
                }}
              >
                {truncatedToken}
              </Typography>
            </Box>
            <Tooltip title="Revoke share">
              <IconButton
                size="small"
                onClick={handleRevoke}
                sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#EF4444' } }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Center — doc count */}
          <Typography
            variant="h2"
            sx={{ color: '#fff', fontSize: '22px', fontWeight: 600 }}
          >
            {documentCount} document{documentCount !== 1 ? 's' : ''} shared
          </Typography>

          {/* Bottom row — trust badges */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <TrustBadge
              variant="expires"
              label={expiryLabel}
              size="sm"
            />
            <TrustBadge
              variant="view-limited"
              label={viewsLabel}
              size="sm"
            />
          </Box>

          {/* Tap hint */}
          <Typography
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 16,
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            Tap for QR
          </Typography>
        </Box>

        {/* Back face */}
        <Box
          sx={{
            ...cardStyle,
            transform: 'rotateY(180deg)',
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* QR Code area */}
          <Box
            sx={{
              background: '#fff',
              borderRadius: '12px',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QRCodeSVG
              value={shareUrl}
              size={110}
              level="M"
            />
          </Box>

          {/* URL + actions */}
          <Box sx={{ width: '100%' }}>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center',
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {shareUrl}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <AnimatePresence mode="wait">
                {copied ? (
                  <MotionBox
                    key="check"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 2,
                      py: 0.5,
                      borderRadius: 9999,
                      backgroundColor: 'rgba(16,185,129,0.2)',
                      border: '1px solid rgba(16,185,129,0.3)',
                    }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <CheckIcon sx={{ fontSize: 14, color: '#10B981' }} />
                    <Typography sx={{ fontSize: '11px', color: '#10B981', fontWeight: 500 }}>
                      Copied
                    </Typography>
                  </MotionBox>
                ) : (
                  <MotionBox
                    key="copy"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 2,
                      py: 0.5,
                      borderRadius: 9999,
                      backgroundColor: 'rgba(99,102,241,0.2)',
                      border: '1px solid rgba(99,102,241,0.4)',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(99,102,241,0.3)' },
                    }}
                    onClick={handleCopy}
                  >
                    <ContentCopyIcon sx={{ fontSize: 14, color: '#6366F1' }} />
                    <Typography sx={{ fontSize: '11px', color: '#6366F1', fontWeight: 500 }}>
                      Copy link
                    </Typography>
                  </MotionBox>
                )}
              </AnimatePresence>
            </Box>
          </Box>
        </Box>
      </MotionBox>
    </Box>
  )
}
