const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'selyek_super_secret_key_2026';

app.use(cors());
app.use(express.json());

// Demo user credentials for evaluation
const DEMO_USER = {
  id: 1,
  name: 'Leo',
  email: 'leo@sterna.com',
  password: 'Password@123',
};

// In-memory data store matching the reference screenshots
let locations = [
  {
    id: 1,
    name: 'R S Puram',
    city: 'Coimbatore',
    locks: [],
  },
];

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Online', version: '2.0.2' });
});

// 1. Login Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ message: 'Enter valid email address' });
  }
  if (!password || password.length < 8) {
    return res
      .status(400)
      .json({ message: 'Password should contain a minimum of 8 characters' });
  }

  if (
    email.trim().toLowerCase() !== DEMO_USER.email ||
    password !== DEMO_USER.password
  ) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  return res.json({
    message: 'Login successful',
    token,
    user: { name: DEMO_USER.name, email: DEMO_USER.email },
  });
});

// 2. Dashboard Summary Endpoint
app.get('/api/dashboard', verifyToken, (req, res) => {
  const totalLocks = locations.reduce((sum, loc) => sum + loc.locks.length, 0);
  res.json({
    stats: {
      totalAssets: totalLocks,
      totalLocations: locations.length,
      totalAccess: 0,
      totalUsers: 7,
      totalLockGroups: 0,
      totalUserGroups: 0,
    },
    assetsInStock: [],
    highestLockOpenings: [],
    lockStatusCount: [],
  });
});

// 3. Locations List & Creation
app.get('/api/locations', verifyToken, (req, res) => {
  res.json(locations);
});

app.post('/api/locations', verifyToken, (req, res) => {
  const { name, city } = req.body;
  if (!name || !city) {
    return res
      .status(400)
      .json({ message: 'Location name and city are required' });
  }
  const newLocation = {
    id: locations.length ? locations[locations.length - 1].id + 1 : 1,
    name: name.trim(),
    city: city.trim(),
    locks: [],
  };
  locations.push(newLocation);
  res.status(201).json(newLocation);
});

// 4. Lock Mapping Creation for a Location
app.post('/api/locations/:id/locks', verifyToken, (req, res) => {
  const location = locations.find((l) => l.id === Number(req.params.id));
  if (!location) {
    return res.status(404).json({ message: 'Location not found' });
  }

  const { lockName, assetMarking, lockType, batteryPercentage } = req.body;
  if (!lockName || !assetMarking || !lockType) {
    return res.status(400).json({
      message: 'Lock name, asset marking, and lock type are required',
    });
  }

  const newLock = {
    id: location.locks.length + 1,
    lockName: lockName.trim(),
    assetMarking: assetMarking.trim(),
    lockType: lockType.trim(),
    batteryPercentage: Number(batteryPercentage ?? 100),
    lastCommunicated: new Date().toLocaleString(),
    createdBy: req.user.name,
  };

  location.locks.push(newLock);
  res.status(201).json(newLock);
});

// Delete a Lock Mapping
app.delete('/api/locations/:id/locks/:lockId', verifyToken, (req, res) => {
  const location = locations.find((l) => l.id === Number(req.params.id));
  if (!location) {
    return res.status(404).json({ message: 'Location not found' });
  }
  location.locks = location.locks.filter(
    (lock) => lock.id !== Number(req.params.lockId)
  );
  res.json({ message: 'Lock mapping removed' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
