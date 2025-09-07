import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Plus,
  Edit,
  BarChart3,
  MessageCircle,
  Award,
  Settings
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats with fallback
      try {
        const statsResponse = await api.getDashboardStats('teacher', user.id);
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.log('Dashboard stats not available, using defaults');
        setStats({
          totalCourses: 0,
          totalStudents: 0,
          totalRevenue: 0,
          avgRating: 0
        });
      }

      // Load teacher's courses with fallback
      try {
        const coursesResponse = await api.getCourses();
        if (coursesResponse.success) {
          // Filter for teacher's courses (mock data)
          const teacherCourses = coursesResponse.data.filter(course => course.instructor === user.id);
          setMyCourses(teacherCourses);
        }
      } catch (error) {
        console.log('Courses not available, using empty array');
        setMyCourses([]);
      }

      // Mock recent students
      setRecentStudents([
        {
          id: 1,
          name: 'Alex Johnson',
          email: 'alex@example.com',
          avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=2563eb&color=fff',
          course: 'Introduction to React Development',
          progress: 85,
          lastActive: '2 hours ago'
        },
        {
          id: 2,
          name: 'Sarah Chen',
          email: 'sarah@example.com',
          avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=2563eb&color=fff',
          course: 'Advanced JavaScript Concepts',
          progress: 60,
          lastActive: '1 day ago'
        },
        {
          id: 3,
          name: 'Mike Rodriguez',
          email: 'mike@example.com',
          avatar: 'https://ui-avatars.com/api/?name=Mike+Rodriguez&background=2563eb&color=fff',
          course: 'Data Science with Python',
          progress: 95,
          lastActive: '3 hours ago'
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1 className="dashboard-title">
              Welcome back, {user.name}! 👨‍🏫
            </h1>
            <p className="dashboard-subtitle">
              Manage your courses and help students achieve their goals
            </p>
          </div>
          <div className="dashboard-actions">
            <Link to="/create-course" className="btn btn-primary">
              <Plus className="btn-icon" />
              Create Course
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
              <div className="stat-number">{stats?.totalCourses || 0}</div>
              <div className="stat-label">Total Courses</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Users className="icon" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats?.totalStudents || 0}</div>
              <div className="stat-label">Total Students</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <DollarSign className="icon" />
            </div>
            <div className="stat-content">
              <div className="stat-number">${stats?.totalRevenue || 0}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Star className="icon" />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats?.averageRating || 0}</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* My Courses */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">My Courses</h2>
              <Link to="/create-course" className="section-link">
                <Plus className="section-icon" />
                Create New
              </Link>
            </div>
            
            {myCourses.length > 0 ? (
              <div className="courses-grid">
                {myCourses.map(course => (
                  <div key={course.id} className="course-card">
                    <div className="course-thumbnail">
                      <img src={course.thumbnail} alt={course.title} />
                      <div className="course-overlay">
                        <Link to={`/courses/${course.id}/edit`} className="edit-button">
                          <Edit className="edit-icon" />
                        </Link>
                      </div>
                    </div>
                    <div className="course-content">
                      <h3 className="course-title">{course.title}</h3>
                      <p className="course-instructor">by {course.instructor.name}</p>
                      <div className="course-stats">
                        <div className="course-stat">
                          <Users className="stat-icon" />
                          <span>{course.studentsCount} students</span>
                        </div>
                        <div className="course-stat">
                          <Star className="stat-icon" />
                          <span>{course.rating} rating</span>
                        </div>
                      </div>
                      <div className="course-meta">
                        <span className="course-lessons">
                          {course.lessons} lessons
                        </span>
                        <span className="course-price">
                          ${course.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen className="empty-icon" />
                <h3>No courses created yet</h3>
                <p>Start teaching by creating your first course</p>
                <Link to="/create-course" className="btn btn-primary">
                  Create Course
                </Link>
              </div>
            )}
          </div>

          {/* Recent Students */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Recent Students</h2>
              <Link to="/students" className="section-link">
                View All
              </Link>
            </div>
            <div className="students-list">
              {recentStudents.map(student => (
                <div key={student.id} className="student-item">
                  <div className="student-avatar">
                    <img src={student.avatar} alt={student.name} />
                  </div>
                  <div className="student-info">
                    <h4 className="student-name">{student.name}</h4>
                    <p className="student-course">{student.course}</p>
                    <div className="student-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{student.progress}%</span>
                    </div>
                    <span className="student-last-active">{student.lastActive}</span>
                  </div>
                  <div className="student-actions">
                    <button className="action-button" title="Send message">
                      <MessageCircle className="action-icon" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Analytics Overview</h2>
              <Link to="/analytics" className="section-link">
                <BarChart3 className="section-icon" />
                View Details
              </Link>
            </div>
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="analytics-header">
                  <TrendingUp className="analytics-icon" />
                  <h3>Student Growth</h3>
                </div>
                <div className="analytics-content">
                  <div className="analytics-number">+25%</div>
                  <p className="analytics-description">vs last month</p>
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="analytics-header">
                  <Award className="analytics-icon" />
                  <h3>Completion Rate</h3>
                </div>
                <div className="analytics-content">
                  <div className="analytics-number">87%</div>
                  <p className="analytics-description">course completion</p>
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="analytics-header">
                  <MessageCircle className="analytics-icon" />
                  <h3>Student Satisfaction</h3>
                </div>
                <div className="analytics-content">
                  <div className="analytics-number">4.8/5</div>
                  <p className="analytics-description">average rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link to="/create-course" className="quick-action">
                <Plus className="action-icon" />
                <span>Create Course</span>
              </Link>
              <Link to="/analytics" className="quick-action">
                <BarChart3 className="action-icon" />
                <span>View Analytics</span>
              </Link>
              <Link to="/students" className="quick-action">
                <Users className="action-icon" />
                <span>Manage Students</span>
              </Link>
              <Link to="/profile" className="quick-action">
                <Settings className="action-icon" />
                <span>Profile Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
