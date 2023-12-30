const request = require('supertest');
const server = require('./server'); // Assuming your server file is named 'server.js'

test('sanity', () => {
  expect(true).toBe(true)
})


describe('API Endpoints', () => {

  describe('POST /register', () => {
   
    it('should register a new account', async () => {
      const response = await request(server)
        .post('auth/register')
        .send({
          username: 'testuser',
          password: 'testpassword',
        });

      expect(response.statusCode).toBe(201);
      console.log(response);
      //expect(response.body).toHaveProperty('id');
      //expect(response.body).toHaveProperty('username', 'testuser');
      //expect(response.body).toHaveProperty('token');
    });

    it('should return an error when username or password is missing', async () => {
      const response = await request(server)
        .post('/register')
        .send({
          // Missing username and password intentionally
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toBe('username and password required');
    });

    it('should return an error when the username is taken', async () => {
      const response = await request(server)
        .post('/register')
        .send({
          username: 'existinguser',
          password: 'testpassword',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toBe('username taken');
    });
  });

  describe('POST /login', () => {
    it('should log in with valid credentials', async () => {
      const response = await request(server)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'testpassword',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).toHaveProperty('token');
    });

    it('should return an error when username or password is missing', async () => {
      const response = await request(server)
        .post('/login')
        .send({
          // Missing username and password intentionally
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toBe('username and password required');
    });

    it('should return an error with invalid credentials', async () => {
      const response = await request(server)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toBe('invalid credentials');
    });
  });
});