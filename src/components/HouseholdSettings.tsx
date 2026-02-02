import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Alert,
  Chip,
  Tabs,
  Tab,
  Slider,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useHousehold } from '../hooks/useHousehold'
import { useAuth } from '../hooks/useAuth'
import { useMealPreferences } from '../hooks/useMealPreferences'

interface HouseholdSettingsProps {
  open: boolean
  onClose: () => void
}

export default function HouseholdSettings({ open, onClose }: HouseholdSettingsProps) {
  const { user } = useAuth()
  const {
    activeHousehold,
    members,
    invitations,
    isLoadingMembers,
    updateHousehold,
    removeMember,
    inviteMember,
    cancelInvitation,
    isUpdating,
    isInviting,
  } = useHousehold()

  const { preferences, removePreference } = useMealPreferences()

  const [tab, setTab] = useState(0)
  const [householdName, setHouseholdName] = useState(activeHousehold?.name || '')
  const [familySize, setFamilySize] = useState(activeHousehold?.family_size || 4)
  const [weeklyBudget, setWeeklyBudget] = useState(activeHousehold?.weekly_budget || 300)
  const [inviteEmail, setInviteEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const currentUserMember = members.find((m) => m.user_id === user?.id)
  const isOwner = currentUserMember?.role === 'owner'

  const handleSaveSettings = async () => {
    if (!activeHousehold || !householdName.trim()) return
    setError(null)
    try {
      await updateHousehold(activeHousehold.id, {
        name: householdName.trim(),
        family_size: familySize,
        weekly_budget: weeklyBudget,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update household')
    }
  }

  const hasChanges = activeHousehold && (
    householdName !== activeHousehold.name ||
    familySize !== activeHousehold.family_size ||
    weeklyBudget !== activeHousehold.weekly_budget
  )

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeHousehold || !user || !inviteEmail.trim()) return
    setError(null)
    try {
      await inviteMember(activeHousehold.id, inviteEmail.trim(), user.id)
      setInviteEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!activeHousehold) return
    try {
      await removeMember(activeHousehold.id, userId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel invitation')
    }
  }

  const handleRemovePreference = async (preferenceId: string) => {
    try {
      await removePreference(preferenceId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove preference')
    }
  }

  if (!activeHousehold) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Household Settings
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3 }}>
        <Tab label="General" />
        <Tab label="Members" />
        <Tab label="Preferences" />
      </Tabs>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {tab === 0 && (
          <Box>
            <TextField
              label="Household Name"
              fullWidth
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              sx={{ mb: 3 }}
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
              variant="contained"
              onClick={handleSaveSettings}
              disabled={isUpdating || !hasChanges}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Members
            </Typography>

            {isLoadingMembers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List dense>
                {members.map((member) => (
                  <ListItem key={member.id}>
                    <ListItemAvatar>
                      <Avatar src={member.profile?.avatar_url || undefined}>
                        {member.profile?.display_name?.[0] || '?'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.profile?.display_name || 'Unknown'}
                      secondary={member.role === 'owner' ? 'Owner' : 'Member'}
                    />
                    {isOwner && member.user_id !== user?.id && (
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveMember(member.user_id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            )}

            {invitations.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Pending Invitations
                </Typography>
                <List dense>
                  {invitations.map((invitation) => (
                    <ListItem key={invitation.id}>
                      <ListItemText primary={invitation.email} secondary="Pending" />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Invite Member
            </Typography>
            <form onSubmit={handleInvite}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Email address"
                  type="email"
                  size="small"
                  fullWidth
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isInviting || !inviteEmail.trim()}
                  startIcon={isInviting ? <CircularProgress size={16} /> : <PersonAddIcon />}
                >
                  Invite
                </Button>
              </Box>
            </form>
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Meals you&apos;ve liked or disliked will influence future meal plan suggestions.
            </Typography>

            {preferences.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No meal preferences yet. Use the thumbs up/down buttons on meals to save preferences.
              </Typography>
            ) : (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Liked Meals
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {preferences
                    .filter((p) => p.preference === 'liked')
                    .map((pref) => (
                      <Chip
                        key={pref.id}
                        label={pref.meal_description}
                        color="success"
                        variant="outlined"
                        onDelete={() => handleRemovePreference(pref.id)}
                      />
                    ))}
                  {preferences.filter((p) => p.preference === 'liked').length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No liked meals yet
                    </Typography>
                  )}
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Disliked Meals
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {preferences
                    .filter((p) => p.preference === 'disliked')
                    .map((pref) => (
                      <Chip
                        key={pref.id}
                        label={pref.meal_description}
                        color="error"
                        variant="outlined"
                        onDelete={() => handleRemovePreference(pref.id)}
                      />
                    ))}
                  {preferences.filter((p) => p.preference === 'disliked').length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No disliked meals yet
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
