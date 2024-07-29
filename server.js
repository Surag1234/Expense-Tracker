const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Group = require('./models/group');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Session setup
app.use(session({
  secret: 'f511e9c72a61a467a4b3e9bec94e42f8fab2174109a42163d80267ac421bb3921f7d6ee3fb0867d037fe05278ad8a86a76eba5a9c3cf7ceafcb092d6a4ea7e96', // Replace with a secure secret key in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } // Set secure: true in production with HTTPS
}));

// MongoDB connection
mongoose.connect('mongodb+srv://testingsmtp:580mcBNRkef48uc4@expensetracker.3rivpln.mongodb.net/?retryWrites=true&w=majority&appName=ExpenseTracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Authentication Middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

// User Signup
app.post('/api/users/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Account already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// User Login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    req.session.user = user;
    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Fetch Existing Groups
app.get('/api/groups', isAuthenticated, async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups' });
  }
});


// Create Group and Split Expenses (Authenticated)
app.post('/api/groups', isAuthenticated, async (req, res) => {
  try {
    const { groupName, members, totalAmount, splitMethod, splitDetails } = req.body;

    // Logging the received data for debugging
    console.log('Received data:', { groupName, members, totalAmount, splitMethod, splitDetails });

    // Ensure members and splitDetails are in the expected format
    if (!Array.isArray(members) || !Array.isArray(splitDetails)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    // Create and save the group
    const group = new Group({ groupName, members, totalAmount, splitMethod, splitDetails });
    await group.save();

    console.log('Group created successfully:', group);
    res.status(201).json({ message: 'Group created successfully', group });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Error creating group' });
  }
});


// Balance Sheet
app.get('/api/balanceSheet', isAuthenticated, async (req, res) => {
  try {
    // Implement logic to calculate balance sheet based on the groups
    const groups = await Group.find();
    // Mock calculation for demonstration; replace with real logic
    const balanceSheet = groups.map(group => ({
      groupName: group.groupName,
      totalAmount: group.totalAmount,
      splitDetails: group.splitDetails
    }));
    res.json(balanceSheet);
  } catch (error) {
    console.error('Error fetching balance sheet:', error);
    res.status(500).json({ message: 'Error fetching balance sheet' });
  }
});

// Settlement Sheet
app.get('/api/settlementSheet', isAuthenticated, async (req, res) => {
  try {
    // Implement logic to calculate settlement sheet based on the groups
    const groups = await Group.find();
    // Mock calculation for demonstration; replace with real logic
    const settlementSheet = groups.map(group => ({
      groupName: group.groupName,
      totalAmount: group.totalAmount,
      splitDetails: group.splitDetails
    }));
    res.json(settlementSheet);
  } catch (error) {
    console.error('Error fetching settlement sheet:', error);
    res.status(500).json({ message: 'Error fetching settlement sheet' });
  }
});

// Check authentication
app.get('/api/checkAuth', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

// Logout route
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Failed to logout:', err);
      return res.status(500).send('Failed to logout');
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.send('Logged out');
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
