// create-base-testuser.js
import pg from 'pg';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const pool = new pg.Pool({
  user: 'sqamtho',
  password: '$qamth0#2025',
  host: 'localhost',
  port: 5432,
  database: 'sqamthodb',
  ssl: false
});

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function createTestUser() {
  const client = await pool.connect();
  try {
    const hashedPassword = await hashPassword('password123');
    const result = await client.query(`
      INSERT INTO users (username, display_name, email, password_hash, profile_picture, location, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (username) DO UPDATE SET password_hash = $4
      RETURNING id
    `, [
      'testuser',
      'Test User',
      'testuser@example.com',
      hashedPassword,
      'https://via.placeholder.com/150/CCCCCC/000000?text=TestUser',
      'Test Location',
      'A test user account'
    ]);
    console.log('Test user created/updated successfully');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    client.release();
    pool.end();
  }
}

createTestUser();
