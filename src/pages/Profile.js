import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Star,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
    website: user?.website || '',
    linkedin: user?.linkedin || '',
    twitter: user?.twitter || '',
    skills: user?.skills || [],
    experience: user?.experience || '',
    education: user?.education || ''
  });
  const [newSkill, setNewSkill] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.updateProfile(formData);
      if (response.success) {
        updateUser({ ...user, ...response.data });
        setEditing(false);
        console.log('Profile updated successfully');
      } else {
        console.error('Profile update failed:', response.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      phone: user?.phone || '',
      website: user?.website || '',
      linkedin: user?.linkedin || '',
      twitter: user?.twitter || '',
      skills: user?.skills || [],
      experience: user?.experience || '',
      education: user?.education || ''
    });
    setEditing(false);
  };

  const verificationStatus = {
    email: { verified: true, icon: <CheckCircle className="verified-icon" /> },
    phone: { verified: false, icon: <AlertCircle className="unverified-icon" /> },
    identity: { verified: user?.userType === 'teacher', icon: user?.userType === 'teacher' ? <CheckCircle className="verified-icon" /> : <AlertCircle className="unverified-icon" /> }
  };

  return (
    <div className="profile">
      <div className="container">
        {/* Header */}
        <div className="profile-header">
          <div className="header-content">
            <h1 className="profile-title">Profile Settings</h1>
            <p className="profile-subtitle">
              Manage your personal information and account settings
            </p>
          </div>
          <div className="header-actions">
            {editing ? (
              <div className="edit-actions">
                <button
                  onClick={handleCancel}
                  className="btn btn-outline"
                  disabled={loading}
                >
                  <X className="btn-icon" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner size="small" message="" />
                  ) : (
                    <>
                      <Save className="btn-icon" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="btn btn-primary"
              >
                <Edit className="btn-icon" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-layout">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="avatar-container">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="profile-avatar"
                />
                {editing && (
                  <button className="avatar-edit">
                    <Camera className="camera-icon" />
                  </button>
                )}
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{user?.name}</h2>
                <p className="profile-role">{user?.userType}</p>
                <div className="profile-stats">
                  {user?.userType === 'student' ? (
                    <>
                      <div className="stat">
                        <BookOpen className="stat-icon" />
                        <span>{user?.enrolledCourses?.length || 0} Courses</span>
                      </div>
                      <div className="stat">
                        <Award className="stat-icon" />
                        <span>1 Certificate</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="stat">
                        <BookOpen className="stat-icon" />
                        <span>5 Courses</span>
                      </div>
                      <div className="stat">
                        <Users className="stat-icon" />
                        <span>{user?.totalStudents || 0} Students</span>
                      </div>
                      <div className="stat">
                        <Star className="stat-icon" />
                        <span>{user?.rating || 0} Rating</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="verification-section">
              <h3 className="verification-title">
                <Shield className="verification-icon" />
                Account Verification
              </h3>
              <div className="verification-list">
                <div className="verification-item">
                  <div className="verification-info">
                    <Mail className="verification-type-icon" />
                    <span>Email Address</span>
                  </div>
                  {verificationStatus.email.icon}
                </div>
                <div className="verification-item">
                  <div className="verification-info">
                    <Phone className="verification-type-icon" />
                    <span>Phone Number</span>
                  </div>
                  {verificationStatus.phone.icon}
                </div>
                <div className="verification-item">
                  <div className="verification-info">
                    <User className="verification-type-icon" />
                    <span>Identity Verification</span>
                  </div>
                  {verificationStatus.identity.icon}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="profile-form">
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      <User className="label-icon" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      disabled={!editing}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      <Mail className="label-icon" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      disabled={!editing}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio" className="form-label">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="form-textarea"
                    disabled={!editing}
                    placeholder="Tell us about yourself..."
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location" className="form-label">
                      <MapPin className="label-icon" />
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="form-input"
                      disabled={!editing}
                      placeholder="City, Country"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      <Phone className="label-icon" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      disabled={!editing}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="form-section">
                <h3 className="section-title">Skills & Expertise</h3>
                
                <div className="skills-container">
                  <div className="skills-list">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="skill-tag">
                        <span>{skill}</span>
                        {editing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="skill-remove"
                          >
                            <X className="remove-icon" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {editing && (
                    <div className="add-skill">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="form-input"
                        placeholder="Add a skill"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="btn btn-outline btn-small"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              {user?.userType === 'teacher' && (
                <div className="form-section">
                  <h3 className="section-title">Professional Information</h3>
                  
                  <div className="form-group">
                    <label htmlFor="experience" className="form-label">Experience</label>
                    <textarea
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="form-textarea"
                      disabled={!editing}
                      placeholder="Describe your professional experience..."
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="education" className="form-label">Education</label>
                    <textarea
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="form-textarea"
                      disabled={!editing}
                      placeholder="Your educational background..."
                      rows="3"
                    />
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="form-section">
                <h3 className="section-title">Social Links</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="website" className="form-label">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="form-input"
                      disabled={!editing}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="linkedin" className="form-label">LinkedIn</label>
                    <input
                      type="url"
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      className="form-input"
                      disabled={!editing}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="twitter" className="form-label">Twitter</label>
                  <input
                    type="url"
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    className="form-input"
                    disabled={!editing}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
