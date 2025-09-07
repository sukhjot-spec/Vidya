import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  Eye,
  ArrowLeft,
  BookOpen,
  Video,
  FileText
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './CreateCourse.css';

const CreateCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    price: '',
    duration: '',
    thumbnail: '',
    objectives: [''],
    curriculum: [
      {
        id: 1,
        title: '',
        type: 'video',
        duration: '',
        description: ''
      }
    ]
  });

  const categories = [
    'Web Development',
    'Data Science',
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Photography',
    'Music',
    'Writing',
    'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const lessonTypes = [
    { value: 'video', label: 'Video Lesson', icon: <Video className="lesson-type-icon" /> },
    { value: 'text', label: 'Text Lesson', icon: <FileText className="lesson-type-icon" /> },
    { value: 'quiz', label: 'Quiz', icon: <BookOpen className="lesson-type-icon" /> },
    { value: 'assignment', label: 'Assignment', icon: <FileText className="lesson-type-icon" /> }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleObjectiveChange = (index, value) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({
      ...prev,
      objectives: newObjectives
    }));
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const removeObjective = (index) => {
    if (formData.objectives.length > 1) {
      const newObjectives = formData.objectives.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        objectives: newObjectives
      }));
    }
  };

  const handleCurriculumChange = (index, field, value) => {
    const newCurriculum = [...formData.curriculum];
    newCurriculum[index] = {
      ...newCurriculum[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      curriculum: newCurriculum
    }));
  };

  const addLesson = () => {
    const newLesson = {
      id: Date.now(),
      title: '',
      type: 'video',
      duration: '',
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      curriculum: [...prev.curriculum, newLesson]
    }));
  };

  const removeLesson = (index) => {
    if (formData.curriculum.length > 1) {
      const newCurriculum = formData.curriculum.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        curriculum: newCurriculum
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty objectives
      const filteredObjectives = formData.objectives.filter(obj => obj.trim() !== '');
      
      // Filter out empty lessons
      const filteredCurriculum = formData.curriculum.filter(lesson => 
        lesson.title.trim() !== '' && lesson.duration.trim() !== ''
      );

      const courseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        price: parseFloat(formData.price) || 0,
        thumbnail: formData.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop',
        whatYouWillLearn: filteredObjectives,
        lessons: filteredCurriculum.map((lesson, index) => ({
          title: lesson.title,
          description: lesson.description || lesson.title,
          duration: parseFloat(lesson.duration.toString().split(' ')[0]) || 15, // Extract minutes from duration string
          order: index + 1,
          videoUrl: '',
          materials: []
        })),
        language: 'English',
        tags: [formData.category.toLowerCase(), formData.level.toLowerCase()]
      };

      console.log('Submitting course data:', courseData);
      const response = await api.createCourse(courseData);
      console.log('Course creation response:', response);
      
      if (response.success) {
        alert('Course published successfully!');
        navigate('/teacher-dashboard');
      } else {
        alert('Failed to create course: ' + (response.message || 'Unknown error'));
        console.error('Failed to create course:', response);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course: ' + (error.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // Save as draft functionality
    console.log('Saving draft...', formData);
  };

  const handlePreview = () => {
    // Preview functionality
    console.log('Previewing course...', formData);
  };

  return (
    <div className="create-course">
      <div className="container">
        {/* Header */}
        <div className="create-header">
          <div className="header-content">
            <button
              onClick={() => navigate('/teacher-dashboard')}
              className="back-button"
            >
              <ArrowLeft className="back-icon" />
              Back to Dashboard
            </button>
            <h1 className="create-title">Create New Course</h1>
            <p className="create-subtitle">
              Share your knowledge and help students learn new skills
            </p>
          </div>
          <div className="header-actions">
            <button
              onClick={handleSaveDraft}
              className="btn btn-outline"
              disabled={loading}
            >
              <Save className="btn-icon" />
              Save Draft
            </button>
            <button
              onClick={handlePreview}
              className="btn btn-outline"
              disabled={loading}
            >
              <Eye className="btn-icon" />
              Preview
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-layout">
            {/* Main Form */}
            <div className="form-main">
              {/* Basic Information */}
              <div className="form-section">
                <h2 className="section-title">Basic Information</h2>
                
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter a compelling course title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Course Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Describe what students will learn in this course"
                    rows="4"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category" className="form-label">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="level" className="form-label">
                      Difficulty Level *
                    </label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      {levels.map(level => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price" className="form-label">
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="duration" className="form-label">
                      Estimated Duration *
                    </label>
                    <input
                      type="text"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g., 4 weeks, 8 hours"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="form-section">
                <h2 className="section-title">Learning Objectives</h2>
                <p className="section-description">
                  What will students be able to do after completing this course?
                </p>
                
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="objective-item">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => handleObjectiveChange(index, e.target.value)}
                      className="form-input"
                      placeholder="Enter a learning objective"
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeObjective(index)}
                        className="remove-button"
                        title="Remove objective"
                      >
                        <Trash2 className="remove-icon" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addObjective}
                  className="add-button"
                >
                  <Plus className="add-icon" />
                  Add Objective
                </button>
              </div>

              {/* Course Curriculum */}
              <div className="form-section">
                <h2 className="section-title">Course Curriculum</h2>
                <p className="section-description">
                  Structure your course content with lessons and activities
                </p>
                
                <div className="curriculum-list">
                  {formData.curriculum.map((lesson, index) => (
                    <div key={lesson.id} className="curriculum-item">
                      <div className="lesson-header">
                        <div className="lesson-number">{index + 1}</div>
                        <div className="lesson-controls">
                          <button
                            type="button"
                            onClick={() => removeLesson(index)}
                            className="remove-button"
                            title="Remove lesson"
                            disabled={formData.curriculum.length === 1}
                          >
                            <Trash2 className="remove-icon" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="lesson-content">
                        <div className="form-group">
                          <label className="form-label">Lesson Title *</label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => handleCurriculumChange(index, 'title', e.target.value)}
                            className="form-input"
                            placeholder="Enter lesson title"
                          />
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Type</label>
                            <select
                              value={lesson.type}
                              onChange={(e) => handleCurriculumChange(index, 'type', e.target.value)}
                              className="form-select"
                            >
                              {lessonTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">Duration *</label>
                            <input
                              type="text"
                              value={lesson.duration}
                              onChange={(e) => handleCurriculumChange(index, 'duration', e.target.value)}
                              className="form-input"
                              placeholder="e.g., 15 min"
                            />
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea
                            value={lesson.description}
                            onChange={(e) => handleCurriculumChange(index, 'description', e.target.value)}
                            className="form-textarea"
                            placeholder="Brief description of this lesson"
                            rows="2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={addLesson}
                  className="add-button"
                >
                  <Plus className="add-icon" />
                  Add Lesson
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="form-sidebar">
              {/* Course Thumbnail */}
              <div className="sidebar-section">
                <h3 className="sidebar-title">Course Thumbnail</h3>
                <div className="thumbnail-upload">
                  <div className="upload-area">
                    <Upload className="upload-icon" />
                    <p className="upload-text">Upload thumbnail image</p>
                    <p className="upload-hint">Recommended: 1280x720px</p>
                  </div>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    name="thumbnail"
                    className="form-input"
                    placeholder="Or enter image URL"
                  />
                </div>
              </div>

              {/* Course Settings */}
              <div className="sidebar-section">
                <h3 className="sidebar-title">Course Settings</h3>
                <div className="settings-list">
                  <label className="setting-item">
                    <input type="checkbox" className="setting-checkbox" defaultChecked />
                    <span className="setting-label">Allow student reviews</span>
                  </label>
                  <label className="setting-item">
                    <input type="checkbox" className="setting-checkbox" defaultChecked />
                    <span className="setting-label">Enable Q&A section</span>
                  </label>
                  <label className="setting-item">
                    <input type="checkbox" className="setting-checkbox" />
                    <span className="setting-label">Require completion certificate</span>
                  </label>
                </div>
              </div>

              {/* Publish Actions */}
              <div className="sidebar-section">
                <h3 className="sidebar-title">Publish Course</h3>
                <div className="publish-actions">
                  <button
                    type="submit"
                    className="btn btn-primary btn-large"
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingSpinner size="small" message="" />
                    ) : (
                      'Publish Course'
                    )}
                  </button>
                  <p className="publish-note">
                    Your course will be reviewed before going live
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
