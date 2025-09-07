const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
// @desc    Create payment intent for course enrollment
// @access  Private (Students only)
router.post('/create-payment-intent', authenticate, authorize('student'), [
  body('courseId').isMongoId().withMessage('Invalid course ID'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp', 'inr']).withMessage('Invalid currency')
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

    const { courseId, currency = 'usd' } = req.body;

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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(course.price * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        courseId: courseId.toString(),
        userId: req.user._id.toString(),
        courseName: course.title
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: course.price,
        currency: currency,
        course: {
          id: course._id,
          title: course.title,
          thumbnail: course.thumbnail
        }
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

// @route   POST /api/payments/confirm-enrollment
// @desc    Confirm enrollment after successful payment
// @access  Private (Students only)
router.post('/confirm-enrollment', authenticate, authorize('student'), [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('courseId').isMongoId().withMessage('Invalid course ID')
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

    const { paymentIntentId, courseId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Verify the payment matches the course and user
    if (paymentIntent.metadata.courseId !== courseId || 
        paymentIntent.metadata.userId !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Check if enrollment already exists
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
      paymentId: paymentIntentId,
      amountPaid: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency.toUpperCase(),
      paymentStatus: 'completed'
    });

    await enrollment.save();
    await enrollment.populate('course', 'title thumbnail instructor');

    res.json({
      success: true,
      message: 'Enrollment confirmed successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Confirm enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm enrollment'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Stripe webhook endpoint
// @access  Public (Stripe only)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // You can add additional logic here if needed
      // For example, sending confirmation emails
      
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // Handle failed payment
      // You might want to notify the user or log this event
      
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// @route   GET /api/payments/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const enrollments = await Enrollment.find({
      student: req.user._id,
      paymentStatus: 'completed'
    })
    .populate('course', 'title thumbnail')
    .select('course amountPaid currency paymentId enrolledAt')
    .sort({ enrolledAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Enrollment.countDocuments({
      student: req.user._id,
      paymentStatus: 'completed'
    });

    res.json({
      success: true,
      data: {
        payments: enrollments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
});

// @route   POST /api/payments/refund
// @desc    Process refund for enrollment
// @access  Private (Admin only or within refund period)
router.post('/refund', authenticate, [
  body('enrollmentId').isMongoId().withMessage('Invalid enrollment ID'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
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

    const { enrollmentId, reason } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('course', 'title');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment or is admin
    if (enrollment.student.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (enrollment.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'No payment to refund'
      });
    }

    // Check refund eligibility (e.g., within 30 days for non-admins)
    const refundDeadline = new Date(enrollment.enrolledAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (req.user.userType !== 'admin' && new Date() > refundDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Refund period has expired (30 days)'
      });
    }

    // Process refund with Stripe
    if (enrollment.paymentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: enrollment.paymentId,
          reason: 'requested_by_customer'
        });

        // Update enrollment status
        enrollment.paymentStatus = 'refunded';
        enrollment.status = 'dropped';
        enrollment.notes = reason || 'Refund processed';
        await enrollment.save();

        res.json({
          success: true,
          message: 'Refund processed successfully',
          data: {
            refundId: refund.id,
            amount: refund.amount / 100,
            currency: refund.currency
          }
        });
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        res.status(500).json({
          success: false,
          message: 'Failed to process refund with payment provider'
        });
      }
    } else {
      // Handle free enrollments or manual refunds
      enrollment.paymentStatus = 'refunded';
      enrollment.status = 'dropped';
      enrollment.notes = reason || 'Manual refund processed';
      await enrollment.save();

      res.json({
        success: true,
        message: 'Enrollment cancelled successfully'
      });
    }
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
});

module.exports = router;
