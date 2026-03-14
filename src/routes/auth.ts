import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../db/connection.js";

const router = Router();
const SALT_ROUNDS = 10;

//Post route /register to create new user
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  //check if email and password are sent
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    
    //chreck if user already exists with same email
    const existingUser = await db.oneOrNone(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    //hash the password before storing in database
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    //insert new user into database and return the created user
    const user = await db.one(
      `INSERT INTO users (email, password)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email, hashedPassword]
    );

    //store user info in session
    req.session.user = {
      id: user.id,
      email: user.email,
    };

    //respond with success message and user info
    res.status(201).json({ message: "Registration successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//Post route /login to authenticate user and create session
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    //find user by email
    const user = await db.oneOrNone(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    //store user info in session
    req.session.user = {
      id: user.id,
      email: user.email,
    };

    res.json({ message: "Login successful", user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Could not log out" });
    }

    //clear the session cookie
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

export default router;