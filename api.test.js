const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { createServer } = require('http');

const app = express();
const server = createServer(app);
let port = 3000;
const BASE_URL = `http://localhost:${port}`;

let balance = 0;


let users=[
  {id:1, username: 'admin', password: 'admin'},
  {id:2, username: 'user1', password: 'password1'},
  {id:3, username: 'user2', password: 'password2'},
  {id:4, username: 'user3', password: 'password3'},
  {id:5, username: 'user4', password: 'password4'},
]
app.use(bodyParser.json());
//*************************************************Authentication*************************************************************** */
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  

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
  const { username, password } = req.body;

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
//*************************************************Bank Operation*************************************************************** */
app.post('/deposit', (req, res) => {
  const { amount } = req.body;
  const depositAmount = parseInt(amount);
  if (!depositAmount || isNaN(depositAmount) || depositAmount <= 0) {
    return res.status(400).json({ message: 'Invalid amount for deposit' });
  }

  balance += depositAmount;
  res.status(200).json({ message: 'Deposit successful', balance });
});

app.post('/withdraw', (req, res) => {
  const { amount } = req.body;
  const withdrawAmount = parseInt(amount);
  if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
    return res.status(400).json({ message: 'Invalid amount for withdraw' });
  }
  if (withdrawAmount > balance) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  balance -= withdrawAmount;
  res.status(200).json({ message: 'Withdrawal successful', balance });
});

app.get('/balance', (req, res) => {
  res.status(200).json({ balance });
});

beforeAll((done) => {
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    done();
  });
});


//*************************************************Testcase*************************************************************** */
// For Authentication Operation
describe('Authentication Operation', () => {
  //Test Case for idempotent
  test('Retrieving user information is idempotent', async () => {
    //mock.onGet(`${BASE_URL}/users/1`).reply(200, { id: 1, username: 'user1' });
    const response1 = await axios.get(`${BASE_URL}/users/1`);
    const response2 = await axios.get(`${BASE_URL}/users/1`);
    // Verify results
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(response1.data).toEqual(response2.data);
  });

 
  test('Login with valid user',async()=>{
    const testusr = {
      username: 'user1',
      password: 'password1'
    }
    const response = await axios.post(`${BASE_URL}/login`,testusr);
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Login successful');
  });
  test('Login should return a invalid user ', async () => {
    const testusr = {
      username: 'test',
      password: 'testpass'
    };
    
    try {
      await axios.post(`${BASE_URL}/login`, testusr);
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.message).toBe('Invalid username or password');
    }

  });
});
// For Bank Testcase
describe('Bank Account Operations', () => {
  let initialBalance;

  // Before running the tests, set the initial balance
  beforeAll(async () => {
    const response = await axios.get(`${BASE_URL}/balance`);
    initialBalance = response.data.balance;
  });

  test('Deposit function should return appropriate response', async () => {
    const depositAmount = { amount: 200 };
    const response = await axios.post(`${BASE_URL}/deposit`, depositAmount);
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Deposit successful');
  });

  test('Withdraw function should return appropriate response', async () => {
    const withdrawAmount = { amount: 100 };
    const response = await axios.post(`${BASE_URL}/withdraw`, withdrawAmount);
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Withdrawal successful');
  });

  test('Balance function should return the correct balance', async () => {
    const response = await axios.get(`${BASE_URL}/balance`);
    const currentBalance = response.data.balance;

    // Calculate the expected balance based on the initial balance and transactions
    const expectedBalance = initialBalance + 200 - 100;

    expect(response.status).toBe(200);
    expect(currentBalance).toBe(expectedBalance);
  });

  // After running the tests, reset the balance to its initial value
  afterAll(async () => {
    // Withdraw any remaining balance
    const remainingBalance = initialBalance + 200 - 100;
    const withdrawAmount = { amount: remainingBalance };
    await axios.post(`${BASE_URL}/withdraw`, withdrawAmount);
  });
});


afterAll((done) => {
  server.close(() => {
    console.log('Server closed');
    done();
  });
});