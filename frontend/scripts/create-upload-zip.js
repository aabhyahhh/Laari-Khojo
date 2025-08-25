import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');
const zipPath = path.join(__dirname, '..', 'hostinger-upload.zip');

console.log('📦 Creating upload zip file for Hostinger...\n');

try {
  // Check if dist folder exists
  if (!fs.existsSync(distPath)) {
    console.error('❌ dist folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Remove existing zip if it exists
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
    console.log('🗑️  Removed existing zip file');
  }

  // Create zip file with all contents including hidden files
  console.log('📁 Creating zip file...');
  execSync(`cd "${distPath}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });

  // Verify zip contents
  console.log('\n🔍 Verifying zip contents...');
  const zipContents = execSync(`unzip -l "${zipPath}"`, { encoding: 'utf8' });
  
  console.log('📋 Zip file contents:');
  console.log(zipContents);

  // Check if .htaccess is in the zip
  if (zipContents.includes('.htaccess')) {
    console.log('\n✅ .htaccess file is included in the zip!');
  } else {
    console.log('\n❌ .htaccess file is missing from the zip!');
  }

  const stats = fs.statSync(zipPath);
  console.log(`\n📦 Zip file created: hostinger-upload.zip (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log('\n🎉 Ready for upload to Hostinger!');
  console.log('\n📤 Upload Instructions:');
  console.log('1. Upload the hostinger-upload.zip file to your Hostinger file manager');
  console.log('2. Extract the zip file in your public_html directory');
  console.log('3. Make sure all files are extracted properly');
  console.log('4. The .htaccess file should now be visible and working');

} catch (error) {
  console.error('❌ Error creating zip file:', error.message);
  process.exit(1);
}

