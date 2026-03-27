import { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { motion } from 'framer-motion'

export type ExpiryState = 'valid' | 'expiring-soon' | 'expired'

export function getExpiryState(expiresAt: string): ExpiryState {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'expired'
  if (ms < 6 * 60 * 60 * 1000) return 'expiring-soon'
  return 'valid'
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Expired'
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

interface ExpiryCountdownProps {
  expiresAt: string
  onExpired?: () => void
}

const MotionBox = motion.create(Box)

export default function ExpiryCountdown({ expiresAt, onExpired }: ExpiryCountdownProps) {
  const [msRemaining, setMsRemaining] = useState(() => new Date(expiresAt).getTime() - Date.now())

  useEffect(() => {
    const tick = () => {
      const remaining = new Date(expiresAt).getTime() - Date.now()
      setMsRemaining(remaining)
      if (remaining <= 0) {
        clearInterval(id)
        onExpired?.()
      }
    }

    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpired])

  const state = getExpiryState(expiresAt)
  const expired = state === 'expired' || msRemaining <= 0
  const expiringSoon = !expired && msRemaining < 6 * 60 * 60 * 1000
  const underSixtySeconds = !expired && msRemaining < 60 * 1000

  const color = expired ? '#EF4444' : expiringSoon ? '#F59E0B' : '#10B981'
  const label = expired ? 'This link has expired' : `Expires in ${formatCountdown(msRemaining)}`

  return (
    <MotionBox
      animate={underSixtySeconds ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
      transition={underSixtySeconds ? { repeat: Infinity, duration: 1 } : {}}
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
      <AccessTimeIcon sx={{ fontSize: 13, color }} />
      <Typography sx={{ fontSize: '11px', fontWeight: 600, color, lineHeight: 1.5 }}>
        {label}
      </Typography>
    </MotionBox>
  )
}
