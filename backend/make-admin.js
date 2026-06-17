const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Replace with the email of the user you want to make an admin
    const email = process.argv[2];
    
    if (!email) {
      console.log('Please provide an email. Example: node make-admin.js test@example.com');
      process.exit(1);
    }

    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    
    if (user) {
      console.log(`✅ Success! ${user.name} (${user.email}) is now an Admin.`);
    } else {
      console.log(`❌ User with email ${email} not found.`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
