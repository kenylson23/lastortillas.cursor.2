import { execSync } from 'child_process';

console.log('🚀 Emergency build without timeouts...');

try {
  // Use development mode to avoid heavy optimization
  console.log('📦 Building in development mode...');
  execSync('NODE_ENV=development npx vite build --mode development --minify false', { 
    stdio: 'inherit'
  });
  
  console.log('✅ Emergency build completed!');
  
} catch (error) {
  console.error('❌ Emergency build failed:', error.message);
  process.exit(1);
}