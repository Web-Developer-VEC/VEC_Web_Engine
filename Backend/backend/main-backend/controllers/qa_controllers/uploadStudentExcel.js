const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
const Busboy = require('busboy');
const { getDb } = require('../../config/db');


// Helper function to extract department from programme
function extractDepartment(programme) {
    if (!programme) return 'Unknown';
    
    let dept = programme.replace(/B\.Tech\./gi, '').trim();
    dept = dept.replace(/M\.Tech\./gi, '').trim();
    dept = dept.replace(/B\.E\./gi, '').trim();
    dept = dept.toUpperCase();
    return dept || 'Unknown';
}

// Helper function to convert scientific notation to full number string
function parseRegisterNumber(value) {
    if (!value) return '';
    
    // Convert to string first
    let str = String(value);
    
    // Check if it's in scientific notation (contains 'E' or 'e')
    if (str.includes('E') || str.includes('e')) {
        // Parse as float and convert to fixed string without decimals
        const num = parseFloat(str);
        // Convert to string without scientific notation
        str = num.toFixed(0);
    }
    
    return str.trim();
}

// Helper function to convert Excel serial date to DD-MM-YYYY
function excelSerialToDate(serial) {
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = serial - 2;
    const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
}

// Helper function to check if value is a Date string
function isDateString(str) {
    if (typeof str !== 'string') return false;
    return str.includes('GMT') || str.includes('IST') || str.match(/^\w{3}\s\w{3}\s\d{2}\s\d{4}/);
}

// Helper function to check if string is DD-MM-YYYY or DD/MM/YYYY
function isValidDateFormat(str) {
    if (typeof str !== 'string') return false;
    const datePattern = /^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/;
    return datePattern. test(str. trim());
}

