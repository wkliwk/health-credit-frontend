import { useLocation, useNavigate } from 'react-router-dom'
import { Box, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import FolderIcon from '@mui/icons-material/Folder'
import ShareIcon from '@mui/icons-material/Share'

const TABS = [
  { path: '/', label: 'Wallet', icon: AccountBalanceWalletIcon },
  { path: '/upload', label: 'Upload', icon: AddCircleOutlineIcon },
  { path: '/documents', label: 'Docs', icon: FolderIcon },
  { path: '/shares', label: 'Share', icon: ShareIcon },
]

export default function BottomNav() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const location = useLocation()
  const navigate = useNavigate()

  if (!isMobile) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(17,24,39,0.9)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        zIndex: 1200,
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map((tab) => {
        const isActive = location.pathname === tab.path
        const Icon = tab.icon
        return (
          <Box
            key={tab.path}
            onClick={() => navigate(tab.path)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.25,
              cursor: 'pointer',
              minWidth: 64,
              position: 'relative',
            }}
          >
            {isActive && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  width: 24,
                  height: 3,
                  borderRadius: 9999,
                  backgroundColor: '#6366F1',
                }}
              />
            )}
            <IconButton
              size="small"
              sx={{
                color: isActive ? '#6366F1' : '#64748B',
                p: 0.5,
              }}
            >
              <Icon fontSize="small" />
            </IconButton>
            <Typography
              sx={{
                fontSize: '10px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#6366F1' : '#64748B',
              }}
            >
              {tab.label}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
