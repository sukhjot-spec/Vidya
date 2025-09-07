import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import CreateCourse from './pages/CreateCourse';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import Payment from './pages/Payment';

// Protected Route Component
const ProtectedRoute = ({ children, userType }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (userType && user.userType !== userType) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Main App Component
function AppContent() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" replace />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          
          {/* Protected Routes */}
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute userType="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher-dashboard" 
            element={
              <ProtectedRoute userType="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-course" 
            element={
              <ProtectedRoute userType="teacher">
                <CreateCourse />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment" 
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
