import React, { useState } from 'react';
import { SchoolProfile, HomeContent, Facility, Teacher, Notice, GalleryItem } from '../../types';
import {
  ArrowRight,
  BookOpen,
  Users,
  Bell,
  Image as ImageIcon,
  PhoneCall,
  GraduationCap,
  Calendar,
  CheckCircle,
  Eye,
  Send,
  Sparkles,
  MapPin,
  Clock,
  Shield,
  Award
} from 'lucide-react';

interface HomePageProps {
  profile: SchoolProfile | null;
  homeContent: HomeContent | null;
  facilities: Facility[];
  teachers: Teacher[];
  notices: Notice[];
  gallery: GalleryItem[];
  onNavigate: (page: string) => void;
  onSubmitContact: (form: { name: string; phone: string; email: string; subject: string; message: string }) => Promise<{ success: boolean; message: string }>;
}

export const HomePage: React.FC<HomePageProps> = ({
  profile,
  homeContent,
  facilities,
  teachers,
  notices,
  gallery,
  onNavigate,
  onSubmitContact
}) => {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<GalleryItem | null>(null);

  // Quick Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSending, setContactSending] = useState(false);
  const [contactStatus, setContactStatus] = useState<string | null>(null);

  const handleQuickContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactMessage) return;
    setContactSending(true);
    setContactStatus(null);
    try {
      const res = await onSubmitContact({
        name: contactName,
        phone: contactPhone,
        email: contactEmail,
        subject: 'Quick Website Inquiry',
        message: contactMessage
      });
      setContactStatus(res.message);
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactMessage('');
    } catch (err: any) {
      setContactStatus('Failed to send message. Please try again.');
    } finally {
      setContactSending(false);
    }
  };

  const logoSrc = profile?.logoUrl || '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg';
  const bannerSrc = profile?.bannerUrl || '/assets/aistudio/WhatsApp_Image_2026-10-24_at_4.39.34_AM_dbbdbe61.jpeg';

  return (
    <div className="bg-[#FFFDF9] text-[#3B2117]">
      {/* SECTION A: HERO BANNER - LIGHT CREAM & GOLDEN THEME */}
      <section className="relative bg-gradient-to-b from-[#FFFDF9] via-[#FFF6E8] to-[#FFF0D8] text-[#3B2117] overflow-hidden border-b-4 border-[#D6A64F] shadow-sm">
        {/* Subtle decorative damask pattern overlay */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none bg-[radial-gradient(#D6A64F_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Heading, Slogans, Badges & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-4">
              {/* English Mottos Badges */}
              <div className="inline-flex items-center gap-2 bg-white/90 border-2 border-[#D6A64F] px-4 py-1.5 rounded-full text-xs font-semibold text-[#6B2E16] shadow-xs backdrop-blur-xs">
                <Sparkles className="w-4 h-4 text-[#D6A64F]" />
                <span className="tracking-wide font-bold">Educate • Empower • Excel</span>
                <span className="text-[#D6A64F]">•</span>
                <span className="font-semibold text-stone-700">Reg. No: {profile?.registrationNo || '2162/07'}</span>
              </div>

              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#4A2112] tracking-wide leading-tight drop-shadow-xs">
                {homeContent?.heroHeading || 'Welcome to Saraswati Vidya Mandir Public School'}
              </h1>

              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-bold text-[#6B2E16] uppercase tracking-wider">
                <span>Kathig, Jones, Semla, Dumka (Jharkhand)</span>
                <span>•</span>
                <span className="text-[#D6A64F]">Excellence Through Effort</span>
              </div>

              <p className="text-sm sm:text-base text-stone-700 max-w-2xl font-medium leading-relaxed">
                {homeContent?.heroSubtitle ||
                  'Learning Today, Leading Tomorrow • English Medium CBSE Pattern Curriculum (NUR - X) in a lush green campus.'}
              </p>

              {/* School Special Badges from Facade */}
              <div className="flex flex-wrap gap-2 pt-1 justify-center lg:justify-start text-xs">
                <span className="bg-white text-[#6B2E16] font-bold border border-[#D6A64F] px-3 py-1 rounded-md shadow-2xs">
                  ✓ Free Admission
                </span>
                <span className="bg-white text-[#6B2E16] font-bold border border-[#D6A64F] px-3 py-1 rounded-md shadow-2xs">
                  ✓ Lush Green Campus
                </span>
                <span className="bg-white text-[#6B2E16] font-bold border border-[#D6A64F] px-3 py-1 rounded-md shadow-2xs">
                  ✓ Computer Lab & Coaching
                </span>
                <span className="bg-white text-[#6B2E16] font-bold border border-[#D6A64F] px-3 py-1 rounded-md shadow-2xs">
                  ✓ Bus & Hostel Facilities
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="pt-3 flex flex-wrap gap-3.5 justify-center lg:justify-start">
                <button
                  onClick={() => onNavigate('admissions')}
                  className="bg-gradient-to-r from-[#D6A64F] to-[#E5BE72] hover:from-[#c2933e] hover:to-[#d6a64f] text-[#3B2117] font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-lg shadow-md flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
                >
                  <span>Apply for Admission</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('about')}
                  className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] border border-[#D6A64F] font-bold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-lg shadow-md transition-all"
                >
                  Explore Our School
                </button>

                <button
                  onClick={() => onNavigate('admin')}
                  className="bg-white hover:bg-[#FFF4E2] text-[#4A2112] border-2 border-[#D6A64F] font-bold text-xs sm:text-sm uppercase tracking-wider px-5 py-3.5 rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Open Admin Management Portal"
                >
                  <Shield className="w-4 h-4 text-[#D6A64F]" />
                  <span>Admin Panel</span>
                </button>
              </div>
            </div>

            {/* Right Column: Official School Logo Emblem */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative p-3 bg-gradient-to-b from-[#D6A64F] to-[#6B2E16] rounded-full shadow-2xl">
                <img
                  src={logoSrc}
                  alt="Saraswati Vidya Mandir Public School Emblem"
                  className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain rounded-full bg-white p-2 border-4 border-[#FFF4E2]"
                />
              </div>
              <div className="mt-4 text-center">
                <span className="bg-[#6B2E16] text-[#D6A64F] text-xs font-bold px-3.5 py-1 rounded-full border border-[#D6A64F]/60 uppercase tracking-widest shadow-md">
                  Dumka, Jharkhand
                </span>
              </div>
            </div>

          </div>

          {/* Full Panoramic Campus Photo Strip below hero */}
          <div className="mt-8 pt-6 border-t border-[#D6A64F]/30">
            <div className="relative rounded-xl overflow-hidden border-2 border-[#D6A64F] shadow-md bg-white">
              <img
                src="/assets/aistudio/file_0000000031c48208a3739793d7c419fd_fc340555.png"
                alt="Panoramic view of school facade, murals, and green surroundings"
                className="w-full h-44 sm:h-56 md:h-64 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-4 sm:p-5">
                <div className="text-white flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                  <div>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-[#D6A64F]">
                      SARASWATI VIDYA MANDIR PUBLIC SCHOOL, SEMLA
                    </h3>
                    <p className="text-xs text-white/90">
                      "A World Learn Environment" • English Medium CBSE Pattern (Nursery to Class X) • Kathig, Jones, Semla
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('admissions')}
                    className="self-start sm:self-center bg-[#D6A64F] hover:bg-white text-[#3B2117] font-bold text-xs px-3.5 py-1.5 rounded shadow-md transition-colors uppercase tracking-wider"
                  >
                    Admissions Open 2026-27
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: QUICK INFORMATION CARDS */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { id: 'admissions', title: 'Admissions', subtitle: 'Apply Online', icon: GraduationCap, color: 'bg-amber-600' },
            { id: 'academics', title: 'Academics', subtitle: 'CBSE Pattern', icon: BookOpen, color: 'bg-[#6B2E16]' },
            { id: 'teachers', title: 'Faculty', subtitle: 'Expert Staff', icon: Users, color: 'bg-emerald-700' },
            { id: 'notices', title: 'Notices', subtitle: 'Announcements', icon: Bell, color: 'bg-rose-700' },
            { id: 'gallery', title: 'Gallery', subtitle: 'School Life', icon: ImageIcon, color: 'bg-indigo-700' },
            { id: 'contact', title: 'Contact', subtitle: 'Office & Maps', icon: PhoneCall, color: 'bg-[#4A2112]' }
          ].map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="bg-white border-2 border-[#E8D0B5] hover:border-[#D6A64F] rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 group focus:outline-hidden"
              >
                <div className={`w-12 h-12 mx-auto rounded-full ${card.color} text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#3B2117] group-hover:text-[#6B2E16]">
                  {card.title}
                </h3>
                <p className="text-[11px] text-stone-500">{card.subtitle}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION B: SCHOOL INTRODUCTION & VISION/MISSION */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#6B2E16] uppercase tracking-widest bg-[#FFF4E2] border border-[#D6A64F] px-3 py-1 rounded-full">
            About Our School
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#4A2112] mt-3">
            Nurturing Tomorrow's Leaders in Semla
          </h2>
          <div className="w-20 h-1 bg-[#D6A64F] mx-auto mt-3 rounded-full"></div>
          <p className="text-sm text-stone-700 mt-4 leading-relaxed">
            {homeContent?.aboutIntro ||
              'Saraswati Vidya Mandir Public School, Semla is an esteemed English Medium institution providing value-based education based on CBSE pattern and curriculum from Nursery to Class X.'}
          </p>
        </div>

        {/* Vision, Mission, History Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FFF4E2] border border-[#D6A64F]/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center mb-4">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#6B2E16] mb-2">Our Vision</h3>
            <p className="text-xs text-stone-700 leading-relaxed">
              {homeContent?.vision ||
                'To be an exemplary center of academic excellence and holistic child development where traditional Indian values merge seamlessly with modern scientific education.'}
            </p>
          </div>

          <div className="bg-[#FFF4E2] border border-[#D6A64F]/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#6B2E16] mb-2">Our Mission</h3>
            <p className="text-xs text-stone-700 leading-relaxed">
              {homeContent?.mission ||
                'To empower every student through experiential learning, personalized teacher mentorship, competitive examination coaching, and comprehensive sports activities.'}
            </p>
          </div>

          <div className="bg-[#FFF4E2] border border-[#D6A64F]/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#6B2E16] mb-2">School Philosophy</h3>
            <p className="text-xs text-stone-700 leading-relaxed">
              {homeContent?.philosophy ||
                'Rooted in the timeless principles of "Lead us from darkness to light" and "Success is achieved through persistent effort and character."'}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION D: PRINCIPAL'S MESSAGE */}
      <section className="bg-[#FFF4E2] border-y border-[#D6A64F]/40 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-[#D6A64F] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0 text-center">
              <img
                src={homeContent?.principalPhotoUrl || logoSrc}
                alt={homeContent?.principalName || 'School Principal'}
                className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-full border-4 border-[#6B2E16] shadow-lg p-1 bg-white mx-auto"
              />
              <h4 className="font-heading font-bold text-base text-[#4A2112] mt-3">
                {homeContent?.principalName || 'Sri D. K. Sharma'}
              </h4>
              <p className="text-xs text-[#D6A64F] font-semibold">
                {homeContent?.principalDesignation || 'Principal & Educational Director'}
              </p>
            </div>

            <div className="flex-1 space-y-4">
              <span className="text-xs font-bold text-[#6B2E16] uppercase tracking-wider bg-[#FFF4E2] px-3 py-1 rounded-full border border-[#D6A64F]">
                From The Principal's Desk
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-[#4A2112]">
                A Sacred Temple of Wisdom, Discipline, & Character
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                "{homeContent?.principalMessage ||
                  'Dear Parents and Beloved Students, It gives me profound joy to welcome you to Saraswati Vidya Mandir Public School, Semla. Our institution is a sacred temple of learning where young minds are sculpted with wisdom, character, and self-confidence.'}"
              </p>
              <div className="pt-2 flex items-center gap-3">
                <span className="text-sm font-bold text-[#6B2E16]">
                  With Warm Regards
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION E: SCHOOL FACILITIES */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#6B2E16] uppercase tracking-widest bg-[#FFF4E2] border border-[#D6A64F] px-3 py-1 rounded-full">
            Special Campus Features
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#4A2112] mt-3">
            Facilities for Comprehensive Growth
          </h2>
          <div className="w-20 h-1 bg-[#D6A64F] mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-white border border-[#E8D0B5] hover:border-[#D6A64F] rounded-xl p-5 shadow-xs hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#4A2112] mb-1.5">{fac.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{fac.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION F: LATEST NOTICES */}
      <section className="bg-[#FFF4E2] border-y border-[#D6A64F]/30 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[#6B2E16] uppercase tracking-widest bg-white border border-[#D6A64F] px-3 py-1 rounded-full">
                Announcements
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#4A2112] mt-2">
                Latest School Notices
              </h2>
            </div>
            <button
              onClick={() => onNavigate('notices')}
              className="text-xs font-bold text-[#6B2E16] hover:text-[#4A2112] flex items-center gap-1.5 underline underline-offset-4"
            >
              <span>View All Notices</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.slice(0, 3).map((notice) => (
              <div
                key={notice.id}
                className="bg-white border-2 border-[#E8D0B5] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#6B2E16] text-[#FFF4E2] uppercase">
                      {notice.category}
                    </span>
                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#D6A64F]" />
                      {notice.publishedDate}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#4A2112] mb-2 line-clamp-2">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
                    {notice.description}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedNotice(notice)}
                  className="text-xs font-bold text-[#6B2E16] hover:text-[#D6A64F] flex items-center gap-1 self-start"
                >
                  <span>Read Full Notice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION G: TEACHERS & STAFF PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-[#6B2E16] uppercase tracking-widest bg-[#FFF4E2] border border-[#D6A64F] px-3 py-1 rounded-full">
              Our Educators
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#4A2112] mt-2">
              Dedicated Faculty & Teachers
            </h2>
          </div>
          <button
            onClick={() => onNavigate('teachers')}
            className="text-xs font-bold text-[#6B2E16] hover:text-[#4A2112] flex items-center gap-1.5 underline underline-offset-4"
          >
            <span>View Full Faculty Directory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.slice(0, 4).map((t) => (
            <div
              key={t.id}
              className="bg-white border border-[#E8D0B5] hover:border-[#D6A64F] rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all text-center p-5"
            >
              <img
                src={t.photoUrl || logoSrc}
                alt={t.name}
                className="w-24 h-24 object-cover rounded-full mx-auto border-3 border-[#D6A64F] shadow-sm mb-3 bg-[#FFF4E2] p-1"
              />
              <h3 className="font-heading font-bold text-sm text-[#4A2112]">{t.name}</h3>
              <p className="text-xs font-semibold text-[#6B2E16] mt-0.5">{t.designation}</p>
              <p className="text-[11px] text-stone-500 mt-0.5">{t.subject}</p>
              <p className="text-[10px] text-stone-400 mt-1">{t.qualification}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION H: PHOTO GALLERY PREVIEW */}
      <section className="bg-[#FFF4E2] border-y border-[#D6A64F]/30 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[#6B2E16] uppercase tracking-widest bg-white border border-[#D6A64F] px-3 py-1 rounded-full">
                Life At School
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#4A2112] mt-2">
                Campus & Activities Gallery
              </h2>
            </div>
            <button
              onClick={() => onNavigate('gallery')}
              className="text-xs font-bold text-[#6B2E16] hover:text-[#4A2112] flex items-center gap-1.5 underline underline-offset-4"
            >
              <span>Explore Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.slice(0, 4).map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedGalleryImg(img)}
                className="group relative rounded-xl overflow-hidden border-2 border-[#D6A64F] shadow-md cursor-pointer aspect-4/3 bg-stone-900"
              >
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <span className="text-[10px] uppercase font-bold text-[#D6A64F] tracking-wider">
                    {img.category}
                  </span>
                  <h4 className="text-xs font-bold text-white leading-tight">{img.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION I: ADMISSION CALL TO ACTION */}
      <section className="relative bg-[#6B2E16] text-[#FFF4E2] py-16 border-b-4 border-[#D6A64F] overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-5">
          <span className="bg-[#D6A64F] text-[#3B2117] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            {profile?.admissionsOpen ? 'Admissions Open (2026-2027)' : 'Admissions Closed'}
          </span>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#FFF4E2]">
            Begin Your Child’s Journey of Excellence
          </h2>

          <p className="text-sm text-[#E8D0B5] max-w-2xl mx-auto leading-relaxed">
            {profile?.freeAdmissionNote ||
              'Free Admission Offered for Nursery to Class X! English Medium CBSE Pattern Curriculum in a nurturing, disciplined environment at Kathig, Jones, Semla.'}
          </p>

          <div className="pt-3">
            <button
              onClick={() => onNavigate('admissions')}
              className="bg-[#D6A64F] hover:bg-[#c2933e] text-[#3B2117] font-extrabold text-sm uppercase tracking-wider px-8 py-3.5 rounded-lg shadow-xl inline-flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
            >
              <span>Submit Online Admission Enquiry</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION J: CONTACT PREVIEW & QUICK MESSAGE FORM */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Verified Contact Details */}
          <div>
            <span className="text-xs font-bold text-[#6B2E16] uppercase tracking-widest bg-[#FFF4E2] border border-[#D6A64F] px-3 py-1 rounded-full">
              Get In Touch
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#4A2112] mt-3 mb-4">
              Visit Our Campus or Call Us
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed">
              We warmly invite parents and prospective guardians to visit our lush green school campus at Semla, Dumka. Our staff will be happy to assist with all your questions.
            </p>

            <div className="space-y-4 text-xs">
              <div className="bg-[#FFF4E2] p-4 rounded-xl border border-[#D6A64F]/50 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#6B2E16] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#4A2112]">School Address</h4>
                  <p className="text-stone-700 mt-0.5">
                    {profile?.address || 'Kathig, Jones'}, P.O: {profile?.po || 'Semla'}-835027, Dist: {profile?.district || 'Dumka'} ({profile?.state || 'Jharkhand'})
                  </p>
                </div>
              </div>

              <div className="bg-[#FFF4E2] p-4 rounded-xl border border-[#D6A64F]/50 flex items-start gap-3">
                <PhoneCall className="w-5 h-5 text-[#6B2E16] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#4A2112]">Phone Helpline</h4>
                  <p className="text-stone-700 mt-0.5">
                    <a href={`tel:${profile?.phone1 || '9973100625'}`} className="font-bold text-[#6B2E16] hover:underline">
                      {profile?.phone1 || '9973100625'}
                    </a>{' '}
                    / {profile?.phone2 || '9771547720'}
                  </p>
                </div>
              </div>

              <div className="bg-[#FFF4E2] p-4 rounded-xl border border-[#D6A64F]/50 flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#6B2E16] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#4A2112]">School & Office Timings</h4>
                  <p className="text-stone-700 mt-0.5">
                    {profile?.workingHours || 'Monday to Saturday: 8:00 AM - 2:30 PM'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="bg-white border-2 border-[#D6A64F] rounded-2xl p-6 md:p-8 shadow-xl">
            <h3 className="font-heading font-bold text-lg text-[#4A2112] mb-1">
              Send a Message to the School Office
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Fill in your details below and our administrative team will respond shortly.
            </p>

            {contactStatus && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg font-medium">
                {contactStatus}
              </div>
            )}

            <form onSubmit={handleQuickContact} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#3B2117] mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16] focus:ring-1 focus:ring-[#6B2E16]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3B2117] mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. 9973100625"
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16] focus:ring-1 focus:ring-[#6B2E16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#3B2117] mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. parent@example.com"
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16] focus:ring-1 focus:ring-[#6B2E16]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3B2117] mb-1">Your Message or Enquiry *</label>
                <textarea
                  required
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Ask about admissions, bus routes, classes, or fee structure..."
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16] focus:ring-1 focus:ring-[#6B2E16]"
                />
              </div>

              <button
                type="submit"
                disabled={contactSending}
                className="w-full bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-bold py-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                {contactSending ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#D6A64F]" />
                    <span>Send Message to School</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border-2 border-[#D6A64F]">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#6B2E16] text-[#FFF4E2]">
                {selectedNotice.category}
              </span>
              <span className="text-xs text-stone-500">{selectedNotice.publishedDate}</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-[#4A2112] mb-3">
              {selectedNotice.title}
            </h3>
            <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line mb-6">
              {selectedNotice.description}
            </p>
            <div className="text-right">
              <button
                onClick={() => setSelectedNotice(null)}
                className="bg-[#6B2E16] text-[#FFF4E2] px-4 py-1.5 rounded text-xs font-semibold hover:bg-[#4A2112]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Lightbox Modal */}
      {selectedGalleryImg && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-stone-900 rounded-xl overflow-hidden shadow-2xl border-2 border-[#D6A64F]">
            <img
              src={selectedGalleryImg.imageUrl}
              alt={selectedGalleryImg.title}
              className="w-full max-h-[70vh] object-contain"
            />
            <div className="p-4 bg-stone-900 text-white flex justify-between items-center">
              <div>
                <span className="text-xs text-[#D6A64F] font-bold uppercase">{selectedGalleryImg.category}</span>
                <h4 className="text-sm font-bold">{selectedGalleryImg.title}</h4>
              </div>
              <button
                onClick={() => setSelectedGalleryImg(null)}
                className="bg-[#D6A64F] text-[#3B2117] font-bold px-3 py-1.5 rounded text-xs hover:bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
