import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');
const htaccessPath = path.join(distPath, '.htaccess');
const visibleHtaccessPath = path.join(distPath, 'RENAME_TO_DOT_HTACCESS');

console.log('🔧 Creating visible htaccess file for Hostinger...\n');

try {
  // Check if .htaccess exists
  if (!fs.existsSync(htaccessPath)) {
    console.error('❌ .htaccess file not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Read the .htaccess content
  const htaccessContent = fs.readFileSync(htaccessPath, 'utf8');

  // Create a very visible file with clear instructions
  const visibleContent = `# ============================================
# IMPORTANT: RENAME THIS FILE TO .htaccess
# ============================================
#
# This file contains the Apache configuration needed for your React app.
# After uploading to Hostinger, you MUST rename this file to ".htaccess"
#
# INSTRUCTIONS:
# 1. Upload this file to your Hostinger public_html directory
# 2. In Hostinger file manager, click on this file
# 3. Click "Rename" or "Edit" 
# 4. Change the name from "RENAME_TO_DOT_HTACCESS" to ".htaccess"
# 5. Make sure there is a dot (.) at the beginning of the filename
# 6. Save the changes
#
# WARNING: If you don't rename this file, your React app will show 404 errors!
#
# ============================================
# ACTUAL .htaccess CONTENT BELOW:
# ============================================

${htaccessContent}`;

  fs.writeFileSync(visibleHtaccessPath, visibleContent);
  console.log('✅ Created visible htaccess file: RENAME_TO_DOT_HTACCESS');
  console.log('📝 This file contains clear instructions and the actual .htaccess content');

  // Also create a simple copy for easier renaming
  const simpleCopyPath = path.join(distPath, 'htaccess');
  fs.copyFileSync(htaccessPath, simpleCopyPath);
  console.log('✅ Created simple copy: htaccess (rename to .htaccess)');

  console.log('\n📤 UPLOAD INSTRUCTIONS:');
  console.log('1. Upload ALL files from the dist/ folder to Hostinger');
  console.log('2. Look for the file named "RENAME_TO_DOT_HTACCESS"');
  console.log('3. In Hostinger file manager, rename it to ".htaccess"');
  console.log('4. OR use the file named "htaccess" and rename it to ".htaccess"');
  console.log('5. The file MUST be named exactly ".htaccess" (with the dot)');

  console.log('\n⚠️  CRITICAL:');
  console.log('- The file MUST be named ".htaccess" (with the dot) to work');
  console.log('- "htaccess.txt" will NOT work for Apache configuration');
  console.log('- After renaming, your React app should work properly');
  console.log('- If you see "htaccess.txt" in your file manager, rename it to ".htaccess"');

} catch (error) {
  console.error('❌ Error creating visible htaccess file:', error.message);
  process.exit(1);
}

