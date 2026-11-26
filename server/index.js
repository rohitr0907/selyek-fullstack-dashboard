const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'selyek_super_secret_key_2026';

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

const DEFAULT_DB = {
  users: [
    {
      id: 1,
      name: 'Leo',
      email: 'leo@sterna.com',
      password: 'Password@123',
    },
  ],
  locations: [
    {
      id: 1,
      name: 'R S Puram',
      city: 'Coimbatore',
      locks: [],
    },
  ],
};

function readDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
    return structuredClone(DEFAULT_DB);
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return structuredClone(DEFAULT_DB);
  }
}

function writeDb(data) {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.use(cors());
app.use(express.json());

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

// 1. Register Endpoint
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }
  if (!password || password.length < 8) {
    return res
      .status(400)
      .json({ message: 'Password should contain a minimum of 8 characters' });
  }

  const db = readDb();
  const normalizedEmail = email.trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const newUser = {
    id: db.users.length ? db.users[db.users.length - 1].id + 1 : 1,
    name: name.trim(),
    email: normalizedEmail,
    password,
  };
  db.users.push(newUser);
  writeDb(db);

  const token = jwt.sign(
    { id: newUser.id, name: newUser.name, email: newUser.email },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  return res.status(201).json({
    message: 'Registration successful',
    token,
    user: { name: newUser.name, email: newUser.email },
  });
});

// 2. Login Endpoint
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

  const db = readDb();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === email.trim().toLowerCase() &&
      u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  return res.json({
    message: 'Login successful',
    token,
    user: { name: user.name, email: user.email },
  });
});

// 3. Dashboard Summary Endpoint
app.get('/api/dashboard', verifyToken, (req, res) => {
  const db = readDb();
  const totalLocks = db.locations.reduce((sum, loc) => sum + loc.locks.length, 0);
  res.json({
    stats: {
      totalAssets: totalLocks,
      totalLocations: db.locations.length,
      totalAccess: 0,
      totalUsers: db.users.length + 6, // reflects demo baseline + registered users
      totalLockGroups: 0,
      totalUserGroups: 0,
    },
    assetsInStock: [],
    highestLockOpenings: [],
    lockStatusCount: [],
  });
});

// 4. Locations List & Creation
app.get('/api/locations', verifyToken, (req, res) => {
  const db = readDb();
  res.json(db.locations);
});

app.post('/api/locations', verifyToken, (req, res) => {
  const { name, city } = req.body;
  if (!name || !city) {
    return res
      .status(400)
      .json({ message: 'Location name and city are required' });
  }

  const db = readDb();
  const newLocation = {
    id: db.locations.length ? db.locations[db.locations.length - 1].id + 1 : 1,
    name: name.trim(),
    city: city.trim(),
    locks: [],
  };
  db.locations.push(newLocation);
  writeDb(db);
  res.status(201).json(newLocation);
});

// 5. Lock Mapping Creation for a Location
app.post('/api/locations/:id/locks', verifyToken, (req, res) => {
  const db = readDb();
  const location = db.locations.find((l) => l.id === Number(req.params.id));
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
    id: location.locks.length ? location.locks[location.locks.length - 1].id + 1 : 1,
    lockName: lockName.trim(),
    assetMarking: assetMarking.trim(),
    lockType: lockType.trim(),
    batteryPercentage: Number(batteryPercentage ?? 100),
    lastCommunicated: new Date().toLocaleString(),
    createdBy: req.user.name,
  };

  location.locks.push(newLock);
  writeDb(db);
  res.status(201).json(newLock);
});

// 6. Delete a Lock Mapping
app.delete('/api/locations/:id/locks/:lockId', verifyToken, (req, res) => {
  const db = readDb();
  const location = db.locations.find((l) => l.id === Number(req.params.id));
  if (!location) {
    return res.status(404).json({ message: 'Location not found' });
  }
  location.locks = location.locks.filter(
    (lock) => lock.id !== Number(req.params.lockId)
  );
  writeDb(db);
  res.json({ message: 'Lock mapping removed' });
});

app.listen(PORT, () => {
  readDb();
  console.log(`Server running on http://localhost:${PORT}`);
});
