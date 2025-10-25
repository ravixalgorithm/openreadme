const fs = require('fs');
const fetch = require('node-fetch');
const { execSync } = require('child_process');

// Get the API URL from environment variables
const API_URL = process.env.API_URL || 'http://localhost:3000';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.IMAGE_TOKEN;

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
      const error = await userResponse.text();
      throw new Error(`GitHub API error: ${userResponse.status} ${error}`);
    }

    const userData = await userResponse.json();

    // Prepare the data for the OpenReadme API
    const params = new URLSearchParams({
      n: userData.name || username,
      i: userData.avatar_url || '',
      github: username,
      x: userData.twitter_username || '',
      l: userData.blog || userData.html_url || '',
      p: userData.html_url || '',
      t: 'classic'
    });

    const apiUrl = `${API_URL}?${params.toString()}`;
    console.log(`Calling API: ${apiUrl}`);

    // Call the OpenReadme API with proper headers
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

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
  const mappings = process.env.MAPPINGS ? process.env.MAPPINGS.split(' ') : [];
  console.log(`Found ${mappings.length} users to process`);

  for (const mapping of mappings) {
    if (!mapping) continue;

    const [username, userId] = mapping.split('=');
    if (!username || !userId) continue;

    console.log(`\n--- Processing ${username} (${userId}) ---`);

    try {
      const imageUrl = await generateProfileImage(username, userId);
      if (imageUrl) {
        console.log(`Image URL: ${imageUrl}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing ${username}:`, error);
    }
  }

  console.log('\n--- All users processed ---');
})();
