import React, { useState } from 'react';
import { MockTest, TestAttempt } from '../../types';
import { generateResultPDF } from '../../utils/pdfGenerator';
import { exportAttemptsToExcel } from '../../utils/excelExporter';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Award,
  Download,
  X,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';

interface TestAnalyticsModalProps {
  test: MockTest;
  attempts: TestAttempt[];
  isOpen: boolean;
  onClose: () => void;
}

export const TestAnalyticsModal: React.FC<TestAnalyticsModalProps> = ({
  test,
  attempts,
  isOpen,
  onClose,
}) => {
  const { deleteAttempt, clearTestAttempts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [attemptToDelete, setAttemptToDelete] = useState<TestAttempt | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  if (!isOpen) return null;

  const testAttempts = attempts.filter((a) => a.testId === test.id);

  const totalSubmissions = testAttempts.length;
  const highestScore =
    totalSubmissions > 0 ? Math.max(...testAttempts.map((a) => a.score)) : 0;
  const lowestScore =
    totalSubmissions > 0 ? Math.min(...testAttempts.map((a) => a.score)) : 0;
  const avgScore =
    totalSubmissions > 0
      ? (testAttempts.reduce((sum, a) => sum + a.score, 0) / totalSubmissions).toFixed(1)
      : '0';

  const passedCount = testAttempts.filter((a) => a.passed).length;
  const passRate =
    totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;

  const filteredAttempts = testAttempts.filter(
    (a) =>
      a.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.student.phone.includes(searchTerm)
  );

  const downloadCSV = () => {
    if (testAttempts.length === 0) return;

    const headers = [
      'Student Name',
      'Email',
      'Phone',
      'Score',
      'Total Marks',
      'Percentage',
      'Status',
      'Correct',
      'Incorrect',
      'Unattempted',
      'Time Taken (s)',
      'Tab Switches',
      'Submitted At',
    ];

    const rows = testAttempts.map((a) => [
      `"${a.student.name}"`,
      `"${a.student.email}"`,
      `"${a.student.phone}"`,
      a.score,
      a.totalMarks,
      `${a.percentage.toFixed(1)}%`,
      a.passed ? 'PASSED' : 'FAILED',
      a.correctCount,
      a.incorrectCount,
      a.unattemptedCount,
      a.timeTakenSeconds,
      a.tabSwitchCount,
      `"${new Date(a.submittedAt).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${test.title.replace(/[^a-zA-Z0-9]/g, '_')}_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/30 border border-blue-500/40 rounded-2xl text-blue-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{test.title}</h3>
              <p className="text-xs text-slate-400">
                Student Test Attempt Submissions & Performance Analytics
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500">Total Submissions</p>
              <p className="text-xl font-black text-slate-900 mt-1">{totalSubmissions}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500">Class Average</p>
              <p className="text-xl font-black text-blue-600 mt-1">{avgScore} / {test.totalMarks}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500">Highest Score</p>
              <p className="text-xl font-black text-emerald-600 mt-1">{highestScore} / {test.totalMarks}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500">Pass Rate</p>
              <p className="text-xl font-black text-purple-600 mt-1">{passRate}%</p>
            </div>
          </div>

          {/* Table Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {testAttempts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearAllModal(true)}
                  className="flex items-center justify-center gap-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs px-3 py-2.5 rounded-xl transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" /> Clear All Submissions
                </button>
              )}
              <button
                type="button"
                onClick={() => exportAttemptsToExcel(test, attempts)}
                disabled={testAttempts.length === 0}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs disabled:opacity-50 transition shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export Excel Sheet (.xlsx)
              </button>
              <button
                type="button"
                onClick={downloadCSV}
                disabled={testAttempts.length === 0}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-2.5 rounded-xl shadow-xs disabled:opacity-50 transition shrink-0"
              >
                <Download className="w-4 h-4" /> CSV
              </button>
            </div>
          </div>

          {/* Submissions Table */}
          {testAttempts.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No student submissions recorded yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Share the test link with students to receive attempts and instant scorecards.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Score & %</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Time Taken</th>
                      <th className="py-3 px-4">Proctor Warnings</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs font-medium">
                    {filteredAttempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{att.student.name}</div>
                          <div className="text-[11px] text-slate-400">{att.student.email} • {att.student.phone}</div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {att.score} / {att.totalMarks}
                          <span className="block text-[10px] font-semibold text-slate-500">
                            {att.percentage.toFixed(1)}%
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              att.passed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {att.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {att.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {Math.floor(att.timeTakenSeconds / 60)}m {att.timeTakenSeconds % 60}s
                        </td>

                        <td className="py-3.5 px-4">
                          {att.tabSwitchCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <ShieldAlert className="w-3 h-3" /> {att.tabSwitchCount} Tab Switched
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold">Clean</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => generateResultPDF(att)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                              title="Download PDF Report Card"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setAttemptToDelete(att)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            Close Analytics
          </button>
        </div>
      </div>

      {/* Single Attempt Delete Modal */}
      {attemptToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">Delete Student Submission?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove the submission record for <span className="font-bold text-slate-800">{attemptToDelete.student.name}</span>?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAttemptToDelete(null)}
                className="w-1/2 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAttempt(attemptToDelete.id);
                  setAttemptToDelete(null);
                }}
                className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Attempts Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">Clear All Submissions?</h4>
              <p className="text-xs text-slate-500 mt-1">
                This will delete all student attempts recorded for <span className="font-bold text-slate-800">"{test.title}"</span>. This cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="w-1/2 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearTestAttempts(test.id);
                  setShowClearAllModal(false);
                }}
                className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
