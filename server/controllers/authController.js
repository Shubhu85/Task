const { promisify } = require('util');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getConnection = require('../server');
const { customAlphabet } = require('nanoid');
const { ID_LENGTH, ID_ALPHABET, HASH_SALT, COOKIE_JWT } = require('../config');
const nanoid = customAlphabet(ID_ALPHABET, ID_LENGTH);

// User Signup Handler
exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new Error(`Username or Password not provided`);

    const pool = await getConnection();
    const hashedPassword = await bcrypt.hash(password, HASH_SALT);
    const userId = nanoid(); // Generate unique user ID

    await pool.request().query(
      `INSERT INTO ${process.env.DB_USERNAME_TABLE} (id, username, password) VALUES ('${userId}', '${username}', '${hashedPassword}')`
    );

    createSendToken({ id: userId, username }, res);
  } catch (err) {
    console.log(`⛔ SIGNUP ERROR: ${err.message}`);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// User Login Handler
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new Error(`Please provide username and password`);

    const pool = await getConnection();
    const result = await pool.request().query(
      `SELECT * FROM ${process.env.DB_USERNAME_TABLE} WHERE username = '${username}';`
    );

    const user = result.recordset[0];
    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new Error('Incorrect username or password');

    createSendToken(user, res);
  } catch (err) {
    console.log(`⛔ LOGIN ERROR: ${err.message}`);
    res.status(401).json({ status: 'fail', message: err.message });
  }
};

// Middleware to Protect Routes
exports.protect = async (req, res, next) => {
  try {
    let token = req.cookies[COOKIE_JWT]; // Retrieve token from HTTP-only cookie
    if (!token) throw new Error('Token not valid. Please log in again.');

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const result = await (await getConnection()).request().query(
      `SELECT * FROM ${process.env.DB_USERNAME_TABLE} WHERE id = '${decoded.id}'`
    );

    const currentUser = result.recordset[0];
    if (!currentUser) throw new Error('User not found');

    req.user = currentUser; // Attach user data to request
    next();
  } catch (err) {
    res.status(401).json({ status: 'fail', message: err.message });
  }
};

// User Logout Handler
exports.logout = (req, res) => {
  res.cookie(COOKIE_JWT, 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// Utility function to create and send JWT token in HTTP-only cookie
function createSendToken(user, res) {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie(COOKIE_JWT, token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true, // Secure token storage
  });

  res.status(200).json({
    status: 'success',
    data: { user: { id: user.id, username: user.username } },
  });
}
