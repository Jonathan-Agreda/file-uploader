require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const { Pool } = require("pg");
const session = require("express-session");
const flash = require("connect-flash");
const pgSession = require("connect-pg-simple")(session);
const passport = require("passport");
require("./config/passport");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const fileRoutes = require("./routes/fileRoutes");
const folderRoutes = require("./routes/folderRoutes");
const prisma = require("./config/database");

const app = express();

// Configuración de middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Configuración de vistas
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Configuración del pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Desactiva la verificación del certificado
  },
});

// Reemplaza la configuración de sesión existente con:
app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "session_fu",
      pruneSessionInterval: 60000,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 10 * 60 * 1000, // 30 segundos
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware de connect-flash
app.use(flash());

// Middleware para pasar mensajes flash a las vistas
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Rutas básicas
app.get("/", (req, res) => {
  res.render("index", { user: req.user || null });
});

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/files", fileRoutes);
app.use("/folders", folderRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", { error: err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
