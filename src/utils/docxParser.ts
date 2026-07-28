import { Question, QuestionType } from '../types';

export interface ParsedWordResult {
  questions: Omit<Question, 'id'>[];
  warnings: string[];
  rawText: string;
}

export interface ExtractedOption {
  letter: string;
  text: string;
}

/**
 * Unescapes HTML entities if present (&lt; -> <, &gt; -> >, &amp; -> &)
 * Preserves all HTML structures and tags intact.
 */
function unescapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
}

/**
 * Clean trailing answer/solution or dangling closing HTML tags from an option string
 */
function cleanOptionText(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  cleaned = cleaned.replace(/(?:[\s\n\r]+(?:Ans|Answer|Sol|Solution|Explanation|Correct|Key|उत्तर|व्याख्या)[\s\:\-]*[\s\S]*)$/i, '').trim();
  cleaned = cleaned.replace(/^<\/?[^>]+>/, '').replace(/<\/?[^>]+>$/, '').trim();
  return cleaned;
}

/**
 * Extracts first image URL or base64 src from HTML string
 */
function extractFirstImageSrc(htmlOrText: string): string | undefined {
  if (!htmlOrText) return undefined;
  const match = htmlOrText.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : undefined;
}

/**
 * Extracts text from a DOM element preserving line breaks (<br>) and block breaks (<p>, <div>, <tr>)
 */
