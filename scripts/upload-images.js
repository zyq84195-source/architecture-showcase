const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://klqucgcddojygevewnqv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscXVjZ2NkZG9qeWdldmV3bnF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQ5ODYyMywiZXhwIjoyMDk0MDc0NjIzfQ.2XzJKjUFX8Mid8fcPwc7-e6CANkSWTTGu2oY1V2WZAA';

async function createBucket() {
  console.log('📦 Creating storage bucket...');
  
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: 'case-images',
      name: 'case-images',
      public: true,
      file_size_limit: 10485760, // 10MB
    }),
  });

  if (res.ok) {
    console.log('✅ Bucket created');
  } else {
    const text = await res.text();
    if (text.includes('already exists')) {
      console.log('✅ Bucket already exists');
    } else {
      console.error('❌ Bucket error:', text);
    }
  }
}

async function uploadImage(filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(fileName).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/webp';

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/case-images/${fileName}`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': contentType,
    },
    body: fileBuffer,
  });

  if (res.ok) {
    return true;
  } else {
    const text = await res.text();
    // Try upsert if already exists
    if (text.includes('already exists')) {
      const updateRes = await fetch(`${SUPABASE_URL}/storage/v1/object/case-images/${fileName}`, {
        method: 'PUT',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': contentType,
        },
        body: fileBuffer,
      });
      return updateRes.ok;
    }
    console.error(`  ❌ Upload ${fileName}: ${text}`);
    return false;
  }
}

async function main() {
  await createBucket();

  const imagesDir = path.join(__dirname, '..', 'public', 'images', 'cases');
  const files = fs.readdirSync(imagesDir).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
  console.log(`\n📂 Found ${files.length} images to upload\n`);

  let uploaded = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(imagesDir, file);
    const sizeMB = fs.statSync(filePath).size / 1024 / 1024;
    
    process.stdout.write(`[${i+1}/${files.length}] ${file} (${sizeMB.toFixed(1)}MB)...`);
    
    const ok = await uploadImage(filePath, file);
    if (ok) {
      uploaded++;
      console.log(' ✅');
    } else {
      failed++;
      console.log(' ❌');
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 Upload Summary:`);
  console.log(`   ✅ Uploaded: ${uploaded}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📦 Total: ${files.length}`);

  // Print public URL format
  console.log(`\n🔗 Public URL format:`);
  console.log(`   ${SUPABASE_URL}/storage/v1/object/public/case-images/<filename>`);
}

main().catch(console.error);
