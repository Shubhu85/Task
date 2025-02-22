const sql = require('mssql');

const sqlSettings = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true, 
    trustServerCertificate: true, 
  },
};

async function getConnection() {
  try {
    const pool = await sql.connect(sqlSettings);
    if (!pool) throw new Error('Error trying to connect');

    return pool;
  } catch (err) {
    console.log(`: ${err.message}`);
  }
}

module.exports = getConnection;
