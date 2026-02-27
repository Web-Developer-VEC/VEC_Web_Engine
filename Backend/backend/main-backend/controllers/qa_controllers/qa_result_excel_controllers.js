const { getDb } = require('../../config/db');
const { ObjectId } = require('mongodb');
const xlsx = require('xlsx');
const { s3, bucketName } = require('../../config/s3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

async function exportMarks(req, res) {
  try {
    const { cie, batch } = req.body;

    if (!cie || !batch) {
      return res.status(400).json({ message: "CIE and batch are required" });
    }

    const db = getDb();
    
    const scheduleCollection = db.collection("qa_schedule");
    const schedules = await scheduleCollection.find({ 
      cie, 
      batch
    }).toArray();

    if (! schedules || schedules.length === 0) {
      return res.status(404).json({ 
        message: "No schedules found for the given CIE and batch",
        cie:  cie,
        batch: batch
      });
    }

    const currentTimeUTC = new Date();
    
    const istFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone:  'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const istParts = istFormatter.formatToParts(currentTimeUTC);
    const istString = `${istParts.find(p => p.type === 'day').value}/${istParts.find(p => p.type === 'month').value}/${istParts.find(p => p.type === 'year').value} ${istParts.find(p => p.type === 'hour').value}:${istParts.find(p => p.type === 'minute').value}:${istParts.find(p => p.type === 'second').value}`;

    const incompleteSchedules = [];
    const completedScheduleIds = [];

    for (const schedule of schedules) {
      let examEndTimeUTC = null;
      
      if (schedule.date && schedule.end) {
        examEndTimeUTC = constructDateTimeIST(schedule.date, schedule. end);
      }
      
      if (! examEndTimeUTC && schedule.validTill) {
        examEndTimeUTC = new Date(schedule.validTill);
      }
      
      if (examEndTimeUTC && currentTimeUTC > examEndTimeUTC) {
        completedScheduleIds.push(schedule._id);
      } else {
        incompleteSchedules.push({
          scheduleId: schedule._id. toString(),
          subject: schedule.subject,
          subjectCode: schedule.subjectCode,
          department: schedule.department,
          date: schedule.date,
          startTime: schedule.start,
          endTime: schedule. end,
          currentTimeUTC: currentTimeUTC. toISOString(),
          currentTimeIST: istString
        });
      }
    }

    if (completedScheduleIds.length === 0) {
      return res. status(400).json({ 
        message: `Cannot export marks.  No exams have been completed yet. `,
        cie: cie,
        batch: batch,
        totalSchedules: schedules.length,
        completedSchedules: 0,
        incompleteSchedules: incompleteSchedules
      });
    }

    const examCollection = db.collection("qa_exam");
    
    const examDocs = await examCollection.find({ 
      scheduleId: { $in: completedScheduleIds }
    }).toArray();
    
    if (! examDocs || examDocs. length === 0) {
      return res.status(404).json({ 
        message: "No exam records found for the completed schedules",
        cie:  cie,
        batch: batch,
        completedSchedules: completedScheduleIds.map(id => id.toString()),
        hint: "Exam documents may not have been created yet, or students haven't taken the exam"
      });
    }

    const allFileUrls = [];

    for (const examDoc of examDocs) {
      if (! examDoc.students || examDoc.students.length === 0) {
        continue;
      }

      const validStudents = examDoc.students. filter(student => {
        return student.questions && Array.isArray(student.questions);
      });

      if (validStudents.length === 0) {
        continue;
      }

      examDoc.students = validStudents;

      const studentsByDepartment = {};
      examDoc.students.forEach(student => {
        const dept = student.department || 'UNKNOWN';
        if (!studentsByDepartment[dept]) {
          studentsByDepartment[dept] = [];
        }
        studentsByDepartment[dept]. push(student);
      });

      const departments = Object.keys(studentsByDepartment);
      const scheduleId = examDoc.scheduleId ?  examDoc.scheduleId.toString() : 'unknown';

      if (departments.length === 1) {
        const department = departments[0];
        const students = studentsByDepartment[department];
        
        try {
          const fileUrl = await generateSingleDepartmentExcel(examDoc, students, department, scheduleId);
          
          allFileUrls.push({
            documentId: examDoc._id.toString(),
            scheduleId: scheduleId,
            department: department,
            fileUrl: fileUrl,
            studentCount: students.length,
            examType: examDoc.subject. toUpperCase().trim()
          });
        } catch (error) {
          allFileUrls.push({
            documentId: examDoc._id. toString(),
            scheduleId:  scheduleId,
            department:  department,
            error: error.message,
            studentCount: students.length
          });
        }
      } else {
        try {
          const fileUrl = await generateMultipleDepartmentsExcel(examDoc, studentsByDepartment, departments, scheduleId);
          
          allFileUrls.push({
            documentId: examDoc._id.toString(),
            scheduleId: scheduleId,
            departments: departments,
            fileUrl:  fileUrl,
            studentCount:  examDoc.students.length,
            examType: examDoc.subject. toUpperCase().trim()
          });
        } catch (error) {
          allFileUrls. push({
            documentId: examDoc._id.toString(),
            scheduleId: scheduleId,
            departments: departments,
            error: error.message,
            studentCount: examDoc.students. length
          });
        }
      }
    }

    if (allFileUrls.length === 0) {
      return res.status(404).json({ 
        message: "No valid data found to generate Excel files",
        cie: cie,
        batch: batch
      });
    }

    return res.json({
      message: `Successfully processed ${allFileUrls.length} file(s)`,
      files: allFileUrls,
      cie: cie,
      batch: batch,
      totalSchedules: schedules.length,
      completedSchedules: completedScheduleIds.length,
      totalDocuments: examDocs.length,
      totalFiles: allFileUrls.length,
      exportedAt: new Date(),
      exportedAtIST: istString
    });

  } catch (err) {
    console.error('Export marks error:', err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

function constructDateTimeIST(dateString, timeString) {
  try {
    const timeParts = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeParts) {
      return null;
    }

    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    const meridiem = timeParts[3]. toUpperCase();

    if (meridiem === 'PM' && hours !== 12) {
      hours += 12;
    } else if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    }

    const [year, month, day] = dateString.split('-').map(num => parseInt(num));

    const localDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
    const utcDate = new Date(localDate.getTime() - (5.5 * 60 * 60 * 1000));

    if (isNaN(utcDate.getTime())) {
      return null;
    }

    return utcDate;
  } catch (error) {
    return null;
  }
}

async function generateSingleDepartmentExcel(examDoc, students, department, scheduleId) {
  const subjectName = examDoc.subject;
  const subjectCode = examDoc.subjectCode;
  const cie = examDoc. cie;
  const batch = examDoc.batch;

  if (!students[0] || !students[0].questions || students[0].questions.length === 0) {
    throw new Error(`No valid student data found for department ${department}`);
  }

  const firstStudent = students[0];

  const examType = subjectName.toUpperCase().trim();

  let firstSectionCount = 0;
  let qaQuestionsCount;
  let firstSectionLabel = null;
  let totalQuestions;
  
  if (examType. includes('/')) {
    const parts = examType.split('/');
    firstSectionLabel = parts[1]. trim();
    
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
      if (! student.questions || ! Array.isArray(student.questions)) return;
      
      const studentFirstSectionQuestions = student.questions.slice(0, firstSectionCount);
      studentFirstSectionQuestions.forEach(q => {
        if (q && q.topic) {
          allFirstSectionTopics.add(q.topic);
        }
      });
    });
    
    firstSectionTopics = Array.from(allFirstSectionTopics);
    
    const firstStudentFirstSectionQuestions = firstStudent.questions.slice(0, firstSectionCount);
    firstSectionTopics.forEach(topic => {
      const topicQuestions = firstStudentFirstSectionQuestions.filter(q => q && q.topic === topic);
      firstSectionTopicCounts[topic] = topicQuestions.length;
    });
  }

  const allQATopics = new Set();
  
  students.forEach(student => {
    if (!student.questions || !Array.isArray(student.questions)) return;
    
    const studentQAQuestions = student.questions. slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
    studentQAQuestions.forEach(q => {
      if (q && q. topic) {
        allQATopics.add(q.topic);
      }
    });
  });
  
  const qaTopics = Array.from(allQATopics);
  
  const qaTopicCounts = {};
  qaTopics.forEach(topic => {
    let maxCount = 0;
    students.forEach(student => {
      if (!student.questions || !Array.isArray(student.questions)) return;
      
      const studentQAQuestions = student.questions.slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
      const topicCount = studentQAQuestions.filter(q => q && q.topic === topic).length;
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
    if (!question) return false;
    
    if (question.hasOwnProperty('isCorrect')) {
      return question.isCorrect === true;
    }
    
    if (question.selectedAnswer !== undefined && question.correct_option !== undefined) {
      return question. selectedAnswer === question.correct_option;
    }
    
    if (question.studentAnswer !== undefined && question.correct_option !== undefined) {
      return question.studentAnswer === question.correct_option;
    }
    
    if (question.answer !== undefined && question.correct_option !== undefined) {
      return question.answer === question.correct_option;
    }
    
    return false;
  }

  const marksData = students.map((student, index) => {
    const row = [
      index + 1,
      student.registerno || 'N/A',
      (student.name || 'N/A').toUpperCase(),
      department
    ];
    
    if (! student.questions || ! Array.isArray(student.questions)) {
      if (firstSectionCount > 0) {
        firstSectionTopics.forEach(() => row.push(0));
        row.push(0);
      }
      qaTopics.forEach(() => row.push(0));
      row.push(0);
      row.push(0);
      return row;
    }
    
    let firstSectionTotalMarks = 0;
    const firstSectionTopicMarks = {};
    
    if (firstSectionCount > 0) {
      const firstSectionQuestions = student.questions.slice(0, firstSectionCount);
      
      firstSectionTopics.forEach(topic => {
        const topicQuestionsForStudent = firstSectionQuestions.filter(q => q && q.topic === topic);
        
        if (topicQuestionsForStudent.length === 0) {
          firstSectionTopicMarks[topic] = 0;
        } else {
          firstSectionTopicMarks[topic] = topicQuestionsForStudent.filter(q => isAnswerCorrect(q)).length;
        }
        
        firstSectionTotalMarks += firstSectionTopicMarks[topic];
      });
      
      firstSectionTopics.forEach(topic => {
        row.push(firstSectionTopicMarks[topic] || 0);
      });
      
      row.push(firstSectionTotalMarks);
    }
    
    const qaQuestions = student.questions.slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
    
    const qaTopicMarks = {};
    let qaTotalMarks = 0;
    
    qaTopics. forEach(topic => {
      const topicQuestionsForStudent = qaQuestions.filter(q => q && q.topic === topic);
      
      if (topicQuestionsForStudent.length === 0) {
        qaTopicMarks[topic] = 0;
      } else {
        qaTopicMarks[topic] = topicQuestionsForStudent.filter(q => isAnswerCorrect(q)).length;
      }
      
      qaTotalMarks += qaTopicMarks[topic];
    });
    
    qaTopics. forEach(topic => {
      row.push(qaTopicMarks[topic] || 0);
    });
    
    row.push(qaTotalMarks);
    
    const grandTotal = firstSectionTotalMarks + qaTotalMarks;
    row.push(grandTotal);

    return row;
  });

  const headers = [
    "S No",
    "Reg No",
    "NAME (BLOCK LETTERS)",
    "Branch"
  ];
  
  if (firstSectionCount > 0 && firstSectionLabel) {
    firstSectionTopics.forEach(topic => {
      const topicCount = firstSectionTopicCounts[topic];
      headers.push(`${topic} (${topicCount})`);
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
    ["CIE", cie.toUpperCase()],
    ["Batch", batch],
    ["Department", department],
    ["Exam Type", examType],
    [],
    headers,
    ... marksData
  ];

  const worksheet = xlsx.utils.aoa_to_sheet(sheetData);

  const columnWidths = [
    { wch: 10 },
    { wch:  15 },
    { wch: 25 },
    { wch:  40 }
  ];
  
  if (firstSectionCount > 0) {
    firstSectionTopics.forEach(() => {
      columnWidths. push({ wch: 20 });
    });
    columnWidths.push({ wch: 18 });
  }
  
  qaTopics.forEach(() => {
    columnWidths. push({ wch: 25 });
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

  const safeDept = department.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  const safeSubject = subjectName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").replace(/\//g, "_");
  
  const s3Key = `static/xlsx/qa/result/${safeDept}_${safeSubject}_${cie}_${scheduleId}.xlsx`;

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

async function generateMultipleDepartmentsExcel(examDoc, studentsByDepartment, departments, scheduleId) {
  const subjectName = examDoc.subject;
  const subjectCode = examDoc.subjectCode;
  const cie = examDoc.cie;
  const batch = examDoc.batch;

  const allStudents = examDoc.students;
  
  const validFirstStudent = allStudents. find(s => s.questions && Array.isArray(s.questions) && s.questions.length > 0);
  if (!validFirstStudent) {
    throw new Error("No valid student data found with questions");
  }
  
  const firstStudent = validFirstStudent;

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
    
    allStudents.forEach(student => {
      if (!student.questions || !Array.isArray(student.questions)) return;
      
      const studentFirstSectionQuestions = student.questions.slice(0, firstSectionCount);
      studentFirstSectionQuestions.forEach(q => {

        if (q && q.topic) {

          allFirstSectionTopics.add(q.topic);
        }
      });
    });
    
    firstSectionTopics = Array.from(allFirstSectionTopics);
    
    const firstStudentFirstSectionQuestions = firstStudent.questions.slice(0, firstSectionCount);
    firstSectionTopics.forEach(topic => {
      const topicQuestions = firstStudentFirstSectionQuestions. filter(q => q && q. topic === topic);
      firstSectionTopicCounts[topic] = topicQuestions.length;
    });
  }

  const allQATopics = new Set();
  
  allStudents.forEach(student => {
    if (!student.questions || ! Array.isArray(student.questions)) return;
    
    const studentQAQuestions = student. questions.slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
    studentQAQuestions.forEach(q => {
      if (q && q.topic) {
        allQATopics.add(q. topic);
      }
    });
  });
  
  const qaTopics = Array.from(allQATopics);
  
  const qaTopicCounts = {};
  qaTopics. forEach(topic => {
    let maxCount = 0;
    allStudents.forEach(student => {
      if (!student.questions || !Array.isArray(student.questions)) return;
      
      const studentQAQuestions = student.questions.slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
      const topicCount = studentQAQuestions.filter(q => q && q.topic === topic).length;
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
    if (!question) return false;
    
    if (question.hasOwnProperty('isCorrect')) {
      return question.isCorrect === true;
    }
    
    if (question.selectedAnswer !== undefined && question.correct_option !== undefined) {
      return question.selectedAnswer === question.correct_option;
    }
    
    if (question.studentAnswer !== undefined && question.correct_option !== undefined) {
      return question.studentAnswer === question.correct_option;
    }
    
    if (question.answer !== undefined && question.correct_option !== undefined) {
      return question.answer === question.correct_option;
    }
    
    return false;
  }

  const marksData = allStudents.map((student, index) => {
    const row = [
      index + 1,
      student.registerno || 'N/A',
      (student.name || 'N/A').toUpperCase(),
      student.department || 'UNKNOWN'
    ];
    
    if (!student.questions || ! Array.isArray(student.questions)) {
      if (firstSectionCount > 0) {
        firstSectionTopics.forEach(() => row.push(0));
        row.push(0);
      }
      qaTopics.forEach(() => row.push(0));
      row.push(0);
      row.push(0);
      return row;
    }
    
    let firstSectionTotalMarks = 0;
    const firstSectionTopicMarks = {};
    
    if (firstSectionCount > 0) {
      const firstSectionQuestions = student. questions.slice(0, firstSectionCount);
      
      firstSectionTopics.forEach(topic => {
        const topicQuestionsForStudent = firstSectionQuestions.filter(q => q && q.topic === topic);
        
        if (topicQuestionsForStudent.length === 0) {
          firstSectionTopicMarks[topic] = 0;
        } else {
          firstSectionTopicMarks[topic] = topicQuestionsForStudent.filter(q => isAnswerCorrect(q)).length;
        }
        
        firstSectionTotalMarks += firstSectionTopicMarks[topic];
      });
      
      firstSectionTopics.forEach(topic => {
        row.push(firstSectionTopicMarks[topic] || 0);
      });
      
      row.push(firstSectionTotalMarks);
    }
    
    const qaQuestions = student.questions.slice(firstSectionCount, firstSectionCount + qaQuestionsCount);
    
    const qaTopicMarks = {};
    let qaTotalMarks = 0;
    
    qaTopics.forEach(topic => {
      const topicQuestionsForStudent = qaQuestions.filter(q => q && q.topic === topic);
      
      if (topicQuestionsForStudent.length === 0) {
        qaTopicMarks[topic] = 0;
      } else {
        qaTopicMarks[topic] = topicQuestionsForStudent.filter(q => isAnswerCorrect(q)).length;
      }
      
      qaTotalMarks += qaTopicMarks[topic];
    });
    
    qaTopics.forEach(topic => {
      row. push(qaTopicMarks[topic] || 0);
    });
    
    row.push(qaTotalMarks);
    
    const grandTotal = firstSectionTotalMarks + qaTotalMarks;
    row.push(grandTotal);

    return row;
  });

  const headers = [
    "S No",
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
  
  qaTopics.forEach(topic => {
    const topicCount = qaTopicCounts[topic];
    headers.push(`${topic} (${topicCount})`);
  });
  headers.push(`QA Total (${qaQuestionsCount})`);
  headers.push(`Total (${totalQuestions})`);

  const sheetData = [
    ["Subject Name", subjectName],
    ["Subject Code", subjectCode],
    ["CIE", cie.toUpperCase()],
    ["Batch", batch],
    ["Departments", departments. join(", ")],
    ["Exam Type", examType],
    [],
    headers,
    ...marksData
  ];

  const worksheet = xlsx. utils.aoa_to_sheet(sheetData);

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
    bookType:  'xlsx',
    type:  'buffer'
  });

  const safeSubject = subjectName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").replace(/\//g, "_");
  const safeExamType = examType.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").replace(/\//g, "_");
  
  const s3Key = `static/xlsx/qa/result/retest_${safeSubject}_${safeExamType}_${scheduleId}.xlsx`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: excelBuffer,
      ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
  );

  const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

  return fileUrl;
}

module.exports = { exportMarks };