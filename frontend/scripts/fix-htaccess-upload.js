import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');
const htaccessPath = path.join(distPath, '.htaccess');
const visibleHtaccessPath = path.join(distPath, 'htaccess_rename_to_dot_htaccess');

console.log('🔧 Creating visible htaccess file for Hostinger upload...\n');

try {
  // Check if .htaccess exists
  if (!fs.existsSync(htaccessPath)) {
    console.error('❌ .htaccess file not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Create a visible copy with instructions
  const htaccessContent = fs.readFileSync(htaccessPath, 'utf8');
  const visibleContent = `# IMPORTANT: Rename this file to .htaccess after uploading to Hostinger
# This file contains the Apache configuration needed for your React app
# 
# Instructions:
# 1. Upload this file to your Hostinger public_html directory
# 2. In your Hostinger file manager, rename this file from "htaccess_rename_to_dot_htaccess" to ".htaccess"
# 3. Make sure the file is named exactly ".htaccess" (with the dot at the beginning)
# 4. This file is required for proper routing of your React application
#
# Original .htaccess content:
${htaccessContent}`;

  fs.writeFileSync(visibleHtaccessPath, visibleContent);
  console.log('✅ Created visible htaccess file: htaccess_rename_to_dot_htaccess');
  console.log('📝 This file contains instructions and the actual .htaccess content');

  // Also create a simple copy without instructions
  const simpleCopyPath = path.join(distPath, 'htaccess_file');
  fs.copyFileSync(htaccessPath, simpleCopyPath);
  console.log('✅ Created simple copy: htaccess_file');

  console.log('\n📤 Upload Instructions:');
  console.log('1. Upload ALL files from the dist/ folder to Hostinger');
  console.log('2. Look for the file named "htaccess_rename_to_dot_htaccess"');
  console.log('3. In Hostinger file manager, rename it to ".htaccess" (with the dot)');
  console.log('4. Or use the simpler "htaccess_file" and rename it to ".htaccess"');
  console.log('5. Make sure the file is named exactly ".htaccess" (not "htaccess.txt")');

  console.log('\n⚠️  Important:');
  console.log('- The file MUST be named ".htaccess" (with the dot) to work');
  console.log('- "htaccess.txt" will NOT work for Apache configuration');
  console.log('- After renaming, your React app should work properly');

} catch (error) {
  console.error('❌ Error creating visible htaccess file:', error.message);
  process.exit(1);
}

