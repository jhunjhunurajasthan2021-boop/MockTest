import React, { useState, useRef } from 'react';
import { Question, QuestionType, DifficultyLevel, TestSection } from '../../types';
import { Plus, Trash2, CheckCircle2, Image as ImageIcon, Sparkles, Layers, Clipboard, Upload, X, Eye } from 'lucide-react';
import { FormattedText } from '../common/FormattedText';

interface ManualQuestionFormProps {
  initialQuestion?: Question;
  sections?: TestSection[];
  defaultSectionId?: string;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

export const ManualQuestionForm: React.FC<ManualQuestionFormProps> = ({
  initialQuestion,
  sections = [],
  defaultSectionId,
  onSave,
  onCancel,
}) => {
  const [sectionId, setSectionId] = useState<string>(
    initialQuestion?.sectionId || defaultSectionId || (sections[0]?.id || '')
  );
  const [text, setText] = useState(initialQuestion?.text || '');
  const [type, setType] = useState<QuestionType>(initialQuestion?.type || 'mcq_single');
  const [subject, setSubject] = useState(
    initialQuestion?.subject || (sections.find((s) => s.id === sectionId)?.name) || 'General'
  );
  const [topic, setTopic] = useState(initialQuestion?.topic || '');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialQuestion?.difficulty || 'medium');
  const [positiveMarks, setPositiveMarks] = useState<number>(
    initialQuestion?.positiveMarks ?? (sections.find((s) => s.id === sectionId)?.positiveMarks ?? 4)
  );
  const [negativeMarks, setNegativeMarks] = useState<number>(
    initialQuestion?.negativeMarks ?? (sections.find((s) => s.id === sectionId)?.negativeMarks ?? 1)
  );
  const [explanation, setExplanation] = useState(initialQuestion?.explanation || '');
  const [correctAnswer, setCorrectAnswer] = useState(initialQuestion?.correctAnswer || '');
  const [imageUrl, setImageUrl] = useState(initialQuestion?.imageUrl || '');

  // Refs for cursor insertion
  const textRef = useRef<HTMLTextAreaElement>(null);
  const explanationRef = useRef<HTMLTextAreaElement>(null);
  const optionInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Hidden File Inputs
  const qTextFileInputRef = useRef<HTMLInputElement>(null);
  const imgUrlFileInputRef = useRef<HTMLInputElement>(null);
  const explanationFileInputRef = useRef<HTMLInputElement>(null);
  const optionFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle section change
  const handleSectionChange = (newSecId: string) => {
    setSectionId(newSecId);
    const selectedSec = sections.find((s) => s.id === newSecId);
    if (selectedSec) {
      setSubject(selectedSec.name);
      setPositiveMarks(selectedSec.positiveMarks);
      setNegativeMarks(selectedSec.negativeMarks);
    }
  };

  const [options, setOptions] = useState<{ id: string; text: string; isCorrect: boolean }[]>(() => {
    if (initialQuestion?.options && initialQuestion.options.length > 0) {
      return initialQuestion.options.map((opt: any, i: number) => {
        if (typeof opt === 'string') {
          return {
            id: `opt-${i}`,
            text: opt,
            isCorrect: i === (initialQuestion.correctOption ?? 0),
          };
        }
        return {
          id: opt?.id || `opt-${i}`,
          text: opt?.text || '',
          isCorrect: typeof opt?.isCorrect === 'boolean' ? opt.isCorrect : i === (initialQuestion.correctOption ?? 0),
        };
      });
    }
    return [
      { id: 'opt-1', text: '', isCorrect: true },
      { id: 'opt-2', text: '', isCorrect: false },
      { id: 'opt-3', text: '', isCorrect: false },
      { id: 'opt-4', text: '', isCorrect: false },
    ];
  });

