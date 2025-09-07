import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Play, 
  CheckCircle,
  Star,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Set default stats immediately to prevent errors
      setStats({
        totalCourses: 3,
        completedCourses: 1,
        inProgressCourses: 2,
        totalHours: 24
      });

      // Set default enrolled courses
      setEnrolledCourses([
        {
          id: 1,
          title: 'Introduction to React Development',
          instructor: 'John Doe',
          progress: 75,
          thumbnail: 'https://via.placeholder.com/300x200',
          enrolled: true
        },
        {
          id: 2,
          title: 'Advanced JavaScript Concepts',
          instructor: 'Jane Smith',
          progress: 30,
          thumbnail: 'https://via.placeholder.com/300x200',
          enrolled: true
        }
      ]);

      // Load dashboard stats with fallback
      try {
        const statsResponse = await api.getDashboardStats('student', user?.id);
        if (statsResponse?.success) {
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.log('Dashboard stats not available, using defaults');
      }

      // Load enrolled courses with fallback
      try {
        const coursesResponse = await api.getCourses();
        if (coursesResponse?.success && Array.isArray(coursesResponse.data)) {
          const enrolled = coursesResponse.data.filter(course => course.enrolled);
          if (enrolled.length > 0) {
            setEnrolledCourses(enrolled);
          }
        }
      } catch (error) {
        console.log('Courses not available, using defaults');
      }

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          type: 'course_completed',
          title: 'Completed lesson: React Components',
          course: 'Introduction to React Development',
          time: '2 hours ago',
          icon: <CheckCircle className="activity-icon completed" />
        },
        {
          id: 2,
          type: 'course_started',
          title: 'Started new course',
          course: 'Advanced JavaScript Concepts',
          time: '1 day ago',
          icon: <Play className="activity-icon started" />
        },
        {
          id: 3,
          type: 'certificate_earned',
          title: 'Earned certificate',
          course: 'Web Development Fundamentals',
          time: '3 days ago',
          icon: <Award className="activity-icon certificate" />
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1 className="dashboard-title">
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="dashboard-subtitle">
              Continue your learning journey and achieve your goals
            </p>
          </div>
          <div className="dashboard-actions">
            <Link to="/courses" className="btn btn-outline">
              Browse Courses
            </Link>
            <Link to="/recommendations" className="btn btn-primary">
              Get Recommendations
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <BookOpen className="icon" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats?.enrolledCourses || 0}</div>
              <div className="stat-label">Enrolled Courses</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Award className="icon" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats?.certificates || 0}</div>
              <div className="stat-label">Certificates</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Clock className="icon" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats?.totalHours || 0}h</div>
              <div className="stat-label">Learning Hours</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp className="icon" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats?.progress || 0}%</div>
              <div className="stat-label">Overall Progress</div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Enrolled Courses */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">My Courses</h2>
              <Link to="/courses" className="section-link">
                View All
              </Link>
            </div>
            
            {enrolledCourses.length > 0 ? (
              <div className="courses-grid">
                {enrolledCourses.map(course => (
                  <div key={course.id} className="course-card">
                    <div className="course-thumbnail">
                      <img src={course.thumbnail} alt={course.title} />
                      <div className="course-overlay">
                        <Link to={`/courses/${course.id}`} className="play-button">
                          <Play className="play-icon" />
                        </Link>
                      </div>
                    </div>
                    <div className="course-content">
                      <h3 className="course-title">{course.title}</h3>
                      <p className="course-instructor">by {course.instructor.name}</p>
                      <div className="course-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{course.progress}% Complete</span>
                      </div>
                      <div className="course-meta">
                        <span className="course-lessons">
                          {course.lessons} lessons
                        </span>
                        <span className="course-duration">
                          {course.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen className="empty-icon" />
                <h3>No courses enrolled yet</h3>
                <p>Start your learning journey by enrolling in a course</p>
                <Link to="/courses" className="btn btn-primary">
                  Browse Courses
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Recent Activity</h2>
            </div>
            <div className="activity-list">
              {recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon-container">
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <h4 className="activity-title">{activity.title}</h4>
                    <p className="activity-course">{activity.course}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Goals */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Learning Goals</h2>
              <button className="section-link">Set Goals</button>
            </div>
            <div className="goals-container">
              <div className="goal-card">
                <div className="goal-header">
                  <Target className="goal-icon" />
                  <h3>Complete React Course</h3>
                </div>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '75%' }}></div>
                  </div>
                  <span className="progress-text">75% Complete</span>
                </div>
                <p className="goal-deadline">Target: End of this month</p>
              </div>
              
              <div className="goal-card">
                <div className="goal-header">
                  <Award className="goal-icon" />
                  <h3>Earn 3 Certificates</h3>
                </div>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '33%' }}></div>
                  </div>
                  <span className="progress-text">1 of 3 Complete</span>
                </div>
                <p className="goal-deadline">Target: Next 2 months</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link to="/recommendations" className="quick-action">
                <BarChart3 className="action-icon" />
                <span>Get Recommendations</span>
              </Link>
              <Link to="/profile" className="quick-action">
                <Star className="action-icon" />
                <span>Update Profile</span>
              </Link>
              <Link to="/certificates" className="quick-action">
                <Award className="action-icon" />
                <span>View Certificates</span>
              </Link>
              <Link to="/calendar" className="quick-action">
                <Calendar className="action-icon" />
                <span>Study Schedule</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
