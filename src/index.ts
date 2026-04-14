import express from "express"; //web server framework
import path from "path"; //works with path files
import { fileURLToPath } from "url";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";

// import dotenv from "dotenv";

import homeRoutes from "./routes/home.js";
import authRoutes from "./routes/auth.js";
import testRoute from "./routes/testRoute.js";
import lobbyRoutes from "./routes/lobby.js";
import loggingMiddleware from "./middleware/logging.js";
import db from "./db/connection.js";
// import { requireAuth } from "./middleware/auth.js";

import livereload from "livereload";
import connectLivereload from "connect-livereload";

// dotenv.config();

//create express app and set port
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

//figures out what folder this file is in (src) and then goes up one level to find public folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PgSession = connectPgSimple(session);

// Live reload — dev only
if (process.env.NODE_ENV !== "production") {
  const lrServer = livereload.createServer({
    delay: 200,
    port: 35729,
    exts: ["ejs", "html", "css", "js"],
  });
  lrServer.watch([path.join(process.cwd(), "public"), path.join(process.cwd(), "views")]);
  app.use(connectLivereload({ port: 35729 }));
}

//functions that run before routes
//read json and data from requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

/***** NEW *******/
app.use(
  session({
    store: new PgSession({ pgPromise: db }),
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);
/***** NEW *******/

/*app.use(
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
);*/ // recheck this

//look in public folder for static files (html, css, js)
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(loggingMiddleware);

//home route
app.use("/", homeRoutes);
app.use("/test", testRoute);

//auth routes
app.use("/auth", authRoutes);

app.use("/lobby", lobbyRoutes);

//protected route
/*app.get("/protected", requireAuth, (req, res) => {
  res.json({
    message: "Protected route success",
    user: req.session.user,
  });
});
*/
app.listen(PORT, () => {
  console.log(
    `Server is running at http://localhost:${String(PORT)} at ${new Date().toLocaleTimeString()}`,
  );
});
