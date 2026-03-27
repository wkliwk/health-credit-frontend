import { useState } from 'react'
import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import ShieldIcon from '@mui/icons-material/Shield'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import LockIcon from '@mui/icons-material/Lock'

const MotionBox = motion.create(Box)

const STEPS = [
  {
    icon: ShieldIcon,
    iconColor: '#6366F1',
    title: 'Your health, your cards',
    body: 'Upload your health documents and they appear as private wallet cards — only you can see them. Like Apple Wallet, but for health.',
    visual: (
      <Box
        sx={{
          width: 200,
          height: 120,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 2,
          boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 18 }}>🔬</Typography>
          <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>STI</Typography>
        </Box>
        <Typography sx={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>STI Test Results</Typography>
        <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>Mar 2026</Typography>
      </Box>
    ),
  },
  {
    icon: QrCode2Icon,
    iconColor: '#06B6D4',
    title: 'Share privately',
    body: 'Generate a one-time QR code to share with anyone. It expires automatically, has a view limit, and you can revoke it any time.',
    visual: (
      <Box
        sx={{
          width: 200,
          mx: 'auto',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            background: '#fff',
            borderRadius: '8px',
            p: 1,
            width: 72,
            height: 72,
            display: 'grid',
            gridTemplateColumns: 'repeat(7,1fr)',
            gap: '1px',
          }}
        >
          {Array.from({ length: 49 }).map((_, i) => {
            const qrPattern = [
              0,0,0,0,0,0,0,
              0,1,1,1,1,1,0,
              0,1,0,0,0,1,0,
              0,1,0,1,0,1,0,
              0,1,0,0,0,1,0,
              0,1,1,1,1,1,0,
              0,0,0,0,0,0,0,
            ]
            return (
              <Box
                key={i}
                sx={{
                  background: qrPattern[i] ? '#0A0E1A' : 'transparent',
                  borderRadius: '1px',
                }}
              />
            )
          })}
        </Box>
        <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
          3/10 views · 23h left
        </Typography>
      </Box>
    ),
  },
  {
    icon: LockIcon,
    iconColor: '#10B981',
    title: 'Zero knowledge',
    body: 'Your documents are encrypted on your device before upload. We never see the contents. Only you — and who you choose — can ever read them.',
    visual: (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: 200,
          mx: 'auto',
        }}
      >
        {[
          { label: 'End-to-end encrypted', color: '#6366F1' },
          { label: 'Zero-knowledge server', color: '#10B981' },
          { label: 'Auto-expiring links', color: '#F59E0B' },
        ].map(({ label, color }) => (
          <Box
            key={label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: 9999,
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    ),
  },
]

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
}

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
}

export default function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const isLast = step === STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      onClose()
      return
    }
    setDirection(1)
    setStep((s) => s + 1)
  }

  const handleSkip = () => {
    onClose()
  }

  const current = STEPS[step]
  const IconComponent = current.icon

  return (
    <Dialog
      open={open}
      onClose={handleSkip}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(15,18,30,0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, pb: 2 }}>
          {/* Step dots */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, mb: 3 }}>
            {STEPS.map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  borderRadius: 9999,
                  background: i === step ? '#6366F1' : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>

          {/* Animated content */}
          <AnimatePresence mode="wait" custom={direction}>
            <MotionBox
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Visual */}
              <Box sx={{ mb: 3 }}>
                {current.visual}
              </Box>

              {/* Icon + title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: `${current.iconColor}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComponent sx={{ fontSize: 20, color: current.iconColor }} />
                </Box>
                <Typography
                  variant="h2"
                  sx={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}
                >
                  {current.title}
                </Typography>
              </Box>

              <Typography
                sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, mb: 3 }}
              >
                {current.body}
              </Typography>
            </MotionBox>
          </AnimatePresence>

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              onClick={handleSkip}
              sx={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: '13px',
                textTransform: 'none',
                '&:hover': { color: 'rgba(255,255,255,0.6)', background: 'transparent' },
              }}
            >
              Skip
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                borderRadius: 9999,
                px: 3,
                py: 1,
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5558E3, #7C4FE0)',
                  boxShadow: '0 4px 24px rgba(99,102,241,0.5)',
                },
              }}
            >
              {isLast ? 'Get Started' : 'Next'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
