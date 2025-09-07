const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Lesson description is required']
  },
  videoUrl: String,
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Lesson duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  materials: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'audio', 'text', 'link']
    }
  }],
  order: {
    type: Number,
    required: true
  },
  isPreview: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Machine Learning',
      'Artificial Intelligence',
      'Design',
      'Business',
      'Marketing',
      'Programming',
      'DevOps',
      'Cybersecurity',
      'Game Development',
      'Other'
    ]
  },
  subcategory: String,
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR']
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop'
  },
  previewVideo: String,
  duration: {
    type: Number, // Total duration in hours
    required: [true, 'Course duration is required'],
    min: [0.5, 'Duration must be at least 0.5 hours']
  },
  lessons: [lessonSchema],
  requirements: [{
    type: String,
    trim: true
  }],
  whatYouWillLearn: [{
    type: String,
    required: true,
    trim: true
  }],
  targetAudience: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  language: {
    type: String,
    default: 'English',
    required: true
  },
  subtitles: [{
    language: String,
    url: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  studentsCount: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  certificate: {
    enabled: {
      type: Boolean,
      default: true
    },
    template: String
  },
  featured: {
    type: Boolean,
    default: false
  },
  bestseller: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total lessons count
courseSchema.virtual('lessonsCount').get(function() {
  return this.lessons ? this.lessons.length : 0;
});

// Virtual for enrollment count
courseSchema.virtual('enrollmentsCount', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course',
  count: true
});

// Virtual for reviews
courseSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'course'
});

// Calculate total duration from lessons
courseSchema.pre('save', function(next) {
  if (this.lessons && this.lessons.length > 0) {
    const totalMinutes = this.lessons.reduce((total, lesson) => total + lesson.duration, 0);
    this.duration = Math.round((totalMinutes / 60) * 10) / 10; // Convert to hours and round to 1 decimal
  }
  
  // Set published date when publishing
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    this.isPublished = true;
  }
  
  // Update lastUpdated
  this.lastUpdated = new Date();
  
  next();
});

// Update students count when enrollment changes
courseSchema.methods.updateStudentsCount = async function() {
  const Enrollment = mongoose.model('Enrollment');
  const count = await Enrollment.countDocuments({ 
    course: this._id, 
    status: 'active' 
  });
  this.studentsCount = count;
  await this.save();
};

// Calculate and update rating
courseSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { course: this._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].averageRating * 10) / 10;
    this.rating.count = stats[0].totalReviews;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }
  
  await this.save();
};

// Indexes for better query performance
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ featured: 1 });
courseSchema.index({ 'rating.average': -1 });
courseSchema.index({ studentsCount: -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
