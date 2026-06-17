const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Simple User schema to fetch the raw document
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('UserCheck', userSchema, 'users');
    
    const email = 'rajsamui@gmail.com';
    const password = 'abhra@05';
    
    const cleanEmail = email.trim().toLowerCase();
    console.log(`Checking email: "${cleanEmail}"`);
    
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      console.log('USER NOT FOUND');
    } else {
      console.log('User found! Checking password...');
      const userDoc = user.toObject();
      const isMatch = await bcrypt.compare(password, userDoc.password);
      if (isMatch) {
        console.log('PASSWORD MATCHES!');
      } else {
        console.log('PASSWORD DOES NOT MATCH!');
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
