import React, { useState, useRef } from 'react';
import { Question, QuestionOption, QuestionType, TestSection } from '../../types';
import { FileText, Upload, AlertCircle, CheckCircle, X, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface PdfImportModalProps {
  isOpen: boolean;
  sections?: TestSection[];
  defaultSectionId?: string;
  onClose: () => void;
  onImportQuestions: (questions: Omit<Question, 'id'>[]) => void;
}

export const PdfImportModal: React.FC<PdfImportModalProps> = ({
  isOpen,
  sections = [],
  defaultSectionId,
  onClose,
  onImportQuestions,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    defaultSectionId || (sections[0]?.id || '')
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<Omit<Question, 'id'>[]>([]);
  const [testMetaData, setTestMetaData] = useState<{ title?: string; subject?: string; category?: string }>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMsg(null);
    setLoading(true);
    setExtractedQuestions([]);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const base64Data = dataUrl.split(',')[1] || '';
          let mime = file.type;
          const fileNameLower = file.name.toLowerCase();

          if (!mime) {
            if (fileNameLower.endsWith('.pdf')) mime = 'application/pdf';
            else if (fileNameLower.endsWith('.txt')) mime = 'text/plain';
            else if (fileNameLower.endsWith('.docx')) mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            else mime = 'application/octet-stream';
          }

          let rawText = '';
          if (fileNameLower.endsWith('.txt') || fileNameLower.endsWith('.csv')) {
            try {
              rawText = await file.text();
            } catch (err) {}
          }

          let promptToSend = `Read the attached document/PDF file "${file.name}" carefully and extract all test questions, option choices, correct answer keys, and detailed solutions verbatim.

CRITICAL INSTRUCTIONS FOR CLASSIFYING & FORMATTING QUESTIONS:
1. SINGLE QUESTIONS vs DIRECTION / SET QUESTIONS:
   - Identify whether each question is a standalone single question (e.g., Q13) OR part of a set under a Direction block (e.g. Direction (20-24), Direction (14-16), Passage, Study the following information).
   - FOR DIRECTION / SET QUESTIONS (e.g. Q20 to Q24): You MUST include the full Direction / Passage text at the beginning of EVERY question in that set (Q20, Q21, Q22, Q23, Q24). Format question as:
     "Direction (20-24): [Full Direction / Passage / Table / Rules text]\n\nQuestion [Q Number]: [Actual question text]"
     Do NOT leave out the direction text for Q21, Q22, Q23, Q24 even if it was printed only once at the top of Q20 in the document!
   - FOR STANDALONE SINGLE QUESTIONS:
     Keep the question text clean without any direction header.

2. DETAILED SOLUTIONS & EXPLANATIONS:
   - For Direction / Puzzle / Arrangement questions (e.g. Direction 14-16 with a seating arrangement diagram/solution), include the full arrangement diagram/solution along with the specific question's answer reasoning in the "explanation" field for ALL questions in that range (Q14, Q15, Q16).

3. CORRECT ANSWER KEYS & OPTIONS:
   - Detect correct answer keys verbatim from answer sheets, solution keys, or bold choices (e.g. "14) Answer: E" -> correctOption 4, "15) Answer: B" -> correctOption 1, "Answer: C" -> correctOption 2).
   - Extract ALL option choices verbatim (A, B, C, D, E). Support 4 or 5 options accurately. Do not include option labels "A.", "B." inside option text strings.`;
          if (rawText) {
            promptToSend += `\n\n[FILE TEXT CONTENT]\n${rawText.slice(0, 30000)}`;
          }

          const response = await fetch('/api/ai-assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: promptToSend,
              fileData: {
                base64: base64Data,
                mimeType: mime,
              },
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Server returned error ${response.status}`);
          }

          const data = await response.json();
          const textResponse = data.text || '';

          // Parse JSON from code block
          let strToParse = textResponse;
          const codeBlockMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
          if (codeBlockMatch) {
            strToParse = codeBlockMatch[1].trim();
          } else {
            const firstBrace = textResponse.indexOf('{');
            const lastBrace = textResponse.lastIndexOf('}');
            const firstBracket = textResponse.indexOf('[');
            const lastBracket = textResponse.lastIndexOf(']');

            if (firstBrace !== -1 && lastBrace > firstBrace && (firstBracket === -1 || firstBrace < firstBracket)) {
              strToParse = textResponse.substring(firstBrace, lastBrace + 1);
            } else if (firstBracket !== -1 && lastBracket > firstBracket) {
              strToParse = textResponse.substring(firstBracket, lastBracket + 1);
            }
          }

          const parsed = JSON.parse(strToParse);
          let rawQs: any[] = [];
          if (Array.isArray(parsed)) {
            rawQs = parsed;
          } else if (parsed && typeof parsed === 'object') {
            rawQs = parsed.questions || parsed.questionList || parsed.items || parsed.data || parsed.mcqs || [];
            setTestMetaData({
              title: parsed.title,
              subject: parsed.subject,
              category: parsed.category,
            });
          }

          if (rawQs.length === 0) {
            throw new Error('No valid question objects could be parsed from the PDF/document.');
          }

          const targetSec = sections.find((s) => s.id === selectedSectionId);

          const formattedQs: Omit<Question, 'id'>[] = rawQs.map((q: any, idx: number) => {
            let qText = q.question || q.questionText || q.text || `Question ${idx + 1}`;
            const directionPrefix = q.direction || q.passage || q.groupDirection;
            if (directionPrefix && typeof directionPrefix === 'string' && !qText.toLowerCase().includes(directionPrefix.toLowerCase().slice(0, 15))) {
              qText = `${directionPrefix}\n\n${qText}`;
            }

            let qExpl = q.explanation || q.solution || '';
            const dirExpl = q.directionExplanation || q.directionSolution || q.groupSolution;
            if (dirExpl && typeof dirExpl === 'string' && !qExpl.toLowerCase().includes(dirExpl.toLowerCase().slice(0, 15))) {
              qExpl = `${dirExpl}\n\n${qExpl}`;
            }

            const rawOpts: string[] = Array.isArray(q.options) && q.options.length > 0
              ? q.options.map((opt: any) => String(opt).trim())
              : ['Option A', 'Option B', 'Option C', 'Option D'];

            const correctIndex = typeof q.correctOption === 'number'
              ? q.correctOption
              : typeof q.answer === 'number'
              ? q.answer
              : 0;

            const options: QuestionOption[] = rawOpts.map((optText, oIdx) => ({
              id: `opt-${oIdx + 1}`,
              text: optText,
              isCorrect: oIdx === correctIndex,
            }));

            return {
              text: qText,
              options,
              explanation: qExpl,
              sectionId: selectedSectionId || undefined,
              subject: targetSec ? targetSec.name : parsed.subject || 'General',
              positiveMarks: targetSec ? targetSec.positiveMarks : 2,
              negativeMarks: targetSec ? targetSec.negativeMarks : 0.5,
              type: 'mcq_single' as QuestionType,
              difficulty: (q.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
            };
          });

          setExtractedQuestions(formattedQs);
        } catch (err: any) {
          console.error('Error parsing PDF/doc with AI:', err);
          setErrorMsg(err.message || 'Failed to extract questions from file. Please ensure it is a valid text/PDF document.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg('Error reading file from disk.');
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (extractedQuestions.length === 0) return;

    const targetSec = sections.find((s) => s.id === selectedSectionId);
    const finalQuestions = extractedQuestions.map((q) => ({
      ...q,
      sectionId: selectedSectionId || q.sectionId,
      subject: targetSec ? targetSec.name : q.subject,
      positiveMarks: targetSec ? targetSec.positiveMarks : q.positiveMarks,
      negativeMarks: targetSec ? targetSec.negativeMarks : q.negativeMarks,
    }));

    onImportQuestions(finalQuestions);
    setExtractedQuestions([]);
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                AI PDF & Document Question Extractor
              </h3>
              <p className="text-xs text-slate-300">
                Upload PDF question paper to extract questions verbatim into your test.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Target Section Selector */}
          {sections.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block">Assign to Test Section</label>
                <span className="text-[11px] text-slate-500">
                  Imported questions will inherit positive/negative marks from this section.
                </span>
              </div>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shrink-0"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} (+{sec.positiveMarks} / -{sec.negativeMarks})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* File Upload Box */}
          <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-3xl p-6 text-center transition">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.txt,.csv,.png,.jpg,.jpeg,.webp"
              className="hidden"
            />
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">
              {selectedFile ? selectedFile.name : 'Select PDF or Document Question Paper'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Supports <strong className="text-indigo-700 font-bold">PDF, Word (.docx), TXT, and Images</strong>.
              AI will read the text and structure questions automatically.
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/20 inline-flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Questions...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{selectedFile ? 'Choose Different File' : 'Browse File...'}</span>
                </>
              )}
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3 text-indigo-900 text-xs font-semibold animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600 shrink-0" />
              <div>
                <span className="font-extrabold block">AI Engine is Reading PDF...</span>
                <span className="text-[11px] text-indigo-700">
                  Analyzing document text, extracting question stems, option choices, correct keys, and explanations.
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-900 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Extracted Questions Preview */}
          {extractedQuestions.length > 0 && !loading && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Extracted {extractedQuestions.length} Questions Verbatim
                </span>
                {testMetaData.title && (
                  <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {testMetaData.title}
                  </span>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {extractedQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-slate-800">
                      Q{idx + 1}. {q.text}
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1">
                      {q.options?.map((opt, oIdx) => (
                        <div
                          key={opt.id || oIdx}
                          className={`px-2 py-1 rounded ${
                            opt.isCorrect ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'bg-white border border-slate-200'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}) {opt.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={extractedQuestions.length === 0 || loading}
            onClick={handleConfirmImport}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
              extractedQuestions.length > 0 && !loading
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Import {extractedQuestions.length} Questions into Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
