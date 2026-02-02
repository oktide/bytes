import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Container, Typography, Alert } from '@mui/material'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) {
          throw error
        }
        navigate('/', { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Signing you in...
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  )
}
