import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');

console.log('🔍 Verifying dist folder contents for Hostinger upload...\n');

try {
  // Check if dist folder exists
  if (!fs.existsSync(distPath)) {
    console.error('❌ dist folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  // List all files including hidden ones
  const files = fs.readdirSync(distPath, { withFileTypes: true });
  
  console.log('📋 Files in dist/ directory:');
  let hasHtaccess = false;
  let hasIndexHtml = false;
  let hasAssets = false;

  files.forEach(file => {
    const filePath = path.join(distPath, file.name);
    const stats = fs.statSync(filePath);
    const isDir = file.isDirectory() ? '📁' : '📄';
    const size = stats.size;
    
    console.log(`   ${isDir} ${file.name} (${size} bytes)`);
    
    if (file.name === '.htaccess') {
      hasHtaccess = true;
      console.log(`      ✅ .htaccess file found - REQUIRED for Hostinger`);
    }
    
    if (file.name === 'index.html') {
      hasIndexHtml = true;
      console.log(`      ✅ index.html file found - REQUIRED for hosting`);
    }
    
    if (file.name === 'assets' && file.isDirectory()) {
      hasAssets = true;
      console.log(`      ✅ assets folder found - Contains CSS/JS files`);
    }
  });

  console.log('\n📦 Upload Instructions:');
  console.log('1. Upload ALL files from the dist/ folder to your Hostinger public_html directory');
  console.log('2. Make sure to include the .htaccess file (it may be hidden in your file manager)');
  console.log('3. Upload the entire assets/ folder as well');
  console.log('4. Ensure file permissions are correct (644 for files, 755 for folders)');

  console.log('\n⚠️  Important Notes:');
  console.log('- The .htaccess file is REQUIRED for proper routing');
  console.log('- If you don\'t see .htaccess in your file manager, enable "Show hidden files"');
  console.log('- On macOS Finder: Cmd + Shift + . (dot) to show hidden files');
  console.log('- On Windows: Enable "Show hidden files" in folder options');

  if (hasHtaccess && hasIndexHtml && hasAssets) {
    console.log('\n✅ All required files are present! Ready for upload.');
  } else {
    console.log('\n❌ Missing required files. Please run "npm run build" again.');
  }

} catch (error) {
  console.error('❌ Error verifying files:', error.message);
  process.exit(1);
}

