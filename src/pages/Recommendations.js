import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { 
  Brain, 
  Star, 
  Clock, 
  BookOpen, 
  TrendingUp,
  Target,
  Filter,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Zap,
  BarChart3
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './Recommendations.css';

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [feedback, setFeedback] = useState({});

  const filters = [
    { value: 'all', label: 'All Recommendations' },
    { value: 'high', label: 'High Confidence' },
    { value: 'medium', label: 'Medium Confidence' },
    { value: 'trending', label: 'Trending Now' },
    { value: 'new', label: 'New Courses' }
  ];

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.getRecommendations();
      if (response.success) {
        setRecommendations(response.data || []);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (recommendationId, isPositive) => {
    setFeedback(prev => ({
      ...prev,
      [recommendationId]: isPositive
    }));
    
    // In a real app, this would send feedback to the recommendation engine
    console.log(`Feedback for ${recommendationId}: ${isPositive ? 'positive' : 'negative'}`);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const filteredRecommendations = recommendations.filter(rec => {
    switch (filter) {
      case 'high':
        return rec.confidence >= 0.8;
      case 'medium':
        return rec.confidence >= 0.6 && rec.confidence < 0.8;
      case 'trending':
        return rec.course.studentsCount > 1000;
      case 'new':
        return rec.course.createdAt && new Date(rec.course.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  });

  const mockAnalytics = {
    totalRecommendations: recommendations.length,
    highConfidence: recommendations.filter(r => r.confidence >= 0.8).length,
    userEngagement: 78,
    accuracy: 85
  };

  if (loading) {
    return <LoadingSpinner message="Analyzing your preferences and generating recommendations..." />;
  }

  return (
    <div className="recommendations">
      <div className="container">
        {/* Header */}
        <div className="recommendations-header">
          <div className="header-content">
            <h1 className="recommendations-title">
              <Brain className="title-icon" />
              Personalized Recommendations
            </h1>
            <p className="recommendations-subtitle">
              AI-powered course suggestions tailored to your learning goals and interests
            </p>
          </div>
          <div className="header-actions">
            <button
              onClick={loadRecommendations}
              className="btn btn-outline"
              disabled={loading}
            >
              <RefreshCw className="btn-icon" />
              Refresh
            </button>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="analytics-overview">
          <div className="analytics-card">
            <div className="analytics-icon">
              <Target className="icon" />
            </div>
            <div className="analytics-content">
              <div className="analytics-number">{mockAnalytics.totalRecommendations}</div>
              <div className="analytics-label">Total Recommendations</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">
              <Zap className="icon" />
            </div>
            <div className="analytics-content">
              <div className="analytics-number">{mockAnalytics.highConfidence}</div>
              <div className="analytics-label">High Confidence</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">
              <TrendingUp className="icon" />
            </div>
            <div className="analytics-content">
              <div className="analytics-number">{mockAnalytics.userEngagement}%</div>
              <div className="analytics-label">Engagement Rate</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">
              <BarChart3 className="icon" />
            </div>
            <div className="analytics-content">
              <div className="analytics-number">{mockAnalytics.accuracy}%</div>
              <div className="analytics-label">Accuracy</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="recommendations-filters">
          <div className="filter-section">
            <Filter className="filter-icon" />
            <span className="filter-label">Filter by:</span>
            <div className="filter-buttons">
              {filters.map(filterOption => (
                <button
                  key={filterOption.value}
                  onClick={() => setFilter(filterOption.value)}
                  className={`filter-button ${filter === filterOption.value ? 'active' : ''}`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="recommendations-grid">
          {filteredRecommendations.map(recommendation => (
            <div key={recommendation.id} className="recommendation-card">
              <div className="recommendation-header">
                <div className="confidence-badge">
                  <span className={`confidence-level ${getConfidenceColor(recommendation.confidence)}`}>
                    {getConfidenceLabel(recommendation.confidence)}
                  </span>
                </div>
                <div className="recommendation-actions">
                  <button
                    onClick={() => handleFeedback(recommendation.id, true)}
                    className={`feedback-button ${feedback[recommendation.id] === true ? 'active' : ''}`}
                    title="This recommendation is helpful"
                  >
                    <ThumbsUp className="feedback-icon" />
                  </button>
                  <button
                    onClick={() => handleFeedback(recommendation.id, false)}
                    className={`feedback-button ${feedback[recommendation.id] === false ? 'active' : ''}`}
                    title="This recommendation is not helpful"
                  >
                    <ThumbsDown className="feedback-icon" />
                  </button>
                </div>
              </div>

              <div className="course-preview">
                <div className="course-thumbnail">
                  <img src={recommendation.course.thumbnail} alt={recommendation.course.title} />
                  <div className="course-overlay">
                    <Link to={`/courses/${recommendation.course.id}`} className="view-course">
                      <ArrowRight className="view-icon" />
                    </Link>
                  </div>
                </div>
                
                <div className="course-info">
                  <h3 className="course-title">
                    <Link to={`/courses/${recommendation.course.id}`}>
                      {recommendation.course.title}
                    </Link>
                  </h3>
                  <p className="course-instructor">
                    by {recommendation.course.instructor?.name || 'Unknown Instructor'}
                  </p>
                  
                  <div className="course-meta">
                    <div className="course-rating">
                      <Star className="rating-icon" />
                      <span className="rating-value">
                        {typeof recommendation.course.rating === 'object' 
                          ? (recommendation.course.rating.average || 0).toFixed(1)
                          : (recommendation.course.rating || 0).toFixed(1)}
                      </span>
                      <span className="rating-count">({recommendation.course.studentsCount})</span>
                    </div>
                    <div className="course-details">
                      <div className="course-detail">
                        <Clock className="detail-icon" />
                        <span>{recommendation.course.duration}</span>
                      </div>
                      <div className="course-detail">
                        <BookOpen className="detail-icon" />
                        <span>{recommendation.course.lessons} lessons</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="recommendation-reason">
                <div className="reason-header">
                  <Brain className="reason-icon" />
                  <span className="reason-title">Why we recommend this:</span>
                </div>
                <p className="reason-text">{recommendation.reason}</p>
              </div>

              <div className="recommendation-footer">
                <div className="course-price">
                  ${typeof recommendation.course.price === 'number' 
                    ? recommendation.course.price.toFixed(2) 
                    : '0.00'}
                </div>
                <Link to={`/courses/${recommendation.course.id}`} className="btn btn-primary">
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRecommendations.length === 0 && (
          <div className="empty-state">
            <Brain className="empty-icon" />
            <h3>No recommendations found</h3>
            <p>Try adjusting your filters or complete more courses to get better recommendations</p>
            <button
              onClick={() => setFilter('all')}
              className="btn btn-primary"
            >
              Show All Recommendations
            </button>
          </div>
        )}

        {/* How It Works */}
        <div className="how-it-works">
          <h2 className="section-title">How Our AI Recommendations Work</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Analyze Your Profile</h3>
              <p className="step-description">
                We analyze your learning history, completed courses, and stated interests
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Match Similar Learners</h3>
              <p className="step-description">
                Find other learners with similar backgrounds and successful learning paths
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Generate Recommendations</h3>
              <p className="step-description">
                Use machine learning to suggest courses that match your goals and preferences
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-title">Learn & Improve</h3>
              <p className="step-description">
                Our system learns from your feedback to provide better recommendations over time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
