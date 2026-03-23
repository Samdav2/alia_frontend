// Test Runner Script
// Run this to test all API services

import { runAllTests } from './api-services.test';

// Check if backend is running
async function checkBackend() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${apiUrl}/health`);
    if (response.ok) {
      console.log('✅ Backend is running');
      return true;
    }
  } catch (error) {
    console.error('❌ Backend is not running!');
    console.error(`   Please start the backend at ${apiUrl}`);
    console.error('   Run: python quickstart.py');
    return false;
  }
  return false;
}

// Main test execution
async function main() {
  console.log('🧪 API Services Test Runner\n');
  
  // Check backend
  const backendRunning = await checkBackend();
  if (!backendRunning) {
    process.exit(1);
  }

  console.log('');

  // Run tests
  try {
    const results = await runAllTests();
    
    // Exit with appropriate code
    if (results.failed === 0) {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Check the output above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main };
