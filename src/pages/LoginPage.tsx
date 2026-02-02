import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Email as EmailIcon } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setError(null)
    setIsLoading(true)
    try {
      await signInWithMagicLink(email)
      setMagicLinkSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
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
          <Typography variant="subtitle1" align="center" sx={{ mt: 1, opacity: 0.9 }}>
            Budget-conscious weekly meal planning
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Sign In
          </Typography>
          <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
            Sign in to save your meal plans and preferences
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {magicLinkSent ? (
            <Alert severity="success">
              Check your email for a sign-in link. You can close this page.
            </Alert>
          ) : (
            <form onSubmit={handleMagicLinkSignIn}>
              <TextField
                label="Email address"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? 'Sending...' : 'Send Magic Link'}
              </Button>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  )
}
