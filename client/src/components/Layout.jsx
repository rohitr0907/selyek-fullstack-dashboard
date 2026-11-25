import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  List,
  ListItemButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LocationOnOutlined,
  LockOpenOutlined,
  LocalShippingOutlined,
  RouterOutlined,
  DirectionsCarOutlined,
  PeopleOutline,
  VpnKeyOutlined,
  LayersOutlined,
  Logout,
} from '@mui/icons-material';

const SIDEBAR_WIDTH = 76;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { label: 'Locations', path: '/locations', icon: LocationOnOutlined },
  { label: 'Access', path: null, icon: LockOpenOutlined },
  { label: 'Trips', path: null, icon: LocalShippingOutlined },
  { label: 'GateWays', path: null, icon: RouterOutlined },
  { label: 'Vehicles', path: null, icon: DirectionsCarOutlined },
  { label: 'Users', path: null, icon: PeopleOutline },
  { label: 'Keys', path: null, icon: VpnKeyOutlined },
  { label: 'Levels', path: null, icon: LayersOutlined },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || { name: 'Leo' };
    } catch {
      return { name: 'Leo' };
    }
  })();

  const handleLogout = () => {
    setAnchorEl(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Cyan Sidebar */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          bgcolor: '#29b6f6',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1.5,
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1100,
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: 1,
              mb: 1.5,
              color: '#fff',
            }}
          >
            SELYEK
          </Typography>

          <List sx={{ width: '100%', px: 0.75, py: 0 }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.path && location.pathname === item.path;
              return (
                <ListItemButton
                  key={item.label}
                  onClick={() => item.path && navigate(item.path)}
                  disabled={!item.path}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1.5,
                    py: 0.9,
                    px: 0.5,
                    mb: 0.4,
                    bgcolor: active ? 'rgba(255,255,255,0.22)' : 'transparent',
                    '&:hover': {
                      bgcolor: item.path ? 'rgba(255,255,255,0.16)' : 'transparent',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.8,
                      color: '#fff',
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 19, mb: 0.25, color: '#fff' }} />
                  <Typography
                    sx={{
                      fontSize: 9.5,
                      fontWeight: active ? 700 : 500,
                      color: '#fff',
                      lineHeight: 1.1,
                    }}
                  >
                    {item.label}
                  </Typography>
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* User Avatar */}
        <Box>
          <Avatar
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              width: 34,
              height: 34,
              bgcolor: '#fff',
              color: '#29b6f6',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            {(user.name || 'L')[0].toUpperCase()}
          </Avatar>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled sx={{ fontSize: 13, fontWeight: 600 }}>
              {user.name || 'Leo'}
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ fontSize: 13 }}>
              <Logout fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Main Content + Footer */}
      <Box
        className="hex-bg"
        sx={{
          flexGrow: 1,
          ml: `${SIDEBAR_WIDTH}px`,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            bgcolor: '#fff',
            borderTop: '1px solid #e5e7eb',
            px: 3,
            py: 0.9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            fontSize: 11.5,
            color: '#4b5563',
          }}
        >
          <Typography variant="caption" sx={{ color: '#4b5563' }}>
            Network Status :{' '}
            <Box component="span" sx={{ color: '#16a34a', fontWeight: 600 }}>
              Online
            </Box>
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151' }}>
            Copyright &copy; 2025 Sterna Security Devices Private Limited. All rights reserved.
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: '#20b5f7', fontWeight: 600 }}
          >
            VERSION : 2.0.2
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
