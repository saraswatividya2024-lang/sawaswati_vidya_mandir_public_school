/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  SchoolProfile,
  HomeContent,
  Facility,
  Teacher,
  Notice,
  GalleryItem,
  FeePayment,
  ClassFeeStructure,
  SchoolTransport
} from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { AcademicsPage } from './pages/public/AcademicsPage';
import { TeachersPage } from './pages/public/TeachersPage';
import { AdmissionsPage } from './pages/public/AdmissionsPage';
import { StudentCornerPage } from './pages/public/StudentCornerPage';
import { GalleryPage } from './pages/public/GalleryPage';
import { NoticesPage } from './pages/public/NoticesPage';
import { ContactPage } from './pages/public/ContactPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ReceiptModal } from './components/ReceiptModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { Lock } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash.toLowerCase();
      const s = window.location.search.toLowerCase();
      return h.includes('admin') || s.includes('admin');
    }
    return false;
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('svmps_admin_token');
  });
  const [adminUser, setAdminUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('svmps_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Public Data
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [feeStructures, setFeeStructures] = useState<ClassFeeStructure[]>([]);
  const [transports, setTransports] = useState<SchoolTransport[]>([]);

  // Modals
  const [activeReceipt, setActiveReceipt] = useState<FeePayment | null>(null);
  const [activeWhatsAppReminder, setActiveWhatsAppReminder] = useState<any | null>(null);

  // Load public data on mount
  const loadPublicData = async () => {
    try {
      const [pRes, hRes, fRes, tRes, nRes, gRes, trRes, feeRes] = await Promise.all([
        fetch('/api/public/profile'),
        fetch('/api/public/home-content'),
        fetch('/api/public/facilities'),
        fetch('/api/public/teachers'),
        fetch('/api/public/notices'),
        fetch('/api/public/gallery'),
        fetch('/api/public/transport'),
        fetch('/api/public/fee-structures')
      ]);

      if (pRes.ok) setProfile(await pRes.json());
      if (hRes.ok) setHomeContent(await hRes.json());
      if (fRes.ok) setFacilities(await fRes.json());
      if (tRes.ok) setTeachers(await tRes.json());
      if (nRes.ok) setNotices(await nRes.json());
      if (gRes.ok) setGallery(await gRes.json());
      if (trRes.ok) setTransports(await trRes.json());
      if (feeRes.ok) setFeeStructures(await feeRes.json());
    } catch (err) {
      console.error('Failed to load public school data:', err);
    }
  };

  useEffect(() => {
    loadPublicData();

    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      const s = window.location.search.toLowerCase();
      if (h.includes('admin') || s.includes('admin')) {
        setIsAdminView(true);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleLoginSuccess = (token: string, user: any) => {
    setAdminToken(token);
    setAdminUser(user);
    localStorage.setItem('svmps_admin_token', token);
    localStorage.setItem('svmps_admin_user', JSON.stringify(user));
    setIsAdminView(true);
  };

  const handleLogout = async () => {
    try {
      if (adminToken) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          }
        });
      }
    } catch (e) {
      // Continue client logout
    }
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('svmps_admin_token');
    localStorage.removeItem('svmps_admin_user');
    setIsAdminView(false);
  };

  const handleSubmitAdmissionEnquiry = async (form: any) => {
    const res = await fetch('/api/public/admissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Submission failed.');
    }
    return data;
  };

  const handleSubmitContact = async (form: any) => {
    const res = await fetch('/api/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Submission failed.');
    }
    return data;
  };

  // If in Admin View
  if (isAdminView) {
    if (!adminToken) {
      return (
        <AdminLogin
          profile={profile}
          onLoginSuccess={handleLoginSuccess}
          onBackToWebsite={() => {
            setIsAdminView(false);
            if (window.location.hash.includes('admin')) {
              history.pushState(null, '', window.location.pathname);
            }
          }}
        />
      );
    }

    return (
      <>
        <AdminDashboard
          token={adminToken}
          adminUser={adminUser}
          onLogout={handleLogout}
          onBackToWebsite={() => {
            setIsAdminView(false);
            if (window.location.hash.includes('admin')) {
              history.pushState(null, '', window.location.pathname);
            }
            loadPublicData();
          }}
          onViewReceipt={(r) => setActiveReceipt(r)}
          onOpenWhatsAppModal={(rem) => setActiveWhatsAppReminder(rem)}
        />
        {activeReceipt && (
          <ReceiptModal
            receipt={activeReceipt}
            profile={profile}
            onClose={() => setActiveReceipt(null)}
          />
        )}
        {activeWhatsAppReminder && (
          <WhatsAppModal
            data={activeWhatsAppReminder}
            onClose={() => setActiveWhatsAppReminder(null)}
          />
        )}
      </>
    );
  }

  const handleNavigate = (page: string) => {
    if (page === 'admin') {
      setIsAdminView(true);
      window.location.hash = '#admin';
      return;
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Public Website View
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#3B2117]">
      <Navbar
        profile={profile}
        activePage={activePage}
        setActivePage={handleNavigate}
        isAdminLoggedIn={Boolean(adminToken)}
        onOpenAdmin={() => {
          setIsAdminView(true);
          window.location.hash = '#admin';
        }}
      />

      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            profile={profile}
            homeContent={homeContent}
            facilities={facilities}
            teachers={teachers}
            notices={notices}
            gallery={gallery}
            onNavigate={handleNavigate}
            onSubmitContact={handleSubmitContact}
          />
        )}

        {activePage === 'about' && (
          <AboutPage
            profile={profile}
            homeContent={homeContent}
            facilities={facilities}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'academics' && (
          <AcademicsPage
            profile={profile}
            feeStructures={feeStructures}
            transports={transports}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'teachers' && (
          <TeachersPage teachers={teachers} profile={profile} />
        )}

        {activePage === 'admissions' && (
          <AdmissionsPage
            profile={profile}
            onSubmitEnquiry={handleSubmitAdmissionEnquiry}
          />
        )}

        {activePage === 'student-corner' && (
          <StudentCornerPage
            profile={profile}
            transports={transports}
            onNavigate={handleNavigate}
            onViewReceipt={(r) => setActiveReceipt(r)}
          />
        )}

        {activePage === 'gallery' && (
          <GalleryPage gallery={gallery} profile={profile} />
        )}

        {activePage === 'notices' && <NoticesPage notices={notices} />}

        {activePage === 'contact' && (
          <ContactPage
            profile={profile}
            onSubmitContact={handleSubmitContact}
          />
        )}
      </main>

      <Footer
        profile={profile}
        onNavigate={handleNavigate}
        onOpenAdmin={() => {
          setIsAdminView(true);
          window.location.hash = '#admin';
        }}
      />

      {/* Floating Always-Visible Admin Panel Launcher */}
      <button
        onClick={() => {
          setIsAdminView(true);
          window.location.hash = '#admin';
        }}
        className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-[#6B2E16] to-[#4A2112] hover:from-[#4A2112] hover:to-[#2e1308] text-[#D6A64F] hover:text-white border-2 border-[#D6A64F] px-4 py-2.5 rounded-full shadow-2xl font-heading font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transform hover:scale-105 transition-all group cursor-pointer"
        title="Open Saraswati Vidya Mandir Admin Panel"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <Lock className="w-4 h-4 text-[#D6A64F] group-hover:rotate-12 transition-transform" />
        <span>{adminToken ? 'Admin Dashboard' : 'Admin Panel 🔐'}</span>
      </button>

      {/* Receipts & WhatsApp Reminders Modals */}
      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          profile={profile}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {activeWhatsAppReminder && (
        <WhatsAppModal
          data={activeWhatsAppReminder}
          onClose={() => setActiveWhatsAppReminder(null)}
        />
      )}
    </div>
  );
}
