const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  modelType: {
    type: String,
    required: [true, 'Model type is required'],
    enum: ['loan_prediction', 'risk_assessment', 'credit_score', 'other'], // Adjust based on your ML model
    default: 'loan_prediction'
  },
  inputData: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Input data is required']
  },
  prediction: {
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    probabilities: [Number],
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  processingTime: {
    type: Number, // Time in milliseconds
    default: 0
  },
  fileName: String, // If prediction was made from uploaded file
  filePath: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  errorMessage: String,
  metadata: {
    userAgent: String,
    ipAddress: String,
    sessionId: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
predictionSchema.index({ user: 1, createdAt: -1 });
predictionSchema.index({ modelType: 1 });
predictionSchema.index({ status: 1 });

// Virtual for formatted result
predictionSchema.virtual('formattedResult').get(function() {
  if (this.prediction && this.prediction.result) {
    return {
      result: this.prediction.result,
      confidence: this.prediction.confidence ? `${(this.prediction.confidence * 100).toFixed(1)}%` : 'N/A',
      timestamp: this.createdAt.toISOString()
    };
  }
  return null;
});

module.exports = mongoose.model('Prediction', predictionSchema);
