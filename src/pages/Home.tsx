import { Box, Button, Typography } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'

function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 3,
        textAlign: 'center',
      }}
    >
      <LockIcon sx={{ fontSize: 64, color: 'primary.main' }} />
      <Typography variant="h3" fontWeight={700}>
        Health Credit
      </Typography>
      <Typography variant="h6" color="text.secondary" maxWidth={480}>
        Private health document sharing — encrypted, expiring links, zero-knowledge.
      </Typography>
      <Button variant="contained" size="large" disableElevation>
        Get Started
      </Button>
    </Box>
  )
}

export default Home
