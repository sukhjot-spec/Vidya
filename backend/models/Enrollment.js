const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number, // Time spent in minutes
    default: 0
  },
  lastWatchedPosition: {
    type: Number, // For video lessons, position in seconds
    default: 0
  }
});

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'suspended'],
    default: 'active'
  },
  progress: {
    completedLessons: [progressSchema],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastAccessedLesson: mongoose.Schema.Types.ObjectId,
    lastAccessedAt: Date,
    totalTimeSpent: {
      type: Number, // Total time spent in minutes
      default: 0
    }
  },
  completedAt: Date,
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateIssuedAt: Date,
  certificateUrl: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  notes: String,
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    reviewedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for completion percentage
enrollmentSchema.virtual('completionPercentage').get(function() {
  return this.progress.overallProgress;
});

// Ensure unique enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Other indexes for performance
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

// Calculate progress when lessons are completed
enrollmentSchema.methods.updateProgress = async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  
  if (!course || !course.lessons || course.lessons.length === 0) {
    return;
  }
  
  const totalLessons = course.lessons.length;
  const completedLessons = this.progress.completedLessons.length;
  
  this.progress.overallProgress = Math.round((completedLessons / totalLessons) * 100);
  
  // Mark as completed if all lessons are done
  if (this.progress.overallProgress === 100 && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  await this.save();
};

// Mark lesson as completed
enrollmentSchema.methods.completeLesson = async function(lessonId, timeSpent = 0) {
  // Check if lesson is already completed
  const existingProgress = this.progress.completedLessons.find(
    p => p.lesson.toString() === lessonId.toString()
  );
  
  if (!existingProgress) {
    this.progress.completedLessons.push({
      lesson: lessonId,
      timeSpent: timeSpent,
      completedAt: new Date()
    });
  }
  
  // Update total time spent
  this.progress.totalTimeSpent += timeSpent;
  this.progress.lastAccessedLesson = lessonId;
  this.progress.lastAccessedAt = new Date();
  
  await this.updateProgress();
};

// Issue certificate
enrollmentSchema.methods.issueCertificate = async function() {
  if (this.status === 'completed' && !this.certificateIssued) {
    this.certificateIssued = true;
    this.certificateIssuedAt = new Date();
    // In a real app, you would generate the certificate here
    this.certificateUrl = `https://certificates.openlearn.org/${this._id}`;
    await this.save();
  }
};

// Pre-save middleware to update course statistics
enrollmentSchema.post('save', async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  if (course) {
    await course.updateStudentsCount();
  }
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
