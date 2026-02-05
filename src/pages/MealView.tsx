import { useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Drawer,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Alert,
  Paper,
  Chip,
} from '@mui/material'
import {
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Restaurant as RestaurantIcon,
  History as HistoryIcon,
} from '@mui/icons-material'
import { useMealPlanner } from '../hooks/useMealPlanner'
import { useAuth } from '../hooks/useAuth'
import UserMenu from '../components/UserMenu'
import WeekNavigator from '../components/WeekNavigator'
import WeeklyCalendar from '../components/WeeklyCalendar'
import GeneratePlanDialog from '../components/GeneratePlanDialog'
import GroceryListDrawer from '../components/GroceryListDrawer'
import { formatWeekDisplay } from '../lib/dateUtils'

export default function MealView() {
  const { activeHousehold } = useAuth()
  const {
    currentPlan,
    selectedWeek,
    isCurrentWeek,
    hasExistingPlan,
    history,
    isLoading,
    isLoadingHistory,
    isGenerating,
    isSaving,
    generateError,
    generate,
    navigateToNextWeek,
    navigateToPreviousWeek,
    navigateToCurrentWeek,
    navigateToWeek,
  } = useMealPlanner()

  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [groceryDrawerOpen, setGroceryDrawerOpen] = useState(false)
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)

  const familySize = activeHousehold?.family_size || 4
  const weeklyBudget = activeHousehold?.weekly_budget || 300

  const handleGenerate = (dietaryNotes: string) => {
    generate({ familySize, weeklyBudget, dietaryNotes })
    setGenerateDialogOpen(false)
  }

  const handleSelectWeek = (weekStartDate: string) => {
    navigateToWeek(weekStartDate)
    setHistoryDrawerOpen(false)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="header"
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 2,
          px: 2,
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Bytes
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, order: { xs: 3, md: 2 }, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <WeekNavigator
                selectedWeek={selectedWeek}
                isCurrentWeek={isCurrentWeek}
                onPrevious={navigateToPreviousWeek}
                onNext={navigateToNextWeek}
                onToday={navigateToCurrentWeek}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, order: { xs: 2, md: 3 } }}>
              <IconButton
                color="inherit"
                onClick={() => setHistoryDrawerOpen(true)}
                aria-label="View history"
              >
                <HistoryIcon />
              </IconButton>
              <UserMenu />
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {generateError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generateError.message}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Loading meal plan...
            </Typography>
          </Box>
        ) : currentPlan ? (
          <>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
              <Chip label={`Family of ${currentPlan.familySize}`} size="small" />
              <Chip label={`Budget: $${currentPlan.weeklyBudget}`} size="small" />
              <Chip
                label={`Estimated: ${currentPlan.estimatedWeeklyTotal}`}
                color="primary"
                size="small"
              />
              {isSaving && (
                <Chip
                  icon={<CircularProgress size={14} />}
                  label="Saving..."
                  size="small"
                  variant="outlined"
                />
              )}
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setGenerateDialogOpen(true)}
                  disabled={isGenerating || isSaving}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => setGroceryDrawerOpen(true)}
                >
                  Groceries
                </Button>
              </Box>
            </Box>
            <WeeklyCalendar plan={currentPlan} weekStart={selectedWeek} />
          </>
        ) : (
          <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
            <RestaurantIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No meal plan for this week
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Generate a plan to get started with your weekly meals and grocery list.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setGenerateDialogOpen(true)}
              disabled={isGenerating}
            >
              Generate Plan
            </Button>
          </Paper>
        )}
      </Container>

      <GeneratePlanDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        hasExistingPlan={hasExistingPlan}
        selectedWeek={selectedWeek}
        familySize={familySize}
        weeklyBudget={weeklyBudget}
      />

      <GroceryListDrawer
        open={groceryDrawerOpen}
        onClose={() => setGroceryDrawerOpen(false)}
        plan={currentPlan}
      />

      <Drawer
        anchor="right"
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
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
                <ListItem key={saved.id} disablePadding>
                  <ListItemButton
                    onClick={() => saved.week_start_date && handleSelectWeek(saved.week_start_date)}
                    disabled={!saved.week_start_date}
                  >
                    <ListItemText
                      primary={saved.week_start_date
                        ? formatWeekDisplay(new Date(saved.week_start_date + 'T00:00:00'))
                        : 'Unknown week'
                      }
                      secondary={`Family of ${saved.family_size} | $${saved.weekly_budget}/week`}
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
