const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
const Busboy = require('busboy');
const { getDb } = require('../../config/db');
console.log('📦 Student Excel Upload Module Loaded');

// Helper function to extract department from programme
function extractDepartment(programme) {
    if (!programme) return 'Unknown';
    
    let dept = programme. replace(/B\.Tech\./gi, '').trim();
    dept = dept.replace(/M\.Tech\./gi, '').trim();
    dept = dept.replace(/B\.E\./gi, '').trim();
    
    console.log(`🏫 Extracted department: "${dept}" from programme: "${programme}"`);
    return dept || 'Unknown';
}

// Helper function to format date of birth (DD-MM-YYYY format)
function formatDOB(dob) {
    if (!dob) {
        console.log('⚠️ No DOB provided, using default:  01-01-1990');
        return '01-01-1990';
    }
    
    try {
        let dateStr = '';
        
        // Handle Date object
        if (dob instanceof Date) {
            const day = String(dob.getDate()).padStart(2, '0');
            const month = String(dob.getMonth() + 1).padStart(2, '0');
            const year = dob.getFullYear();
            dateStr = `${day}-${month}-${year}`;
            console.log(`📅 Formatted Date object: ${dateStr}`);
        }
        // Handle DD-MM-YYYY format string
        else if (typeof dob === 'string' && dob.includes('-')) {
            const parts = dob.split('-');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1]. padStart(2, '0');
                const year = parts[2];
                dateStr = `${day}-${month}-${year}`;
                console.log(`📅 Formatted DD-MM-YYYY string: ${dateStr}`);
            }
        }
        // Handle DD/MM/YYYY format string
        else if (typeof dob === 'string' && dob. includes('/')) {
            const parts = dob.split('/');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                dateStr = `${day}-${month}-${year}`;
                console.log(`📅 Formatted DD/MM/YYYY string: ${dateStr}`);
            }
        }
        // Handle string without separators (DDMMYYYY)
        else if (typeof dob === 'string' && dob.length === 8) {
            dateStr = `${dob.substring(0, 2)}-${dob.substring(2, 4)}-${dob.substring(4, 8)}`;
            console.log(`📅 Formatted DDMMYYYY string: ${dateStr}`);
        }
        
        return dateStr || '01-01-1990';
    } catch (error) {
        console.error('❌ Error formatting DOB:', error);
        return '01-01-1990';
    }
}

// Helper function to check file extension
function getFileExtension(filename) {
    if (!filename) return '';
    const ext = filename.toLowerCase().split('.').pop();
    console.log(`📄 File extension detected: . ${ext}`);
    return ext;
}

// Convert any Excel format to .xlsx using XLSX library
async function convertToXLSX(fileBuffer, ext) {
    console.log(`🔄 Converting . ${ext} to .xlsx format...`);
    
    try {
        // Read the file with XLSX library (supports .xls, .xlsm, . csv, etc.)
        const workbook = XLSX.read(fileBuffer, { 
            type: 'buffer', 
            cellDates: true,
            cellNF: false,
            cellText: false
        });
        
        console.log(`✅ File read successfully.  Sheets found: ${workbook.SheetNames.join(', ')}`);
        
        // Write as .xlsx buffer
        const xlsxBuffer = XLSX.write(workbook, { 
            type: 'buffer', 
            bookType: 'xlsx',
            cellDates: true 
        });
        
        console.log(`✅ Conversion successful. New buffer size: ${xlsxBuffer. length} bytes`);
        return xlsxBuffer;
    } catch (error) {
        console.error(`❌ Error converting . ${ext} to .xlsx:`, error. message);
        throw new Error(`Failed to convert .${ext} file to .xlsx format: ${error. message}`);
    }
}

