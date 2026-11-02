import React, { useState } from 'react';
import { Teacher, SchoolProfile } from '../../types';
import { Users, BookOpen, GraduationCap, Award, Search, Filter } from 'lucide-react';

interface TeachersPageProps {
  teachers: Teacher[];
  profile: SchoolProfile | null;
}

export const TeachersPage: React.FC<TeachersPageProps> = ({ teachers, profile }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const subjects = ['All', ...Array.from(new Set(teachers.map((t) => t.subject)))];

  const filteredTeachers = teachers.filter((t) => {
    const matchesSubject = selectedSubject === 'All' || t.subject === selectedSubject;
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.qualification.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const logoSrc = profile?.logoUrl || '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg';

  return (
    <div className="bg-[#FFFDF9] text-[#3B2117] min-h-screen">
      {/* Header */}
      <div className="bg-[#4A2112] text-[#FFF4E2] py-12 px-4 border-b-4 border-[#D6A64F]">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-[#D6A64F] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-[#D6A64F]/50">
            Our Mentors
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#FFF4E2]">
            Teachers & Staff Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#E8D0B5] max-w-2xl mx-auto font-medium">
            Dedicated educators providing personalized care, academic rigor, and moral guidance to every student.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Search & Subject Filter Bar */}
        <div className="bg-[#FFF4E2] p-4 rounded-xl border border-[#D6A64F] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:border-[#6B2E16]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-stone-600 shrink-0">Filter:</span>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSubject === sub
                    ? 'bg-[#6B2E16] text-[#FFF4E2]'
                    : 'bg-white text-stone-700 hover:bg-[#E8D0B5]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Teachers Grid */}
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E8D0B5]">
            <Users className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-base text-stone-700">No faculty members found</h3>
            <p className="text-xs text-stone-500 mt-1">Try adjusting your search criteria or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white border-2 border-[#E8D0B5] hover:border-[#D6A64F] rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={teacher.photoUrl || logoSrc}
                      alt={teacher.name}
                      className="w-20 h-20 object-cover rounded-full border-3 border-[#D6A64F] p-0.5 bg-[#FFF4E2] shadow-xs"
                    />
                    <div>
                      <h3 className="font-heading font-bold text-base text-[#4A2112] leading-tight">
                        {teacher.name}
                      </h3>
                      <p className="text-xs font-bold text-[#6B2E16] mt-0.5">{teacher.designation}</p>
                      <span className="inline-block mt-1 text-[11px] bg-[#FFF4E2] text-[#6B2E16] border border-[#D6A64F]/50 px-2 py-0.5 rounded font-medium">
                        {teacher.subject}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t border-[#E8D0B5]/60 pt-3">
                    <div className="flex items-start gap-2 text-stone-700">
                      <GraduationCap className="w-4 h-4 text-[#6B2E16] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Qualifications: </span>
                        <span>{teacher.qualification}</span>
                      </div>
                    </div>

                    {teacher.experienceYears ? (
                      <div className="flex items-center gap-2 text-stone-700">
                        <Award className="w-4 h-4 text-[#D6A64F] shrink-0" />
                        <div>
                          <span className="font-bold">Experience: </span>
                          <span>{teacher.experienceYears}+ Years</span>
                        </div>
                      </div>
                    ) : null}

                    {teacher.bio && (
                      <p className="text-stone-600 text-[11px] leading-relaxed pt-1 italic">
                        "{teacher.bio}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex justify-between items-center text-[11px] text-stone-500">
                  <span>Verified Faculty</span>
                  <span className="font-medium text-[#6B2E16]">SVMPS Semla</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
