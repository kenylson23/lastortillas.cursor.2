import { execSync } from 'child_process';

console.log('🚀 Building frontend only...');

try {
  execSync('npx vite build --logLevel warn', { stdio: 'inherit' });
  console.log('✅ Build completed!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}