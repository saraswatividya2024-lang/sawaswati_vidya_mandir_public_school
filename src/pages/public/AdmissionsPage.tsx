import React, { useState } from 'react';
import { SchoolProfile } from '../../types';
import {
  GraduationCap,
  CheckCircle,
  FileText,
  AlertCircle,
  Send,
  Phone,
  Calendar,
  Sparkles,
  Printer
} from 'lucide-react';

interface AdmissionsPageProps {
  profile: SchoolProfile | null;
  onSubmitEnquiry: (data: any) => Promise<{ success: boolean; refNumber: string; message: string }>;
}

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ profile, onSubmitEnquiry }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    dob: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    classApplying: 'Class I',
    fatherName: '',
    motherName: '',
    guardianName: '',
    guardianPhone: '',
    email: '',
    previousSchool: '',
    address: '',
    additionalInfo: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  const classes = [
    'Nursery',
    'LKG',
    'UKG',
    'Class I',
    'Class II',
    'Class III',
    'Class IV',
    'Class V',
    'Class VI',
    'Class VII',
    'Class VIII',
    'Class IX',
    'Class X'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.studentName.trim()) {
      setErrorMsg('Please enter student full name.');
      return;
    }
    if (!formData.dob) {
      setErrorMsg('Please select student date of birth.');
      return;
    }
    if (!formData.fatherName.trim()) {
      setErrorMsg("Please enter father's name.");
      return;
    }
    if (!formData.guardianPhone.trim() || formData.guardianPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit guardian mobile/WhatsApp number.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Please provide residential address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await onSubmitEnquiry({
        ...formData,
        guardianName: formData.guardianName || formData.fatherName
      });
      if (res.success) {
        setSubmittedRef(res.refNumber);
        setSubmittedData({ ...formData });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit enquiry. Please check your internet connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setSubmittedData(null);
    setFormData({
      studentName: '',
      dob: '',
      gender: 'Male',
      classApplying: 'Class I',
      fatherName: '',
      motherName: '',
      guardianName: '',
      guardianPhone: '',
      email: '',
      previousSchool: '',
      address: '',
      additionalInfo: ''
    });
  };

  return (
    <div className="bg-[#FFFDF9] text-[#3B2117] min-h-screen">
      {/* Header */}
      <div className="bg-[#4A2112] text-[#FFF4E2] py-12 px-4 border-b-4 border-[#D6A64F]">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-[#D6A64F] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-[#D6A64F]/50">
            Admissions 2026-2027
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#FFF4E2]">
            Online Admission Application Form
          </h1>
          <p className="text-xs sm:text-sm text-[#E8D0B5] max-w-2xl mx-auto font-medium">
            English Medium CBSE Pattern • Nursery to Class X • Free Admission Open
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {submittedRef ? (
          /* Confirmation Slip */
          <div className="bg-white border-4 border-[#D6A64F] rounded-2xl p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="text-center space-y-2 pb-6 border-b-2 border-[#6B2E16]">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="font-heading font-extrabold text-2xl text-[#6B2E16]">
                Admission Enquiry Submitted Successfully!
              </h2>
              <p className="text-xs text-stone-600">
                Thank you for applying to Saraswati Vidya Mandir Public School, Semla.
              </p>
              <div className="inline-block bg-[#FFF4E2] border-2 border-[#D6A64F] px-5 py-2.5 rounded-lg mt-3">
                <span className="text-xs text-stone-500 uppercase font-semibold block">
                  Your Official Reference Number
                </span>
                <span className="font-heading font-extrabold text-xl text-[#6B2E16] tracking-wider">
                  {submittedRef}
                </span>
              </div>
            </div>

            {/* Summary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FFFDF9] p-5 rounded-xl border border-[#E8D0B5]">
              <div>
                <span className="text-stone-500">Applicant Student:</span>
                <p className="font-bold text-stone-900 text-sm">{submittedData?.studentName}</p>
              </div>
              <div>
                <span className="text-stone-500">Applying For:</span>
                <p className="font-bold text-stone-900 text-sm">{submittedData?.classApplying}</p>
              </div>
              <div>
                <span className="text-stone-500">Date of Birth:</span>
                <p className="font-semibold text-stone-800">{submittedData?.dob}</p>
              </div>
              <div>
                <span className="text-stone-500">Gender:</span>
                <p className="font-semibold text-stone-800">{submittedData?.gender}</p>
              </div>
              <div>
                <span className="text-stone-500">Father's Name:</span>
                <p className="font-semibold text-stone-800">{submittedData?.fatherName}</p>
              </div>
              <div>
                <span className="text-stone-500">Guardian Phone:</span>
                <p className="font-semibold text-stone-800">{submittedData?.guardianPhone}</p>
              </div>
            </div>

            {/* Next Steps Instructions */}
            <div className="bg-[#FFF4E2] border border-[#D6A64F] rounded-xl p-4 text-xs text-stone-800 space-y-1.5">
              <h4 className="font-bold text-[#6B2E16] text-sm">Next Steps for Enrollment:</h4>
              <p>1. Please save or print this confirmation slip containing reference number <strong>{submittedRef}</strong>.</p>
              <p>2. Our admission coordinator will contact you at <strong>{submittedData?.guardianPhone}</strong> within 1-2 working days.</p>
              <p>3. You may visit the school office at Kathig, Jones, Semla between 8:00 AM and 2:00 PM along with the student's birth certificate and two passport-sized photographs.</p>
            </div>

            <div className="flex flex-wrap gap-4 justify-between items-center pt-4">
              <button
                onClick={() => window.print()}
                className="bg-[#D6A64F] hover:bg-[#c2933e] text-[#3B2117] font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Confirmation</span>
              </button>

              <button
                onClick={handleReset}
                className="bg-[#6B2E16] text-[#FFF4E2] font-semibold text-xs px-4 py-2.5 rounded-lg hover:bg-[#4A2112]"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <div className="bg-white border-2 border-[#D6A64F] rounded-2xl shadow-xl overflow-hidden">
            {/* Top Banner Notice */}
            <div className="bg-[#6B2E16] text-[#FFF4E2] p-6 border-b border-[#D6A64F]">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#D6A64F]" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#D6A64F]">
                  Free Admission Open (Nursery to Class X)
                </span>
              </div>
              <h2 className="font-heading font-extrabold text-xl text-white">
                Student Admission Enquiry Form (Session 2026-2027)
              </h2>
              <p className="text-xs text-[#E8D0B5] mt-1">
                Please provide accurate details. All submissions are safely recorded in our school administration system.
              </p>
            </div>

            {errorMsg && (
              <div className="m-6 p-3.5 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 text-xs">
              {/* Section 1: Student Details */}
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-sm text-[#4A2112] border-b border-[#E8D0B5] pb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#6B2E16]" />
                  <span>1. Student Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Kumar"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full p-2.5 rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:border-[#6B2E16]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Applying for Class *</label>
                    <select
                      value={formData.classApplying}
                      onChange={(e) => setFormData({ ...formData, classApplying: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-stone-300 bg-white font-medium focus:outline-hidden focus:border-[#6B2E16]"
                    >
                      {classes.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Previous School Attended (If Any)</label>
                  <input
                    type="text"
                    placeholder="e.g. Prathmik Vidyalaya, Semla"
                    value={formData.previousSchool}
                    onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
              </div>

              {/* Section 2: Parents & Guardian Information */}
              <div className="space-y-4 pt-2">
                <h3 className="font-heading font-bold text-sm text-[#4A2112] border-b border-[#E8D0B5] pb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#6B2E16]" />
                  <span>2. Parents / Guardian Contact Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Father's Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Mother's Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sunita Devi"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Guardian Mobile / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9973100625"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. parent@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Permanent Residential Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Village / Ward / Street, Post Office, Police Station, District (e.g. Kathig, Jones, Semla, Dumka)"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Special Requirements or Remarks (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Interested in school bus facility, hostel accommodation, or Olympiad coaching..."
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
              </div>

              {/* Security & Anti-Duplication Submit Button */}
              <div className="pt-4 border-t border-[#E8D0B5]">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-extrabold py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {submitting ? (
                    <span>Registering Admission Enquiry...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#D6A64F]" />
                      <span>Submit Application for Admission</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-stone-500 text-center mt-2">
                  No application fees required. Your data is protected by the school management system.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
