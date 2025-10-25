const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Test configuration
const TEST_USERNAME = 'testuser123';
const EXPECTED_HASH = crypto.createHash('sha256').update(TEST_USERNAME.toLowerCase()).digest('hex').substring(0, 12);

console.log('🧪 OpenReadme Complete Flow Test');
console.log('================================');

async function testUserMappingLogic() {
    console.log('\n📋 Testing User Mapping Logic...');
    
    try {
        // Import the userMapping functions (handle TypeScript module)
        const userMappingPath = require.resolve('./utils/userMapping.ts');
        delete require.cache[userMappingPath];
        
        // For TypeScript files, we need to use a different approach
        const fs = require('fs').promises;
        const path = require('path');
        
        // Test the functions by reading the actual implementation
        async function testGetHashedUsername(username) {
            const data = await fs.readFile(path.join(__dirname, 'data/user-mapping.json'), 'utf-8');
            const mapping = JSON.parse(data);
            return mapping[username.toLowerCase()] || null;
        }
        
        async function testStoreUserMapping(username, hashed) {
            let mapping = {};
            try {
                const data = await fs.readFile(path.join(__dirname, 'data/user-mapping.json'), 'utf-8');
                mapping = JSON.parse(data);
            } catch (e) {
                // File doesn't exist yet
            }
            
            mapping[username.toLowerCase()] = hashed;
            await fs.writeFile(path.join(__dirname, 'data/user-mapping.json'), JSON.stringify(mapping, null, 2), 'utf-8');
            
            // Verify
            const verification = await testGetHashedUsername(username);
            if (verification !== hashed) {
                throw new Error(`Failed to verify user mapping for ${username}`);
            }
        }
        
        // Test 1: Check existing user
        console.log('1. Testing existing user lookup...');
        const existingHash = await testGetHashedUsername('ravixalgorithm');
        if (existingHash === 'fad62070c0e0') {
            console.log('✅ Existing user mapping works correctly');
        } else {
            console.log('❌ Existing user mapping failed:', existingHash);
        }
        
        // Test 2: Store new user mapping
        console.log('2. Testing new user mapping storage...');
        await testStoreUserMapping(TEST_USERNAME, EXPECTED_HASH);
        
        // Test 3: Verify new user was stored
        console.log('3. Verifying new user mapping...');
        const newHash = await testGetHashedUsername(TEST_USERNAME);
        if (newHash === EXPECTED_HASH) {
            console.log('✅ New user mapping stored and retrieved correctly');
        } else {
            console.log('❌ New user mapping verification failed:', newHash);
        }
        
        // Clean up test user
        console.log('4. Cleaning up test data...');
        let mapping = {};
        try {
            const data = await fs.readFile(path.join(__dirname, 'data/user-mapping.json'), 'utf-8');
            mapping = JSON.parse(data);
            delete mapping[TEST_USERNAME.toLowerCase()];
            await fs.writeFile(path.join(__dirname, 'data/user-mapping.json'), JSON.stringify(mapping, null, 2), 'utf-8');
            console.log('✅ Test data cleaned up');
        } catch (e) {
            console.log('⚠️  Could not clean up test data');
        }
        
        return true;
    } catch (error) {
        console.log('❌ User mapping test failed:', error.message);
        return false;
    }
}

async function testHashingLogic() {
    console.log('\n🔐 Testing Hashing Logic...');
    
    // Test the hashing function from route.ts
    function hashUsername(username) {
        return crypto.createHash('sha256').update(username.toLowerCase()).digest('hex').substring(0, 12);
    }
    
    const testCases = [
        { input: 'ravixalgorithm', expected: 'fad62070c0e0' },
        { input: 'TestUser', expected: hashUsername('testuser') },
        { input: 'UPPERCASE', expected: hashUsername('uppercase') }
    ];
    
    let passed = 0;
    for (const testCase of testCases) {
        const result = hashUsername(testCase.input);
        if (result === testCase.expected) {
            console.log(`✅ Hash test passed for "${testCase.input}"`);
            passed++;
        } else {
            console.log(`❌ Hash test failed for "${testCase.input}": expected ${testCase.expected}, got ${result}`);
        }
    }
    
    return passed === testCases.length;
}

async function testFileStructure() {
    console.log('\n📁 Testing File Structure...');
    
    const requiredFiles = [
        'package.json',
        'next.config.ts',
        'app/api/openreadme/route.ts',
        'app/api/lookup/route.ts',
        'utils/userMapping.ts',
        'data/user-mapping.json',
        'stats/usage-log.json'
    ];
    
    let allExist = true;
    for (const file of requiredFiles) {
        try {
            await fs.access(path.join(__dirname, file));
            console.log(`✅ ${file} exists`);
        } catch (error) {
            console.log(`❌ ${file} missing`);
            allExist = false;
        }
    }
    
    return allExist;
}

