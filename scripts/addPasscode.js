import mongoose from 'mongoose';
import Passcode from '../models/passcode.model.js';

const addTestPasscode = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/blogs', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Create a test passcode
    const testPasscode = new Passcode({
      passcode: '123456'
    });

    await testPasscode.save();
    console.log('Test passcode added successfully: 123456');

    // List all passcodes
    const allPasscodes = await Passcode.find({});
    console.log('All passcodes in database:', allPasscodes.map(p => p.passcode));

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
};

addTestPasscode(); 