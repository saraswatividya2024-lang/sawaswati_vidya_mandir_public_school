import { SchoolProfile, ClassFeeStructure, SchoolTransport } from '../../types';
import { BookOpen, Calendar, Clock, Download, Award, CheckCircle2, FileText, Check, Bus, Phone, MapPin } from 'lucide-react';

interface AcademicsPageProps {
  profile: SchoolProfile | null;
  feeStructures: ClassFeeStructure[];
  transports?: SchoolTransport[];
  onNavigate: (page: string) => void;
}

export const AcademicsPage: React.FC<AcademicsPageProps> = ({ profile, feeStructures, transports = [], onNavigate }) => {
  const academicTerms = [
    {
      term: 'Term 1 (April - September)',
      focus: 'Foundational Concepts & Periodic Assessments',
      exams: 'Periodic Assessment I (July) & Mid-Term / Half-Yearly Examinations (September)',
      activities: 'Science Exhibitions, Sanskrit Recitation, Independence Day Celebrations'
    },
    {
      term: 'Term 2 (October - March)',
      focus: 'Advanced Problem Solving & Board Exam Orientation',
      exams: 'Periodic Assessment II (December) & Annual Final Examinations (March)',
      activities: 'Olympiad Competitions, Annual Sports Meet, Saraswati Puja Celebrations'
    }
  ];

  const classWings = [
    {
      title: 'Pre-Primary Wing (Nursery, LKG, UKG)',
      description: 'Activity-based joyful early childhood learning focusing on phonics, motor skills, basic numbers, rhyme recitation, and creative storytelling in a caring environment.',
      subjects: ['English Alphabets & Phonics', 'Hindi Varnamala', 'Numbers & Basic Math', 'General Awareness', 'Art & Craft', 'Music & Rhymes']
    },
    {
      title: 'Primary Wing (Classes I to V)',
      description: 'Strengthening fundamental literacy and numeracy skills along with scientific curiosity, environmental studies, and cultural moral values.',
      subjects: ['English Literature & Grammar', 'Hindi', 'Mathematics', 'Environmental Studies (EVS)', 'Computer Basics', 'Moral Education', 'Drawing & Games']
    },
    {
      title: 'Middle & Secondary Wing (Classes VI to X)',
      description: 'Rigorous CBSE pattern academic curriculum preparing students for competitive excellence, Olympiads, and Secondary School Board Examinations.',
      subjects: ['English Language & Literature', 'Mathematics (NCERT)', 'Science (Physics, Chemistry, Biology)', 'Social Science (History, Civics, Geography, Economics)', 'Hindi / Sanskrit', 'Information Technology (IT)']
    }
  ];

  return (
    <div className="bg-[#FFFDF9] text-[#3B2117] min-h-screen">
      {/* Header */}
      <div className="bg-[#4A2112] text-[#FFF4E2] py-12 px-4 border-b-4 border-[#D6A64F]">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-[#D6A64F] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-[#D6A64F]/50">
            Curriculum & Programs
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#FFF4E2]">
            Academic Excellence & Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-[#E8D0B5] max-w-2xl mx-auto font-medium">
            English Medium Based on CBSE Pattern & Curriculum (Nursery to Class X)
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Class Wings */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#6B2E16] uppercase tracking-widest bg-[#FFF4E2] border border-[#D6A64F] px-3 py-1 rounded-full">
              Educational Wings
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#4A2112] mt-2">
              Classes Offered: Nursery to Class X
            </h2>
            <div className="w-16 h-1 bg-[#D6A64F] mx-auto mt-2 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classWings.map((wing, i) => (
              <div
                key={i}
                className="bg-white border-2 border-[#E8D0B5] hover:border-[#D6A64F] rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center mb-4">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#4A2112] mb-2">{wing.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">{wing.description}</p>

                  <h4 className="text-xs font-bold text-[#6B2E16] uppercase tracking-wider mb-2">
                    Key Subject Areas:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {wing.subjects.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#D6A64F] shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-[#E8D0B5]/60">
                  <button
                    onClick={() => onNavigate('admissions')}
                    className="w-full text-center bg-[#FFF4E2] hover:bg-[#6B2E16] hover:text-[#FFF4E2] text-[#6B2E16] border border-[#D6A64F] font-bold py-2 rounded-lg text-xs transition-colors"
                  >
                    Enroll In This Wing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Calendar & Evaluation Structure */}
        <div className="bg-[#FFF4E2] border-2 border-[#D6A64F] rounded-2xl p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#4A2112]">
                Academic Session Calendar & Examination System
              </h2>
              <p className="text-xs text-stone-600">
                Evaluation adheres to Continuous and Comprehensive Evaluation (CCE) following CBSE guidelines.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {academicTerms.map((t, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-[#D6A64F]/50 shadow-xs space-y-3">
                <span className="text-xs font-bold px-2.5 py-1 bg-[#6B2E16] text-[#FFF4E2] rounded">
                  {t.term}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wide">Focus Area</h4>
                  <p className="text-xs text-stone-800 font-medium">{t.focus}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wide">Examinations</h4>
                  <p className="text-xs text-stone-800 font-medium">{t.exams}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wide">Major Activities</h4>
                  <p className="text-xs text-stone-800 font-medium">{t.activities}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* School Daily Routine / Timetable Overview */}
        <div className="bg-white border-2 border-[#E8D0B5] rounded-2xl p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-[#4A2112]">
                Daily School Schedule & Bell Timings
              </h2>
              <p className="text-xs text-stone-600">Regular Working Days (Monday through Saturday)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#FFF4E2] p-4 rounded-xl border border-[#D6A64F]/40">
              <span className="font-bold text-[#6B2E16] block">08:00 AM - 08:30 AM</span>
              <span className="font-semibold text-stone-900 block mt-1">Morning Assembly & Yoga</span>
              <span className="text-stone-500 text-[11px]">Saraswati Vandana, News, Yogasana</span>
            </div>
            <div className="bg-[#FFF4E2] p-4 rounded-xl border border-[#D6A64F]/40">
              <span className="font-bold text-[#6B2E16] block">08:30 AM - 11:30 AM</span>
              <span className="font-semibold text-stone-900 block mt-1">Academic Periods 1 to 4</span>
              <span className="text-stone-500 text-[11px]">Core Subjects, Mathematics, Science</span>
            </div>
            <div className="bg-[#FFF4E2] p-4 rounded-xl border border-[#D6A64F]/40">
              <span className="font-bold text-[#6B2E16] block">11:30 AM - 12:00 PM</span>
              <span className="font-semibold text-stone-900 block mt-1">Recess & Lunch Break</span>
              <span className="text-stone-500 text-[11px]">Nutritious refreshments & relaxation</span>
            </div>
            <div className="bg-[#FFF4E2] p-4 rounded-xl border border-[#D6A64F]/40">
              <span className="font-bold text-[#6B2E16] block">12:00 PM - 02:30 PM</span>
              <span className="font-semibold text-stone-900 block mt-1">Periods 5 to 7 & Activities</span>
              <span className="text-stone-500 text-[11px]">Computer Lab, Games, Library</span>
            </div>
          </div>
        </div>

        {/* School Van & Transport Facility */}
        <div className="bg-white border-2 border-[#D6A64F] rounded-2xl p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E8D0B5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#4A2112]">
                  School Van & Student Transport Routes
                </h2>
                <p className="text-xs text-stone-600">
                  Safe, reliable, and verified school transportation covering Semla, Dumka, and surrounding localities.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('contact')}
              className="self-start sm:self-auto bg-[#FFF4E2] hover:bg-[#6B2E16] text-[#6B2E16] hover:text-[#FFF4E2] border border-[#D6A64F] px-4 py-2 rounded-lg text-xs font-bold transition-all"
            >
              Contact Transport Coordinator
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transports.map((route) => (
              <div
                key={route.id}
                className="bg-[#FFFDF9] border-2 border-[#E8D0B5] hover:border-[#D6A64F] rounded-xl p-5 shadow-xs space-y-3 transition-all"
              >
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-heading font-bold text-sm text-[#4A2112]">{route.routeName}</h3>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#FFF4E2] text-[#6B2E16] border border-[#D6A64F] rounded">
                    {route.vehicleNo}
                  </span>
                </div>

                <div className="text-xs text-stone-600 space-y-1 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                  <div className="flex items-center gap-1.5 font-medium text-stone-700">
                    <MapPin className="w-3.5 h-3.5 text-[#D6A64F] shrink-0" />
                    <span className="font-bold">Areas Covered:</span>
                  </div>
                  <p className="text-[11px] text-stone-600 pl-5">{route.areasCovered}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700">
                  <div className="bg-[#FFF4E2]/70 p-2 rounded border border-[#E8D0B5]">
                    <span className="font-bold text-[#6B2E16] block">Morning Pickup:</span>
                    <span>{route.morningTime || '07:15 AM - 07:50 AM'}</span>
                  </div>
                  <div className="bg-[#FFF4E2]/70 p-2 rounded border border-[#E8D0B5]">
                    <span className="font-bold text-[#6B2E16] block">Afternoon Drop:</span>
                    <span>{route.afternoonTime || '02:30 PM - 03:15 PM'}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-[#E8D0B5]/60 text-xs">
                  <div>
                    <span className="text-[11px] text-stone-500 block">Driver:</span>
                    <span className="font-bold text-stone-900">{route.driverName}</span>
                  </div>
                  <a
                    href={`tel:${route.driverPhone}`}
                    className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Driver</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Resources / Downloads */}
        <div className="bg-[#4A2112] text-[#FFF4E2] rounded-2xl p-8 border-2 border-[#D6A64F]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-heading font-extrabold text-xl text-[#D6A64F]">
                Academic Downloads & Syllabus Resources
              </h3>
              <p className="text-xs text-[#E8D0B5] max-w-xl">
                Class-wise syllabi, book lists, and examination date-sheets are released each term. Please contact the school office or verify via the Student Corner.
              </p>
            </div>
            <button
              onClick={() => onNavigate('student-corner')}
              className="bg-[#D6A64F] hover:bg-[#c2933e] text-[#3B2117] font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-lg shadow-md shrink-0 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Go to Student Corner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
