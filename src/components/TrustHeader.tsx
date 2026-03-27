import { Box, Typography } from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import LockIcon from '@mui/icons-material/Lock'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { motion } from 'framer-motion'
import type { ShareAccess } from '../services/shares'
import ExpiryCountdown from './ExpiryCountdown'

const CANONICAL_HOSTNAME = 'healthcredit.app'

const MotionBox = motion.create(Box)

interface TrustPillProps {
  icon: typeof LockIcon
  label: string
  color: string
}

function TrustPill({ icon: Icon, label, color }: TrustPillProps) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.5,
        py: 0.5,
        borderRadius: 9999,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}40`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <Icon sx={{ fontSize: 13, color }} />
      <Typography sx={{ fontSize: '11px', fontWeight: 500, color, lineHeight: 1.5 }}>
        {label}
      </Typography>
    </Box>
  )
}

interface DomainBadgeProps {
  hostname: string
}

function DomainBadge({ hostname }: DomainBadgeProps) {
  const isVerified = hostname === CANONICAL_HOSTNAME
  const color = isVerified ? '#10B981' : '#F59E0B'
  const Icon = isVerified ? VerifiedUserIcon : WarningAmberIcon
  const label = isVerified ? `Verified by ${CANONICAL_HOSTNAME}` : `Unverified domain: ${hostname}`

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 2,
        py: 0.75,
        borderRadius: 9999,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}40`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <Icon sx={{ fontSize: 15, color }} />
      <Typography sx={{ fontSize: '12px', fontWeight: 600, color, letterSpacing: '0.02em' }}>
        {label}
      </Typography>
    </Box>
  )
}

interface TrustHeaderProps {
  token: string
  shareData: ShareAccess
  onExpired: () => void
}

export default function TrustHeader({ token, shareData, onExpired }: TrustHeaderProps) {
  const hostname = window.location.hostname
  const fingerprint = `···${token.slice(-8)}`

  const viewsLabel =
    shareData.maxViews != null
      ? `${shareData.maxViews - shareData.viewCount} view${shareData.maxViews - shareData.viewCount !== 1 ? 's' : ''} remaining`
      : 'Unlimited views'

  return (
    <MotionBox
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Wordmark + domain badge */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mb: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon sx={{ fontSize: 18, color: '#6366F1' }} />
          <Typography
            sx={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.01em',
            }}
          >
            Health Credit
          </Typography>
        </Box>
        <DomainBadge hostname={hostname} />
      </Box>

      {/* Title block */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h1" sx={{ color: '#fff', fontSize: { xs: '22px', sm: '28px' }, fontWeight: 700, mb: 0.5 }}>
          Shared with you
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', mb: 1.5 }}>
          {shareData.documents.length} document{shareData.documents.length !== 1 ? 's' : ''} shared privately
        </Typography>
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.1em',
          }}
        >
          {fingerprint}
        </Typography>
      </Box>

      {/* Trust signals strip */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 3 }}>
        <TrustPill icon={LockIcon} label="End-to-end encrypted" color="#6366F1" />
        <TrustPill icon={CheckCircleOutlineIcon} label="Verified share link" color="#10B981" />
        <TrustPill icon={VisibilityIcon} label={viewsLabel} color="#3B82F6" />
        <ExpiryCountdown expiresAt={shareData.expiresAt} onExpired={onExpired} />
      </Box>

      {/* No account needed copy */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '14px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
          You are viewing health documents shared privately with you. No account is required to view this link. This link expires automatically.
        </Typography>
      </Box>
    </MotionBox>
  )
}
