import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Google as GoogleIcon, Email as EmailIcon } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { signInWithGoogle, signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
  const [isLoadingEmail, setIsLoadingEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoadingGoogle(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google')
      setIsLoadingGoogle(false)
    }
  }

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setError(null)
    setIsLoadingEmail(true)
    try {
      await signInWithMagicLink(email)
      setMagicLinkSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
    } finally {
      setIsLoadingEmail(false)
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
            <>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={isLoadingGoogle ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
                onClick={handleGoogleSignIn}
                disabled={isLoadingGoogle || isLoadingEmail}
                sx={{ mb: 2 }}
              >
                {isLoadingGoogle ? 'Signing in...' : 'Continue with Google'}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography color="text.secondary" variant="body2">
                  or
                </Typography>
              </Divider>

              <form onSubmit={handleMagicLinkSignIn}>
                <TextField
                  label="Email address"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoadingEmail || isLoadingGoogle}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={isLoadingEmail ? <CircularProgress size={20} /> : <EmailIcon />}
                  disabled={isLoadingEmail || isLoadingGoogle || !email.trim()}
                >
                  {isLoadingEmail ? 'Sending...' : 'Send Magic Link'}
                </Button>
              </form>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  )
}
