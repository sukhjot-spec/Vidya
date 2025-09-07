const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User');
require('dotenv').config();

const sampleCourses = [
  {
    title: "Complete Web Development Bootcamp",
    description: "Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and become a full-stack developer.",
    category: "Web Development",
    level: "Beginner",
    price: 89.99,
    duration: 40,
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
    whatYouWillLearn: [
      "Build responsive websites with HTML and CSS",
      "Master JavaScript fundamentals and ES6+",
      "Create dynamic web apps with React",
      "Build backend APIs with Node.js and Express",
      "Work with MongoDB databases"
    ],
    lessons: [
      { title: "HTML Fundamentals", description: "Learn the basics of HTML structure", duration: 45, order: 1 },
      { title: "CSS Styling", description: "Master CSS for beautiful designs", duration: 60, order: 2 },
      { title: "JavaScript Basics", description: "Programming fundamentals with JavaScript", duration: 90, order: 3 },
      { title: "React Introduction", description: "Build your first React component", duration: 75, order: 4 },
      { title: "Node.js Backend", description: "Server-side development with Node.js", duration: 80, order: 5 }
    ],
    tags: ["html", "css", "javascript", "react", "nodejs"],
    status: "published",
    isPublished: true,
    publishedAt: new Date(),
    rating: { average: 4.8, count: 156 },
    studentsCount: 1247,
    featured: true
  },
  {
    title: "Data Science with Python",
    description: "Master data analysis, visualization, and machine learning with Python. Work with pandas, numpy, matplotlib, and scikit-learn.",
    category: "Data Science",
    level: "Intermediate",
    price: 129.99,
    duration: 35,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    whatYouWillLearn: [
      "Analyze data with pandas and numpy",
      "Create visualizations with matplotlib and seaborn",
      "Build machine learning models",
      "Work with real datasets",
      "Deploy ML models to production"
    ],
    lessons: [
      { title: "Python for Data Science", description: "Python fundamentals for data analysis", duration: 60, order: 1 },
      { title: "Pandas Data Manipulation", description: "Master data manipulation with pandas", duration: 75, order: 2 },
      { title: "Data Visualization", description: "Create stunning charts and graphs", duration: 50, order: 3 },
      { title: "Machine Learning Basics", description: "Introduction to ML algorithms", duration: 90, order: 4 },
      { title: "Model Deployment", description: "Deploy your models to the cloud", duration: 65, order: 5 }
    ],
    tags: ["python", "data-science", "machine-learning", "pandas", "numpy"],
    status: "published",
    isPublished: true,
    publishedAt: new Date(),
    rating: { average: 4.6, count: 89 },
    studentsCount: 567,
    featured: true
  },
  {
    title: "React Native Mobile Development",
    description: "Build cross-platform mobile apps with React Native. Learn navigation, state management, and native features.",
    category: "Mobile Development",
    level: "Intermediate",
    price: 99.99,
    duration: 28,
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=225&fit=crop",
    whatYouWillLearn: [
      "Build iOS and Android apps with React Native",
      "Implement navigation and routing",
      "Manage app state with Redux",
      "Access device features like camera and GPS",
      "Publish apps to app stores"
    ],
    lessons: [
      { title: "React Native Setup", description: "Environment setup and first app", duration: 40, order: 1 },
      { title: "Components and Styling", description: "Building beautiful mobile UIs", duration: 55, order: 2 },
      { title: "Navigation", description: "Screen navigation and routing", duration: 45, order: 3 },
      { title: "State Management", description: "Managing app state with Redux", duration: 70, order: 4 },
      { title: "Native Features", description: "Camera, GPS, and device APIs", duration: 60, order: 5 }
    ],
    tags: ["react-native", "mobile", "ios", "android", "redux"],
    status: "published",
    isPublished: true,
    publishedAt: new Date(),
    rating: { average: 4.7, count: 134 },
    studentsCount: 892,
    bestseller: true
  },
  {
    title: "UI/UX Design Fundamentals",
    description: "Learn design principles, user research, wireframing, and prototyping. Master Figma and create stunning user interfaces.",
    category: "Design",
    level: "Beginner",
    price: 79.99,
    duration: 25,
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop",
    whatYouWillLearn: [
      "Understand design principles and theory",
      "Conduct user research and testing",
      "Create wireframes and prototypes",
      "Master Figma design tool",
      "Build a professional design portfolio"
    ],
    lessons: [
      { title: "Design Principles", description: "Color, typography, and layout fundamentals", duration: 50, order: 1 },
      { title: "User Research", description: "Understanding your users", duration: 45, order: 2 },
      { title: "Wireframing", description: "Creating effective wireframes", duration: 40, order: 3 },
      { title: "Figma Mastery", description: "Advanced Figma techniques", duration: 65, order: 4 },
      { title: "Portfolio Building", description: "Showcase your design work", duration: 35, order: 5 }
    ],
    tags: ["ui", "ux", "design", "figma", "wireframing"],
    status: "published",
    isPublished: true,
    publishedAt: new Date(),
    rating: { average: 4.5, count: 78 },
    studentsCount: 445
  },
  {
    title: "Digital Marketing Mastery",
    description: "Complete digital marketing course covering SEO, social media, email marketing, and paid advertising strategies.",
    category: "Marketing",
    level: "Beginner",
    price: 69.99,
    duration: 30,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    whatYouWillLearn: [
      "Master SEO and content marketing",
      "Run effective social media campaigns",
      "Create email marketing funnels",
      "Manage Google Ads and Facebook Ads",
      "Analyze marketing performance"
    ],
    lessons: [
      { title: "SEO Fundamentals", description: "Search engine optimization basics", duration: 55, order: 1 },
      { title: "Social Media Marketing", description: "Facebook, Instagram, and LinkedIn strategies", duration: 60, order: 2 },
      { title: "Email Marketing", description: "Building and nurturing email lists", duration: 45, order: 3 },
      { title: "Paid Advertising", description: "Google Ads and Facebook Ads", duration: 70, order: 4 },
      { title: "Analytics", description: "Measuring and optimizing campaigns", duration: 50, order: 5 }
    ],
    tags: ["marketing", "seo", "social-media", "email", "advertising"],
    status: "published",
    isPublished: true,
    publishedAt: new Date(),
    rating: { average: 4.4, count: 92 },
    studentsCount: 623
  }
];

