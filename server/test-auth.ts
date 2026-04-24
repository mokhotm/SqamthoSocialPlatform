import { storage } from './storage';
import { hashPassword, comparePasswords } from './auth';

async function testAuth() {
  try {
    // Test user credentials
    const testUsername = 'testuser';
    const testPassword = 'testpass123';
    
    // Delete existing test user if any
    const existingUser = await storage.getUserByUsername(testUsername);
    if (existingUser) {
      console.log('Found existing test user');
      
      // Test password comparison
      const passwordMatch = await comparePasswords(testPassword, existingUser.password);
      console.log('Password match result:', passwordMatch);
      return;
    }
    
    // Create a new test user
    const hashedPassword = await hashPassword(testPassword);
    console.log('Created hashed password:', hashedPassword);
    
    const user = await storage.createUser({
      username: testUsername,
      password: hashedPassword,
      displayName: 'Test User',
      bio: '',
      profilePicture: '',
      location: '',
    });
    
    console.log('Created test user:', user);
    
    // Test password comparison
    const passwordMatch = await comparePasswords(testPassword, user.password);
    console.log('Password match result:', passwordMatch);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuth();
