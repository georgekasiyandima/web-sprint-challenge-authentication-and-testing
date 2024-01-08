const request = require("supertest");
const server = require("./server");
const db = require('../data/dbConfig')

test("sanity", () => {
  expect(true).toBe(true);
});

beforeAll(async () => {
  await db.migrate.rollback() // so any changes to migration files are picked up
  await db.migrate.latest()
})
beforeEach(async () => {
  await db('users').truncate()
})
afterAll(async () => {
  await db.destroy()
})

describe("API Endpoints", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new account", async () => {
      const response = await request(server).post("/api/auth/register").send({
        username: "testuser",
        password: "testpassword",
      });
      console.log(response.body);

      expect(response.statusCode).toBe(201); 

      // Add your assertions here
      // expect(response.body).toHaveProperty('id');
      // expect(response.body).toHaveProperty('username', 'testuser');
      // expect(response.body).toHaveProperty('token');
    });

    it("should return an error when username or password is missing", async () => {
      const response = await request(server).post("/api/auth/register").send({
        // Missing username and password intentionally
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toBe("username and password required");
    });

    it("should return an error when the username is taken", async () => {
      await request(server).post("/api/auth/register").send({
        username: "testuser",
        password: "testpassword",
      });
      const response = await request(server).post("/api/auth/register").send({
        username: "testuser",
        password: "testpassword",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toBe("username taken");
    });
  });
});

  describe("POST api/auth/login", () => {
    it("should log in with valid credentials", async () => {
      await request(server).post("/api/auth/register").send({
        username: "testuser",
        password: "testpassword",
      });
      const response = await request(server).post("/api/auth/login").send({
        username: "testuser",
        password: "testpassword",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("username", "testuser");
      expect(response.body).toHaveProperty("token");
    });

    it("should return an error when username or password is missing", async () => {
      const response = await request(server).post("/api/auth/login").send({
        // Missing username and password intentionally
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toBe("username and password required");
    });

    it("should return an error with invalid credentials", async () => {
      await request(server).post("/api/auth/register").send({
        username: "testuser",
        password: "testpassword",
      });
      const response = await request(server).post("/api/auth/login").send({
        username: "testuser",
        password: "wrongpassword",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toBe("invalid credentials");
    });
  });

