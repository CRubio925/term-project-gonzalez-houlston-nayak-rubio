import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import Users from "../db/users.js";
import { TypedRequestBody, UserLoginRequestBody } from "../types/types.js";

const router = Router();

const SALT_ROUNDS = 10;

function gravatarUrl(email: string): string {
  const hash = crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");

  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}

router.get("/register", (_request, response) => {
  response.render("auth/register");
});

//Post route /register to create new user
router.post("/register", async (req: TypedRequestBody<UserLoginRequestBody>, res) => {
  const { email, password } = req.body;

  //check if email and password are sent
  if (!email || !password) {
    res.render("auth/register", { error: "Email and password required" });
    return;
  }

  if (password.length < 8) {
    res.render("auth/register", { error: "Password must be at least 8 characters" });
    return;
  }

  try {
    //chreck if user already exists with same email
    if (await Users.existing(email)) {
      res.render("auth/register", { error: "Email already exists" });
      return;
    }

    //hash the password before storing in database
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const avatar = gravatarUrl(email);

    const user = await Users.create(email, passwordHash, avatar);

    req.session.user = user;
    res.redirect("/lobby");
  } catch (err) {
    console.error("Registration error: ", err);
    res.render("auth/register", { error: "Registration failed" });
  }
});

router.get("/login", (_request, response) => {
  response.render("auth/login");
});

//Post route /login to authenticate user and create session
router.post("/login", async (req: TypedRequestBody<UserLoginRequestBody>, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.render("auth/login", { error: "Email and password required" });
    return;
  }

  try {
    const dBUser = await Users.findByEmail(email);
    const isMatch = await bcrypt.compare(password, dBUser.password_hash);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const user = {
      id: dBUser.id,
      email: dBUser.email,
      gravatar_url: dBUser.gravatar_url,
      created_at: dBUser.created_at,
    };

    req.session.user = user;
    res.redirect("/lobby");
  } catch (err) {
    console.error("Login error: ", err);
    res.render("auth/login", { error: "Invalid email or password" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error: ", err);
    }

    //clear the session cookie
    res.clearCookie("connect.sid");
    res.redirect("/auth/login");
  });
});

export default router;
