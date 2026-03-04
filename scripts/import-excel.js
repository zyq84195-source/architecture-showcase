const xlsx = require('xlsx');
const fs = require('fs');

// 读取Excel文件
const workbook = xlsx.readFile('C:/Users/zyq15/Desktop/案例.xlsx');

// 获取第一个工作表
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 转换为JSON
const jsonData = xlsx.utils.sheet_to_json(worksheet);

// 输出数据
console.log('总行数:', jsonData.length);
console.log('\n字段列表:', Object.keys(jsonData[0] || {}));
console.log('\n前2条数据:');
console.log(JSON.stringify(jsonData.slice(0, 2), null, 2));

// 保存为JSON文件
const outputPath = 'public/data/cases-from-excel.json';
fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
console.log('\n已保存到:', outputPath);
