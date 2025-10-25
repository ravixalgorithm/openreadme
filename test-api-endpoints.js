const https = require('https');
const http = require('http');

console.log('🔌 OpenReadme API Endpoints Test');
console.log('================================');

// Configuration - Update these URLs based on your deployment
const LOCAL_URL = 'http://localhost:3000';
const PRODUCTION_URL = 'https://your-app.vercel.app'; // Update this with your actual Vercel URL

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https');
        const client = isHttps ? https : http;
        
        const requestOptions = {
            method: 'GET',
            headers: {
                'User-Agent': 'OpenReadme-Test',
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const req = client.request(url, requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({ 
                        status: res.statusCode, 
                        headers: res.headers,
                        data: parsed,
                        raw: data
                    });
                } catch (error) {
                    resolve({ 
                        status: res.statusCode, 
                        headers: res.headers,
                        data: null,
                        raw: data,
                        parseError: error.message
                    });
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                status: 0,
                error: error.message,
                data: null
            });
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

async function testLookupAPI(baseUrl) {
    console.log(`\n🔍 Testing Lookup API at ${baseUrl}...`);
    
    // Test 1: Valid user lookup
    console.log('1. Testing valid user lookup...');
    const validResponse = await makeRequest(`${baseUrl}/api/lookup?username=ravixalgorithm`);
    
    if (validResponse.status === 200) {
        console.log('✅ Valid user lookup successful');
        console.log(`   - Username: ${validResponse.data.username}`);
        console.log(`   - Hashed: ${validResponse.data.hashedUsername}`);
        console.log(`   - Image URL: ${validResponse.data.imageUrl}`);
    } else {
        console.log(`❌ Valid user lookup failed (status: ${validResponse.status})`);
        console.log(`   - Response: ${validResponse.raw}`);
    }
    
    // Test 2: Invalid user lookup
    console.log('2. Testing invalid user lookup...');
    const invalidResponse = await makeRequest(`${baseUrl}/api/lookup?username=nonexistentuser12345`);
    
    if (invalidResponse.status === 404) {
        console.log('✅ Invalid user lookup correctly returned 404');
    } else {
        console.log(`❌ Invalid user lookup returned unexpected status: ${invalidResponse.status}`);
    }
    
    // Test 3: Missing username parameter
    console.log('3. Testing missing username parameter...');
    const missingResponse = await makeRequest(`${baseUrl}/api/lookup`);
    
    if (missingResponse.status === 400) {
        console.log('✅ Missing username correctly returned 400');
    } else {
        console.log(`❌ Missing username returned unexpected status: ${missingResponse.status}`);
    }
    
    return validResponse.status === 200;
}

async function testStatsAPI(baseUrl) {
    console.log(`\n📊 Testing Stats API at ${baseUrl}...`);
    
    const response = await makeRequest(`${baseUrl}/api/openreadme?github=ravixalgorithm`);
    
    if (response.status === 200) {
        console.log('✅ Stats API accessible');
        if (Array.isArray(response.data)) {
            console.log(`   - Entries: ${response.data.length}`);
        } else {
            console.log('   - Response format:', typeof response.data);
        }
    } else if (response.status === 404) {
        console.log('⚠️  Stats file not found (this is normal for new deployments)');
    } else {
        console.log(`❌ Stats API returned status: ${response.status}`);
        console.log(`   - Response: ${response.raw}`);
    }
    
    return response.status === 200 || response.status === 404;
}

async function testImageGeneration(baseUrl) {
    console.log(`\n🎨 Testing Image Generation API at ${baseUrl}...`);
    console.log('⚠️  Note: This test will attempt to generate an actual image');
    
    const testParams = {
        username: 'testuser',
        n: 'Test User',
        g: 'testuser',
        p: 'https://github.com/testuser'
    };
    
    const queryString = new URLSearchParams(testParams).toString();
    const response = await makeRequest(`${baseUrl}/api/openreadme?${queryString}`, {
        method: 'POST',
        body: { github: 'testuser' }
    });
    
    if (response.status === 200) {
        console.log('✅ Image generation API responded successfully');
        console.log(`   - Method: ${response.data.method}`);
        console.log(`   - Message: ${response.data.message}`);
        if (response.data.url) {
            console.log(`   - Image URL: ${response.data.url.substring(0, 100)}...`);
        }
    } else if (response.status === 429) {
        console.log('⚠️  Rate limited (this is expected behavior)');
    } else if (response.status === 500) {
        console.log('❌ Image generation failed with server error');
        console.log(`   - Error: ${response.data?.message || response.raw}`);
    } else {
        console.log(`❌ Image generation returned status: ${response.status}`);
        console.log(`   - Response: ${response.raw}`);
    }
    
    return response.status === 200 || response.status === 429;
}

async function testHealthCheck(baseUrl) {
    console.log(`\n❤️  Testing Health Check at ${baseUrl}...`);
    
    const response = await makeRequest(baseUrl);
    
    if (response.status === 200) {
        console.log('✅ Application is accessible');
    } else if (response.error) {
        console.log(`❌ Application not accessible: ${response.error}`);
        return false;
    } else {
        console.log(`⚠️  Application returned status: ${response.status}`);
    }
    
    return response.status === 200 || response.status < 500;
}

async function runAPITests(baseUrl, environment) {
    console.log(`\n🧪 Testing ${environment} Environment`);
    console.log('='.repeat(40));
    
    const tests = [
        { name: 'Health Check', test: () => testHealthCheck(baseUrl) },
        { name: 'Lookup API', test: () => testLookupAPI(baseUrl) },
        { name: 'Stats API', test: () => testStatsAPI(baseUrl) },
        // Uncomment the next line to test image generation (will consume API quota)
        // { name: 'Image Generation', test: () => testImageGeneration(baseUrl) }
    ];
    
    const results = [];
    
    for (const { name, test } of tests) {
        try {
            const result = await test();
            results.push({ name, passed: result });
        } catch (error) {
            console.log(`❌ ${name} test crashed:`, error.message);
            results.push({ name, passed: false, error: error.message });
        }
    }
    
    console.log(`\n📋 ${environment} Test Results`);
    console.log('='.repeat(30));
    
    let totalPassed = 0;
    for (const result of results) {
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${result.name}`);
        if (result.error) {
            console.log(`    Error: ${result.error}`);
        }
        if (result.passed) totalPassed++;
    }
    
    return { passed: totalPassed, total: results.length };
}

async function runAllTests() {
    console.log('Starting comprehensive API testing...\n');
    
    // Test local development server
    console.log('Testing local development server...');
    const localResults = await runAPITests(LOCAL_URL, 'Local Development');
    
    // Note: Production testing would require the actual Vercel URL
    console.log('\n💡 To test production deployment:');
    console.log('1. Update PRODUCTION_URL with your actual Vercel deployment URL');
    console.log('2. Uncomment the production testing section below');
    
    /*
    // Uncomment this section when you have your production URL
    console.log('\nTesting production deployment...');
    const prodResults = await runAPITests(PRODUCTION_URL, 'Production');
    
    console.log('\n🎯 Overall Results');
    console.log('==================');
    console.log(`Local: ${localResults.passed}/${localResults.total} tests passed`);
    console.log(`Production: ${prodResults.passed}/${prodResults.total} tests passed`);
    */
    
    console.log('\n🎯 Overall Results');
    console.log('==================');
    console.log(`Local: ${localResults.passed}/${localResults.total} tests passed`);
    
    if (localResults.passed === localResults.total) {
        console.log('🎉 All local tests passed! Your API is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please check the issues above.');
    }
    
    console.log('\n📝 Next Steps:');
    console.log('1. If local tests pass, deploy to Vercel');
    console.log('2. Update PRODUCTION_URL in this script with your Vercel URL');
    console.log('3. Run production tests to verify deployment');
    console.log('4. Test image generation with a real user to verify end-to-end flow');
}

// Run all tests
runAllTests().catch(console.error);
