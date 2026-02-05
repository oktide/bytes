import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Slider,
  Alert,
  Divider,
} from '@mui/material'
import { Mail as MailIcon, Logout as LogoutIcon } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { useHousehold } from '../hooks/useHousehold'

interface OnboardingPageProps {
  onComplete: () => void
}

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { user, refreshProfile, signOut } = useAuth()
  const {
    pendingInvitations,
    createHousehold,
    acceptInvitation,
    declineInvitation,
    isCreating,
  } = useHousehold()

  const [householdName, setHouseholdName] = useState('')
  const [familySize, setFamilySize] = useState(4)
  const [weeklyBudget, setWeeklyBudget] = useState(300)
  const [error, setError] = useState<string | null>(null)

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!householdName.trim() || !user) return

    setError(null)

    try {
      const household = await createHousehold(householdName.trim(), user.id)
      // Update with family size and budget
      const { updateHousehold } = await import('../lib/api')
      await updateHousehold(household.id, {
        family_size: familySize,
        weekly_budget: weeklyBudget,
      })
      await refreshProfile()
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create household')
    }
  }

  const handleAccept = async (invitationId: string) => {
    if (!user) return
    setError(null)
    try {
      await acceptInvitation(invitationId, user.id)
      await refreshProfile()
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation')
    }
  }

  const handleDecline = async (invitationId: string) => {
    setError(null)
    try {
      await declineInvitation(invitationId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline invitation')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="header"
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 3,
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ width: 40 }} />
            <Typography variant="h3" component="h1">
              Bytes
            </Typography>
            <Button
              color="inherit"
              size="small"
              onClick={signOut}
              startIcon={<LogoutIcon />}
              sx={{ minWidth: 'auto' }}
            >
              Logout
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Welcome to Bytes!
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {pendingInvitations.length > 0 && (
            <>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                You have been invited to join a household:
              </Typography>

              {pendingInvitations.map((invitation) => (
                <Alert
                  key={invitation.id}
                  severity="info"
                  icon={<MailIcon />}
                  sx={{ mb: 2 }}
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleAccept(invitation.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDecline(invitation.id)}
                      >
                        Decline
                      </Button>
                    </Box>
                  }
                >
                  <Typography variant="body2" fontWeight="medium">
                    {invitation.household_name}
                  </Typography>
                </Alert>
              ))}

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  or create your own
                </Typography>
              </Divider>
            </>
          )}

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {pendingInvitations.length > 0
              ? 'Create a new household instead:'
              : "Let's set up your household. This is where your meal plans and preferences will be saved."}
          </Typography>

          <form onSubmit={handleCreateHousehold}>
            <TextField
              label="Household Name"
              fullWidth
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="e.g., The Smith Family, Our Home"
              sx={{ mb: 3 }}
              autoFocus={pendingInvitations.length === 0}
            />

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Family Size: {familySize}</Typography>
              <Slider
                value={familySize}
                onChange={(_, value) => setFamilySize(value as number)}
                min={1}
                max={10}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Weekly Budget: ${weeklyBudget}</Typography>
              <Slider
                value={weeklyBudget}
                onChange={(_, value) => setWeeklyBudget(value as number)}
                min={50}
                max={500}
                step={25}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `$${value}`}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isCreating || !householdName.trim()}
            >
              {isCreating ? <CircularProgress size={24} color="inherit" /> : 'Create Household'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}
