const express = require("express");
const router = express.Router();
const prisma = require("../config/database");
const bcrypt = require("bcrypt");
const passport = require("passport");
const {
  ensureAuthenticated,
  ensureGuest,
} = require("../middleware/authMiddleware");

router.get("/login", ensureGuest, (req, res) => {
  res.render("auth/login", { message: req.flash("error") });
});

router.post(
  "/login",
  ensureGuest,
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

router.get("/register", ensureGuest, (req, res) => {
  res.render("auth/register", {
    error: null, // Asegúrate de pasar la variable error incluso cuando no haya error
    email: "", // Asegúrate de pasar la variable email aunque esté vacía
  });
});

router.post("/register", ensureGuest, async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render("auth/register", {
      error: "Las contraseñas no coinciden",
      email, // Mantenemos el email ingresado para mejor UX
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user_fu.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.redirect("/auth/login");
  } catch (err) {
    let errorMessage = "Error al registrar usuario";

    // Manejo específico de errores de Prisma
    if (err.code === "P2002") {
      errorMessage = "El email ya está registrado";
    }

    res.render("auth/register", {
      error: errorMessage,
      email, // Mantenemos el email ingresado
    });
  }
});

router.get("/logout", ensureAuthenticated, (req, res, next) => {
  // Cierra la sesión con Passport.js
  req.logout((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return next(err);
    }

    // Destruye la sesión en el servidor
    req.session.destroy((err) => {
      if (err) {
        console.error("Error al destruir la sesión:", err);
        return next(err);
      }

      // Borra la cookie de sesión en el cliente
      res.clearCookie("connect.sid"); // "connect.sid" es el nombre por defecto en express-session

      console.log("Sesión destruida y cookie eliminada.");
      res.redirect("/"); // Redirige al inicio
    });
  });
});

module.exports = router;
