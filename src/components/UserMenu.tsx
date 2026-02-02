import { useState } from 'react'
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import {
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import HouseholdSwitcher from './HouseholdSwitcher'
import HouseholdSettings from './HouseholdSettings'

export default function UserMenu() {
  const { user, profile, activeHousehold, signOut } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleSignOut = async () => {
    handleCloseMenu()
    await signOut()
  }

  const handleOpenSwitcher = () => {
    handleCloseMenu()
    setSwitcherOpen(true)
  }

  const handleOpenSettings = () => {
    handleCloseMenu()
    setSettingsOpen(true)
  }

  if (!user) return null

  const initials = profile?.display_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user.email?.[0].toUpperCase() || '?'

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {activeHousehold && (
          <Typography variant="body2" sx={{ opacity: 0.9, display: { xs: 'none', sm: 'block' } }}>
            {activeHousehold.name}
          </Typography>
        )}
        <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
          <Avatar
            src={profile?.avatar_url || undefined}
            sx={{ bgcolor: 'primary.dark', width: 36, height: 36 }}
          >
            {initials}
          </Avatar>
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2">{profile?.display_name || 'User'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleOpenSwitcher}>
          <ListItemIcon>
            <SwapHorizIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Switch Household</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Household Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>

      <HouseholdSwitcher open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
      <HouseholdSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
