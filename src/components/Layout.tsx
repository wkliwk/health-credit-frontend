import { Outlet, Link as RouterLink } from 'react-router-dom'
import { AppBar, Box, Button, Container, IconButton, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FolderIcon from '@mui/icons-material/Folder'
import ShareIcon from '@mui/icons-material/Share'
import LogoutIcon from '@mui/icons-material/Logout'
import ShieldIcon from '@mui/icons-material/Shield'
import { useAuth } from '../context/AuthContext'
import BottomNav from './navigation/BottomNav'

function Layout() {
  const { logout, user } = useAuth()
  const muiTheme = useTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <ShieldIcon sx={{ color: '#6366F1', fontSize: 28 }} />
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Health Credit
            </Typography>
          </Box>
          {!isMobile && (
            <>
              <Button color="inherit" component={RouterLink} to="/upload" startIcon={<CloudUploadIcon />} sx={{ mx: 0.5 }}>
                Upload
              </Button>
              <Button color="inherit" component={RouterLink} to="/documents" startIcon={<FolderIcon />} sx={{ mx: 0.5 }}>
                Documents
              </Button>
              <Button color="inherit" component={RouterLink} to="/shares" startIcon={<ShareIcon />} sx={{ mx: 0.5 }}>
                Share
              </Button>
            </>
          )}
          {user && (
            <Tooltip title={`Logout (${user.email})`}>
              <IconButton onClick={logout} color="inherit" aria-label="logout" sx={{ ml: 1 }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flex: 1, py: 4, pb: isMobile ? 12 : 4 }}>
        <Outlet />
      </Container>
      <BottomNav />
    </Box>
  )
}

export default Layout