// Normalize date string to DD-MM-YYYY
function normalizeDateString(str) {
    let normalized = str.replace(/\//g, '-');
    const parts = normalized.split('-');
    if (parts.length === 3) {
        const day = parts[0]. padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${day}-${month}-${year}`;
    }
    return normalized;
}

// Comprehensive DOB formatting function
function formatDOB(dob) {
    
    if (! dob || dob === '') {
        return 'nil';
    }
    
    // Convert to string for processing
    const dobString = String(dob).trim();
    
    // CASE 1: Check if it's a Date string (like "Wed Mar 01 2006...")
    if (isDateString(dobString)) {
        try {
            const parsedDate = new Date(dobString);
            if (!isNaN(parsedDate.getTime())) {
                const day = String(parsedDate.getDate()).padStart(2, '0');
                const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                const year = parsedDate.getFullYear();
                const formatted = `${day}-${month}-${year}`;
                return formatted;
            }
        } catch (e) {
        }
    }
    
    // CASE 2: Already in DD-MM-YYYY or DD/MM/YYYY format
    if (isValidDateFormat(dobString)) {
        const normalized = normalizeDateString(dobString);
        return normalized;
    }
    
    // CASE 3: Check if it's a number (Excel serial)
    const numValue = parseFloat(dobString);
    if (!isNaN(numValue) && numValue > 10000 && numValue < 60000) {
        // Only convert to date if it's in a reasonable range for DOB
        // 10000 = 1927-05-18, 60000 = 2064-04-07
        // This excludes small numbers like 1234
        const formatted = excelSerialToDate(numValue);
        return formatted;
    }
    
    // CASE 4: Return as-is for other formats (like "1234" or small numbers)
    return dobString || '01-01-1990';
}
// Helper function to check file extension
function getFileExtension(filename) {
    if (!filename) return '';
    const ext = filename.toLowerCase().split('.').pop();
    return ext;
}

// Convert any Excel format to . xlsx using XLSX library
async function convertToXLSX(fileBuffer, ext) {
    
    try {
        // Read with cellDates false to keep dates as serial numbers
        const workbook = XLSX.read(fileBuffer, { 
            type: 'buffer',
            cellDates: false,  // CRITICAL: Keep as serial numbers
            cellNF: false,
            cellText: false,
            raw: true
        });
        
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Log cell types for debugging
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        
        // Convert sheet to JSON to preserve raw values with more control
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,  // Return array of arrays
            raw: true,  // Keep numbers as numbers, don't convert
            dateNF: false,  // Don't format dates
            defval: '',
            blankrows: false
        });
        
        console. log(`📋 Extracted ${jsonData.length} rows`);
        
      
        // Create new workbook with raw values - NO date conversion
        const newWorkbook = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.aoa_to_sheet(jsonData);
        
        // Force all cells to be treated as general/text, not dates
        const newRange = XLSX.utils.decode_range(newWorksheet['!ref']);
        for (let R = newRange.s.r; R <= newRange.e.r; ++R) {
            for (let C = newRange.s.c; C <= newRange.e. c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = newWorksheet[cellAddress];
                if (cell && cell.t === 'd') {  // If it's a date type
                    // Convert date to numeric value
                    cell.t = 'n';  // Change type to number
                    cell. z = '0';  // Remove date format
                }
            }
        }
        
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Worksheet');
        
        // Write as .xlsx buffer - NO date conversion
        const xlsxBuffer = XLSX.write(newWorkbook, { 
            type: 'buffer', 
            bookType: 'xlsx',
            cellDates: false,  // CRITICAL
            bookSST: false
        });
        
        console. log(`✅ Conversion successful. New buffer size: ${xlsxBuffer.length} bytes`);
        return xlsxBuffer;
    } catch (error) {
        console.error(`❌ Error converting .${ext} to .xlsx:`, error.message);
        throw new Error(`Failed to convert .${ext} file to .xlsx format: ${error.message}`);
    }
}

// Process Excel file using ExcelJS
async function processExcelFile(fileBuffer) {
    
    const workbook = new ExcelJS. Workbook();
    await workbook.xlsx.load(fileBuffer);
    
    const worksheet = workbook.worksheets[0];
    
    if (!worksheet) {
        console.error('❌ No worksheet found in Excel file');
        throw new Error('No worksheet found in Excel file');
    }
    
    
    const data = [];
    const headerRow = worksheet.getRow(1);
    const headers = [];
    
    // Extract headers
    headerRow.eachCell((cell, colNumber) => {
        let headerValue = cell.value;
        if (headerValue && typeof headerValue === 'object' && headerValue.text) {
            headerValue = headerValue.text;
        }
        headers[colNumber - 1] = headerValue;
    });
    
    
    // Extract data rows
    worksheet.eachRow((row, rowIndex) => {
        if (rowIndex === 1) return; // Skip header
        
        const rowData = {};
        let hasData = false;
        
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
                let value = cell.value;
                
                // Handle rich text
                if (value && typeof value === 'object' && value.text) {
                    value = value.text;
                } 
                // Handle formula results
                else if (value && typeof value === 'object' && value.result !== undefined) {
                    value = value.result;
                }
                // If it's a Date object - this should NOT happen after our conversion
                else if (value instanceof Date) {
                    // Try to recover - use the numeric value if possible
                    value = value;
                }
                
                rowData[header] = value !== undefined && value !== null ? value : '';
                if (value !== undefined && value !== null && value !== '') hasData = true;
            }
        });
        
        if (hasData) {
            data. push(rowData);
        }
    });
    
    
    return { data };
}

const uploadStudentExcel = async (req, res) => {

    try {
        const busboy = Busboy({ 
            headers: req.headers,
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB limit
                files: 1
            }
        });

        let fileProcessed = false;
        let responseSent = false;
        let processingStarted = false;
        const fileBuffers = [];
        let uploadedFilename = '';

        busboy.on('file', (fieldname, file, info) => {
            const { filename, encoding, mimeType } = info;
            uploadedFilename = filename;
            processingStarted = true;

            // Validate file extension - Support multiple formats
            const ext = getFileExtension(filename);
            const allowedExtensions = ['xlsx', 'xls', 'xlsm', 'csv'];
            
            if (!allowedExtensions. includes(ext)) {
                console.error(`❌ Invalid file type: . ${ext}`);
                console.error(`   Allowed types: ${allowedExtensions.join(', ')}`);
                file.resume();
                if (! responseSent) {
                    responseSent = true;
                    return res.status(400).json({
                        success: false,
                        message:  `Invalid file type.  Allowed:  ${allowedExtensions.join(', ')}. Received: .${ext}`
                    });
                }
                return;
            }
            

            // Collect file data into buffer
            file.on('data', (data) => {
                fileBuffers.push(data);
            });

            file.on('limit', () => {
                console.error('❌ File size limit exceeded (10MB)');
                if (!responseSent) {
                    responseSent = true;
                    return res.status(400).json({
                        success: false,
                        message: 'File size exceeds 10MB limit'
                    });
                }
            });

            file.on('end', async () => {
                if (responseSent || fileProcessed) return;

                try {
                    
                    // Combine all chunks into single buffer
                    const fileBuffer = Buffer.concat(fileBuffers);

                    if (fileBuffer.length === 0) {
                        console.error('❌ Uploaded file is empty');
                        if (!responseSent) {
                            responseSent = true;
                            return res.status(400).json({
                                success: false,
                                message: 'Uploaded file is empty'
                            });
                        }
                        return;
                    }

                    // Convert to . xlsx if needed
                    let processBuffer = fileBuffer;
                    const ext = getFileExtension(uploadedFilename);
                    
                    if (ext !== 'xlsx') {
                        processBuffer = await convertToXLSX(fileBuffer, ext);
                    } else {
                    }

                    // Process the Excel file
                    const result = await processExcelFile(processBuffer);
                    const data = result.data;


                    if (data.length === 0) {
                        console.error('❌ No data found in Excel file');
                        if (!responseSent) {
                            responseSent = true;
                            return res.status(400).json({
                                success: false,
                                message: 'No data found in Excel file'
                            });
                        }
                        return;
                    }

                    const db = getDb();
                    const studentsCollection = db.collection('student');

                    const studentsToInsert = [];
                    const errors = [];

                    // Process each row
                    for (let i = 0; i < data.length; i++) {
                        const row = data[i];
                        
                        try {
                            // Extract fields
                            const registerNo = parseRegisterNumber(
                                row['Register No'] || row['RegisterNo'] || row['registerno'] || row['Register no'] || ''
                            );
                            const studentName = row['Student Name'] || row['StudentName'] || row['name'] || row['Name'] || '';
                            const email = row['Email Id'] || row['Email'] || row['email'] || row['Email ID'] || '';
                            const mobile = row['Student Mobile'] || row['Mobile'] || row['phone'] || row['Phone'] || row['Student mobile'] || '';
                            const programme = row['Programme'] || row['Program'] || row['programme'] || row['program'] || '';
                            const batch = row['Batch'] || row['batch'] || '';
                            const dob = row['Date of Birth'] || row['DOB'] || row['dob'] || row['Date Of Birth'] || '';


                            if (!registerNo) {
                                console.error(`   ❌ Missing register number`);
                                errors.push({ 
                                    row: i + 2, 
                                    error: 'Register number is required' 
                                });
                                continue;
                            }

                            // Check for duplicates
                            const existingStudent = await studentsCollection.findOne({ 
                                registerno: String(registerNo).trim()
                            });

                            if (existingStudent) {
                                console.warn(`   ⚠️ Student already exists in database`);
                                errors.push({ 
                                    row: i + 2,
                                    registerNo: String(registerNo).trim(),
                                    error: 'Student already exists' 
                                });
                                continue;
                            }

                            // Create student document
                            const studentDoc = {
                                name: studentName ?  String(studentName).trim() : '',
                                registerno: String(registerNo).trim(),
                                email: email ?  String(email).trim().toLowerCase() : '',
                                phone: mobile ? String(mobile).trim() : '',
                                password: formatDOB(dob),
                                department: extractDepartment(programme),
                                year: 2,
                                batch: batch ? String(batch).trim() : ''
                            };

                            studentsToInsert.push(studentDoc);

                        } catch (error) {
                            console.error(`   ❌ Error processing row:  ${error.message}`);
                            errors.push({ 
                                row: i + 2, 
                                error: error.message 
                            });
                        }
                    }


                    // Insert valid students
                    let insertResult = null;
                    if (studentsToInsert.length > 0) {
                        insertResult = await studentsCollection.insertMany(studentsToInsert);
                    } else {
                    }

                    const response = {
                        success: true,
                        message: 'Excel file processed successfully',
                        stats: {
                            totalRows: data.length,
                            successfulInserts: studentsToInsert. length,
                            failed: errors.length
                        }
                    };

                    if (errors.length > 0) {
                        response.errors = errors;
                    }

                    fileProcessed = true;
                    if (! responseSent) {
                        responseSent = true;
                        return res.status(200).json(response);
                    }

                } catch (error) {
                    console.error('\n❌ ERROR PROCESSING EXCEL FILE:', error);
                    console.error('Stack:', error.stack);
                    if (!responseSent) {
                        responseSent = true;
                        return res.status(500).json({
                            success: false,
                            message: 'Error processing Excel file',
                            error: error.message
                        });
                    }
                }
            });

            file.on('error', (error) => {
                console.error('❌ FILE STREAM ERROR:', error);
                if (! responseSent) {
                    responseSent = true;
                    return res.status(500).json({
                        success: false,
                        message: 'Error reading file',
                        error: error.message
                    });
                }
            });
        });

        busboy.on('field', (fieldname, value) => {
        });

        busboy.on('finish', () => {
            console. log('✅ Busboy finished parsing form data');
            if (!processingStarted) {
                setTimeout(() => {
                    if (! responseSent) {
                        responseSent = true;
                        console.error('❌ No file was uploaded');
                        return res. status(400).json({
                            success: false,
                            message: 'No file uploaded'
                        });
                    }
                }, 100);
            }
        });

        busboy.on('error', (error) => {
            console.error('❌ BUSBOY ERROR:', error);
            if (!responseSent) {
                responseSent = true;
                return res.status(500).json({
                    success: false,
                    message: 'Error uploading file',
                    error:  error.message
                });
            }
        });
        req.pipe(busboy);

    } catch (error) {
        console.error('\n❌ CRITICAL ERROR IN UPLOAD CONTROLLER:', error);
        console.error('Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error processing request',
            error: error.message
        });
    }
};

module.exports = {uploadStudentExcel};