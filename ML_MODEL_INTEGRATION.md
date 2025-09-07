# ML Model Integration Guide

## Overview
Your ML model has been successfully integrated into the OpenLearn platform. This guide shows you how to replace the placeholder with your actual trained model.

## Integration Points

### 1. Backend Integration (`/backend/routes/ml-predictions.js`)

Replace the placeholder model loading and prediction logic with your actual model:

```javascript
// In the MLModelService class, replace these methods:

async loadModel() {
  try {
    console.log('Loading ML model...');
    
    // OPTION 1: TensorFlow.js Model
    // const tf = require('@tensorflow/tfjs-node');
    // this.model = await tf.loadLayersModel('file://./models/your-model.json');
    
    // OPTION 2: Python Model via Child Process
    // const { spawn } = require('child_process');
    // this.pythonProcess = spawn('python', ['./ml-models/predict.py']);
    
    // OPTION 3: ONNX Model
    // const ort = require('onnxruntime-node');
    // this.model = await ort.InferenceSession.create('./models/your-model.onnx');
    
    // OPTION 4: HTTP API Call to External ML Service
    // this.modelEndpoint = 'http://your-ml-api.com/predict';
    
    // Replace with your actual model loading code
    this.model = null; // Your loaded model here
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
    console.log('Making ML prediction with data:', inputData);
    
    // REPLACE THIS SECTION WITH YOUR MODEL'S PREDICTION LOGIC
    
    // OPTION 1: TensorFlow.js Prediction
    // const tensor = tf.tensor2d([Object.values(inputData.data)]);
    // const prediction = this.model.predict(tensor);
    // const result = await prediction.data();
    
    // OPTION 2: Python Script Execution
    // const { exec } = require('child_process');
    // const result = await new Promise((resolve, reject) => {
    //   exec(`python predict.py '${JSON.stringify(inputData.data)}'`, (error, stdout) => {
    //     if (error) reject(error);
    //     else resolve(JSON.parse(stdout));
    //   });
    // });
    
    // OPTION 3: HTTP API Call
    // const axios = require('axios');
    // const response = await axios.post(this.modelEndpoint, inputData.data);
    // const result = response.data;
    
    // Current placeholder - replace with your prediction logic
    const prediction = {
      result: 'sample_prediction', // Replace with actual prediction
      confidence: 0.85,           // Replace with actual confidence
      probabilities: [0.15, 0.85], // Replace with actual probabilities
      timestamp: new Date().toISOString()
    };
    
    return prediction;
  } catch (error) {
    console.error('ML prediction error:', error);
    throw error;
  }
}
```

### 2. Model File Storage

Create a `models` directory in your backend:

```bash
mkdir backend/models
# Place your model files here:
# - your-model.json (TensorFlow.js)
# - your-model.onnx (ONNX)
# - your-model.pkl (Python pickle)
```

### 3. Python Integration (if using Python model)

Create a Python prediction script (`backend/ml-models/predict.py`):

```python
import sys
import json
import pickle
import numpy as np

def load_model():
    # Load your trained model
    with open('./models/your-model.pkl', 'rb') as f:
        model = pickle.load(f)
    return model

def predict(data):
    model = load_model()
    
    # Preprocess input data
    features = np.array([[
        data['income'],
        data['creditScore'],
        data['loanAmount'],
        data['employmentYears'],
        data['debtToIncome'],
        data['age']
    ]])
    
    # Make prediction
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0]
    
    return {
        'result': 'approved' if prediction == 1 else 'rejected',
        'confidence': float(max(probability)),
        'probabilities': probability.tolist()
    }

if __name__ == '__main__':
    input_data = json.loads(sys.argv[1])
    result = predict(input_data)
    print(json.dumps(result))
```

### 4. Frontend Customization

Update the ML prediction form in `/src/pages/MLPrediction.js` to match your model's input requirements:

```javascript
// Modify the predictionData state to match your model's features
const [predictionData, setPredictionData] = useState({
  // Replace these with your model's actual input features
  feature1: '',
  feature2: '',
  feature3: '',
  // ... add all required features
});

// Update the form fields in the JSX to match your features
```

### 5. Environment Variables

Add any required environment variables to `/backend/.env`:

```env
# ML Model Configuration
ML_MODEL_PATH=./models/your-model.json
ML_MODEL_TYPE=tensorflow
PYTHON_PATH=/usr/bin/python3

# External ML API (if applicable)
ML_API_ENDPOINT=https://your-ml-api.com
ML_API_KEY=your-api-key
```

## Installation Requirements

### For TensorFlow.js:
```bash
cd backend
npm install @tensorflow/tfjs-node
```

### For ONNX:
```bash
cd backend
npm install onnxruntime-node
```

### For Python Integration:
```bash
# Ensure Python and required packages are installed
pip install scikit-learn numpy pandas
```

## API Endpoints

Your ML model is accessible via these endpoints:

- `POST /api/ml/predict` - Make prediction with JSON data
- `POST /api/ml/predict-file` - Make prediction with file upload
- `GET /api/ml/model-info` - Get model information
- `GET /api/ml/predictions/history` - Get prediction history

## Testing Your Integration

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Test the prediction endpoint:
```bash
curl -X POST http://localhost:5001/api/ml/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "data": {
      "income": 50000,
      "creditScore": 720,
      "loanAmount": 25000,
      "employmentYears": 5,
      "debtToIncome": 0.35,
      "age": 30
    },
    "modelType": "loan_prediction"
  }'
```

3. Access the ML prediction page at: `http://localhost:3000/ml-prediction`

## Troubleshooting

### Common Issues:

1. **Model Loading Errors**: Check file paths and model format compatibility
2. **Memory Issues**: Ensure sufficient RAM for model loading
3. **Python Path Issues**: Verify Python installation and package dependencies
4. **API Timeout**: Increase timeout for large models or complex predictions

### Debugging:

Enable debug logging in your model service:
```javascript
console.log('Model input:', inputData);
console.log('Model output:', prediction);
```

## Security Considerations

1. **Input Validation**: Always validate input data before passing to your model
2. **Rate Limiting**: The API includes rate limiting to prevent abuse
3. **Authentication**: All ML endpoints require user authentication
4. **File Upload Security**: File uploads are restricted by type and size

## Performance Optimization

1. **Model Caching**: Keep the model loaded in memory
2. **Batch Predictions**: Process multiple predictions together when possible
3. **Async Processing**: Use async/await for non-blocking operations
4. **Connection Pooling**: Use connection pooling for database operations

Your ML model is now fully integrated into the platform! Users can access predictions through the web interface, and all predictions are stored in the database for analytics and history tracking.