function extractCellFormattedText(cell: Element): string {
  const clone = cell.cloneNode(true) as Element;

  clone.querySelectorAll('br').forEach((br) => {
    br.replaceWith('\n');
  });

  clone.querySelectorAll('p, div, tr, li, h1, h2, h3, h4, h5, h6').forEach((el) => {
    el.prepend('\n');
    el.append('\n');
  });

  const rawText = clone.textContent || '';
  const lines = rawText.split('\n').map((line) => line.trimEnd());

  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts inner content from a cell, preserving HTML structures like tables, images, sub/sup, bold tags.
 */
function extractCellFormattedContent(cell: Element): string {
  const html = cell.innerHTML.trim();
  const hasHtml = /<[a-z][\s\S]*>/i.test(html);

  if (hasHtml) {
    return html;
  }

  return extractCellFormattedText(cell);
}

/**
 * Recursively flattens document body to extract individual block elements (<p>, <table>, <ul>, <ol>, <h1>..<h6>)
 */
function getBlockNodes(doc: Document): Element[] {
  const blocks: Element[] = [];

  function collect(node: Element) {
    const name = node.nodeName.toLowerCase();
    // If it's a wrapper tag (body, section, article, or non-table div), recurse into children
    if (
      (name === 'body' || name === 'section' || name === 'article' || name === 'div') &&
      node.children.length > 0 &&
      !node.querySelector('table')
    ) {
      Array.from(node.children).forEach((child) => collect(child));
    } else {
      blocks.push(node);
    }
  }

  collect(doc.body);
  return blocks;
}

/**
 * Extracts options from raw text or HTML block (single-line or multi-line)
 * Preserves sub/sup, fractions, math, bold tags, and images.
 */
export function extractOptionsFromText(text: string): ExtractedOption[] {
  const options: ExtractedOption[] = [];
  if (!text) return options;

  // Regex matches option start tokens e.g. (A), A), A., [A], Option A, Option 1, 1), 1., etc.
  const tokenRegex = /(?:^|>|[\s\n\r])(?:(?:Option|Opt|विकल्प)\s*)?[\(\[]?([A-Ea-e1-5])[\)\.\:\-]\s*/gi;

  const matches: { letter: string; startIndex: number; fullMatchLength: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    let letter = match[1].toUpperCase();
    if (/^[1-5]$/.test(letter)) {
      letter = String.fromCharCode(65 + parseInt(letter, 10) - 1);
    }

    if (!matches.some((m) => m.letter === letter)) {
      matches.push({
        letter,
        startIndex: match.index + match[0].length,
        fullMatchLength: match[0].length,
      });
    }
  }

  if (matches.length >= 2) {
    matches.sort((a, b) => a.startIndex - b.startIndex);

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const nextIndex = i < matches.length - 1 ? matches[i + 1].startIndex - matches[i + 1].fullMatchLength : text.length;

      const rawOptChunk = text.substring(current.startIndex, nextIndex);
      const cleaned = cleanOptionText(rawOptChunk);

      if (cleaned) {
        options.push({
          letter: current.letter,
          text: cleaned,
        });
      }
    }
  }

  return options;
}

/**
 * Marks correct option(s) based on answer key string (e.g. "2", "1,2", "E", "Ans: 2", "Answer: (D)", "Option 4", "A, B")
 */
function markCorrectOption(
  options: { id: string; text: string; isCorrect: boolean }[],
  answerStr: string
): boolean {
  if (!answerStr || options.length === 0) return false;

  // Clean answer string prefix
  let cleanAns = answerStr
    .trim()
    .replace(/^(?:Answer|Ans|Key|Correct\s*Option|Correct|Option|उत्तर|सही\s*उत्तर)\s*[\:\=\-\.]*\s*/i, '')
    .trim();

  if (!cleanAns) cleanAns = answerStr.trim();

  let matched = false;

  const parts = cleanAns.split(/[\,\/\;]+/).map((p) => p.trim()).filter(Boolean);

  parts.forEach((part) => {
    const upperPart = part.toUpperCase();

    // Check 1-5 numeric (e.g. "4", "(4)", "Option 4", "4.0")
    const numMatch = upperPart.match(/^(?:OPTION\s*)?[\(\[]?([1-5])[\)\.\:]?$/i);
    if (numMatch) {
      const idx = parseInt(numMatch[1], 10) - 1;
      if (idx >= 0 && idx < options.length) {
        options[idx].isCorrect = true;
        matched = true;
        return;
      }
    }

    // Check A-E letter (e.g. "D", "(D)", "OPTION D", "[A]")
    const letterMatch = upperPart.match(/^(?:OPTION\s*)?[\(\[]?([A-E])[\)\.\:]?$/i);
    if (letterMatch) {
      const idx = letterMatch[1].charCodeAt(0) - 65;
      if (idx >= 0 && idx < options.length) {
        options[idx].isCorrect = true;
        matched = true;
        return;
      }
    }

    // Check option text matching
    options.forEach((opt, oIdx) => {
      const letter = String.fromCharCode(65 + oIdx);
      const optClean = (opt.text || '').replace(/<[^>]+>/g, '').trim().toUpperCase();

      if (
        upperPart === letter ||
        upperPart.includes(`(${letter})`) ||
        upperPart.includes(`[${letter}]`) ||
        (optClean && (optClean === upperPart || upperPart.includes(optClean) || optClean.includes(upperPart)))
      ) {
        opt.isCorrect = true;
        matched = true;
      }
    });
  });

  if (!matched && options.length > 0) {
    options[0].isCorrect = true;
    return true;
  }

  return matched;
}

// Key Matchers for Word Documents
function normalizeKeyText(text: string): string {
  if (!text) return '';
  return text.trim().toLowerCase().replace(/[\:\-\.\,\;\_\(\)\[\]]/g, '').replace(/\s+/g, ' ').trim();
}

function isQuestionKeyHeader(text: string): boolean {
  if (!text) return false;
  const clean = normalizeKeyText(text);
  return (
    clean === 'question' ||
    clean === 'q' ||
    clean === 'question statement' ||
    clean === 'question text' ||
    clean === 'q text' ||
    clean === 'qno' ||
    clean === 'q no' ||
    clean === 'questionno' ||
    clean === 'question no' ||
    clean === 'srno' ||
    clean === 'sr no' ||
    clean === 'sno' ||
    clean === 's no' ||
    clean === 'sn' ||
    clean === 's n' ||
    clean === 'प्रश्न' ||
    clean === 'प्रश्न संख्या' ||
    clean === 'प्रश्न सं' ||
    clean === 'प्रश्न क्रमांक' ||
    /^question/i.test(clean) ||
    /^q\s*\d*$/i.test(clean) ||
    /^p\s*\d*$/i.test(clean) ||
    /^s\s*no/i.test(clean) ||
    /^sr\s*no/i.test(clean)
  );
}

function isTypeKeyHeader(text: string): boolean {
  if (!text) return false;
  const clean = normalizeKeyText(text);
  return (
    clean === 'type' ||
    clean === 'question type' ||
    clean === 'q type' ||
    clean === 'प्रकार' ||
    clean === 'प्रश्न प्रकार' ||
    clean === 'type of question' ||
    clean.includes('question type') ||
    clean.includes('q type')
  );
}

function isOptionKeyHeader(text: string): boolean {
  if (!text) return false;
  const clean = normalizeKeyText(text);
  return (
    clean === 'option' ||
    clean === 'opt' ||
    clean === 'options' ||
    clean === 'विकल्प' ||
    clean === 'ऑप्शन' ||
    clean.includes('option') ||
    clean.includes('opt') ||
    clean.includes('विकल्प') ||
    /^option/i.test(clean) ||
    /^opt/i.test(clean)
  );
}

function isAnswerKeyHeader(text: string): boolean {
  if (!text) return false;
  const clean = normalizeKeyText(text);
  return (
    clean === 'answer' ||
    clean === 'ans' ||
    clean === 'key' ||
    clean === 'ans key' ||
    clean === 'answer key' ||
    clean === 'correct' ||
    clean === 'correct option' ||
    clean === 'correct answer' ||
    clean === 'correct opt' ||
    clean === 'उत्तर' ||
    clean === 'सही उत्तर' ||
    clean === 'उत्तर कुंजी' ||
    clean.includes('answer') ||
    clean.includes('ans key') ||
    clean.includes('correct opt') ||
    /^answer/i.test(clean) ||
    /^ans/i.test(clean) ||
    /^correct/i.test(clean)
  );
}

function isSolutionKeyHeader(text: string): boolean {
  if (!text) return false;
  const clean = normalizeKeyText(text);
  return (
    clean === 'solution' ||
    clean === 'explanation' ||
    clean === 'sol' ||
    clean === 'exp' ||
    clean === 'व्याख्या' ||
    clean === 'विस्तृत हल' ||
    clean === 'हल' ||
    clean === 'समाधान' ||
    clean.includes('solution') ||
    clean.includes('explanation') ||
    clean.includes('व्याख्या') ||
    clean.includes('विस्तृत हल') ||
    /^solution/i.test(clean) ||
    /^sol/i.test(clean) ||
    /^explanation/i.test(clean)
  );
}

function isPositiveMarksKeyHeader(text: string): boolean {
  if (!text) return false;
  const clean = normalizeKeyText(text);
  return (
    clean.includes('positive') ||
    clean.includes('pos mark') ||
    clean.includes('धनात्मक') ||
    clean === 'pos' ||
    clean === 'pos marks' ||
    clean === 'positivemarks' ||
    clean === 'marks' ||
    clean === 'mark'
  );
}

function isNegativeMarksKeyHeader(text: string): boolean {
  if (!text) return false;
  const clean = normalizeKeyText(text);
  return (
    clean.includes('negative') ||
    clean.includes('neg mark') ||
    clean.includes('ऋणात्मक') ||
    clean === 'neg' ||
    clean === 'neg marks' ||
    clean === 'negativemarks'
  );
}

function isPassageHeader(text: string): boolean {
  const clean = text.trim();
  return /^(?:Directions?|Passage|Read\s+the|Study\s+the|The\s+bar|The\s+pie|The\s+table|The\s+line|Given\s+below|Note:|निर्देश|गद्यांश|नीचे\s+दी|नीचे\s+दिया)/i.test(clean);
}

/**
 * Pass 1: Parse Key-Value structures (Tables with Question, Type, Option, Answer, Solution, Positive Marks, Negative Marks)
 * Strictly matches 1 Question row per question to handle single-table or multi-table documents seamlessly.
 */
function parseKeyValueDocument(doc: Document): Omit<Question, 'id'>[] {
  const questions: Omit<Question, 'id'>[] = [];

  interface BuildingKV {
    textParts: string[];
    options: { id: string; textParts: string[]; isCorrect: boolean }[];
    typeStr: string;
    answerStr: string;
    explanationParts: string[];
    positiveMarks?: number;
    negativeMarks?: number;
    imageUrl?: string;
  }

  function finalizeKV(kv: BuildingKV) {
    const fullText = kv.textParts.join('<br>').trim();
    if (!fullText) return;

    const options = kv.options
      .map((opt, oIdx) => ({
        id: `opt-${questions.length + 1}-${oIdx + 1}`,
        text: opt.textParts.join('<br>').trim(),
        isCorrect: false,
      }))
      .filter((opt) => opt.text.length > 0);

    // If no option rows were found in table, try inline option extraction from fullText
    if (options.length === 0) {
      const extracted = extractOptionsFromText(fullText);
      extracted.forEach((opt, oIdx) => {
        options.push({
          id: `opt-${questions.length + 1}-${oIdx + 1}`,
          text: opt.text,
          isCorrect: false,
        });
      });
    }

    markCorrectOption(options, kv.answerStr);

    const correctCount = options.filter((o) => o.isCorrect).length;

    let questionType: QuestionType = 'mcq_single';

    if (kv.typeStr) {
      const lowerType = kv.typeStr.toLowerCase().trim();
      if (
        lowerType.includes('mcq_multiple') ||
        lowerType.includes('multiple_select') ||
        lowerType.includes('multi_select') ||
        (lowerType.includes('multiple choice') && correctCount > 1) ||
        (lowerType.includes('multiple') && !lowerType.includes('choice'))
      ) {
        questionType = 'mcq_multiple';
      } else if (
        lowerType.includes('integer') ||
        lowerType.includes('numeric') ||
        lowerType.includes('blank')
      ) {
        questionType = 'integer';
      } else if (lowerType.includes('multiple_choice') || lowerType.includes('single')) {
        questionType = correctCount > 1 ? 'mcq_multiple' : 'mcq_single';
      }
    } else {
      if (correctCount > 1) {
        questionType = 'mcq_multiple';
      } else if (options.length === 0) {
        questionType = 'integer';
      } else {
        questionType = 'mcq_single';
      }
    }

    if (options.length === 0) {
      questionType = 'integer';
    }

    const explanation = kv.explanationParts.join('<br>').trim() || 'No detailed solution provided.';
    const imageUrl = kv.imageUrl || extractFirstImageSrc(fullText);

    questions.push({
      text: fullText,
      type: questionType,
      options,
      correctAnswer: options.length === 0 ? kv.answerStr || '0' : undefined,
      explanation,
      positiveMarks: kv.positiveMarks !== undefined ? kv.positiveMarks : 4,
      negativeMarks: kv.negativeMarks !== undefined ? kv.negativeMarks : 1,
      subject: 'General',
      topic: '',
      difficulty: 'medium',
      imageUrl,
    });
  }

  // Find top-level tables in document
  const allTables = Array.from(doc.querySelectorAll('table'));
  const topLevelTables = allTables.filter((t) => !t.parentElement?.closest('table'));

  topLevelTables.forEach((table) => {
    // Only get direct rows belonging strictly to this top-level table (filter out nested tables)
    const directRows = Array.from(table.rows).filter((r) => r.closest('table') === table);
    if (directRows.length < 2) return;

    // Verify if this table contains question key headers
    const isQuestionTable = directRows.some((row) => {
      const cells = Array.from(row.cells).filter((c) => c.closest('tr') === row);
      if (cells.length < 2) return false;
      const key = (cells[0].textContent || '').trim();
      return (
        isQuestionKeyHeader(key) ||
        isTypeKeyHeader(key) ||
        isOptionKeyHeader(key) ||
        isAnswerKeyHeader(key) ||
        isSolutionKeyHeader(key) ||
        isPositiveMarksKeyHeader(key) ||
        isNegativeMarksKeyHeader(key)
      );
    });

    if (!isQuestionTable) return;

    let currentKV: BuildingKV | null = null;
    let currentSection:
      | 'none'
      | 'question'
      | 'type'
      | 'option'
      | 'answer'
      | 'solution'
      | 'positive_marks'
      | 'negative_marks' = 'none';

    directRows.forEach((row, rIdx) => {
      const directCells = Array.from(row.cells).filter((c) => c.closest('tr') === row);
      if (directCells.length < 2) return;

      let keyText = (directCells[0].textContent || '').trim();
      let valCell = directCells[1];

      // Handle 3-column table format (e.g., S.No | Question | Text)
      if (!isQuestionKeyHeader(keyText) && directCells.length >= 3) {
        const cell1Text = (directCells[1].textContent || '').trim();
        if (isQuestionKeyHeader(cell1Text)) {
          keyText = cell1Text;
          valCell = directCells[2];
        }
      }

      const valHtml = extractCellFormattedContent(valCell);
      const valText = extractCellFormattedText(valCell);

      const isQHeader = isQuestionKeyHeader(keyText);
      const isFirstRowAndNotOtherKey =
        rIdx === 0 &&
        !isTypeKeyHeader(keyText) &&
        !isOptionKeyHeader(keyText) &&
        !isAnswerKeyHeader(keyText) &&
        !isSolutionKeyHeader(keyText) &&
        !isPositiveMarksKeyHeader(keyText) &&
        !isNegativeMarksKeyHeader(keyText);

      if (isQHeader || isFirstRowAndNotOtherKey) {
        if (currentKV && currentKV.textParts.length > 0) {
          finalizeKV(currentKV);
        }
        currentKV = {
          textParts: [],
          options: [],
          typeStr: '',
          answerStr: '',
          explanationParts: [],
        };
        if (valHtml || valText) {
          currentKV.textParts.push(valHtml || valText);
          if (!currentKV.imageUrl) {
            currentKV.imageUrl = extractFirstImageSrc(valHtml);
          }
        }
        currentSection = 'question';
      } else if (currentKV) {
        if (isTypeKeyHeader(keyText)) {
          currentKV.typeStr = valText;
          currentSection = 'type';
        } else if (isOptionKeyHeader(keyText)) {
          currentKV.options.push({
            id: `opt-temp-${currentKV.options.length + 1}`,
            textParts: [valHtml || valText],
            isCorrect: false,
          });
          currentSection = 'option';
        } else if (isAnswerKeyHeader(keyText)) {
          currentKV.answerStr = valText;
          currentSection = 'answer';
        } else if (isSolutionKeyHeader(keyText)) {
          if (valHtml || valText) {
            currentKV.explanationParts.push(valHtml || valText);
          }
          currentSection = 'solution';
        } else if (isPositiveMarksKeyHeader(keyText)) {
          const parsed = parseFloat(valText.replace(/[^\d\.\-]/g, ''));
          if (!isNaN(parsed)) currentKV.positiveMarks = parsed;
          currentSection = 'positive_marks';
        } else if (isNegativeMarksKeyHeader(keyText)) {
          const parsed = parseFloat(valText.replace(/[^\d\.\-]/g, ''));
          if (!isNaN(parsed)) currentKV.negativeMarks = Math.abs(parsed);
          currentSection = 'negative_marks';
        } else {
          // Continuation of current section
          if (currentSection === 'question' && (valHtml || valText)) {
            currentKV.textParts.push(valHtml || valText);
          } else if (currentSection === 'option' && currentKV.options.length > 0) {
            currentKV.options[currentKV.options.length - 1].textParts.push(valHtml || valText);
          } else if (currentSection === 'solution' && (valHtml || valText)) {
            currentKV.explanationParts.push(valHtml || valText);
          }
        }
      }
    });

    if (currentKV) {
      finalizeKV(currentKV);
    }
  });

  return questions;
}

/**
 * Pass 2: Parse Multi-column Question Tables (where each row is a question)
 */
function parseMultiColumnTable(
  table: Element,
  tableIdx: number
): Omit<Question, 'id'>[] {
  const rows = Array.from(table.querySelectorAll('tr')).filter((r) => r.closest('table') === table);
  if (rows.length < 2) return [];

  const questions: Omit<Question, 'id'>[] = [];

  const headerCells = Array.from(rows[0].querySelectorAll('td, th')).map((c) =>
    (c.textContent || '').trim().toLowerCase()
  );

  let qCol = -1;
  let ansCol = -1;
  let solCol = -1;
  let posCol = -1;
  let negCol = -1;
  const optCols: { letter: string; colIdx: number }[] = [];

  headerCells.forEach((h, colIdx) => {
    if (h.includes('question') || h.includes('q.no') || h.includes('q text') || h === 'q' || h === 'प्रश्न') {
      qCol = colIdx;
    } else if (h.includes('answer') || h.includes('ans') || h.includes('correct') || h === 'key' || h === 'उत्तर') {
      ansCol = colIdx;
    } else if (h.includes('solution') || h.includes('explanation') || h.includes('sol') || h === 'exp' || h === 'व्याख्या') {
      solCol = colIdx;
    } else if (h.includes('positive') || h.includes('pos marks')) {
      posCol = colIdx;
    } else if (h.includes('negative') || h.includes('neg marks')) {
      negCol = colIdx;
    } else if (h.includes('option a') || h === 'a' || h.includes('opt a') || h === 'opt 1' || h === 'विकल्प a') {
      optCols.push({ letter: 'A', colIdx });
    } else if (h.includes('option b') || h === 'b' || h.includes('opt b') || h === 'opt 2' || h === 'विकल्प b') {
      optCols.push({ letter: 'B', colIdx });
    } else if (h.includes('option c') || h === 'c' || h.includes('opt c') || h === 'opt 3' || h === 'विकल्प c') {
      optCols.push({ letter: 'C', colIdx });
    } else if (h.includes('option d') || h === 'd' || h.includes('opt d') || h === 'opt 4' || h === 'विकल्प d') {
      optCols.push({ letter: 'D', colIdx });
    } else if (h.includes('option e') || h === 'e' || h.includes('opt e') || h === 'opt 5' || h === 'विकल्प e') {
      optCols.push({ letter: 'E', colIdx });
    }
  });

  if (qCol === -1 && headerCells.length >= 3) {
    if (headerCells[0].includes('no') || headerCells[0].includes('#') || headerCells[0] === 's.no' || headerCells[0] === 'q') {
      qCol = 1;
    } else {
      qCol = 0;
    }
  }

  if (qCol === -1) return [];

  for (let r = 1; r < rows.length; r++) {
    const cells = Array.from(rows[r].querySelectorAll('td, th')).filter((c) => c.closest('tr') === rows[r]);
    if (cells.length <= qCol) continue;

    const qCell = cells[qCol];
    const questionText = extractCellFormattedContent(qCell);
    if (!questionText || questionText.length < 2) continue;

    const imageUrl = extractFirstImageSrc(questionText);
    const options: { id: string; text: string; isCorrect: boolean }[] = [];

    if (optCols.length > 0) {
      optCols.forEach(({ letter, colIdx }) => {
        if (cells[colIdx]) {
          const optText = extractCellFormattedContent(cells[colIdx]);
          if (optText) {
            options.push({
              id: `opt-${tableIdx}-${r}-${letter}`,
              text: optText,
              isCorrect: false,
            });
          }
        }
      });
    } else {
      cells.forEach((cell, idx) => {
        if (idx !== qCol && idx !== ansCol && idx !== solCol && idx !== posCol && idx !== negCol) {
          const optText = extractCellFormattedContent(cell);
          if (optText) {
            options.push({
              id: `opt-${tableIdx}-${r}-${options.length + 1}`,
              text: optText,
              isCorrect: false,
            });
          }
        }
      });
    }

    if (options.length === 0) {
      const extracted = extractOptionsFromText(questionText);
      extracted.forEach((opt, oIdx) => {
        options.push({
          id: `opt-${tableIdx}-${r}-${oIdx + 1}`,
          text: opt.text,
          isCorrect: false,
        });
      });
    }

    let answerStr = '';
    if (ansCol !== -1 && cells[ansCol]) {
      answerStr = extractCellFormattedText(cells[ansCol]);
    }

    let explanationText = 'No detailed solution provided.';
    if (solCol !== -1 && cells[solCol]) {
      explanationText = extractCellFormattedContent(cells[solCol]);
    }

    let posMarks = 4;
    if (posCol !== -1 && cells[posCol]) {
      const p = parseFloat(extractCellFormattedText(cells[posCol]).replace(/[^\d\.\-]/g, ''));
      if (!isNaN(p)) posMarks = p;
    }

    let negMarks = 1;
    if (negCol !== -1 && cells[negCol]) {
      const n = parseFloat(extractCellFormattedText(cells[negCol]).replace(/[^\d\.\-]/g, ''));
      if (!isNaN(n)) negMarks = Math.abs(n);
    }

    markCorrectOption(options, answerStr);

    questions.push({
      text: questionText,
      type: options.length === 0 ? 'integer' : 'mcq_single',
      options,
      correctAnswer: options.length === 0 ? answerStr || '0' : undefined,
      explanation: explanationText,
      positiveMarks: posMarks,
      negativeMarks: negMarks,
      subject: 'General',
      topic: '',
      difficulty: 'medium',
      imageUrl,
    });
  }

  return questions;
}

/**
 * Main DOCX HTML parser supporting passages, directions, tables, key-value formats, and options
 */
export function parseDocxHtml(html: string, fallbackRawText: string): ParsedWordResult {
  const warnings: string[] = [];
  const questions: Omit<Question, 'id'>[] = [];

  if (typeof window === 'undefined' || !window.DOMParser) {
    return parseQuestionText(fallbackRawText);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(unescapeHtml(html), 'text/html');

  // Pass 1: Try Key-Value Document Parser
  const kvQuestions = parseKeyValueDocument(doc);
  if (kvQuestions.length > 0) {
    return { questions: kvQuestions, warnings, rawText: fallbackRawText };
  }

  // Pass 2: Try Multi-column Question Table Parser
  const topLevelTables = Array.from(doc.querySelectorAll('table')).filter((t) => !t.parentElement?.closest('table'));
  topLevelTables.forEach((table, tableIdx) => {
    const multiQ = parseMultiColumnTable(table, tableIdx);
    if (multiQ.length > 0) {
      questions.push(...multiQ);
    }
  });

  if (questions.length > 0) {
    return { questions, warnings, rawText: fallbackRawText };
  }

  // Pass 3: Sequential Document Block Parsing
  let currentPassageHtml = '';
  let passageStartQ = 0;
  let passageEndQ = 0;

  interface BuildingSeqQuestion {
    qNum?: number;
    textParts: string[];
    options: { id: string; text: string; isCorrect: boolean }[];
    answerStr: string;
    explanationParts: string[];
    imageUrl?: string;
    passageHtml?: string;
  }

  let currentQ: BuildingSeqQuestion | null = null;

  function finalizeSequentialQuestion() {
    if (!currentQ) return;

    let fullText = currentQ.textParts.join('<br>').trim();

    // Extract inline options from fullText if options array is empty
    if (currentQ.options.length === 0) {
      const extractedOpts = extractOptionsFromText(fullText);
      if (extractedOpts.length > 0) {
        extractedOpts.forEach((opt, oIdx) => {
          currentQ!.options.push({
            id: `opt-${questions.length + 1}-${oIdx + 1}`,
            text: opt.text,
            isCorrect: false,
          });
        });
      }
    }

    if (currentQ.passageHtml) {
      fullText = `${currentQ.passageHtml}<br><br>${fullText}`;
    }

    if (!fullText) {
      currentQ = null;
      return;
    }

    const primaryImg = currentQ.imageUrl || extractFirstImageSrc(fullText);
    const options = currentQ.options;

    let questionType: QuestionType = options.length > 0 ? 'mcq_single' : 'mcq_single';
    if (options.length === 0) {
      questionType = 'integer';
    }

    markCorrectOption(options, currentQ.answerStr);

    const explanation = currentQ.explanationParts.join('<br>').trim() || 'No detailed solution provided.';

    questions.push({
      text: fullText,
      type: questionType,
      options,
      correctAnswer: options.length === 0 ? currentQ.answerStr || '0' : undefined,
      explanation,
      positiveMarks: 4,
      negativeMarks: 1,
      subject: 'General',
      topic: '',
      difficulty: 'medium',
      imageUrl: primaryImg,
    });

    currentQ = null;
  }

  const blockNodes = getBlockNodes(doc);

  blockNodes.forEach((node) => {
    const nodeText = extractCellFormattedText(node);
    const nodeHtml = extractCellFormattedContent(node);

    if (!nodeText && !nodeHtml.includes('<img')) return;

    // Check Directions / Passage Header
    if (isPassageHeader(nodeText)) {
      finalizeSequentialQuestion();

      const rangeMatch = nodeText.match(/(?:Q(?:uestion)?s?[\.\:]?\s*)?(\d+)\s*(?:[\-\–\—\to]+)\s*(\d+)/i);
      if (rangeMatch) {
        passageStartQ = parseInt(rangeMatch[1], 10);
        passageEndQ = parseInt(rangeMatch[2], 10);
      } else {
        passageStartQ = 0;
        passageEndQ = 0;
      }

      currentPassageHtml = nodeHtml;
      return;
    }

    // Check Question Start Pattern (e.g. "Q.36", "Question 36:", "प्रश्न 36:", "36. What is...")
    const qMatch = nodeText.trim().match(/^(?:Q(?:uestion)?s?[\.\:\-\s]*(\d+)|प्रश्न[\.\:\-\s]*(\d+)|(\d{1,3})[\.\:\-]\s+[A-Z\u0900-\u097F\<\(\"\'])[\s\:\-]*(.+)?$/i);

    if (qMatch) {
      finalizeSequentialQuestion();

      const qNum = parseInt(qMatch[1] || qMatch[2] || qMatch[3] || qMatch[4] || qMatch[5] || '0', 10);
      const qTextRest = qMatch[6] || '';

      let passageForQ = '';
      if (currentPassageHtml) {
        if (passageStartQ > 0 && passageEndQ > 0) {
          if (qNum >= passageStartQ && qNum <= passageEndQ) {
            passageForQ = currentPassageHtml;
          }
        } else {
          passageForQ = currentPassageHtml;
        }
      }

      currentQ = {
        qNum,
        textParts: [nodeHtml || qTextRest],
        options: [],
        answerStr: '',
        explanationParts: [],
        imageUrl: extractFirstImageSrc(nodeHtml),
        passageHtml: passageForQ,
      };
      return;
    }

    if (currentQ) {
      if (isAnswerKeyHeader(nodeText)) {
        const ansMatch = nodeText.match(/^(?:Answer|Ans|Key|Correct\s*Option|उत्तर)\s*[\:\=]\s*(.+)$/i);
        if (ansMatch) currentQ.answerStr = ansMatch[1].trim();
        return;
      }

      if (isSolutionKeyHeader(nodeText)) {
        const expMatch = nodeText.match(/^(?:Explanation|Solution|Sol|Sol\.|व्याख्या|विस्तृत हल)\s*[\:\=]\s*(.+)$/i);
        if (expMatch) currentQ.explanationParts.push(nodeHtml || expMatch[1].trim());
        return;
      }

      // Check Option line (e.g. A) text, (A) text, A. text)
      const optMatch = nodeText.match(/^(?:[\(\[]?([A-Ea-e1-5])[\)\.\:\-]\s*)(.+)$/);
      if (optMatch) {
        let letter = optMatch[1].toUpperCase();
        if (/^[1-5]$/.test(letter)) {
          letter = String.fromCharCode(65 + parseInt(letter, 10) - 1);
        }
        const optText = optMatch[2].trim();
        if (!currentQ.options.some((o) => o.text === optText)) {
          currentQ.options.push({
            id: `opt-${questions.length + 1}-${currentQ.options.length + 1}`,
            text: nodeHtml || optText,
            isCorrect: false,
          });
        }
        return;
      }

      // Check inline options
      const inlineOpts = extractOptionsFromText(nodeText);
      if (inlineOpts.length >= 2 && currentQ.options.length === 0) {
        inlineOpts.forEach((opt, oIdx) => {
          currentQ!.options.push({
            id: `opt-${questions.length + 1}-${oIdx + 1}`,
            text: opt.text,
            isCorrect: false,
          });
        });
        return;
      }

      if (currentQ.explanationParts.length > 0) {
        currentQ.explanationParts.push(nodeHtml || nodeText);
      } else {
        currentQ.textParts.push(nodeHtml || nodeText);
      }
    } else {
      if (nodeHtml.includes('<img') || node.nodeName.toLowerCase() === 'table' || nodeText.length > 20) {
        if (currentPassageHtml) {
          currentPassageHtml += `<br><br>${nodeHtml}`;
        } else {
          currentPassageHtml = nodeHtml;
        }
      }
    }
  });

  finalizeSequentialQuestion();

  if (questions.length > 0) {
    return { questions, warnings, rawText: fallbackRawText };
  }

  // Pass 4: Raw Text Fallback
  return parseQuestionText(fallbackRawText);
}

/**
 * Fallback parser for raw text (plain text documents or pasted text)
 */
export function parseQuestionText(text: string): ParsedWordResult {
  const warnings: string[] = [];
  const questions: Omit<Question, 'id'>[] = [];

  const cleanText = unescapeHtml(text.replace(/\r\n/g, '\n').replace(/\r/g, '\n'));

  // Split blocks by question markers or "Question" / "Q."
  const questionBlocks = cleanText
    .split(/(?:\n|^)(?=(?:Q(?:uestion)?\s*\d*[\.\:\-]?|\d+[\.\:\-]\s*[A-Z\u0900-\u097F]))/i)
    .map((b) => b.trim())
    .filter(Boolean);

  if (questionBlocks.length === 0) {
    const doubleNewlineBlocks = cleanText.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    if (doubleNewlineBlocks.length > 0) {
      questionBlocks.push(...doubleNewlineBlocks);
    }
  }

  questionBlocks.forEach((block, idx) => {
    const lines = block.split('\n').map((l) => l.trim());
    if (lines.filter(Boolean).length === 0) return;

    let questionText = '';
    const options: { id: string; text: string; isCorrect: boolean }[] = [];
    let correctAnswerStr = '';
    let explanation = '';
    let posMarks = 4;
    let negMarks = 1;

    let currentSection: 'question' | 'explanation' = 'question';

    lines.forEach((line) => {
      if (!line) return;

      const ansMatch = line.match(/^(?:Answer|Correct|Ans|Key|उत्तर)\s*[\:\=]\s*(.+)$/i);
      if (ansMatch) {
        correctAnswerStr = ansMatch[1].trim();
        return;
      }

      const expMatch = line.match(/^(?:Explanation|Solution|Sol|Note|व्याख्या)\s*[\:\=]\s*(.+)$/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
        currentSection = 'explanation';
        return;
      }

      const posMatch = line.match(/^(?:Positive\s*Marks?|Pos\s*Marks?)\s*[\:\=]\s*(.+)$/i);
      if (posMatch) {
        const val = parseFloat(posMatch[1].trim().replace(/[^\d\.\-]/g, ''));
        if (!isNaN(val)) posMarks = val;
        return;
      }

      const negMatch = line.match(/^(?:Negative\s*Marks?|Neg\s*Marks?)\s*[\:\=]\s*(.+)$/i);
      if (negMatch) {
        const val = parseFloat(negMatch[1].trim().replace(/[^\d\.\-]/g, ''));
        if (!isNaN(val)) negMarks = Math.abs(val);
        return;
      }

      const optMatch = line.match(/^(?:[\(\[]?([A-Ea-e1-5])[\)\.\:\-]\s*)(.+)$/);
      if (optMatch && currentSection === 'question') {
        const optionText = optMatch[2].trim();
        options.push({
          id: `opt-${idx}-${options.length + 1}`,
          text: optionText,
          isCorrect: false,
        });
        return;
      }

      if (currentSection === 'explanation') {
        explanation += (explanation ? '\n' : '') + line;
      } else if (!questionText) {
        questionText = line.replace(/^(?:Q(?:uestion)?\s*\d*[\.\:]?|\d+[\.\:]\s*)/i, '').trim();
      } else if (options.length === 0) {
        questionText += '\n' + line;
      }
    });

    if (options.length === 0 && questionText) {
      const inlineOpts = extractOptionsFromText(questionText);
      if (inlineOpts.length >= 2) {
        inlineOpts.forEach((opt, oIdx) => {
          options.push({
            id: `opt-${idx}-${oIdx + 1}`,
            text: opt.text,
            isCorrect: false,
          });
        });
      }
    }

    if (!questionText) return;

    markCorrectOption(options, correctAnswerStr);

    questions.push({
      text: questionText,
      type: options.length === 0 ? 'integer' : 'mcq_single',
      options,
      correctAnswer: options.length === 0 ? correctAnswerStr || '0' : undefined,
      explanation: explanation || 'No detailed explanation provided.',
      positiveMarks: posMarks,
      negativeMarks: negMarks,
      subject: 'General',
      topic: '',
      difficulty: 'medium',
    });
  });

  return { questions, warnings, rawText: cleanText };
}

export async function parseDocxFile(file: File): Promise<ParsedWordResult> {
  const arrayBuffer = await file.arrayBuffer();
  const mammothModule = await import('mammoth');
  const mammothObj = (mammothModule as any).default || mammothModule;

  const htmlResult = await mammothObj.convertToHtml({ arrayBuffer });
  const rawTextResult = await mammothObj.extractRawText({ arrayBuffer });

  return parseDocxHtml(htmlResult.value, rawTextResult.value);
}
