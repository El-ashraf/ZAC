import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    trim: true,
  },
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    trim: true,
  },
  otherName: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    required: [true, 'Please provide a role'],
    trim: true,
  },
  avatar: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent compiling model multiple times
export default mongoose.models.User || mongoose.model('User', UserSchema);



