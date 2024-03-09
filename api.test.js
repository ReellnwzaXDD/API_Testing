const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const BASE_URL = 'http://localhost:3000';

// Create a new instance of MockAdapter
const mock = new MockAdapter(axios);

// Import your Express server
const app = require('./server'); 

//Test Case for idempotent
test('Retrieving user information is idempotent', async () => {
  // Mock GET request to /users/1
  mock.onGet(`${BASE_URL}/users/1`).reply(200, { id: 1, username: 'user1' });

  // Step 3a: Send first GET request
  const response1 = await axios.get(`${BASE_URL}/users/1`);
  // Step 3c: Send second GET request
  const response2 = await axios.get(`${BASE_URL}/users/1`);
  // Verify results
  expect(response1.status).toBe(200);
  expect(response2.status).toBe(200);
  expect(response1.data).toEqual(response2.data);
});

/* test('Login should return a valid user token', async () => {
  // Mock POST request to /login
  const mockCredentials = { username: 'zaoza2546', password: '12345678' };
  mock.onPost(`${BASE_URL}/login`, mockCredentials).reply(401);

  // Step: Send POST request with login credentials
  const response = await axios.post(`${BASE_URL}/login`, mockCredentials);

  // Verify results
  expect(response.status).toBe(401);
}); */
const users=[
  {id:1, username: 'admin', password: 'admin'},
  {id:2, username: 'user1', password: 'password1'},
  {id:3, username: 'user2', password: 'password2'},
  {id:4, username: 'user3', password: 'password3'},
  {id:5, username: 'user4', password: 'password4'},
]
mock.onPost(`${BASE_URL}/login`).reply(config => {
  const { username, password } = JSON.parse(config.data);
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return [401, { message: 'Invalid username or password' }];
  }
  return [200, { message: 'Login successful' }];
});
test('Login with valid user',async()=>{
  const testusr = {
    username: 'admin',
    password: 'admin'
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


afterAll(() => {
  mock.restore();
});
