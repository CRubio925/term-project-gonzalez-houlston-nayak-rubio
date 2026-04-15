import express from "express"; //web server framework
import path from "path"; //works with path files
import { fileURLToPath } from "url";
import dotenv from "dotenv";
// import session, { type SessionOptions } from "express-session";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";

import gamesRoutes from "./routes/games.js";
import homeRoutes from "./routes/home.js";
import authRoutes from "./routes/auth.js";
import testRoute from "./routes/testRoute.js";
import loggingMiddleware from "./middleware/logging.js";
import sseRoutes from "./routes/sse.js";
import { requireAuth } from "./middleware/auth.js";

dotenv.config();

//create express app and set port
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

//figures out what folder this file is in (src) and then goes up one level to find public folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//functions that run before routes
//read json and data from requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PgSession = connectPgSimple(session);

/* //configure session middleware to use PostgreSQL for session storage
const sessionOptions: SessionOptions = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  store: new (PgSession as never)({
    conString: process.env.DATABASE_URL,
    tableName: "user_sessions",
  }),
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
  },
};

app.use(session(sessionOptions));
*/

app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "ejs");

/***** NEW *******/
/* app.use(
  session({
    store: new PgSession({ pgPromise: db }),
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  }),
);
/***** NEW *******/

app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: "user_sessions",
    }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

//look in public folder for static files (html, css, js)
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(loggingMiddleware);

app.get("/ping", (_req, res) => {
  res.send("server is using this file");
});

//home route
app.use("/", homeRoutes);
app.use("/test", testRoute);

//auth routes
app.use("/auth", authRoutes);
app.use("/api/sse", sseRoutes);
app.use("/games", gamesRoutes);

//protected route
app.get("/protected", requireAuth, (req, res) => {
  res.json({
    message: "Protected route success",
    user: req.session.user,
  });
});

app.listen(PORT, () => {
  console.log(
    `Server is running at http://localhost:${String(PORT)} at ${new Date().toLocaleTimeString()}`,
  );
});