// Process Excel file using ExcelJS
async function processExcelFile(fileBuffer) {
    console.log('📊 Starting Excel file processing with ExcelJS...');
    
    const workbook = new ExcelJS. Workbook();
    await workbook.xlsx.load(fileBuffer);
    
    const worksheet = workbook.worksheets[0];
    
    if (!worksheet) {
        console.error('❌ No worksheet found in Excel file');
        throw new Error('No worksheet found in Excel file');
    }
    
    console.log(`✅ Worksheet loaded:  "${worksheet.name}" with ${worksheet.rowCount} rows`);
    
    const data = [];
    const headerRow = worksheet.getRow(1);
    const headers = [];
    
    // Extract headers
    headerRow.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value;
    });
    
    console.log(`📋 Headers extracted: ${headers. join(', ')}`);
    
    // Extract data rows
    worksheet.eachRow((row, rowIndex) => {
        if (rowIndex === 1) return; // Skip header
        
        const rowData = {};
        let hasData = false;
        
        row.eachCell((cell, colNumber) => {
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
                // Handle Date objects
                else if (value instanceof Date) {
                    value = value;
                }
                
                rowData[header] = value || '';
                if (value) hasData = true;
            }
        });
        
        if (hasData) {
            data.push(rowData);
        }
    });
    
    console.log(`✅ Data extraction complete. Total data rows: ${data.length}`);
    
    return { data };
}
const uploadStudentExcel = async (req, res) => {

    try {
        console.log('🔧 Initializing Busboy parser...');
        const busboy = Busboy({ 
            headers: req.headers,
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB limit
                files: 1
            }
        });
        console.log('✅ Busboy initialized with 10MB file size limit');

        let fileProcessed = false;
        let responseSent = false;
        let processingStarted = false;
        const fileBuffers = [];
        let uploadedFilename = '';

        busboy.on('file', (fieldname, file, info) => {
            const { filename, encoding, mimeType } = info;
            uploadedFilename = filename;
            processingStarted = true;

            console.log('\n📤 FILE UPLOAD STARTED');
            console.log(`   Field name: ${fieldname}`);
            console.log(`   Filename: ${filename}`);
            console.log(`   MIME Type: ${mimeType}`);
            console.log(`   Encoding: ${encoding}`);

            // Validate file extension - Support multiple formats
            const ext = getFileExtension(filename);
            const allowedExtensions = ['xlsx', 'xls', 'xlsm', 'csv'];
            
            if (!allowedExtensions.includes(ext)) {
                console.error(`❌ Invalid file type: . ${ext}`);
                console.error(`   Allowed types: ${allowedExtensions.join(', ')}`);
                file.resume();
                if (! responseSent) {
                    responseSent = true;
                    return res.status(400).json({
                        success: false,
                        message: `Invalid file type.  Allowed:  ${allowedExtensions.join(', ')}. Received: .${ext}`
                    });
                }
                return;
            }
            
            console.log(`✅ File type validated: .${ext}`);

            // Collect file data into buffer
            file.on('data', (data) => {
                console.log(`📦 Received chunk:  ${data.length} bytes`);
                fileBuffers.push(data);
            });

            file.on('limit', () => {
                console. error('❌ File size limit exceeded (10MB)');
                if (! responseSent) {
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
                    console.log(`\n✅ File upload complete`);
                    console.log(`   Total chunks: ${fileBuffers.length}`);
                    
                    // Combine all chunks into single buffer
                    const fileBuffer = Buffer.concat(fileBuffers);
                    console.log(`   Combined buffer size: ${fileBuffer.length} bytes (${(fileBuffer.length / 1024).toFixed(2)} KB)`);

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
                        console.log(`\n🔄 AUTO-CONVERSION REQUIRED`);
                        processBuffer = await convertToXLSX(fileBuffer, ext);
                    } else {
                        console.log(`\n✅ File is already .xlsx format, no conversion needed`);
                    }

                    // Process the Excel file
                    console.log('\n📊 PROCESSING EXCEL DATA...');
                    const result = await processExcelFile(processBuffer);
                    const data = result.data;

                    console.log(`✅ Excel processing complete:  ${data.length} rows extracted`);

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

                    console.log('\n🗄️ DATABASE OPERATIONS STARTING...');
                    const db = getDb();
                    const studentsCollection = db.collection('student');
                    console.log('✅ Connected to student collection');

                    const studentsToInsert = [];
                    const errors = [];

                    // Process each row
                    console.log('\n👥 PROCESSING STUDENT RECORDS...');
                    for (let i = 0; i < data.length; i++) {
                        const row = data[i];
                        console.log(`\n   Processing row ${i + 2}... `);
                        
                        try {
                            // Extract fields
                            const registerNo = row['Register No'] || row['RegisterNo'] || row['registerno'] || row['Register no'] || '';
                            const studentName = row['Student Name'] || row['StudentName'] || row['name'] || row['Name'] || '';
                            const email = row['Email Id'] || row['Email'] || row['email'] || row['Email ID'] || '';
                            const mobile = row['Student Mobile'] || row['Mobile'] || row['phone'] || row['Phone'] || row['Student mobile'] || '';
                            const programme = row['Programme'] || row['Program'] || row['programme'] || row['program'] || '';
                            const batch = row['Batch'] || row['batch'] || '';
                            const dob = row['Date of Birth'] || row['DOB'] || row['dob'] || row['Date Of Birth'] || '';

                            console.log(`   📝 Name: ${studentName}`);
                            console.log(`   🆔 Register No: ${registerNo}`);

                            if (!registerNo) {
                                console.error(`   ❌ Missing register number`);
                                errors.push({ 
                                    row: i + 2, 
                                    error: 'Register number is required' 
                                });
                                continue;
                            }

                            // Check for duplicates
                            const existingStudent = await studentsCollection. findOne({ 
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
                            console.log(`   ✅ Student prepared for insertion`);

                        } catch (error) {
                            console.error(`   ❌ Error processing row:  ${error.message}`);
                            errors.push({ 
                                row: i + 2, 
                                error: error. message 
                            });
                        }
                    }

                    console.log(`\n📊 PROCESSING SUMMARY:`);
                    console.log(`   Total rows:  ${data.length}`);
                    console.log(`   Valid students: ${studentsToInsert. length}`);
                    console.log(`   Errors/Duplicates: ${errors.length}`);

                    // Insert valid students
                    let insertResult = null;
                    if (studentsToInsert.length > 0) {
                        console.log(`\n💾 INSERTING ${studentsToInsert.length} STUDENTS INTO DATABASE... `);
                        insertResult = await studentsCollection.insertMany(studentsToInsert);
                        console.log(`✅ Successfully inserted ${studentsToInsert.length} students`);
                    } else {
                        console.log(`\n⚠️ No valid students to insert`);
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
                        console.log('\n✅ SENDING SUCCESS RESPONSE TO CLIENT');
                        console.log('═══════════════════════════════════════════════════');
                        console.log('🎉 UPLOAD PROCESS COMPLETED SUCCESSFULLY');
                        console.log('═══════════════════════════════════════════════════\n');
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
            console.log(`📝 Form field received: [${fieldname}] = ${value}`);
        });

        busboy.on('finish', () => {
            console. log('✅ Busboy finished parsing form data');
            if (!processingStarted) {
                setTimeout(() => {
                    if (!responseSent) {
                        responseSent = true;
                        console.error('❌ No file was uploaded');
                        return res.status(400).json({
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

        console.log('🔗 Piping request to Busboy...');
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
