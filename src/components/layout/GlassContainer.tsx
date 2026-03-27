import { Box, type SxProps, type Theme } from '@mui/material'
import type { ReactNode } from 'react'

interface GlassContainerProps {
  children: ReactNode
  sx?: SxProps<Theme>
}

export default function GlassContainer({ children, sx }: GlassContainerProps) {
  return (
    <Box
      sx={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        p: 3,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
