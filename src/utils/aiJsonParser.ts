import { parseQuestionText } from './docxParser';
import { Question, QuestionOption, QuestionType } from '../types';

export interface ExtractedMockTestResult {
  title: string;
  subject: string;
  category: string;
  durationMinutes: number;
  marksPerQuestion: number;
  negativeMarks: number;
  instructions: string;
  sections?: Array<{
    id: string;
    name: string;
    durationMinutes?: number;
    positiveMarks?: number;
    negativeMarks?: number;
  }>;
  questions: Array<{
    id?: string;
    question: string;
    text?: string;
    options: Array<{ id: string; text: string; isCorrect: boolean } | string>;
    correctOption: number;
    sectionName?: string;
    sectionId?: string;
    subject?: string;
    explanation?: string;
    positiveMarks?: number;
    negativeMarks?: number;
    type?: QuestionType;
  }>;
}

/**
 * Robustly parses AI-extracted Mock Test data from Gemini AI output.
 * Handles standard JSON, truncated/partial JSON, unescaped string literals, and fallback text formats.
 */
export function parseExtractedTestJSON(rawText: string, fallbackRawText?: string): ExtractedMockTestResult | null {
  if (!rawText || !rawText.trim()) {
    if (fallbackRawText) {
      return parseExtractedTestJSON(fallbackRawText);
    }
    return null;
  }

  const trimmedText = rawText.trim();

  // Helper to format a parsed question item into standard structure
  const formatQuestionItem = (item: any, idx: number) => {
    let qText = item.question || item.questionText || item.q || item.title || item.text || `Question ${idx + 1}`;
    const dirPrefix = item.direction || item.passage || item.groupDirection;
    if (dirPrefix && typeof dirPrefix === 'string' && !qText.toLowerCase().includes(dirPrefix.toLowerCase().slice(0, 15))) {
      qText = `${dirPrefix}\n\n${qText}`;
    }

    let qExpl = item.explanation || item.solution || item.exp || item.directionExplanation || item.directionSolution || '';
    const dirExpl = item.directionExplanation || item.directionSolution || item.groupSolution;
    if (dirExpl && typeof dirExpl === 'string' && qExpl && !qExpl.toLowerCase().includes(dirExpl.toLowerCase().slice(0, 15))) {
      qExpl = `${dirExpl}\n\n${qExpl}`;
    }

    // Format options into array of strings or option objects
    let rawOpts = Array.isArray(item.options) && item.options.length > 0
      ? item.options
      : Array.isArray(item.choices) && item.choices.length > 0
      ? item.choices
      : ['Option A', 'Option B', 'Option C', 'Option D'];

    const correctIndex = typeof item.correctOption === 'number'
      ? item.correctOption
      : typeof item.answer === 'number'
      ? item.answer
      : typeof item.correctAnswer === 'number'
      ? item.correctAnswer
      : 0;

    const formattedOpts = rawOpts.map((optVal: any, oIdx: number) => {
      let optText = typeof optVal === 'string' ? optVal : optVal?.text || String(optVal);
      // Clean option labels like "A. ", "B) " if present
      optText = optText.replace(/^[A-Ea-e1-5][\)\.\:\-]\s*/, '').trim();
      return {
        id: `opt-${oIdx + 1}`,
        text: optText,
        isCorrect: oIdx === correctIndex,
      };
    });

    return {
      id: `extracted-q-${Date.now()}-${idx + 1}`,
      question: qText,
      text: qText,
      options: formattedOpts,
      correctOption: correctIndex,
      sectionName: item.sectionName || item.section || item.subject || '',
      subject: item.sectionName || item.subject || 'General',
      explanation: qExpl,
      positiveMarks: Number(item.positiveMarks) || 1,
      negativeMarks: Number(item.negativeMarks) || 0.25,
      type: 'mcq_single' as QuestionType,
    };
  };

  // Helper to enrich/replace truncated question list with complete fallback questions from client text parser if available
  const enrichWithFallbackQuestions = (res: ExtractedMockTestResult): ExtractedMockTestResult => {
    const textToScan = fallbackRawText || (rawText.length > 1000 ? rawText : '');
    if (!textToScan) return res;

    try {
      const parsedText = parseQuestionText(textToScan);
      if (parsedText && parsedText.questions && parsedText.questions.length > res.questions.length) {
        const fullQuestions = parsedText.questions.map((q: any, idx: number) => {
          const rawOpts = Array.isArray(q.options)
            ? q.options.map((o: any) => (typeof o === 'string' ? o : o.text))
            : ['Option A', 'Option B', 'Option C', 'Option D'];
          const correctIdx = Array.isArray(q.options)
            ? Math.max(0, q.options.findIndex((o: any) => typeof o !== 'string' && o.isCorrect))
            : 0;
          return formatQuestionItem({
            question: q.question || q.text || `Question ${idx + 1}`,
            options: rawOpts,
            correctOption: correctIdx,
            explanation: q.explanation || '',
            sectionName: q.subject !== 'General' ? q.subject : undefined,
          }, idx);
        });

        return {
          ...res,
          questions: fullQuestions,
        };
      }
    } catch (e) {}

    return res;
  };

  // Helper to extract clean string to parse from code blocks or braces
  let strToParse = trimmedText;
  const codeBlockMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    strToParse = codeBlockMatch[1].trim();
  } else {
    const firstBrace = trimmedText.indexOf('{');
    const lastBrace = trimmedText.lastIndexOf('}');
    const firstBracket = trimmedText.indexOf('[');
    const lastBracket = trimmedText.lastIndexOf(']');

    if (firstBrace !== -1 && lastBrace > firstBrace && (firstBracket === -1 || firstBrace < firstBracket)) {
      strToParse = trimmedText.substring(firstBrace, lastBrace + 1);
    } else if (firstBracket !== -1 && lastBracket > firstBracket) {
      strToParse = trimmedText.substring(firstBracket, lastBracket + 1);
    }
  }

  // -------------------------------------------------------------
  // PHASE 1: Attempt standard JSON.parse
  // -------------------------------------------------------------
  try {
    const parsed = JSON.parse(strToParse);
    let rawQuestions: any[] = [];
    let meta: any = {};

    if (Array.isArray(parsed) && parsed.length > 0) {
      rawQuestions = parsed;
    } else if (parsed && typeof parsed === 'object') {
      rawQuestions = parsed.questions || parsed.questionList || parsed.items || parsed.data || parsed.mcqs || parsed.testQuestions || [];
      meta = parsed;
    }

    if (rawQuestions.length > 0) {
      return enrichWithFallbackQuestions({
        title: meta.title || meta.testTitle || meta.name || 'Extracted Verbatim Mock Test',
        subject: meta.subject || 'Full Length Mock Test',
        category: meta.category || 'General Competition',
        durationMinutes: Number(meta.durationMinutes) || 60,
        marksPerQuestion: Number(meta.marksPerQuestion) || 1,
        negativeMarks: Number(meta.negativeMarks) || 0.25,
        instructions: meta.instructions || 'All questions are compulsory.',
        sections: Array.isArray(meta.sections) ? meta.sections : undefined,
        questions: rawQuestions.map(formatQuestionItem),
      });
    }
  } catch (e) {
    // Standard parse failed (likely unescaped characters or truncation)
  }

  // -------------------------------------------------------------
  // PHASE 2: Sanitize control characters in JSON strings & retry
  // -------------------------------------------------------------
  try {
    const sanitizedStr = strToParse.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (m, p1) => {
      return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
    });
    const parsedSanitized = JSON.parse(sanitizedStr);
    let rawQuestions: any[] = [];
    let meta: any = {};

    if (Array.isArray(parsedSanitized) && parsedSanitized.length > 0) {
      rawQuestions = parsedSanitized;
    } else if (parsedSanitized && typeof parsedSanitized === 'object') {
      rawQuestions = parsedSanitized.questions || parsedSanitized.questionList || parsedSanitized.items || parsedSanitized.data || parsedSanitized.mcqs || parsedSanitized.testQuestions || [];
      meta = parsedSanitized;
    }

    if (rawQuestions.length > 0) {
      return enrichWithFallbackQuestions({
        title: meta.title || meta.testTitle || meta.name || 'Extracted Verbatim Mock Test',
        subject: meta.subject || 'Full Length Mock Test',
        category: meta.category || 'General Competition',
        durationMinutes: Number(meta.durationMinutes) || 60,
        marksPerQuestion: Number(meta.marksPerQuestion) || 1,
        negativeMarks: Number(meta.negativeMarks) || 0.25,
        instructions: meta.instructions || 'All questions are compulsory.',
        sections: Array.isArray(meta.sections) ? meta.sections : undefined,
        questions: rawQuestions.map(formatQuestionItem),
      });
    }
  } catch (e) {
    // Sanitized parse failed
  }

  // -------------------------------------------------------------
  // PHASE 3: Partial JSON / Truncated Stream Recovery (Extract Objects)
  // -------------------------------------------------------------
  try {
    const partialResult = parsePartialJSONQuestions(strToParse || trimmedText, formatQuestionItem);
    if (partialResult && partialResult.questions.length > 0) {
      return enrichWithFallbackQuestions(partialResult);
    }
  } catch (e) {
    // Partial parse failed
  }

  // -------------------------------------------------------------
  // PHASE 4: Fallback to plain text regex parser
  // -------------------------------------------------------------
  try {
    const parsedTextResult = parseQuestionText(trimmedText);
    if (parsedTextResult && parsedTextResult.questions && parsedTextResult.questions.length > 0) {
      const questions = parsedTextResult.questions.map((q: any, idx: number) => {
        const rawOpts = Array.isArray(q.options)
          ? q.options.map((o: any) => (typeof o === 'string' ? o : o.text))
          : ['A', 'B', 'C', 'D'];
        const correctIdx = Array.isArray(q.options)
          ? Math.max(0, q.options.findIndex((o: any) => typeof o !== 'string' && o.isCorrect))
          : 0;
        return formatQuestionItem({
          question: q.question || q.text || `Question ${idx + 1}`,
          options: rawOpts,
          correctOption: correctIdx,
          explanation: q.explanation || '',
        }, idx);
      });

      return {
        title: 'Extracted Verbatim Mock Test',
        subject: 'Full Length Mock Test',
        category: 'General Competition',
        durationMinutes: 60,
        marksPerQuestion: 1,
        negativeMarks: 0.25,
        instructions: 'All questions are compulsory.',
        questions,
      };
    }
  } catch (e) {
    // Ignored
  }

  return null;
}

