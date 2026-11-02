import React, { useState, useEffect, useMemo } from 'react';
import {
  SchoolProfile,
  HomeContent,
  Teacher,
  Student,
  Notice,
  GalleryItem,
  AdmissionEnquiry,
  ContactEnquiry,
  FeePayment,
  ClassFeeStructure,
  SchoolTransport
} from '../../types';
import {
  LayoutDashboard,
  Building,
  Home,
  BookOpen,
  Users,
  GraduationCap,
  ClipboardList,
  CreditCard,
  Receipt,
  MessageSquare,
  Bell,
  Image as ImageIcon,
  Mail,
  Shield,
  Database,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Printer,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Eye,
  Calendar,
  Bus,
  Folder,
  FolderOpen,
  Coins,
  ArrowDownRight,
  Sparkles,
  Filter,
  AlertTriangle,
  Download,
  HardDrive,
  Clock,
  Check
} from 'lucide-react';
import { ACADEMIC_MONTHS } from '../../lib/school-logic';

interface AdminDashboardProps {
  token: string;
  adminUser: any;
  onLogout: () => void;
  onBackToWebsite: () => void;
  onViewReceipt: (receipt: FeePayment) => void;
  onOpenWhatsAppModal: (reminderData: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  adminUser,
  onLogout,
  onBackToWebsite,
  onViewReceipt,
  onOpenWhatsAppModal
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusAlert, setStatusAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Data States
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [receipts, setReceipts] = useState<FeePayment[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [contactEnquiries, setContactEnquiries] = useState<ContactEnquiry[]>([]);
  const [feeStructures, setFeeStructures] = useState<ClassFeeStructure[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [transports, setTransports] = useState<SchoolTransport[]>([]);

  // Fee Collection Modal / Active Ledger state with Academic Year toggle (2025-26 or 2026-27)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2025-26');
  const [selectedStudentForFee, setSelectedStudentForFee] = useState<Student | null>(null);
  const [studentLedger, setStudentLedger] = useState<any | null>(null);
  const [selectedMonthsToPay, setSelectedMonthsToPay] = useState<string[]>([]);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDiscount, setPaymentDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'>('Cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [useAvailableAdvance, setUseAvailableAdvance] = useState<boolean>(true);

  // Class Folders & Search state (Prevents render lag and organizes students by class folders)
  const [selectedClassFolder, setSelectedClassFolder] = useState<string>('ALL');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [selectedFeeClassFolder, setSelectedFeeClassFolder] = useState<string>('ALL');

  // Class Fee Editing in Production
  const [feeModalEdit, setFeeModalEdit] = useState<ClassFeeStructure | null>(null);
  const [batchFeeModal, setBatchFeeModal] = useState<boolean>(false);
  const [batchFeesState, setBatchFeesState] = useState<ClassFeeStructure[]>([]);

  // Modals for additions
  const [teacherModal, setTeacherModal] = useState<Teacher | 'new' | null>(null);
  const [studentModal, setStudentModal] = useState<Student | 'new' | null>(null);
  const [noticeModal, setNoticeModal] = useState<Notice | 'new' | null>(null);
  const [galleryModal, setGalleryModal] = useState<{ title: string; category: string; imageUrl: string } | null>(null);
  const [transportModal, setTransportModal] = useState<SchoolTransport | 'new' | null>(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  // Class promotion state
  const [promotionModal, setPromotionModal] = useState(false);
  const [promoFromClass, setPromoFromClass] = useState('Class V');
  const [promoToClass, setPromoToClass] = useState('Class VI');

  // Database Reset / Zeroing state
  const [zeroModal, setZeroModal] = useState<null | 'all' | 'dues' | 'reseed'>(null);
  const [zeroLoading, setZeroLoading] = useState(false);

  // Local SQLite & Automatic Local Backup state
  const [autoBackupStatus, setAutoBackupStatus] = useState<any | null>(null);
  const [autoBackupLoading, setAutoBackupLoading] = useState(false);
  const [instantBackupLoading, setInstantBackupLoading] = useState(false);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<string | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [autoBackupIntervalInput, setAutoBackupIntervalInput] = useState<number>(60);
  const [autoBackupEnabledInput, setAutoBackupEnabledInput] = useState<boolean>(true);

  const classesList = [
    'Nursery', 'LKG', 'UKG',
    'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
    'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X'
  ];

  // Memoized class student counts (Eliminates lag during tab/folder switches)
  const classStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of classesList) {
      counts[c] = 0;
    }
    for (const s of students) {
      counts[s.classVal] = (counts[s.classVal] || 0) + 1;
    }
    return counts;
  }, [students]);

  // Memoized class fee map
  const classFeeMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const f of feeStructures) {
      map[f.className] = f.monthlyTuitionFee;
    }
    return map;
  }, [feeStructures]);

  // Memoized filtered students (Prevents full-table re-render on keystrokes)
  const filteredStudents = useMemo(() => {
    const query = studentSearchQuery.trim().toLowerCase();
    return students.filter((s) => {
      const matchFolder = selectedClassFolder === 'ALL' || s.classVal === selectedClassFolder;
      if (!matchFolder) return false;
      if (!query) return true;
      return (
        s.fullName.toLowerCase().includes(query) ||
        s.studentId.toLowerCase().includes(query) ||
        s.fatherName.toLowerCase().includes(query) ||
        s.guardianPhone.includes(query) ||
        (s.admissionNumber && s.admissionNumber.toLowerCase().includes(query))
      );
    });
  }, [students, selectedClassFolder, studentSearchQuery]);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const showStatus = (type: 'success' | 'error', msg: string) => {
    setStatusAlert({ type, msg });
    setTimeout(() => setStatusAlert(null), 4000);
  };

  // Fetch initial dashboard data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        profRes,
        homeRes,
        teachRes,
        studRes,
        enqRes,
        recRes,
        notRes,
        galRes,
        cntRes,
        feeRes,
        remRes,
        traRes
      ] = await Promise.all([
        fetch('/api/admin/dashboard-stats', { headers: authHeaders }),
        fetch('/api/public/profile'),
        fetch('/api/public/home-content'),
        fetch('/api/admin/teachers', { headers: authHeaders }),
        fetch('/api/admin/students', { headers: authHeaders }),
        fetch('/api/admin/admission-enquiries', { headers: authHeaders }),
        fetch('/api/admin/fee-receipts', { headers: authHeaders }),
        fetch('/api/admin/notices', { headers: authHeaders }),
        fetch('/api/admin/gallery', { headers: authHeaders }),
        fetch('/api/admin/contact-enquiries', { headers: authHeaders }),
        fetch('/api/admin/fee-structures', { headers: authHeaders }),
        fetch('/api/admin/fee-reminders', { headers: authHeaders }),
        fetch('/api/admin/transport', { headers: authHeaders })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (profRes.ok) setProfile(await profRes.json());
      if (homeRes.ok) setHomeContent(await homeRes.json());
      if (teachRes.ok) setTeachers(await teachRes.json());
      if (studRes.ok) setStudents(await studRes.json());
      if (enqRes.ok) setEnquiries(await enqRes.json());
      if (recRes.ok) setReceipts(await recRes.json());
      if (notRes.ok) setNotices(await notRes.json());
      if (galRes.ok) setGallery(await galRes.json());
      if (cntRes.ok) setContactEnquiries(await cntRes.json());
      if (feeRes.ok) setFeeStructures(await feeRes.json());
      if (remRes.ok) setReminders(await remRes.json());
      if (traRes.ok) setTransports(await traRes.json());

      // Fetch auto backup and local SQLite status
      try {
        const bRes = await fetch('/api/admin/backup/auto-status', { headers: authHeaders });
        if (bRes.ok) {
          const bData = await bRes.json();
          setAutoBackupStatus(bData);
          if (bData.intervalMinutes) setAutoBackupIntervalInput(bData.intervalMinutes);
          if (bData.enabled !== undefined) setAutoBackupEnabledInput(bData.enabled);
        }
      } catch (_) {}
    } catch (err: any) {
      showStatus('error', 'Failed to synchronize administrative records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'backup') {
      fetchAutoBackupStatus();
    }
  }, [activeTab]);

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        showStatus('success', 'School profile saved successfully!');
      }
    } catch (err) {
      showStatus('error', 'Error updating profile.');
    }
  };

  // Save Home Content
  const handleSaveHomeContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeContent) return;
    try {
      const res = await fetch('/api/admin/home-content', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(homeContent)
      });
      if (res.ok) {
        showStatus('success', 'Home page sections saved successfully!');
      }
    } catch (err) {
      showStatus('error', 'Error updating home content.');
    }
  };

  // Teacher CRUD
  const handleSaveTeacher = async (teacher: Partial<Teacher>) => {
    try {
      const isNew = teacherModal === 'new' || !teacher.id;
      const url = isNew ? '/api/admin/teachers' : `/api/admin/teachers/${teacher.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(teacher)
      });
      if (res.ok) {
        showStatus('success', isNew ? 'Teacher added!' : 'Teacher updated!');
        setTeacherModal(null);
        fetchAllData();
      }
    } catch (err) {
      showStatus('error', 'Failed to save teacher.');
    }
  };

  const handleDeleteTeacher = async (id: number) => {
    if (!confirm('Are you sure you want to delete this teacher profile?')) return;
    try {
      const res = await fetch(`/api/admin/teachers/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showStatus('success', 'Teacher deleted.');
        fetchAllData();
      }
    } catch (err) {
      showStatus('error', 'Failed to delete teacher.');
    }
  };

  // Student CRUD
  const handleSaveStudent = async (student: Partial<Student>) => {
    try {
      const isNew = studentModal === 'new' || !student.id;
      const url = isNew ? '/api/admin/students' : `/api/admin/students/${student.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(student)
      });
      if (res.ok) {
        showStatus('success', isNew ? 'Student record created!' : 'Student updated!');
        setStudentModal(null);
        fetchAllData();
      }
    } catch (err) {
      showStatus('error', 'Failed to save student.');
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student record? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showStatus('success', 'Student record removed.');
        fetchAllData();
      }
    } catch (err) {
      showStatus('error', 'Failed to delete student.');
    }
  };

  // Load 12-Month Fee Ledger for a Student
  const handleOpenStudentFeeLedger = async (student: Student, yearToLoad?: string) => {
    setSelectedStudentForFee(student);
    const year = yearToLoad || selectedAcademicYear;
    try {
      const res = await fetch(`/api/admin/students/${student.id}/fee-ledger?academicYear=${encodeURIComponent(year)}`, { headers: authHeaders });
      if (res.ok) {
        const ledger = await res.json();
        setStudentLedger(ledger);
        // Default select first unpaid month
        const firstUnpaid = ledger.months.find((m: any) => m.status === 'Due' || m.status === 'Partial');
        if (firstUnpaid) {
          setSelectedMonthsToPay([firstUnpaid.month]);
          setPaymentAmount(firstUnpaid.balance);
        } else {
          setSelectedMonthsToPay([]);
          setPaymentAmount(0);
        }
        setPaymentDiscount(0);
      }
    } catch (err) {
      showStatus('error', 'Failed to load fee ledger.');
    }
  };

  // Record Fee Payment & Generate Receipt with Automatic Advance Calculation
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForFee || selectedMonthsToPay.length === 0 || paymentAmount <= 0) {
      alert('Please select at least one month and enter a valid payment amount.');
      return;
    }

    try {
      const monthlyFee = studentLedger?.effectiveMonthlyFee || studentLedger?.classMonthlyFee || 800;
      const totalObligation = monthlyFee * selectedMonthsToPay.length;

      // Available advance calculation
      const availableAdvance = Number(studentLedger?.advanceBalanceAvailable || 0);
      const advanceAdjusted = useAvailableAdvance && availableAdvance > 0
        ? Math.min(availableAdvance, Math.max(0, totalObligation - paymentDiscount))
        : 0;

      const res = await fetch('/api/admin/fees/record-payment', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          studentDbId: selectedStudentForFee.id,
          academicYear: selectedAcademicYear,
          monthsPaid: selectedMonthsToPay,
          totalFee: totalObligation,
          discount: paymentDiscount,
          amountPaid: paymentAmount,
          advanceAdjusted,
          paymentMethod,
          paymentDate: new Date().toISOString().split('T')[0],
          notes: paymentNotes
        })
      });

      const data = await res.json();
      if (res.ok) {
        showStatus('success', data.message);
        // Refresh ledger and dashboard records
        await handleOpenStudentFeeLedger(selectedStudentForFee);
        await fetchAllData();
      } else {
        showStatus('error', data.error || 'Failed to record payment.');
      }
    } catch (err) {
      showStatus('error', 'Error recording fee payment.');
    }
  };

  // Class-wise Monthly Fee Structure Editing in Production
  const handleSaveFeeStructure = async (fee: ClassFeeStructure) => {
    try {
      const res = await fetch('/api/admin/fee-structures', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(fee)
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', `Monthly fee for ${fee.className} updated to ₹${fee.monthlyTuitionFee}!`);
        setFeeModalEdit(null);
        setFeeStructures((prev) => prev.map((f) => (f.className === fee.className ? fee : f)));
        if (selectedStudentForFee) {
          handleOpenStudentFeeLedger(selectedStudentForFee);
        }
      } else {
        showStatus('error', data.error || 'Failed to update fee.');
      }
    } catch (err) {
      showStatus('error', 'Error updating fee structure.');
    }
  };

  const handleSaveBatchFeeStructures = async (structures: ClassFeeStructure[]) => {
    try {
      const res = await fetch('/api/admin/fee-structures/batch', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ structures })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', 'All class monthly fees updated successfully!');
        setBatchFeeModal(false);
        setFeeStructures(structures);
        if (selectedStudentForFee) {
          handleOpenStudentFeeLedger(selectedStudentForFee);
        }
      } else {
        showStatus('error', data.error || 'Failed to update fees.');
      }
    } catch (err) {
      showStatus('error', 'Error saving fee structures.');
    }
  };

  // Promote Class
  const handlePromoteStudents = async () => {
    const studentsInClass = students.filter((s) => s.classVal === promoFromClass);
    if (studentsInClass.length === 0) {
      alert(`No active students found in ${promoFromClass}.`);
      return;
    }

    if (!confirm(`Promote all ${studentsInClass.length} students from ${promoFromClass} to ${promoToClass}?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/students/promote', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          fromClass: promoFromClass,
          toClass: promoToClass,
          studentIds: studentsInClass.map((s) => s.id)
        })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', data.message);
        setPromotionModal(false);
        fetchAllData();
      }
    } catch (err) {
      showStatus('error', 'Failed to promote students.');
    }
  };

  // Enquiries Status Update
  const handleUpdateEnquiryStatus = async (id: number, status: string, notes?: string) => {
    try {
      const res = await fetch(`/api/admin/admission-enquiries/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status, internalNotes: notes || '' })
      });
      if (res.ok) {
        showStatus('success', 'Enquiry status updated.');
        fetchAllData();
      }
    } catch (err) {
      showStatus('error', 'Error updating enquiry.');
    }
  };

  // Notices CRUD
  const handleSaveNotice = async (notice: Partial<Notice>) => {
    try {
      const isNew = noticeModal === 'new' || !notice.id;
      const url = isNew ? '/api/admin/notices' : `/api/admin/notices/${notice.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(notice)
      });
      if (res.ok) {
        showStatus('success', 'Notice published successfully!');
        setNoticeModal(null);
        fetchAllData();
      }
    } catch (err) {
      showStatus('error', 'Failed to publish notice.');
    }
  };

  const handleDeleteNotice = async (id: number) => {
    if (!confirm('Delete this notice?')) return;
    try {
      const res = await fetch(`/api/admin/notices/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showStatus('success', 'Notice deleted.');
        fetchAllData();
      }
    } catch (err) {
      showStatus('error', 'Failed to delete notice.');
    }
  };

  // Gallery CRUD
  const handleAddGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryModal?.title || !galleryModal?.imageUrl) return;
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(galleryModal)
      });
      if (res.ok) {
        showStatus('success', 'Photo added to school gallery!');
        setGalleryModal(null);
        fetchAllData();
      }
    } catch (err) {
      showStatus('error', 'Failed to add gallery photo.');
    }
  };

  const handleDeleteGallery = async (id: number) => {
    if (!confirm('Remove this photo from gallery?')) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showStatus('success', 'Photo removed.');
        fetchAllData();
      }
    } catch (err) {
      showStatus('error', 'Failed to remove photo.');
    }
  };

  // School Van & Transport CRUD
  const handleSaveTransport = async (t: Partial<SchoolTransport>) => {
    try {
      const isNew = transportModal === 'new' || !t.id;
      const url = isNew ? '/api/admin/transport' : `/api/admin/transport/${t.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(t)
      });
      if (res.ok) {
        showStatus('success', isNew ? 'School van route added!' : 'Transport route updated!');
        setTransportModal(null);
        fetchAllData();
      }
    } catch (err) {
      showStatus('error', 'Failed to save transport route.');
    }
  };

  const handleDeleteTransport = async (id: number) => {
    if (!confirm('Delete this transport route?')) return;
    try {
      const res = await fetch(`/api/admin/transport/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showStatus('success', 'Transport route deleted.');
        fetchAllData();
      }
    } catch (err) {
      showStatus('error', 'Failed to delete transport route.');
    }
  };

  // Password Update
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      alert('New password and confirmation do not match.');
      return;
    }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPass
        })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', 'Password updated successfully!');
        setPasswordModal(false);
        setPasswords({ current: '', newPass: '', confirm: '' });
      } else {
        showStatus('error', data.error || 'Failed to update password.');
      }
    } catch (err) {
      showStatus('error', 'Error changing password.');
    }
  };

  // Download DB Backup (JSON format)
  const handleDownloadBackup = async () => {
    try {
      const res = await fetch('/api/admin/backup', { headers: authHeaders });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `svmps_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showStatus('success', 'Database JSON backup downloaded.');
    } catch (err) {
      showStatus('error', 'Backup failed.');
    }
  };

  // Fetch Local Backup and SQLite Status
  const fetchAutoBackupStatus = async () => {
    setAutoBackupLoading(true);
    try {
      const res = await fetch('/api/admin/backup/auto-status', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setAutoBackupStatus(data);
        if (data.intervalMinutes) setAutoBackupIntervalInput(data.intervalMinutes);
        if (data.enabled !== undefined) setAutoBackupEnabledInput(data.enabled);
      }
    } catch (_) {
      // ignore
    } finally {
      setAutoBackupLoading(false);
    }
  };

  // Download raw local SQLite database (.db) file for 100% offline use
  const handleDownloadSqliteFile = async () => {
    try {
      const res = await fetch('/api/admin/backup/sqlite-file', { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to download SQLite file');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `svmps_offline_school_${new Date().toISOString().split('T')[0]}.db`;
      a.click();
      URL.revokeObjectURL(url);
      showStatus('success', 'Local SQLite database file (.db) downloaded successfully for offline use.');
    } catch (err) {
      showStatus('error', 'Could not download SQLite database file.');
    }
  };

  // Trigger Instant Local Backup into the local folder
  const handleTriggerInstantBackup = async () => {
    setInstantBackupLoading(true);
    try {
      const res = await fetch('/api/admin/backup/create-local', {
        method: 'POST',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', data.message || 'Snapshot successfully saved to local backup folder.');
        await fetchAutoBackupStatus();
      } else {
        showStatus('error', data.error || 'Failed to create local backup.');
      }
    } catch (err) {
      showStatus('error', 'Error creating local backup snapshot.');
    } finally {
      setInstantBackupLoading(false);
    }
  };

  // Save Auto Backup Interval & Enabled Settings
  const handleSaveAutoBackupConfig = async (enabled: boolean, intervalMinutes: number) => {
    try {
      const res = await fetch('/api/admin/backup/auto-config', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ enabled, intervalMinutes })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', 'Automatic local backup schedule updated successfully!');
        if (data.status) {
          setAutoBackupStatus(data.status);
        } else {
          await fetchAutoBackupStatus();
        }
      } else {
        showStatus('error', data.error || 'Failed to update auto-backup schedule.');
      }
    } catch (err) {
      showStatus('error', 'Error updating auto-backup configuration.');
    }
  };

  // Download a specific SQLite backup file from local folder
  const handleDownloadLocalBackup = async (filename: string) => {
    try {
      const res = await fetch(`/api/admin/backup/download-local/${encodeURIComponent(filename)}`, { headers: authHeaders });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showStatus('success', `Downloaded local backup: ${filename}`);
    } catch (err) {
      showStatus('error', 'Failed to download local backup file.');
    }
  };

  // Restore database from selected local backup file
  const handleRestoreLocalBackup = async (filename: string) => {
    setRestoreLoading(true);
    try {
      const res = await fetch('/api/admin/backup/restore-local', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ filename })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', data.message || `Database restored from ${filename}!`);
        setSelectedBackupForRestore(null);
        await fetchAllData();
        await fetchAutoBackupStatus();
      } else {
        showStatus('error', data.error || 'Database restoration failed.');
      }
    } catch (err) {
      showStatus('error', 'Error restoring database from local backup.');
    } finally {
      setRestoreLoading(false);
    }
  };

  // Delete local backup file from local folder
  const handleDeleteLocalBackup = async (filename: string) => {
    if (!confirm(`Delete local backup file '${filename}' from the server's local folder?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/backup/delete-local/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', data.message || 'Local backup file deleted.');
        await fetchAutoBackupStatus();
      } else {
        showStatus('error', data.error || 'Failed to delete backup file.');
      }
    } catch (err) {
      showStatus('error', 'Error deleting local backup.');
    }
  };

  // Zero / Reset Database Handler
  const handleZeroDatabase = async (mode: 'all' | 'dues' | 'reseed') => {
    setZeroLoading(true);
    try {
      const res = await fetch('/api/admin/zero-database', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ mode })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', data.message || 'Operation completed successfully.');
        setZeroModal(null);
        await fetchAllData();
      } else {
        showStatus('error', data.error || 'Failed to execute operation.');
      }
    } catch (err: any) {
      showStatus('error', err.message || 'Network error.');
    } finally {
      setZeroLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'School Profile', icon: Building },
    { id: 'home-editor', label: 'Home Page & Banner', icon: Home },
    { id: 'about-editor', label: 'About Us Editor', icon: BookOpen },
    { id: 'academics', label: 'Academic Structures', icon: Calendar },
    { id: 'teachers', label: 'Teachers & Staff', icon: Users, badge: teachers.length },
    { id: 'students', label: 'Student Management', icon: GraduationCap, badge: students.length },
    { id: 'enquiries', label: 'Admission Enquiries', icon: ClipboardList, badge: stats?.counts?.newAdmissionEnquiries },
    { id: 'fees', label: 'Monthly Fee Ledger', icon: CreditCard },
    { id: 'receipts', label: 'Fee Receipts', icon: Receipt, badge: receipts.length },
    { id: 'reminders', label: 'WhatsApp Reminders', icon: MessageSquare, badge: reminders.length },
    { id: 'transport', label: 'School Van & Transport', icon: Bus, badge: transports.length },
    { id: 'notices', label: 'Notices & Circulars', icon: Bell, badge: notices.length },
    { id: 'gallery', label: 'School Gallery', icon: ImageIcon, badge: gallery.length },
    { id: 'contacts', label: 'Contact Enquiries', icon: Mail, badge: stats?.counts?.unreadContactEnquiries },
    { id: 'security', label: 'User Security', icon: Shield },
    { id: 'backup', label: 'Database & Reset', icon: Database }
  ];

  return (
    <div className="h-screen w-full bg-[#FFFDF9] text-[#3B2117] flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#4A2112] text-[#FFF4E2] px-4 py-3 flex items-center justify-between border-b-2 border-[#D6A64F] shrink-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1 rounded text-[#D6A64F] hover:bg-[#6B2E16]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-heading font-bold text-xs uppercase text-white">SVMPS Admin Portal</span>
        </div>
        <button
          onClick={onBackToWebsite}
          className="text-xs bg-[#6B2E16] text-[#D6A64F] px-2.5 py-1 rounded border border-[#D6A64F]/40 hover:bg-[#D6A64F] hover:text-[#4A2112] transition-colors"
        >
          Website
        </button>
      </div>

      {/* Mobile Backdrop for Drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fadeIn"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar with constrained flex-col, full background, and independent scrolling */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 md:z-20
          w-72 md:w-64 bg-[#4A2112] text-[#FFF4E2] border-r-2 border-[#D6A64F]
          shrink-0 flex flex-col h-full overflow-hidden
          transition-transform duration-200 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="shrink-0 p-4 border-b border-[#6B2E16] bg-[#3B1A0E] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={profile?.logoUrl || '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg'}
              alt="Logo"
              className="w-10 h-10 object-contain rounded-full border border-[#D6A64F] bg-white p-0.5 shrink-0"
            />
            <div className="overflow-hidden">
              <h2 className="font-heading font-extrabold text-xs text-white uppercase truncate">
                {profile?.name || 'SVM Public School'}
              </h2>
              <p className="text-[10px] text-[#D6A64F]">Administrator: {adminUser?.name || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1 text-white/70 hover:text-white hover:bg-[#6B2E16] rounded"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List - Constrained with min-h-0 and internal scrollbar */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 text-xs scrollbar-dark">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#6B2E16] text-[#D6A64F] font-bold border-l-4 border-[#D6A64F] shadow-sm'
                    : 'text-[#FFF4E2]/85 hover:bg-[#6B2E16]/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D6A64F]' : 'text-[#E8D0B5]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-[#D6A64F] text-[#3B2117] font-extrabold text-[10px] px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions - Pinned at bottom of sidebar with dark brown container */}
        <div className="shrink-0 p-3 border-t border-[#6B2E16] bg-[#3B1A0E] space-y-1.5">
          <button
            onClick={onBackToWebsite}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#E8D0B5] hover:text-white hover:bg-[#6B2E16] flex items-center gap-2 transition-colors font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#D6A64F]" />
            <span>Open Public Website</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-900/50 flex items-center gap-2 font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - Full height independent scrolling */}
      <main className="flex-1 min-w-0 min-h-0 h-full overflow-y-auto p-4 md:p-8 bg-[#FFFDF9]">
        {/* Status Alert */}
        {statusAlert && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2.5 shadow-md ${
              statusAlert.type === 'success'
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border border-rose-300 text-rose-900'
            }`}
          >
            {statusAlert.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{statusAlert.msg}</span>
          </div>
        )}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E8D0B5] pb-4">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">
                  Administrative Dashboard Overview
                </h1>
                <p className="text-xs text-stone-500">
                  Live metrics, real database counts, and recent school transactions.
                </p>
              </div>
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="bg-[#FFF4E2] border border-[#D6A64F] hover:bg-[#6B2E16] hover:text-[#FFF4E2] text-[#6B2E16] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Live Counts</span>
              </button>
            </div>

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border-2 border-[#E8D0B5] p-5 rounded-2xl shadow-xs">
                <span className="text-[11px] font-bold text-stone-500 uppercase">Total Students</span>
                <div className="text-2xl font-extrabold text-[#6B2E16] mt-1">
                  {stats?.counts?.totalStudents || 0}
                </div>
                <button
                  onClick={() => setActiveTab('students')}
                  className="text-[11px] text-[#D6A64F] font-bold hover:underline mt-2 flex items-center gap-1"
                >
                  <span>Manage Students</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-white border-2 border-[#E8D0B5] p-5 rounded-2xl shadow-xs">
                <span className="text-[11px] font-bold text-stone-500 uppercase">Teaching Staff</span>
                <div className="text-2xl font-extrabold text-[#6B2E16] mt-1">
                  {stats?.counts?.totalTeachers || 0}
                </div>
                <button
                  onClick={() => setActiveTab('teachers')}
                  className="text-[11px] text-[#D6A64F] font-bold hover:underline mt-2 flex items-center gap-1"
                >
                  <span>Staff Directory</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-white border-2 border-[#E8D0B5] p-5 rounded-2xl shadow-xs">
                <span className="text-[11px] font-bold text-stone-500 uppercase">New Enquiries</span>
                <div className="text-2xl font-extrabold text-amber-700 mt-1">
                  {stats?.counts?.newAdmissionEnquiries || 0}
                </div>
                <button
                  onClick={() => setActiveTab('enquiries')}
                  className="text-[11px] text-[#D6A64F] font-bold hover:underline mt-2 flex items-center gap-1"
                >
                  <span>View Admissions</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-white border-2 border-[#E8D0B5] p-5 rounded-2xl shadow-xs">
                <span className="text-[11px] font-bold text-stone-500 uppercase">Fee Collected (INR)</span>
                <div className="text-2xl font-extrabold text-emerald-800 mt-1">
                  ₹{(stats?.counts?.totalFeeCollected || 0).toLocaleString('en-IN')}
                </div>
                <button
                  onClick={() => setActiveTab('receipts')}
                  className="text-[11px] text-[#D6A64F] font-bold hover:underline mt-2 flex items-center gap-1"
                >
                  <span>View Receipts</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quick Actions & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Fee Payments */}
              <div className="bg-white border-2 border-[#E8D0B5] rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-heading font-bold text-base text-[#4A2112]">Recent Fee Payments</h3>
                  <button
                    onClick={() => setActiveTab('fees')}
                    className="text-xs text-[#6B2E16] font-bold hover:underline"
                  >
                    Collect Fee
                  </button>
                </div>

                {receipts.length === 0 ? (
                  <p className="text-xs text-stone-500 py-4">No recent payments recorded.</p>
                ) : (
                  <div className="divide-y divide-stone-100 text-xs">
                    {receipts.slice(0, 5).map((r) => (
                      <div key={r.id} className="py-2.5 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-stone-900">{r.studentName}</span>
                          <span className="text-stone-500 ml-2">({r.receiptNumber})</span>
                          <p className="text-[11px] text-stone-500">
                            Class: {r.classVal} • {r.paymentDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-800">
                            ₹{r.amountPaid.toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => onViewReceipt(r)}
                            className="block text-[10px] text-[#D6A64F] font-bold hover:underline"
                          >
                            Print Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Admission Enquiries */}
              <div className="bg-white border-2 border-[#E8D0B5] rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-heading font-bold text-base text-[#4A2112]">Recent Online Applications</h3>
                  <button
                    onClick={() => setActiveTab('enquiries')}
                    className="text-xs text-[#6B2E16] font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>

                {enquiries.length === 0 ? (
                  <p className="text-xs text-stone-500 py-4">No applications received yet.</p>
                ) : (
                  <div className="divide-y divide-stone-100 text-xs">
                    {enquiries.slice(0, 5).map((e) => (
                      <div key={e.id} className="py-2.5 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-stone-900">{e.studentName}</span>
                          <span className="text-[11px] text-[#6B2E16] font-semibold ml-2">
                            ({e.classApplying})
                          </span>
                          <p className="text-[11px] text-stone-500">
                            Ref: {e.refNumber} • Phone: {e.guardianPhone}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            e.status === 'New'
                              ? 'bg-amber-100 text-amber-800'
                              : e.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHOOL PROFILE EDITOR */}
        {activeTab === 'profile' && profile && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E8D0B5] pb-4">
              <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">School Profile Settings</h1>
              <p className="text-xs text-stone-500">
                Update verified school information, phone numbers, address, and logo URL without modifying source code.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="bg-white border-2 border-[#D6A64F] rounded-2xl p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Official School Name *</label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">School Name in Hindi / Devanagari</label>
                  <input
                    type="text"
                    value={profile.hindiName || ''}
                    onChange={(e) => setProfile({ ...profile, hindiName: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 font-hindi focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Registration / Affiliation Number *</label>
                  <input
                    type="text"
                    required
                    value={profile.registrationNo}
                    onChange={(e) => setProfile({ ...profile, registrationNo: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Affiliation / Pattern Info</label>
                  <input
                    type="text"
                    value={profile.affiliationInfo}
                    onChange={(e) => setProfile({ ...profile, affiliationInfo: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Primary Helpline Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={profile.phone1}
                    onChange={(e) => setProfile({ ...profile, phone1: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Secondary Mobile Number</label>
                  <input
                    type="tel"
                    value={profile.phone2}
                    onChange={(e) => setProfile({ ...profile, phone2: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Official School Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">School Working Hours</label>
                  <input
                    type="text"
                    value={profile.workingHours}
                    onChange={(e) => setProfile({ ...profile, workingHours: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Campus Physical Address *</label>
                <input
                  type="text"
                  required
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Post Office</label>
                  <input
                    type="text"
                    value={profile.po}
                    onChange={(e) => setProfile({ ...profile, po: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">District</label>
                  <input
                    type="text"
                    value={profile.district}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">State</label>
                  <input
                    type="text"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={profile.pinCode}
                    onChange={(e) => setProfile({ ...profile, pinCode: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Logo Image Asset Path / URL</label>
                  <input
                    type="text"
                    value={profile.logoUrl}
                    onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Banner Image Asset Path / URL</label>
                  <input
                    type="text"
                    value={profile.bannerUrl}
                    onChange={(e) => setProfile({ ...profile, bannerUrl: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="admOpen"
                    checked={profile.admissionsOpen}
                    onChange={(e) => setProfile({ ...profile, admissionsOpen: e.target.checked })}
                    className="w-4 h-4 text-[#6B2E16] focus:ring-[#6B2E16]"
                  />
                  <label htmlFor="admOpen" className="font-bold text-stone-800">
                    Admissions Currently Open (Public Website Badge)
                  </label>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Free Admission Note</label>
                  <input
                    type="text"
                    value={profile.freeAdmissionNote || ''}
                    onChange={(e) => setProfile({ ...profile, freeAdmissionNote: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8D0B5] flex justify-end">
                <button
                  type="submit"
                  className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-colors"
                >
                  <Save className="w-4 h-4 text-[#D6A64F]" />
                  <span>Save School Profile</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: HOME PAGE & BANNER EDITOR */}
        {activeTab === 'home-editor' && homeContent && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E8D0B5] pb-4">
              <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">Home Page & Banner Editor</h1>
              <p className="text-xs text-stone-500">
                Customize the hero heading, subtitle, school introduction text, and principal message.
              </p>
            </div>

            <form onSubmit={handleSaveHomeContent} className="bg-white border-2 border-[#D6A64F] rounded-2xl p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Main Hero Heading *</label>
                <input
                  type="text"
                  required
                  value={homeContent.heroHeading}
                  onChange={(e) => setHomeContent({ ...homeContent, heroHeading: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Hero Subtitle *</label>
                <input
                  type="text"
                  required
                  value={homeContent.heroSubtitle}
                  onChange={(e) => setHomeContent({ ...homeContent, heroSubtitle: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">About Our School Introduction *</label>
                <textarea
                  rows={4}
                  required
                  value={homeContent.aboutIntro}
                  onChange={(e) => setHomeContent({ ...homeContent, aboutIntro: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Principal Full Name</label>
                  <input
                    type="text"
                    value={homeContent.principalName}
                    onChange={(e) => setHomeContent({ ...homeContent, principalName: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Principal Designation</label>
                  <input
                    type="text"
                    value={homeContent.principalDesignation}
                    onChange={(e) => setHomeContent({ ...homeContent, principalDesignation: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Principal Desk Message</label>
                <textarea
                  rows={4}
                  value={homeContent.principalMessage}
                  onChange={(e) => setHomeContent({ ...homeContent, principalMessage: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <div className="pt-4 border-t border-[#E8D0B5] flex justify-end">
                <button
                  type="submit"
                  className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-colors"
                >
                  <Save className="w-4 h-4 text-[#D6A64F]" />
                  <span>Save Home Page Content</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: ABOUT US EDITOR */}
        {activeTab === 'about-editor' && homeContent && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E8D0B5] pb-4">
              <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">About Us Content Management</h1>
              <p className="text-xs text-stone-500">Edit school history, vision statement, mission, and Vedic philosophy.</p>
            </div>

            <form onSubmit={handleSaveHomeContent} className="bg-white border-2 border-[#D6A64F] rounded-2xl p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">School Vision *</label>
                <textarea
                  rows={3}
                  value={homeContent.vision}
                  onChange={(e) => setHomeContent({ ...homeContent, vision: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">School Mission *</label>
                <textarea
                  rows={3}
                  value={homeContent.mission}
                  onChange={(e) => setHomeContent({ ...homeContent, mission: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">School History & Inception</label>
                <textarea
                  rows={3}
                  value={homeContent.history}
                  onChange={(e) => setHomeContent({ ...homeContent, history: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Educational Philosophy</label>
                <textarea
                  rows={2}
                  value={homeContent.philosophy}
                  onChange={(e) => setHomeContent({ ...homeContent, philosophy: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <div className="pt-4 border-t border-[#E8D0B5] flex justify-end">
                <button
                  type="submit"
                  className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-colors"
                >
                  <Save className="w-4 h-4 text-[#D6A64F]" />
                  <span>Save About Us Details</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: ACADEMIC STRUCTURES & FEE CONFIGURATION */}
        {activeTab === 'academics' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E8D0B5] pb-4">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">Class-wise Monthly Fee Management</h1>
                <p className="text-xs text-stone-500">
                  Configure and edit monthly tuition fees, admission charges, and exam fees for classes Nursery through Class X.
                </p>
              </div>
              <button
                onClick={() => {
                  setBatchFeesState(
                    classesList.map((c) => {
                      const existing = feeStructures.find((f) => f.className === c);
                      return {
                        className: c,
                        monthlyTuitionFee: existing ? existing.monthlyTuitionFee : 800,
                        admissionFee: existing ? existing.admissionFee : 0,
                        examFee: existing ? existing.examFee : 300,
                        computerFee: existing ? existing.computerFee : 100
                      };
                    })
                  );
                  setBatchFeeModal(true);
                }}
                className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
              >
                <Coins className="w-4 h-4 text-[#D6A64F]" />
                <span>Bulk Edit All Class Fees</span>
              </button>
            </div>

            <div className="bg-white border-2 border-[#E8D0B5] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#4A2112] text-[#FFF4E2] font-semibold">
                  <tr>
                    <th className="p-3">Class Name</th>
                    <th className="p-3">Enrolled Students</th>
                    <th className="p-3">Monthly Tuition Fee (₹)</th>
                    <th className="p-3">Admission Fee (₹)</th>
                    <th className="p-3">Exam Fee (₹)</th>
                    <th className="p-3">Computer Fee (₹)</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {classesList.map((className) => {
                    const f = feeStructures.find((x) => x.className === className) || {
                      className,
                      monthlyTuitionFee: 800,
                      admissionFee: 0,
                      examFee: 300,
                      computerFee: 100
                    };
                    const studentCount = classStudentCounts[className] || 0;
                    return (
                      <tr key={className} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                          <Folder className="w-4 h-4 text-[#D6A64F]" />
                          <span>{className}</span>
                        </td>
                        <td className="p-3 text-stone-600 font-semibold">{studentCount} Students</td>
                        <td className="p-3 font-bold text-[#6B2E16] text-sm">₹{f.monthlyTuitionFee} / month</td>
                        <td className="p-3 text-stone-600">₹{f.admissionFee}</td>
                        <td className="p-3 text-stone-600">₹{f.examFee}</td>
                        <td className="p-3 text-stone-600">₹{f.computerFee}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setFeeModalEdit(f)}
                            className="bg-[#FFF4E2] hover:bg-[#6B2E16] hover:text-[#FFF4E2] text-[#6B2E16] border border-[#D6A64F] px-3 py-1 rounded-md text-xs font-bold transition-all inline-flex items-center gap-1 shadow-xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Fee</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: TEACHERS MANAGEMENT */}
        {activeTab === 'teachers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E8D0B5] pb-4">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">Teachers & Staff Management</h1>
                <p className="text-xs text-stone-500">Add, edit, change photographs, and organize faculty profiles.</p>
              </div>
              <button
                onClick={() => setTeacherModal('new')}
                className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4 text-[#D6A64F]" />
                <span>Add New Teacher</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((t) => (
                <div key={t.id} className="bg-white border-2 border-[#E8D0B5] rounded-xl p-4 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={t.photoUrl || '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg'}
                        alt={t.name}
                        className="w-14 h-14 object-cover rounded-full border border-[#D6A64F] bg-[#FFF4E2] p-0.5"
                      />
                      <div>
                        <h4 className="font-heading font-bold text-sm text-stone-900">{t.name}</h4>
                        <p className="text-xs text-[#6B2E16] font-semibold">{t.designation}</p>
                        <p className="text-[11px] text-stone-500">{t.subject}</p>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600">
                      <strong>Qual:</strong> {t.qualification} • {t.experienceYears} yrs exp.
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-stone-100 flex justify-between items-center text-xs">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                      {t.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTeacherModal(t)}
                        className="p-1 hover:bg-[#FFF4E2] rounded text-[#6B2E16]"
                        title="Edit Teacher"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(t.id)}
                        className="p-1 hover:bg-rose-50 rounded text-rose-600"
                        title="Delete Teacher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: STUDENT MANAGEMENT - CLASS FOLDERS VIEW */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Bar: Title & Primary Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E8D0B5] pb-4">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">Student Directory & Class Folders</h1>
                <p className="text-xs text-stone-500">
                  Organized by class folders. Manage student profiles, permanent student IDs, advance balances, and fee status.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPromotionModal(true)}
                  className="bg-[#FFF4E2] text-[#6B2E16] border border-[#D6A64F] hover:bg-[#E8D0B5] px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  Class Promotion Tool
                </button>
                <button
                  onClick={() => setStudentModal('new')}
                  className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#D6A64F]" />
                  <span>Add New Student</span>
                </button>
              </div>
            </div>

            {/* CLASS FOLDERS TABS - Beautiful, lag-free folder switching */}
            <div className="bg-white border-2 border-[#E8D0B5] rounded-2xl p-3 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2 px-1">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-[#D6A64F]" />
                  <span>Class Folders:</span>
                </span>
                <span className="text-[11px] text-stone-500 font-medium">Click a folder to view only that class's students</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {/* All Classes Folder */}
                <button
                  onClick={() => setSelectedClassFolder('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                    selectedClassFolder === 'ALL'
                      ? 'bg-[#6B2E16] text-[#FFF4E2] shadow-sm'
                      : 'bg-stone-100 hover:bg-[#FFF4E2] text-stone-700'
                  }`}
                >
                  {selectedClassFolder === 'ALL' ? (
                    <FolderOpen className="w-3.5 h-3.5 text-[#D6A64F]" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-stone-400" />
                  )}
                  <span>All Classes</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedClassFolder === 'ALL' ? 'bg-[#D6A64F] text-[#4A2112]' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {students.length}
                  </span>
                </button>

                {/* Individual Class Folders */}
                {classesList.map((c) => {
                  const count = classStudentCounts[c] || 0;
                  const isActive = selectedClassFolder === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedClassFolder(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-[#6B2E16] text-[#FFF4E2] shadow-sm border border-[#D6A64F]'
                          : 'bg-stone-50 hover:bg-[#FFF4E2] text-stone-700 border border-stone-200'
                      }`}
                    >
                      {isActive ? (
                        <FolderOpen className="w-3.5 h-3.5 text-[#D6A64F]" />
                      ) : (
                        <Folder className="w-3.5 h-3.5 text-[#D6A64F]" />
                      )}
                      <span>{c}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive ? 'bg-[#D6A64F] text-[#4A2112]' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE FOLDER BANNER & SEARCH BAR */}
            <div className="bg-[#FFF4E2] border-2 border-[#D6A64F] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#6B2E16] text-[#D6A64F] flex items-center justify-center shrink-0 shadow-sm">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading font-extrabold text-lg text-[#4A2112]">
                      {selectedClassFolder === 'ALL' ? 'All Classes Directory' : `${selectedClassFolder} Folder`}
                    </h2>
                    <span className="bg-[#6B2E16] text-[#FFF4E2] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                      {filteredStudents.length} Students
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mt-1">
                    {selectedClassFolder !== 'ALL' && (
                      <span className="flex items-center gap-1 font-semibold text-[#6B2E16]">
                        <span>Standard Monthly Fee:</span>
                        <strong className="text-sm">₹{classFeeMap[selectedClassFolder] || 800}</strong>
                        <button
                          onClick={() => {
                            const existing = feeStructures.find((x) => x.className === selectedClassFolder);
                            setFeeModalEdit(existing || {
                              className: selectedClassFolder,
                              monthlyTuitionFee: classFeeMap[selectedClassFolder] || 800,
                              admissionFee: 0,
                              examFee: 300,
                              computerFee: 100
                            });
                          }}
                          className="ml-1 text-[11px] underline text-[#6B2E16] hover:text-[#4A2112] font-bold"
                        >
                          (Edit Class Fee)
                        </button>
                      </span>
                    )}
                    <span>•</span>
                    <span>
                      Total Advance with Students: <strong className="text-emerald-800">₹{filteredStudents.reduce((acc, s) => acc + (s.advanceBalance || 0), 0).toLocaleString('en-IN')}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Total Old Dues: <strong className="text-rose-800">₹{filteredStudents.reduce((acc, s) => acc + (s.previousDueBalance || 0), 0).toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Fast Instant Search Filter */}
              <div className="w-full md:w-72 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Search student, ID, phone..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#D6A64F] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#6B2E16] shadow-xs"
                />
                {studentSearchQuery && (
                  <button
                    onClick={() => setStudentSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Students Table with Advance Column */}
            <div className="bg-white border-2 border-[#E8D0B5] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#4A2112] text-[#FFF4E2] font-semibold">
                    <tr>
                      <th className="p-3">Student ID</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Class & Sec</th>
                      <th className="p-3">Father's Name & Phone</th>
                      <th className="p-3">Monthly Tuition</th>
                      <th className="p-3">Advance Balance</th>
                      <th className="p-3">Previous Dues</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-stone-500">
                          <Folder className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                          <p className="font-semibold text-stone-600">No students found in this folder or search criteria.</p>
                          <p className="text-[11px] text-stone-400">Click "+ Add New Student" to enroll a child in this class.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => {
                        const standardFee = classFeeMap[s.classVal] || 800;
                        const hasCustomFee = s.monthlyFeeOverride !== undefined && s.monthlyFeeOverride !== null && Number(s.monthlyFeeOverride) > 0;
                        const currentFee = hasCustomFee ? s.monthlyFeeOverride : standardFee;
                        const hasAdvance = (s.advanceBalance || 0) > 0;
                        const hasDue = (s.previousDueBalance || 0) > 0;

                        return (
                          <tr key={s.id} className="hover:bg-amber-50/40 transition-colors">
                            <td className="p-3 font-mono font-bold text-[#6B2E16]">{s.studentId}</td>
                            <td className="p-3">
                              <p className="font-bold text-stone-900">{s.fullName}</p>
                              {s.admissionNumber && (
                                <p className="text-[10px] text-stone-400 font-mono">Adm: {s.admissionNumber}</p>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-stone-800">{s.classVal}</span>
                              <span className="text-stone-500 ml-1">({s.section || 'A'})</span>
                              {s.rollNumber && <span className="text-[10px] text-stone-400 block">Roll: {s.rollNumber}</span>}
                            </td>
                            <td className="p-3">
                              <p className="text-stone-800 font-medium">{s.fatherName}</p>
                              <a href={`tel:${s.guardianPhone}`} className="text-stone-500 hover:text-[#6B2E16] font-mono text-[11px] block">
                                {s.guardianPhone}
                              </a>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-[#6B2E16]">₹{currentFee}</span>
                              <span className="text-[10px] text-stone-500 block">/month</span>
                              {hasCustomFee && (
                                <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1 rounded">
                                  Custom Override
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {hasAdvance ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full text-xs shadow-2xs">
                                  <Sparkles className="w-3 h-3 text-emerald-600" />
                                  <span>₹{s.advanceBalance}</span>
                                </span>
                              ) : (
                                <span className="text-stone-400 text-xs">₹0</span>
                              )}
                            </td>
                            <td className="p-3">
                              {hasDue ? (
                                <span className="inline-block bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-xs">
                                  ₹{s.previousDueBalance}
                                </span>
                              ) : (
                                <span className="text-stone-400 text-xs">₹0</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {s.status}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setActiveTab('fees');
                                  handleOpenStudentFeeLedger(s);
                                }}
                                className="text-[11px] bg-[#FFF4E2] text-[#6B2E16] border border-[#D6A64F] px-2.5 py-1 rounded-lg font-bold hover:bg-[#6B2E16] hover:text-[#FFF4E2] transition-colors shadow-2xs"
                              >
                                Fee Ledger
                              </button>
                              <button
                                onClick={() => setStudentModal(s)}
                                className="p-1 hover:bg-[#FFF4E2] rounded text-[#6B2E16] transition-colors"
                                title="Edit Student Profile & Fee"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(s.id)}
                                className="p-1 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                                title="Delete Student Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: ADMISSION ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E8D0B5] pb-4">
              <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">Admission Applications & Enquiries</h1>
              <p className="text-xs text-stone-500">
                Review verified submissions from the public website, manage candidate review status, and record notes.
              </p>
            </div>

            <div className="bg-white border-2 border-[#E8D0B5] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#4A2112] text-[#FFF4E2] font-semibold">
                  <tr>
                    <th className="p-3">Reference No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Applying Class</th>
                    <th className="p-3">Father / Guardian</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Submitted On</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-stone-50">
                      <td className="p-3 font-mono font-bold text-[#6B2E16]">{enq.refNumber}</td>
                      <td className="p-3 font-bold text-stone-900">{enq.studentName}</td>
                      <td className="p-3 font-semibold text-stone-700">{enq.classApplying}</td>
                      <td className="p-3 text-stone-600">{enq.guardianName || enq.fatherName}</td>
                      <td className="p-3 font-mono text-stone-700">{enq.guardianPhone}</td>
                      <td className="p-3">
                        <select
                          value={enq.status}
                          onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value)}
                          className="text-[11px] font-bold p-1 rounded border border-stone-300 bg-white"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-3 text-stone-500 text-[11px]">{enq.createdAt.split(' ')[0]}</td>
                      <td className="p-3 text-right">
                        <a
                          href={`tel:${enq.guardianPhone}`}
                          className="bg-[#FFF4E2] text-[#6B2E16] border border-[#D6A64F] px-2.5 py-1 rounded text-[11px] font-bold hover:bg-[#6B2E16] hover:text-white"
                        >
                          Call
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: MONTHLY FEE LEDGER & COLLECTION */}
        {activeTab === 'fees' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E8D0B5] pb-4">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">12-Month Student Fee Ledger & Collection</h1>
                <p className="text-xs text-stone-500">
                  Track April to March fees for each student. Advance payments automatically reduce subsequent months' payable amounts.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('academics')}
                className="bg-[#FFF4E2] hover:bg-[#6B2E16] hover:text-[#FFF4E2] text-[#6B2E16] border border-[#D6A64F] px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Coins className="w-4 h-4 text-[#D6A64F]" />
                <span>Class-Wise Fee Rates</span>
              </button>
            </div>

            {/* Student Selector by Class Folder & Search */}
            <div className="bg-white border-2 border-[#D6A64F] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* 1. Class Filter Folder */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <Folder className="w-3.5 h-3.5 text-[#D6A64F]" />
                    <span>Filter by Class Folder:</span>
                  </label>
                  <select
                    value={selectedFeeClassFolder}
                    onChange={(e) => setSelectedFeeClassFolder(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-stone-300 bg-white font-medium"
                  >
                    <option value="ALL">All Classes</option>
                    {classesList.map((c) => (
                      <option key={c} value={c}>{c} ({classStudentCounts[c] || 0} students)</option>
                    ))}
                  </select>
                </div>

                {/* 2. Student Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Select Student:</label>
                  <select
                    value={selectedStudentForFee?.id || ''}
                    onChange={(e) => {
                      const st = students.find((s) => s.id === parseInt(e.target.value, 10));
                      if (st) handleOpenStudentFeeLedger(st, selectedAcademicYear);
                    }}
                    className="w-full p-2 text-xs rounded-lg border border-stone-300 bg-white font-bold text-[#6B2E16]"
                  >
                    <option value="">-- Choose Student --</option>
                    {students
                      .filter((s) => selectedFeeClassFolder === 'ALL' || s.classVal === selectedFeeClassFolder)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.studentId}) - {s.classVal} {s.advanceBalance ? `[₹${s.advanceBalance} Advance]` : ''}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 3. Academic Session Year */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Academic Session Year:</label>
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => {
                      const y = e.target.value;
                      setSelectedAcademicYear(y);
                      if (selectedStudentForFee) {
                        handleOpenStudentFeeLedger(selectedStudentForFee, y);
                      }
                    }}
                    className="w-full p-2 text-xs rounded-lg border-2 border-[#D6A64F] bg-[#FFF4E2] font-bold text-[#6B2E16]"
                  >
                    <option value="2025-26">Session 2025–2026 (April 2025 – March 2026)</option>
                    <option value="2026-27">Session 2026–2027 (April 2026 – March 2027)</option>
                  </select>
                </div>
              </div>

              {selectedStudentForFee && studentLedger && (
                <div className="space-y-6 pt-4 border-t border-[#E8D0B5]">
                  {/* Student Summary Cards with Prominent Advance Balance Display */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    <div className="bg-[#FFFDF9] border border-[#E8D0B5] p-3 rounded-xl">
                      <span className="text-stone-500 block text-[11px]">Student & ID:</span>
                      <p className="font-bold text-stone-900 text-sm">{selectedStudentForFee.fullName}</p>
                      <p className="font-mono text-[11px] text-[#6B2E16] font-bold">{selectedStudentForFee.studentId}</p>
                    </div>

                    <div className="bg-[#FFFDF9] border border-[#E8D0B5] p-3 rounded-xl">
                      <span className="text-stone-500 block text-[11px]">Class & Monthly Tuition:</span>
                      <p className="font-bold text-stone-900">{selectedStudentForFee.classVal} ({selectedStudentForFee.section})</p>
                      <p className="font-bold text-[#6B2E16]">₹{studentLedger.effectiveMonthlyFee || studentLedger.classMonthlyFee} / Month</p>
                    </div>

                    {/* ADVANCE BALANCE CARD - HIGHLIGHTED */}
                    <div className="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl shadow-2xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Advance Available:</span>
                      </div>
                      <p className="font-extrabold text-emerald-800 text-lg">
                        ₹{(studentLedger.advanceBalanceAvailable || 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-emerald-700">Will automatically reduce next month dues</p>
                    </div>

                    <div className="bg-[#FFFDF9] border border-[#E8D0B5] p-3 rounded-xl">
                      <span className="text-stone-500 block text-[11px]">Advance Adjusted This Session:</span>
                      <p className="font-bold text-stone-800 text-sm">
                        ₹{(studentLedger.totalAdvanceAdjusted || 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-stone-500">Deducted from monthly obligations</p>
                    </div>

                    <div className="bg-rose-50 border border-rose-300 p-3 rounded-xl">
                      <span className="text-rose-700 block text-[11px] font-semibold">Net Pending Dues:</span>
                      <p className="font-extrabold text-rose-800 text-base">
                        ₹{studentLedger.netPendingBalance.toLocaleString('en-IN')}
                      </p>
                      {selectedStudentForFee.previousDueBalance > 0 && (
                        <p className="text-[10px] text-rose-600">Incl. ₹{selectedStudentForFee.previousDueBalance} old dues</p>
                      )}
                    </div>
                  </div>

                  {/* 12 Months Table with Advance Adjusted Column */}
                  <div className="border border-[#E8D0B5] rounded-xl overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#4A2112] text-[#FFF4E2] font-semibold">
                          <tr>
                            <th className="p-2.5">Select</th>
                            <th className="p-2.5">Academic Month</th>
                            <th className="p-2.5">Base Fee</th>
                            <th className="p-2.5">Discount</th>
                            <th className="p-2.5 bg-[#6B2E16] text-[#D6A64F]">Advance Adjusted</th>
                            <th className="p-2.5">Direct Paid</th>
                            <th className="p-2.5">Effective Paid</th>
                            <th className="p-2.5">Net Due</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5 text-right">Receipt #</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {studentLedger.months.map((m: any) => {
                            const isSelected = selectedMonthsToPay.includes(m.month);
                            const hasAdvanceAdjusted = (m.advanceAdjusted || 0) > 0;
                            const isPaidViaAdvance = m.status === 'Paid' && hasAdvanceAdjusted && (m.amountPaid || 0) === 0;

                            return (
                              <tr
                                key={m.month}
                                className={`hover:bg-stone-50 transition-colors ${isSelected ? 'bg-amber-50/60' : ''}`}
                              >
                                <td className="p-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={m.status === 'Paid'}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedMonthsToPay([...selectedMonthsToPay, m.month]);
                                        setPaymentAmount(paymentAmount + m.balance);
                                      } else {
                                        setSelectedMonthsToPay(selectedMonthsToPay.filter((x) => x !== m.month));
                                        setPaymentAmount(Math.max(0, paymentAmount - m.balance));
                                      }
                                    }}
                                    className="w-4 h-4 text-[#6B2E16] focus:ring-[#6B2E16] rounded cursor-pointer"
                                  />
                                </td>
                                <td className="p-2.5 font-bold text-stone-900">{m.month}</td>
                                <td className="p-2.5 text-stone-700">₹{m.feeAmount}</td>
                                <td className="p-2.5 text-stone-500">₹{m.discount}</td>
                                
                                {/* Advance Adjusted Cell */}
                                <td className="p-2.5">
                                  {hasAdvanceAdjusted ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                      <Sparkles className="w-3 h-3 text-emerald-600" />
                                      <span>−₹{m.advanceAdjusted} (Advance)</span>
                                    </span>
                                  ) : (
                                    <span className="text-stone-300">—</span>
                                  )}
                                </td>

                                <td className="p-2.5 font-medium text-stone-800">₹{m.amountPaid}</td>
                                <td className="p-2.5 font-semibold text-emerald-800">₹{m.effectivePaid}</td>
                                <td className="p-2.5 font-bold text-stone-900">₹{m.balance}</td>
                                <td className="p-2.5">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                      isPaidViaAdvance
                                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                                        : m.status === 'Paid'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : m.status === 'Partial'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {isPaidViaAdvance ? 'Paid (Via Advance)' : m.status}
                                  </span>
                                </td>
                                <td className="p-2.5 text-right font-mono text-[11px] text-stone-500">
                                  {m.receiptNumber || '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment Collection Form with Live Advance Notice */}
                  <form onSubmit={handleRecordPayment} className="bg-[#FFFDF9] border-2 border-[#D6A64F] rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E8D0B5] pb-2">
                      <h3 className="font-heading font-bold text-sm text-[#4A2112]">
                        Record Fee Payment for Month(s):{' '}
                        <span className="text-[#6B2E16] font-extrabold underline">
                          {selectedMonthsToPay.join(', ') || '(Select from table above)'}
                        </span>
                      </h3>
                      {studentLedger.advanceBalanceAvailable > 0 && (
                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-300 text-xs">
                          <label className="flex items-center gap-1.5 font-bold text-emerald-900 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={useAvailableAdvance}
                              onChange={(e) => setUseAvailableAdvance(e.target.checked)}
                              className="w-4 h-4 text-emerald-700 rounded"
                            />
                            <span>Use Available Advance (₹{studentLedger.advanceBalanceAvailable})</span>
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Amount to Pay Now (₹) *</label>
                        <input
                          type="number"
                          required
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(Number(e.target.value))}
                          className="w-full p-2.5 rounded-lg border-2 border-[#D6A64F] font-extrabold text-stone-900 text-sm bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Scholarship / Concession (₹)</label>
                        <input
                          type="number"
                          value={paymentDiscount}
                          onChange={(e) => setPaymentDiscount(Number(e.target.value))}
                          className="w-full p-2.5 rounded-lg border border-stone-300 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full p-2.5 rounded-lg border border-stone-300 bg-white font-medium"
                        >
                          <option value="Cash">Cash</option>
                          <option value="UPI">UPI (PhonePe / GPay / Paytm)</option>
                          <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="submit"
                          disabled={selectedMonthsToPay.length === 0 || paymentAmount <= 0}
                          className="w-full bg-[#6B2E16] hover:bg-[#4A2112] disabled:opacity-50 text-[#FFF4E2] font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-colors"
                        >
                          <Receipt className="w-4 h-4 text-[#D6A64F]" />
                          <span>Generate Official Receipt</span>
                        </button>
                      </div>
                    </div>

                    {/* LIVE ADVANCE SURPLUS / ADJUSTMENT NOTICE */}
                    {(() => {
                      const monthlyBase = studentLedger?.effectiveMonthlyFee || studentLedger?.classMonthlyFee || 800;
                      const grossObligation = monthlyBase * selectedMonthsToPay.length;
                      const netPayable = Math.max(0, grossObligation - paymentDiscount);
                      const surplus = Math.max(0, paymentAmount - netPayable);

                      if (surplus > 0) {
                        return (
                          <div className="p-3 rounded-xl bg-amber-50 border border-[#D6A64F] text-xs text-amber-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#D6A64F] shrink-0" />
                            <span>
                              <strong>Advance Notice:</strong> You are receiving <strong>₹{surplus}</strong> extra. This surplus amount will be saved into the student's <strong>Advance Balance</strong> and will <strong>automatically reduce the fee in next month(s)</strong>!
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 10: FEE RECEIPTS */}
        {activeTab === 'receipts' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E8D0B5] pb-4">
              <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">Official Fee Receipts</h1>
              <p className="text-xs text-stone-500">Search, preview, and print student payment vouchers.</p>
            </div>

            <div className="bg-white border-2 border-[#E8D0B5] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#4A2112] text-[#FFF4E2] font-semibold">
                  <tr>
                    <th className="p-3">Receipt No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Months Paid</th>
                    <th className="p-3">Amount Received</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {receipts.map((r) => (
                    <tr key={r.id} className="hover:bg-stone-50">
                      <td className="p-3 font-mono font-bold text-[#6B2E16]">{r.receiptNumber}</td>
                      <td className="p-3 font-bold text-stone-900">{r.studentName}</td>
                      <td className="p-3 font-mono text-stone-600">{r.studentId}</td>
                      <td className="p-3 font-medium text-stone-700">{r.classVal}</td>
                      <td className="p-3 text-stone-600">{r.monthsPaid.join(', ')}</td>
                      <td className="p-3 font-extrabold text-emerald-800">₹{r.amountPaid.toLocaleString('en-IN')}</td>
                      <td className="p-3 uppercase text-[11px] font-semibold text-stone-700">{r.paymentMethod}</td>
                      <td className="p-3 text-stone-500">{r.paymentDate}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onViewReceipt(r)}
                          className="bg-[#D6A64F] hover:bg-[#c2933e] text-[#3B2117] font-bold px-2.5 py-1 rounded text-[11px] shadow-xs flex items-center gap-1 ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 11: WHATSAPP FEE REMINDERS */}
        {activeTab === 'reminders' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E8D0B5] pb-4">
              <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">WhatsApp Fee Reminders</h1>
              <p className="text-xs text-stone-500">
                Send manual, pre-formatted polite Hindi reminders to parents with pending dues.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reminders.map((rem, idx) => (
                <div key={idx} className="bg-white border-2 border-[#E8D0B5] hover:border-[#D6A64F] rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-[#4A2112]">{rem.studentName}</h4>
                      <p className="text-xs text-stone-500">
                        Class: {rem.className} • Guardian: {rem.guardianName}
                      </p>
                    </div>
                    <span className="font-bold text-rose-800 text-sm">
                      ₹{rem.netPendingBalance.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600">
                    <strong>Pending Months:</strong> {rem.pendingMonths.join(', ')}
                  </p>

                  <div className="pt-2 flex justify-between items-center border-t border-stone-100">
                    <span className="text-xs font-mono text-emerald-800">+{rem.guardianPhone}</span>
                    <button
                      onClick={() => onOpenWhatsAppModal(rem)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Review & Send via WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 12: SCHOOL VAN & TRANSPORT MANAGEMENT */}
        {activeTab === 'transport' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E8D0B5] pb-4">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">School Van & Student Transport</h1>
                <p className="text-xs text-stone-500">
                  Manage bus routes, drivers, contact numbers, pickup/drop timings, and monthly bus fare.
                </p>
              </div>
              <button
                onClick={() => setTransportModal('new')}
                className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4 text-[#D6A64F]" />
                <span>Add Van Route</span>
              </button>
            </div>

            <div className="bg-white border-2 border-[#E8D0B5] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#4A2112] text-[#FFF4E2] font-semibold">
                  <tr>
                    <th className="p-3">Route & Stops</th>
                    <th className="p-3">Vehicle No</th>
                    <th className="p-3">Driver Name</th>
                    <th className="p-3">Driver Phone</th>
                    <th className="p-3">Timings</th>
                    <th className="p-3">Monthly Charge</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {transports.map((t) => (
                    <tr key={t.id} className="hover:bg-stone-50">
                      <td className="p-3">
                        <div className="font-bold text-stone-900">{t.routeName}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{t.areasCovered}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-[#6B2E16]">{t.vehicleNo}</td>
                      <td className="p-3 font-medium text-stone-800">{t.driverName}</td>
                      <td className="p-3 font-mono text-stone-700">
                        <a href={`tel:${t.driverPhone}`} className="hover:underline text-emerald-800 font-bold">
                          {t.driverPhone}
                        </a>
                      </td>
                      <td className="p-3 text-[11px] text-stone-600">
                        <div>Pickup: {t.morningTime || '07:15 AM'}</div>
                        <div>Drop: {t.afternoonTime || '02:30 PM'}</div>
                      </td>
                      <td className="p-3 font-bold text-[#6B2E16]">
                        {t.monthlyCharge ? `₹${t.monthlyCharge} / mo` : 'Included'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            t.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {t.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => setTransportModal(t)}
                          className="p-1 hover:bg-[#FFF4E2] rounded text-[#6B2E16]"
                          title="Edit Route"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransport(t.id)}
                          className="p-1 hover:bg-rose-50 rounded text-rose-600"
                          title="Delete Route"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transports.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-stone-500">
                        No transport routes configured yet. Click "Add Van Route" to create the first route.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 13: NOTICES CRUD */}
        {activeTab === 'notices' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E8D0B5] pb-4">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">Notices & Circulars</h1>
                <p className="text-xs text-stone-500">Publish exam circulars, event announcements, and emergency notices.</p>
              </div>
              <button
                onClick={() => setNoticeModal('new')}
                className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4 text-[#D6A64F]" />
                <span>Create Notice</span>
              </button>
            </div>

            <div className="space-y-3">
              {notices.map((n) => (
                <div key={n.id} className="bg-white border-2 border-[#E8D0B5] rounded-xl p-4 shadow-xs flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#6B2E16] text-[#FFF4E2] uppercase">
                        {n.category}
                      </span>
                      {n.isUrgent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                          Urgent
                        </span>
                      )}
                      <span className="text-xs text-stone-500">{n.publishedDate}</span>
                    </div>
                    <h4 className="font-heading font-bold text-sm text-[#4A2112]">{n.title}</h4>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">{n.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setNoticeModal(n)}
                      className="p-1 hover:bg-[#FFF4E2] rounded text-[#6B2E16]"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1 hover:bg-rose-50 rounded text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 13: GALLERY CRUD */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E8D0B5] pb-4">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">School Gallery Management</h1>
                <p className="text-xs text-stone-500">Upload or link campus photos, cultural celebrations, and sports events.</p>
              </div>
              <button
                onClick={() => setGalleryModal({ title: '', category: 'Campus', imageUrl: '' })}
                className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4 text-[#D6A64F]" />
                <span>Add Gallery Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map((g) => (
                <div key={g.id} className="relative rounded-xl overflow-hidden border-2 border-[#D6A64F] aspect-4/3 bg-stone-900 group">
                  <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#D6A64F]">{g.category}</span>
                    <p className="font-bold line-clamp-2">{g.title}</p>
                    <button
                      onClick={() => handleDeleteGallery(g.id)}
                      className="self-end p-1 text-rose-400 hover:text-rose-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 14: CONTACT ENQUIRIES */}
        {activeTab === 'contacts' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E8D0B5] pb-4">
              <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">Contact Enquiries & Feedback</h1>
              <p className="text-xs text-stone-500">Messages sent through the public website contact form.</p>
            </div>

            <div className="space-y-3">
              {contactEnquiries.map((c) => (
                <div key={c.id} className="bg-white border-2 border-[#E8D0B5] rounded-xl p-5 shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-[#4A2112]">{c.name}</h4>
                      <p className="text-xs text-stone-500">
                        Phone: <a href={`tel:${c.phone}`} className="font-mono text-[#6B2E16] font-bold">{c.phone}</a> • Email: {c.email || 'N/A'}
                      </p>
                    </div>
                    <span className="text-[11px] text-stone-400">{c.createdAt}</span>
                  </div>
                  <p className="text-xs text-stone-800 bg-[#FFFDF9] p-3 rounded-lg border border-stone-200">
                    {c.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 15: USER MANAGEMENT & SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E8D0B5] pb-4">
              <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">Security & Password Settings</h1>
              <p className="text-xs text-stone-500">Update administrator credentials using server-side scrypt cryptography.</p>
            </div>

            <form onSubmit={handleChangePassword} className="bg-white border-2 border-[#D6A64F] rounded-2xl p-6 max-w-md space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">New Password (Min 6 chars) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:border-[#6B2E16]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-bold py-2.5 rounded-lg uppercase tracking-wider text-xs shadow-md"
              >
                Update Password
              </button>
            </form>
          </div>
        )}

        {/* TAB 16: DATABASE BACKUP & RESTORE (LOCAL SQLITE & LOCAL AUTO-BACKUP) */}
        {activeTab === 'backup' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="border-b border-[#E8D0B5] pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-[#4A2112]">
                  Offline SQLite Database & Local Automatic Backup
                </h1>
                <p className="text-xs text-stone-600 mt-0.5">
                  Self-contained local SQLite storage for 100% offline use, with automated backup snapshots saved strictly to the local server folder.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAutoBackupStatus}
                disabled={autoBackupLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D6A64F] bg-[#FFF4E2] text-[#4A2112] text-xs font-bold hover:bg-[#ffeac4] transition-colors self-start md:self-auto shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${autoBackupLoading ? 'animate-spin text-[#6B2E16]' : 'text-[#6B2E16]'}`} />
                <span>Refresh Backup Status</span>
              </button>
            </div>

            {/* Offline & Auto-Backup Status Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Local SQLite Engine */}
              <div className="bg-white border-2 border-emerald-300 rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Database Engine</span>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    Offline Ready
                  </span>
                </div>
                <div className="text-sm font-extrabold text-stone-900">SQLite Embedded</div>
                <div className="text-[11px] text-stone-500 font-mono truncate" title={autoBackupStatus?.databasePath || 'data/school.db'}>
                  {autoBackupStatus?.databasePath || 'data/school.db'}
                </div>
                <div className="pt-1 text-[11px] font-semibold text-stone-600 border-t border-stone-100 flex justify-between">
                  <span>File Size:</span>
                  <span className="font-bold text-emerald-700">{autoBackupStatus?.databaseSizeFormatted || '8 KB'}</span>
                </div>
              </div>

              {/* Card 2: Automatic Local Backup */}
              <div className="bg-white border-2 border-[#D6A64F] rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B2E16] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#D6A64F]" />
                    <span>Auto-Backup</span>
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      autoBackupStatus?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {autoBackupStatus?.enabled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>}
                    {autoBackupStatus?.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="text-sm font-extrabold text-[#4A2112]">
                  {autoBackupStatus?.enabled
                    ? `Every ${autoBackupStatus.intervalMinutes >= 60 ? `${autoBackupStatus.intervalMinutes / 60} hr` : `${autoBackupStatus.intervalMinutes} min`}`
                    : 'Scheduled Backup Paused'}
                </div>
                <div className="text-[11px] text-stone-500 font-mono truncate" title={autoBackupStatus?.backupFolderPath || 'data/backups'}>
                  Target: {autoBackupStatus?.backupFolderPath || 'data/backups'}
                </div>
                <div className="pt-1 text-[11px] font-semibold text-stone-600 border-t border-stone-100 flex justify-between">
                  <span>Storage:</span>
                  <span className="font-bold text-[#6B2E16]">Local Folder Only</span>
                </div>
              </div>

              {/* Card 3: Total Backups on Disk */}
              <div className="bg-white border-2 border-[#E8D0B5] rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-[#6B2E16]" />
                    <span>Local Snapshots</span>
                  </span>
                  <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                    Disk Storage
                  </span>
                </div>
                <div className="text-sm font-extrabold text-stone-900">
                  {autoBackupStatus?.totalBackupsCount ?? (autoBackupStatus?.backups?.length || 0)} Backups Stored
                </div>
                <div className="text-[11px] text-stone-500">
                  Auto-rotation: Last 30 snapshots
                </div>
                <div className="pt-1 text-[11px] font-semibold text-stone-600 border-t border-stone-100 flex justify-between">
                  <span>Total Folder Size:</span>
                  <span className="font-bold text-stone-800">{autoBackupStatus?.totalBackupSizeFormatted || '0 B'}</span>
                </div>
              </div>

              {/* Card 4: Timing & Next Scheduled */}
              <div className="bg-white border-2 border-[#E8D0B5] rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Backup Timing</span>
                  </span>
                  <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                    Schedule
                  </span>
                </div>
                <div className="text-xs font-bold text-stone-800 truncate">
                  Last: {autoBackupStatus?.lastBackupTime ? new Date(autoBackupStatus.lastBackupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Startup'}
                </div>
                <div className="text-[11px] text-stone-500 truncate">
                  Next: {autoBackupStatus?.nextBackupTime ? new Date(autoBackupStatus.nextBackupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                </div>
                <div className="pt-1 text-[11px] font-semibold text-stone-600 border-t border-stone-100 flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-700">Healthy & Synchronized</span>
                </div>
              </div>
            </div>

            {/* Laptop Local Storage Root: D:\Saraswati_School_Data */}
            <div className="bg-white border-2 border-[#D6A64F] rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-[#E8D0B5]">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-[#6B2E16]" />
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-[#4A2112]">
                      Windows Laptop Storage Root: <span className="font-mono text-emerald-800 font-extrabold">{autoBackupStatus?.displayRootPath || 'D:\\Saraswati_School_Data'}</span>
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Auto-created folders for offline SQLite database, hourly automated backups, receipts, and exports.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>D: Drive Active & Auto-Created</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-emerald-700" />
                      <span>1. Database</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
                  </div>
                  <div className="text-[11px] font-mono text-stone-600 truncate" title={autoBackupStatus?.displayDbPath || 'D:\\Saraswati_School_Data\\Database\\school.db'}>
                    ...\Database\school.db
                  </div>
                  <div className="text-[10px] text-stone-500">Main SQLite offline file</div>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#D6A64F]" />
                      <span>2. Backups</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Hourly</span>
                  </div>
                  <div className="text-[11px] font-mono text-stone-600 truncate" title={`${autoBackupStatus?.displayRootPath || 'D:\\Saraswati_School_Data'}\\Backups\\`}>
                    ...\Backups\
                  </div>
                  <div className="text-[10px] text-stone-500">Last 30 snapshots kept</div>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5 text-blue-700" />
                      <span>3. Receipts</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Auto-Archive</span>
                  </div>
                  <div className="text-[11px] font-mono text-stone-600 truncate" title={`${autoBackupStatus?.displayRootPath || 'D:\\Saraswati_School_Data'}\\Receipts\\`}>
                    ...\Receipts\
                  </div>
                  <div className="text-[10px] text-stone-500">Student fee receipt vouchers</div>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 flex items-center gap-1">
                      <Download className="w-3.5 h-3.5 text-purple-700" />
                      <span>4. Exports</span>
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">Ready</span>
                  </div>
                  <div className="text-[11px] font-mono text-stone-600 truncate" title={`${autoBackupStatus?.displayRootPath || 'D:\\Saraswati_School_Data'}\\Exports\\`}>
                    ...\Exports\
                  </div>
                  <div className="text-[10px] text-stone-500">Full JSON & data dumps</div>
                </div>
              </div>
            </div>

            {/* Main Action Panels Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel 1: Local SQLite Offline Database & Export */}
              <div className="bg-white border-2 border-emerald-400 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-emerald-100">
                  <HardDrive className="w-5 h-5 text-emerald-700" />
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-[#4A2112]">
                      Local SQLite Database (Offline Ready)
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Standard local file database requiring zero cloud configuration or internet
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-stone-700 leading-relaxed">
                  <p>
                    All school records (students, admissions, fee payments, ledger records, staff profiles, and circulars) are persistently stored in the local SQLite file:
                  </p>
                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px] text-stone-800 break-all select-all flex items-center justify-between gap-2">
                    <span>{autoBackupStatus?.databasePath || 'data/school.db'}</span>
                    <span className="shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Local</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-stone-600">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>100% Offline Capable:</strong> The entire school ERP runs without requiring internet connectivity.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Zero Third-Party Cloud:</strong> No remote databases, Firebase, or external servers are involved.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Portable:</strong> The raw <code>.db</code> file can be opened directly with DB Browser for SQLite or Python.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 space-y-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleDownloadSqliteFile}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-xs"
                  >
                    <Download className="w-4 h-4 text-emerald-200" />
                    <span>Download Raw SQLite Database File (.db)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="w-full bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors text-xs"
                  >
                    <Database className="w-4 h-4 text-[#D6A64F]" />
                    <span>Export Portable JSON Backup File</span>
                  </button>
                </div>
              </div>

              {/* Panel 2: Automatic Backup to Local Folder Only */}
              <div className="bg-white border-2 border-[#D6A64F] rounded-2xl p-6 shadow-sm space-y-4 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E8D0B5]">
                  <Clock className="w-5 h-5 text-[#D6A64F]" />
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-[#4A2112]">
                      Automatic Backup to Local Folder
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Scheduled automated SQLite snapshots written exclusively to local disk
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-amber-50/70 border border-[#E8D0B5] rounded-xl text-stone-700 space-y-1">
                    <div className="font-bold text-[#6B2E16] flex items-center gap-1.5">
                      <span>🔒 Local Folder Target Only:</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Snapshots are automatically created and stored strictly in the server's local directory:
                      <code className="block font-mono font-bold text-[#4A2112] mt-0.5 break-all">
                        {autoBackupStatus?.backupFolderPath || 'data/backups/'}
                      </code>
                    </p>
                  </div>

                  {/* Config Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Auto-Backup Status:
                      </label>
                      <select
                        value={autoBackupEnabledInput ? '1' : '0'}
                        onChange={(e) => setAutoBackupEnabledInput(e.target.value === '1')}
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white font-semibold text-stone-800"
                      >
                        <option value="1">Enabled (Active Background Timer)</option>
                        <option value="0">Disabled (Manual Only)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Backup Frequency / Interval:
                      </label>
                      <select
                        value={autoBackupIntervalInput}
                        onChange={(e) => setAutoBackupIntervalInput(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white font-semibold text-stone-800"
                      >
                        <option value={30}>Every 30 Minutes</option>
                        <option value={60}>Every 1 Hour (Recommended)</option>
                        <option value={180}>Every 3 Hours</option>
                        <option value={360}>Every 6 Hours</option>
                        <option value={720}>Every 12 Hours</option>
                        <option value={1440}>Every 24 Hours (Daily)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveAutoBackupConfig(autoBackupEnabledInput, autoBackupIntervalInput)}
                    className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-3 py-2 rounded-lg transition-colors text-xs border border-stone-300 flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-stone-600" />
                    <span>Save Auto-Backup Schedule Settings</span>
                  </button>

                  <div className="pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      disabled={instantBackupLoading}
                      onClick={handleTriggerInstantBackup}
                      className="w-full bg-[#D6A64F] hover:bg-[#c4933d] text-[#3B2117] font-extrabold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-xs"
                    >
                      {instantBackupLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Creating Snapshot in Local Folder...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-[#6B2E16]" />
                          <span>Create Instant Snapshot in Local Folder Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Local Backup Folder Browser Table */}
            <div className="bg-white border-2 border-[#E8D0B5] rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 bg-[#FFF4E2] border-b border-[#E8D0B5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-[#4A2112] flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[#6B2E16]" />
                    <span>Local Backup Files on Disk (<code>data/backups/</code>)</span>
                  </h3>
                  <p className="text-[11px] text-stone-600">
                    Direct access to all SQLite backups stored inside the local backup folder.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#6B2E16] bg-[#E8D0B5] px-2.5 py-1 rounded-full">
                  {autoBackupStatus?.backups?.length || 0} Files Available
                </span>
              </div>

              <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#4A2112] text-[#FFF4E2] sticky top-0 font-semibold text-[11px]">
                    <tr>
                      <th className="p-3">Backup File Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Created Date & Time</th>
                      <th className="p-3">File Size</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {autoBackupStatus?.backups && autoBackupStatus.backups.length > 0 ? (
                      autoBackupStatus.backups.map((b: any) => (
                        <tr key={b.filename} className="hover:bg-amber-50/40">
                          <td className="p-3 font-mono font-bold text-stone-900">
                            {b.filename}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                b.isAuto ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {b.isAuto ? 'Auto Scheduled' : 'Manual Snapshot'}
                            </span>
                          </td>
                          <td className="p-3 text-stone-600 text-[11px]">
                            {new Date(b.createdAt).toLocaleString()}
                          </td>
                          <td className="p-3 font-bold text-stone-800 font-mono">
                            {b.sizeFormatted || `${Math.round(b.sizeBytes / 1024)} KB`}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => handleDownloadLocalBackup(b.filename)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded text-[11px] shadow-xs"
                              title="Download this backup file"
                            >
                              <Download className="w-3 h-3 text-[#6B2E16]" />
                              <span>Download</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedBackupForRestore(b.filename)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#D6A64F] hover:bg-[#c4933d] text-[#3B2117] font-bold rounded text-[11px] shadow-xs"
                              title="Restore active database from this local backup"
                            >
                              <RefreshCw className="w-3 h-3 text-[#6B2E16]" />
                              <span>Restore</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLocalBackup(b.filename)}
                              className="p-1 hover:bg-rose-100 text-rose-600 rounded"
                              title="Delete this local backup"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-stone-500 text-xs">
                          No local backups found in <code>data/backups/</code> yet. Click <strong>"Create Instant Snapshot in Local Folder Now"</strong> above to make your first local backup.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Existing Feature Preserved: ZERO DATABASE & FRESH START */}
            <div className="bg-white border-2 border-rose-300 rounded-2xl p-6 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-rose-800 pb-2 border-b border-rose-100">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-heading font-bold text-sm">Database Zero & Fresh Reset</h3>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Reset school records to zero (0 students, 0 receipts, 0 dues) so you can begin entering actual school data from a fresh, clean slate.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setZeroModal('all')}
                  className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset All Records to Zero</span>
                </button>

                <button
                  type="button"
                  onClick={() => setZeroModal('dues')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors text-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Zero All Student Dues (₹0)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setZeroModal('reseed')}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-4 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-[11px]"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Restore Sample Demo Data</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Teacher Modal */}
      {teacherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-4 border-[#D6A64F] max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E8D0B5]">
              <h3 className="font-heading font-bold text-base text-[#4A2112]">
                {teacherModal === 'new' ? 'Add New Faculty Profile' : 'Edit Faculty Member'}
              </h3>
              <button onClick={() => setTeacherModal(null)} className="p-1 hover:bg-stone-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                handleSaveTeacher({
                  id: teacherModal !== 'new' ? teacherModal.id : undefined,
                  name: form.name.value,
                  designation: form.designation.value,
                  subject: form.subject.value,
                  qualification: form.qualification.value,
                  experienceYears: parseInt(form.experience.value, 10) || 0,
                  bio: form.bio.value,
                  photoUrl: form.photoUrl.value || '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg',
                  isPublished: form.isPublished.checked
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-stone-700 mb-1">Teacher Full Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={teacherModal !== 'new' ? teacherModal.name : ''}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Designation *</label>
                  <input
                    name="designation"
                    type="text"
                    required
                    defaultValue={teacherModal !== 'new' ? teacherModal.designation : ''}
                    placeholder="e.g. Senior Teacher & HOD"
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Subject *</label>
                  <input
                    name="subject"
                    type="text"
                    required
                    defaultValue={teacherModal !== 'new' ? teacherModal.subject : ''}
                    placeholder="e.g. Mathematics"
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Qualifications *</label>
                  <input
                    name="qualification"
                    type="text"
                    required
                    defaultValue={teacherModal !== 'new' ? teacherModal.qualification : ''}
                    placeholder="e.g. M.Sc., B.Ed."
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Experience (Years)</label>
                  <input
                    name="experience"
                    type="number"
                    defaultValue={teacherModal !== 'new' ? teacherModal.experienceYears : 5}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Photo Image URL</label>
                <input
                  name="photoUrl"
                  type="text"
                  defaultValue={teacherModal !== 'new' ? teacherModal.photoUrl : ''}
                  placeholder="/assets/aistudio/... or web URL"
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Brief Biography</label>
                <textarea
                  name="bio"
                  rows={2}
                  defaultValue={teacherModal !== 'new' ? teacherModal.bio : ''}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  name="isPublished"
                  type="checkbox"
                  id="pubT"
                  defaultChecked={teacherModal !== 'new' ? teacherModal.isPublished : true}
                  className="w-4 h-4 text-[#6B2E16]"
                />
                <label htmlFor="pubT" className="font-bold text-stone-800">
                  Publish on Public Faculty Directory
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTeacherModal(null)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6B2E16] text-[#FFF4E2] font-bold px-4 py-1.5 rounded hover:bg-[#4A2112]"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Modal */}
      {studentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border-4 border-[#D6A64F] max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E8D0B5]">
              <h3 className="font-heading font-bold text-base text-[#4A2112]">
                {studentModal === 'new' ? 'Enroll New Student' : 'Edit Student Record'}
              </h3>
              <button onClick={() => setStudentModal(null)} className="p-1 hover:bg-stone-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.target as any;
                handleSaveStudent({
                  id: studentModal !== 'new' ? studentModal.id : undefined,
                  studentId: f.studentId.value,
                  fullName: f.fullName.value,
                  dob: f.dob.value,
                  gender: f.gender.value,
                  classVal: f.classVal.value,
                  section: f.section.value,
                  rollNumber: f.rollNumber.value,
                  admissionNumber: f.admissionNumber.value,
                  admissionDate: f.admissionDate.value,
                  fatherName: f.fatherName.value,
                  motherName: f.motherName.value,
                  guardianName: f.guardianName.value || f.fatherName.value,
                  guardianPhone: f.guardianPhone.value,
                  address: f.address.value,
                  status: f.status.value,
                  previousDueBalance: Number(f.previousDueBalance.value || 0),
                  advanceBalance: Number(f.advanceBalance?.value || 0),
                  monthlyFeeOverride: f.monthlyFeeOverride?.value ? Number(f.monthlyFeeOverride.value) : undefined
                });
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Permanent Student ID *</label>
                  <input
                    name="studentId"
                    type="text"
                    required
                    defaultValue={studentModal !== 'new' ? studentModal.studentId : ''}
                    placeholder="Leave blank for auto SVM-2026-XXX"
                    className="w-full p-2 rounded-lg border border-stone-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Student Full Name *</label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    defaultValue={studentModal !== 'new' ? studentModal.fullName : ''}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Class *</label>
                  <select
                    name="classVal"
                    defaultValue={studentModal !== 'new' ? studentModal.classVal : 'Class I'}
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                  >
                    {classesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Section</label>
                  <input
                    name="section"
                    type="text"
                    defaultValue={studentModal !== 'new' ? studentModal.section : 'A'}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Roll Number</label>
                  <input
                    name="rollNumber"
                    type="text"
                    defaultValue={studentModal !== 'new' ? studentModal.rollNumber : '01'}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Date of Birth *</label>
                  <input
                    name="dob"
                    type="date"
                    required
                    defaultValue={studentModal !== 'new' ? studentModal.dob : '2016-01-01'}
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Gender *</label>
                  <select
                    name="gender"
                    defaultValue={studentModal !== 'new' ? studentModal.gender : 'Male'}
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Father's Name *</label>
                  <input
                    name="fatherName"
                    type="text"
                    required
                    defaultValue={studentModal !== 'new' ? studentModal.fatherName : ''}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mother's Name</label>
                  <input
                    name="motherName"
                    type="text"
                    defaultValue={studentModal !== 'new' ? studentModal.motherName : ''}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Guardian Phone *</label>
                  <input
                    name="guardianPhone"
                    type="tel"
                    required
                    defaultValue={studentModal !== 'new' ? studentModal.guardianPhone : ''}
                    className="w-full p-2 rounded-lg border border-stone-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Guardian Name</label>
                  <input
                    name="guardianName"
                    type="text"
                    defaultValue={studentModal !== 'new' ? studentModal.guardianName : ''}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Address *</label>
                <input
                  name="address"
                  type="text"
                  required
                  defaultValue={studentModal !== 'new' ? studentModal.address : 'Kathig, Semla, Dumka'}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              {/* Dues, Advance, and Monthly Fee Override */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/50 p-3 rounded-xl border border-[#E8D0B5]">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={studentModal !== 'new' ? studentModal.status : 'Active'}
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Passed Out">Passed Out</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Old Dues (₹)</label>
                  <input
                    name="previousDueBalance"
                    type="number"
                    defaultValue={studentModal !== 'new' ? studentModal.previousDueBalance : 0}
                    className="w-full p-2 rounded-lg border border-rose-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-800 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Advance Balance (₹)</span>
                  </label>
                  <input
                    name="advanceBalance"
                    type="number"
                    defaultValue={studentModal !== 'new' ? (studentModal.advanceBalance || 0) : 0}
                    className="w-full p-2 rounded-lg border border-emerald-400 font-bold text-emerald-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Fee Override (₹)</label>
                  <input
                    name="monthlyFeeOverride"
                    type="number"
                    placeholder="Standard"
                    defaultValue={studentModal !== 'new' && studentModal.monthlyFeeOverride ? studentModal.monthlyFeeOverride : ''}
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                    title="Leave empty for standard class fee"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStudentModal(null)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6B2E16] text-[#FFF4E2] font-bold px-4 py-1.5 rounded hover:bg-[#4A2112]"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SINGLE CLASS FEE STRUCTURE EDIT MODAL */}
      {feeModalEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-[#D6A64F] animate-fadeIn">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E8D0B5]">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#D6A64F]" />
                <h3 className="font-heading font-extrabold text-base text-[#4A2112]">
                  Edit Fee Structure: {feeModalEdit.className}
                </h3>
              </div>
              <button onClick={() => setFeeModalEdit(null)} className="p-1 hover:bg-stone-100 rounded">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.target as any;
                handleSaveFeeStructure({
                  className: feeModalEdit.className,
                  monthlyTuitionFee: Number(f.monthlyTuitionFee.value) || 0,
                  admissionFee: Number(f.admissionFee.value) || 0,
                  examFee: Number(f.examFee.value) || 0,
                  computerFee: Number(f.computerFee.value) || 0
                });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Monthly Tuition Fee (₹) *
                </label>
                <input
                  name="monthlyTuitionFee"
                  type="number"
                  required
                  defaultValue={feeModalEdit.monthlyTuitionFee}
                  className="w-full p-2.5 rounded-lg border-2 border-[#D6A64F] font-extrabold text-sm text-[#6B2E16] bg-amber-50/40"
                />
                <p className="text-[11px] text-stone-500 mt-1">This monthly rate applies to all enrolled students of {feeModalEdit.className}.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Admission Fee (₹)</label>
                  <input
                    name="admissionFee"
                    type="number"
                    defaultValue={feeModalEdit.admissionFee || 0}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Exam Fee (₹)</label>
                  <input
                    name="examFee"
                    type="number"
                    defaultValue={feeModalEdit.examFee || 0}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Computer Fee (₹)</label>
                  <input
                    name="computerFee"
                    type="number"
                    defaultValue={feeModalEdit.computerFee || 0}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeeModalEdit(null)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-4 h-4 text-[#D6A64F]" />
                  <span>Update Fee</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK EDIT ALL CLASSES FEE MODAL */}
      {batchFeeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border-4 border-[#D6A64F] max-h-[85vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E8D0B5]">
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-[#D6A64F]" />
                <div>
                  <h3 className="font-heading font-extrabold text-base text-[#4A2112]">
                    Bulk Fee Manager: Edit All Classes
                  </h3>
                  <p className="text-[11px] text-stone-500">Edit monthly tuition fees for Nursery through Class X in one place.</p>
                </div>
              </div>
              <button onClick={() => setBatchFeeModal(false)} className="p-1 hover:bg-stone-100 rounded">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveBatchFeeStructures(batchFeesState);
              }}
              className="space-y-4 text-xs"
            >
              <div className="border border-stone-200 rounded-xl overflow-hidden max-h-[55vh] overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#4A2112] text-[#FFF4E2] sticky top-0 font-semibold">
                    <tr>
                      <th className="p-2.5">Class Name</th>
                      <th className="p-2.5">Monthly Tuition Fee (₹ / month) *</th>
                      <th className="p-2.5">Exam Fee (₹)</th>
                      <th className="p-2.5">Computer Fee (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {batchFeesState.map((bf, idx) => (
                      <tr key={bf.className} className="hover:bg-amber-50/40">
                        <td className="p-2.5 font-bold text-stone-900">{bf.className}</td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            required
                            value={bf.monthlyTuitionFee}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setBatchFeesState((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, monthlyTuitionFee: val } : item))
                              );
                            }}
                            className="w-32 p-1.5 rounded-lg border border-[#D6A64F] font-bold text-[#6B2E16] bg-amber-50/30"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            value={bf.examFee}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setBatchFeesState((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, examFee: val } : item))
                              );
                            }}
                            className="w-24 p-1.5 rounded-lg border border-stone-300"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            value={bf.computerFee}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setBatchFeesState((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, computerFee: val } : item))
                              );
                            }}
                            className="w-24 p-1.5 rounded-lg border border-stone-300"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBatchFeeModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-bold px-6 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-4 h-4 text-[#D6A64F]" />
                  <span>Save All Class Fees</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Modal */}
      {noticeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-4 border-[#D6A64F]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E8D0B5]">
              <h3 className="font-heading font-bold text-base text-[#4A2112]">
                {noticeModal === 'new' ? 'Publish New Notice' : 'Edit Notice'}
              </h3>
              <button onClick={() => setNoticeModal(null)} className="p-1 hover:bg-stone-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.target as any;
                handleSaveNotice({
                  id: noticeModal !== 'new' ? noticeModal.id : undefined,
                  title: f.title.value,
                  description: f.description.value,
                  category: f.category.value,
                  isUrgent: f.isUrgent.checked,
                  publishedDate: f.publishedDate.value
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-stone-700 mb-1">Notice Title *</label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={noticeModal !== 'new' ? noticeModal.title : ''}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category *</label>
                  <select
                    name="category"
                    defaultValue={noticeModal !== 'new' ? noticeModal.category : 'General'}
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Academic">Academic</option>
                    <option value="Examination">Examination</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Publish Date *</label>
                  <input
                    name="publishedDate"
                    type="date"
                    required
                    defaultValue={noticeModal !== 'new' ? noticeModal.publishedDate : new Date().toISOString().split('T')[0]}
                    className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Notice Content *</label>
                <textarea
                  name="description"
                  rows={4}
                  required
                  defaultValue={noticeModal !== 'new' ? noticeModal.description : ''}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  name="isUrgent"
                  type="checkbox"
                  id="urg"
                  defaultChecked={noticeModal !== 'new' ? noticeModal.isUrgent : false}
                  className="w-4 h-4 text-rose-600"
                />
                <label htmlFor="urg" className="font-bold text-rose-800">
                  Mark as Urgent Notice (Red Alert Banner)
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNoticeModal(null)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6B2E16] text-[#FFF4E2] font-bold px-4 py-1.5 rounded hover:bg-[#4A2112]"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {galleryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-[#D6A64F]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E8D0B5]">
              <h3 className="font-heading font-bold text-base text-[#4A2112]">Add Gallery Photograph</h3>
              <button onClick={() => setGalleryModal(null)} className="p-1 hover:bg-stone-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGalleryPhoto} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Photo Caption / Title *</label>
                <input
                  type="text"
                  required
                  value={galleryModal.title}
                  onChange={(e) => setGalleryModal({ ...galleryModal, title: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Category</label>
                <select
                  value={galleryModal.category}
                  onChange={(e) => setGalleryModal({ ...galleryModal, category: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="Campus">Campus</option>
                  <option value="Events">Events</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Celebrations">Celebrations</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Image URL or Asset Path *</label>
                <input
                  type="text"
                  required
                  value={galleryModal.imageUrl}
                  onChange={(e) => setGalleryModal({ ...galleryModal, imageUrl: e.target.value })}
                  placeholder="/assets/aistudio/... or https://..."
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGalleryModal(null)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6B2E16] text-[#FFF4E2] font-bold px-4 py-1.5 rounded hover:bg-[#4A2112]"
                >
                  Add to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transport Modal */}
      {transportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-4 border-[#D6A64F] max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E8D0B5]">
              <h3 className="font-heading font-bold text-base text-[#4A2112]">
                {transportModal === 'new' ? 'Add School Van / Bus Route' : 'Edit Transport Route'}
              </h3>
              <button onClick={() => setTransportModal(null)} className="p-1 hover:bg-stone-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                handleSaveTransport({
                  id: transportModal !== 'new' ? transportModal.id : undefined,
                  routeName: form.routeName.value,
                  vehicleNo: form.vehicleNo.value,
                  driverName: form.driverName.value,
                  driverPhone: form.driverPhone.value,
                  areasCovered: form.areasCovered.value,
                  morningTime: form.morningTime.value,
                  afternoonTime: form.afternoonTime.value,
                  monthlyCharge: Number(form.monthlyCharge.value || 0),
                  isActive: form.isActive.checked
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-stone-700 mb-1">Route Name *</label>
                <input
                  name="routeName"
                  type="text"
                  required
                  defaultValue={transportModal !== 'new' ? transportModal.routeName : ''}
                  placeholder="e.g. Route 1: Dumka Station to School via Semla"
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Vehicle Number *</label>
                  <input
                    name="vehicleNo"
                    type="text"
                    required
                    defaultValue={transportModal !== 'new' ? transportModal.vehicleNo : ''}
                    placeholder="e.g. JH-04-AB-1234"
                    className="w-full p-2 rounded-lg border border-stone-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Monthly Charge (₹)</label>
                  <input
                    name="monthlyCharge"
                    type="number"
                    defaultValue={transportModal !== 'new' ? transportModal.monthlyCharge : 600}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Driver Name *</label>
                  <input
                    name="driverName"
                    type="text"
                    required
                    defaultValue={transportModal !== 'new' ? transportModal.driverName : ''}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Driver Phone *</label>
                  <input
                    name="driverPhone"
                    type="tel"
                    required
                    defaultValue={transportModal !== 'new' ? transportModal.driverPhone : ''}
                    className="w-full p-2 rounded-lg border border-stone-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Areas & Stops Covered *</label>
                <textarea
                  name="areasCovered"
                  rows={2}
                  required
                  defaultValue={transportModal !== 'new' ? transportModal.areasCovered : ''}
                  placeholder="e.g. Semla Chowk, Kathig Village, Jones P.O., Railway Colony"
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Morning Pickup Time</label>
                  <input
                    name="morningTime"
                    type="text"
                    defaultValue={transportModal !== 'new' ? transportModal.morningTime : '07:15 AM - 07:50 AM'}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Afternoon Drop Time</label>
                  <input
                    name="afternoonTime"
                    type="text"
                    defaultValue={transportModal !== 'new' ? transportModal.afternoonTime : '02:30 PM - 03:15 PM'}
                    className="w-full p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  name="isActive"
                  type="checkbox"
                  id="traActive"
                  defaultChecked={transportModal !== 'new' ? transportModal.isActive : true}
                  className="w-4 h-4 text-[#6B2E16]"
                />
                <label htmlFor="traActive" className="font-bold text-stone-800">
                  Active Operational Route (Visible on website)
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransportModal(null)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#6B2E16] text-[#FFF4E2] font-bold px-4 py-1.5 rounded hover:bg-[#4A2112]"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promotion Tool Modal */}
      {promotionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-[#D6A64F] space-y-4">
            <h3 className="font-heading font-bold text-base text-[#4A2112]">Annual Class Promotion Tool</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Batch-promote all active students in a particular class to the subsequent academic grade.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Promote From Class:</label>
                <select
                  value={promoFromClass}
                  onChange={(e) => setPromoFromClass(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                >
                  {classesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Promote Into Class:</label>
                <select
                  value={promoToClass}
                  onChange={(e) => setPromoToClass(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                >
                  {classesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPromotionModal(false)}
                className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePromoteStudents}
                className="bg-[#6B2E16] text-[#FFF4E2] font-bold px-4 py-1.5 rounded text-xs hover:bg-[#4A2112]"
              >
                Execute Class Promotion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZERO DATABASE CONFIRMATION MODAL */}
      {zeroModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-rose-300">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-heading font-extrabold text-base">
                  {zeroModal === 'all' && 'Reset Records to Zero'}
                  {zeroModal === 'dues' && 'Clear All Student Dues'}
                  {zeroModal === 'reseed' && 'Restore Demo Records'}
                </h3>
              </div>
              <button
                onClick={() => !zeroLoading && setZeroModal(null)}
                className="p-1 hover:bg-stone-100 rounded text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              {zeroModal === 'all' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-900">
                  <p className="font-bold">Are you sure you want to reset all data to zero?</p>
                  <p className="leading-relaxed">
                    This will delete all demonstration student records, fee payment receipts, admission inquiries, and contact messages.
                  </p>
                  <p className="text-[11px] text-stone-600">
                    ✓ School profile, class fee structures, teachers, school van routes, and website banners will remain completely safe.
                  </p>
                </div>
              )}

              {zeroModal === 'dues' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-900">
                  <p className="font-bold">Set all student outstanding balances to ₹0?</p>
                  <p className="leading-relaxed">
                    This resets previous due balances and advance amounts to zero for all enrolled students without deleting student profiles.
                  </p>
                </div>
              )}

              {zeroModal === 'reseed' && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-stone-800">
                  <p className="font-bold">Restore sample demonstration data?</p>
                  <p className="leading-relaxed">
                    This will load the 6 demonstration students and sample fee record.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  disabled={zeroLoading}
                  onClick={() => setZeroModal(null)}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={zeroLoading}
                  onClick={() => handleZeroDatabase(zeroModal)}
                  className={`px-4 py-2 text-white font-extrabold rounded-lg text-xs flex items-center gap-1.5 shadow-md ${
                    zeroModal === 'all'
                      ? 'bg-rose-700 hover:bg-rose-800'
                      : zeroModal === 'dues'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-[#6B2E16] hover:bg-[#4A2112]'
                  }`}
                >
                  {zeroLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>
                      {zeroModal === 'all' && 'Yes, Reset All to Zero'}
                      {zeroModal === 'dues' && 'Yes, Clear Dues to ₹0'}
                      {zeroModal === 'reseed' && 'Yes, Restore Samples'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESTORE LOCAL BACKUP CONFIRMATION MODAL */}
      {selectedBackupForRestore && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-[#D6A64F] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#E8D0B5]">
              <div className="flex items-center gap-2 text-[#4A2112]">
                <RefreshCw className="w-5 h-5 text-[#D6A64F]" />
                <h3 className="font-heading font-extrabold text-base">Restore Database Snapshot</h3>
              </div>
              <button
                type="button"
                disabled={restoreLoading}
                onClick={() => setSelectedBackupForRestore(null)}
                className="p-1 hover:bg-stone-100 rounded text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <p className="leading-relaxed">
                You are about to restore the active school database from the following local snapshot:
              </p>
              <div className="p-2.5 bg-amber-50 border border-[#E8D0B5] rounded-xl font-mono text-[11px] font-bold text-[#6B2E16] break-all">
                {selectedBackupForRestore}
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5 text-[11px] text-stone-600">
                <p className="font-bold text-stone-800">Safety Guarantee:</p>
                <p>✓ A pre-restore safety snapshot of the active database will be automatically created in <code>data/backups/</code> before restoring.</p>
                <p>✓ Student records, admissions, fee payments, and settings in this backup will be restored.</p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  disabled={restoreLoading}
                  onClick={() => setSelectedBackupForRestore(null)}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={restoreLoading}
                  onClick={() => handleRestoreLocalBackup(selectedBackupForRestore)}
                  className="bg-[#6B2E16] hover:bg-[#4A2112] text-[#FFF4E2] font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-md"
                >
                  {restoreLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Restoring Database...</span>
                    </>
                  ) : (
                    <span>Yes, Restore Database</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
