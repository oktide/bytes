import { Box, Typography, IconButton, Tooltip } from '@mui/material'
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
} from '@mui/icons-material'
import { MealDay } from '../lib/api'
import { formatDayDate, getDayOfWeek } from '../lib/dateUtils'
import { useMealPreferences } from '../hooks/useMealPreferences'
import { useAuth } from '../hooks/useAuth'

interface CalendarDayColumnProps {
  day: MealDay
  weekStart: Date
  dayIndex: number
}

type MealType = 'breakfast' | 'lunch' | 'dinner'

interface MealCellProps {
  label: string
  meal: string
  mealType: MealType
  onLike: () => void
  onDislike: () => void
  currentPreference: 'liked' | 'disliked' | null
  disabled: boolean
  showCost?: string
}

function MealCell({
  label,
  meal,
  onLike,
  onDislike,
  currentPreference,
  disabled,
  showCost,
}: MealCellProps) {
  return (
    <Box
      sx={{
        p: 1,
        borderBottom: 1,
        borderColor: 'divider',
        minHeight: 80,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ flex: 1, fontSize: '0.8rem', lineHeight: 1.3 }}>
        {meal}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
        {showCost && (
          <Typography variant="caption" color="text.secondary">
            {showCost}
          </Typography>
        )}
        {!disabled && (
          <Box sx={{ display: 'flex', ml: 'auto' }}>
            <Tooltip title={currentPreference === 'liked' ? 'Remove like' : 'Like'}>
              <IconButton
                size="small"
                onClick={onLike}
                color={currentPreference === 'liked' ? 'success' : 'default'}
                sx={{ p: 0.25 }}
              >
                {currentPreference === 'liked' ? (
                  <ThumbUpIcon sx={{ fontSize: 14 }} />
                ) : (
                  <ThumbUpOutlinedIcon sx={{ fontSize: 14 }} />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title={currentPreference === 'disliked' ? 'Remove dislike' : 'Dislike'}>
              <IconButton
                size="small"
                onClick={onDislike}
                color={currentPreference === 'disliked' ? 'error' : 'default'}
                sx={{ p: 0.25 }}
              >
                {currentPreference === 'disliked' ? (
                  <ThumbDownIcon sx={{ fontSize: 14 }} />
                ) : (
                  <ThumbDownOutlinedIcon sx={{ fontSize: 14 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default function CalendarDayColumn({ day, weekStart, dayIndex }: CalendarDayColumnProps) {
  const { user, activeHousehold } = useAuth()
  const { getPreferenceForMeal, addPreference, removePreference } = useMealPreferences()

  const isDisabled = !user || !activeHousehold
  const dayDate = getDayOfWeek(weekStart, dayIndex)

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
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        borderRight: 1,
        borderColor: 'divider',
        '&:last-child': { borderRight: 0 },
      }}
    >
      <Box
        sx={{
          p: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          textAlign: 'center',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {day.day}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          {formatDayDate(dayDate)}
        </Typography>
      </Box>

      <MealCell
        label="Breakfast"
        meal={day.breakfast}
        mealType="breakfast"
        onLike={() => handlePreference('breakfast', day.breakfast, 'liked')}
        onDislike={() => handlePreference('breakfast', day.breakfast, 'disliked')}
        currentPreference={getPreference('breakfast', day.breakfast)}
        disabled={isDisabled}
      />

      <MealCell
        label="Lunch"
        meal={day.lunch}
        mealType="lunch"
        onLike={() => handlePreference('lunch', day.lunch, 'liked')}
        onDislike={() => handlePreference('lunch', day.lunch, 'disliked')}
        currentPreference={getPreference('lunch', day.lunch)}
        disabled={isDisabled}
      />

      <MealCell
        label="Dinner"
        meal={day.dinner}
        mealType="dinner"
        onLike={() => handlePreference('dinner', day.dinner, 'liked')}
        onDislike={() => handlePreference('dinner', day.dinner, 'disliked')}
        currentPreference={getPreference('dinner', day.dinner)}
        disabled={isDisabled}
        showCost={day.dinnerCost}
      />
    </Box>
  )
}