/**
 * Extracts question objects from truncated or broken JSON strings.
 */
function parsePartialJSONQuestions(
  text: string,
  formatFn: (item: any, idx: number) => any
): ExtractedMockTestResult | null {
  let title = 'Extracted Verbatim Mock Test';
  let subject = 'Full Length Mock Test';
  let category = 'General Competition';
  let durationMinutes = 60;
  let marksPerQuestion = 1;
  let negativeMarks = 0.25;

  const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/);
  if (titleMatch) title = titleMatch[1];

  const subjectMatch = text.match(/"subject"\s*:\s*"([^"]+)"/);
  if (subjectMatch) subject = subjectMatch[1];

  const categoryMatch = text.match(/"category"\s*:\s*"([^"]+)"/);
  if (categoryMatch) category = categoryMatch[1];

  const durMatch = text.match(/"durationMinutes"\s*:\s*(\d+)/);
  if (durMatch) durationMinutes = Number(durMatch[1]);

  const posMatch = text.match(/"marksPerQuestion"\s*:\s*([\d\.]+)/);
  if (posMatch) marksPerQuestion = Number(posMatch[1]);

  const negMatch = text.match(/"negativeMarks"\s*:\s*([\d\.]+)/);
  if (negMatch) negativeMarks = Number(negMatch[1]);

  // Extract sections array if present
  let sections: any[] | undefined = undefined;
  const sectionsMatch = text.match(/"sections"\s*:\s*(\[\s*\{[\s\S]*?\}\s*\])/);
  if (sectionsMatch) {
    try {
      sections = JSON.parse(sectionsMatch[1]);
    } catch (e) {}
  }

  const rawQuestions: any[] = [];
  const qPos = text.indexOf('"questions"');
  const searchArea = qPos !== -1 ? text.substring(qPos) : text;

  let depth = 0;
  let inString = false;
  let escape = false;
  let currentObjStart = -1;

  for (let i = 0; i < searchArea.length; i++) {
    const char = searchArea[i];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (char === '\\') {
        escape = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      if (depth === 0) {
        currentObjStart = i;
      }
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0 && currentObjStart !== -1) {
        const objStr = searchArea.substring(currentObjStart, i + 1);
        currentObjStart = -1;

        if (objStr.includes('"question"') || objStr.includes('"questionText"') || objStr.includes('"q"')) {
          try {
            const sanitized = objStr.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (m, p1) => {
              return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
            });
            const qObj = JSON.parse(sanitized);
            if (qObj && (qObj.question || qObj.questionText || qObj.q || qObj.title)) {
              rawQuestions.push(qObj);
            }
          } catch (err) {
            // Regex field fallback for individual object
            const qMatch = objStr.match(/"question"\s*:\s*"([\s\S]*?)"\s*,\s*"options"/);
            if (qMatch) {
              const qText = qMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
              const optsMatch = objStr.match(/"options"\s*:\s*\[([\s\S]*?)\]/);
              let opts: string[] = ['Option A', 'Option B', 'Option C', 'Option D'];
              if (optsMatch) {
                try {
                  opts = JSON.parse(`[${optsMatch[1]}]`);
                } catch (e) {}
              }
              const corrMatch = objStr.match(/"correctOption"\s*:\s*(\d+)/);
              const secMatch = objStr.match(/"sectionName"\s*:\s*"([^"]+)"/);
              const expMatch = objStr.match(/"explanation"\s*:\s*"([\s\S]*?)"(?:\s*\}|\s*,)/);

              rawQuestions.push({
                question: qText,
                options: opts,
                correctOption: corrMatch ? Number(corrMatch[1]) : 0,
                sectionName: secMatch ? secMatch[1] : '',
                explanation: expMatch ? expMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
              });
            }
          }
        }
      }
    }
  }

  if (rawQuestions.length === 0) return null;

  return {
    title,
    subject,
    category,
    durationMinutes,
    marksPerQuestion,
    negativeMarks,
    instructions: 'All questions are compulsory.',
    sections,
    questions: rawQuestions.map(formatFn),
  };
}
