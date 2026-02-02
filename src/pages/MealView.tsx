import { useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
  Alert,
  Divider,
  Chip,
} from '@mui/material'
import {
  Menu as MenuIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useMealPlanner } from '../hooks/useMealPlanner'
import { useAuth } from '../hooks/useAuth'
import MealCard from '../components/MealCard'
import UserMenu from '../components/UserMenu'

export default function MealView() {
  const { activeHousehold } = useAuth()
  const {
    currentPlan,
    history,
    isLoadingHistory,
    isGenerating,
    isSaving,
    generateError,
    generate,
    save,
    loadPlan,
    clearPlan,
    removePlan,
  } = useMealPlanner()

  const [dietaryNotes, setDietaryNotes] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const familySize = activeHousehold?.family_size || 4
  const weeklyBudget = activeHousehold?.weekly_budget || 300

  const handleGenerate = () => {
    generate({ familySize, weeklyBudget, dietaryNotes })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
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
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h3" component="h1">
              Bytes
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open history"
              >
                <HistoryIcon />
              </IconButton>
              <UserMenu />
            </Box>
          </Box>
          <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
            Budget-conscious weekly meal planning
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Generate Plan
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Family Size: {familySize} | Budget: ${weeklyBudget}/week
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Change in Household Settings)
                </Typography>
              </Box>

              <TextField
                label="Dietary Notes"
                multiline
                rows={3}
                fullWidth
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                placeholder="e.g., vegetarian, no shellfish, kid-friendly..."
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                    Generating...
                  </>
                ) : (
                  'Generate Plan'
                )}
              </Button>

              {generateError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {generateError.message}
                </Alert>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            {currentPlan ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">
                    Your Meal Plan
                  </Typography>
                  <Box>
                    <Button
                      variant="outlined"
                      onClick={clearPlan}
                      sx={{ mr: 1 }}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="contained"
                      onClick={save}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Plan'}
                    </Button>
                  </Box>
                </Box>

                <Paper sx={{ p: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip label={`Family of ${currentPlan.familySize}`} />
                    <Chip label={`Budget: $${currentPlan.weeklyBudget}`} />
                    <Chip
                      label={`Estimated Total: ${currentPlan.estimatedWeeklyTotal}`}
                      color="primary"
                    />
                  </Box>
                </Paper>

                <Typography variant="h6" gutterBottom>
                  Weekly Meals
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {currentPlan.days.map((day) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={day.day}>
                      <MealCard day={day} />
                    </Grid>
                  ))}
                </Grid>

                <Typography variant="h6" gutterBottom>
                  Grocery List
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(currentPlan.groceries).map(([store, items]) => (
                    <Grid size={{ xs: 12, md: 6 }} key={store}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {store}
                        </Typography>
                        <List dense disablePadding>
                          {items.map((item, idx) => (
                            <ListItem key={idx} disablePadding>
                              <ListItemText
                                primary={item.item}
                                secondary={item.price}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <MenuIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No meal plan yet
                </Typography>
                <Typography color="text.secondary">
                  Adjust your preferences and click "Generate Plan" to get started
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 320, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Saved Plans
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {isLoadingHistory ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : history.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No saved plans yet
            </Typography>
          ) : (
            <List>
              {history.map((saved) => (
                <ListItem
                  key={saved.id}
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => removePlan(saved.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    onClick={() => {
                      loadPlan(saved.plan)
                      setDrawerOpen(false)
                    }}
                  >
                    <ListItemText
                      primary={formatDate(saved.created_at)}
                      secondary={`Family of ${saved.family_size} • $${saved.weekly_budget}/week`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </Box>
  )
}
