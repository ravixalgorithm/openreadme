const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting OpenReadme Development Server');
console.log('=========================================');

// Function to check if server is running
function checkServer(port = 3000) {
    return new Promise((resolve) => {
        const req = http.request(`http://localhost:${port}`, (res) => {
            resolve(true);
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

// Function to wait for server to start
async function waitForServer(port = 3000, maxAttempts = 30) {
    console.log(`⏳ Waiting for server to start on port ${port}...`);
    
    for (let i = 0; i < maxAttempts; i++) {
        const isRunning = await checkServer(port);
        if (isRunning) {
            console.log(`✅ Server is running on http://localhost:${port}`);
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        process.stdout.write('.');
    }
    
    console.log(`\n❌ Server did not start within ${maxAttempts} seconds`);
    return false;
}

async function startServer() {
    // Check if server is already running
    const alreadyRunning = await checkServer();
    if (alreadyRunning) {
        console.log('✅ Development server is already running on http://localhost:3000');
        return true;
    }
    
    console.log('📦 Starting Next.js development server...');
    
    // Start the development server
    const serverProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        shell: true
    });
    
    serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output.trim());
        
        // Check for common startup messages
        if (output.includes('Ready') || output.includes('started server')) {
            console.log('🎉 Server startup detected!');
        }
    });
    
    serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (!error.includes('warn') && !error.includes('Warning')) {
            console.error('❌ Server error:', error.trim());
        }
    });
    
    serverProcess.on('close', (code) => {
        console.log(`\n📊 Server process exited with code ${code}`);
    });
    
    // Wait for server to be ready
    const serverReady = await waitForServer();
    
    if (serverReady) {
        console.log('\n🎯 Development server is ready for testing!');
        console.log('📋 You can now run:');
        console.log('   - node test-api-endpoints.js (to test API endpoints)');
        console.log('   - Open http://localhost:3000 in your browser');
        console.log('\n⚠️  Press Ctrl+C to stop the server');
        
        // Keep the process alive
        process.on('SIGINT', () => {
            console.log('\n🛑 Stopping development server...');
            serverProcess.kill();
            process.exit(0);
        });
        
        return true;
    } else {
        console.log('\n❌ Failed to start development server');
        serverProcess.kill();
        return false;
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--check-only')) {
    // Just check if server is running
    checkServer().then(running => {
        if (running) {
            console.log('✅ Development server is running on http://localhost:3000');
            process.exit(0);
        } else {
            console.log('❌ Development server is not running');
            process.exit(1);
        }
    });
} else {
    // Start the server
    startServer().catch(error => {
        console.error('💥 Failed to start server:', error);
        process.exit(1);
    });
}
