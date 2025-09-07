const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  userType: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: [true, 'User type is required'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=2563eb&color=fff`;
    }
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    maxlength: [1000, 'Experience cannot exceed 1000 characters']
  },
  education: {
    type: String,
    maxlength: [1000, 'Education cannot exceed 1000 characters']
  },
  location: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true
  },
  twitter: {
    type: String,
    trim: true
  },
  socialLinks: {
    linkedin: String,
    github: String,
    website: String
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    courseUpdates: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for enrolled courses count
userSchema.virtual('enrolledCoursesCount', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'student',
  count: true
});

// Virtual for created courses count (for teachers)
userSchema.virtual('createdCoursesCount', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'instructor',
  count: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate avatar URL
userSchema.methods.generateAvatar = function() {
  if (!this.avatar || this.avatar.includes('ui-avatars.com')) {
    this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=2563eb&color=fff`;
  }
  return this.avatar;
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
};

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
