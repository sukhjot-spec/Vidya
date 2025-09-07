const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { spawn } = require('child_process');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// ML Recommendation Function
async function getMLRecommendations(query, topK = 5) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../ml-models/course_recommender.py');
    const pythonProcess = spawn('python3', [pythonScript, query, topK.toString()]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const recommendations = JSON.parse(output);
          resolve(recommendations);
        } catch (parseError) {
          reject(new Error(`Failed to parse ML output: ${parseError.message}`));
        }
      } else {
        reject(new Error(`ML script failed with code ${code}: ${errorOutput}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start ML script: ${error.message}`));
    });
  });
}

// @route   GET /api/recommendations
// @desc    Get personalized course recommendations
// @access  Private
router.get('/', auth.authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const userInterests = req.user.interests || [];
    const userSkills = req.user.skills || [];

    // Get user's enrolled courses to avoid recommending them again
    const enrolledCourses = await Enrollment.find({ student: userId })
      .select('course')
      .lean();
    const enrolledCourseIds = enrolledCourses.map(e => e.course);

    // Get user's completed courses to understand preferences
    const completedEnrollments = await Enrollment.find({
      student: userId,
      status: 'completed'
    }).populate('course', 'category level tags').lean();

    const completedCategories = completedEnrollments.map(e => e.course.category);
    const completedLevels = completedEnrollments.map(e => e.course.level);

    // Use ML model for intelligent recommendations
    const query = [...userInterests, ...userSkills, ...completedCategories].join(' ') || 'general courses';
    
    try {
      const mlRecommendations = await getMLRecommendations(query, 8);
      
      // Format ML recommendations to match existing structure
      const recommendations = mlRecommendations.map((rec, index) => ({
        id: `ml_${Date.now()}_${index}`,
        course: {
          id: `ml_${Date.now()}_${index}`,
          _id: `ml_${Date.now()}_${index}`,
          title: rec.title,
          description: rec.description,
          category: rec.category,
          level: rec.level,
          thumbnail: rec.thumbnail,
          instructor: {
            name: rec.instructor?.name || 'Khan Academy'
          },
          rating: rec.rating || 4.5,
          studentsCount: rec.studentsCount || 100,
          duration: rec.duration || '5 hours',
          lessons: Math.floor(Math.random() * 20) + 5,
          price: Math.floor(Math.random() * 100) + 29.99,
          tags: [rec.category?.toLowerCase() || 'general', rec.level?.toLowerCase() || 'beginner'],
          createdAt: new Date()
        },
        reason: `AI-powered recommendation (${(rec.similarity_score * 100).toFixed(0)}% match)`,
        confidence: rec.similarity_score,
        type: 'ml_based'
      }));

      res.json({
        success: true,
        data: recommendations,
        message: 'Personalized recommendations generated successfully'
      });
    } catch (mlError) {
      console.error('ML recommendation error:', mlError);
      
      // Fallback to original logic if ML fails
      let recommendations = [];
      const recommendationQuery = {
        _id: { $nin: enrolledCourseIds },
        status: 'published',
        isPublished: true
      };

      // 1. Recommend based on user interests and skills
      if (userInterests.length > 0 || userSkills.length > 0) {
        const interestBasedCourses = await Course.find({
          ...recommendationQuery,
          $or: [
            { tags: { $in: [...userInterests, ...userSkills] } },
            { category: { $in: userInterests } }
          ]
        })
        .populate('instructor', 'name avatar rating')
        .sort({ 'rating.average': -1, studentsCount: -1 })
        .limit(5)
        .lean();

        recommendations.push(...interestBasedCourses.map(course => ({
          course,
          reason: 'Based on your interests and skills',
          confidence: 0.8,
          type: 'interest_based'
        })));
      }

      // 2. Recommend based on completed course categories
      if (completedCategories.length > 0) {
        const categoryBasedCourses = await Course.find({
          ...recommendationQuery,
          category: { $in: completedCategories },
          _id: { $nin: [...enrolledCourseIds, ...recommendations.map(r => r.course._id)] }
        })
        .populate('instructor', 'name avatar rating')
        .sort({ 'rating.average': -1 })
        .limit(3)
        .lean();

        recommendations.push(...categoryBasedCourses.map(course => ({
          course,
          reason: `Similar to courses you've completed in ${course.category}`,
          confidence: 0.7,
          type: 'category_based'
        })));
      }

      // 3. Recommend next level courses
      if (completedLevels.length > 0) {
        const nextLevel = getNextLevel(completedLevels);
        if (nextLevel) {
          const levelBasedCourses = await Course.find({
            ...recommendationQuery,
            level: nextLevel,
            _id: { $nin: [...enrolledCourseIds, ...recommendations.map(r => r.course._id)] }
          })
          .populate('instructor', 'name avatar rating')
          .sort({ 'rating.average': -1 })
          .limit(3)
          .lean();

          recommendations.push(...levelBasedCourses.map(course => ({
            course,
            reason: `Ready for ${nextLevel} level courses`,
            confidence: 0.6,
            type: 'level_progression'
          })));
        }
      }

      // 4. Popular courses in trending categories
      const trendingCourses = await Course.find({
        ...recommendationQuery,
        featured: true,
        _id: { $nin: [...enrolledCourseIds, ...recommendations.map(r => r.course._id)] }
      })
      .populate('instructor', 'name avatar rating')
      .sort({ studentsCount: -1, 'rating.average': -1 })
      .limit(3)
      .lean();

      recommendations.push(...trendingCourses.map(course => ({
        course,
        reason: 'Popular and highly rated',
        confidence: 0.5,
        type: 'trending'
      })));

      // 5. Fill remaining slots with top-rated courses
      if (recommendations.length < 10) {
        const topRatedCourses = await Course.find({
          ...recommendationQuery,
          'rating.count': { $gte: 10 },
          _id: { $nin: [...enrolledCourseIds, ...recommendations.map(r => r.course._id)] }
        })
        .populate('instructor', 'name avatar rating')
        .sort({ 'rating.average': -1, 'rating.count': -1 })
        .limit(10 - recommendations.length)
        .lean();

        recommendations.push(...topRatedCourses.map(course => ({
          course,
          reason: 'Highly rated by students',
          confidence: 0.4,
          type: 'top_rated'
        })));
      }

      // Sort by confidence and limit to 10
      recommendations = recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10);

      res.json({
        success: true,
        data: recommendations,
        message: 'Fallback recommendations generated successfully'
      });
    }
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations'
    });
  }
});

