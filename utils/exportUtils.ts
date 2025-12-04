
import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[][], fileName: string, sheetName: string = 'Sheet1') => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToCSV = (data: any[][], fileName: string) => {
  // Simple CSV generation handling arrays of arrays
  const csvContent = "data:text/csv;charset=utf-8," 
      + data.map(e => e.map(field => {
          // Handle commas in fields by wrapping in quotes
          const stringField = String(field);
          return stringField.includes(',') ? `"${stringField}"` : stringField;
      }).join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
