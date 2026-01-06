const { getDb } = require('../../config/db');
const xlsx = require('xlsx');
const { s3, bucketName } = require('../../config/s3'); // Import from config
const { PutObjectCommand } = require('@aws-sdk/client-s3');

async function exportMarks(req, res) {
  try {
    const { cie, batch } = req.body;

    if (!cie || !batch) {
      return res.status(400).json({ message: "CIE and batch are required" });
    }

    const db = getDb();
    const collection = db.collection("qa_exam");

    // Find ALL exam documents by CIE and batch
    const examDocs = await collection.find({ cie, batch }).toArray();
    
    if (! examDocs || examDocs. length === 0) {
      return res.status(404).json({ message: "No exam records found for the given CIE and batch" });
    }

    const allFileUrls = [];

    // Process each document separately
    for (const examDoc of examDocs) {
      // Group students by department for this document
      const studentsByDepartment = {};
      examDoc.students.forEach(student => {
        const dept = student.department;
        if (!studentsByDepartment[dept]) {
          studentsByDepartment[dept] = [];
        }
        studentsByDepartment[dept].push(student);
      });

      const departments = Object.keys(studentsByDepartment);

      // Case 1: Single department in this document
      if (departments.length === 1) {
        const department = departments[0];
        const students = studentsByDepartment[department];
        
        const fileUrl = await generateSingleDepartmentExcel(examDoc, students, department);
        
        allFileUrls.push({
          documentId: examDoc._id. toString(),
          department:  department,
          fileUrl: fileUrl,
          studentCount: students.length,
          examType: examDoc.subject. toUpperCase().trim()
        });
      } 
      // Case 2: Multiple departments in this document
      else {
        const fileUrl = await generateMultipleDepartmentsExcel(examDoc, studentsByDepartment, departments);
        
        allFileUrls.push({
          documentId: examDoc._id.toString(),
          departments: departments,
          fileUrl:  fileUrl,
          studentCount:  examDoc.students.length,
          examType: examDoc.subject. toUpperCase().trim()
        });
      }
    }

    return res.json({
      message: `Successfully generated ${allFileUrls.length} Excel file(s)`,
      files: allFileUrls,
      cie:  cie,
      batch: batch,
      totalDocuments: examDocs.length,
      totalFiles: allFileUrls.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

// Generate Excel for single department
async function generateSingleDepartmentExcel(examDoc, students, department) {
  const subjectName = examDoc.subject;
  const subjectCode = examDoc. subjectCode;
  const cie = examDoc.cie;
  const batch = examDoc. batch;

  const firstStudent = students[0];
  const year = firstStudent.year;

  const examType = subjectName.toUpperCase().trim();

  let firstSectionCount = 0;
  let qaQuestionsCount;
  let firstSectionLabel = null;
  let totalQuestions;
  
  if (examType.includes('/')) {
    const parts = examType.split('/');
    firstSectionLabel = parts[1].trim();
    
    if (cie === "cie1" || cie === "cie2") {
      firstSectionCount = 20;
      qaQuestionsCount = 30;
      totalQuestions = 50;
    } else if (cie === "cie3") {
      firstSectionCount = 40;
      qaQuestionsCount = 60;
      totalQuestions = 100;
    } else {
      firstSectionCount = 20;
      qaQuestionsCount = 30;
      totalQuestions = 50;
    }
  } else {
    firstSectionCount = 0;
    firstSectionLabel = null;
    
    if (cie === "cie1" || cie === "cie2") {
      qaQuestionsCount = 30;
      totalQuestions = 30;
    } else if (cie === "cie3") {
      qaQuestionsCount = 60;
      totalQuestions = 60;
    } else {
      qaQuestionsCount = 30;
      totalQuestions = 30;
    }
  }

  let firstSectionTopics = [];
  let firstSectionTopicCounts = {};
  
  if (firstSectionCount > 0) {
    const allFirstSectionTopics = new Set();
    
    students.forEach(student => {
      const studentFirstSectionQuestions = student.questions.slice(0, firstSectionCount);
      studentFirstSectionQuestions.forEach(q => {
        if (q.topic) {
          allFirstSectionTopics.add(q.topic);
        }
      });
    });
    
    firstSectionTopics = Array. from(allFirstSectionTopics);
    
    const firstStudentFirstSectionQuestions = firstStudent.questions.slice(0, firstSectionCount);
    firstSectionTopics.forEach(topic => {
      const topicQuestions = firstStudentFirstSectionQuestions.filter(q => q.topic === topic);
      firstSectionTopicCounts[topic] = topicQuestions.length;
    });
  }

  const allQATopics = new Set();
  
  students.forEach(student => {
    const studentQAQuestions = student.questions.slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
    studentQAQuestions.forEach(q => {
      if (q. topic) {
        allQATopics.add(q.topic);
      }
    });
  });
  
  const qaTopics = Array.from(allQATopics);
  
  const qaTopicCounts = {};
  qaTopics.forEach(topic => {
    let maxCount = 0;
    students.forEach(student => {
      const studentQAQuestions = student.questions.slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
      const topicCount = studentQAQuestions.filter(q => q. topic === topic).length;
      if (topicCount > maxCount) {
        maxCount = topicCount;
      }
    });
    qaTopicCounts[topic] = maxCount;
  });

  if (qaTopics.length === 0 && firstSectionTopics.length === 0) {
    throw new Error("No topics found in questions");
  }

  function isAnswerCorrect(question) {
    if (question.hasOwnProperty('isCorrect')) {
      return question. isCorrect === true;
    }
    
    if (question.selectedAnswer && question.correct_option) {
      return question. selectedAnswer === question.correct_option;
    }
    
    if (question.studentAnswer && question.correct_option) {
      return question.studentAnswer === question. correct_option;
    }
    
    if (question.answer && question.correct_option) {
      return question.answer === question.correct_option;
    }
    
    return false;
  }

  const marksData = students.map((student, index) => {
    const row = [
      index + 1,
      student.registerno,
      student.name.toUpperCase(),
      department
    ];
    
    let firstSectionTotalMarks = 0;
    const firstSectionTopicMarks = {};
    
    if (firstSectionCount > 0) {
      const firstSectionQuestions = student.questions.slice(0, firstSectionCount);
      
      firstSectionTopics.forEach(topic => {
        const topicQuestionsForStudent = firstSectionQuestions.filter(q => q.topic === topic);
        
        if (topicQuestionsForStudent.length === 0) {
          firstSectionTopicMarks[topic] = 0;
        } else {
          firstSectionTopicMarks[topic] = topicQuestionsForStudent.filter(q => isAnswerCorrect(q)).length;
        }
        
        firstSectionTotalMarks += firstSectionTopicMarks[topic];
      });
      
      firstSectionTopics. forEach(topic => {
        row.push(firstSectionTopicMarks[topic] || 0);
      });
      
      row.push(firstSectionTotalMarks);
    }
    
    const qaQuestions = student.questions.slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
    
    const qaTopicMarks = {};
    let qaTotalMarks = 0;
    
    qaTopics.forEach(topic => {
      const topicQuestionsForStudent = qaQuestions.filter(q => q. topic === topic);
      
      if (topicQuestionsForStudent.length === 0) {
        qaTopicMarks[topic] = 0;
      } else {
        qaTopicMarks[topic] = topicQuestionsForStudent.filter(q => isAnswerCorrect(q)).length;
      }
      
      qaTotalMarks += qaTopicMarks[topic];
    });
    
    qaTopics.forEach(topic => {
      row.push(qaTopicMarks[topic] || 0);
    });
    
    row.push(qaTotalMarks);
    
    const grandTotal = firstSectionTotalMarks + qaTotalMarks;
    row.push(grandTotal);

    return row;
  });

  const headers = [
    "Roll No",
    "REG NO.",
    "NAME (BLOCK LETTERS)",
    "BRANCH"
  ];
  
  if (firstSectionCount > 0 && firstSectionLabel) {
    firstSectionTopics.forEach(topic => {
      const topicCount = firstSectionTopicCounts[topic];
      headers. push(`${topic} (${topicCount})`);
    });
    headers.push(`${firstSectionLabel} Total (${firstSectionCount})`);
  }
  
  qaTopics.forEach(topic => {
    const topicCount = qaTopicCounts[topic];
    headers.push(`${topic} (${topicCount})`);
  });
  headers.push(`QA Total (${qaQuestionsCount})`);
  headers.push(`Total (${totalQuestions})`);

  const sheetData = [
    ["Subject Name", subjectName],
    ["Subject Code", subjectCode],
    ["CIE", cie],
    ["Batch", batch],
    ["Department", department],
    ["Year", year],
    ["Exam Type", examType],
    [],
    headers,
    ... marksData
  ];

  const worksheet = xlsx.utils.aoa_to_sheet(sheetData);

  const columnWidths = [
    { wch:  10 },
    { wch: 15 },
    { wch: 25 },
    { wch: 40 }
  ];
  
  if (firstSectionCount > 0) {
    firstSectionTopics.forEach(() => {
      columnWidths.push({ wch: 20 });
    });
    columnWidths.push({ wch: 18 });
  }
  
  qaTopics.forEach(() => {
    columnWidths.push({ wch: 25 });
  });
  columnWidths.push({ wch: 15 });
  columnWidths.push({ wch: 18 });
  
  worksheet['!cols'] = columnWidths;

  const workbook = xlsx.utils. book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Marks");

  const excelBuffer = xlsx.write(workbook, {
    bookType: 'xlsx',
    type: 'buffer'
  });

  // Filename format: Department_Subject_CIE.xlsx
  const safeDept = department.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  const safeSubject = subjectName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").replace(/\//g, "_");
  
  const s3Key = `static/xlsx/qa/result/${safeDept}_${safeSubject}_${cie}. xlsx`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: excelBuffer,
      ContentType:  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
  );

  const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}. amazonaws.com/${s3Key}`;

  return fileUrl;
}

// Generate ONE Excel for multiple departments (all students in one file)
async function generateMultipleDepartmentsExcel(examDoc, studentsByDepartment, departments) {
  const subjectName = examDoc. subject;
  const subjectCode = examDoc.subjectCode;
  const cie = examDoc.cie;
  const batch = examDoc.batch;

  const allStudents = examDoc.students;
  const firstStudent = allStudents[0];
  const year = firstStudent. year;

  const examType = subjectName.toUpperCase().trim();

  let firstSectionCount = 0;
  let qaQuestionsCount;
  let firstSectionLabel = null;
  let totalQuestions;
  
  if (examType. includes('/')) {
    const parts = examType.split('/');
    firstSectionLabel = parts[1].trim();
    
    if (cie === "cie1" || cie === "cie2") {
      firstSectionCount = 20;
      qaQuestionsCount = 30;
      totalQuestions = 50;
    } else if (cie === "cie3") {
      firstSectionCount = 40;
      qaQuestionsCount = 60;
      totalQuestions = 100;
    } else {
      firstSectionCount = 20;
      qaQuestionsCount = 30;
      totalQuestions = 50;
    }
  } else {
    firstSectionCount = 0;
    firstSectionLabel = null;
    
    if (cie === "cie1" || cie === "cie2") {
      qaQuestionsCount = 30;
      totalQuestions = 30;
    } else if (cie === "cie3") {
      qaQuestionsCount = 60;
      totalQuestions = 60;
    } else {
      qaQuestionsCount = 30;
      totalQuestions = 30;
    }
  }

  let firstSectionTopics = [];
  let firstSectionTopicCounts = {};
  
  if (firstSectionCount > 0) {
    const allFirstSectionTopics = new Set();
    
    allStudents.forEach(student => {
      const studentFirstSectionQuestions = student.questions. slice(0, firstSectionCount);
      studentFirstSectionQuestions.forEach(q => {
        if (q.topic) {
          allFirstSectionTopics.add(q.topic);
        }
      });
    });
    
    firstSectionTopics = Array.from(allFirstSectionTopics);
    
    const firstStudentFirstSectionQuestions = firstStudent.questions. slice(0, firstSectionCount);
    firstSectionTopics.forEach(topic => {
      const topicQuestions = firstStudentFirstSectionQuestions.filter(q => q.topic === topic);
      firstSectionTopicCounts[topic] = topicQuestions.length;
    });
  }

  const allQATopics = new Set();
  
  allStudents.forEach(student => {
    const studentQAQuestions = student.questions.slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
    studentQAQuestions.forEach(q => {
      if (q.topic) {
        allQATopics.add(q.topic);
      }
    });
  });
  
  const qaTopics = Array.from(allQATopics);
  
  const qaTopicCounts = {};
  qaTopics.forEach(topic => {
    let maxCount = 0;
    allStudents.forEach(student => {
      const studentQAQuestions = student.questions.slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
      const topicCount = studentQAQuestions.filter(q => q. topic === topic).length;
      if (topicCount > maxCount) {
        maxCount = topicCount;
      }
    });
    qaTopicCounts[topic] = maxCount;
  });

  if (qaTopics.length === 0 && firstSectionTopics.length === 0) {
    throw new Error("No topics found in questions");
  }

  function isAnswerCorrect(question) {
    if (question.hasOwnProperty('isCorrect')) {
      return question.isCorrect === true;
    }
    
    if (question.selectedAnswer && question.correct_option) {
      return question.selectedAnswer === question.correct_option;
    }
    
    if (question. studentAnswer && question.correct_option) {
      return question.studentAnswer === question.correct_option;
    }
    
    if (question.answer && question.correct_option) {
      return question.answer === question.correct_option;
    }
    
    return false;
  }

  const marksData = allStudents.map((student, index) => {
    const row = [
      index + 1,
      student.registerno,
      student.name.toUpperCase(),
      student.department
    ];
    
    let firstSectionTotalMarks = 0;
    const firstSectionTopicMarks = {};
    
    if (firstSectionCount > 0) {
      const firstSectionQuestions = student.questions.slice(0, firstSectionCount);
      
      firstSectionTopics.forEach(topic => {
        const topicQuestionsForStudent = firstSectionQuestions.filter(q => q.topic === topic);
        
        if (topicQuestionsForStudent.length === 0) {
          firstSectionTopicMarks[topic] = 0;
        } else {
          firstSectionTopicMarks[topic] = topicQuestionsForStudent.filter(q => isAnswerCorrect(q)).length;
        }
        
        firstSectionTotalMarks += firstSectionTopicMarks[topic];
      });
      
      firstSectionTopics. forEach(topic => {
        row.push(firstSectionTopicMarks[topic] || 0);
      });
      
      row.push(firstSectionTotalMarks);
    }
    
    const qaQuestions = student.questions.slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
    
    const qaTopicMarks = {};
    let qaTotalMarks = 0;
    
    qaTopics.forEach(topic => {
      const topicQuestionsForStudent = qaQuestions.filter(q => q.topic === topic);
      
      if (topicQuestionsForStudent.length === 0) {
        qaTopicMarks[topic] = 0;
      } else {
        qaTopicMarks[topic] = topicQuestionsForStudent.filter(q => isAnswerCorrect(q)).length;
      }
      
      qaTotalMarks += qaTopicMarks[topic];
    });
    
    qaTopics.forEach(topic => {
      row.push(qaTopicMarks[topic] || 0);
    });
    
    row.push(qaTotalMarks);
    
    const grandTotal = firstSectionTotalMarks + qaTotalMarks;
    row.push(grandTotal);

    return row;
  });

  const headers = [
    "Roll No",
    "REG NO.",
    "NAME (BLOCK LETTERS)",
    "BRANCH"
  ];
  
  if (firstSectionCount > 0 && firstSectionLabel) {
    firstSectionTopics.forEach(topic => {
      const topicCount = firstSectionTopicCounts[topic];
      headers.push(`${topic} (${topicCount})`);
    });
    headers.push(`${firstSectionLabel} Total (${firstSectionCount})`);
  }
  
  qaTopics. forEach(topic => {
    const topicCount = qaTopicCounts[topic];
    headers. push(`${topic} (${topicCount})`);
  });
  headers.push(`QA Total (${qaQuestionsCount})`);
  headers.push(`Total (${totalQuestions})`);

  const sheetData = [
    ["Subject Name", subjectName],
    ["Subject Code", subjectCode],
    ["CIE", cie],
    ["Batch", batch],
    ["Departments", departments. join(", ")],
    ["Year", year],
    ["Exam Type", examType],
    [],
    headers,
    ...marksData
  ];

  const worksheet = xlsx.utils.aoa_to_sheet(sheetData);

  const columnWidths = [
    { wch: 10 },
    { wch: 15 },
    { wch: 25 },
    { wch: 40 }
  ];
  
  if (firstSectionCount > 0) {
    firstSectionTopics.forEach(() => {
      columnWidths.push({ wch: 20 });
    });
    columnWidths.push({ wch: 18 });
  }
  
  qaTopics.forEach(() => {
    columnWidths.push({ wch: 25 });
  });
  columnWidths.push({ wch: 15 });
  columnWidths.push({ wch: 18 });
  
  worksheet['!cols'] = columnWidths;

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Marks");

  const excelBuffer = xlsx.write(workbook, {
    bookType: 'xlsx',
    type: 'buffer'
  });

  // Filename format:  retest_SubjectName_ExamName. xlsx
  const safeSubject = subjectName. replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").replace(/\//g, "_");
  const safeExamType = examType.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").replace(/\//g, "_");
  
  const s3Key = `static/xlsx/qa/result/retest_${safeSubject}_${safeExamType}. xlsx`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: excelBuffer,
      ContentType:  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
  );

  const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

  return fileUrl;
}

module.exports = { exportMarks };