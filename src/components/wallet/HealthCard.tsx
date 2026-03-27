import { Box, Typography, Chip } from '@mui/material'
import { motion } from 'framer-motion'
import {
  CARD_GRADIENTS,
  CARD_ICONS,
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
  detectDocumentType,
} from '../../constants/gradients'
import { cardHover, cardTap } from '../../constants/animations'
import TrustBadge from './TrustBadge'

interface HealthCardProps {
  fileName: string
  documentType?: DocumentType
  date: string
  expiresAt?: string | null
  encrypted?: boolean
  size?: 'compact' | 'full'
  onTap?: () => void
  selected?: boolean
}

const MotionBox = motion.create(Box)

export default function HealthCard({
  fileName,
  documentType,
  date,
  expiresAt,
  encrypted = true,
  size = 'compact',
  onTap,
  selected,
}: HealthCardProps) {
  // Prefer explicit documentType from API response; fall back to filename detection for old docs
  const type: DocumentType = documentType ?? detectDocumentType(fileName)
  const gradient = CARD_GRADIENTS[type]
  const icon = CARD_ICONS[type]
  const label = DOCUMENT_TYPE_LABELS[type]
  const height = size === 'compact' ? 200 : 260

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

  const getExpiryLabel = () => {
    if (!expiresAt) return null
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h remaining`
    return `${Math.floor(hours / 24)}d remaining`
  }

  return (
    <MotionBox
      whileHover={cardHover}
      whileTap={onTap ? cardTap : undefined}
      onClick={onTap}
      sx={{
        width: '100%',
        maxWidth: 380,
        height,
        borderRadius: '24px',
        background: gradient,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onTap ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: selected
          ? '0 0 0 3px #6366F1, 0 8px 32px rgba(0,0,0,0.4)'
          : '0 8px 32px rgba(0,0,0,0.4)',
        transition: 'box-shadow 0.2s ease',
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
      {/* Top row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 28 }}>{icon}</Typography>
          <Typography
            variant="overline"
            sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}
          >
            {label}
          </Typography>
        </Box>
        {encrypted && <TrustBadge variant="encrypted" size="sm" />}
      </Box>

      {/* Center — file name */}
      <Typography
        variant="h2"
        sx={{
          color: '#fff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.3,
        }}
      >
        {fileName}
      </Typography>

      {/* Bottom row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            {formatDate(date)}
          </Typography>
          {/* Type badge — shown for all non-OTHER docs as a secondary label */}
          {type !== 'OTHER' && (
            <Chip
              label={label}
              size="small"
              sx={{
                height: 18,
                fontSize: '10px',
                fontWeight: 600,
                backgroundColor: 'rgba(0,0,0,0.25)',
                color: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(4px)',
                '& .MuiChip-label': { px: 1 },
              }}
            />
          )}
        </Box>
        {expiresAt && (
          <TrustBadge variant="expires" label={getExpiryLabel() || undefined} size="sm" />
        )}
      </Box>
    </MotionBox>
  )
}
