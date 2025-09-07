const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  reported: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one review per student per course
reviewSchema.index({ student: 1, course: 1 }, { unique: true });

// Other indexes
reviewSchema.index({ course: 1, rating: -1 });
reviewSchema.index({ createdAt: -1 });

// Update course rating when review is saved
reviewSchema.post('save', async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  if (course) {
    await course.updateRating();
  }
});

// Update course rating when review is removed
reviewSchema.post('remove', async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  if (course) {
    await course.updateRating();
  }
});

module.exports = mongoose.model('Review', reviewSchema);