// @route   GET /api/recommendations/similar/:courseId
// @desc    Get courses similar to a specific course
// @access  Public
router.get('/similar/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find similar courses based on category, level, and tags
    const similarCourses = await Course.find({
      _id: { $ne: course._id },
      status: 'published',
      isPublished: true,
      $or: [
        { category: course.category },
        { level: course.level },
        { tags: { $in: course.tags } },
        { instructor: course.instructor }
      ]
    })
    .populate('instructor', 'name avatar rating')
    .sort({ 'rating.average': -1, studentsCount: -1 })
    .limit(6)
    .lean();

    res.json({
      success: true,
      data: similarCourses
    });
  } catch (error) {
    console.error('Get similar courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch similar courses'
    });
  }
});

// @route   POST /api/recommendations/feedback
// @desc    Provide feedback on recommendation
// @access  Private
router.post('/feedback', auth.authenticate, async (req, res) => {
  try {
    const { courseId, helpful, reason } = req.body;

    // In a real application, you would store this feedback
    // and use it to improve the recommendation algorithm
    console.log('Recommendation feedback:', {
      userId: req.user._id,
      courseId,
      helpful,
      reason,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    console.error('Record feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback'
    });
  }
});

// Helper function to determine next level
function getNextLevel(completedLevels) {
  const levelOrder = ['Beginner', 'Intermediate', 'Advanced'];
  const maxLevelIndex = Math.max(...completedLevels.map(level => levelOrder.indexOf(level)));
  
  if (maxLevelIndex < levelOrder.length - 1) {
    return levelOrder[maxLevelIndex + 1];
  }
  
  return null; // Already at highest level
}

module.exports = router;
