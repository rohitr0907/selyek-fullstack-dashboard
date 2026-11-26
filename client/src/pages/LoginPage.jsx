import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../api/axios';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => {
    if (!value.trim()) {
      return 'Enter email address';
    }
    if (!EMAIL_REGEX.test(value.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (value) => {
    if (!value || value.length < 8) {
      return 'Password should contain a minimum of 8 characters';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) setEmailError(validateEmail(val));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordError) setPasswordError(validatePassword(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setInfoMessage('');

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard', { state: { loginSuccess: true } });
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Unable to connect to the server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className="hex-bg"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card
        elevation={1}
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 2,
          border: '1px solid #e6f2f8',
          boxShadow: '0 8px 30px rgba(0, 115, 177, 0.08)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Brand Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2.5 }}>
            <Box
              sx={{
                bgcolor: '#20b5f7',
                color: '#fff',
                px: 1,
                py: 0.3,
                borderRadius: 0.75,
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: 0.8,
              }}
            >
              STERNA
            </Box>
            <Typography
              sx={{
                color: '#20b5f7',
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: 0.8,
              }}
            >
              SELYEK
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
            Login to account
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
            Enter your email &amp; password/OTP to login
          </Typography>

          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}
          {infoMessage && (
            <Alert severity="info" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
              {infoMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: '#374151', display: 'block', mb: 0.5 }}
            >
              Email <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => setEmailError(validateEmail(email))}
              error={Boolean(emailError)}
              helperText={emailError || ' '}
              sx={{ mb: 1 }}
            />

            {/* Password Field */}
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: '#374151', display: 'block', mb: 0.5 }}
            >
              Password <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => setPasswordError(validatePassword(password))}
              error={Boolean(passwordError)}
              helperText={passwordError || ' '}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Link
                component="button"
                type="button"
                underline="hover"
                sx={{ fontSize: 12.5, color: '#20b5f7', fontWeight: 500 }}
                onClick={() =>
                  setInfoMessage(
                    'Email: leo@sterna.com\nPassword: Password@123'
                  )
                }
              >
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#20b5f7',
                '&:hover': { bgcolor: '#12a1e2' },
                textTransform: 'none',
                fontWeight: 600,
                py: 1.1,
                boxShadow: 'none',
              }}
            >
              {loading ? 'Logging in...' : 'Login using Password'}
            </Button>

            <Divider sx={{ my: 2, fontSize: 12, color: '#9ca3af' }}>OR</Divider>

            <Button
              type="button"
              fullWidth
              variant="outlined"
              onClick={() =>
                setInfoMessage(
                  'OTP login is simulated for this demo. Please use Password login: leo@sterna.com / Password@123'
                )
              }
              sx={{
                borderColor: '#bae6fd',
                color: '#20b5f7',
                textTransform: 'none',
                fontWeight: 600,
                py: 1,
                '&:hover': {
                  borderColor: '#20b5f7',
                  bgcolor: '#f0f9ff',
                },
              }}
            >
              Login using OTP
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
