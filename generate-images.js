const fs = require('fs');
const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'https://openreadme.vercel.app/api/openreadme';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'Open-Dev-Society';
const REPO_NAME = 'openreadme';

async function generateProfileImage(username, userId) {
  try {
    console.log(`🎨 Generating image for ${username} (${userId})...`);

    // Get user data from GitHub API
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OpenReadme-Workflow'
      }
    });

    if (!userResponse.ok) {
      console.warn(`⚠️  GitHub API warning for ${username}: ${userResponse.statusText}`);
    }

    const userData = userResponse.ok ? await userResponse.json() : { login: username };

    // Build API URL with parameters
    const params = new URLSearchParams({
      n: userData.name || username,
      i: userData.avatar_url || '',
      g: username,
      x: userData.twitter_username || '',
      l: userData.blog || userData.html_url || '',
      p: userData.html_url || `https://github.com/${username}`,
      t: 'classic'
    });

    const apiUrl = `${API_URL}?${params.toString()}`;
    console.log(`📡 Calling API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'OpenReadme-Workflow'
      }
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API error response: ${errorText}`);
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Successfully generated image for ${username}`);
    console.log(`🔗 Image URL: ${result.url}`);
    console.log(`📝 Method: ${result.method}`);

    return result.url;

  } catch (error) {
    console.error(`❌ Error generating image for ${username}:`, error.message);
    console.error(`🔍 Stack trace:`, error.stack);
    return null;
  }
}

// Process all users
(async () => {
  try {
    const mappingsString = process.env.MAPPINGS || '';
    const mappings = mappingsString.split(' ').filter(m => m.trim());
    console.log(`📋 Found ${mappings.length} users to process`);
    console.log(`🔧 Using API URL: ${API_URL}`);

    if (mappings.length === 0) {
      console.log('⚠️  No user mappings found to process');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const mapping of mappings) {
      if (!mapping.trim()) continue;

      const [username, userId] = mapping.split('=');
      if (!username || !userId) {
        console.warn(`⚠️  Invalid mapping format: ${mapping}`);
        continue;
      }

      console.log(`\n${'='.repeat(50)}`);
      console.log(`🔄 Processing ${username} (${userId})`);
      console.log(`${'='.repeat(50)}`);

      try {
        const imageUrl = await generateProfileImage(username, userId);
        if (imageUrl) {
          successCount++;
          console.log(`✅ Success for ${username}: ${imageUrl}`);
        } else {
          errorCount++;
          console.log(`❌ Failed for ${username}`);
        }

        // Add delay to avoid rate limiting (2 seconds between requests)
        console.log(`⏳ Waiting 2 seconds before next request...`);
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        errorCount++;
        console.error(`💥 Error processing ${username}:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 WORKFLOW SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📋 Total: ${successCount + errorCount}`);
    console.log(`${'='.repeat(60)}`);

  } catch (error) {
    console.error('💥 Workflow failed:', error.message);
    process.exit(1);
  }
})();
