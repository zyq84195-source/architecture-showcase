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

  const workbook = XLSX.readFile(EXCEL_PATH);

  if (!workbook.Sheets || workbook.Sheets.length === 0) {
    console.error('Excel file is empty or has no worksheets');
    process.exit(1);
  }

  const worksheet = workbook.Sheets[0];
  console.log('Worksheet name:', worksheet.name);
  console.log('Row count:', worksheet.rowCount);

  // Read first 10 rows
  const sampleData = [];
  for (let rowIndex = 1; rowIndex <= Math.min(10, worksheet.rowCount); rowIndex++) {
    const row = worksheet.getRow(rowIndex);
    const cell1 = row.getCell(1);
    const cell2 = row.getCell(2);
    const cell3 = row.getCell(3);
    const cell4 = row.getCell(4);
    const cell5 = row.getCell(5);

    const caseData = {
      id: `excel_${String(rowIndex).padStart(3, '0')}`,
      title: cell1 ? cell1.value : '',
      description: cell2 ? cell2.value : '',
      architect: cell3 ? cell3.value : '',
      location: cell4 ? cell4.value : '',
      tags: cell5 ? cell5.value.split(',').map(tag => tag.trim()) : [],
      likes_count: 0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
    };

    sampleData.push(caseData);
  }

  console.log('Sample data (first 10 rows):');
  console.log(JSON.stringify(sampleData, null, 2));
  console.log('');
  console.log('Total rows:', worksheet.rowCount);
  console.log('Excel file format: Title, Description, Architect, Location, Tags');
  process.exit(0);

} catch (error) {
  console.error('Failed to read Excel file:', error.message);
  process.exit(1);
}
