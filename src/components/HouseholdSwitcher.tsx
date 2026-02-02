import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Box,
  Badge,
  Typography,
  Divider,
  Alert,
} from '@mui/material'
import {
  Home as HomeIcon,
  Check as CheckIcon,
  Mail as MailIcon,
} from '@mui/icons-material'
import { useHousehold } from '../hooks/useHousehold'
import { useAuth } from '../hooks/useAuth'

interface HouseholdSwitcherProps {
  open: boolean
  onClose: () => void
}

export default function HouseholdSwitcher({ open, onClose }: HouseholdSwitcherProps) {
  const { user } = useAuth()
  const {
    households,
    activeHousehold,
    pendingInvitations,
    isLoadingHouseholds,
    switchHousehold,
    acceptInvitation,
    declineInvitation,
  } = useHousehold()

  const handleSelectHousehold = async (householdId: string) => {
    if (householdId !== activeHousehold?.id) {
      await switchHousehold(householdId)
    }
    onClose()
  }

  const handleAccept = async (invitationId: string) => {
    if (user) {
      await acceptInvitation(invitationId, user.id)
    }
  }

  const handleDecline = async (invitationId: string) => {
    await declineInvitation(invitationId)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Switch Household</DialogTitle>
      <DialogContent>
        {isLoadingHouseholds ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <List disablePadding>
              {households.map((household) => (
                <ListItem key={household.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelectHousehold(household.id)}
                    selected={household.id === activeHousehold?.id}
                  >
                    <ListItemIcon>
                      <Badge
                        invisible={household.id !== activeHousehold?.id}
                        badgeContent={<CheckIcon sx={{ fontSize: 12 }} />}
                        color="success"
                      >
                        <HomeIcon />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText primary={household.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {pendingInvitations.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Pending Invitations
                </Typography>
                {pendingInvitations.map((invitation) => (
                  <Alert
                    key={invitation.id}
                    severity="info"
                    icon={<MailIcon />}
                    sx={{ mb: 1 }}
                    action={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography
                          component="button"
                          onClick={() => handleAccept(invitation.id)}
                          sx={{
                            background: 'none',
                            border: 'none',
                            color: 'success.main',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Accept
                        </Typography>
                        <Typography
                          component="button"
                          onClick={() => handleDecline(invitation.id)}
                          sx={{
                            background: 'none',
                            border: 'none',
                            color: 'error.main',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Decline
                        </Typography>
                      </Box>
                    }
                  >
                    {invitation.household.name}
                  </Alert>
                ))}
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
