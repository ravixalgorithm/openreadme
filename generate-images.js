const fs = require('fs');
const fetch = require('node-fetch');
const { execSync } = require('child_process');

// Get the API URL from environment variables
const API_URL = process.env.API_URL || 'http://localhost:3000';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function generateProfileImage(username, userId) {
  try {
    console.log(`Generating image for ${username}...`);
    
    // First, get the user data from GitHub API
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.statusText}`);
    }
    
    const userData = await userResponse.json();
    
    // Prepare the data for the OpenReadme API
    const params = new URLSearchParams({
      n: userData.name || username,
      i: userData.avatar_url || '',
      g: username,
      x: userData.twitter_username || '',
      l: '',  // LinkedIn would need to be handled separately
      p: userData.blog || userData.html_url,
      t: 'classic'  // Default theme
    });
    
    const apiUrl = `${API_URL}?n=${encodeURIComponent(userData.name || username)}` +
      `&i=${encodeURIComponent(userData.avatar_url || '')}` +
      `&g=${encodeURIComponent(username)}` +
      `&x=${encodeURIComponent(userData.twitter_username || '')}` +
      `&l=` +  // LinkedIn would need to be handled separately
      `&p=${encodeURIComponent(userData.blog || userData.html_url)}` +
      '&t=classic';
    
    console.log(`API URL: ${apiUrl}`);  // Debug log
    
    // Call the OpenReadme API with GET method
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${error}`);
    }

    const result = await response.json();
    console.log(`✅ Successfully generated image for ${username}: ${result.url}`);
    
    return result.url;
    
  } catch (error) {
    console.error(`❌ Error generating image for ${username}:`, error.message);
    return null;
  }
}

// Process all users
(async () => {
  const mappings = process.env.MAPPINGS.split(' ');
  console.log(`Found ${mappings.length} users to process`);
  
  for (const mapping of mappings) {
    if (!mapping) continue;
    
    const [username, userId] = mapping.split('=');
    if (!username || !userId) continue;
    
    console.log(`\n--- Processing ${username} (${userId}) ---`);
    
    try {
      const imageUrl = await generateProfileImage(username, userId);
      if (imageUrl) {
        // Here you could update the user-mapping.json with the new image URL if needed
        console.log(`Image URL: ${imageUrl}`);
      }
      
      // Add delay to avoid rate limiting (1 second between requests)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error processing ${username}:`, error);
    }
  }
  
  console.log('\n--- All users processed ---');
})();