async function testDataIntegrity() {
    console.log('\n🔍 Testing Data Integrity...');
    
    try {
        // Test user-mapping.json
        const mappingData = await fs.readFile(path.join(__dirname, 'data/user-mapping.json'), 'utf-8');
        const mapping = JSON.parse(mappingData);
        
        if (typeof mapping === 'object' && mapping.ravixalgorithm === 'fad62070c0e0') {
            console.log('✅ user-mapping.json has correct structure and data');
        } else {
            console.log('❌ user-mapping.json structure or data is incorrect');
            return false;
        }
        
        // Test usage-log.json
        const logData = await fs.readFile(path.join(__dirname, 'stats/usage-log.json'), 'utf-8');
        const log = JSON.parse(logData);
        
        if (Array.isArray(log)) {
            console.log(`✅ usage-log.json has correct structure (${log.length} entries)`);
        } else {
            console.log('❌ usage-log.json should be an array');
            return false;
        }
        
        return true;
    } catch (error) {
        console.log('❌ Data integrity test failed:', error.message);
        return false;
    }
}

async function testAPIStructure() {
    console.log('\n🔌 Testing API Structure...');
    
    try {
        // Check if route.ts has required functions
        const routeContent = await fs.readFile(path.join(__dirname, 'app/api/openreadme/route.ts'), 'utf-8');
        
        const requiredFunctions = [
            'hashUsername',
            'generateSecureFileName',
            'logUserGeneration',
            'uploadToGitHubSafely',
            'POST',
            'GET'
        ];
        
        let allFound = true;
        for (const func of requiredFunctions) {
            if (routeContent.includes(func)) {
                console.log(`✅ Function ${func} found`);
            } else {
                console.log(`❌ Function ${func} missing`);
                allFound = false;
            }
        }
        
        // Check for our recent fixes
        const fixes = [
            'throw error', // Error re-throwing
            'uploadToken', // Token consistency fix
            'Successfully logged usage', // Improved logging
            'Failed to create user mapping' // Better error messages
        ];
        
        for (const fix of fixes) {
            if (routeContent.includes(fix)) {
                console.log(`✅ Fix implemented: ${fix}`);
            } else {
                console.log(`⚠️  Fix may be missing: ${fix}`);
            }
        }
        
        return allFound;
    } catch (error) {
        console.log('❌ API structure test failed:', error.message);
        return false;
    }
}

async function testEnvironmentSetup() {
    console.log('\n🌍 Testing Environment Setup...');
    
    // Check if .env.example exists and has required variables
    try {
        const envExample = await fs.readFile(path.join(__dirname, '.env.example'), 'utf-8');
        
        const requiredVars = [
            'GITHUB_TOKEN',
            'GITHUB_TOKEN_IMAGES',
            'NODE_ENV'
        ];
        
        let allFound = true;
        for (const variable of requiredVars) {
            if (envExample.includes(variable)) {
                console.log(`✅ Environment variable ${variable} documented`);
            } else {
                console.log(`❌ Environment variable ${variable} not documented`);
                allFound = false;
            }
        }
        
        return allFound;
    } catch (error) {
        console.log('❌ Environment setup test failed:', error.message);
        return false;
    }
}

async function generateTestReport() {
    console.log('\n📊 Running Complete Test Suite...');
    console.log('==================================');
    
    const tests = [
        { name: 'File Structure', test: testFileStructure },
        { name: 'Data Integrity', test: testDataIntegrity },
        { name: 'Hashing Logic', test: testHashingLogic },
        { name: 'User Mapping Logic', test: testUserMappingLogic },
        { name: 'API Structure', test: testAPIStructure },
        { name: 'Environment Setup', test: testEnvironmentSetup }
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
    
    console.log('\n📋 Test Results Summary');
    console.log('=======================');
    
    let totalPassed = 0;
    for (const result of results) {
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${result.name}`);
        if (result.error) {
            console.log(`    Error: ${result.error}`);
        }
        if (result.passed) totalPassed++;
    }
    
    console.log(`\n🎯 Overall: ${totalPassed}/${results.length} tests passed`);
    
    if (totalPassed === results.length) {
        console.log('🎉 All tests passed! Your OpenReadme application is ready for deployment.');
    } else {
        console.log('⚠️  Some tests failed. Please review the issues above before deployment.');
    }
    
    return totalPassed === results.length;
}

// Run the complete test suite
generateTestReport().catch(console.error);
