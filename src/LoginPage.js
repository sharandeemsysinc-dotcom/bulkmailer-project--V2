import React from 'react';
import { Box, TextField, Button, Typography, Paper, Stack } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AccountCircle from '@mui/icons-material/AccountCircle';
import loginBackground from '../src/assets/login-bg.jpg.jpg';

const LoginPage = ({ setIsLoggedIn }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = React.useState(false);
    const [rememberMe, setRememberMe] = React.useState(false);

    const onSubmit = (data) => {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true'); // Persist login state
        navigate('/dashboard/email');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundImage: `url(${loginBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    width: '100%',
                    maxWidth: 400,
                    background: '#fff8f0', // warm white
                    border: '1px solid #f5e9da',
                    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.08)',
                }}
            >
                <Typography variant="h4" textAlign="center" gutterBottom>
                    Login
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
                    {/* Email */}
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        {...register('email', {
                            required: 'Email is required',
                            validate: value =>
                                value.includes('@') || 'Email must contain "@"',
                        })}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <AccountCircle />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Password */}
                    <TextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        {...register('password', { required: 'Password is required' })}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowPassword((show) => !show)}
                                        onMouseDown={(event) => event.preventDefault()}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Remember me and Forgot Password in one row */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                        {/* <FormControlLabel
                            control={
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={e => setRememberMe(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Remember me"
                        /> */}
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => navigate('/forgot-password')}
                        >
                            Forgot Password
                        </Button>
                    </Stack>

                    {/* Sign In */}
                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
                        Sign In
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default LoginPage;
