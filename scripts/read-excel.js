const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_PATH = 'C:/Users/zyq15/Desktop/案例.xlsx';

console.log('Start reading Excel file...');
console.log('Excel path:', EXCEL_PATH);

try {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('Excel file does not exist:', EXCEL_PATH);
    process.exit(1);
  }

  console.log('Excel file exists');
  const workbook = XLSX.readFile(EXCEL_PATH);

  if (!workbook.Sheets || workbook.Sheets.length === 0) {
    console.error('Excel file is empty or has no worksheets');
    process.exit(1);
  }

  const worksheet = workbook.Sheets[0];
  console.log('Worksheet name:', worksheet.name);
  console.log('Row count:', worksheet.rowCount);

  // Read first 10 rows as sample
  const sampleData = [];
  for (let rowIndex = 1; rowIndex <= Math.min(10, worksheet.rowCount); rowIndex++) {
    const row = worksheet.getRow(rowIndex);

    const caseData = {
      id: `excel_${String(rowIndex).padStart(3, '0')}`,
      title: row.getCell(1)?.value || '',
      description: row.getCell(2)?.value || '',
      architect: row.getCell(3)?.value || '',
      location: row.getCell(4)?.value || '',
      tags: row.getCell(5)?.value ? row.getCell(5).value.split(',').map(tag => tag.trim()) : [],
      likes_count: 0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
    };

    sampleData.push(caseData);
  }

  console.log('Sample data (first 10 rows):');
  console.log(JSON.stringify(sampleData, null, 2));
  console.log('Total rows:', worksheet.rowCount);

  process.exit(0);

} catch (error) {
  console.error('Failed to read Excel file:', error.message);
  process.exit(1);
}
