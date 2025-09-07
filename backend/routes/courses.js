const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().trim(),
  query('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  query('search').optional().trim(),
  query('sort').optional().isIn(['newest', 'oldest', 'rating', 'price-low', 'price-high', 'popular'])
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { status: 'published', isPublished: true };

    if (req.query.category) {
      filter.category = new RegExp(req.query.category, 'i');
    }

    if (req.query.level) {
      filter.level = req.query.level;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Build sort object
    let sort = { createdAt: -1 }; // Default: newest first

    switch (req.query.sort) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'popular':
        sort = { studentsCount: -1 };
        break;
    }

    // Execute query
    const courses = await Course.find(filter)
      .populate('instructor', 'name avatar rating')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Course.countDocuments(filter);

    // If user is authenticated, check enrollment status
    if (req.user) {
      const enrollments = await Enrollment.find({
        student: req.user._id,
        course: { $in: courses.map(c => c._id) }
      }).lean();

      const enrollmentMap = {};
      enrollments.forEach(enrollment => {
        enrollmentMap[enrollment.course.toString()] = {
          enrolled: true,
          progress: enrollment.progress.overallProgress,
          status: enrollment.status
        };
      });

      courses.forEach(course => {
        const enrollment = enrollmentMap[course._id.toString()];
        course.enrolled = !!enrollment;
        course.progress = enrollment?.progress || 0;
        course.enrollmentStatus = enrollment?.status || null;
      });
    }

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio rating experience')
      .populate('reviews');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled
    let enrollment = null;
    if (req.user) {
      enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: course._id
      });
    }

    // Get recent reviews
    const reviews = await Review.find({ course: course._id, isHidden: false })
      .populate('student', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    const courseData = course.toJSON();
    courseData.enrolled = !!enrollment;
    courseData.progress = enrollment?.progress.overallProgress || 0;
    courseData.enrollmentStatus = enrollment?.status || null;
    courseData.reviews = reviews;

    res.json({
      success: true,
      data: courseData
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course'
    });
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Teachers only)
router.post('/', authenticate, authorize('teacher', 'admin'), [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('category').isIn([
    'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
    'Artificial Intelligence', 'Design', 'Business', 'Marketing', 'Programming',
    'DevOps', 'Cybersecurity', 'Game Development', 'Other'
  ]).withMessage('Invalid category'),
  body('level').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid level'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('whatYouWillLearn').isArray({ min: 1 }).withMessage('What you will learn must be an array with at least one item')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const courseData = {
      ...req.body,
      instructor: req.user._id,
      status: 'published',
      isPublished: true,
      publishedAt: new Date()
    };

    const course = new Course(courseData);
    await course.save();

    await course.populate('instructor', 'name avatar bio rating');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course'
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Course instructor or admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own courses.'
      });
    }

    const allowedUpdates = [
      'title', 'description', 'shortDescription', 'category', 'subcategory',
      'level', 'price', 'originalPrice', 'thumbnail', 'previewVideo',
      'requirements', 'whatYouWillLearn', 'targetAudience', 'tags',
      'language', 'lessons'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('instructor', 'name avatar bio rating');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course'
    });
  }
});

// @route   PUT /api/courses/:id/publish
// @desc    Publish/unpublish course
// @access  Private (Course instructor or admin)
router.put('/:id/publish', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only publish your own courses.'
      });
    }

    const { publish } = req.body;

    course.status = publish ? 'published' : 'draft';
    course.isPublished = publish;

    if (publish && !course.publishedAt) {
      course.publishedAt = new Date();
    }

    await course.save();

    res.json({
      success: true,
      message: `Course ${publish ? 'published' : 'unpublished'} successfully`,
      data: course
    });
  } catch (error) {
    console.error('Publish course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course status'
    });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Course instructor or admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own courses.'
      });
    }

    // Check if course has enrollments
    const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
    if (enrollmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with active enrollments. Archive it instead.'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course'
    });
  }
});

// @route   GET /api/courses/instructor/:instructorId
// @desc    Get courses by instructor
// @access  Public
router.get('/instructor/:instructorId', async (req, res) => {
  try {
    const courses = await Course.find({
      instructor: req.params.instructorId,
      status: 'published',
      isPublished: true
    })
    .populate('instructor', 'name avatar rating')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor courses'
    });
  }
});

// @route   GET /api/courses/categories
// @desc    Get all course categories with counts
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Course.aggregate([
      { $match: { status: 'published', isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

module.exports = router;
