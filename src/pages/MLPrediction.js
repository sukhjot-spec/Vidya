import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const MLPrediction = () => {
  const { user } = useAuth();
  const [predictionData, setPredictionData] = useState({
    // Adjust these fields based on your ML model's input requirements
    income: '',
    creditScore: '',
    loanAmount: '',
    employmentYears: '',
    debtToIncome: '',
    age: '',
    education: '',
    homeOwnership: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [file, setFile] = useState(null);
  const [predictionType, setPredictionType] = useState('form'); // 'form' or 'file'

  useEffect(() => {
    fetchModelInfo();
    fetchPredictionHistory();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const response = await api.getMLModelInfo();
      if (response.success) {
        setModelInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch model info:', error);
    }
  };

  const fetchPredictionHistory = async () => {
    try {
      const response = await api.getPredictionHistory();
      if (response.success) {
        setHistory(response.data.predictions);
      }
    } catch (error) {
      console.error('Failed to fetch prediction history:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPredictionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      let response;
      
      if (predictionType === 'form') {
        // Convert string inputs to numbers where needed
        const processedData = {
          ...predictionData,
          income: parseFloat(predictionData.income) || 0,
          creditScore: parseInt(predictionData.creditScore) || 0,
          loanAmount: parseFloat(predictionData.loanAmount) || 0,
          employmentYears: parseInt(predictionData.employmentYears) || 0,
          debtToIncome: parseFloat(predictionData.debtToIncome) || 0,
          age: parseInt(predictionData.age) || 0
        };

        response = await api.makePrediction(processedData, 'loan_prediction');
      } else if (predictionType === 'file' && file) {
        response = await api.makePredictionFromFile(file, 'loan_prediction');
      } else {
        throw new Error('Please provide input data or select a file');
      }

      if (response.success) {
        setPrediction(response.data);
        fetchPredictionHistory(); // Refresh history
      } else {
        setError(response.message || 'Prediction failed');
      }
    } catch (error) {
      setError(error.message || 'An error occurred during prediction');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPredictionData({
      income: '',
      creditScore: '',
      loanAmount: '',
      employmentYears: '',
      debtToIncome: '',
      age: '',
      education: '',
      homeOwnership: ''
    });
    setPrediction(null);
    setError('');
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ML Prediction Tool</h1>
          <p className="mt-2 text-gray-600">
            Use our machine learning model to get predictions based on your data
          </p>
        </div>

        {/* Model Info */}
        {modelInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Model Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  modelInfo.modelLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {modelInfo.modelLoaded ? 'Ready' : 'Not Ready'}
                </span>
              </div>
              <div>
                <span className="font-medium">Version:</span>
                <span className="ml-2">{modelInfo.version}</span>
              </div>
              <div>
                <span className="font-medium">Supported Inputs:</span>
                <span className="ml-2">{modelInfo.supportedInputs?.join(', ')}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Prediction Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Make Prediction</h2>
                
                {/* Prediction Type Selector */}
                <div className="flex space-x-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setPredictionType('form')}
                    className={`px-4 py-2 rounded-md font-medium ${
                      predictionType === 'form'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Form Input
                  </button>
                  <button
                    type="button"
                    onClick={() => setPredictionType('file')}
                    className={`px-4 py-2 rounded-md font-medium ${
                      predictionType === 'file'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    File Upload
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {predictionType === 'form' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Annual Income ($)
                        </label>
                        <input
                          type="number"
                          name="income"
                          value={predictionData.income}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 50000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Credit Score
                        </label>
                        <input
                          type="number"
                          name="creditScore"
                          value={predictionData.creditScore}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 720"
                          min="300"
                          max="850"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Loan Amount ($)
                        </label>
                        <input
                          type="number"
                          name="loanAmount"
                          value={predictionData.loanAmount}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 25000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Employment Years
                        </label>
                        <input
                          type="number"
                          name="employmentYears"
                          value={predictionData.employmentYears}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Debt-to-Income Ratio
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="debtToIncome"
                          value={predictionData.debtToIncome}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 0.35"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={predictionData.age}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 30"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Education Level
                        </label>
                        <select
                          name="education"
                          value={predictionData.education}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Education</option>
                          <option value="high_school">High School</option>
                          <option value="bachelor">Bachelor's Degree</option>
                          <option value="master">Master's Degree</option>
                          <option value="phd">PhD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Home Ownership
                        </label>
                        <select
                          name="homeOwnership"
                          value={predictionData.homeOwnership}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Ownership</option>
                          <option value="own">Own</option>
                          <option value="rent">Rent</option>
                          <option value="mortgage">Mortgage</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Data File
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".csv,.json,.txt"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: CSV, JSON, TXT
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Get Prediction'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>

              {/* Prediction Result */}
              {prediction && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Result</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Result:</span>
                        <p className="text-lg font-semibold text-gray-900">{prediction.result}</p>
                      </div>
                      {prediction.confidence && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Confidence:</span>
                          <p className="text-lg font-semibold text-gray-900">
                            {(prediction.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {prediction.processingTime && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Processing Time:</span>
                          <p className="text-lg font-semibold text-gray-900">
                            {prediction.processingTime}ms
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prediction History */}
          <div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Predictions</h3>
              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.slice(0, 5).map((pred, index) => (
                    <div key={pred._id || index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {pred.prediction?.result || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(pred.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {pred.prediction?.confidence && (
                        <div className="text-xs text-gray-600">
                          Confidence: {(pred.prediction.confidence * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No predictions yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLPrediction;
