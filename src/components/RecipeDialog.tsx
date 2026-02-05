import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material'
import {
  AccessTime as AccessTimeIcon,
  Restaurant as RestaurantIcon,
  Circle as CircleIcon,
  Print as PrintIcon,
} from '@mui/icons-material'
import { getRecipe, Recipe } from '../lib/api'

interface RecipeDialogProps {
  open: boolean
  onClose: () => void
  mealName: string | null
  servings: number
}

type DialogState = 'confirm' | 'loading' | 'recipe' | 'error'

export default function RecipeDialog({
  open,
  onClose,
  mealName,
  servings,
}: RecipeDialogProps) {
  const [state, setState] = useState<DialogState>('confirm')
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFetchRecipe = async () => {
    if (!mealName) return

    setState('loading')
    setError(null)

    try {
      const data = await getRecipe(mealName, servings)
      setRecipe(data)
      setState('recipe')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipe')
      setState('error')
    }
  }

  const handleClose = () => {
    onClose()
    // Reset state after dialog closes
    setTimeout(() => {
      setState('confirm')
      setRecipe(null)
      setError(null)
    }, 200)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      sx={{
        '@media print': {
          '& .MuiDialog-container': {
            height: 'auto',
          },
          '& .MuiPaper-root': {
            margin: 0,
            maxHeight: 'none',
            boxShadow: 'none',
          },
          '& .MuiBackdrop-root': {
            display: 'none',
          },
        },
      }}
    >
      {state === 'confirm' && (
        <>
          <DialogTitle>Get Recipe</DialogTitle>
          <DialogContent>
            <Typography>
              Would you like to get a detailed recipe for <strong>{mealName}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This will use AI to generate a recipe with ingredients and step-by-step instructions.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleFetchRecipe}>
              Get Recipe
            </Button>
          </DialogActions>
        </>
      )}

      {state === 'loading' && (
        <>
          <DialogTitle>Generating Recipe...</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography color="text.secondary">
                Creating recipe for {mealName}...
              </Typography>
            </Box>
          </DialogContent>
        </>
      )}

      {state === 'error' && (
        <>
          <DialogTitle>Error</DialogTitle>
          <DialogContent>
            <Alert severity="error">{error}</Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button variant="contained" onClick={handleFetchRecipe}>
              Try Again
            </Button>
          </DialogActions>
        </>
      )}

      {state === 'recipe' && recipe && (
        <>
          <DialogTitle>{recipe.name}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
              <Chip
                icon={<AccessTimeIcon />}
                label={`Prep: ${recipe.prepTime}`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<AccessTimeIcon />}
                label={`Cook: ${recipe.cookTime}`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<RestaurantIcon />}
                label={`Serves ${recipe.servings}`}
                size="small"
                variant="outlined"
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ ml: 'auto', '@media print': { display: 'none' } }}
              >
                Print
              </Button>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Ingredients
            </Typography>
            <List dense disablePadding>
              {recipe.ingredients.map((ingredient, index) => (
                <ListItem key={index} disablePadding sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <CircleIcon sx={{ fontSize: 8 }} />
                  </ListItemIcon>
                  <ListItemText primary={ingredient} />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Instructions
            </Typography>
            <List disablePadding>
              {recipe.instructions.map((step, index) => (
                <ListItem key={index} disablePadding sx={{ py: 0.5, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {index + 1}
                    </Typography>
                  </ListItemIcon>
                  <ListItemText primary={step} />
                </ListItem>
              ))}
            </List>

            {recipe.tips && (
              <>
                <Divider sx={{ my: 2 }} />
                <Alert severity="info" icon={false}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tips
                  </Typography>
                  <Typography variant="body2">{recipe.tips}</Typography>
                </Alert>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ '@media print': { display: 'none' } }}>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}
