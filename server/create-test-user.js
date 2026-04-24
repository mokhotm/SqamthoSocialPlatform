// Create a test user for development
import pg from 'pg';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const { Pool } = pg;

const databaseUrl = "postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb";

console.log('Connecting to database to create friend user...'); // Modified log

const pool = new Pool({
  connectionString: databaseUrl,
});

// Proper password hashing function matching the one in auth.ts
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

async function createOrUpdateUser(client, username, displayName, email, profilePicture, location, columns) {
  console.log(`Processing user: ${username}...`);

  const checkResult = await client.query(`
    SELECT id FROM users WHERE username = $1
  `, [username]);

  const hashedPassword = await hashPassword('password123');

  if (checkResult.rows.length > 0) {
    console.log(`${username} already exists, updating password...`);
    let updateQuery = 'UPDATE users SET ';
    const updateValues = [];
    let paramCount = 1;

    if ('password_hash' in columns) {
      updateQuery += `password_hash = $${paramCount}, `;
      updateValues.push(hashedPassword);
      paramCount++;
    } else if ('password' in columns) {
       updateQuery += `password = $${paramCount}, `;
       updateValues.push(hashedPassword);
       paramCount++;
    }

    if (paramCount > 1) {
      updateQuery = updateQuery.slice(0, -2);
      updateQuery += ` WHERE username = $${paramCount}`;
      updateValues.push(username);
      await client.query(updateQuery, updateValues);
      console.log(`${username} password updated`);
    }
    return checkResult.rows[0].id; // Return existing user ID
  } else {
    console.log(`Creating new user: ${username}...`);
    let insertColumns = 'username, display_name, email, profile_picture, location';
    let insertPlaceholders = '$1, $2, $3, $4, $5';
    const insertParams = [username, displayName, email, profilePicture, location];
    let paramCount = 6;

    if ('password_hash' in columns) {
      insertColumns += ', password_hash';
      insertPlaceholders += `, $${paramCount}`;
      insertParams.push(hashedPassword);
      paramCount++;
    } else if ('password' in columns) {
      insertColumns += ', password';
      insertPlaceholders += `, $${paramCount}`;
      insertParams.push(hashedPassword);
      paramCount++;
    }

    const insertQuery = `
      INSERT INTO users (${insertColumns})
      VALUES (${insertPlaceholders})
      RETURNING id;
    `;

    console.log('Insert query:', insertQuery);
    console.log('Insert params:', insertParams);

    const insertResult = await client.query(insertQuery, insertParams);
    console.log(`${username} created successfully`);
    return insertResult.rows[0].id; // Return new user ID
  }
}

async function createTestUsers() {
  const client = await pool.connect();

  try {
    console.log('Connecting to database to create test users...');

    const columnsResult = await client.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
    `);

    console.log('Users table columns:');
    const columns = {};
    columnsResult.rows.forEach(col => {
      console.log(`- ${col.column_name} (nullable: ${col.is_nullable})`);
      columns[col.column_name] = col.is_nullable === 'YES';
    });

    // Create 20 generic test users
    for (let i = 1; i <= 20; i++) {
      const username = `testuser${i}`;
      const displayName = `Test User ${i}`;
      const email = `testuser${i}@example.com`;
      const profilePicture = `https://via.placeholder.com/150/CCCCCC/000000?text=User${i}`;
      const location = `Test Location ${i}`;

      await createOrUpdateUser(
        client,
        username,
        displayName,
        email,
        profilePicture,
        location,
        columns
      );
    }

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    client.release();
    console.log('Database connection closed');
    process.exit(0);
  }
}

createTestUsers();
