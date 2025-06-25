#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Next.js development server...');

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '3000';

// Change to project directory
process.chdir(__dirname);

// Start Next.js
const nextProcess = spawn('npx', ['next', 'dev', '--port', process.env.PORT], {
  stdio: 'inherit',
  cwd: __dirname,
  env: process.env
});

nextProcess.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
});

nextProcess.on('error', (err) => {
  console.error('Failed to start Next.js:', err);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  nextProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  nextProcess.kill('SIGTERM');
  process.exit(0);
});
