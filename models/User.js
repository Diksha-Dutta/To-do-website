const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  tasks: [{
    text: { type: String, required: true },
    done: { type: Boolean, default: false },
    
  }],
  datedTasks:[{
    text: { type: String, required: true },
    date: {type:Date,default:null},
    done: { type: Boolean, default: false }
    
  
  }]
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);