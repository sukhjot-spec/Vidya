import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Star,
  Clock,
  Users,
  DollarSign,
  FileText
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './Payment.css';

const Payment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Get course data from location state or use mock data
  const course = location.state?.course || {
    id: '1',
    title: 'Introduction to React Development',
    price: 99,
    instructor: { name: 'Dr. Sarah Johnson' },
    duration: '8 weeks',
    lessons: 24,
    studentsCount: 1250,
    rating: 4.7
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted
    }));
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData(prev => ({
      ...prev,
      expiryDate: formatted
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPaymentStatus(null);

    try {
      const paymentData = {
        courseId: course.id,
        amount: course.price,
        paymentMethod,
        ...formData
      };

      const response = await api.processPayment(paymentData);
      
      if (response.success) {
        setPaymentStatus('success');
        // Redirect to course or dashboard after successful payment
        setTimeout(() => {
          navigate(`/courses/${course.id}`);
        }, 3000);
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const securityFeatures = [
    {
      icon: <Shield className="feature-icon" />,
      title: 'SSL Encryption',
      description: 'Your payment information is encrypted and secure'
    },
    {
      icon: <Lock className="feature-icon" />,
      title: 'PCI Compliant',
      description: 'We meet the highest security standards for payment processing'
    },
    {
      icon: <CheckCircle className="feature-icon" />,
      title: 'Money Back Guarantee',
      description: '30-day money-back guarantee if you\'re not satisfied'
    }
  ];

  const paymentMethods = [
    { value: 'card', label: 'Credit/Debit Card', icon: <CreditCard className="payment-icon" /> },
    { value: 'paypal', label: 'PayPal', icon: <CreditCard className="payment-icon" /> },
    { value: 'bank', label: 'Bank Transfer', icon: <CreditCard className="payment-icon" /> }
  ];

  if (paymentStatus === 'success') {
    return (
      <div className="payment">
        <div className="container">
          <div className="payment-success">
            <div className="success-icon">
              <CheckCircle className="icon" />
            </div>
            <h1 className="success-title">Payment Successful!</h1>
            <p className="success-message">
              Thank you for your purchase. You now have access to "{course.title}".
            </p>
            <div className="success-details">
              <div className="detail-item">
                <span className="detail-label">Transaction ID:</span>
                <span className="detail-value">TXN_123456789</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Amount Paid:</span>
                <span className="detail-value">${course.price}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Course:</span>
                <span className="detail-value">{course.title}</span>
              </div>
            </div>
            <div className="success-actions">
              <button
                onClick={() => navigate(`/courses/${course.id}`)}
                className="btn btn-primary"
              >
                Start Learning
              </button>
              <button
                onClick={() => navigate('/student-dashboard')}
                className="btn btn-outline"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment">
      <div className="container">
        {/* Header */}
        <div className="payment-header">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
          >
            <ArrowLeft className="back-icon" />
            Back
          </button>
          <h1 className="payment-title">Complete Your Purchase</h1>
        </div>

        <div className="payment-layout">
          {/* Course Summary */}
          <div className="course-summary">
            <h2 className="summary-title">Course Summary</h2>
            <div className="course-card">
              <div className="course-header">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-instructor">by {course.instructor.name}</p>
              </div>
              
              <div className="course-details">
                <div className="course-detail">
                  <Clock className="detail-icon" />
                  <span>{course.duration}</span>
                </div>
                <div className="course-detail">
                  <FileText className="detail-icon" />
                  <span>{course.lessons} lessons</span>
                </div>
                <div className="course-detail">
                  <Users className="detail-icon" />
                  <span>{course.studentsCount} students</span>
                </div>
                <div className="course-detail">
                  <Star className="detail-icon" />
                  <span>{course.rating} rating</span>
                </div>
              </div>
              
              <div className="course-price">
                <span className="price-label">Total</span>
                <span className="price-value">${course.price}</span>
              </div>
            </div>

            {/* Security Features */}
            <div className="security-features">
              <h3 className="security-title">Secure Payment</h3>
              <div className="features-list">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="feature-item">
                    {feature.icon}
                    <div className="feature-content">
                      <h4 className="feature-title">{feature.title}</h4>
                      <p className="feature-description">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form">
            <form onSubmit={handleSubmit}>
              {/* Payment Method Selection */}
              <div className="form-section">
                <h3 className="section-title">Payment Method</h3>
                <div className="payment-methods">
                  {paymentMethods.map(method => (
                    <label key={method.value} className="payment-method">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="payment-radio"
                      />
                      <div className="payment-method-content">
                        {method.icon}
                        <span>{method.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <div className="form-section">
                  <h3 className="section-title">Card Details</h3>
                  
                  <div className="form-group">
                    <label htmlFor="cardNumber" className="form-label">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      className="form-input"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="expiryDate" className="form-label">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleExpiryChange}
                        className="form-input"
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cvv" className="form-label">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="123"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardName" className="form-label">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Billing Information */}
              <div className="form-section">
                <h3 className="section-title">Billing Information</h3>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="billingAddress" className="form-label">
                    Billing Address
                  </label>
                  <input
                    type="text"
                    id="billingAddress"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="zipCode" className="form-label">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="10001"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="country" className="form-label">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                  </select>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="form-section">
                <label className="terms-checkbox">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="checkbox"
                    required
                  />
                  <span className="checkbox-label">
                    I agree to the{' '}
                    <a href="/terms" className="terms-link">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="terms-link">Privacy Policy</a>
                  </span>
                </label>
              </div>

              {/* Payment Status */}
              {paymentStatus === 'error' && (
                <div className="error-message">
                  <AlertCircle className="error-icon" />
                  <span>Payment failed. Please try again or use a different payment method.</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={loading || !agreedToTerms}
              >
                {loading ? (
                  <LoadingSpinner size="small" message="" />
                ) : (
                  <>
                    <DollarSign className="btn-icon" />
                    Pay ${course.price}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
