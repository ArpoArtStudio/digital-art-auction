// This file is a workaround for module compatibility issues
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    esModuleInterop: true
  }
});

// Import the server
require('./server/index.ts');
