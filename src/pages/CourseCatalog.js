import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { 
  Search, 
  Star, 
  Clock, 
  Users, 
  BookOpen,
  Play
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './CourseCatalog.css';

const CourseCatalog = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    'All Categories',
    'Web Development',
    'Data Science',
    'Programming',
    'Design',
    'Business',
    'Marketing'
  ];

  const levels = [
    'All Levels',
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' }
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchTerm, selectedCategory, selectedLevel, sortBy]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await api.getCourses();
      if (response.success && Array.isArray(response.data)) {
        setCourses(response.data);
      } else {
        // Set default courses if API fails or returns non-array
        setCourses([
          {
            id: 1,
            title: 'Introduction to React Development',
            description: 'Learn the fundamentals of React.js and build modern web applications.',
            instructor: { name: 'John Doe' },
            category: 'Web Development',
            level: 'Beginner',
            price: 49.99,
            rating: 4.8,
            studentsCount: 1250,
            duration: '8 hours',
            thumbnail: 'https://via.placeholder.com/300x200'
          },
          {
            id: 2,
            title: 'Advanced JavaScript Concepts',
            description: 'Master advanced JavaScript concepts and patterns.',
            instructor: { name: 'Jane Smith' },
            category: 'Programming',
            level: 'Advanced',
            price: 79.99,
            rating: 4.9,
            studentsCount: 890,
            duration: '12 hours',
            thumbnail: 'https://via.placeholder.com/300x200'
          },
          {
            id: 3,
            title: 'Data Science with Python',
            description: 'Learn data analysis and machine learning with Python.',
            instructor: { name: 'Mike Johnson' },
            category: 'Data Science',
            level: 'Intermediate',
            price: 99.99,
            rating: 4.7,
            studentsCount: 2100,
            duration: '15 hours',
            thumbnail: 'https://via.placeholder.com/300x200'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      // Set default courses on error
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCourses = () => {
    if (!Array.isArray(courses)) {
      setFilteredCourses([]);
      return;
    }
    let filtered = [...courses];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        course.instructor.name.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(course =>
        course.category === selectedCategory
      );
    }

    // Filter by level
    if (selectedLevel && selectedLevel !== 'All Levels') {
      filtered = filtered.filter(course =>
        course.level === selectedLevel
      );
    }

    // Sort courses
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => b.studentsCount - a.studentsCount);
        break;
    }

    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    try {
      const response = await api.enrollInCourse(courseId, user.id);
      if (response.success) {
        // Update the course in the list
        setCourses(prev => prev.map(course =>
          course.id === courseId ? { ...course, enrolled: true } : course
        ));
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading courses..." />;
  }

  return (
    <div className="course-catalog">
      <div className="container">
        {/* Header */}
        <div className="catalog-header">
          <div className="header-content">
            <h1 className="catalog-title">Course Catalog</h1>
            <p className="catalog-subtitle">
              Discover thousands of courses to advance your skills and career
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="catalog-filters">
          <div className="search-section">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-group">
              <label htmlFor="category-filter" className="filter-label">
                Category
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="level-filter" className="filter-label">
                Level
              </label>
              <select
                id="level-filter"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="filter-select"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-filter" className="filter-label">
                Sort By
              </label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <p className="results-count">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Courses Grid */}
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-thumbnail">
                <img src={course.thumbnail} alt={course.title} />
                <div className="course-overlay">
                  {course.enrolled ? (
                    <Link to={`/courses/${course.id}`} className="continue-button">
                      <Play className="continue-icon" />
                      Continue
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="enroll-button"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
                <div className="course-badge">
                  {course.level}
                </div>
              </div>

              <div className="course-content">
                <div className="course-header">
                  <h3 className="course-title">
                    <Link to={`/courses/${course.id}`}>
                      {course.title}
                    </Link>
                  </h3>
                  <p className="course-instructor">
                    by {course.instructor.name}
                  </p>
                </div>

                <p className="course-description">
                  {course.description}
                </p>

                <div className="course-meta">
                  <div className="course-rating">
                    <Star className="rating-icon" />
                    <span className="rating-value">{course.rating}</span>
                    <span className="rating-count">({course.studentsCount})</span>
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

                <div className="course-footer">
                  <div className="course-price">
                    ${course.price}
                  </div>
                  <div className="course-category">
                    {course.category}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="empty-state">
            <BookOpen className="empty-icon" />
            <h3>No courses found</h3>
            <p>Try adjusting your search criteria or browse all courses</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedLevel('');
                setSortBy('popular');
              }}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;
