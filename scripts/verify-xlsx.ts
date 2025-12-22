
import * as XLSX from 'xlsx';

// Create a simple workbook
const wb = XLSX.utils.book_new();
const wsProxy = XLSX.utils.json_to_sheet([
    { "Unit": "101", "Tenant": "Alice", "Rent": 1500 },
    { "Unit": "102", "Tenant": "Bob", "Rent": 1600 }
]);
XLSX.utils.book_append_sheet(wb, wsProxy, "Rent Roll");

// Write to buffer (simulating an uploaded file)
const fileBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

console.log("Simulating Excel file upload...");
console.log(`Created buffer of size: ${fileBuffer.length} bytes`);

// Now simulate the reading logic from document-parser.ts
console.log("Attempting to read buffer with XLSX...");
const readWb = XLSX.read(fileBuffer, { type: 'buffer' });
const firstSheet = readWb.SheetNames[0];
const worksheet = readWb.Sheets[firstSheet];
const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

console.log("\n--- Extracted CSV Content ---");
console.log(csvOutput);
console.log("-----------------------------\n");

if (csvOutput.includes("Alice") && csvOutput.includes("1600")) {
    console.log("✅ SUCCESS: XLSX library is working and extracting data correctly.");
} else {
    console.error("❌ FAILURE: Extracted data does not match input.");
    process.exit(1);
}
