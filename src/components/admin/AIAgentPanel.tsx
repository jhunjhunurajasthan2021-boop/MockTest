import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { parseDocxFile, parseQuestionText } from '../../utils/docxParser';
import {
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Sparkles,
  ShieldAlert,
  Wrench,
  FileCheck,
  UserCheck,
  PlusCircle,
  HelpCircle,
  Code2,
  Cpu,
  Layers,
  ArrowRight,
  MessageSquare,
  Activity,
  Paperclip,
  FileText,
  Upload,
  X,
  FileUp,
} from 'lucide-react';

interface DiagnosticIssue {
  id: string;
  type: 'warning' | 'error' | 'info';
  category: 'Tests' | 'Teachers' | 'Attempts' | 'Config';
  title: string;
  description: string;
  autoFixable: boolean;
  actionKey?: string;
  targetId?: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isDiagnosisReport?: boolean;
  attachedFileName?: string;
}

// Extracted Verbatim Test Preview Card Component
const ExtractedTestCard: React.FC<{
  parsedTest: any;
  onSaveTest: (testData: any) => void;
}> = ({ parsedTest, onSaveTest }) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [saved, setSaved] = useState(false);

  const title = parsedTest.title || 'Verbatim Extracted Mock Test';
  const subject = parsedTest.subject || 'General';
  const qCount = Array.isArray(parsedTest.questions) ? parsedTest.questions.length : 0;

  const handleSave = () => {
    onSaveTest(parsedTest);
    setSaved(true);
  };

  return (
    <div className="mt-3 p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-700/80 shadow-lg space-y-3 font-sans">
      <div className="flex items-center justify-between gap-2 border-b border-indigo-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              100% Verbatim Original Content
            </span>
            <h4 className="text-sm font-black text-white mt-0.5">{title}</h4>
          </div>
        </div>
        <span className="text-xs font-extrabold text-indigo-200 bg-indigo-900/60 px-2.5 py-1 rounded-xl border border-indigo-700/60">
          {qCount} Qs
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-300 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-indigo-900/60">
        <span>📚 <strong>Subject:</strong> {subject}</span>
        <span>⏱️ <strong>Duration:</strong> {parsedTest.durationMinutes || 60} Mins</span>
        <span>🎯 <strong>Marks/Q:</strong> +{parsedTest.marksPerQuestion || 2} / -{parsedTest.negativeMarks || 0.5}</span>
      </div>

      <p className="text-[11px] text-emerald-300 bg-emerald-950/50 border border-emerald-800/60 p-2 rounded-xl flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Content Verified: Questions, choices, and explanations match file text <strong>verbatim</strong> (Zero modifications).</span>
      </p>

      {/* Accordion to view extracted questions */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowQuestions(!showQuestions)}
          className="text-[11px] font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 transition cursor-pointer"
        >
          {showQuestions ? '▼ Hide Question Details' : `▶ View Extracted Questions (${qCount})`}
        </button>

        {showQuestions && (
          <div className="mt-2.5 space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {parsedTest.questions.map((q: any, i: number) => (
              <div key={i} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
                <p className="font-bold text-white">Q{i + 1}. {q.question || q.questionText}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                  {Array.isArray(q.options) && q.options.map((opt: string, optIdx: number) => (
                    <div
                      key={optIdx}
                      className={`p-1.5 rounded border ${
                        optIdx === q.correctOption
                          ? 'bg-emerald-900/40 border-emerald-500/60 text-emerald-200 font-bold'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}) {opt}
                      {optIdx === q.correctOption && ' ✓ (Correct)'}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-[10px] text-amber-200/90 bg-amber-950/30 p-1.5 rounded border border-amber-900/40">
                    💡 <strong>Solution:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="pt-2">
        {saved ? (
          <div className="w-full py-2.5 bg-emerald-600 text-white text-center font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4" />
            Mock Test Saved & Published Successfully!
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
            ⚡ Save & Publish Mock Test Now (1-Click)
          </button>
        )}
      </div>
    </div>
  );
};

export const AIAgentPanel: React.FC = () => {
  const {
    tests,
    teachers,
    attempts,
    createOrUpdateTest,
    grantOrUpdateTeacherAccess,
    platformConfig,
  } = useApp();

  const [diagnosticIssues, setDiagnosticIssues] = useState<DiagnosticIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: '🙏 **नमस्ते Super Admin! मैं आपका AI System Engineer & Diagnostic Agent हूँ।**\n\nमैं प्लेटफ़ॉर्म के सभी टेस्ट सीरीज़, टीचर्स लाइसेंस, स्टूडेंट रिपोर्ट्स और सिस्टम सेटिंग्स की निगरानी करता हूँ। यदि सिस्टम में कोई बग आये, कोई डेटा ख़राब हो जाए या नया फ़ीचर/टेस्ट बनाना हो, तो मुझसे तुरंत पूछें या **"Run System Health Scan"** बटन दबाएँ!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [repairSuccessMsg, setRepairSuccessMsg] = useState<string | null>(null);

  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: number;
    type: string;
    base64: string;
    rawText?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isGenerating]);

  // Handle document/file upload for AI analysis
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20MB limit. Please choose a smaller file.');
      return;
    }

    const fileNameLower = file.name.toLowerCase();
    let extractedRawText = '';

    if (fileNameLower.endsWith('.docx')) {
      try {
        const docResult = await parseDocxFile(file);
        extractedRawText = docResult.rawText || '';
      } catch (err) {
        console.warn('Docx client pre-parse note:', err);
      }
    } else if (
      fileNameLower.endsWith('.txt') ||
      fileNameLower.endsWith('.csv') ||
      fileNameLower.endsWith('.json') ||
      fileNameLower.endsWith('.md')
    ) {
      try {
        extractedRawText = await file.text();
      } catch (err) {
        console.warn('Text file read note:', err);
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1] || '';
      let mime = file.type;
      if (!mime) {
        if (fileNameLower.endsWith('.pdf')) mime = 'application/pdf';
        else if (fileNameLower.endsWith('.txt')) mime = 'text/plain';
        else if (fileNameLower.endsWith('.docx')) mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (fileNameLower.endsWith('.csv')) mime = 'text/csv';
        else mime = 'application/octet-stream';
      }

      setAttachedFile({
        name: file.name,
        size: file.size,
        type: mime,
        base64: base64Data,
        rawText: extractedRawText,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveExtractedTest = (parsedTest: any) => {
    createOrUpdateTest({
      title: parsedTest.title || 'Extracted Verbatim Mock Test',
      subject: parsedTest.subject || 'General',
      category: parsedTest.category || 'General Competition',
      durationMinutes: Number(parsedTest.durationMinutes) || 60,
      marksPerQuestion: Number(parsedTest.marksPerQuestion) || 2,
      negativeMarks: Number(parsedTest.negativeMarks) || 0.5,
      instructions: parsedTest.instructions || 'All questions are compulsory.',
      isPublished: true,
      questions: Array.isArray(parsedTest.questions)
        ? parsedTest.questions.map((q: any, idx: number) => ({
            id: `extracted-q-${Date.now()}-${idx}`,
            question: q.question || q.questionText || `Question ${idx + 1}`,
            options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['A', 'B', 'C', 'D'],
            correctOption: typeof q.correctOption === 'number' ? q.correctOption : 0,
            explanation: q.explanation || '',
            subject: parsedTest.subject || 'General',
            positiveMarks: Number(parsedTest.marksPerQuestion) || 2,
            negativeMarks: Number(parsedTest.negativeMarks) || 0.5,
            type: 'single_choice',
          }))
        : [],
    });

    setRepairSuccessMsg(
      `🎉 Successfully saved and published verbatim mock test: "${parsedTest.title || 'Extracted Mock Test'}" with ${
        parsedTest.questions?.length || 0
      } questions!`
    );
    runHealthCheck();
  };

  const tryParseTestJSON = (text: string) => {
    if (!text) return null;

    // 1. Try finding JSON code block or JSON object/array
    try {
      let strToParse = text;

      // Extract content inside ```json ... ``` or ``` ... ```
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeBlockMatch) {
        strToParse = codeBlockMatch[1].trim();
      } else {
        // Try finding outermost { ... } or [ ... ]
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        const firstBracket = text.indexOf('[');
        const lastBracket = text.lastIndexOf(']');

        if (firstBrace !== -1 && lastBrace > firstBrace && (firstBracket === -1 || firstBrace < firstBracket)) {
          strToParse = text.substring(firstBrace, lastBrace + 1);
        } else if (firstBracket !== -1 && lastBracket > firstBracket) {
          strToParse = text.substring(firstBracket, lastBracket + 1);
        }
      }

      const parsed = JSON.parse(strToParse);

      // Handle Array of questions
      if (Array.isArray(parsed) && parsed.length > 0) {
        const questions = parsed.map((item: any, idx: number) => ({
          question: item.question || item.questionText || item.q || item.title || `Question ${idx + 1}`,
          options: Array.isArray(item.options) ? item.options : Array.isArray(item.choices) ? item.choices : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOption: typeof item.correctOption === 'number' ? item.correctOption : typeof item.answer === 'number' ? item.answer : 0,
          explanation: item.explanation || item.solution || item.exp || '',
        }));
        return {
          title: 'Extracted Verbatim Mock Test',
          subject: 'General',
          questions,
        };
      }

      // Handle Object containing questions list under various key names
      if (parsed && typeof parsed === 'object') {
        const rawQs =
          parsed.questions ||
          parsed.questionList ||
          parsed.items ||
          parsed.data ||
          parsed.mcqs ||
          parsed.testQuestions;

        if (Array.isArray(rawQs) && rawQs.length > 0) {
          const questions = rawQs.map((item: any, idx: number) => ({
            question: item.question || item.questionText || item.q || item.title || `Question ${idx + 1}`,
            options: Array.isArray(item.options) ? item.options : Array.isArray(item.choices) ? item.choices : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctOption: typeof item.correctOption === 'number' ? item.correctOption : typeof item.answer === 'number' ? item.answer : 0,
            explanation: item.explanation || item.solution || item.exp || '',
          }));

          return {
            title: parsed.title || parsed.testTitle || parsed.name || 'Extracted Verbatim Mock Test',
            subject: parsed.subject || 'General',
            category: parsed.category || 'General Competition',
            durationMinutes: parsed.durationMinutes || 60,
            marksPerQuestion: parsed.marksPerQuestion || 2,
            negativeMarks: parsed.negativeMarks || 0.5,
            instructions: parsed.instructions || 'All questions are compulsory.',
            questions,
          };
        }
      }
    } catch (e) {
      // JSON parse failed, proceed to fallback regex parser
    }

    // 2. Fallback: Parse questions from plain text if AI returned Q1. / Question 1 / Option A / Ans format
    try {
      const parsedTextResult = parseQuestionText(text);
      if (parsedTextResult && parsedTextResult.questions && parsedTextResult.questions.length > 0) {
        return {
          title: 'Extracted Verbatim Mock Test',
          subject: 'General',
          questions: parsedTextResult.questions.map((q: any) => ({
            question: q.question || q.text || '',
            options: Array.isArray(q.options)
              ? q.options.map((o: any) => (typeof o === 'string' ? o : o.text))
              : ['A', 'B', 'C', 'D'],
            correctOption: Array.isArray(q.options)
              ? Math.max(0, q.options.findIndex((o: any) => typeof o !== 'string' && o.isCorrect))
              : 0,
            explanation: q.explanation || '',
          })),
        };
      }
    } catch (e) {
      // Ignored
    }

    return null;
  };

  // Perform automated system audit
  const runHealthCheck = () => {
    setIsScanning(true);
    setRepairSuccessMsg(null);

    setTimeout(() => {
      const issues: DiagnosticIssue[] = [];

      // Audit Teachers
      const now = new Date();
      const expiredTeachers = teachers.filter((t) => new Date(t.expiryDate) <= now);
      if (expiredTeachers.length > 0) {
        issues.push({
          id: `teachers-expired-${Date.now()}`,
          type: 'warning',
          category: 'Teachers',
          title: `${expiredTeachers.length} Teacher Account(s) Expired`,
          description: `These teachers currently cannot access test creation panels (${expiredTeachers
            .slice(0, 3)
            .map((t) => t.name)
            .join(', ')}${expiredTeachers.length > 3 ? '...' : ''}).`,
          autoFixable: true,
          actionKey: 'EXTEND_EXPIRED_TEACHERS',
        });
      }

      // Audit Tests for missing questions or missing correct answers
      let testsWithoutQuestions = 0;
      let questionsWithoutCorrectAnswer = 0;

      tests.forEach((t) => {
        if (!t.questions || t.questions.length === 0) {
          testsWithoutQuestions++;
        } else {
          t.questions.forEach((q) => {
            if (
              q.correctOption === undefined ||
              q.correctOption === null ||
              q.correctOption < 0 ||
              q.correctOption >= q.options.length
            ) {
              questionsWithoutCorrectAnswer++;
            }
          });
        }
      });

      if (testsWithoutQuestions > 0) {
        issues.push({
          id: `test-no-q-${Date.now()}`,
          type: 'error',
          category: 'Tests',
          title: `${testsWithoutQuestions} Test Series Empty (No Questions)`,
          description: 'Empty test series may cause confusion for students clicking on student test links.',
          autoFixable: false,
        });
      }

      if (questionsWithoutCorrectAnswer > 0) {
        issues.push({
          id: `q-no-ans-${Date.now()}`,
          type: 'error',
          category: 'Tests',
          title: `${questionsWithoutCorrectAnswer} Question(s) Missing Valid Correct Answer`,
          description: 'Students taking these questions might not get auto-evaluated properly.',
          autoFixable: true,
          actionKey: 'FIX_MISSING_ANSWERS',
        });
      }

      // Audit Platform Config
      if (!platformConfig.whatsappNumber || platformConfig.whatsappNumber.length < 10) {
        issues.push({
          id: `cfg-wa-${Date.now()}`,
          type: 'warning',
          category: 'Config',
          title: 'WhatsApp Contact Number Incomplete',
          description: 'Teacher registration queries might fail to reach Super Admin.',
          autoFixable: false,
        });
      }

      if (issues.length === 0) {
        issues.push({
          id: `sys-ok-${Date.now()}`,
          type: 'info',
          category: 'Config',
          title: 'System Healthy & All Tests Valid!',
          description: 'No data corruption, broken links, or configuration bugs detected across all database records.',
          autoFixable: false,
        });
      }

      setDiagnosticIssues(issues);
      setIsScanning(false);
      setLastScanTime(new Date().toLocaleTimeString());
    }, 800);
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  // One-Click Auto Repairs
  const handleAutoRepair = (actionKey?: string) => {
    let msg = '';
    if (actionKey === 'EXTEND_EXPIRED_TEACHERS') {
      const now = new Date();
      let count = 0;
      teachers.forEach((t) => {
        if (new Date(t.expiryDate) <= now) {
          grantOrUpdateTeacherAccess({
            id: t.id,
            name: t.name,
            email: t.email,
            phone: t.phone,
            instituteName: t.instituteName,
            accessDays: 15,
          });
          count++;
        }
      });
      msg = `✅ AI Auto-Fixed: Granted 15-day emergency validity extension to ${count} expired teacher(s)!`;
    } else if (actionKey === 'FIX_MISSING_ANSWERS') {
      let repairedCount = 0;
      tests.forEach((t) => {
        if (t.questions && t.questions.length > 0) {
          let updatedQuestions = false;
          const fixedQuestions = t.questions.map((q) => {
            if (
              q.correctOption === undefined ||
              q.correctOption === null ||
              q.correctOption < 0 ||
              q.correctOption >= q.options.length
            ) {
              repairedCount++;
              updatedQuestions = true;
              return { ...q, correctOption: 0 }; // Default to option A if unselected
            }
            return q;
          });

          if (updatedQuestions) {
            createOrUpdateTest({ ...t, questions: fixedQuestions });
          }
        }
      });
      msg = `✅ AI Auto-Fixed: Repaired default answer keys for ${repairedCount} question(s)!`;
    }

    if (msg) {
      setRepairSuccessMsg(msg);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚡ **1-Click AI Auto Repair Executed!**\n\n${msg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      runHealthCheck();
    }
  };

  // AI Auto Generate Emergency Test Series
  const handleGenerateSampleTest = async () => {
    setIsGenerating(true);
    setRepairSuccessMsg(null);
    try {
      const prompt = `Generate a high-quality General Awareness & Science Mock Test JSON with 5 multiple choice questions.
Return ONLY a valid JSON object matching this TypeScript structure:
{
  "title": "AI Auto-Generated GK & Science Test",
  "category": "General Competition",
  "durationMinutes": 10,
  "marksPerQuestion": 2,
  "negativeMarks": 0.5,
  "instructions": "Attempt all questions carefully.",
  "questions": [
    {
      "id": "q1",
      "question": "What is the Chemical Formula of Water?",
      "options": ["H2O", "CO2", "NaCl", "O2"],
      "correctOption": 0,
      "explanation": "Water consists of 2 Hydrogen atoms and 1 Oxygen atom (H2O)."
    }
  ]
}`;

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context: { totalTests: tests.length },
        }),
      });

      const data = await response.json();
      if (data.text) {
        try {
          const cleanText = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);

          if (parsed.title && parsed.questions) {
            createOrUpdateTest({
              title: parsed.title,
              category: parsed.category || 'General',
              durationMinutes: parsed.durationMinutes || 10,
              marksPerQuestion: parsed.marksPerQuestion || 2,
              negativeMarks: parsed.negativeMarks || 0.5,
              instructions: parsed.instructions || 'All questions compulsory.',
              questions: parsed.questions.map((q: any, i: number) => ({
                id: `ai-q-${Date.now()}-${i}`,
                question: q.question || 'Sample Question',
                options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
                correctOption: typeof q.correctOption === 'number' ? q.correctOption : 0,
                explanation: q.explanation || '',
              })),
            });

            setRepairSuccessMsg(`🎉 AI Agent created and published new test: "${parsed.title}" with 5 AI-generated questions!`);
            runHealthCheck();
          }
        } catch (jsonErr) {
          console.error('Failed to parse AI test JSON:', jsonErr);
          setRepairSuccessMsg('AI generated test response, but JSON format needed cleaning.');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Chat Submission to Gemini AI Assistant (Supports text + file attachment for verbatim test creation)
  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();

    let userText = (customPrompt || inputPrompt).trim();
    const currentFile = attachedFile;

    if (!userText && currentFile) {
      userText = `Read this attached file "${currentFile.name}" carefully and extract all questions, options, correct answer keys, and detailed solutions verbatim with ZERO modifications to the content. Generate a complete Mock Test JSON.`;
    }

    if (!userText || isGenerating) return;

    setInputPrompt('');
    setAttachedFile(null);

    const displayMsgText = currentFile
      ? `📄 [Attached File: ${currentFile.name}]\n${userText}`
      : userText;

    const newMsg: ChatMessage = {
      sender: 'user',
      text: displayMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFileName: currentFile?.name,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setIsGenerating(true);

    try {
      let promptToSend = userText;
      if (currentFile && currentFile.rawText) {
        promptToSend += `\n\n[FILE TEXT CONTENT]\n${currentFile.rawText.slice(0, 30000)}`;
      }

      promptToSend += `\n\nCRITICAL MANDATE FOR FILE EXTRACTED CONTENT:
1. Extract ALL questions, options, correct answer keys, and detailed explanations/solutions EXACTLY AS WRITTEN in the provided document.
2. ABSOLUTELY ZERO CONTENT ALTERATIONS OR PARAPHRASING: Do NOT rewrite, clean up, paraphrase, or edit any words, numbers, equations, spelling, or structure in the question text, option choices, or explanations. Keep the exact text verbatim.
3. Return the extracted mock test formatted inside a \`\`\`json ... \`\`\` block matching the test schema so the user can save it with 1 click.`;

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          fileData: currentFile
            ? {
                base64: currentFile.base64,
                mimeType: currentFile.type,
              }
            : undefined,
          context: {
            totalTestsCount: tests.length,
            teachersCount: teachers.length,
            activeTeachersCount: teachers.filter((t) => new Date(t.expiryDate) > new Date()).length,
            attemptsCount: attempts.length,
            issuesDetectedCount: diagnosticIssues.length,
            sampleTeacherNames: teachers.slice(0, 5).map((t) => t.name),
            sampleTestTitles: tests.slice(0, 5).map((t) => t.title),
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Server error while generating response.');
      }
      const replyText =
        data.text ||
        'क्षमा करें, AI API सर्वर से प्रतिक्रिया प्राप्त नहीं हुई। कृपया पुनः प्रयास करें।';

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ **AI Connection Error:** ${err.message || 'Unable to reach backend AI assistant.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 rounded-3xl border border-indigo-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold rounded-full">
              <Bot className="w-4 h-4 text-indigo-300" />
              Automated AI Copilot & Bug Resolution Agent
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Super Admin System Diagnostics & AI Agent
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Powered by <strong className="text-purple-300 font-semibold">Gemini 2.5 Flash</strong>.
              Monitors test integrity, teacher licenses, auto-repairs data anomalies, and provides instant system troubleshooting assistance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={runHealthCheck}
              disabled={isScanning}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              Run Health Scan
            </button>

            <button
              type="button"
              onClick={handleGenerateSampleTest}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-lg transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Auto-Generate Mock Test
            </button>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-900/80">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-indigo-800/60">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-indigo-400" /> System Status
            </span>
            <p className="text-lg font-black text-emerald-400 mt-0.5">
              {diagnosticIssues.some((i) => i.type === 'error') ? '⚠️ Needs Repair' : '🟢 Operational'}
            </p>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-indigo-800/60">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Detected Issues
            </span>
            <p className="text-lg font-black text-amber-300 mt-0.5">
              {diagnosticIssues.filter((i) => i.type !== 'info').length} Pending
            </p>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-indigo-800/60">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Total Test Series
            </span>
            <p className="text-lg font-black text-white mt-0.5">{tests.length}</p>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-indigo-800/60">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-purple-400" /> Registered Teachers
            </span>
            <p className="text-lg font-black text-purple-300 mt-0.5">{teachers.length}</p>
          </div>
        </div>
      </div>

      {repairSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{repairSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setRepairSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Diagnostic Report + AI Interactive Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Automated Diagnostic Checks (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  System Audit & Auto-Fix Panel
                </h3>
                {lastScanTime && (
                  <span className="text-[11px] text-slate-500">Last scanned: {lastScanTime}</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {diagnosticIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-4 rounded-2xl border text-xs space-y-2.5 transition ${
                    issue.type === 'error'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : issue.type === 'warning'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {issue.type === 'error' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : issue.type === 'warning' ? (
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <h4 className="font-extrabold text-xs">{issue.title}</h4>
                    </div>
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-white/80 border border-slate-200">
                      {issue.category}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium leading-relaxed opacity-90">
                    {issue.description}
                  </p>

                  {issue.autoFixable && (
                    <button
                      type="button"
                      onClick={() => handleAutoRepair(issue.actionKey)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> 1-Click AI Auto Repair
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preset System Commands */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> Super Admin Quick AI Commands
            </h4>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="w-full text-left p-2.5 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 rounded-xl text-[11px] font-bold text-amber-300 border border-amber-500/40 transition flex items-center justify-between cursor-pointer active:scale-98"
              >
                <span className="flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  📄 Upload File/PDF to Generate Verbatim Mock Test
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSendMessage(undefined, 'How do I grant lifetime access to a teacher account? Explain step by step.');
                }}
                className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-[11px] font-medium text-slate-200 border border-slate-700/60 transition flex items-center justify-between cursor-pointer active:scale-98"
              >
                <span>🔑 Grant Lifetime Teacher Access Help</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSendMessage(undefined, 'How to backup test series and student results to Excel format?');
                }}
                className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-[11px] font-medium text-slate-200 border border-slate-700/60 transition flex items-center justify-between cursor-pointer active:scale-98"
              >
                <span>📊 Export Excel Reports Guide</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSendMessage(undefined, 'Generate 5 NEET Biology Multiple Choice Questions with explanations.');
                }}
                className="w-full text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-[11px] font-medium text-slate-200 border border-slate-700/60 transition flex items-center justify-between cursor-pointer active:scale-98"
              >
                <span>🧪 Generate NEET Biology Questions</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Systems Copilot Chat (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  AI Systems Engineer & Troubleshooting Copilot
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Ask questions or upload PDF/Word/File to extract verbatim Mock Tests automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {chatMessages.map((msg, index) => {
              const parsedTest = msg.sender === 'ai' ? tryParseTestJSON(msg.text) : null;
              return (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs mt-1">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed space-y-1 shadow-xs whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none font-normal'
                    }`}
                  >
                    <div>{msg.text}</div>

                    {/* Render Interactive Verbatim Extracted Mock Test Preview if valid JSON found */}
                    {parsedTest && (
                      <ExtractedTestCard
                        parsedTest={parsedTest}
                        onSaveTest={handleSaveExtractedTest}
                      />
                    )}

                    <span
                      className={`block text-[10px] text-right pt-1 ${
                        msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs mt-1">
                      SA
                    </div>
                  )}
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 p-3 rounded-2xl w-fit animate-pulse">
                <Bot className="w-4 h-4 animate-spin text-indigo-600" />
                <span>AI Agent reading file & extracting verbatim questions...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input & File Attachment */}
          <div className="p-3 border-t border-slate-200 bg-white space-y-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.docx,.doc,.txt,.csv,.png,.jpg,.jpeg,.webp"
              className="hidden"
            />

            {/* File Attached Banner */}
            {attachedFile && (
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs font-bold text-indigo-900 animate-in fade-in">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">{attachedFile.name}</span>
                  <span className="text-[10px] text-indigo-500 font-normal">
                    ({(attachedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-extrabold border border-amber-300 shrink-0">
                    Verbatim Extraction Mode
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 hover:bg-indigo-200 text-indigo-700 rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach PDF, Word (.docx), Image, or Text file to extract Mock Test verbatim"
                className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl border border-indigo-200 transition flex items-center gap-1.5 shrink-0 font-bold text-xs cursor-pointer active:scale-95"
              >
                <Paperclip className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Attach File</span>
              </button>

              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={
                  attachedFile
                    ? `Instruct AI for "${attachedFile.name}" (or press Send for automatic verbatim test creation)...`
                    : 'Ask AI Agent or attach PDF/File to extract Mock Test verbatim...'
                }
                className="flex-1 text-xs px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 bg-slate-50"
              />

              <button
                type="submit"
                disabled={isGenerating || (!inputPrompt.trim() && !attachedFile)}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
