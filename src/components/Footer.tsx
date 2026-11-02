import React, { useState } from 'react';
import { SchoolProfile } from '../types';
import { MapPin, Phone, Mail, Clock, Award, Shield, FileText, ChevronRight, X } from 'lucide-react';

interface FooterProps {
  profile: SchoolProfile | null;
  onNavigate: (page: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ profile, onNavigate, onOpenAdmin }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  const logoSrc = profile?.logoUrl || '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg';

  return (
    <footer className="bg-[#4A2112] text-[#FFF4E2] border-t-4 border-[#D6A64F] pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {/* Column 1: School Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="School Logo"
              className="w-16 h-16 object-contain rounded-full border-2 border-[#D6A64F] bg-white p-0.5 shadow-md"
            />
            <div>
              <h3 className="font-heading font-extrabold text-base leading-snug text-[#FFF4E2]">
                {profile?.name || 'Saraswati Vidya Mandir Public School'}
              </h3>
              <p className="text-xs text-[#D6A64F] font-semibold">Semla, Dumka (Jharkhand)</p>
              <p className="text-[11px] text-[#E8D0B5]">Reg. No: {profile?.registrationNo || '2162/07'}</p>
            </div>
          </div>

          <p className="text-xs text-white/80 leading-relaxed">
            An English Medium school based on CBSE Pattern and Curriculum (Nursery to Class X), fostering moral excellence, academic distinction, and competitive readiness in a serene, eco-friendly campus.
          </p>

          <div className="bg-[#6B2E16] p-2.5 rounded-md border border-[#D6A64F]/30 text-xs">
            <p className="text-[#D6A64F] font-bold tracking-wide">Lead Us From Darkness To Light</p>
            <p className="text-[11px] text-[#E8D0B5]">Educate • Empower • Excel</p>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="font-heading text-sm font-bold text-[#D6A64F] uppercase tracking-wider mb-4 border-b border-[#D6A64F]/30 pb-2">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About Our School' },
              { id: 'academics', label: 'Academics & Curriculum' },
              { id: 'teachers', label: 'Faculty & Staff' },
              { id: 'admissions', label: 'Online Admission Form' },
              { id: 'student-corner', label: 'Student Corner Portal' },
              { id: 'gallery', label: 'Photo Gallery' },
              { id: 'notices', label: 'School Notices' },
              { id: 'contact', label: 'Contact Us' }
            ].map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => {
                    onNavigate(link.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 text-[#FFF4E2]/85 hover:text-[#D6A64F] transition-colors group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#D6A64F] group-hover:translate-x-1 transition-transform" />
                  <span>{link.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Academics & Facilities */}
        <div>
          <h4 className="font-heading text-sm font-bold text-[#D6A64F] uppercase tracking-wider mb-4 border-b border-[#D6A64F]/30 pb-2">
            Campus Highlights
          </h4>
          <ul className="space-y-2 text-xs text-[#FFF4E2]/85">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A64F]"></span>
              <span>English Medium CBSE Pattern (Nur - X)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A64F]"></span>
              <span>Lush Green Eco-Friendly Campus</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A64F]"></span>
              <span>Dedicated Computer Laboratory</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A64F]"></span>
              <span>National & International Olympiad Prep</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A64F]"></span>
              <span>Football & Cricket Coaching</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A64F]"></span>
              <span>School Bus & Hostel Accommodations</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A64F]"></span>
              <span>Free Admission for Academic Year</span>
            </li>
          </ul>

          <div className="mt-4 pt-3 border-t border-white/10">
            <button
              onClick={() => {
                onNavigate('admissions');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-[#D6A64F] text-[#3B2117] font-bold py-2 rounded text-xs text-center hover:bg-white transition-all shadow-xs"
            >
              Enquire for Admission 2026-27
            </button>
          </div>
        </div>

        {/* Column 4: Contact & Office */}
        <div>
          <h4 className="font-heading text-sm font-bold text-[#D6A64F] uppercase tracking-wider mb-4 border-b border-[#D6A64F]/30 pb-2">
            School Office
          </h4>
          <div className="space-y-3 text-xs text-[#FFF4E2]/90">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#D6A64F] shrink-0 mt-0.5" />
              <span>
                {profile?.address || 'Kathig, Jones'}, P.O: {profile?.po || 'Semla'}-{profile?.pinCode || '835027'}, Dist: {profile?.district || 'Dumka'} ({profile?.state || 'Jharkhand'})
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#D6A64F] shrink-0" />
              <div>
                <a href={`tel:${profile?.phone1 || '9973100625'}`} className="hover:text-[#D6A64F] font-semibold">
                  {profile?.phone1 || '9973100625'}
                </a>
                {profile?.phone2 && (
                  <span className="ml-2 hover:text-[#D6A64F]">
                    / <a href={`tel:${profile.phone2}`}>{profile.phone2}</a>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#D6A64F] shrink-0" />
              <a href={`mailto:${profile?.email || 'svmpssemla@gmail.com'}`} className="hover:text-[#D6A64F]">
                {profile?.email || 'svmpssemla@gmail.com'}
              </a>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#D6A64F] shrink-0 mt-0.5" />
              <span>{profile?.workingHours || 'Monday - Saturday: 8:00 AM - 2:30 PM'}</span>
            </div>
          </div>

          <div className="mt-5">
            <button
              onClick={onOpenAdmin}
              className="bg-[#6B2E16] hover:bg-[#D6A64F] hover:text-[#3B2117] text-[#D6A64F] border border-[#D6A64F] px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Shield className="w-4 h-4 text-[#D6A64F] hover:text-[#3B2117]" />
              <span>School Admin & Staff Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-[#6B2E16] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
        <div>
          © {new Date().getFullYear()} {profile?.name || 'Saraswati Vidya Mandir Public School, Semla'}. All Rights Reserved.
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setModalType('privacy')}
            className="hover:text-[#D6A64F] transition-colors"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => setModalType('terms')}
            className="hover:text-[#D6A64F] transition-colors"
          >
            Terms & Conditions
          </button>
        </div>
      </div>

      {/* Privacy Policy / Terms Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#FFF4E2] text-[#3B2117] max-w-lg w-full rounded-lg shadow-2xl p-6 border-2 border-[#D6A64F] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-[#6B2E16]/20 pb-3">
              <h3 className="font-heading font-bold text-lg text-[#6B2E16]">
                {modalType === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-1 hover:bg-[#E8D0B5] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {modalType === 'privacy' ? (
              <div className="text-xs space-y-3 leading-relaxed text-[#3B2117]">
                <p>
                  <strong>Saraswati Vidya Mandir Public School, Semla</strong> is committed to respecting the privacy of students, parents, and visitors.
                </p>
                <p>
                  1. <strong>Information Collection:</strong> We collect personal details (such as student name, date of birth, guardian phone number, and address) solely for the purpose of admission processing, fee billing, academic evaluation, and official communication.
                </p>
                <p>
                  2. <strong>Confidentiality:</strong> Student academic records, fee ledgers, and contact numbers are never sold or shared with any third-party marketing companies.
                </p>
                <p>
                  3. <strong>Data Security:</strong> All records are stored securely with encrypted passwords and authorized role-based administrative access.
                </p>
              </div>
            ) : (
              <div className="text-xs space-y-3 leading-relaxed text-[#3B2117]">
                <p>
                  <strong>Rules & Terms of Saraswati Vidya Mandir Public School, Semla:</strong>
                </p>
                <p>
                  1. <strong>Admissions:</strong> Admissions are granted according to school norms, seat availability, and CBSE pattern guidelines. Submitted documents must be authentic.
                </p>
                <p>
                  2. <strong>Fee Structure:</strong> Monthly school fees are payable in the designated academic months. Official receipts issued by the school management are valid proof of payment.
                </p>
                <p>
                  3. <strong>Conduct & Discipline:</strong> Regular attendance, adherence to school uniform, and respectful behavior towards teachers and peers are mandatory.
                </p>
              </div>
            )}
            <div className="mt-5 text-right">
              <button
                onClick={() => setModalType(null)}
                className="bg-[#6B2E16] text-[#FFF4E2] font-semibold px-4 py-1.5 rounded text-xs hover:bg-[#4A2112]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
