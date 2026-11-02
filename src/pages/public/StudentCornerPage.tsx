import React, { useState } from 'react';
import { SchoolProfile, FeePayment, SchoolTransport } from '../../types';
import {
  GraduationCap,
  Lock,
  Search,
  Calendar,
  FileText,
  Printer,
  AlertCircle,
  CheckCircle,
  Receipt,
  UserCheck,
  Bus
} from 'lucide-react';

interface StudentCornerPageProps {
  profile: SchoolProfile | null;
  transports?: SchoolTransport[];
  onNavigate: (page: string) => void;
  onViewReceipt: (receipt: FeePayment) => void;
}

export const StudentCornerPage: React.FC<StudentCornerPageProps> = ({
  profile,
  transports = [],
  onNavigate,
  onViewReceipt
}) => {
  const [studentIdInput, setStudentIdInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [verifiedStudent, setVerifiedStudent] = useState<any | null>(null);
  const [studentPayments, setStudentPayments] = useState<FeePayment[]>([]);

  const handleStudentLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!studentIdInput.trim() || !dobInput) {
      setErrorMsg('Please enter both your Permanent Student ID and Date of Birth.');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch('/api/public/student-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentIdInput.trim(),
          dob: dobInput
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Student verification failed.');
      }
      setVerifiedStudent(data.student);
      setStudentPayments(data.payments || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to find matching student record. Please verify credentials.');
      setVerifiedStudent(null);
      setStudentPayments([]);
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    setVerifiedStudent(null);
    setStudentPayments([]);
    setStudentIdInput('');
    setDobInput('');
    setErrorMsg(null);
  };

  return (
    <div className="bg-[#FFFDF9] text-[#3B2117] min-h-screen">
      {/* Header */}
      <div className="bg-[#4A2112] text-[#FFF4E2] py-12 px-4 border-b-4 border-[#D6A64F]">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-[#D6A64F] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-[#D6A64F]/50">
            Student Portal
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#FFF4E2]">
            Student Corner & Verification Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#E8D0B5] max-w-2xl mx-auto font-medium">
            Access authorized academic records, fee payment receipts, and enrollment credentials.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Academic Quick Links Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <button
            onClick={() => onNavigate('notices')}
            className="p-4 bg-white border border-[#E8D0B5] hover:border-[#D6A64F] rounded-xl text-center shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 mx-auto rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-xs text-[#3B2117]">Latest Notices</h4>
            <p className="text-[11px] text-stone-500">Exams & Circulars</p>
          </button>

          <button
            onClick={() => onNavigate('academics')}
            className="p-4 bg-white border border-[#E8D0B5] hover:border-[#D6A64F] rounded-xl text-center shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 mx-auto rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-xs text-[#3B2117]">Academic Calendar</h4>
            <p className="text-[11px] text-stone-500">Terms & Schedules</p>
          </button>

          <button
            onClick={() => onNavigate('academics')}
            className="p-4 bg-white border border-[#E8D0B5] hover:border-[#D6A64F] rounded-xl text-center shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 mx-auto rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-xs text-[#3B2117]">Curriculum</h4>
            <p className="text-[11px] text-stone-500">NUR to Class X</p>
          </button>

          <button
            onClick={() => onNavigate('admissions')}
            className="p-4 bg-white border border-[#E8D0B5] hover:border-[#D6A64F] rounded-xl text-center shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 mx-auto rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-xs text-[#3B2117]">New Admission</h4>
            <p className="text-[11px] text-stone-500">Session 2026-27</p>
          </button>

          <button
            onClick={() => onNavigate('academics')}
            className="p-4 bg-white border border-[#E8D0B5] hover:border-[#D6A64F] rounded-xl text-center shadow-xs hover:shadow-md transition-all group col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 mx-auto rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Bus className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-xs text-[#3B2117]">School Van</h4>
            <p className="text-[11px] text-stone-500">Routes & Timings</p>
          </button>
        </div>

        {/* Student Verification & Access Section */}
        {verifiedStudent ? (
          /* Authorized Student Dashboard */
          <div className="bg-white border-4 border-[#D6A64F] rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
            <div className="bg-[#6B2E16] text-[#FFF4E2] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs text-[#D6A64F] font-bold uppercase tracking-wider block">
                  Authorized Student Profile
                </span>
                <h2 className="font-heading font-extrabold text-2xl text-white">
                  {verifiedStudent.fullName}
                </h2>
                <p className="text-xs text-[#E8D0B5]">
                  Student ID: <span className="font-mono font-bold text-white">{verifiedStudent.studentId}</span> • Class: {verifiedStudent.classVal} ({verifiedStudent.section})
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="bg-[#4A2112] hover:bg-[#38160a] text-white border border-[#D6A64F]/50 px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Sign Out
              </button>
            </div>

            {/* Profile Grid */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-[#FFFDF9] p-4 rounded-xl border border-[#E8D0B5]">
                <div>
                  <span className="text-stone-500">Roll Number:</span>
                  <p className="font-bold text-stone-900">{verifiedStudent.rollNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-stone-500">Admission No:</span>
                  <p className="font-bold text-stone-900">{verifiedStudent.admissionNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-stone-500">Father's Name:</span>
                  <p className="font-bold text-stone-900">{verifiedStudent.fatherName}</p>
                </div>
                <div>
                  <span className="text-stone-500">Admission Date:</span>
                  <p className="font-bold text-stone-900">{verifiedStudent.admissionDate || 'Active'}</p>
                </div>
              </div>

              {/* Verified Fee Receipts History */}
              <div>
                <h3 className="font-heading font-bold text-base text-[#4A2112] mb-3 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#6B2E16]" />
                  <span>Your Verified Fee Payment Receipts</span>
                </h3>

                {studentPayments.length === 0 ? (
                  <div className="p-6 bg-[#FFF4E2] rounded-xl border border-[#D6A64F]/40 text-center text-xs text-stone-600">
                    No fee receipts recorded yet for this session. Contact the school office for current balance or payment updates.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentPayments.map((p) => (
                      <div
                        key={p.id}
                        className="bg-[#FFFDF9] border border-[#E8D0B5] hover:border-[#D6A64F] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-xs text-[#6B2E16]">
                              {p.receiptNumber}
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                              Paid: ₹{p.amountPaid.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-1">
                            Months: <span className="font-medium text-stone-900">{p.monthsPaid.join(', ')}</span> • Date: {p.paymentDate} • Mode: {p.paymentMethod}
                          </p>
                        </div>

                        <button
                          onClick={() => onViewReceipt(p)}
                          className="bg-[#D6A64F] hover:bg-[#c2933e] text-[#3B2117] font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View / Print Receipt</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Secure Lookup Form */
          <div className="bg-white border-2 border-[#D6A64F] rounded-2xl p-6 md:p-8 shadow-xl max-w-xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-heading font-extrabold text-xl text-[#4A2112]">
                Student & Guardian Access Portal
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Enter your Permanent Student ID and Date of Birth to view your enrollment status and fee receipts.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleStudentLookup} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Permanent Student ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SVM-2026-001"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 uppercase focus:outline-hidden focus:border-[#6B2E16]"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Mentioned on your Admission Slip or Fee Card (e.g. SVM-2026-001)
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Student Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={dobInput}
                  onChange={(e) => setDobInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-bold py-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                {verifying ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-[#D6A64F]" />
                    <span>Verify & Open Student Portal</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-stone-200 text-center text-xs text-stone-500">
              <p>Sample Student for Testing: <strong>SVM-2026-001</strong> | DOB: <strong>2015-08-14</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
