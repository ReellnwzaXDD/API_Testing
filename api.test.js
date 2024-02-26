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

afterAll(() => {
  mock.restore();
});
