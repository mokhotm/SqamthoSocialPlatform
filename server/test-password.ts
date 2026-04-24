import { storage } from './storage';

async function testPassword() {
  try {
    const username = 'mokhotm';
    const user = await storage.getUserByUsername(username);
    console.log('User:', user);
    
    if (user) {
      console.log('Password format:', {
        length: user.password.length,
        containsDot: user.password.includes('.'),
        parts: user.password.split('.').map(part => ({
          length: part.length,
          isHex: /^[0-9a-f]+$/i.test(part)
        }))
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testPassword();
