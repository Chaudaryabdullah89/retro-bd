import mongoose from 'mongoose';

const connecttodb = async () => {
  try {
    await mongoose.connect(Process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export default connecttodb;