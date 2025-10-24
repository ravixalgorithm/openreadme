const fs = require('fs');
const fetch = require('node-fetch');

// Read user-mapping.json
const userMapping = require('../data/user-mapping.json');

// Configuration
const API_URL = 'http://localhost:3000'; // Update this if your API is hosted elsewhere

async function testUserGeneration(username, userId) {
  try {
    console.log(`\n--- Testing generation for ${username} (${userId}) ---`);
    
    // Simulate the API call that would be made by the workflow
    const params = new URLSearchParams({
      n: username,  // Name
      i: '',        // Image URL (empty for test)
      g: username,  // GitHub username
      x: '',        // Twitter (empty for test)
      l: '',        // LinkedIn (empty for test)
      p: `https://github.com/${username}`, // Profile URL
      t: 'classic'  // Theme
    });

    const url = `${API_URL}/api/openreadme?${params.toString()}`;
    console.log(`API URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ github: username })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Success!');
    console.log('Generated URL:', result.url);
    return result.url;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Test with the first user in the mapping
async function runTest() {
  const [username, userId] = Object.entries(userMapping)[0];
  
  if (!username || !userId) {
    console.error('No users found in user-mapping.json');
    return;
  }
  
  console.log('Starting workflow test...');
  console.log(`Found user: ${username} (${userId})`);
  
  const result = await testUserGeneration(username, userId);
  
  if (result) {
    console.log('\n🎉 Test completed successfully!');
    console.log('The workflow should work as expected.');
  } else {
    console.log('\n❌ Test failed. Please check the error messages above.');
  }
}

runTest();
