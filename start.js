
import { exec } from 'child_process';

// Check if npm is available
try {
  exec('npm --version', (error) => {
    if (error) {
      console.error('❌ npm is not available. Please install Node.js and npm.');
      process.exit(1);
    }
  });
} catch (error) {
  console.error('❌ npm is not available. Please install Node.js and npm.');
  process.exit(1);
}

// Function to kill process on specific port
const killPort = (port) => {
  const isWindows = process.platform === 'win32';
  const command = isWindows 
    ? `netstat -ano | findstr :${port} && for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /f /pid %a`
    : `lsof -ti:${port} | xargs kill -9`;
  
  exec(command, (error, stdout, stderr) => {
    if (!error) {
      console.log(`✅ Cleared port ${port}`);
    }
  });
};

// Clear ports 3000 and 3001 before starting
console.log('🧹 Clearing ports...');
killPort(3000);
killPort(3001);

// Install server dependencies first
console.log('📦 Installing server dependencies...');
const installDeps = exec('cd server && node install-deps.js');

installDeps.stdout.on('data', (data) => {
  console.log(`Dependencies: ${data}`);
});

installDeps.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }

  // Wait a moment before starting servers
  setTimeout(() => {
    // Start backend server
    console.log('🚀 Starting backend server...');
    const backend = exec('cd server && npm run dev');

    backend.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });

    backend.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });

    // Start frontend development server
    console.log('🌐 Starting frontend server...');
    const frontend = exec('npm run dev');

    frontend.stdout.on('data', (data) => {
      console.log(`Frontend: ${data}`);
    });

    frontend.stderr.on('data', (data) => {
      console.error(`Frontend Error: ${data}`);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('⏹️ Stopping servers...');
      backend.kill();
      frontend.kill();
      process.exit();
    });
  }, 3000);
});
