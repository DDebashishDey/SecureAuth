const mongoose = require('mongoose');
const plm = require('passport-local-mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/MYAPP");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, 
    lowercase: true,
    set: (value) => value.replace(/\s+/g, '') // Remove spaces
  },
  fullname: {
    type: String,
    required: true,
  },
  password: {
    type: String
  },
  gender: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
  },
  profession: String,
  hobby: String,
  linkedin: String,
  github: String,
  twitter: String, 
  dp: {
    type: String, // URL or path to the profile picture
    default: '', // You can set a default profile picture if needed
  },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

userSchema.plugin(plm);  

module.exports = mongoose.model('User', userSchema);