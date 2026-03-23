/**
 * 图片上传函数
 *
 * 用途：将本地图片上传到 Supabase Storage
 * 使用方法：node scripts/upload-image.js <local_path> <bucket_name>
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ 错误：请设置 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImage(localPath, bucketName = 'cases_images') {
  try {
    // 读取文件
    const fileContent = fs.readFileSync(localPath);
    const fileName = path.basename(localPath);

    // 上传到 Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(`cases/${Date.now()}-${fileName}`, fileContent, {
        contentType: getMimeType(localPath),
        upsert: false
      });

    if (error) {
      throw error;
    }

    // 获取公开 URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return {
      success: true,
      fileName,
      url: publicUrl
    };

  } catch (error) {
    return {
      success: false,
      fileName: path.basename(localPath),
      error: error.message
    };
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// 命令行使用
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('使用方法: node scripts/upload-image.js <local_path> [bucket_name]');
    console.log('示例: node scripts/upload-image.js /path/to/image.png cases_images');
    process.exit(1);
  }

  const localPath = args[0];
  const bucketName = args[1] || 'cases_images';

  if (!fs.existsSync(localPath)) {
    console.error(`❌ 文件不存在: ${localPath}`);
    process.exit(1);
  }

  console.log(`📤 上传图片: ${localPath}`);
  console.log(`📦 存储桶: ${bucketName}\n`);

  uploadImage(localPath, bucketName)
    .then(result => {
      if (result.success) {
        console.log('✅ 上传成功！');
        console.log(`   文件名: ${result.fileName}`);
        console.log(`   URL: ${result.url}`);
      } else {
        console.error('❌ 上传失败');
        console.error(`   错误: ${result.error}`);
        process.exit(1);
      }
    });
}

module.exports = { uploadImage };
