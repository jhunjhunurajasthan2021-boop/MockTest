import React, { useState } from 'react';
import { X, Copy, Check, QrCode, ExternalLink, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cleanTestId } from '../../utils/cleanTestId';

interface QRCodeModalProps {
  testTitle: string;
  shareUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  testTitle,
  shareUrl,
  isOpen,
  onClose,
}) => {
  const { setActiveTestId, setMode } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    shareUrl
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Take this mock test: *${testTitle}*\nLink: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleOpenLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const testId = cleanTestId(shareUrl);
    if (testId) {
      setActiveTestId(testId);
      setMode('student');
      onClose();
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Share Test Link</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{testTitle}</p>
        </div>

        {/* QR Code Container */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center mb-5">
          <img
            src={qrImageUrl}
            alt="Test Share QR Code"
            className="w-48 h-48 rounded-lg shadow-xs bg-white p-2 border border-slate-200"
          />
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Scan with any phone camera to take test
          </p>
        </div>

        {/* Link box */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Direct Test Link</label>
          <div className="flex items-center gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-slate-800 font-mono w-full focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={handleOpenLink}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 transition"
          >
            <ExternalLink className="w-4 h-4" />
            Open Link
          </button>
        </div>
      </div>
    </div>
  );
};
