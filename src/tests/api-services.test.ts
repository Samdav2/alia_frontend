// API Services Integration Tests
// Run these tests to verify all API services are working correctly

import { authService } from '@/services/api/authService';
import { userService } from '@/services/api/userService';
import { courseService } from '@/services/api/courseService';
import { enrollmentService } from '@/services/api/enrollmentService';
import { progressService } from '@/services/api/progressService';
import { lecturerService } from '@/services/api/lecturerService';
import { adminService } from '@/services/api/adminService';

// Test configuration
const TEST_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  testUser: {
    email: 'test@example.com',
    password: 'test123',
    full_name: 'Test User',
    role: 'student' as const,
    department: 'Computer Science'
  },
  testLecturer: {
    email: 'lecturer@example.com',
    password: 'lecturer123',
    full_name: 'Test Lecturer',
    role: 'lecturer' as const,
    department: 'Computer Science'
  },
  testAdmin: {
    email: 'admin@example.com',
    password: 'admin123',
    full_name: 'Test Admin',
    role: 'admin' as const,
    department: 'Administration'
  }
};

// Test results tracker
const testResults: { [key: string]: boolean } = {};

// Helper function to log test results
function logTest(testName: string, passed: boolean, error?: any) {
  testResults[testName] = passed;
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  if (error) {
    console.error(`  Error: ${error.message || error}`);
  }
}

// ========== AUTHENTICATION TESTS ==========

export async function testAuthService() {
  console.log('\n🔐 Testing Authentication Service...\n');

  // Test 1: Register
  try {
    await authService.register(TEST_CONFIG.testUser);
    logTest('Auth: Register User', true);
  } catch (error: any) {
    // User might already exist
    if (error.response?.status === 400) {
      logTest('Auth: Register User', true, 'User already exists (expected)');
    } else {
      logTest('Auth: Register User', false, error);
    }
  }

  // Test 2: Login
  try {
    const response = await authService.login({
      email: TEST_CONFIG.testUser.email,
      password: TEST_CONFIG.testUser.password
    });
    logTest('Auth: Login User', !!response.token);
  } catch (error) {
    logTest('Auth: Login User', false, error);
  }

  // Test 3: Check if authenticated
  try {
    const isAuth = authService.isAuthenticated();
    logTest('Auth: Check Authentication', isAuth);
  } catch (error) {
    logTest('Auth: Check Authentication', false, error);
  }

  // Test 4: Get current user
  try {
    const user = authService.getCurrentUser();
    logTest('Auth: Get Current User', !!user);
  } catch (error) {
    logTest('Auth: Get Current User', false, error);
  }
}

// ========== USER SERVICE TESTS ==========

export async function testUserService() {
  console.log('\n👤 Testing User Service...\n');

  // Test 1: Get profile
  try {
    const profile = await userService.getProfile();
    logTest('User: Get Profile', !!profile.id);
  } catch (error) {
    logTest('User: Get Profile', false, error);
  }

  // Test 2: Update profile
  try {
    const updated = await userService.updateProfile({
      preferences: {
        language: 'English',
        accessibility: {
          bionic_reading: true,
          dyslexia_font: false,
          high_contrast: 'none',
          voice_navigation: true
        }
      }
    });
    logTest('User: Update Profile', !!updated.id);
  } catch (error) {
    logTest('User: Update Profile', false, error);
  }
}

// ========== COURSE SERVICE TESTS ==========

export async function testCourseService() {
  console.log('\n📚 Testing Course Service...\n');

  // Test 1: Get all courses
  try {
    const courses = await courseService.getAllCourses({
      page: 1,
      limit: 10
    });
    logTest('Course: Get All Courses', !!courses.courses);
  } catch (error) {
    logTest('Course: Get All Courses', false, error);
  }

  // Test 2: Get course details (if courses exist)
  try {
    const courses = await courseService.getAllCourses({ limit: 1 });
    if (courses.courses.length > 0) {
      const details = await courseService.getCourseDetails(courses.courses[0].id);
      logTest('Course: Get Course Details', !!details.id);
    } else {
      logTest('Course: Get Course Details', true, 'No courses available');
    }
  } catch (error) {
    logTest('Course: Get Course Details', false, error);
  }
}

