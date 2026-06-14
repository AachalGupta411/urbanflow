'use strict';

const { query } = require('../../../shared/utils/db');

const PUBLIC_FIELDS = 'id, email, full_name, phone, created_at, updated_at';

async function findByEmail(email) {
  const rows = await query('SELECT * FROM passengers WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const rows = await query(`SELECT ${PUBLIC_FIELDS} FROM passengers WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function create({ email, passwordHash, fullName, phone }) {
  const result = await query(
    'INSERT INTO passengers (email, password_hash, full_name, phone) VALUES (?, ?, ?, ?)',
    [email, passwordHash, fullName, phone || null]
  );
  return findById(result.insertId);
}

async function update(id, { fullName, phone }) {
  await query(
    'UPDATE passengers SET full_name = ?, phone = ? WHERE id = ?',
    [fullName, phone || null, id]
  );
  return findById(id);
}

module.exports = { findByEmail, findById, create, update };
