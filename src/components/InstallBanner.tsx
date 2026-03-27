import { useState, useEffect } from 'react'
import { Box, Button, IconButton, Typography, Slide } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import GetAppIcon from '@mui/icons-material/GetApp'

const DISMISSED_KEY = 'hc_install_dismissed'
const DISMISSED_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
}

function isDismissed(): boolean {
  const val = localStorage.getItem(DISMISSED_KEY)
  if (!val) return false
  const ts = parseInt(val, 10)
  return Date.now() - ts < DISMISSED_DURATION_MS
}

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const [isIOSDevice, setIsIOSDevice] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isInStandaloneMode() || isDismissed()) return

    const ios = isIOS()
    setIsIOSDevice(ios)

    if (ios) {
      setShow(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
    setShow(false)
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
  }

  if (!show) return null

  return (
    <Slide direction="up" in={show} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1400,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <GetAppIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            Add to Home Screen
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isIOSDevice
              ? 'Tap the Share button, then "Add to Home Screen"'
              : 'Install Health Credit for quick access'}
          </Typography>
        </Box>
        {!isIOSDevice && (
          <Button
            variant="contained"
            size="small"
            onClick={handleInstall}
            sx={{ flexShrink: 0 }}
          >
            Install
          </Button>
        )}
        <IconButton size="small" onClick={handleDismiss} sx={{ flexShrink: 0 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Slide>
  )
}
