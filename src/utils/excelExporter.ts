import * as XLSX from 'xlsx';
import { TestAttempt, MockTest } from '../types';

export function exportAttemptsToExcel(test: MockTest, attempts: TestAttempt[]) {
  const testAttempts = attempts.filter((a) => a.testId === test.id);

  // 1. Summary Sheet Data
  const summaryRows = testAttempts.map((att, idx) => {
    const timeMins = Math.floor(att.timeTakenSeconds / 60);
    const timeSecs = att.timeTakenSeconds % 60;
    
    return {
      'S.No': idx + 1,
      'Student Name': att.student.name,
      'Mobile / Phone': att.student.phone,
      'Email ID': att.student.email,
      'Roll Number': att.student.rollNumber || '-',
      'Marks Obtained': att.score,
      'Total Marks': att.totalMarks,
      'Percentage (%)': `${att.percentage.toFixed(1)}%`,
      'Result Status': att.passed ? 'PASSED (उत्तीर्ण)' : 'FAILED (अनुत्तीर्ण)',
      'Correct Answers': att.correctCount,
      'Incorrect Answers': att.incorrectCount,
      'Unattempted': att.unattemptedCount,
      'Time Spent': `${timeMins}m ${timeSecs}s`,
      'Proctor Warnings (Tab Switches)': att.tabSwitchCount,
      'Submission Date & Time': new Date(att.submittedAt).toLocaleString(),
    };
  });

  // 2. Question-by-Question Response Sheet Data
  const detailRows: any[] = [];
  testAttempts.forEach((att, attIdx) => {
    test.questions.forEach((q, qIdx) => {
      const studentAns = att.answers[q.id];
      let responseText = 'Unattempted';
      if (studentAns) {
        if (studentAns.selectedOptionIds && studentAns.selectedOptionIds.length > 0) {
          const selectedOpts = q.options.filter(o => studentAns.selectedOptionIds?.includes(o.id));
          responseText = selectedOpts.map(o => o.text).join(', ');
        } else if (studentAns.textAnswer) {
          responseText = studentAns.textAnswer;
        }
      }

      detailRows.push({
        'S.No': attIdx + 1,
        'Student Name': att.student.name,
        'Roll No': att.student.rollNumber || '-',
        'Q.No': qIdx + 1,
        'Question Text': q.text,
        'Subject': q.subject,
        'Student Answer': responseText,
        'Status': !studentAns
          ? 'Unattempted'
          : (studentAns.selectedOptionIds?.some(id => q.options.find(o => o.id === id)?.isCorrect) || studentAns.textAnswer === q.correctAnswer)
          ? 'Correct'
          : 'Incorrect',
      });
    });
  });

  const workbook = XLSX.utils.book_new();

  // Create Summary Sheet
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows.length > 0 ? summaryRows : [
    { 'Note': 'No student submissions recorded for this test yet.' }
  ]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Submissions Summary');

  // Create Detailed Sheet if submissions exist
  if (detailRows.length > 0) {
    const detailSheet = XLSX.utils.json_to_sheet(detailRows);
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detailed Responses');
  }

  const sanitizedTitle = test.title.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(workbook, `${sanitizedTitle}_Student_Results.xlsx`);
}
