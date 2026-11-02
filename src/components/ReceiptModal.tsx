import React from 'react';
import { FeePayment, SchoolProfile } from '../types';
import { Printer, Download, X, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  receipt: FeePayment | null;
  profile: SchoolProfile | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, profile, onClose }) => {
  if (!receipt) return null;

  const logoSrc = profile?.logoUrl || '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-xl max-w-2xl w-full shadow-2xl border-4 border-[#D6A64F] my-8 overflow-hidden print:m-0 print:border-none print:shadow-none">
        
        {/* Modal Actions (Hidden when printing) */}
        <div className="no-print bg-[#4A2112] text-[#FFF4E2] px-6 py-3 flex justify-between items-center border-b border-[#D6A64F]/40">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#D6A64F]" />
            <span className="font-heading font-bold text-sm">Official Fee Receipt Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const message = `*FEE RECEIPT - ${profile?.name || 'Saraswati Vidya Mandir Public School, Semla'}*
Receipt No: ${receipt.receiptNumber}
Student: ${receipt.studentName} (ID: ${receipt.studentId})
Class: ${receipt.classVal} (${receipt.section})
Academic Year: ${receipt.academicYear}
Months Paid: ${receipt.monthsPaid.join(', ')}
Total Fee: ₹${receipt.totalFee}
Discount: ₹${receipt.discount}
Amount Received: ₹${receipt.amountPaid}
Remaining Balance: ₹${receipt.remainingBalance}
Payment Date: ${receipt.paymentDate}
Mode: ${receipt.paymentMethod}
— School Office, SVMPS Semla (Dumka)`;
                const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              title="Share Receipt on WhatsApp"
            >
              <span>WhatsApp Receipt</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#D6A64F] hover:bg-[#c4943f] text-[#3B2117] font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-[#D6A64F] p-1 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 bg-[#FFFDF9] print:p-4 print:bg-white text-[#3B2117]" id="printable-receipt">
          {/* Header */}
          <div className="border-b-2 border-[#6B2E16] pb-4 mb-4 flex items-center justify-between">
            <img
              src={logoSrc}
              alt="School Logo"
              className="w-20 h-20 object-contain rounded-full border-2 border-[#D6A64F] p-0.5 bg-white shadow-xs"
            />
            <div className="text-center flex-1 px-4">
              <h2 className="font-heading font-extrabold text-xl text-[#6B2E16] tracking-wide uppercase leading-tight">
                {profile?.name || 'Saraswati Vidya Mandir Public School, Semla'}
              </h2>
              <p className="text-xs text-[#D6A64F] font-bold mt-0.5 tracking-wide">
                Educate • Empower • Excel
              </p>
              <p className="text-xs text-stone-700 font-medium">
                {profile?.address || 'Kathig, Jones'}, P.O: {profile?.po || 'Semla'}-835027, Dist: {profile?.district || 'Dumka'} (Jharkhand)
              </p>
              <p className="text-[11px] text-stone-600 font-medium">
                Reg. No: {profile?.registrationNo || '2162/07'} • {profile?.affiliationInfo || 'CBSE Pattern (Nur - X)'}
              </p>
              <p className="text-[11px] text-stone-600">
                Helpline: {profile?.phone1 || '9973100625'} • Email: {profile?.email || 'svmpssemla@gmail.com'}
              </p>
            </div>
            <div className="w-20 text-right">
              <span className="inline-block border-2 border-[#6B2E16] bg-[#FFF4E2] px-2 py-1 text-[11px] font-bold text-[#6B2E16] rounded uppercase">
                Student Copy
              </span>
            </div>
          </div>

          {/* Receipt Title Bar */}
          <div className="bg-[#6B2E16] text-[#FFF4E2] px-4 py-1.5 rounded-sm flex justify-between items-center text-xs font-semibold uppercase tracking-wider mb-5">
            <span>OFFICIAL STUDENT FEE RECEIPT</span>
            <span>RECEIPT NO: {receipt.receiptNumber}</span>
          </div>

          {/* Student & Payment Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs border border-[#E8D0B5] p-4 rounded-md bg-white mb-6">
            <div>
              <span className="text-stone-500 font-medium">Student Full Name:</span>
              <span className="font-bold text-stone-900 ml-2">{receipt.studentName}</span>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Payment Date:</span>
              <span className="font-bold text-stone-900 ml-2">{receipt.paymentDate}</span>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Permanent Student ID:</span>
              <span className="font-bold text-[#6B2E16] ml-2">{receipt.studentId}</span>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Academic Session:</span>
              <span className="font-bold text-stone-900 ml-2">{receipt.academicYear}</span>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Class & Section:</span>
              <span className="font-bold text-stone-900 ml-2">{receipt.classVal} ({receipt.section})</span>
            </div>
            <div>
              <span className="text-stone-500 font-medium">Payment Method:</span>
              <span className="font-bold text-stone-900 ml-2 uppercase">{receipt.paymentMethod}</span>
            </div>
          </div>

          {/* Months & Breakdown Table */}
          <div className="border border-[#6B2E16] rounded-md overflow-hidden mb-6">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#4A2112] text-[#FFF4E2] font-semibold">
                <tr>
                  <th className="p-2.5">Particulars / Fee Description</th>
                  <th className="p-2.5 text-center">Months Covered</th>
                  <th className="p-2.5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D0B5] bg-white">
                <tr>
                  <td className="p-2.5">
                    <div className="font-bold text-stone-900">Monthly Tuition & Development Fee</div>
                    <div className="text-[11px] text-stone-500">Regular school monthly charges</div>
                  </td>
                  <td className="p-2.5 text-center font-medium">
                    {receipt.monthsPaid && receipt.monthsPaid.length > 0
                      ? receipt.monthsPaid.join(', ')
                      : 'Fee Payment'}
                  </td>
                  <td className="p-2.5 text-right font-bold text-stone-900">
                    ₹{receipt.totalFee.toLocaleString('en-IN')}
                  </td>
                </tr>

                {receipt.discount > 0 && (
                  <tr className="bg-emerald-50/50 text-emerald-800">
                    <td className="p-2.5 font-medium">Scholarship / Concession Discount</td>
                    <td className="p-2.5 text-center text-xs">Approved Waiver</td>
                    <td className="p-2.5 text-right font-bold">- ₹{receipt.discount.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                <tr className="bg-[#FFF4E2]/70 font-semibold text-stone-900">
                  <td className="p-2.5" colSpan={2}>Net Payable for this Transaction:</td>
                  <td className="p-2.5 text-right font-bold text-[#6B2E16]">
                    ₹{(receipt.totalFee - (receipt.discount || 0)).toLocaleString('en-IN')}
                  </td>
                </tr>

                <tr className="bg-white">
                  <td className="p-2.5 font-bold text-emerald-900" colSpan={2}>
                    AMOUNT RECEIVED IN CASH / UPI:
                  </td>
                  <td className="p-2.5 text-right font-extrabold text-emerald-800 text-sm">
                    ₹{receipt.amountPaid.toLocaleString('en-IN')}
                  </td>
                </tr>

                <tr className="bg-stone-50 text-stone-700">
                  <td className="p-2.5" colSpan={2}>Remaining Balance for Selected Months:</td>
                  <td className="p-2.5 text-right font-bold">
                    ₹{receipt.remainingBalance.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {receipt.notes && (
            <div className="text-xs bg-[#FFF4E2] border border-[#D6A64F]/40 p-2.5 rounded mb-6">
              <span className="font-bold text-[#6B2E16]">Remarks: </span>
              <span className="text-stone-800">{receipt.notes}</span>
            </div>
          )}

          {/* Signatures & Verification */}
          <div className="pt-8 mt-6 border-t border-[#E8D0B5] flex justify-between items-end text-xs">
            <div className="text-stone-600">
              <p className="text-[11px]">Computer-generated receipt with verification ID.</p>
              <p className="font-bold text-[#6B2E16]">Collector: {receipt.collectedBy || 'School Office'}</p>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-stone-800 pb-1 mb-1"></div>
              <p className="font-bold text-[#3B2117]">Authorized Signatory</p>
              <p className="text-[10px] text-stone-500">SVM Public School, Semla</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
