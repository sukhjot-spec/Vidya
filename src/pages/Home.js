import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Users, 
  Award, 
  Star, 
  ArrowRight, 
  Play,
  CheckCircle
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <BookOpen className="feature-icon" />,
      title: 'Comprehensive Courses',
      description: 'Access thousands of courses across various subjects and skill levels.'
    },
    {
      icon: <Users className="feature-icon" />,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and certified educators.'
    },
    {
      icon: <Award className="feature-icon" />,
      title: 'Certificates',
      description: 'Earn recognized certificates upon course completion.'
    },
    {
      icon: <Star className="feature-icon" />,
      title: 'Personalized Learning',
      description: 'AI-powered recommendations tailored to your learning goals.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Students' },
    { number: '500+', label: 'Expert Teachers' },
    { number: '1,000+', label: 'Courses Available' },
    { number: '95%', label: 'Success Rate' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Developer',
      content: 'Vidya helped me transition from marketing to tech. The courses are well-structured and the instructors are amazing!',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=2563eb&color=fff'
    },
    {
      name: 'Michael Chen',
      role: 'Data Scientist',
      content: 'The data science track was exactly what I needed. I landed my dream job within 3 months of completing the course.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=2563eb&color=fff'
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      content: 'As a teacher on Vidya, I love how easy it is to create engaging content and connect with students worldwide.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=2563eb&color=fff'
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Learn Without Limits with{' '}
                <span className="hero-highlight">Vidya</span>
              </h1>
              <p className="hero-description">
                Join thousands of learners and educators in our comprehensive online learning platform. 
                Whether you're a student looking to upskill or a teacher wanting to share knowledge, 
                Vidya provides the tools and community you need to succeed.
              </p>
              <div className="hero-actions">
                {user ? (
                  <Link
                    to={user.userType === 'student' ? '/student-dashboard' : '/teacher-dashboard'}
                    className="btn btn-primary btn-large"
                  >
                    Go to Dashboard
                    <ArrowRight className="btn-icon" aria-hidden="true" />
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="btn btn-primary btn-large">
                      Get Started Free
                      <ArrowRight className="btn-icon" aria-hidden="true" />
                    </Link>
                    <Link to="/courses" className="btn btn-outline btn-large">
                      Browse Courses
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-card">
                <div className="hero-card-header">
                  <div className="hero-card-avatar">
                    <img
                      src="https://ui-avatars.com/api/?name=Student&background=2563eb&color=fff"
                      alt="Student learning"
                    />
                  </div>
                  <div className="hero-card-info">
                    <h3>Alex Student</h3>
                    <p>Learning React Development</p>
                  </div>
                </div>
                <div className="hero-card-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '75%' }}></div>
                  </div>
                  <span className="progress-text">75% Complete</span>
                </div>
                <div className="hero-card-lessons">
                  <div className="lesson-item">
                    <CheckCircle className="lesson-icon completed" />
                    <span>Introduction to React</span>
                  </div>
                  <div className="lesson-item">
                    <CheckCircle className="lesson-icon completed" />
                    <span>Components & Props</span>
                  </div>
                  <div className="lesson-item">
                    <Play className="lesson-icon current" />
                    <span>State Management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Vidya?</h2>
            <p className="section-description">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-container">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Community Says</h2>
            <p className="section-description">
              Join thousands of satisfied learners and educators
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="star-icon filled" />
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <p className="testimonial-role">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2 className="cta-title">Ready to Start Learning?</h2>
              <p className="cta-description">
                Join Vidya today and unlock your potential with our comprehensive learning platform.
              </p>
            </div>
            <div className="cta-actions">
              {!user && (
                <>
                  <Link to="/signup" className="btn btn-primary btn-large">
                    Sign Up Free
                  </Link>
                  <Link to="/courses" className="btn btn-outline btn-large">
                    Explore Courses
                  </Link>
                </>
              )}
              {user && (
                <Link
                  to={user.userType === 'student' ? '/student-dashboard' : '/teacher-dashboard'}
                  className="btn btn-primary btn-large"
                >
                  Continue Learning
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
