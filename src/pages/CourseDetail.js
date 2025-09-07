import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { 
  Star, 
  Clock, 
  Users, 
  BookOpen, 
  Play, 
  CheckCircle,
  ArrowLeft,
  Share2,
  Heart,
  Award,
  MessageCircle,
  Download
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await api.getCourse(id);
      if (response.success) {
        setCourse(response.data);
        setEnrolled(response.data.enrolled || false);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await api.enrollInCourse(id, user.id);
      if (response.success) {
        setEnrolled(true);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return <LoadingSpinner message="Loading course details..." />;
  }

  if (!course) {
    return (
      <div className="course-detail">
        <div className="container">
          <div className="error-state">
            <h2>Course not found</h2>
            <p>The course you're looking for doesn't exist or has been removed.</p>
            <Link to="/courses" className="btn btn-primary">
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const curriculum = [
    {
      id: 1,
      title: 'Introduction to React',
      duration: '15 min',
      type: 'video',
      completed: true
    },
    {
      id: 2,
      title: 'Setting up Development Environment',
      duration: '20 min',
      type: 'video',
      completed: true
    },
    {
      id: 3,
      title: 'Components and JSX',
      duration: '25 min',
      type: 'video',
      completed: false
    },
    {
      id: 4,
      title: 'Props and State',
      duration: '30 min',
      type: 'video',
      completed: false
    },
    {
      id: 5,
      title: 'Handling Events',
      duration: '20 min',
      type: 'video',
      completed: false
    },
    {
      id: 6,
      title: 'Quiz: React Fundamentals',
      duration: '10 min',
      type: 'quiz',
      completed: false
    }
  ];

  const reviews = [
    {
      id: 1,
      user: {
        name: 'Sarah Johnson',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=2563eb&color=fff'
      },
      rating: 5,
      comment: 'Excellent course! The instructor explains everything clearly and the projects are very practical.',
      date: '2 days ago'
    },
    {
      id: 2,
      user: {
        name: 'Mike Chen',
        avatar: 'https://ui-avatars.com/api/?name=Mike+Chen&background=2563eb&color=fff'
      },
      rating: 5,
      comment: 'Great introduction to React. I learned a lot and feel confident to start building my own projects.',
      date: '1 week ago'
    },
    {
      id: 3,
      user: {
        name: 'Emily Rodriguez',
        avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=2563eb&color=fff'
      },
      rating: 4,
      comment: 'Very comprehensive course. The only thing I would add is more advanced topics.',
      date: '2 weeks ago'
    }
  ];

  return (
    <div className="course-detail">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/courses" className="breadcrumb-link">
            <ArrowLeft className="breadcrumb-icon" />
            Back to Courses
          </Link>
        </div>

        <div className="course-layout">
          {/* Main Content */}
          <div className="course-main">
            {/* Course Header */}
            <div className="course-header">
              <div className="course-badge">{course.level}</div>
              <h1 className="course-title">{course.title}</h1>
              <p className="course-description">{course.description}</p>
              
              <div className="course-meta">
                <div className="course-rating">
                  <Star className="rating-icon" />
                  <span className="rating-value">{course.rating}</span>
                  <span className="rating-count">({course.studentsCount} students)</span>
                </div>
                <div className="course-details">
                  <div className="course-detail">
                    <Clock className="detail-icon" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="course-detail">
                    <BookOpen className="detail-icon" />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="course-detail">
                    <Users className="detail-icon" />
                    <span>{course.studentsCount} students</span>
                  </div>
                </div>
              </div>

              <div className="course-actions">
                <button
                  onClick={toggleFavorite}
                  className={`action-button ${isFavorite ? 'favorited' : ''}`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className="action-icon" />
                </button>
                <button className="action-button" title="Share course">
                  <Share2 className="action-icon" />
                </button>
              </div>
            </div>

            {/* Course Video */}
            <div className="course-video">
              <div className="video-container">
                <img src={course.thumbnail} alt={course.title} className="video-thumbnail" />
                <div className="video-overlay">
                  <button className="play-button">
                    <Play className="play-icon" />
                  </button>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="course-content">
              <div className="content-section">
                <h2 className="section-title">What you'll learn</h2>
                <ul className="learning-objectives">
                  <li>Master React fundamentals and best practices</li>
                  <li>Build interactive user interfaces with components</li>
                  <li>Handle state management and data flow</li>
                  <li>Work with React hooks and modern patterns</li>
                  <li>Deploy React applications to production</li>
                </ul>
              </div>

              <div className="content-section">
                <h2 className="section-title">Course curriculum</h2>
                <div className="curriculum-list">
                  {curriculum.map((lesson, index) => (
                    <div key={lesson.id} className="curriculum-item">
                      <div className="lesson-info">
                        <div className="lesson-number">{index + 1}</div>
                        <div className="lesson-details">
                          <h4 className="lesson-title">{lesson.title}</h4>
                          <div className="lesson-meta">
                            <span className="lesson-duration">{lesson.duration}</span>
                            <span className="lesson-type">{lesson.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="lesson-status">
                        {lesson.completed ? (
                          <CheckCircle className="status-icon completed" />
                        ) : (
                          <Play className="status-icon pending" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="content-section">
                <h2 className="section-title">Instructor</h2>
                <div className="instructor-card">
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="instructor-avatar"
                  />
                  <div className="instructor-info">
                    <h3 className="instructor-name">{course.instructor.name}</h3>
                    <p className="instructor-title">Senior Software Engineer</p>
                    <p className="instructor-bio">
                      With over 8 years of experience in web development, {course.instructor.name} 
                      specializes in React, Node.js, and modern JavaScript frameworks. 
                      She has taught thousands of students and worked with top tech companies.
                    </p>
                    <div className="instructor-stats">
                      <div className="instructor-stat">
                        <Star className="stat-icon" />
                        <span>{course.instructor.rating} Instructor Rating</span>
                      </div>
                      <div className="instructor-stat">
                        <Users className="stat-icon" />
                        <span>1,250 Students</span>
                      </div>
                      <div className="instructor-stat">
                        <BookOpen className="stat-icon" />
                        <span>5 Courses</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="content-section">
                <h2 className="section-title">Student reviews</h2>
                <div className="reviews-list">
                  {reviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          className="review-avatar"
                        />
                        <div className="review-info">
                          <h4 className="review-name">{review.user.name}</h4>
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`star-icon ${i < review.rating ? 'filled' : ''}`}
                              />
                            ))}
                          </div>
                          <span className="review-date">{review.date}</span>
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="course-sidebar">
            <div className="sidebar-card">
              <div className="price-section">
                <div className="course-price">${course.price}</div>
                <div className="price-note">One-time payment</div>
              </div>

              {enrolled ? (
                <div className="enrollment-section">
                  <Link to={`/courses/${id}/learn`} className="btn btn-primary btn-large">
                    <Play className="btn-icon" />
                    Continue Learning
                  </Link>
                  <div className="enrollment-benefits">
                    <div className="benefit">
                      <CheckCircle className="benefit-icon" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="benefit">
                      <Award className="benefit-icon" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="benefit">
                      <Download className="benefit-icon" />
                      <span>Downloadable resources</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="enrollment-section">
                  <button onClick={handleEnroll} className="btn btn-primary btn-large">
                    Enroll Now
                  </button>
                  <div className="enrollment-benefits">
                    <div className="benefit">
                      <CheckCircle className="benefit-icon" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="benefit">
                      <Award className="benefit-icon" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="benefit">
                      <Download className="benefit-icon" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="benefit">
                      <MessageCircle className="benefit-icon" />
                      <span>Q&A with instructor</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="guarantee-section">
                <div className="guarantee">
                  <Award className="guarantee-icon" />
                  <div className="guarantee-text">
                    <strong>30-day money-back guarantee</strong>
                    <p>If you're not satisfied, get a full refund</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
