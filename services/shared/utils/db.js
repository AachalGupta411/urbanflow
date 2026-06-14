'use strict';

const mysql = require('mysql2/promise');
const config = require('../config');
const logger = require('./logger');

let pool = null;

function createPool(overrides = {}) {
  const dbConfig = { ...config.mysql, ...overrides };
  return mysql.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: dbConfig.connectionLimit,
    queueLimit: 0,
  });
}

function getPool(overrides = {}) {
  if (!pool) {
    pool = createPool(overrides);
    logger.info('MySQL connection pool created', { database: overrides.database || config.mysql.database });
  }
  return pool;
}

async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

async function healthCheck() {
  const connection = await getPool().getConnection();
  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}

module.exports = { createPool, getPool, query, healthCheck };
