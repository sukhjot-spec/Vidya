const express = require('express');
const { body, validationResult } = require('express-validator');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/enrollments
// @desc    Enroll in a course
// @access  Private (Students only)
router.post('/', authenticate, authorize('student'), [
  body('courseId').isMongoId().withMessage('Invalid course ID'),
  body('paymentId').optional().trim(),
  body('amountPaid').isNumeric().isFloat({ min: 0 }).withMessage('Amount must be a positive number')
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

    const { courseId, paymentId, amountPaid } = req.body;

    // Check if course exists and is published
    const course = await Course.findById(courseId);
    if (!course || !course.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or not available'
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: req.user._id,
      course: courseId,
      paymentId,
      amountPaid,
      currency: course.currency,
      paymentStatus: amountPaid > 0 ? 'completed' : 'pending'
    });

    await enrollment.save();
    await enrollment.populate('course', 'title thumbnail instructor');
    await enrollment.populate('course.instructor', 'name');

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course'
    });
  }
});

// @route   GET /api/enrollments
// @desc    Get user's enrollments
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { student: req.user._id };
    if (status) {
      filter.status = status;
    }

    const enrollments = await Enrollment.find(filter)
      .populate('course', 'title description thumbnail instructor rating duration lessonsCount')
      .populate('course.instructor', 'name avatar')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Enrollment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments'
    });
  }
});

// @route   GET /api/enrollments/:id
// @desc    Get specific enrollment
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course')
      .populate('student', 'name email avatar');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment or is admin/instructor
    if (enrollment.student._id.toString() !== req.user._id.toString() && 
        req.user.userType !== 'admin' &&
        enrollment.course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment'
    });
  }
});

// @route   PUT /api/enrollments/:id/progress
// @desc    Update lesson progress
// @access  Private
router.put('/:id/progress', authenticate, [
  body('lessonId').isMongoId().withMessage('Invalid lesson ID'),
  body('timeSpent').optional().isNumeric().withMessage('Time spent must be a number'),
  body('completed').isBoolean().withMessage('Completed must be a boolean')
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

    const { lessonId, timeSpent = 0, completed } = req.body;

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (completed) {
      await enrollment.completeLesson(lessonId, timeSpent);
    } else {
      // Update last accessed lesson
      enrollment.progress.lastAccessedLesson = lessonId;
      enrollment.progress.lastAccessedAt = new Date();
      await enrollment.save();
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress'
    });
  }
});

// @route   POST /api/enrollments/:id/certificate
// @desc    Issue certificate for completed course
// @access  Private
router.post('/:id/certificate', authenticate, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course', 'title instructor certificate')
      .populate('student', 'name email');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment
    if (enrollment.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (enrollment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Course must be completed to issue certificate'
      });
    }

    if (enrollment.certificateIssued) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued'
      });
    }

    await enrollment.issueCertificate();

    res.json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        certificateUrl: enrollment.certificateUrl,
        issuedAt: enrollment.certificateIssuedAt
      }
    });
  } catch (error) {
    console.error('Issue certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue certificate'
    });
  }
});

// @route   GET /api/enrollments/course/:courseId/students
// @desc    Get students enrolled in a course (for instructors)
// @access  Private (Instructors and admins)
router.get('/course/:courseId/students', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
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
        message: 'Access denied'
      });
    }

    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'name email avatar')
      .sort({ enrolledAt: -1 });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course students'
    });
  }
});

module.exports = router;
