import * as XLSX from 'xlsx';
import { Question, QuestionType } from '../types';

export interface ExcelRow {
  Question?: string;
  OptionA?: string;
  OptionB?: string;
  OptionC?: string;
  OptionD?: string;
  OptionE?: string;
  CorrectOption?: string; // "A", "B", "C", "D", "A,B" or exact text or number for integer
  Type?: string; // "mcq_single", "mcq_multiple", "integer", "true_false"
  Marks?: number | string;
  NegativeMarks?: number | string;
  Explanation?: string;
  Subject?: string;
  Topic?: string;
  Difficulty?: string; // "easy", "medium", "hard"
}

export interface ParsedExcelResult {
  questions: Omit<Question, 'id'>[];
  errors: string[];
}

export async function parseExcelFile(file: File): Promise<ParsedExcelResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { defval: '' });

  const questions: Omit<Question, 'id'>[] = [];
  const errors: string[] = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // Row 1 is header
    const qText = String(row.Question || '').trim();
    if (!qText) return;

    const optA = String(row.OptionA || '').trim();
    const optB = String(row.OptionB || '').trim();
    const optC = String(row.OptionC || '').trim();
    const optD = String(row.OptionD || '').trim();
    const optE = String(row.OptionE || '').trim();
    const correctVal = String(row.CorrectOption || '').trim().toUpperCase();

    const posMarks = parseFloat(String(row.Marks || '4')) || 4;
    const negMarks = parseFloat(String(row.NegativeMarks || '1')) || 1;
    const explanation = String(row.Explanation || '').trim() || 'No detailed explanation provided.';
    const subject = String(row.Subject || 'General').trim();
    const topic = String(row.Topic || '').trim();
    const difficultyRaw = String(row.Difficulty || 'medium').trim().toLowerCase();
    const difficulty = (['easy', 'medium', 'hard'].includes(difficultyRaw) ? difficultyRaw : 'medium') as 'easy' | 'medium' | 'hard';

    // Build raw options
    const rawOptions = [optA, optB, optC, optD, optE].filter(Boolean);

    let type: QuestionType = 'mcq_single';
    if (row.Type) {
      const typeLower = String(row.Type).trim().toLowerCase();
      if (['mcq_single', 'mcq_multiple', 'integer', 'true_false'].includes(typeLower)) {
        type = typeLower as QuestionType;
      }
    }

    if (rawOptions.length === 0 || type === 'integer') {
      // Numerical / Open Ended Question
      questions.push({
        text: qText,
        type: 'integer',
        options: [],
        correctAnswer: correctVal || '0',
        explanation,
        positiveMarks: posMarks,
        negativeMarks: negMarks,
        subject,
        topic,
        difficulty,
      });
      return;
    }

    // Process options for MCQ or True/False
    const options = rawOptions.map((optText, oIdx) => {
      const optLetter = String.fromCharCode(65 + oIdx); // A, B, C, D...
      const isCorrect =
        correctVal.includes(optLetter) ||
        correctVal === optText.toUpperCase() ||
        correctVal === (oIdx + 1).toString();

      return {
        id: `opt-${idx}-${oIdx + 1}`,
        text: optText,
        isCorrect,
      };
    });

    const correctCount = options.filter(o => o.isCorrect).length;
    if (correctCount === 0) {
      options[0].isCorrect = true; // Fallback to A
      errors.push(`Row ${rowNum}: Could not match CorrectOption "${correctVal}", defaulted to Option A.`);
    } else if (correctCount > 1 && type === 'mcq_single') {
      type = 'mcq_multiple';
    }

    questions.push({
      text: qText,
      type,
      options,
      explanation,
      positiveMarks: posMarks,
      negativeMarks: negMarks,
      subject,
      topic,
      difficulty,
    });
  });

  return { questions, errors };
}

/**
 * Downloads a sample Excel file template for question bulk upload
 */
export function downloadSampleExcelTemplate() {
  const sampleData: ExcelRow[] = [
    {
      Question: 'What is the speed of light in vacuum?',
      OptionA: '3 x 10^8 m/s',
      OptionB: '3 x 10^6 m/s',
      OptionC: '1.5 x 10^8 m/s',
      OptionD: '3 x 10^5 km/s',
      CorrectOption: 'A',
      Type: 'mcq_single',
      Marks: 4,
      NegativeMarks: 1,
      Explanation: 'Speed of light in vacuum is approximately 3 × 10⁸ m/s (or 300,000 km/s).',
      Subject: 'Physics',
      Topic: 'Optics',
      Difficulty: 'easy',
    },
    {
      Question: 'Select ALL prime numbers from the given choices:',
      OptionA: '2',
      OptionB: '3',
      OptionC: '4',
      OptionD: '5',
      CorrectOption: 'A,B,D',
      Type: 'mcq_multiple',
      Marks: 4,
      NegativeMarks: 1,
      Explanation: '2, 3, and 5 are prime numbers. 4 is composite (2x2).',
      Subject: 'Mathematics',
      Topic: 'Number Theory',
      Difficulty: 'easy',
    },
    {
      Question: 'Calculate the value of 15 * 12:',
      OptionA: '',
      OptionB: '',
      OptionC: '',
      OptionD: '',
      CorrectOption: '180',
      Type: 'integer',
      Marks: 4,
      NegativeMarks: 0,
      Explanation: '15 × 12 = 180.',
      Subject: 'Mathematics',
      Topic: 'Aptitude',
      Difficulty: 'easy',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'QuestionBankTemplate');
  XLSX.writeFile(workbook, 'Mock_Test_Questions_Template.xlsx');
}
