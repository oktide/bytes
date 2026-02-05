import { Box, IconButton, Button, Typography } from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { formatWeekDisplay } from '../lib/dateUtils'

interface WeekNavigatorProps {
  selectedWeek: Date
  isCurrentWeek: boolean
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

export default function WeekNavigator({
  selectedWeek,
  isCurrentWeek,
  onPrevious,
  onNext,
  onToday,
}: WeekNavigatorProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        onClick={onPrevious}
        size="small"
        sx={{ color: 'inherit' }}
        aria-label="Previous week"
      >
        <ChevronLeftIcon />
      </IconButton>

      <Typography
        variant="subtitle1"
        sx={{
          minWidth: { xs: 140, sm: 180 },
          textAlign: 'center',
          fontWeight: 500,
        }}
      >
        {formatWeekDisplay(selectedWeek)}
      </Typography>

      <IconButton
        onClick={onNext}
        size="small"
        sx={{ color: 'inherit' }}
        aria-label="Next week"
      >
        <ChevronRightIcon />
      </IconButton>

      {!isCurrentWeek && (
        <Button
          size="small"
          variant="outlined"
          onClick={onToday}
          sx={{
            color: 'inherit',
            borderColor: 'rgba(255,255,255,0.5)',
            '&:hover': {
              borderColor: 'inherit',
              bgcolor: 'rgba(255,255,255,0.1)',
            },
            ml: 1,
          }}
        >
          Today
        </Button>
      )}
    </Box>
  )
}
