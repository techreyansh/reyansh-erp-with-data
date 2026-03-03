import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Divider,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Paper,
  Chip,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Grow,
} from "@mui/material";
import {
  Google,
  ExpandMore,
  ExpandLess,
  Factory,
  Dashboard,
  TrendingUp,
  Security,
  Info,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { supabase } from "../../lib/supabaseClient";

// Extracted role options for easier management and cleaner JSX
const ROLE_OPTIONS = [
  "CEO",
  "Customer Relations Manager",
  "Production Manager",
  "Process Coordinator",
  "QC Manager",
  "NPD",
  "Sales Executive",
  "Store Manager"
];

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const features = [
    { icon: <Dashboard />, text: "Streamlined Sales Order Ingestion", color: theme.palette.primary.main },
    { icon: <TrendingUp />, text: "Real-time Order to Dispatch System", color: theme.palette.success.main },
    { icon: <Factory />, text: "Executive Dashboard with KPIs", color: theme.palette.warning.main },
  ];
  
  // useAuth provides authentication methods and state
  const {
    signInWithGoogle,
    loading: authLoading,
    isAuthenticated,
    error: authError,
  } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState(null);

  // Check for session expiration message from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_expired') === 'true') {
      setSessionExpiredMsg('Your session has expired. Please sign in again.');
      // Clear the URL parameter
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (signInError) {
        console.error("Supabase OAuth error:", signInError);
        setError("Failed to sign in with Google");
      }
    } catch (e) {
      console.error("Error starting Supabase OAuth:", e);
      setError("Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner if authenticating
  if (authLoading || loading) return <LoadingSpinner message="Signing in..." />;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        px: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        }
      }}
    >
      {/* Floating animated elements */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          animation: "float 6s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
            "50%": { transform: "translateY(-20px) rotate(180deg)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "15%",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          animation: "float 8s ease-in-out infinite reverse",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
            "50%": { transform: "translateY(-20px) rotate(180deg)" },
          },
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center" justifyContent="center">
          {/* Left panel: App info and features */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={1000}>
              <Box
                sx={{
                  color: "white",
                  textAlign: isMobile ? "center" : "left",
                  mb: isMobile ? 4 : 0,
                  maxWidth: 500,
                  mx: "auto",
                }}
              >
                {/* Logo/Brand Section */}
                <Slide direction="right" in timeout={600}>
                  <Box sx={{ mb: 5, textAlign: isMobile ? "center" : "left" }} className="motion-fade-in">
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        borderRadius: 4,
                        px: 4,
                        py: 2,
                        mb: 4,
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        transition: "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.02)",
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                        },
                      }}
                    >
                      <img
                        src={process.env.PUBLIC_URL + "/reyansh-logo.png"}
                        alt="Reyansh International"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = "flex";
                        }}
                        style={{
                          maxHeight: 32,
                          width: "auto",
                          objectFit: "contain",
                          marginRight: 16,
                        }}
                      />
                      <Box
                        sx={{
                          display: "none",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <Factory sx={{ fontSize: 28, color: theme.palette.warning.main }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "0.5px" }}>
                          Reyansh International
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Slide>

                {/* Main Title */}
                <Slide direction="up" in timeout={1000}>
                  <Typography
                    variant={isMobile ? "h3" : "h2"}
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      lineHeight: 1.1,
                      textShadow: "0 4px 8px rgba(0,0,0,0.3)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Factory Operations
                    <br />
                    <Box component="span" sx={{ 
                      color: "#fbbf24",
                      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                    }}>
                      Monitoring System
                    </Box>
                  </Typography>
                </Slide>

                {/* Subtitle */}
                <Slide direction="up" in timeout={1200}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 5,
                      opacity: 0.95,
                      fontWeight: 400,
                      lineHeight: 1.7,
                      letterSpacing: "0.01em",
                    }}
                  >
                    Access the centralized platform for PO tracking, flow management,
                    and operations analytics in real-time with enterprise-grade security.
                  </Typography>
                </Slide>

                {/* Features List */}
                <Box sx={{ mb: 5 }}>
                  {features.map((feature, index) => (
                    <Grow in timeout={1400 + index * 200} key={index}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 3,
                          p: 3,
                          backgroundColor: "rgba(255, 255, 255, 0.12)",
                          borderRadius: 3,
                          backdropFilter: "blur(20px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.18)",
                            transform: "translateY(-2px) scale(1.02)",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                          }
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: feature.color,
                            borderRadius: "50%",
                            p: 1.5,
                            mr: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `0 4px 12px ${feature.color}40`,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "scale(1.1) rotate(5deg)",
                            },
                          }}
                        >
                          {React.cloneElement(feature.icon, { 
                            sx: { color: "white", fontSize: 24 } 
                          })}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: "0.01em" }}>
                          {feature.text}
                        </Typography>
                      </Box>
                    </Grow>
                  ))}
                </Box>

                {/* Security Badge */}
                <Grow in timeout={2000}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      backgroundColor: "rgba(34, 197, 94, 0.25)",
                      borderRadius: 3,
                      px: 3,
                      py: 2,
                      border: "1px solid rgba(34, 197, 94, 0.4)",
                      backdropFilter: "blur(20px)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                        backgroundColor: "rgba(34, 197, 94, 0.3)",
                      },
                    }}
                  >
                    <Security sx={{ fontSize: 20, mr: 1.5, color: "#22c55e" }} />
                    <Typography variant="body1" sx={{ color: "#22c55e", fontWeight: 600, letterSpacing: "0.02em" }}>
                      Enterprise-Grade Security
                    </Typography>
                  </Box>
                </Grow>
              </Box>
            </Fade>
          </Grid>

          {/* Right panel: Login form */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={1500}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Card
                  elevation={0}
                  sx={{
                    width: "100%",
                    maxWidth: 480,
                    borderRadius: 4,
                    overflow: "hidden",
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    backdropFilter: "blur(30px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 32px 64px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 40px 80px -16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 5 }}>
                    {/* Header */}
                    <Slide direction="down" in timeout={1600}>
                      <Box sx={{ textAlign: "center", mb: 5 }}>
                        <Typography variant="h3" gutterBottom sx={{ 
                          fontWeight: 800, 
                          color: "#1e293b",
                          letterSpacing: "-0.02em",
                          mb: 1,
                        }}>
                          Welcome Back
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                          Sign in to access your dashboard
                        </Typography>
                      </Box>
                    </Slide>

                    {/* OAuth Configuration Status */}
                    {!config.useLocalStorage && (
                      <Grow in timeout={1800}>
                        <Alert 
                          severity={validateOAuthConfig().isValid ? "success" : "warning"} 
                          sx={{ mb: 3, borderRadius: 3 }}
                        >
                          <strong>OAuth Configuration Status:</strong>
                          <br />
                          {validateOAuthConfig().isValid ? (
                            "✅ OAuth is properly configured and ready to use."
                          ) : (
                            <>
                              ⚠️ OAuth configuration issues detected:
                              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                {validateOAuthConfig().issues.map((issue, index) => (
                                  <li key={index}>{issue}</li>
                                ))}
                              </ul>
                              Redirect URI: <code>{validateOAuthConfig().redirectUri || 'Not configured'}</code>
                            </>
                          )}
                        </Alert>
                      </Grow>
                    )}

                    {/* Session expired message */}
                    {sessionExpiredMsg && (
                      <Grow in timeout={200}>
                        <Alert 
                          severity="info" 
                          sx={{ 
                            mb: 3, 
                            borderRadius: 3,
                            backgroundColor: "#fff3cd",
                            border: "1px solid #ffc107",
                            color: "#856404",
                            "& .MuiAlert-icon": { fontSize: 24, color: "#ffc107" }
                          }}
                          onClose={() => setSessionExpiredMsg(null)}
                        >
                          {sessionExpiredMsg}
                        </Alert>
                      </Grow>
                    )}

                    {/* Error alert */}
                    {(error || authError) && (
                      <Grow in timeout={200}>
                        <Alert 
                          severity="error" 
                          sx={{ 
                            mb: 4, 
                            borderRadius: 3,
                            "& .MuiAlert-icon": { fontSize: 24 }
                          }}
                        >
                          {error || authError}
                        </Alert>
                      </Grow>
                    )}

                    {/* Google OAuth Sign-In Button */}
                    <Grow in timeout={2000}>
                      <Button
                        variant="outlined"
                        startIcon={<Google />}
                        fullWidth
                        onClick={handleGoogleSignIn}
                        size="large"
                        sx={{
                          py: 2.5,
                          px: 4,
                          borderRadius: 3,
                          borderColor: "#e2e8f0",
                          color: "#374151",
                          backgroundColor: "white",
                          textTransform: "none",
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                          borderWidth: "2px",
                          letterSpacing: "0.02em",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "#f8fafc",
                            borderColor: "#cbd5e1",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                            transform: "translateY(-2px) scale(1.02)",
                          },
                          "&:active": {
                            transform: "translateY(0) scale(0.98)",
                          },
                        }}
                      >
                        Sign in with Google
                      </Button>
                    </Grow>

                    {/* More Info Section */}
                    {!config.useLocalStorage && (
                      <Grow in timeout={2200}>
                        <Box sx={{ mt: 4 }}>
                          <Button
                            fullWidth
                            startIcon={<Info />}
                            endIcon={showMoreInfo ? <ExpandLess /> : <ExpandMore />}
                            onClick={() => setShowMoreInfo(!showMoreInfo)}
                            sx={{
                              textTransform: "none",
                              color: "#6b7280",
                              backgroundColor: "#f8fafc",
                              borderRadius: 3,
                              py: 2,
                              border: "1px solid #e2e8f0",
                              fontWeight: 500,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                backgroundColor: "#f1f5f9",
                                borderColor: "#cbd5e1",
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            Sign in with Google
                          </Button>
                          
                          <Collapse in={showMoreInfo}>
                            <Alert 
                              severity="info" 
                              sx={{ 
                                mt: 3, 
                                borderRadius: 3,
                                backgroundColor: "#eff6ff",
                                border: "1px solid #bfdbfe",
                                color: "#1e40af",
                              }}
                            >
                              <Typography variant="body2">
                                After signing in, you can access the app. Use <strong>Setup</strong> to initialize data tables if needed.
                              </Typography>
                            </Alert>
                          </Collapse>
                        </Box>
                      </Grow>
                    )}

                    {/* Development Mode Section */}
                    <Grow in timeout={2400}>
                      <Box sx={{ mt: 5, mb: 4 }}>
                        <Divider sx={{ mb: 4 }}>
                          <Chip
                            label="Development Mode"
                            size="small"
                            sx={{
                              backgroundColor: "#f1f5f9",
                              color: "#64748b",
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              px: 2,
                              py: 0.5,
                            }}
                          />
                        </Divider>

                        {/* Mock login role selector */}
                        <FormControl fullWidth sx={{ mb: 4 }}>
                          <InputLabel id="role-select-label" sx={{ color: "#64748b", fontWeight: 500 }}>
                            Select Role
                          </InputLabel>
                          <Select
                            labelId="role-select-label"
                            value={mockRole}
                            label="Select Role"
                            onChange={(e) => setMockRole(e.target.value)}
                            sx={{
                              borderRadius: 3,
                              transition: "all 0.3s ease",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#e2e8f0",
                                borderWidth: "2px",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#cbd5e1",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#3b82f6",
                                borderWidth: "2px",
                              },
                            }}
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <MenuItem key={role} value={role}>
                                {role}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Mock login button */}
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={handleMockSignIn}
                          size="large"
                          sx={{
                            py: 2.5,
                            px: 4,
                            borderRadius: 3,
                            borderColor: "#3b82f6",
                            color: "#3b82f6",
                            textTransform: "none",
                            fontSize: "1.1rem",
                            fontWeight: 600,
                            borderWidth: "2px",
                            letterSpacing: "0.02em",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              backgroundColor: "#eff6ff",
                              borderColor: "#2563eb",
                              transform: "translateY(-2px) scale(1.02)",
                              boxShadow: "0 8px 24px rgba(59, 130, 246, 0.2)",
                            },
                            "&:active": {
                              transform: "translateY(0) scale(0.98)",
                            },
                          }}
                        >
                          Mock Login as {mockRole}
                        </Button>

                        {/* CEO Direct Login Button */}
                        <Button
                          variant="outlined"
                          color="primary"
                          fullWidth
                          onClick={handleCEOLogin}
                          size="large"
                          sx={{
                            py: 2.5,
                            px: 4,
                            mt: 3,
                            borderRadius: 3,
                            borderColor: "#10b981",
                            color: "#10b981",
                            textTransform: "none",
                            fontSize: "1.1rem",
                            fontWeight: 600,
                            borderWidth: "2px",
                            letterSpacing: "0.02em",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              backgroundColor: "#ecfdf5",
                              borderColor: "#059669",
                              transform: "translateY(-2px) scale(1.02)",
                              boxShadow: "0 8px 24px rgba(16, 185, 129, 0.2)",
                            },
                            "&:active": {
                              transform: "translateY(0) scale(0.98)",
                            },
                          }}
                        >
                          Direct Login as CEO (abhishek@reyanshelectronics.com)
                        </Button>

                        {/* Debug OAuth Button */}
                        <Button
                          variant="outlined"
                          color="secondary"
                          fullWidth
                          onClick={() => {
                            const debugInfo = debugOAuth();
                            setError('Check browser console for OAuth debug information');
                          }}
                          size="large"
                          sx={{
                            py: 2.5,
                            px: 4,
                            mt: 3,
                            borderRadius: 3,
                            borderColor: "#8b5cf6",
                            color: "#8b5cf6",
                            textTransform: "none",
                            fontSize: "1.1rem",
                            fontWeight: 600,
                            borderWidth: "2px",
                            letterSpacing: "0.02em",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              backgroundColor: "#faf5ff",
                              borderColor: "#7c3aed",
                              transform: "translateY(-2px) scale(1.02)",
                              boxShadow: "0 8px 24px rgba(139, 92, 246, 0.2)",
                            },
                            "&:active": {
                              transform: "translateY(0) scale(0.98)",
                            },
                          }}
                        >
                          Debug OAuth Configuration
                        </Button>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            mt: 3,
                            textAlign: "center",
                            lineHeight: 1.6,
                            px: 2,
                          }}
                        >
                          This is a demonstration application. In a production environment, 
                          only @reyanshelectronics.com email accounts would be authorized to sign in.
                        </Typography>
                      </Box>
                    </Grow>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
};

export default Login;
