import React, { useState } from 'react';
import { MessageSquare, ExternalLink, Copy, Check, X, ShieldAlert } from 'lucide-react';

interface WhatsAppModalProps {
  data: {
    studentName: string;
    studentId: string;
    guardianName: string;
    guardianPhone: string;
    className: string;
    netPendingBalance: number;
    pendingMonths: string[];
    whatsappMessage: string;
    whatsappUrl: string;
  } | null;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  const [customMessage, setCustomMessage] = useState(data.whatsappMessage);
  const [copied, setCopied] = useState(false);

  const cleanPhone = data.guardianPhone.replace(/\D/g, '');
  const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const currentUrl = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(customMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    // Open in separate window/tab safely
    const win = window.open(currentUrl, '_blank', 'noopener,noreferrer');
    if (win) {
      win.opener = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#FFFDF9] text-[#3B2117] max-w-xl w-full rounded-xl shadow-2xl border-2 border-[#D6A64F] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4A2112] text-[#FFF4E2] px-6 py-4 flex justify-between items-center border-b border-[#D6A64F]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-white">WhatsApp Fee Reminder Notice</h3>
              <p className="text-xs text-[#E8D0B5]">Manual Administrator Dispatch & Review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#D6A64F] p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Student Info Box */}
          <div className="bg-[#FFF4E2] border border-[#E8D0B5] rounded-lg p-3 text-xs grid grid-cols-2 gap-2">
            <div>
              <span className="text-stone-500">Student: </span>
              <strong className="text-stone-900">{data.studentName}</strong> ({data.studentId})
            </div>
            <div>
              <span className="text-stone-500">Class: </span>
              <strong className="text-stone-900">{data.className}</strong>
            </div>
            <div>
              <span className="text-stone-500">Guardian: </span>
              <strong className="text-stone-900">{data.guardianName}</strong>
            </div>
            <div>
              <span className="text-stone-500">Phone: </span>
              <strong className="text-emerald-800 font-mono">+{phoneWithCode}</strong>
            </div>
            <div className="col-span-2 pt-1 border-t border-[#E8D0B5]/60 flex justify-between items-center">
              <div>
                <span className="text-stone-500">Pending Months: </span>
                <span className="font-semibold text-amber-900">
                  {data.pendingMonths.length > 0 ? data.pendingMonths.join(', ') : 'Current Dues'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-stone-500">Total Pending: </span>
                <span className="font-bold text-rose-800 text-sm">
                  ₹{data.netPendingBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Editable Message Box */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[#6B2E16]">
                Review & Edit WhatsApp Message (Hindi / English):
              </label>
              <button
                onClick={handleCopy}
                className="text-xs text-stone-600 hover:text-[#6B2E16] flex items-center gap-1 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full text-xs font-sans p-3 border border-[#6B2E16]/30 rounded-lg bg-white focus:outline-hidden focus:border-[#6B2E16] focus:ring-1 focus:ring-[#6B2E16]"
            />
          </div>

          {/* Compliance Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5 flex items-start gap-2 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <p>
              <strong>Administrator Consent Required:</strong> Messages are never sent automatically. Clicking the button below opens WhatsApp with this pre-filled message so you can review and tap send directly.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleOpenWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-md text-xs flex items-center gap-1.5 shadow-md transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch WhatsApp Web / App</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
