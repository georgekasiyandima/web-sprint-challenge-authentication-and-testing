const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const db = require('../../data/dbConfig');

router.post("/register", async (req, res) => {
  //console.log(req.body);
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json("username and password required");
    }

    const existingUser = await db("users").where({ username }).first();
    if (existingUser) {
      return res.status(400).json("username taken");
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const newUser = {
      username,
      password: hashedPassword,
    };
    const [id] = await db("users").insert(newUser);

    const token = generateToken(newUser);

    res.status(201).json({
      id,
      username,
      password: hashedPassword,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Error registering a new account");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json("username and password required");
    }

    const user = await db("users").where({ username }).first();
    if (!user) {
      return res.status(401).json("invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json("invalid credentials");
    }

    const token = generateToken(user);

    res.status(200).json({
      id: user.id,
      username: user.username,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Error logging in");
  }
});
function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "1d",
  };
  return jwt.sign(payload, process.env.JWT_SECRET || "secret", options);
}

module.exports = router;

/*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */

/* IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
