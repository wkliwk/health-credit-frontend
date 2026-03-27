import { Box, Typography } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import VerifiedIcon from '@mui/icons-material/VerifiedUser'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import VisibilityIcon from '@mui/icons-material/Visibility'

type BadgeVariant = 'encrypted' | 'verified' | 'expires' | 'view-limited'

interface TrustBadgeProps {
  variant: BadgeVariant
  label?: string
  size?: 'sm' | 'md'
}

const BADGE_CONFIG: Record<BadgeVariant, { icon: typeof LockIcon; color: string; defaultLabel: string }> = {
  encrypted: { icon: LockIcon, color: '#6366F1', defaultLabel: 'Encrypted' },
  verified: { icon: VerifiedIcon, color: '#10B981', defaultLabel: 'Verified' },
  expires: { icon: AccessTimeIcon, color: '#F59E0B', defaultLabel: 'Expires' },
  'view-limited': { icon: VisibilityIcon, color: '#3B82F6', defaultLabel: 'Limited' },
}

export default function TrustBadge({ variant, label, size = 'sm' }: TrustBadgeProps) {
  const config = BADGE_CONFIG[variant]
  const IconComponent = config.icon
  const iconSize = size === 'sm' ? 14 : 18
  const fontSize = size === 'sm' ? '11px' : '12px'

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: size === 'sm' ? 1 : 1.5,
        py: 0.25,
        borderRadius: 9999,
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <IconComponent sx={{ fontSize: iconSize, color: config.color }} />
      <Typography sx={{ fontSize, fontWeight: 500, color: config.color, lineHeight: 1.5 }}>
        {label || config.defaultLabel}
      </Typography>
    </Box>
  )
}
