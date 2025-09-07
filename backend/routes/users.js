const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { authenticate, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;

    let dashboardData = {};

    if (userType === 'student') {
      // Student dashboard data
      const enrollments = await Enrollment.find({ student: userId })
        .populate('course', 'title thumbnail instructor rating')
        .populate('course.instructor', 'name')
        .sort({ enrolledAt: -1 })
        .limit(5);

      const stats = await Enrollment.aggregate([
        { $match: { student: userId } },
        {
          $group: {
            _id: null,
            totalEnrolled: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalTimeSpent: { $sum: '$progress.totalTimeSpent' },
            certificatesEarned: { $sum: { $cond: ['$certificateIssued', 1, 0] } }
          }
        }
      ]);

      const currentStats = stats[0] || {
        totalEnrolled: 0,
        completed: 0,
        totalTimeSpent: 0,
        certificatesEarned: 0
      };

      dashboardData = {
        enrollments,
        stats: {
          enrolledCourses: currentStats.totalEnrolled,
          completedCourses: currentStats.completed,
          totalHours: Math.round(currentStats.totalTimeSpent / 60),
          certificates: currentStats.certificatesEarned,
          progress: currentStats.totalEnrolled > 0 
            ? Math.round((currentStats.completed / currentStats.totalEnrolled) * 100) 
            : 0
        }
      };
    } else if (userType === 'teacher') {
      // Teacher dashboard data
      const courses = await Course.find({ instructor: userId })
        .sort({ createdAt: -1 })
        .limit(5);

      const stats = await Course.aggregate([
        { $match: { instructor: userId } },
        {
          $group: {
            _id: null,
            totalCourses: { $sum: 1 },
            totalStudents: { $sum: '$studentsCount' },
            totalRevenue: { $sum: { $multiply: ['$studentsCount', '$price'] } },
            avgRating: { $avg: '$rating.average' }
          }
        }
      ]);

      const currentStats = stats[0] || {
        totalCourses: 0,
        totalStudents: 0,
        totalRevenue: 0,
        avgRating: 0
      };

      // Get active students (enrolled in last 30 days)
      const activeStudents = await Enrollment.countDocuments({
        course: { $in: courses.map(c => c._id) },
        enrolledAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      dashboardData = {
        courses,
        stats: {
          totalCourses: currentStats.totalCourses,
          totalStudents: currentStats.totalStudents,
          totalRevenue: currentStats.totalRevenue,
          averageRating: Math.round(currentStats.avgRating * 10) / 10,
          activeStudents
        }
      };
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public (limited info) / Private (full info for own profile)
router.get('/:id', async (req, res) => {
  try {
    const isOwnProfile = req.user && req.user._id.toString() === req.params.id;
    const isAdmin = req.user && req.user.userType === 'admin';

    let selectFields = 'name avatar bio skills interests userType createdAt';
    
    if (isOwnProfile || isAdmin) {
      selectFields += ' email education experience socialLinks preferences lastLogin';
    }

    const user = await User.findById(req.params.id)
      .select(selectFields)
      .populate('enrolledCoursesCount')
      .populate('createdCoursesCount');

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin only)
router.get('/', authenticate, authorize('admin'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('userType').optional().isIn(['student', 'teacher', 'admin']),
  query('search').optional().trim()
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.userType) {
      filter.userType = req.query.userType;
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('name email avatar userType createdAt lastLogin isEmailVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/:id/status', authenticate, authorize('admin'), [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
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

    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('name email userType isActive');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get platform statistics (admin only)
// @access  Private (Admin only)
router.get('/stats/overview', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [userStats, courseStats, enrollmentStats] = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: '$userType',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Course statistics
      Course.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Enrollment statistics
      Enrollment.aggregate([
        {
          $group: {
            _id: null,
            totalEnrollments: { $sum: 1 },
            totalRevenue: { $sum: '$amountPaid' },
            completedCourses: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    // Format user stats
    const userStatsMap = {};
    userStats.forEach(stat => {
      userStatsMap[stat._id] = stat.count;
    });

    // Format course stats
    const courseStatsMap = {};
    courseStats.forEach(stat => {
      courseStatsMap[stat._id] = stat.count;
    });

    const enrollmentData = enrollmentStats[0] || {
      totalEnrollments: 0,
      totalRevenue: 0,
      completedCourses: 0
    };

    res.json({
      success: true,
      data: {
        users: {
          total: Object.values(userStatsMap).reduce((a, b) => a + b, 0),
          students: userStatsMap.student || 0,
          teachers: userStatsMap.teacher || 0,
          admins: userStatsMap.admin || 0
        },
        courses: {
          total: Object.values(courseStatsMap).reduce((a, b) => a + b, 0),
          published: courseStatsMap.published || 0,
          draft: courseStatsMap.draft || 0,
          archived: courseStatsMap.archived || 0
        },
        enrollments: {
          total: enrollmentData.totalEnrollments,
          completed: enrollmentData.completedCourses,
          revenue: enrollmentData.totalRevenue
        }
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics'
    });
  }
});

module.exports = router;
