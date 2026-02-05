import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
} from '@mui/icons-material'
import { MealPlan, MealDay } from '../lib/api'
import { formatDayDate, getDayOfWeek } from '../lib/dateUtils'
import CalendarDayColumn from './CalendarDayColumn'
import { useMealPreferences } from '../hooks/useMealPreferences'
import { useAuth } from '../hooks/useAuth'

interface WeeklyCalendarProps {
  plan: MealPlan
  weekStart: Date
}

interface MobileDayAccordionProps {
  day: MealDay
  weekStart: Date
  dayIndex: number
  expanded: boolean
  onChange: () => void
}

type MealType = 'breakfast' | 'lunch' | 'dinner'

interface MobileMealRowProps {
  label: string
  meal: string
  mealType: MealType
  onLike: () => void
  onDislike: () => void
  currentPreference: 'liked' | 'disliked' | null
  disabled: boolean
  showCost?: string
}

function MobileMealRow({
  label,
  meal,
  onLike,
  onDislike,
  currentPreference,
  disabled,
  showCost,
}: MobileMealRowProps) {
  return (
    <Box sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
            {label}
          </Typography>
          <Typography variant="body2">{meal}</Typography>
          {showCost && (
            <Typography variant="caption" color="text.secondary">
              Est. cost: {showCost}
            </Typography>
          )}
        </Box>
        {!disabled && (
          <Box sx={{ display: 'flex', ml: 1, flexShrink: 0 }}>
            <Tooltip title={currentPreference === 'liked' ? 'Remove like' : 'Like'}>
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
            <Tooltip title={currentPreference === 'disliked' ? 'Remove dislike' : 'Dislike'}>
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
    </Box>
  )
}

function MobileDayAccordion({
  day,
  weekStart,
  dayIndex,
  expanded,
  onChange,
}: MobileDayAccordionProps) {
  const dayDate = getDayOfWeek(weekStart, dayIndex)
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
    <Accordion expanded={expanded} onChange={onChange} disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '& .MuiAccordionSummary-expandIconWrapper': {
            color: 'inherit',
          },
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {day.day}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {formatDayDate(dayDate)}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>
        <MobileMealRow
          label="Breakfast"
          meal={day.breakfast}
          mealType="breakfast"
          onLike={() => handlePreference('breakfast', day.breakfast, 'liked')}
          onDislike={() => handlePreference('breakfast', day.breakfast, 'disliked')}
          currentPreference={getPreference('breakfast', day.breakfast)}
          disabled={isDisabled}
        />
        <MobileMealRow
          label="Lunch"
          meal={day.lunch}
          mealType="lunch"
          onLike={() => handlePreference('lunch', day.lunch, 'liked')}
          onDislike={() => handlePreference('lunch', day.lunch, 'disliked')}
          currentPreference={getPreference('lunch', day.lunch)}
          disabled={isDisabled}
        />
        <MobileMealRow
          label="Dinner"
          meal={day.dinner}
          mealType="dinner"
          onLike={() => handlePreference('dinner', day.dinner, 'liked')}
          onDislike={() => handlePreference('dinner', day.dinner, 'disliked')}
          currentPreference={getPreference('dinner', day.dinner)}
          disabled={isDisabled}
          showCost={day.dinnerCost}
        />
      </AccordionDetails>
    </Accordion>
  )
}

export default function WeeklyCalendar({ plan, weekStart }: WeeklyCalendarProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [expandedDay, setExpandedDay] = useState<number | null>(0)

  if (isMobile) {
    return (
      <Box sx={{ mt: 2 }}>
        {plan.days.map((day, index) => (
          <MobileDayAccordion
            key={day.day}
            day={day}
            weekStart={weekStart}
            dayIndex={index}
            expanded={expandedDay === index}
            onChange={() => setExpandedDay(expandedDay === index ? null : index)}
          />
        ))}
      </Box>
    )
  }

  return (
    <Paper sx={{ mt: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex' }}>
        {plan.days.map((day, index) => (
          <CalendarDayColumn
            key={day.day}
            day={day}
            weekStart={weekStart}
            dayIndex={index}
          />
        ))}
      </Box>
    </Paper>
  )
}