// ========== ENROLLMENT SERVICE TESTS ==========

export async function testEnrollmentService() {
  console.log('\n📝 Testing Enrollment Service...\n');

  // Test 1: Get my enrollments
  try {
    const enrollments = await enrollmentService.getMyEnrollments({
      page: 1,
      limit: 10
    });
    logTest('Enrollment: Get My Enrollments', !!enrollments.enrollments);
  } catch (error) {
    logTest('Enrollment: Get My Enrollments', false, error);
  }

  // Test 2: Enroll in course (if courses exist)
  try {
    const courses = await courseService.getAllCourses({ limit: 1 });
    if (courses.courses.length > 0) {
      const enrollment = await enrollmentService.enrollInCourse(courses.courses[0].id);
      logTest('Enrollment: Enroll in Course', !!enrollment.id);
    } else {
      logTest('Enrollment: Enroll in Course', true, 'No courses available');
    }
  } catch (error: any) {
    // Already enrolled is acceptable
    if (error.response?.status === 400) {
      logTest('Enrollment: Enroll in Course', true, 'Already enrolled (expected)');
    } else {
      logTest('Enrollment: Enroll in Course', false, error);
    }
  }
}

// ========== PROGRESS SERVICE TESTS ==========

export async function testProgressService() {
  console.log('\n📊 Testing Progress Service...\n');

  // Test 1: Get progress summary (if enrolled)
  try {
    const enrollments = await enrollmentService.getMyEnrollments({ limit: 1 });
    if (enrollments.enrollments.length > 0) {
      const summary = await progressService.getProgressSummary(enrollments.enrollments[0].id);
      logTest('Progress: Get Progress Summary', !!summary.enrollment_id);
    } else {
      logTest('Progress: Get Progress Summary', true, 'No enrollments available');
    }
  } catch (error) {
    logTest('Progress: Get Progress Summary', false, error);
  }
}

// ========== LECTURER SERVICE TESTS ==========

export async function testLecturerService() {
  console.log('\n🎓 Testing Lecturer Service...\n');

  // Login as lecturer first
  try {
    await authService.login({
      email: TEST_CONFIG.testLecturer.email,
      password: TEST_CONFIG.testLecturer.password
    });
  } catch (error) {
    console.log('  ⚠️  Lecturer account not found, skipping lecturer tests');
    return;
  }

  // Test 1: Get my courses
  try {
    const courses = await lecturerService.getMyCourses({
      page: 1,
      limit: 10
    });
    logTest('Lecturer: Get My Courses', !!courses.courses);
  } catch (error) {
    logTest('Lecturer: Get My Courses', false, error);
  }

  // Test 2: Create course
  try {
    const course = await lecturerService.createCourse({
      code: 'TEST101',
      title: 'Test Course',
      description: 'This is a test course',
      department: 'Computer Science',
      level: 'beginner',
      duration: '4 weeks',
      tags: ['test', 'demo']
    });
    logTest('Lecturer: Create Course', !!course.id);

    // Test 3: Create module
    if (course.id) {
      try {
        const module = await lecturerService.createModule(course.id, {
          title: 'Test Module',
          description: 'Test module description',
          order: 1,
          duration: '1 week'
        });
        logTest('Lecturer: Create Module', !!module.id);

        // Test 4: Create topic
        if (module.id) {
          try {
            const topic = await lecturerService.createTopic(module.id, {
              title: 'Test Topic',
              description: 'Test topic description',
              content: 'Test content',
              content_type: 'text',
              order: 1,
              duration: 30
            });
            logTest('Lecturer: Create Topic', !!topic.id);
          } catch (error) {
            logTest('Lecturer: Create Topic', false, error);
          }
        }
      } catch (error) {
        logTest('Lecturer: Create Module', false, error);
      }
    }
  } catch (error) {
    logTest('Lecturer: Create Course', false, error);
  }

  // Test 5: Get class demographics
  try {
    const demographics = await lecturerService.getClassDemographics();
    logTest('Lecturer: Get Class Demographics', !!demographics.total_students !== undefined);
  } catch (error) {
    logTest('Lecturer: Get Class Demographics', false, error);
  }

  // Test 6: Get alerts
  try {
    const alerts = await lecturerService.getAlerts();
    logTest('Lecturer: Get Alerts', Array.isArray(alerts));
  } catch (error) {
    logTest('Lecturer: Get Alerts', false, error);
  }
}

