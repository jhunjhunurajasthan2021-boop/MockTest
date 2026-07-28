import React, { useState } from 'react';
import { Question, TestSection } from '../../types';
import { parseDocxFile, parseQuestionText } from '../../utils/docxParser';
import { downloadSampleDocxFile } from '../../utils/sampleDocxGenerator';
import { FileText, Upload, AlertCircle, CheckCircle, X, Sparkles, Download, HelpCircle, Layers } from 'lucide-react';
import { FormattedText } from '../common/FormattedText';

interface WordImportModalProps {
  isOpen: boolean;
  sections?: TestSection[];
  defaultSectionId?: string;
  onClose: () => void;
  onImportQuestions: (questions: Omit<Question, 'id'>[]) => void;
}

export const WordImportModal: React.FC<WordImportModalProps> = ({
  isOpen,
  sections = [],
  defaultSectionId,
  onClose,
  onImportQuestions,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    defaultSectionId || (sections[0]?.id || '')
  );
  const [pasteText, setPasteText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<Omit<Question, 'id'>[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDriveBrowser, setShowDriveBrowser] = useState(false);

  if (!isOpen) return null;

  const handleConfirmImport = () => {
    if (parsedQuestions.length === 0) return;
    
    const targetSec = sections.find((s) => s.id === selectedSectionId);

    const updatedQuestions = parsedQuestions.map((q) => ({
      ...q,
      sectionId: selectedSectionId || q.sectionId,
      subject: targetSec ? targetSec.name : q.subject,
      positiveMarks: targetSec ? targetSec.positiveMarks : q.positiveMarks,
      negativeMarks: targetSec ? targetSec.negativeMarks : q.negativeMarks,
    }));

    onImportQuestions(updatedQuestions);
    setParsedQuestions([]);
    setPasteText('');
    setWarnings([]);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await parseDocxFile(file);
      setParsedQuestions(result.questions);
      setWarnings(result.warnings);
      setPasteText(result.rawText);
    } catch (err) {
      alert('Failed to parse Word document. Please verify it is a valid .docx file.');
    } finally {
      setLoading(false);
    }
  };

  const handleDriveFilePicked = async (fileId: string, fileName: string, mimeType: string, accessToken: string) => {
    setShowDriveBrowser(false);
    setLoading(true);
    try {
      let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      
      // If it's a native Google Doc, export it as DOCX
      if (mimeType === 'application/vnd.google-apps.document') {
        const exportMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
        if (!fileName.endsWith('.docx')) {
          fileName += '.docx';
        }
      }

      // Add access_token to URL to avoid CORS preflight options request on redirects
      const urlWithToken = `${downloadUrl}${downloadUrl.includes('?') ? '&' : '?'}access_token=${accessToken}`;

      // Download the file from Google Drive
      const response = await fetch(urlWithToken);

      if (!response.ok) {
        throw new Error('Failed to download file from Google Drive');
      }

      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      const result = await parseDocxFile(file);
      setParsedQuestions(result.questions);
      setWarnings(result.warnings);
      setPasteText(result.rawText);
    } catch (error) {
      console.error(error);
      alert('Failed to import file from Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextParse = () => {
    if (!pasteText.trim()) return;
    const result = parseQuestionText(pasteText);
    setParsedQuestions(result.questions);
    setWarnings(result.warnings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Bulk Import Questions from Word (.docx)</h3>
              <p className="text-xs text-slate-500">
                Upload a .docx file or paste text formatted as Q1. Question statement, A) Option 1, Answer: B
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Target Section Selector if Sections Exist */}
          {sections.length > 0 && (
            <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 space-y-1">
              <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Target Test Section for Imported Questions (किस अनुभाग में प्रश्न जोड़ें?) *
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full text-xs font-bold p-2.5 border border-blue-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.durationMinutes ? `${sec.durationMinutes} Mins` : 'Untimed'} | +{sec.positiveMarks}/-{sec.negativeMarks})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5 sm:mt-0 shadow-sm">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  Need a Sample Word Template? (सैंपल वर्ड फ़ाइल प्रारूप)
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Download our pre-formatted Word document template with tables for 2, 3, 4, 5+ options, solutions, and marking schemes.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={downloadSampleDocxFile}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-4 h-4" />
              Download .docx Sample
            </button>
          </div>

          {/* File Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 transition">
            <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">Upload .docx File</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Supports Microsoft Word documents</p>
            <div className="mt-4 flex items-center justify-center">
              <input
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                className="hidden"
                id="word-file-input"
              />
              <label
                htmlFor="word-file-input"
                className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition shadow-xs"
              >
                {loading ? 'Extracting Text...' : 'Select Word Document'}
              </label>
            </div>
          </div>

          {/* Paste Text Fallback */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Or Paste Document Text Directly</label>
              <button
                type="button"
                onClick={handleTextParse}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Parse Text
              </button>
            </div>
            <textarea
              rows={5}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Example Format:\nQ1. What is the boiling point of water?\nA) 90°C\nB) 100°C\nC) 120°C\nAnswer: B\nExplanation: Pure water boils at 100°C at 1 atm pressure.`}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Parsing Results Preview Table */}
          {parsedQuestions.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-emerald-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Successfully Parsed {parsedQuestions.length} Question(s)
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto divide-y divide-slate-200 text-xs">
                {parsedQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 hover:bg-slate-50 space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-start gap-1">
                      <span className="shrink-0">{idx + 1}.</span>
                      <FormattedText content={q.text} className="flex-1" />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium border flex items-center gap-1 ${
                            opt.isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span className="shrink-0">{String.fromCharCode(65 + oIdx)}.</span>
                          <FormattedText content={opt.text} className="inline-block" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings List */}
          {warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4" /> Parsing Warnings ({warnings.length})
              </div>
              {warnings.map((w, idx) => (
                <p key={idx} className="text-[11px] text-amber-700">
                  • {w}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedQuestions.length === 0}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 transition"
          >
            Import {parsedQuestions.length} Question(s)
          </button>
        </div>
      </div>
    </div>
  );
};
