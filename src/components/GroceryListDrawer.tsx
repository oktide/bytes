import {
  Drawer,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  IconButton,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { MealPlan } from '../lib/api'

interface GroceryListDrawerProps {
  open: boolean
  onClose: () => void
  plan: MealPlan | null
}

export default function GroceryListDrawer({ open, onClose, plan }: GroceryListDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 320, sm: 400 }, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Grocery List</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {!plan ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No meal plan for this week yet.
            <br />
            Generate a plan to see your grocery list.
          </Typography>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Estimated Total: {plan.estimatedWeeklyTotal}
              </Typography>
            </Box>

            {Object.entries(plan.groceries).map(([store, items]) => (
              <Paper key={store} sx={{ p: 2, mb: 2 }} variant="outlined">
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {store}
                </Typography>
                <List dense disablePadding>
                  {items.map((item, idx) => (
                    <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={item.item}
                        secondary={item.price}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ))}
          </>
        )}
      </Box>
    </Drawer>
  )
}
