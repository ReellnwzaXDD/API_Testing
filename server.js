// Import required modules
const express = require('express');
const bodyParser = require('body-parser');

// Create an Express application
const app = express();
const port = 3000;


let users=[
  {id:1, username: 'admin', password: 'admin'},
  {id:2, username: 'user1', password: 'password1'},
  {id:3, username: 'user2', password: 'password2'},
  {id:4, username: 'user3', password: 'password3'},
  {id:5, username: 'user4', password: 'password4'},
]
app.use(bodyParser.json());

app.post('/register', (req, res) => {
  const { username, password } = req.query;
  

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' }); 
  }
  
  // Validate username&&password length
  if (username.length < 6) {
    return res.status(400).json({ message: 'Username should be at least 6 characters long' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password should be at least 6 characters long' });
  }
  
  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.query;

  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  res.status(200).json({ message: 'Login successful' });
});
  

app.get('/users', (req, res) => {
  res.status(200).json(users);  // Get all users
});
  
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(user => user.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json(user);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

// NOTE: using Jest Framework to test