import { lecturerService } from '../services/api/lecturerService';
import { authService } from '../services/api/authService';
import { TEST_CONFIG } from './api-services.test';

async function testCoursePictureUpload() {
    console.log('🚀 Testing Course Picture Upload...');

    try {
        // 1. Login as lecturer
        console.log('🔑 Logging in as lecturer...');
        await authService.login({
            email: TEST_CONFIG.testLecturer.email,
            password: TEST_CONFIG.testLecturer.password
        });

        // 2. Get a course to test with
        console.log('📚 Fetching courses...');
        const coursesRes = await lecturerService.getMyCourses({ limit: 1 });
        if (coursesRes.courses.length === 0) {
            console.log('⚠️ No courses found. Creating a test course...');
            const newCourse = await lecturerService.createCourse({
                code: 'ART101',
                title: 'Digital Arts',
                description: 'Testing thumbnails',
                department: 'Arts',
                level: 'beginner',
                duration: '1 week',
                tags: ['test']
            });
            coursesRes.courses.push(newCourse);
        }

        const testCourse = coursesRes.courses[0];
        console.log(`🎯 Testing with course: ${testCourse.title} (${testCourse.id})`);

        // 3. Create a dummy file
        const fileContent = 'dummy image content';
        const file = new File([fileContent], 'test-thumbnail.png', { type: 'image/png' });

        // 4. Upload picture
        console.log('📤 Uploading thumbnail...');
        const result = await lecturerService.uploadCoursePicture(testCourse.id, file);

        if (result.success && result.data.thumbnail_url) {
            console.log('✅ Success! Thumbnail URL:', result.data.thumbnail_url);
        } else {
            console.log('❌ Failed: Unexpected response format', result);
        }

    } catch (error: any) {
        console.error('❌ Test failed:', error.message || error);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

testCoursePictureUpload();
