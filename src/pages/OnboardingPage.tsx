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
} from '@mui/material'
import { useAuth } from '../hooks/useAuth'
import { updateHousehold } from '../lib/api'

interface OnboardingPageProps {
  onComplete: () => void
}

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { activeHousehold, refreshProfile } = useAuth()
  const [householdName, setHouseholdName] = useState('')
  const [familySize, setFamilySize] = useState(4)
  const [weeklyBudget, setWeeklyBudget] = useState(300)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!householdName.trim() || !activeHousehold) return

    setIsLoading(true)
    setError(null)

    try {
      await updateHousehold(activeHousehold.id, {
        name: householdName.trim(),
        family_size: familySize,
        weekly_budget: weeklyBudget,
      })
      await refreshProfile()
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsLoading(false)
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
          <Typography variant="h3" component="h1" align="center">
            Bytes
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Welcome to Bytes!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Let's set up your household. This is where your meal plans and preferences will be saved.
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Household Name"
              fullWidth
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="e.g., The Smith Family, Our Home"
              sx={{ mb: 3 }}
              autoFocus
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

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading || !householdName.trim()}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Get Started'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}