  // Helper to insert image HTML tag into target string
  const insertImageTag = (
    el: HTMLTextAreaElement | HTMLInputElement | null,
    currentVal: string,
    imgDataUrl: string
  ): string => {
    const imgTag = `<img src="${imgDataUrl}" alt="Question Image" class="max-w-full h-auto rounded-lg my-2 border border-slate-200 shadow-xs" />`;
    if (el && typeof el.selectionStart === 'number') {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const prefix = currentVal.substring(0, start);
      const suffix = currentVal.substring(end);
      const sepBefore = prefix.length > 0 && !prefix.endsWith('\n') ? '\n' : '';
      const sepAfter = suffix.length > 0 && !suffix.startsWith('\n') ? '\n' : '';
      return prefix + sepBefore + imgTag + sepAfter + suffix;
    }
    return currentVal ? `${currentVal}\n${imgTag}` : imgTag;
  };

  // Helper to handle paste event containing image binary
  const handlePasteEvent = (
    e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>,
    onImageExtracted: (dataUrl: string) => void
  ) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target?.result as string;
            if (dataUrl) {
              onImageExtracted(dataUrl);
            }
          };
          reader.readAsDataURL(file);
        }
        return;
      }
    }
  };

  // Helper to trigger reading system clipboard image
  const handleClipboardRead = async (onImageExtracted: (dataUrl: string) => void) => {
    try {
      if (!navigator.clipboard?.read) {
        alert('Browsers Clipboard API restricted. Simply press Ctrl+V inside the input/textarea box to paste copied images directly!');
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      let found = false;
      for (const item of clipboardItems) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          found = true;
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target?.result as string;
            if (dataUrl) onImageExtracted(dataUrl);
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
      if (!found) {
        alert('No image found in clipboard. Copy an image first (e.g. Win+Shift+S or Right click -> Copy Image) and click this button or press Ctrl+V!');
      }
    } catch {
      alert('Clipboard access popup closed or unsupported. Simply press Ctrl+V inside the text area to paste your image!');
    }
  };

  // Helper to process uploaded image file
  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onImageExtracted: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) onImageExtracted(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddOption = () => {
    if (options.length >= 6) return;
    setOptions([
      ...options,
      { id: `opt-${Date.now()}-${options.length + 1}`, text: '', isCorrect: false },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, i) => i !== index);
    if (!updated.some((o) => o.isCorrect) && updated.length > 0) {
      updated[0].isCorrect = true;
    }
    setOptions(updated);
  };

  const handleOptionTextChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index].text = val;
    setOptions(updated);
  };

  const handleOptionCorrectToggle = (index: number) => {
    if (type === 'mcq_single' || type === 'true_false') {
      const updated = options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      }));
      setOptions(updated);
    } else {
      const updated = [...options];
      updated[index].isCorrect = !updated[index].isCorrect;
      setOptions(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Please enter question statement text.');
      return;
    }

    if (type !== 'integer' && type !== 'fill_blanks') {
      const validOptions = options.filter((o) => o.text.trim());
      if (validOptions.length < 2) {
        alert('Please provide at least 2 non-empty options.');
        return;
      }
      if (!validOptions.some((o) => o.isCorrect)) {
        alert('Please mark at least one option as correct.');
        return;
      }
    }

    const savedQuestion: Question = {
      id: initialQuestion?.id || `q-${Date.now()}`,
      text: text.trim(),
      type,
      options: type === 'integer' || type === 'fill_blanks' ? [] : options.filter((o) => o.text.trim()),
      correctAnswer: type === 'integer' || type === 'fill_blanks' ? correctAnswer.trim() : undefined,
      explanation: explanation.trim() || 'No detailed solution provided.',
      positiveMarks,
      negativeMarks,
      subject,
      sectionId: sectionId || undefined,
      topic,
      difficulty,
      imageUrl: imageUrl.trim() || undefined,
    };

    onSave(savedQuestion);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      {/* Title Bar & Copy Paste Tip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {initialQuestion ? 'Edit Question' : 'Add New Question'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ctrl+V karke text boxes me direct image paste kar sakte hain!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5">
            <Clipboard className="w-3.5 h-3.5" /> Direct Image Copy-Paste Active
          </span>
        </div>
      </div>

      {sections.length > 0 && (
        <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-1">
          <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            Assign to Test Section / Subject (अनुभाग का चयन करें) *
          </label>
          <select
            value={sectionId}
            onChange={(e) => handleSectionChange(e.target.value)}
            className="w-full text-xs font-bold p-2.5 border border-blue-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
          >
            {sections.map((sec, secIdx) => (
              <option key={sec.id || `sec-${secIdx}`} value={sec.id}>
                {sec.name} ({sec.durationMinutes ? `${sec.durationMinutes} Mins` : 'Untimed'} | +{sec.positiveMarks}/-{sec.negativeMarks})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Row 1: Question Type & Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Question Type</label>
          <select
            value={type}
            onChange={(e) => {
              const newType = e.target.value as QuestionType;
              setType(newType);
              if (newType === 'true_false') {
                setOptions([
                  { id: 'tf-1', text: 'True', isCorrect: true },
                  { id: 'tf-2', text: 'False', isCorrect: false },
                ]);
              }
            }}
            className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="mcq_single">MCQ (Single Correct)</option>
            <option value="mcq_multiple">MCQ (Multiple Correct)</option>
            <option value="true_false">True / False</option>
            <option value="integer">Numerical / Integer Answer</option>
            <option value="fill_blanks">Fill in the Blanks</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Physics, Chemistry"
            className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
            className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Row 2: Question Statement with Copy-Paste Image Controls */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            Question Text Statement *
            <span className="text-[11px] font-normal text-slate-500">(Supports Ctrl+V Image Paste)</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                handleClipboardRead((dataUrl) => {
                  setText((prev) => insertImageTag(textRef.current, prev, dataUrl));
                })
              }
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition"
              title="Paste image from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5 text-blue-600" />
              Paste Image
            </button>

            <button
              type="button"
              onClick={() => qTextFileInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 transition"
              title="Upload image file from disk"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              Upload File
            </button>
            <input
              ref={qTextFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleFileInputChange(e, (dataUrl) => {
                  setText((prev) => insertImageTag(textRef.current, prev, dataUrl));
                })
              }
            />
          </div>
        </div>

        <textarea
          ref={textRef}
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={(e) =>
            handlePasteEvent(e, (dataUrl) => {
              setText((prev) => insertImageTag(textRef.current, prev, dataUrl));
            })
          }
          placeholder="Enter question statement... (Tip: Copy image anywhere & press Ctrl+V directly here to embed diagram!)"
          className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-2xs font-sans"
          required
        />

        {/* Live Preview if question contains image or HTML tags */}
        {((text || '').includes('<img') || (text || '').includes('data:image')) && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-500" /> Rendered Question Preview:
            </span>
            <FormattedText content={text} className="text-xs text-slate-900 font-medium" />
          </div>
        )}
      </div>

      {/* Optional Diagram / Image URL with Paste & Upload */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">
            Optional Question Image / Diagram (URL or Pasted Image)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                handleClipboardRead((dataUrl) => {
                  setImageUrl(dataUrl);
                })
              }
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition"
            >
              <Clipboard className="w-3.5 h-3.5 text-blue-600" />
              Paste Clipboard Image
            </button>
            <button
              type="button"
              onClick={() => imgUrlFileInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 transition"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              Select File
            </button>
            <input
              ref={imgUrlFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleFileInputChange(e, (dataUrl) => {
                  setImageUrl(dataUrl);
                })
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onPaste={(e) =>
              handlePasteEvent(e, (dataUrl) => {
                setImageUrl(dataUrl);
              })
            }
            placeholder="https://... or press Ctrl+V here to paste copied image"
            className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 font-mono"
          />
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Image Preview Thumbnail */}
        {imageUrl && (
          <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl inline-block">
            <img
              src={imageUrl}
              alt="Diagram preview"
              className="max-h-48 rounded-lg object-contain border border-slate-300"
            />
          </div>
        )}
      </div>

      {/* Options or Answer Entry */}
      {type === 'integer' || type === 'fill_blanks' ? (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Correct Numerical / Text Answer *
          </label>
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            placeholder="e.g. 25 or 3.14"
            className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-slate-800">
                Answer Options & Correct Answer Selection
              </label>
              <p className="text-[11px] text-slate-500">
                Each option field also supports Ctrl+V image copy-pasting!
              </p>
            </div>
            {type !== 'true_false' && options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            )}
          </div>

          <div className="space-y-3">
            {options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              return (
                <div key={opt.id || `opt-${idx}`} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOptionCorrectToggle(idx)}
                      className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                        opt.isCorrect
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                      title={opt.isCorrect ? 'Correct Option' : 'Mark as Correct Option'}
                    >
                      {letter}
                    </button>

                    <input
                      ref={(el) => (optionInputRefs.current[idx] = el)}
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      onPaste={(e) =>
                        handlePasteEvent(e, (dataUrl) => {
                          const updated = insertImageTag(optionInputRefs.current[idx], opt.text, dataUrl);
                          handleOptionTextChange(idx, updated);
                        })
                      }
                      placeholder={`Option ${letter} text... (Ctrl+V to paste image)`}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                      required={type !== 'true_false'}
                      readOnly={type === 'true_false'}
                    />

                    {type !== 'true_false' && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleClipboardRead((dataUrl) => {
                              const updated = insertImageTag(optionInputRefs.current[idx], opt.text, dataUrl);
                              handleOptionTextChange(idx, updated);
                            })
                          }
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Paste image into option"
                        >
                          <Clipboard className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => optionFileInputRefs.current[idx]?.click()}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Upload image file into option"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>

                        <input
                          ref={(el) => (optionFileInputRefs.current[idx] = el)}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileInputChange(e, (dataUrl) => {
                              const updated = insertImageTag(optionInputRefs.current[idx], opt.text, dataUrl);
                              handleOptionTextChange(idx, updated);
                            })
                          }
                        />

                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Remove option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Option image preview if option has img tag */}
                  {((opt?.text || '').includes('<img') || (opt?.text || '').includes('data:image')) && (
                    <div className="ml-9 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <FormattedText content={opt.text} className="text-xs text-slate-900" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Row 3: Marking Scheme & Explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Positive Marks (+ve)
          </label>
          <input
            type="number"
            step="0.5"
            value={positiveMarks}
            onChange={(e) => setPositiveMarks(parseFloat(e.target.value) || 0)}
            className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Negative Marks (-ve penalty)
          </label>
          <input
            type="number"
            step="0.25"
            value={negativeMarks}
            onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
            className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Detailed Solution / Explanation with Paste Image Controls */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            Detailed Solution / Explanation
            <span className="text-[11px] font-normal text-slate-500">(Supports Ctrl+V Image Paste)</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                handleClipboardRead((dataUrl) => {
                  setExplanation((prev) => insertImageTag(explanationRef.current, prev, dataUrl));
                })
              }
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition"
            >
              <Clipboard className="w-3.5 h-3.5 text-blue-600" />
              Paste Image
            </button>

            <button
              type="button"
              onClick={() => explanationFileInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 transition"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              Upload File
            </button>
            <input
              ref={explanationFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleFileInputChange(e, (dataUrl) => {
                  setExplanation((prev) => insertImageTag(explanationRef.current, prev, dataUrl));
                })
              }
            />
          </div>
        </div>

        <textarea
          ref={explanationRef}
          rows={3}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          onPaste={(e) =>
            handlePasteEvent(e, (dataUrl) => {
              setExplanation((prev) => insertImageTag(explanationRef.current, prev, dataUrl));
            })
          }
          placeholder="Step-by-step solution shown to students after test submission... (Ctrl+V to embed solution diagram!)"
          className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
        />

        {/* Live Preview if explanation contains image or HTML tags */}
        {((explanation || '').includes('<img') || (explanation || '').includes('data:image')) && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-500" /> Solution Rendered Preview:
            </span>
            <FormattedText content={explanation} className="text-xs text-slate-900" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {initialQuestion ? 'Save Question Changes' : 'Add Question to Test'}
        </button>
      </div>
    </form>
  );
};

