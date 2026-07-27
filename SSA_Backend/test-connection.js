const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'architect_erp',
};

console.log('Attempting to connect with config:', {
  host: config.host,
  port: config.port,
  user: config.user,
  database: config.database,
  hasPassword: !!config.password
});

const client = new Client(config);

client.connect()
  .then(() => {
    console.log('SUCCESS: Successfully connected to PostgreSQL!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Time from DB:', res.rows[0]);
    return client.end();
  })
  .catch(err => {
    console.error('FAILURE: Could not connect to PostgreSQL database:', err.message);
    process.exit(1);
  });
