import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ImageOptimizationOptions {
  quality: number;
  width: number;
  height: number;
  format: 'webp' | 'jpeg';
}

async function optimizeHeroImage(): Promise<void> {
  const inputPath = path.join(__dirname, '../attached_assets/From tortillas with Love   photo credit @andersson_samd_1751272348650.jpg');
  const outputDir = path.join(__dirname, '../public/images');
  
  // Criar diretório se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    const optimizations: Array<ImageOptimizationOptions & { filename: string }> = [
      // Versão desktop WebP (1920x1080)
      { quality: 85, width: 1920, height: 1080, format: 'webp', filename: 'hero-desktop.webp' },
      // Versão mobile WebP (768x432) - 50% menor
      { quality: 80, width: 768, height: 432, format: 'webp', filename: 'hero-mobile.webp' },
      // Versão fallback JPG desktop
      { quality: 85, width: 1920, height: 1080, format: 'jpeg', filename: 'hero-desktop.jpg' },
      // Versão fallback JPG mobile
      { quality: 80, width: 768, height: 432, format: 'jpeg', filename: 'hero-mobile.jpg' }
    ];

    for (const opt of optimizations) {
      const outputPath = path.join(outputDir, opt.filename);
      const processor = sharp(inputPath).resize(opt.width, opt.height, { fit: 'cover' });
      
      if (opt.format === 'webp') {
        await processor.webp({ quality: opt.quality }).toFile(outputPath);
      } else {
        await processor.jpeg({ quality: opt.quality }).toFile(outputPath);
      }
      
      console.log(`✅ Generated ${opt.filename} (${opt.width}x${opt.height}, ${opt.format.toUpperCase()})`);
    }
    
    console.log('🖼️ All hero images optimized successfully!');
    
  } catch (error) {
    console.error('❌ Error optimizing images:', (error as Error).message);
    process.exit(1);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeHeroImage();
}

export { optimizeHeroImage };