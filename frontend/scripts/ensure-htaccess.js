import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.join(__dirname, '..', '.htaccess');
const targetFile = path.join(__dirname, '..', 'dist', '.htaccess');
const backupFile = path.join(__dirname, '..', 'dist', 'htaccess.txt');

try {
  console.log('🔧 Ensuring .htaccess file is properly copied...\n');
  
  // Check if source file exists
  if (!fs.existsSync(sourceFile)) {
    console.error('❌ Source .htaccess file not found at:', sourceFile);
    process.exit(1);
  }
  
  console.log('✅ Source .htaccess file found');
  
  // Copy .htaccess file
  fs.copyFileSync(sourceFile, targetFile);
  console.log('✅ .htaccess file copied to dist/');
  
  // Also create a visible backup copy
  fs.copyFileSync(sourceFile, backupFile);
  console.log('✅ Backup copy created as htaccess.txt');
  
  // Verify the files exist
  if (fs.existsSync(targetFile)) {
    const stats = fs.statSync(targetFile);
    console.log('✅ .htaccess file verified in dist/');
    console.log('   Size:', stats.size, 'bytes');
    console.log('   Last modified:', stats.mtime);
  } else {
    console.error('❌ .htaccess file not found in dist/ after copy');
  }
  
  if (fs.existsSync(backupFile)) {
    console.log('✅ Backup file htaccess.txt created');
  }
  
  console.log('\n📋 Files in dist/ directory:');
  const distFiles = fs.readdirSync(path.join(__dirname, '..', 'dist'));
  distFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', 'dist', file);
    const stats = fs.statSync(filePath);
    const isDir = stats.isDirectory() ? '📁' : '📄';
    console.log(`   ${isDir} ${file} (${stats.size} bytes)`);
  });
  
  console.log('\n🎉 .htaccess setup completed successfully!');
  
} catch (error) {
  console.error('❌ Error ensuring .htaccess file:', error.message);
  process.exit(1);
}

