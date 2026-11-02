import React, { useState } from 'react';
import { SchoolProfile } from '../types';
import { Menu, X, Phone, Mail, Award, Lock, ArrowRight, UserCheck } from 'lucide-react';

interface NavbarProps {
  profile: SchoolProfile | null;
  activePage: string;
  setActivePage: (page: string) => void;
  isAdminLoggedIn: boolean;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activePage,
  setActivePage,
  isAdminLoggedIn,
  onOpenAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'academics', label: 'Academics' },
    { id: 'teachers', label: 'Teachers & Staff' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'student-corner', label: 'Student Corner' },
    { id: 'gallery', label: 'School Gallery' },
    { id: 'notices', label: 'Notices' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'admin', label: isAdminLoggedIn ? 'Admin Panel' : 'Admin Login' }
  ];

  const handleNavClick = (pageId: string) => {
    if (pageId === 'admin') {
      onOpenAdmin();
      setMobileMenuOpen(false);
      return;
    }
    setActivePage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logoSrc = profile?.logoUrl || '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg';

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top Notification / Contact Bar */}
      <div className="bg-[#4A2112] text-[#FFF4E2] px-4 py-1.5 text-xs border-b border-[#D6A64F]/30">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="tracking-wide text-[#D6A64F] font-semibold hidden sm:inline">
              Educate • Empower • Excel
            </span>
            <span className="hidden md:inline text-white/60">•</span>
            <span className="hidden md:inline font-medium text-white/90">
              Reg. No: {profile?.registrationNo || '2162/07'}
            </span>
            <span className="hidden lg:inline text-white/60">•</span>
            <span className="hidden lg:inline text-white/90">
              {profile?.affiliationInfo || 'CBSE Pattern (Nursery to Class X)'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {profile?.phone1 && (
              <a
                href={`tel:${profile.phone1}`}
                className="flex items-center gap-1.5 hover:text-[#D6A64F] transition-colors"
                title="Call School Office"
              >
                <Phone className="w-3.5 h-3.5 text-[#D6A64F]" />
                <span className="font-medium">{profile.phone1}</span>
              </a>
            )}
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="hidden sm:flex items-center gap-1.5 hover:text-[#D6A64F] transition-colors"
                title="Email School"
              >
                <Mail className="w-3.5 h-3.5 text-[#D6A64F]" />
                <span className="truncate max-w-[150px]">{profile.email}</span>
              </a>
            )}
            {profile?.admissionsOpen && (
              <button
                onClick={() => handleNavClick('admissions')}
                className="bg-[#D6A64F] text-[#3B2117] font-bold px-2.5 py-0.5 rounded text-[11px] hover:bg-white transition-all shadow-xs"
              >
                Admissions Open 2026-27
              </button>
            )}
            <button
              onClick={onOpenAdmin}
              className="bg-[#6B2E16] hover:bg-[#D6A64F] hover:text-[#3B2117] text-[#D6A64F] border border-[#D6A64F] px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              title="Open Admin Portal"
            >
              <Lock className="w-3 h-3" />
              <span>{isAdminLoggedIn ? 'Admin Panel' : 'Admin Login'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Branding & Navigation Bar */}
      <div className="bg-[#6B2E16] text-[#FFF4E2] border-b-2 border-[#D6A64F]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Logo & School Identity */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-hidden"
          >
            <div className="relative">
              <img
                src={logoSrc}
                alt="Saraswati Vidya Mandir Public School Logo"
                className="w-14 h-14 md:w-16 md:h-16 object-contain rounded-full border-2 border-[#D6A64F] bg-white p-0.5 shadow-md group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <div className="font-heading font-extrabold text-lg md:text-xl text-[#FFF4E2] tracking-wide leading-tight group-hover:text-[#D6A64F] transition-colors">
                {profile?.name || 'Saraswati Vidya Mandir Public School'}
              </div>
              <div className="text-xs text-[#E8D0B5] font-medium flex items-center gap-2">
                <span>Kathig, Jones, Semla, Dumka (Jharkhand)</span>
              </div>
              <div className="text-[10px] text-[#D6A64F] font-semibold uppercase tracking-wider hidden sm:block">
                {profile?.motto || 'Educate • Empower • Excel'}
              </div>
            </div>
          </button>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => handleNavClick('admissions')}
              className="bg-gradient-to-r from-[#D6A64F] to-[#E5BE72] hover:from-[#c2933e] hover:to-[#d6a64f] text-[#3B2117] font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-md shadow-md flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5"
            >
              <span>Apply for Admission</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenAdmin}
              className={`text-xs px-3.5 py-2.5 rounded-md border-2 font-extrabold flex items-center gap-1.5 transition-all shadow-md transform hover:-translate-y-0.5 ${
                isAdminLoggedIn
                  ? 'bg-emerald-800 text-white border-emerald-400 hover:bg-emerald-700'
                  : 'bg-[#D6A64F] text-[#3B2117] border-[#B38531] hover:bg-[#c2933e]'
              }`}
              title={isAdminLoggedIn ? 'Go to Admin Dashboard' : 'Admin Login'}
            >
              {isAdminLoggedIn ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-300" />
                  <span>Admin Panel</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#3B2117]" />
                  <span>Admin Login</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Hamburger & Quick Admin Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenAdmin}
              className="bg-[#D6A64F] text-[#3B2117] text-xs font-extrabold px-2.5 py-1.5 rounded flex items-center gap-1 shadow-md"
              title="Admin Panel"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => handleNavClick('admissions')}
              className="bg-[#FFF4E2] text-[#6B2E16] border border-[#D6A64F] text-xs font-bold px-2 py-1.5 rounded"
            >
              Apply
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#FFF4E2] hover:text-[#D6A64F] focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links Strip */}
        <nav className="hidden lg:block bg-[#4A2112] border-t border-[#6B2E16]">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {navItems.filter((i) => i.id !== 'admin').map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
                      isActive
                        ? 'border-[#D6A64F] text-[#D6A64F] bg-[#6B2E16]/40'
                        : 'border-transparent text-[#FFF4E2] hover:text-[#D6A64F] hover:bg-[#6B2E16]/20'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onOpenAdmin}
              className="bg-gradient-to-r from-[#D6A64F] to-[#E5BE72] hover:from-[#c2933e] hover:to-[#d6a64f] text-[#3B2117] font-extrabold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded shadow-sm flex items-center gap-1.5 transition-all transform hover:scale-105"
            >
              <Lock className="w-3.5 h-3.5 text-[#3B2117]" />
              <span>{isAdminLoggedIn ? 'Open Admin Panel' : 'Admin Login'}</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#4A2112] text-[#FFF4E2] border-b-2 border-[#D6A64F] px-4 py-3 space-y-1 shadow-xl animate-fadeIn">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-[#6B2E16] text-[#D6A64F] font-bold border-l-4 border-[#D6A64F]'
                    : 'text-white/90 hover:bg-[#6B2E16]/50 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-[#D6A64F]"></span>}
              </button>
            );
          })}
          <div className="pt-3 border-t border-[#6B2E16] flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('admissions')}
              className="w-full bg-[#D6A64F] text-[#3B2117] font-bold py-2.5 rounded text-center text-sm shadow-md"
            >
              Apply for Admission (2026-27)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full bg-[#6B2E16] text-[#E8D0B5] hover:text-white py-2 rounded text-center text-xs flex items-center justify-center gap-1.5 border border-[#D6A64F]/40"
            >
              <Lock className="w-3.5 h-3.5 text-[#D6A64F]" />
              <span>{isAdminLoggedIn ? 'Open Admin Dashboard' : 'Admin Login'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
