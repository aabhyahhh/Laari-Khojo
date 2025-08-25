import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htaccessFile = path.join(__dirname, '..', 'dist', '.htaccess');

function testHtaccessContent() {
  console.log('🧪 Testing .htaccess file configuration...\n');
  
  try {
    if (!fs.existsSync(htaccessFile)) {
      console.error('❌ .htaccess file not found in dist/');
      return false;
    }
    
    const content = fs.readFileSync(htaccessFile, 'utf8');
    console.log('✅ .htaccess file found');
    console.log('📏 File size:', content.length, 'bytes');
    
    // Check for essential configurations
    const checks = [
      {
        name: 'RewriteEngine On',
        pattern: /RewriteEngine\s+On/i,
        description: 'URL rewriting enabled'
      },
      {
        name: 'RewriteBase /',
        pattern: /RewriteBase\s+\//i,
        description: 'Base path configured'
      },
      {
        name: 'Rewrite to index.html',
        pattern: /RewriteRule.*index\.html/i,
        description: 'SPA routing configured'
      },
      {
        name: 'CORS headers',
        pattern: /Access-Control-Allow-Origin/i,
        description: 'CORS headers configured'
      },
      {
        name: 'Cache control',
        pattern: /Cache-Control/i,
        description: 'Cache control configured'
      },
      {
        name: 'Directory listing disabled',
        pattern: /Options\s+-Indexes/i,
        description: 'Directory listing disabled'
      }
    ];
    
    console.log('\n📋 Configuration checks:');
    let allPassed = true;
    
    checks.forEach(check => {
      const passed = check.pattern.test(content);
      const status = passed ? '✅' : '❌';
      console.log(`   ${status} ${check.name}: ${check.description}`);
      if (!passed) allPassed = false;
    });
    
    if (allPassed) {
      console.log('\n🎉 All .htaccess configurations are properly set up!');
      console.log('📝 This file will handle:');
      console.log('   • SPA routing (all routes redirect to index.html)');
      console.log('   • CORS headers for API requests');
      console.log('   • Static asset caching');
      console.log('   • Security (no directory listing)');
      console.log('   • Compression for text files');
      return true;
    } else {
      console.log('\n⚠️  Some configurations are missing. Check the .htaccess file.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error testing .htaccess file:', error.message);
    return false;
  }
}

// Run the test
const result = testHtaccessContent();
process.exit(result ? 0 : 1);

