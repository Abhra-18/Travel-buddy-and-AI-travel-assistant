const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const email = 'admin@gmail.com';
    const newPassword = 'password123';
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      process.exit(1);
    }
    
    user.password = newPassword;
    await user.save();
    
    console.log(`✅ Success! Password for ${email} has been reset to: ${newPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetPassword();
