import express from "express";
import dotenv from "dotenv";
import hbs from "hbs";
import path from "path";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import sequelize from "./Database/MySql_connection.js";
import route from "./Routes/Admin_Route.js";
import { fileURLToPath } from "url";
import { EventEmitter } from "events";
import mysql from "mysql2"; // Import mysql2
import flash from "connect-flash";

// Increase the max listeners to prevent warnings
EventEmitter.defaultMaxListeners = 20;

// Initialize dotenv
dotenv.config();

const port = process.env.PORT || 4000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure MySQL connection pool for session store
const sessionConnectionPool = mysql.createPool({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "vivek",
  database: "milleniance_account",
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
  acquireTimeout: 10000,
});

// Configure session store
const MySQLStoreSession = MySQLStore(session);

const sessionStore = new MySQLStoreSession(
  {
    expiration: 86400000, // 1 day
    checkExpirationInterval: 900000, // 15 minutes
  },
  sessionConnectionPool // Use the raw mysql2 connection pool
);

app.use(
  session({
    key: "session_cookie_name",
    secret: process.env.SESSION_SECRET || "tomharry@123",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(flash());

// Middleware to pass flash messages to views
app.use((req, res, next) => {
  res.locals.successMessage = req.flash("success");
  res.locals.errorMessage = req.flash("error");
  next();
});

// Set up the view engine
app.set("view engine", "html");
app.engine("html", hbs.__express);

// Ensure correct views directory
app.set("views", path.join(__dirname, "Views"));
app.use(express.static(path.join(__dirname, "Views", "public")));
app.use("/css", express.static(path.join(__dirname, "Views", "public", "assets", "css")))
// Static files
app.use(express.static(path.join(__dirname, "Views", "public", "assets")));
hbs.registerPartials(path.join(__dirname, "Views", "commonTemplate"));

app.use("/images", express.static(path.join(__dirname, "Views", "public", "assets", "images"))); // Serve images
app.use("/js", express.static(path.join(__dirname, "Views", "public", "assets", "js"))); // Serve JS files
app.use("/images", express.static(path.join(__dirname, "Views", "public", "images")));

// Static files
 // Serve all files in the public folder
; // Serve CSS files



// Routes
app.use("/", route);

// Start server
const startServer = () => {
  sequelize
    .sync()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server running on port: http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error("MySQL connection failed. Error details:", err);
    });
};

startServer();
