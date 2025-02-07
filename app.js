const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const csurf = require('csurf');
const morgan = require('morgan');
const routes = require('./routes');
const { environment } = require('./config');
const { ValidationError } = require('sequelize');

const app = express();

// Check if the environment is production
const isProduction = environment === 'production';

// Middleware for logging
app.use(morgan('dev'));

// Parse cookies
app.use(cookieParser());

// Parse JSON bodies
app.use(express.json());

// Security Middleware
if (!isProduction) {
  const cors = require('cors');
  app.use(cors()); // Enable CORS in development
}

app.use(
  helmet.crossOriginResourcePolicy({
    policy: 'cross-origin',
  })
);

// CSRF Middleware
app.use(
  csurf({
    cookie: {
      secure: isProduction, // Ensure cookies are secure in production
      sameSite: isProduction && 'Lax', // Restrict cross-origin requests in production
      httpOnly: true, // Cookies should be HTTP-only
    },
  })
);

// Connect all routes
app.use(routes);

// Catch unhandled requests and forward to error handler
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;
  next(err);
});

// Process Sequelize validation errors
app.use((err, _req, _res, next) => {
  if (err instanceof ValidationError) {
    const errors = {};
    for (const error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = 'Validation error';
    err.errors = errors;
  }
  next(err);
});

// Error Formatter
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);
  res.json({
    title: err.title || 'Server Error',
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack,
  });
});

// backend/routes/api/index.js
const router = require('express').Router();
const sessionRouter = require("./routes/api/session.js");
const usersRouter = require("./routes/api/users.js");
const { restoreUser } = require("./utils/auth.js");

// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null
router.use(restoreUser);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});


module.exports = app;
