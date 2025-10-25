const https = require('https');
const fs = require('fs').promises;

console.log('🚀 OpenReadme Deployment Verification');
console.log('=====================================');

// GitHub API helper
function makeGitHubRequest(path, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: path,
            method: 'GET',
            headers: {
                'User-Agent': 'OpenReadme-Test',
                'Accept': 'application/vnd.github.v3+json',
                ...(token && { 'Authorization': `token ${token}` })
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (error) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function checkGitHubRepository(owner, repo, description) {
    console.log(`\n📦 Checking ${description}...`);
    
    try {
        const response = await makeGitHubRequest(`/repos/${owner}/${repo}`);
        
        if (response.status === 200) {
            console.log(`✅ Repository ${owner}/${repo} exists`);
            console.log(`   - Description: ${response.data.description || 'No description'}`);
            console.log(`   - Private: ${response.data.private}`);
            console.log(`   - Default branch: ${response.data.default_branch}`);
            return true;
        } else if (response.status === 404) {
            console.log(`❌ Repository ${owner}/${repo} not found`);
            return false;
        } else {
            console.log(`⚠️  Repository ${owner}/${repo} returned status ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error checking ${owner}/${repo}:`, error.message);
        return false;
    }
}

async function checkImageRepository() {
    console.log(`\n🖼️  Checking image storage repository...`);
    
    try {
        // Check if the profiles directory exists
        const response = await makeGitHubRequest('/repos/ravixalgorithm/openreadme-images/contents/profiles');
        
        if (response.status === 200) {
            const profiles = response.data;
            console.log(`✅ Profiles directory exists with ${profiles.length} files`);
            
            // Check for the known user's image
            const knownUserImage = profiles.find(file => file.name === 'fad62070c0e0.png');
            if (knownUserImage) {
                console.log(`✅ Known user image found: ${knownUserImage.name}`);
                console.log(`   - Size: ${knownUserImage.size} bytes`);
                console.log(`   - Download URL: ${knownUserImage.download_url}`);
            } else {
                console.log(`⚠️  Known user image (fad62070c0e0.png) not found`);
            }
            
            return true;
        } else {
            console.log(`❌ Profiles directory not accessible (status: ${response.status})`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error checking image repository:`, error.message);
        return false;
    }
}

async function checkStatsFile() {
    console.log(`\n📊 Checking stats file in main repository...`);
    
    try {
        const response = await makeGitHubRequest('/repos/open-dev-society/openreadme/contents/stats/usage-log.json');
        
        if (response.status === 200) {
            console.log(`✅ Stats file exists in main repository`);
            console.log(`   - Size: ${response.data.size} bytes`);
            
            // Try to decode and check content
            try {
                const content = Buffer.from(response.data.content, 'base64').toString();
                const stats = JSON.parse(content);
                console.log(`   - Entries: ${stats.length}`);
                
                if (stats.length > 0) {
                    const latest = stats[stats.length - 1];
                    console.log(`   - Latest entry: ${latest.actualUsername} (${latest.date})`);
                }
            } catch (parseError) {
                console.log(`   - Could not parse stats content`);
            }
            
            return true;
        } else if (response.status === 404) {
            console.log(`⚠️  Stats file not found in main repository`);
            return false;
        } else {
            console.log(`❌ Stats file check returned status ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error checking stats file:`, error.message);
        return false;
    }
}

async function testImageURL() {
    console.log(`\n🔗 Testing image URL accessibility...`);
    
    const imageUrl = 'https://raw.githubusercontent.com/ravixalgorithm/openreadme-images/main/profiles/fad62070c0e0.png';
    
    return new Promise((resolve) => {
        const req = https.request(imageUrl, (res) => {
            if (res.statusCode === 200) {
                console.log(`✅ Image URL is accessible`);
                console.log(`   - Status: ${res.statusCode}`);
                console.log(`   - Content-Type: ${res.headers['content-type']}`);
                console.log(`   - Content-Length: ${res.headers['content-length']} bytes`);
                resolve(true);
            } else {
                console.log(`❌ Image URL returned status ${res.statusCode}`);
                resolve(false);
            }
            res.resume(); // Consume response data
        });
        
        req.on('error', (error) => {
            console.log(`❌ Error accessing image URL:`, error.message);
            resolve(false);
        });
        
        req.end();
    });
}

async function checkLocalConfiguration() {
    console.log(`\n⚙️  Checking local configuration...`);
    
    try {
        // Check if user-mapping.json has the expected structure
        const mappingData = await fs.readFile('./data/user-mapping.json', 'utf-8');
        const mapping = JSON.parse(mappingData);
        
        console.log(`✅ Local user mapping loaded`);
        console.log(`   - Users mapped: ${Object.keys(mapping).length}`);
        
        for (const [username, hash] of Object.entries(mapping)) {
            console.log(`   - ${username} -> ${hash}`);
        }
        
        return true;
    } catch (error) {
        console.log(`❌ Error checking local configuration:`, error.message);
        return false;
    }
}

async function runDeploymentVerification() {
    console.log('Starting deployment verification...\n');
    
    const checks = [
        { name: 'Main Repository', test: () => checkGitHubRepository('open-dev-society', 'openreadme', 'Main OpenReadme repository') },
        { name: 'Fork Repository', test: () => checkGitHubRepository('ravixalgorithm', 'openreadme', 'Your fork of OpenReadme') },
        { name: 'Images Repository', test: () => checkGitHubRepository('ravixalgorithm', 'openreadme-images', 'Image storage repository') },
        { name: 'Image Directory', test: checkImageRepository },
        { name: 'Stats File', test: checkStatsFile },
        { name: 'Image URL Access', test: testImageURL },
        { name: 'Local Config', test: checkLocalConfiguration }
    ];
    
    const results = [];
    
    for (const { name, test } of checks) {
        try {
            const result = await test();
            results.push({ name, passed: result });
        } catch (error) {
            console.log(`❌ ${name} check crashed:`, error.message);
            results.push({ name, passed: false, error: error.message });
        }
    }
    
    console.log('\n📋 Deployment Verification Results');
    console.log('==================================');
    
    let totalPassed = 0;
    for (const result of results) {
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${result.name}`);
        if (result.error) {
            console.log(`    Error: ${result.error}`);
        }
        if (result.passed) totalPassed++;
    }
    
    console.log(`\n🎯 Overall: ${totalPassed}/${results.length} checks passed`);
    
    if (totalPassed === results.length) {
        console.log('🎉 All deployment checks passed! Your infrastructure is properly configured.');
    } else {
        console.log('⚠️  Some deployment checks failed. Please review the issues above.');
    }
    
    // Provide specific recommendations
    console.log('\n💡 Recommendations:');
    if (results.find(r => r.name === 'Images Repository' && !r.passed)) {
        console.log('- Ensure ravixalgorithm/openreadme-images repository exists and is accessible');
    }
    if (results.find(r => r.name === 'Image Directory' && !r.passed)) {
        console.log('- Create a "profiles" directory in the openreadme-images repository');
    }
    if (results.find(r => r.name === 'Stats File' && !r.passed)) {
        console.log('- The stats file will be created automatically when the first user generates an image');
    }
    
    return totalPassed === results.length;
}

// Run the deployment verification
runDeploymentVerification().catch(console.error);
