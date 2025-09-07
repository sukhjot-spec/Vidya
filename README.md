# OPENLEARN.ORG.IN GENESOC TI - Education Platform

A complete full-stack education platform with React.js frontend and Node.js/Express backend, featuring real authentication, course management, payments, and AI-powered recommendations.

## 🚀 Features

### Core Features
- **Complete Authentication System** - JWT-based auth with registration, login, and profile management
- **Role-Based Access Control** - Separate dashboards and permissions for students, teachers, and admins
- **Course Management** - Full CRUD operations for courses with lessons, materials, and progress tracking
- **Enrollment System** - Course enrollment with payment processing and progress tracking
- **Payment Integration** - Stripe integration for secure payment processing
- **AI-Powered Recommendations** - Personalized course recommendations based on user behavior
- **Real-time Progress Tracking** - Lesson completion tracking and certificate generation
- **Review & Rating System** - Course reviews and instructor ratings

### Technical Features
- **Frontend**: React.js with modern hooks, context API, and responsive design
- **Backend**: Node.js/Express with MongoDB database
- **Authentication**: JWT tokens with secure middleware
- **Payment Processing**: Stripe integration with webhooks
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, rate limiting, input validation
- **API Documentation**: RESTful API with comprehensive endpoints

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn
- Stripe account (for payments)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/openlearn
   
   # JWT Secret (generate a strong secret)
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Stripe Configuration (get from Stripe Dashboard)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud database
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```
   
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to root directory**
   ```bash
   cd ..
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Create .env file in root directory
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

4. **Start the frontend server**
   ```bash
   npm start
   ```
   
   Frontend will run on `http://localhost:3000`

## 📱 Demo Credentials

### Student Account
- **Email:** `student@demo.com`
- **Password:** `password123`

### Teacher Account
- **Email:** `teacher@demo.com`
- **Password:** `password123`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.js       # Navigation component
│   ├── Footer.js       # Footer component
│   └── LoadingSpinner.js # Loading indicator
├── contexts/           # React contexts
│   └── AuthContext.js  # Authentication context
├── pages/              # Page components
│   ├── Home.js         # Landing page
│   ├── Login.js        # Login page
│   ├── Signup.js       # Registration page
│   ├── StudentDashboard.js # Student dashboard
│   ├── TeacherDashboard.js # Teacher dashboard
│   ├── CourseCatalog.js    # Course listing
│   ├── CourseDetail.js     # Course details
│   ├── CreateCourse.js     # Course creation
│   ├── Profile.js          # User profile
│   ├── Recommendations.js  # AI recommendations
│   └── Payment.js          # Payment processing
├── utils/              # Utility functions
│   └── api.js          # Mock API functions
├── App.js              # Main app component
└── index.js            # App entry point
```

## 🎨 Design System

### Color Palette
- **Primary:** #2563eb (Blue)
- **Secondary:** #64748b (Slate)
- **Accent:** #f59e0b (Amber)
- **Success:** #10b981 (Emerald)
- **Warning:** #f59e0b (Amber)
- **Error:** #ef4444 (Red)

### Typography
- **Font Family:** System fonts (San Francisco, Segoe UI, etc.)
- **Scale:** 0.75rem to 1.875rem
- **Weights:** 400, 500, 600, 700, 800

### Spacing
- **Base Unit:** 0.25rem (4px)
- **Scale:** 1, 2, 3, 4, 5, 6, 8, 10, 12

## 🔧 API Endpoints (Mock)

### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - User registration
- `POST /api/logout` - User logout

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create new course
- `POST /api/courses/:id/enroll` - Enroll in course

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations

### Payments
- `POST /api/payments` - Process payment

### User Profile
- `PUT /api/profile` - Update user profile
- `GET /api/dashboard-stats` - Get dashboard statistics

## 📱 Responsive Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## ♿ Accessibility Features

- **Semantic HTML** - Proper heading hierarchy and landmarks
- **ARIA Labels** - Screen reader support
- **Keyboard Navigation** - Full keyboard accessibility
- **Focus Management** - Visible focus indicators
- **Color Contrast** - WCAG AA compliant
- **Reduced Motion** - Respects user preferences

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Build the project
2. Upload the `build` folder to Netlify
3. Configure redirects for SPA routing

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Course browsing and enrollment
- [ ] Course creation (teacher)
- [ ] Dashboard functionality
- [ ] Profile management
- [ ] Payment flow
- [ ] Recommendations
- [ ] Mobile responsiveness
- [ ] Accessibility features

## 🔮 Future Enhancements

### Phase 2 Features
- **Real Backend Integration** - Replace mock APIs with actual backend
- **Video Streaming** - Integrate video player for course content
- **Live Chat** - Real-time communication between students and teachers
- **Advanced Analytics** - Detailed learning analytics and progress tracking
- **Mobile App** - React Native mobile application
- **Social Features** - Discussion forums and peer learning
- **Certification System** - Blockchain-based certificates
- **Multi-language Support** - Internationalization

### Technical Improvements
- **State Management** - Redux or Zustand for complex state
- **Testing** - Unit and integration tests
- **Performance** - Code splitting and lazy loading
- **SEO** - Server-side rendering with Next.js
- **PWA** - Progressive Web App features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Built for **GENESOC TI** hackathon by the development team.

## 📞 Support

For support and questions:
- **Email:** contact@Vidya.org.in
- **Phone:** +91 98765 43210
- **Website:** https://Vidya.org.in

---

**Built with ❤️ for education and learning**
