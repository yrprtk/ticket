const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please fill email"],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please fill password"],
  },
  role: {
    type: String,
    enum: ["admin", "engineer", "user"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
  },
  created: { 
    type: Date, 
    default: Date.now,
  },
  updated: { 
    type: Date, 
    default: Date.now,
  },
  refreshTokens:[
    {
      refreshToken: {
        type: String,
        required: true,
      },
      created: { 
        type: Date, 
        default: Date.now,
      }
    }
  ]
});

// encrypt the password using 'bcryptjs'
// Mongoose -> Document Middleware
userSchema.pre("save", async function(next) {
  // check the password if it is modified
  if (!this.isModified("password")) {
    return next();
  }
  // Hashing the password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// This is Instance Method that is gonna be available on all documents in a certain collection
userSchema.statics.getByEmail = async function(email){
  return await User.findOne({email, active: {$ne: false}});
};

userSchema.pre('updateOne', function() {
  this.set({ updated: new Date() });
});

const User = mongoose.model("User", userSchema);
module.exports = User;