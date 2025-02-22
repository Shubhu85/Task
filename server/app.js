const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const userRouter = require('./routes/userRoutes');

// Middleware to parse JSON data from the frontend
app.use(express.json());

/*Handle Cookies */
// Enable cookie parsing for HTTP-only cookies
app.use(cookieParser());

/**ROUTES */
// Define user-related routes
app.use('/api/v1/users', userRouter);

module.exports = app;
