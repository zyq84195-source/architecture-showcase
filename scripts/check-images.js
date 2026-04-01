const fs = require('fs');
const path = require('path');

const IMAGES_FOLDER = 'C:/Users/zyq15/Desktop/案例图片';

console.log('Start checking images folder...');
console.log('Images folder:', IMAGES_FOLDER);

try {
  if (!fs.existsSync(IMAGES_FOLDER)) {
    console.error('Images folder does not exist:', IMAGES_FOLDER);
    process.exit(1);
  }

  console.log('Images folder exists');
  const files = fs.readdirSync(IMAGES_FOLDER);
  console.log('Total files:', files.length);
  
  const pngFiles = files.filter(f => f.endsWith('.png'));
  console.log('PNG files:', pngFiles.length);

  console.log('File list:');
  pngFiles.slice(0, 20).forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });

  console.log('Total cases:', Math.ceil(pngFiles.length / 6));
  console.log('');
  console.log('File naming pattern detected:');
  console.log('- Pattern: C[案例编号]_[序号]_[type].png');
  console.log('- Main image: C[案例编号]_main.png');
  console.log('- Other images: C[案例编号]_[1,2,3,4,5].png');

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
