import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Alert,
  AlertTitle,
  Box,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Typography,
} from '@mui/material';
import api from '../api/axios';

const KPI_CARDS = [
  {
    key: 'totalAssets',
    label: 'TOTAL ASSETS',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
  },
  {
    key: 'totalLocations',
    label: 'TOTAL LOCATIONS',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    key: 'totalAccess',
    label: 'TOTAL ACCESS',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    key: 'totalUsers',
    label: 'TOTAL USERS',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  },
  {
    key: 'totalLockGroups',
    label: 'TOTAL LOCK GROUPS',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
  },
  {
    key: 'totalUserGroups',
    label: 'TOTAL USER GROUPS',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
];

export default function DashboardPage() {
  const location = useLocation();
  const [showToast, setShowToast] = useState(
    Boolean(location.state?.loginSuccess)
  );
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalLocations: 1,
    totalAccess: 0,
    totalUsers: 7,
    totalLockGroups: 0,
    totalUserGroups: 0,
  });
  const [now, setNow] = useState(new Date());

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || { name: 'Leo' };
    } catch {
      return { name: 'Leo' };
    }
  })();

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => {
        if (res.data?.stats) setStats(res.data.stats);
      })
      .catch(() => {});

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Top Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
          Dashboard
        </Typography>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ color: '#374151' }}>
            Good morning, <strong>{user.name || 'Leo'}</strong>
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            {formattedDate}, {formattedTime.toLowerCase()}
          </Typography>
        </Box>
      </Box>

      {/* 6 KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {KPI_CARDS.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={card.key}>
            <Card
              sx={{
                background: card.gradient,
                color: '#fff',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <CardContent sx={{ py: 2, px: 2.25, '&:last-child': { pb: 2 } }}>
                <Typography
                  sx={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: 0.6,
                    opacity: 0.92,
                    mb: 1,
                  }}
                >
                  {card.label}
                </Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
                  {stats[card.key] ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 3 Content Panels */}
      <Grid container spacing={2}>
        {[
          { title: 'ASSETS IN STOCK', emptyText: 'No Assets' },
          { title: 'HIGHEST LOCK OPENINGS (LAST 7 DAYS)', emptyText: 'No data' },
          { title: 'LOCK STATUS COUNT', emptyText: 'No data' },
        ].map((panel) => (
          <Grid item xs={12} md={4} key={panel.title}>
            <Card
              sx={{
                borderRadius: 2,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                minHeight: 330,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  px: 2.5,
                  py: 1.75,
                  borderBottom: '1px solid #f1f5f9',
                  textAlign: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#111827',
                    letterSpacing: 0.4,
                  }}
                >
                  {panel.title}
                </Typography>
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                }}
              >
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  {panel.emptyText}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Login Success Toast */}
      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowToast(false)}
          severity="success"
          variant="outlined"
          sx={{
            bgcolor: '#fff',
            borderLeft: '4px solid #16a34a',
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
            minWidth: 260,
          }}
        >
          <AlertTitle sx={{ fontWeight: 700, fontSize: 13, mb: 0 }}>
            Success
          </AlertTitle>
          <Typography variant="caption" sx={{ color: '#4b5563' }}>
            Login successful
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}
