import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { CARD_GRADIENTS, CARD_ICONS, type DocumentType, detectDocumentType } from '../../constants/gradients'
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
  const type = documentType || detectDocumentType(fileName)
  const gradient = CARD_GRADIENTS[type]
  const icon = CARD_ICONS[type]
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
            {type}
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
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          {formatDate(date)}
        </Typography>
        {expiresAt && (
          <TrustBadge variant="expires" label={getExpiryLabel() || undefined} size="sm" />
        )}
      </Box>
    </MotionBox>
  )
}
