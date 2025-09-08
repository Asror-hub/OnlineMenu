const bcrypt = require('bcryptjs');

async function createUser() {
  try {
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Password:', password);
    console.log('Hashed password:', hashedPassword);
    
    // Test the hash
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('Hash validation test:', isValid);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createUser();