async function seedCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/openlearn');
    console.log('Connected to MongoDB');

    // Find a teacher user to assign as instructor, or create one
    let teacher = await User.findOne({ userType: 'teacher' });
    
    if (!teacher) {
      // Create a sample teacher if none exists
      teacher = new User({
        name: 'Dr. Sarah Johnson',
        email: 'teacher@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        userType: 'teacher',
        isVerified: true,
        profile: {
          bio: 'Experienced educator with 10+ years in technology and design',
          expertise: ['Web Development', 'Data Science', 'UI/UX Design'],
          experience: 'Senior Software Engineer at Tech Corp, Former Design Lead at StartupXYZ'
        }
      });
      await teacher.save();
      console.log('Created sample teacher user');
    }

    // Clear existing courses (optional - remove this line if you want to keep existing courses)
    await Course.deleteMany({});
    console.log('Cleared existing courses');

    // Add instructor ID to each course
    const coursesWithInstructor = sampleCourses.map(course => ({
      ...course,
      instructor: teacher._id
    }));

    // Insert sample courses
    const insertedCourses = await Course.insertMany(coursesWithInstructor);
    console.log(`Successfully inserted ${insertedCourses.length} sample courses`);

    // Display course titles
    insertedCourses.forEach(course => {
      console.log(`- ${course.title} (${course.category})`);
    });

    console.log('\nDatabase seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedCourses();