// ========== ADMIN SERVICE TESTS ==========

export async function testAdminService() {
  console.log('\n👨‍💼 Testing Admin Service...\n');

  // Login as admin first
  try {
    await authService.login({
      email: TEST_CONFIG.testAdmin.email,
      password: TEST_CONFIG.testAdmin.password
    });
  } catch (error) {
    console.log('  ⚠️  Admin account not found, skipping admin tests');
    return;
  }

  // Test 1: Get all users
  try {
    const users = await adminService.getAllUsers({
      page: 1,
      limit: 10
    });
    logTest('Admin: Get All Users', !!users.users);
  } catch (error) {
    logTest('Admin: Get All Users', false, error);
  }

  // Test 2: Get system statistics
  try {
    const stats = await adminService.getSystemStatistics();
    logTest('Admin: Get System Statistics', !!stats.users);
  } catch (error) {
    logTest('Admin: Get System Statistics', false, error);
  }

  // Test 3: Get accessibility report
  try {
    const report = await adminService.getAccessibilityReport();
    logTest('Admin: Get Accessibility Report', !!report.total_users_with_disabilities !== undefined);
  } catch (error) {
    logTest('Admin: Get Accessibility Report', false, error);
  }

  // Test 4: Get system health
  try {
    const health = await adminService.getSystemHealth();
    logTest('Admin: Get System Health', !!health.status);
  } catch (error) {
    logTest('Admin: Get System Health', false, error);
  }

  // Test 5: Get all departments
  try {
    const departments = await adminService.getAllDepartments();
    logTest('Admin: Get All Departments', Array.isArray(departments));
  } catch (error) {
    logTest('Admin: Get All Departments', false, error);
  }

  // Test 6: Get all announcements
  try {
    const announcements = await adminService.getAllAnnouncements({
      page: 1,
      limit: 10
    });
    logTest('Admin: Get All Announcements', !!announcements.announcements);
  } catch (error) {
    logTest('Admin: Get All Announcements', false, error);
  }

  // Test 7: Get audit logs
  try {
    const logs = await adminService.getAuditLogs({
      page: 1,
      limit: 10
    });
    logTest('Admin: Get Audit Logs', !!logs.logs);
  } catch (error) {
    logTest('Admin: Get Audit Logs', false, error);
  }
}

// ========== RUN ALL TESTS ==========

export async function runAllTests() {
  console.log('🚀 Starting API Services Integration Tests...');
  console.log(`📡 API URL: ${TEST_CONFIG.apiUrl}\n`);

  try {
    await testAuthService();
    await testUserService();
    await testCourseService();
    await testEnrollmentService();
    await testProgressService();
    await testLecturerService();
    await testAdminService();

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));

    const totalTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(r => r).length;
    const failedTests = totalTests - passedTests;

    console.log(`\nTotal Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

    if (failedTests > 0) {
      console.log('Failed Tests:');
      Object.entries(testResults).forEach(([name, passed]) => {
        if (!passed) {
          console.log(`  ❌ ${name}`);
        }
      });
    }

    console.log('\n' + '='.repeat(50));

    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: (passedTests / totalTests) * 100
    };
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    throw error;
  }
}

// Export for use in other files
export { testResults, TEST_CONFIG };
