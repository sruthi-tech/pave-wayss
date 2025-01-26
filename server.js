const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: 'your-secret-key-here',
  resave: false,
  saveUninitialized: false
}));

// In-memory storage for demo purposes
const users = {};
const routes = [
  {
    id: 1,
    start: "Kollam",
    stop: "Trivandrum",
    segments: [
      { mode: "Bus", distance: "30 km", fare: 159, time: "1 hour" },
      { mode: "Auto", distance: "10 km", fare: 200, time: "30 minutes" }
    ]
  },
  {
    id: 2,
    start: "Kochi",
    stop: "Mukkada",
    segments: [
      { mode: "Bus", distance: "50 km", fare: 256, time: "2 hours" },
      { mode: "Private Taxi", distance: "20 km", fare: 500, time: "1 hour" }
    ]
  },
  {
    id: 3,
    start: "Edappaly",
    stop: "Vadakara",
    segments: [
      { mode: "Bus", distance: "100 km", fare: 356, time: "3 hours" },
      { mode: "Airplane", distance: "200 km", fare: 1500, time: "1 hour" }
    ]
  },
  {
    id: 4,
    start: "Mylakkad",
    stop: "Kuttivattom",
    segments: [
      { mode: "Auto", distance: "5 km", fare: 100, time: "15 minutes" },
      { mode: "Bus", distance: "10 km", fare: 56, time: "30 minutes" }
    ]
  }
];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  
  if (users[email]) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  users[email] = hashedPassword;
  res.status(201).json({ message: 'Registration successful' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!users[email] || !(await bcrypt.compare(password, users[email]))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  req.session.userEmail = email;
  res.json({ message: 'Login successful', email });
});

app.get('/api/routes', (req, res) => {
  const { start, end } = req.query;
  
  if (start && end) {
    const route = routes.find(r => 
      r.start.toLowerCase() === start.toLowerCase() && 
      r.stop.toLowerCase() === end.toLowerCase()
    );
    
    if (route) {
      return res.json(route);
    }
    return res.status(404).json({ error: 'Route not found' });
  }
  
  res.json(routes);
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout successful' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});