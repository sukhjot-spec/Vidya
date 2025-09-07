const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const Prediction = require('../models/Prediction');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads (if your ML model needs file input)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/ml-inputs/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Add file type validation based on your ML model requirements
    const allowedTypes = /jpeg|jpg|png|csv|json|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type for ML prediction'));
    }
  }
});

// ML Model Integration Functions
class MLModelService {
  constructor() {
    // Initialize your ML model here
    this.modelLoaded = false;
    this.loadModel();
  }

  async loadModel() {
    try {
      // TODO: Replace with your actual model loading logic
      // Examples:
      // - Load TensorFlow.js model: tf.loadLayersModel()
      // - Load Python model via child_process or HTTP API
      // - Load ONNX model
      
      console.log('Loading ML model...');
      
      // Placeholder - replace with your model loading code
      this.model = null; // Your loaded model
      this.modelLoaded = true;
      
      console.log('ML model loaded successfully');
    } catch (error) {
      console.error('Failed to load ML model:', error);
      this.modelLoaded = false;
    }
  }

  async predict(inputData) {
    if (!this.modelLoaded) {
      throw new Error('ML model not loaded');
    }

    try {
      // TODO: Replace with your actual prediction logic
      // Examples:
      // - TensorFlow.js: model.predict(tensor)
      // - Call Python script: exec('python predict.py')
      // - HTTP request to ML API
      
      console.log('Making ML prediction with data:', inputData);
      
      // Placeholder prediction - replace with your model's prediction
      const prediction = {
        result: 'sample_prediction',
        confidence: 0.85,
        probabilities: [0.15, 0.85],
        timestamp: new Date().toISOString()
      };
      
      return prediction;
    } catch (error) {
      console.error('ML prediction error:', error);
      throw error;
    }
  }

  async predictFromFile(filePath) {
    if (!this.modelLoaded) {
      throw new Error('ML model not loaded');
    }

    try {
      // TODO: Process file and make prediction
      // Examples:
      // - Image processing: load image, preprocess, predict
      // - CSV processing: parse CSV, extract features, predict
      
      console.log('Making ML prediction from file:', filePath);
      
      // Placeholder - replace with your file processing logic
      const prediction = {
        result: 'file_based_prediction',
        confidence: 0.92,
        filePath: filePath,
        timestamp: new Date().toISOString()
      };
      
      return prediction;
    } catch (error) {
      console.error('File-based ML prediction error:', error);
      throw error;
    }
  }
}

// Initialize ML service
const mlService = new MLModelService();

// @route   POST /api/ml/predict
// @desc    Make ML prediction with JSON data
// @access  Private
router.post('/predict', authenticate, [
  body('data').notEmpty().withMessage('Input data is required')
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

    const { data, modelType, options } = req.body;

    const startTime = Date.now();
    
    // Make prediction
    const prediction = await mlService.predict({
      data,
      modelType,
      options,
      userId: req.user._id
    });

    const processingTime = Date.now() - startTime;

    // Save prediction to database
    const predictionRecord = new Prediction({
      user: req.user._id,
      modelType: modelType || 'loan_prediction',
      inputData: data,
      prediction: prediction,
      processingTime,
      status: 'completed',
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    await predictionRecord.save();

    res.json({
      success: true,
      data: {
        ...prediction,
        predictionId: predictionRecord._id,
        processingTime
      },
      message: 'Prediction completed successfully'
    });
  } catch (error) {
    console.error('ML prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Prediction failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/ml/predict-file
// @desc    Make ML prediction with file upload
// @access  Private
router.post('/predict-file', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { modelType, options } = req.body;

    // Make prediction from file
    const prediction = await mlService.predictFromFile(req.file.path);

    // Log prediction for analytics
    console.log(`File-based ML Prediction made by user ${req.user._id}:`, {
      filename: req.file.originalname,
      output: prediction,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: prediction,
      message: 'File prediction completed successfully'
    });
  } catch (error) {
    console.error('File ML prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'File prediction failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/ml/model-info
// @desc    Get ML model information
// @access  Private
router.get('/model-info', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      modelLoaded: mlService.modelLoaded,
      modelType: 'Your ML Model Type', // Replace with your model info
      version: '1.0.0',
      supportedInputs: ['json', 'csv', 'image'], // Replace with your supported inputs
      description: 'Description of what your ML model does'
    }
  });
});

// @route   GET /api/ml/predictions/history
// @desc    Get user's prediction history
// @access  Private
router.get('/predictions/history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const predictions = await Prediction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Prediction.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        predictions,
        pagination: {
          current: parseInt(page),
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get prediction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prediction history'
    });
  }
});

module.exports = router;
