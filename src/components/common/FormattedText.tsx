import React from 'react';

interface FormattedTextProps {
  content: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  let processed = content;

  // Unescape encoded HTML entities if present (&lt;p&gt; -> <p>)
  if (processed.includes('&lt;') && processed.includes('&gt;')) {
    processed = processed
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ');
  }

  // Detect HTML tags (like <table>, <img>, <p>, <br>, <b>, <strong>, <ul>, <ol>, <li>, etc.)
  const isHtml = /<[a-z][\s\S]*>/i.test(processed);

  if (isHtml) {
    return (
      <div
        className={`rich-formatted-content leading-relaxed text-slate-800
          [&_table]:w-full [&_table]:my-3 [&_table]:border-collapse [&_table]:border [&_table]:border-slate-300 [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:shadow-2xs
          [&_th]:bg-slate-100 [&_th]:border [&_th]:border-slate-300 [&_th]:px-3 [&_th]:py-2 [&_th]:text-xs [&_th]:font-extrabold [&_th]:text-slate-900 [&_th]:text-left
          [&_td]:border [&_td]:border-slate-300 [&_td]:px-3 [&_td]:py-2 [&_td]:text-xs [&_td]:text-slate-800
          [&_tr:nth-child(even)]:bg-slate-50/70
          [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-2 [&_img]:shadow-xs [&_img]:border [&_img]:border-slate-200 [&_img]:inline-block
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
          [&_p]:my-1
          ${className}`}
        dangerouslySetInnerHTML={{ __html: processed }}
      />
    );
  }

  return (
    <div className={`whitespace-pre-wrap break-words leading-relaxed ${className}`}>
      {processed}
    </div>
  );
};

