const { getDb } = require('../../config/db');
const xlsx = require('xlsx');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region:  process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function exportMarks(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("qa_exam");

    const examDoc = await collection.findOne({});
    if (!examDoc) {
      return res.status(404).json({ message: "Exam record not found" });
    }

    return generateExcel(examDoc, res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

async function generateExcel(examDoc, res) {
  const subjectName = examDoc.subject;
  const subjectCode = examDoc.subjectCode;
  const cie = examDoc. cie;

  const firstStudent = examDoc.students[0];
  const department = firstStudent. department;
  const batch = firstStudent.batch;

  // Use the subject name directly as exam type
  const examType = subjectName.toUpperCase().trim();

  // Parse the exam type to determine configuration
  let firstSectionCount = 0;
  let qaQuestionsCount;
  let firstSectionLabel = null;
  let totalQuestions;
  
  // Check if it's a mixed type exam (contains "/" like QA/VR or QA/BS)
  if (examType.includes('/')) {
    const parts = examType.split('/');
    firstSectionLabel = parts[1].trim(); // "VR" or "BS"
    
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
    // Pure QA exam
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

  // Collect topics from ALL students, not just the first one
  let firstSectionTopics = [];
  let firstSectionTopicCounts = {};
  
  if (firstSectionCount > 0) {
    const allFirstSectionTopics = new Set();
    
    // Gather all unique topics from all students
    examDoc.students.forEach(student => {
      const studentFirstSectionQuestions = student.questions.slice(0, firstSectionCount);
      studentFirstSectionQuestions.forEach(q => {
        if (q.topic) {
          allFirstSectionTopics.add(q.topic);
        }
      });
    });
    
    firstSectionTopics = Array. from(allFirstSectionTopics);
    
    // Count questions per topic (using first student as reference for structure)
    const firstStudentFirstSectionQuestions = firstStudent.questions.slice(0, firstSectionCount);
    firstSectionTopics.forEach(topic => {
      const topicQuestions = firstStudentFirstSectionQuestions.filter(q => q.topic === topic);
      firstSectionTopicCounts[topic] = topicQuestions.length;
    });
  }

  // Collect QA topics from ALL students
  const allQATopics = new Set();
  
  examDoc.students.forEach(student => {
    const studentQAQuestions = student.questions.slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
    studentQAQuestions.forEach(q => {
      if (q. topic) {
        allQATopics.add(q.topic);
      }
    });
  });
  
  const qaTopics = Array.from(allQATopics);
  
  // Count questions per topic for each unique topic
  const qaTopicCounts = {};
  qaTopics.forEach(topic => {
    // Count across all students to get the max or most common count
    let maxCount = 0;
    examDoc.students.forEach(student => {
      const studentQAQuestions = student.questions. slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
      const topicCount = studentQAQuestions.filter(q => q.topic === topic).length;
      if (topicCount > maxCount) {
        maxCount = topicCount;
      }
    });
    qaTopicCounts[topic] = maxCount;
  });

  if (qaTopics.length === 0 && firstSectionTopics.length === 0) {
    return res.status(400).json({ 
      message: "No topics found in questions.  Please check if 'topic' field exists in your questions." 
    });
  }

  // Helper function to check if answer is correct
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

  // Process marks for each student
  const marksData = examDoc.students.map((student, index) => {
    const row = [
      index + 1,
      student.registerno,
      student.name. toUpperCase(),
      department
    ];
    
    let firstSectionTotalMarks = 0;
    const firstSectionTopicMarks = {};
    
    // Add first section topic-wise marks (VR or BS)
    if (firstSectionCount > 0) {
      const firstSectionQuestions = student.questions.slice(0, firstSectionCount);
      
      firstSectionTopics.forEach(topic => {
        const topicQuestionsForStudent = firstSectionQuestions.filter(q => q. topic === topic);
        
        if (topicQuestionsForStudent.length === 0) {
          firstSectionTopicMarks[topic] = 0;
        } else {
          firstSectionTopicMarks[topic] = topicQuestionsForStudent.filter(q => isAnswerCorrect(q)).length;
        }
        
        firstSectionTotalMarks += firstSectionTopicMarks[topic];
      });
      
      // Add first section topic marks to row
      firstSectionTopics.forEach(topic => {
        row.push(firstSectionTopicMarks[topic] || 0);
      });
      
      // Add first section total
      row.push(firstSectionTotalMarks);
    }
    
    // QA Questions - grouped by topic
    const qaQuestions = student. questions.slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
    
    const qaTopicMarks = {};
    let qaTotalMarks = 0;
    
    qaTopics.forEach(topic => {
      const topicQuestionsForStudent = qaQuestions. filter(q => q.topic === topic);
      
      if (topicQuestionsForStudent. length === 0) {
        qaTopicMarks[topic] = 0;
      } else {
        qaTopicMarks[topic] = topicQuestionsForStudent. filter(q => isAnswerCorrect(q)).length;
      }
      
      qaTotalMarks += qaTopicMarks[topic];
    });
    
    // Add QA topic marks to row
    qaTopics.forEach(topic => {
      row.push(qaTopicMarks[topic] || 0);
    });
    
    // Add QA total
    row.push(qaTotalMarks);
    
    // Calculate grand total
    const grandTotal = firstSectionTotalMarks + qaTotalMarks;
    row.push(grandTotal);

    return row;
  });

  // Create dynamic headers
  const headers = [
    "Roll No",
    "REG NO.",
    "NAME (BLOCK LETTERS)",
    "BRANCH"
  ];
  
  // Add first section topic headers (without section prefix)
  if (firstSectionCount > 0 && firstSectionLabel) {
    firstSectionTopics.forEach(topic => {
      const topicCount = firstSectionTopicCounts[topic];
      headers.push(`${topic} (${topicCount})`);
    });
    headers.push(`${firstSectionLabel} Total (${firstSectionCount})`);
  }
  
  // Add QA topic headers (without "QA -" prefix)
  qaTopics.forEach(topic => {
    const topicCount = qaTopicCounts[topic];
    headers.push(`${topic} (${topicCount})`);
  });
  headers.push(`QA Total (${qaQuestionsCount})`);
  
  // Add grand total header
  headers.push(`Total (${totalQuestions})`);

  const sheetData = [
    ["Subject Name", subjectName],
    ["Subject Code", subjectCode],
    ["CIE", cie],
    ["Department", department],
    ["batch", batch],
    ["Exam Type", examType],
    [],
    headers,
    ...marksData
  ];

  const worksheet = xlsx.utils.aoa_to_sheet(sheetData);

  const columnWidths = [
    { wch: 10 },  // Roll No
    { wch:  15 },  // REG NO.
    { wch: 25 },  // NAME
    { wch: 40 }   // BRANCH
  ];
  
  // Add widths for first section topic columns
  if (firstSectionCount > 0) {
    firstSectionTopics.forEach(() => {
      columnWidths.push({ wch: 20 });
    });
    columnWidths.push({ wch: 18 }); // First section total
  }
  
  // Add widths for QA topic columns
  qaTopics.forEach(() => {
    columnWidths.push({ wch: 25 });
  });
  columnWidths.push({ wch: 15 }); // QA total
  
  // Add width for grand total column
  columnWidths.push({ wch: 18 });
  
  worksheet['!cols'] = columnWidths;

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Marks");

  const excelBuffer = xlsx. write(workbook, {
    bookType: 'xlsx',
    type: 'buffer'
  });

  const safeDept = department.replace(/\s+/g, "_");
  const safeExamType = examType.replace(/\//g, "_");
  const timestamp = Date. now();
  const s3Key = `static/xlsx/qa/result/marks_${safeExamType}_${safeDept}_${cie}_${timestamp}.xlsx`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process. env. AWS_BUCKET_NAME,
      Key: s3Key,
      Body: excelBuffer,
      ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
  );

  const fileUrl = `https://${process.env.AWS_BUCKET_NAME}. s3.${process.env. AWS_REGION}.amazonaws.com/${s3Key}`;

  res.json({
    message: "Excel uploaded to S3 successfully",
    fileUrl: fileUrl,
    examType: examType,
    totalQuestions: totalQuestions,
    totalStudents: examDoc.students.length,
    department: department,
    batch: batch,
    cie: cie,
    firstSectionTopics: firstSectionTopics,
    qaTopics:  qaTopics,
    firstSectionTopicCounts: firstSectionTopicCounts,
    qaTopicCounts: qaTopicCounts
  });
}

module.exports = { exportMarks };