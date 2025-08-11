import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.join(__dirname, '..', '.htaccess');
const targetFile = path.join(__dirname, '..', 'dist', '.htaccess');

try {
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log('✅ .htaccess file copied successfully to dist/');
  } else {
    console.log('⚠️  .htaccess file not found, skipping copy');
  }
} catch (error) {
  console.error('❌ Error copying .htaccess file:', error.message);
  process.exit(1);
}

