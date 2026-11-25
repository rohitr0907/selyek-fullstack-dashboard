import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Add, DeleteOutline, Search } from '@mui/icons-material';
import api from '../api/axios';

const TABS = ['Lock Mapping', 'Lock Group', 'Geofence', 'Gateway Mapping'];

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [lockSearch, setLockSearch] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Add Location Dialog
  const [openLocDialog, setOpenLocDialog] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocCity, setNewLocCity] = useState('');

  // Add Lock Mapping Dialog
  const [openLockDialog, setOpenLockDialog] = useState(false);
  const [lockForm, setLockForm] = useState({
    lockName: '',
    assetMarking: '',
    lockType: 'Smart Padlock',
    batteryPercentage: 100,
  });

  const fetchLocations = async () => {
    try {
      const { data } = await api.get('/locations');
      setLocations(data);
      if (data.length && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch {
      // handled silently
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filteredLocations = useMemo(
    () =>
      locations.filter(
        (loc) =>
          loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
          loc.city.toLowerCase().includes(locationSearch.toLowerCase())
      ),
    [locations, locationSearch]
  );

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedId) || locations[0] || null,
    [locations, selectedId]
  );

  const filteredLocks = useMemo(() => {
    if (!selectedLocation) return [];
    return selectedLocation.locks.filter(
      (lock) =>
        lock.lockName.toLowerCase().includes(lockSearch.toLowerCase()) ||
        lock.assetMarking.toLowerCase().includes(lockSearch.toLowerCase()) ||
        lock.lockType.toLowerCase().includes(lockSearch.toLowerCase())
    );
  }, [selectedLocation, lockSearch]);

  const handleAddLocation = async () => {
    if (!newLocName.trim() || !newLocCity.trim()) return;
    const { data } = await api.post('/locations', {
      name: newLocName,
      city: newLocCity,
    });
    setLocations((prev) => [...prev, data]);
    setSelectedId(data.id);
    setNewLocName('');
    setNewLocCity('');
    setOpenLocDialog(false);
  };

  const handleAddLock = async () => {
    if (!selectedLocation || !lockForm.lockName.trim() || !lockForm.assetMarking.trim()) {
      return;
    }
    const { data } = await api.post(
      `/locations/${selectedLocation.id}/locks`,
      lockForm
    );
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === selectedLocation.id
          ? { ...loc, locks: [...loc.locks, data] }
          : loc
      )
    );
    setLockForm({
      lockName: '',
      assetMarking: '',
      lockType: 'Smart Padlock',
      batteryPercentage: 100,
    });
    setOpenLockDialog(false);
  };

  const handleDeleteLock = async (lockId) => {
    if (!selectedLocation) return;
    await api.delete(`/locations/${selectedLocation.id}/locks/${lockId}`);
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === selectedLocation.id
          ? { ...loc, locks: loc.locks.filter((l) => l.id !== lockId) }
          : loc
      )
    );
  };

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 'calc(100vh - 42px)' }}>
      {/* Left Locations List Panel */}
      <Box
        sx={{
          width: 280,
          flexShrink: 0,
          bgcolor: '#fff',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
            Locations
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpenLocDialog(true)}
            sx={{
              bgcolor: '#e0f4fe',
              color: '#20b5f7',
              '&:hover': { bgcolor: '#bae6fd' },
            }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ px: 2, pb: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Enter search term"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: '#9ca3af' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <List sx={{ py: 0 }}>
          {filteredLocations.map((loc) => {
            const active = selectedLocation?.id === loc.id;
            return (
              <ListItemButton
                key={loc.id}
                onClick={() => setSelectedId(loc.id)}
                sx={{
                  px: 2,
                  py: 1.25,
                  bgcolor: active ? '#e6f6fe' : 'transparent',
                  borderRight: active ? '3px solid #20b5f7' : '3px solid transparent',
                  gap: 1.5,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#d8effc',
                    color: '#0284c7',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {loc.name[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: active ? '#0284c7' : '#111827',
                    }}
                  >
                    {loc.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: '#6b7280' }}>
                    {loc.city}
                  </Typography>
                </Box>
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Right Detail Panel */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header & Tabs */}
        <Box sx={{ bgcolor: '#fff', px: 3, pt: 2, borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
            {selectedLocation?.name || 'Select a Location'}
          </Typography>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              minHeight: 38,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: 12.5,
                fontWeight: 600,
                minHeight: 38,
                py: 0.5,
              },
              '& .Mui-selected': { color: '#20b5f7' },
              '& .MuiTabs-indicator': { bgcolor: '#20b5f7' },
            }}
          >
            {TABS.map((tab) => (
              <Tab key={tab} label={tab} />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 2.5 }}>
          {activeTab === 0 ? (
            <Card
              sx={{
                borderRadius: 2,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <Box
                sx={{
                  px: 2.5,
                  py: 1.75,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                  Lock Mapping
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setOpenLockDialog(true)}
                    sx={{
                      bgcolor: '#e6f6fe',
                      color: '#20b5f7',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 1.5,
                      '&:hover': { bgcolor: '#bae6fd' },
                    }}
                  >
                    Lock Mapping
                  </Button>
                  <TextField
                    size="small"
                    placeholder="Search"
                    value={lockSearch}
                    onChange={(e) => setLockSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" sx={{ color: '#9ca3af' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 180 }}
                  />
                </Box>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      {[
                        'S.NO',
                        'LOCK NAME',
                        'ASSET MARKING',
                        'LOCK TYPE',
                        'BATTERY PERCENTAGE',
                        'LAST COMMUNICATED DATE & TIME',
                        'CREATED BY',
                        'ACTIONS',
                      ].map((col) => (
                        <TableCell
                          key={col}
                          sx={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: '#475569',
                            py: 1.25,
                          }}
                        >
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLocks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#9ca3af' }}>
                          No results found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLocks.map((lock, idx) => (
                        <TableRow key={lock.id} hover>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{lock.lockName}</TableCell>
                          <TableCell>{lock.assetMarking}</TableCell>
                          <TableCell>{lock.lockType}</TableCell>
                          <TableCell>{lock.batteryPercentage}%</TableCell>
                          <TableCell>{lock.lastCommunicated}</TableCell>
                          <TableCell>{lock.createdBy}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteLock(lock.id)}
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          ) : (
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                No {TABS[activeTab]} records found for {selectedLocation?.name}.
              </Typography>
            </Card>
          )}
        </Box>
      </Box>

      {/* Add Location Dialog */}
      <Dialog open={openLocDialog} onClose={() => setOpenLocDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Location</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField
            label="Location Name"
            size="small"
            value={newLocName}
            onChange={(e) => setNewLocName(e.target.value)}
            fullWidth
          />
          <TextField
            label="City"
            size="small"
            value={newLocCity}
            onChange={(e) => setNewLocCity(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLocDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddLocation} sx={{ bgcolor: '#20b5f7' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Lock Mapping Dialog */}
      <Dialog open={openLockDialog} onClose={() => setOpenLockDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Lock Mapping</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField
            label="Lock Name"
            size="small"
            value={lockForm.lockName}
            onChange={(e) => setLockForm({ ...lockForm, lockName: e.target.value })}
            fullWidth
          />
          <TextField
            label="Asset Marking"
            size="small"
            value={lockForm.assetMarking}
            onChange={(e) => setLockForm({ ...lockForm, assetMarking: e.target.value })}
            fullWidth
          />
          <TextField
            label="Lock Type"
            size="small"
            value={lockForm.lockType}
            onChange={(e) => setLockForm({ ...lockForm, lockType: e.target.value })}
            fullWidth
          />
          <TextField
            label="Battery Percentage"
            type="number"
            size="small"
            value={lockForm.batteryPercentage}
            onChange={(e) =>
              setLockForm({ ...lockForm, batteryPercentage: e.target.value })
            }
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLockDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddLock} sx={{ bgcolor: '#20b5f7' }}>
            Add Lock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
