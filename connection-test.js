/**
 * Connection Test Utility
 * This script diagnoses common connection issues that might cause
 * net::ERR_TUNNEL_CONNECTION_FAILED errors
 */

const http = require('http');
const net = require('net');
const fs = require('fs');
const { exec } = require('child_process');

// Config
const PORTS_TO_CHECK = [3000, 3008];
const LOCALHOST_IP = '127.0.0.1';
const CONNECTION_TIMEOUT = 2000; // 2 seconds
const CONNECTION_RETRIES = 3;

console.log('🔍 Digital Art Auction Platform - Connection Diagnostics');
console.log('====================================================');

// 1. Check if ports are already in use
async function checkPortsInUse() {
  console.log('\n📊 Checking if required ports are available...');
  
  for (const port of PORTS_TO_CHECK) {
    try {
      const server = net.createServer();
      
      await new Promise((resolve, reject) => {
        server.once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`❌ Port ${port} is already in use`);
            reject(err);
          } else {
            reject(err);
          }
        });
        
        server.once('listening', () => {
          console.log(`✅ Port ${port} is available`);
          server.close();
          resolve();
        });
        
        server.listen(port, LOCALHOST_IP);
      });
      
    } catch (error) {
      console.log(`⚠️  Port ${port} may need to be freed before starting the server`);
      console.log(`   To free this port, you can run: lsof -ti:${port} | xargs kill -9`);
    }
  }
}

// 2. Check for DNS resolution issues
async function checkDnsResolution() {
  console.log('\n📡 Checking DNS resolution...');
  
  return new Promise((resolve) => {
    exec('ping -c 1 localhost', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ DNS resolution issue detected. localhost cannot be reached');
        console.log('   Try adding "127.0.0.1 localhost" to your /etc/hosts file');
        resolve(false);
      } else {
        console.log('✅ DNS resolution is working properly');
        resolve(true);
      }
    });
  });
}

// 3. Check for network interface issues
async function checkNetworkInterfaces() {
  console.log('\n🌐 Checking network interfaces...');
  
  return new Promise((resolve) => {
    exec('ifconfig lo0', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Could not check loopback interface');
        resolve(false);
      } else if (!stdout.includes('127.0.0.1')) {
        console.log('❌ Loopback interface may be misconfigured');
        console.log('   Make sure "lo0" interface is up and has 127.0.0.1 assigned');
        resolve(false);
      } else {
        console.log('✅ Network interfaces appear to be configured correctly');
        resolve(true);
      }
    });
  });
}

// 4. Check Node.js configuration
async function checkNodeConfig() {
  console.log('\n⚙️  Checking Node.js configuration...');
  
  // Check if .node-version or .nvmrc exists
  const nodeVersionFileExists = fs.existsSync('.node-version') || fs.existsSync('.nvmrc');
  
  if (nodeVersionFileExists) {
    console.log('ℹ️  Node version file detected - make sure you\'re using the correct Node version');
  }
  
  // Check for memory limits
  const maxOldSpaceSize = process.env.NODE_OPTIONS && process.env.NODE_OPTIONS.includes('--max-old-space-size');
  
  if (!maxOldSpaceSize) {
    console.log('ℹ️  Consider setting NODE_OPTIONS="--max-old-space-size=4096" for large projects');
  } else {
    console.log('✅ Memory limits are configured in NODE_OPTIONS');
  }
  
  // Return success
  return true;
}

// 5. Check Next.js config
async function checkNextConfig() {
  console.log('\n🔧 Checking Next.js configuration...');
  
  try {
    const nextConfigPath = './next.config.mjs';
    
    if (!fs.existsSync(nextConfigPath)) {
      console.log('❌ next.config.mjs not found');
      return false;
    }
    
    const configContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Check for common helpful settings
    const hasHttpAgentOptions = configContent.includes('httpAgentOptions');
    const hasExperimental = configContent.includes('experimental');
    
    if (!hasHttpAgentOptions) {
      console.log('ℹ️  Consider adding httpAgentOptions with keepAlive: true to next.config.mjs');
    } else {
      console.log('✅ httpAgentOptions detected in Next.js config');
    }
    
    if (!hasExperimental) {
      console.log('ℹ️  Consider adding experimental options to improve connection handling');
    } else {
      console.log('✅ Experimental options detected in Next.js config');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error checking Next.js config:', error.message);
    return false;
  }
}

// Run all checks
async function runAllChecks() {
  try {
    await checkPortsInUse();
    const dnsOk = await checkDnsResolution();
    const networkOk = await checkNetworkInterfaces();
    const nodeOk = await checkNodeConfig();
    const nextConfigOk = await checkNextConfig();
    
    console.log('\n📋 Connection Diagnostic Summary:');
    console.log('====================================================');
    
    if (dnsOk && networkOk && nodeOk && nextConfigOk) {
      console.log('✅ All checks passed! Your environment should be ready to run the development server.');
      console.log('   To start the server, run: ./start-improved.sh');
      process.exit(0);
    } else {
      console.log('⚠️  Some checks found potential issues that might cause connection problems.');
      console.log('   Review the messages above and address any issues before starting the server.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running diagnostics:', error);
    process.exit(1);
  }
}

runAllChecks();
