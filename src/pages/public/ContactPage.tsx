import React, { useState } from 'react';
import { SchoolProfile } from '../../types';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle, Building2 } from 'lucide-react';

interface ContactPageProps {
  profile: SchoolProfile | null;
  onSubmitContact: (form: { name: string; phone: string; email: string; subject: string; message: string }) => Promise<{ success: boolean; message: string }>;
}

export const ContactPage: React.FC<ContactPageProps> = ({ profile, onSubmitContact }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setStatusMsg({ success: false, text: 'Please fill in Name, Phone Number, and Message.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await onSubmitContact(formData);
      setStatusMsg({ success: true, text: res.message });
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatusMsg({ success: false, text: err.message || 'Failed to submit. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFDF9] text-[#3B2117] min-h-screen">
      {/* Header */}
      <div className="bg-[#4A2112] text-[#FFF4E2] py-12 px-4 border-b-4 border-[#D6A64F]">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-[#D6A64F] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-[#D6A64F]/50">
            Reach Out To Us
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#FFF4E2]">
            Contact School Administration
          </h1>
          <p className="text-xs sm:text-sm text-[#E8D0B5] max-w-2xl mx-auto font-medium">
            We are always here to assist parents, students, and visitors.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Verified Contact Details Card */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#6B2E16] uppercase tracking-widest bg-[#FFF4E2] border border-[#D6A64F] px-3 py-1 rounded-full">
                Campus Location
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#4A2112] mt-3">
                {profile?.name || 'Saraswati Vidya Mandir Public School'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                Located in a peaceful, lush green campus environment at Kathig, Jones, Semla in the historic district of Dumka, Jharkhand.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-white border-2 border-[#E8D0B5] p-5 rounded-xl shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#4A2112]">Physical Postal Address</h4>
                  <p className="text-stone-700 mt-1 leading-relaxed">
                    {profile?.address || 'Kathig, Jones'}, P.O: {profile?.po || 'Semla'}-{profile?.pinCode || '835027'}, Dist: {profile?.district || 'Dumka'}, State: {profile?.state || 'Jharkhand'}
                  </p>
                  <p className="text-[11px] text-[#6B2E16] font-semibold mt-1">
                    Registration No: {profile?.registrationNo || '2162/07'}
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-[#E8D0B5] p-5 rounded-xl shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#4A2112]">Direct Phone Helplines</h4>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-stone-800">
                      Mobile 1:{' '}
                      <a href={`tel:${profile?.phone1 || '9973100625'}`} className="font-bold text-[#6B2E16] hover:underline">
                        {profile?.phone1 || '9973100625'}
                      </a>
                    </p>
                    {profile?.phone2 && (
                      <p className="text-stone-800">
                        Mobile 2:{' '}
                        <a href={`tel:${profile.phone2}`} className="font-bold text-[#6B2E16] hover:underline">
                          {profile.phone2}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-[#E8D0B5] p-5 rounded-xl shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#4A2112]">Official Email Inquiries</h4>
                  <p className="mt-1">
                    <a href={`mailto:${profile?.email || 'svmpssemla@gmail.com'}`} className="text-[#6B2E16] font-semibold hover:underline">
                      {profile?.email || 'svmpssemla@gmail.com'}
                    </a>
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Responses typically sent within 24 hours.</p>
                </div>
              </div>

              <div className="bg-white border-2 border-[#E8D0B5] p-5 rounded-xl shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#4A2112]">School Working Hours</h4>
                  <p className="text-stone-700 mt-1">
                    {profile?.workingHours || 'Monday to Saturday: 8:00 AM - 2:30 PM'}
                  </p>
                  <p className="text-[11px] text-stone-500">Closed on Sundays and Gazetted Holidays</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="bg-white border-4 border-[#D6A64F] rounded-2xl p-6 md:p-8 shadow-xl">
            <h3 className="font-heading font-extrabold text-xl text-[#4A2112] mb-1">
              Send an Official Enquiry
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Have queries regarding admissions, transport routes, or student progress? Leave us a message.
            </p>

            {statusMsg && (
              <div
                className={`mb-5 p-3.5 rounded-xl text-xs flex items-center gap-2 font-medium ${
                  statusMsg.success
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border border-rose-300 text-rose-800'
                }`}
              >
                {statusMsg.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Binod Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9973100625"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Email Address</label>
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
                <label className="block font-bold text-stone-700 mb-1">Subject of Enquiry</label>
                <input
                  type="text"
                  placeholder="e.g. Admission for Class IV, Bus Route to Kathig"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe your enquiry in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                {submitting ? (
                  <span>Submitting Message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#D6A64F]" />
                    <span>Submit Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
