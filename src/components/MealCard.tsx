import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
} from '@mui/icons-material'
import { MealDay } from '../lib/api'
import { useMealPreferences } from '../hooks/useMealPreferences'
import { useAuth } from '../hooks/useAuth'

interface MealCardProps {
  day: MealDay
}

type MealType = 'breakfast' | 'lunch' | 'dinner'

interface MealRowProps {
  label: string
  meal: string
  onLike: () => void
  onDislike: () => void
  currentPreference: 'liked' | 'disliked' | null
  disabled: boolean
}

function MealRow({ label, meal, onLike, onDislike, currentPreference, disabled }: MealRowProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2">
          <strong>{label}:</strong> {meal}
        </Typography>
      </Box>
      {!disabled && (
        <Box sx={{ display: 'flex', ml: 1, flexShrink: 0 }}>
          <Tooltip title={currentPreference === 'liked' ? 'Remove like' : 'Like this meal'}>
            <IconButton
              size="small"
              onClick={onLike}
              color={currentPreference === 'liked' ? 'success' : 'default'}
              sx={{ p: 0.5 }}
            >
              {currentPreference === 'liked' ? (
                <ThumbUpIcon fontSize="small" />
              ) : (
                <ThumbUpOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title={currentPreference === 'disliked' ? 'Remove dislike' : 'Dislike this meal'}>
            <IconButton
              size="small"
              onClick={onDislike}
              color={currentPreference === 'disliked' ? 'error' : 'default'}
              sx={{ p: 0.5 }}
            >
              {currentPreference === 'disliked' ? (
                <ThumbDownIcon fontSize="small" />
              ) : (
                <ThumbDownOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  )
}

export default function MealCard({ day }: MealCardProps) {
  const { user, activeHousehold } = useAuth()
  const { getPreferenceForMeal, addPreference, removePreference } = useMealPreferences()

  const isDisabled = !user || !activeHousehold

  const handlePreference = async (
    mealType: MealType,
    mealDescription: string,
    preference: 'liked' | 'disliked'
  ) => {
    const existing = getPreferenceForMeal(mealType, mealDescription)
    if (existing?.preference === preference) {
      await removePreference(existing.id)
    } else {
      await addPreference(mealType, mealDescription, preference)
    }
  }

  const getPreference = (mealType: MealType, meal: string): 'liked' | 'disliked' | null => {
    const pref = getPreferenceForMeal(mealType, meal)
    return pref?.preference || null
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          {day.day}
        </Typography>

        <MealRow
          label="Breakfast"
          meal={day.breakfast}
          onLike={() => handlePreference('breakfast', day.breakfast, 'liked')}
          onDislike={() => handlePreference('breakfast', day.breakfast, 'disliked')}
          currentPreference={getPreference('breakfast', day.breakfast)}
          disabled={isDisabled}
        />

        <MealRow
          label="Lunch"
          meal={day.lunch}
          onLike={() => handlePreference('lunch', day.lunch, 'liked')}
          onDislike={() => handlePreference('lunch', day.lunch, 'disliked')}
          currentPreference={getPreference('lunch', day.lunch)}
          disabled={isDisabled}
        />

        <MealRow
          label="Dinner"
          meal={day.dinner}
          onLike={() => handlePreference('dinner', day.dinner, 'liked')}
          onDislike={() => handlePreference('dinner', day.dinner, 'disliked')}
          currentPreference={getPreference('dinner', day.dinner)}
          disabled={isDisabled}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Dinner cost: {day.dinnerCost}
        </Typography>
      </CardContent>
    </Card>
  )
}
