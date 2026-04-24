// Create a second test user for testing friend functionality
import pg from 'pg';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const { Pool } = pg;

const databaseUrl = "postgresql://sqamtho:$qamth0%232025@localhost:5432/sqamthodb";

console.log('Connecting to database to create second test user...');

const pool = new Pool({
  connectionString: databaseUrl,
});

// Proper password hashing function matching the one in auth.ts
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

async function createSecondTestUser() {
  const client = await pool.connect();
  
  try {
    console.log('Creating second test user...');
    
    // First, check the table structure to understand what columns we need to fill
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
    
    // Check if second test user already exists
    const checkResult = await client.query(`
      SELECT id FROM users WHERE username = 'frienduser'
    `);
    
    // Generate hashed password
    const hashedPassword = await hashPassword('password123');
    
    if (checkResult.rows.length > 0) {
      console.log('Second test user already exists, updating password...');
      
      // Build the update query based on available columns
      let updateQuery = 'UPDATE users SET ';
      const updateValues = [];
      let paramCount = 1;
      
      if ('password' in columns) {
        updateQuery += `password = $${paramCount}, `;
        updateValues.push(hashedPassword);
        paramCount++;
      }
      
      if ('password_hash' in columns) {
        updateQuery += `password_hash = $${paramCount}, `;
        updateValues.push(hashedPassword);
        paramCount++;
      }
      
      // Add display name and profile picture updates
      updateQuery += `display_name = $${paramCount}, `;
      updateValues.push('Friend User');
      paramCount++;
      
      updateQuery += `profile_picture = $${paramCount} `;
      updateValues.push('https://via.placeholder.com/150?text=FU');
      
      // Remove trailing comma and space
      updateQuery = updateQuery.replace(/, $/, ' ');
      updateQuery += ' WHERE username = \'frienduser\'';
      
      await client.query(updateQuery, updateValues);
      console.log('Second test user updated');
    } else {
      console.log('Creating new second test user...');
      
      // Build the insert query based on available columns
      let insertColumns = 'username, display_name, email, profile_picture, location';
      let insertValues = '$1, $2, $3, $4, $5';
      const insertParams = ['frienduser', 'Friend User', 'friend@example.com', 'https://via.placeholder.com/150?text=FU', 'Friend Location'];
      let paramCount = 6;
      
      if ('password' in columns) {
        insertColumns += ', password';
        insertValues += `, $${paramCount}`;
        insertParams.push(hashedPassword);
        paramCount++;
      }
      
      if ('password_hash' in columns) {
        insertColumns += ', password_hash';
        insertValues += `, $${paramCount}`;
        insertParams.push(hashedPassword);
        paramCount++;
      }
      
      const insertQuery = `
        INSERT INTO users (${insertColumns})
        VALUES (${insertValues})
      `;
      
      console.log('Insert query:', insertQuery);
      console.log('Insert params:', insertParams);
      
      await client.query(insertQuery, insertParams);
      console.log('Second test user created successfully');
    }

    // Now create a friend request from testuser to frienduser
    // First, get the IDs of both users
    const usersResult = await client.query(`
      SELECT id, username FROM users WHERE username IN ('testuser', 'frienduser')
    `);

    if (usersResult.rows.length === 2) {
      const testUser = usersResult.rows.find(user => user.username === 'testuser');
      const friendUser = usersResult.rows.find(user => user.username === 'frienduser');

      if (testUser && friendUser) {
        console.log(`Found test users: testuser (ID: ${testUser.id}), frienduser (ID: ${friendUser.id})`);

        // Check if a friend request already exists
        const checkFriendRequest = await client.query(`
          SELECT * FROM friends 
          WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
        `, [testUser.id, friendUser.id]);

        if (checkFriendRequest.rows.length === 0) {
          // Create a pending friend request from testuser to frienduser
          await client.query(`
            INSERT INTO friends (user_id, friend_id, status)
            VALUES ($1, $2, 'pending')
          `, [testUser.id, friendUser.id]);
          
          console.log(`Created friend request from testuser to frienduser`);
        } else {
          console.log(`Friend relationship already exists between testuser and frienduser`);
        }
      }
    }
  } catch (error) {
    console.error('Error creating second test user:', error);
  } finally {
    client.release();
    console.log('Database connection closed');
    process.exit(0);
  }
}

createSecondTestUser();
