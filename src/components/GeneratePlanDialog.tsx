import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material'
import { formatWeekDisplay } from '../lib/dateUtils'

interface GeneratePlanDialogProps {
  open: boolean
  onClose: () => void
  onGenerate: (dietaryNotes: string) => void
  isGenerating: boolean
  hasExistingPlan: boolean
  selectedWeek: Date
  familySize: number
  weeklyBudget: number
}

export default function GeneratePlanDialog({
  open,
  onClose,
  onGenerate,
  isGenerating,
  hasExistingPlan,
  selectedWeek,
  familySize,
  weeklyBudget,
}: GeneratePlanDialogProps) {
  const [dietaryNotes, setDietaryNotes] = useState('')

  const handleGenerate = () => {
    onGenerate(dietaryNotes)
  }

  const handleClose = () => {
    if (!isGenerating) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Meal Plan</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {formatWeekDisplay(selectedWeek)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Family Size: {familySize} | Budget: ${weeklyBudget}/week
          </Typography>
        </Box>

        {hasExistingPlan && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will replace the existing plan for this week.
          </Alert>
        )}

        <TextField
          label="Dietary Notes (optional)"
          multiline
          rows={3}
          fullWidth
          value={dietaryNotes}
          onChange={(e) => setDietaryNotes(e.target.value)}
          placeholder="e.g., vegetarian, no shellfish, kid-friendly..."
          disabled={isGenerating}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isGenerating}>
          Cancel
        </Button>
        <Button
          variant="contained"
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
      </DialogActions>
    </Dialog>
  )
}
