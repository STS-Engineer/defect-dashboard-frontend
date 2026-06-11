// Frontend CORS Debugging Script
// Add this to your React component temporarily to test the PATCH request

import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:8002';
const DEFECT_ID = 1084;

export async function testCORSFromFrontend() {
  console.group('🔍 CORS Frontend Debug Test');
  
  const testData = {
    securisation: "OK",
    poste_occurrence: "POSTE1",
    poste_detection: "POSTE2",
    root_cause_occurrence: "RC1",
    root_cause_non_detection: "RC2",
    plan_action_occurrence: "PA1",
    plan_action_non_detection: "PA2"
  };
  
  // Test 1: GET request (baseline)
  console.log('1️⃣ Testing GET /defects');
  try {
    const res = await axios.get(`${BACKEND_URL}/defects`);
    console.log('✓ GET works:', res.status, res.data.length, 'defects');
  } catch (err) {
    console.error('✗ GET failed:', err.message);
    console.error('Response:', err.response?.status, err.response?.data);
  }
  
  // Test 2: PATCH request
  console.log('\n2️⃣ Testing PATCH /defects/{id}');
  try {
    const res = await axios.patch(
      `${BACKEND_URL}/defects/${DEFECT_ID}`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    console.log('✓ PATCH works:', res.status);
    console.log('Response:', res.data);
  } catch (err) {
    console.error('✗ PATCH failed:', err.message);
    console.error('Status:', err.response?.status);
    console.error('Data:', err.response?.data);
    console.error('Headers:', err.response?.headers);
    
    // CORS-specific error info
    if (err.message.includes('CORS') || err.message.includes('blocked')) {
      console.error('\n⚠️ CORS ERROR DETECTED');
      console.error('This means the OPTIONS preflight failed or CORS headers are wrong');
      console.error('Check FastAPI logs and use debug_cors.py to test backend');
    }
  }
  
  console.groupEnd();
}

// Call this function from browser console:
// testCORSFromFrontend()
// Or add to your component:
// useEffect(() => { testCORSFromFrontend(); }, []);
