// // backend/routes/api/index.js
// const router = require('express').Router();
// const sessionRouter = require('./session.js');
// const usersRouter = require('./users.js');
// const { restoreUser } = require("../../utils/auth.js");

// // Connect restoreUser middleware to the API router
//   // If current user session is valid, set req.user to the user in the database
//   // If current user session is not valid, set req.user to null
// router.use(restoreUser);

// router.use('/session', sessionRouter);

// router.use('/users', usersRouter);

// router.post('/test', (req, res) => {
//   res.json({ requestBody: req.body });
// });

// module.exports = router;

const express = require("express");
const { check } = require("express-validator");
const bcrypt = require("bcryptjs");
const { handleValidationErrors } = require("../../utils/validation");
const {
  setTokenCookie,
  restoreUser,
  requireAuth,
} = require("../../utils/auth");
const { User } = require("../../db/models");

const sessionRouter = require("./session.js");
const router = express.Router();

// CSRF Restore Route
router.get("/csrf/restore", (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200).json({
    "XSRF-Token": csrfToken,
  });
});

// Test Authentication Utilities
router.get("/set-token-cookie", async (req, res) => {
  const user = await User.findOne({ where: { username: "Demo-lition" } });
  setTokenCookie(res, user);
  res.json({ user });
});

router.get("/restore-user", restoreUser, (req, res) => {
  res.json(req.user);
});

router.get("/require-auth", restoreUser, requireAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
