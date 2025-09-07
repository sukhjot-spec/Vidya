import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <BookOpen className="footer-logo" aria-hidden="true" />
              <span className="footer-title">Vidya</span>
            </div>
            <p className="footer-description">
              Empowering education through technology. Learn, teach, and grow with our comprehensive online learning platform.
            </p>
            <div className="footer-contact">
              <div className="contact-item">
                <Mail className="contact-icon" aria-hidden="true" />
                <span>contact@Vidya.org.in</span>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" aria-hidden="true" />
                <span>+91 98765 43210</span>
              </div>
              <div className="contact-item">
                <MapPin className="contact-icon" aria-hidden="true" />
                <span>GENESOC TI, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/courses" className="footer-link">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="footer-link">
                  Recommendations
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-link">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Students */}
          <div className="footer-section">
            <h3 className="footer-heading">For Students</h3>
            <ul className="footer-links">
              <li>
                <Link to="/student-dashboard" className="footer-link">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="footer-link">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/certificates" className="footer-link">
                  Certificates
                </Link>
              </li>
              <li>
                <Link to="/help" className="footer-link">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* For Teachers */}
          <div className="footer-section">
            <h3 className="footer-heading">For Teachers</h3>
            <ul className="footer-links">
              <li>
                <Link to="/teacher-dashboard" className="footer-link">
                  Teacher Dashboard
                </Link>
              </li>
              <li>
                <Link to="/create-course" className="footer-link">
                  Create Course
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="footer-link">
                  Analytics
                </Link>
              </li>
              <li>
                <Link to="/teacher-resources" className="footer-link">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © 2024 Vidya.ORG.IN GENESOC TI. All rights reserved.
            </p>
            <div className="footer-legal">
              <Link to="/privacy" className="footer-legal-link">
                Privacy Policy
              </Link>
              <Link to="/terms" className="footer-legal-link">
                Terms of Service
              </Link>
              <Link to="/cookies" className="footer-legal-link">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
