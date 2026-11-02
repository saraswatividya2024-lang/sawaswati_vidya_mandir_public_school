import React from 'react';
import { SchoolProfile, HomeContent, Facility } from '../../types';
import { Award, BookOpen, CheckCircle, Eye, Heart, Shield, Sparkles } from 'lucide-react';

interface AboutPageProps {
  profile: SchoolProfile | null;
  homeContent: HomeContent | null;
  facilities: Facility[];
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ profile, homeContent, facilities, onNavigate }) => {
  const logoSrc = profile?.logoUrl || '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg';
  const bannerSrc = profile?.bannerUrl || '/assets/aistudio/file_0000000031c48208a3739793d7c419fd_fc340555.png';

  return (
    <div className="bg-[#FFFDF9] text-[#3B2117] min-h-screen">
      {/* Page Header */}
      <div className="bg-[#4A2112] text-[#FFF4E2] py-12 px-4 border-b-4 border-[#D6A64F] relative">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-[#D6A64F] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-[#D6A64F]/50">
            About Our Institution
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#FFF4E2]">
            About Saraswati Vidya Mandir Public School
          </h1>
          <p className="text-xs sm:text-sm text-[#E8D0B5] max-w-2xl mx-auto font-medium">
            Kathig, Jones, Semla, Dumka (Jharkhand) • Established under Reg. No. {profile?.registrationNo || '2162/07'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Section 1: History & Introduction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#6B2E16] uppercase tracking-wider bg-[#FFF4E2] border border-[#D6A64F] px-3 py-1 rounded-full">
              Our Genesis & Heritage
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#4A2112]">
              Illuminating Minds Through Value-Based Education
            </h2>
            <div className="w-16 h-1 bg-[#D6A64F] rounded-full"></div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {homeContent?.history ||
                'Founded under Registration No. 2162/07 with the divine blessings of Maa Saraswati, the school was established to provide premier English medium education following the CBSE pattern to the children of Semla, Kathig, Jones, and the wider Dumka region.'}
            </p>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {homeContent?.aboutIntro ||
                'Our lush green campus provides an inspiring atmosphere where academic rigor meets character building. We believe in preparing our students not just for examinations, but for life.'}
            </p>

            <div className="bg-[#FFF4E2] p-4 rounded-xl border border-[#D6A64F] flex items-center gap-4">
              <img
                src={logoSrc}
                alt="School Emblem"
                className="w-14 h-14 object-contain rounded-full bg-white p-1 border border-[#D6A64F]"
              />
              <div>
                <h4 className="text-sm font-bold text-[#6B2E16]">
                  Lead Us From Darkness To Light
                </h4>
                <p className="text-xs text-stone-600">
                  "Lead us from the darkness of ignorance to the eternal light of wisdom."
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border-4 border-[#D6A64F] shadow-2xl relative">
            <img
              src={bannerSrc}
              alt="School Campus Facade"
              className="w-full h-80 object-cover object-center"
            />
            <div className="p-4 bg-[#4A2112] text-[#FFF4E2] text-xs flex justify-between items-center">
              <span>School Campus Mural Wall, Semla</span>
              <span className="text-[#D6A64F] font-bold">Dumka (Jharkhand)</span>
            </div>
          </div>
        </div>

        {/* Section 2: Vision, Mission & Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FFF4E2] border-2 border-[#D6A64F] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center shadow-xs">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#6B2E16]">Our Vision</h3>
            <p className="text-xs text-stone-700 leading-relaxed">
              {homeContent?.vision ||
                'To be an exemplary center of academic excellence and holistic child development where traditional Indian values merge seamlessly with modern scientific education, producing enlightened and compassionate future citizens.'}
            </p>
          </div>

          <div className="bg-[#FFF4E2] border-2 border-[#D6A64F] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#6B2E16]">Our Mission</h3>
            <p className="text-xs text-stone-700 leading-relaxed">
              {homeContent?.mission ||
                'To empower every student through experiential learning, personalized teacher mentorship, competitive examination coaching, and comprehensive sports and cultural activities, ensuring that no deserving child is deprived of quality education.'}
            </p>
          </div>

          <div className="bg-[#FFF4E2] border-2 border-[#D6A64F] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#6B2E16]">Educational Philosophy</h3>
            <p className="text-xs text-stone-700 leading-relaxed">
              {homeContent?.philosophy ||
                'Rooted in the eternal guiding wisdom: "Lead us from darkness to light, and achieve success through sincere hard work and discipline."'}
            </p>
          </div>
        </div>

        {/* Section 3: Principal's Desk */}
        <div className="bg-white border-2 border-[#D6A64F] rounded-2xl p-8 shadow-xl flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0 text-center">
            <img
              src={homeContent?.principalPhotoUrl || logoSrc}
              alt="Principal"
              className="w-40 h-40 object-cover rounded-full border-4 border-[#6B2E16] mx-auto p-1 bg-white shadow-md"
            />
            <h4 className="font-heading font-bold text-base text-[#4A2112] mt-3">
              {homeContent?.principalName || 'Sri D. K. Sharma'}
            </h4>
            <p className="text-xs text-[#D6A64F] font-semibold">
              {homeContent?.principalDesignation || 'Principal & Educational Director'}
            </p>
          </div>

          <div className="flex-1 space-y-3">
            <span className="text-xs font-bold text-[#6B2E16] uppercase tracking-wider bg-[#FFF4E2] px-3 py-1 rounded-full border border-[#D6A64F]">
              Principal’s Message
            </span>
            <h3 className="font-heading font-extrabold text-2xl text-[#4A2112]">
              Building a Foundation for Life
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
              "{homeContent?.principalMessage ||
                'Dear Parents, Guardians, and Beloved Students, It gives me profound joy to welcome you to Saraswati Vidya Mandir Public School, Semla. Our institution is not merely a place of textbooks and exams; it is a sacred temple of learning where young minds are sculpted with wisdom, character, and self-confidence.'}"
            </p>
          </div>
        </div>

        {/* Section 4: Facilities Overview */}
        <div>
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-[#6B2E16] uppercase tracking-widest bg-[#FFF4E2] border border-[#D6A64F] px-3 py-1 rounded-full">
              Infrastructure
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#4A2112] mt-2">
              Our School Facilities & Campus
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((fac) => (
              <div key={fac.id} className="bg-[#FFF4E2] border border-[#D6A64F]/50 p-5 rounded-xl">
                <CheckCircle className="w-6 h-6 text-[#6B2E16] mb-2" />
                <h4 className="font-heading font-bold text-sm text-[#4A2112] mb-1">{fac.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{fac.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-6">
          <button
            onClick={() => onNavigate('admissions')}
            className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg shadow-md border border-[#D6A64F]"
          >
            Apply for Admission to Saraswati Vidya Mandir
          </button>
        </div>
      </div>
    </div>
  );
};
