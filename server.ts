import express, { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import {
  db,
  initDatabase,
  logAudit,
  exportDatabaseBackup,
  restoreDatabaseBackup,
  zeroDatabaseRecords,
  zeroStudentDues,
  reseedDemoStudents,
  initAutoBackupScheduler,
  getAutoBackupStatus,
  setAutoBackupConfig,
  performLocalBackup,
  restoreFromLocalBackup,
  deleteLocalBackup,
  DB_PATH,
  BACKUP_DIR,
  RECEIPTS_DIR,
  EXPORTS_DIR,
  DATABASE_DIR,
  SCHOOL_DATA_ROOT
} from './server/db';
import {
  hashPassword,
  verifyPassword,
  createSession,
  removeSession,
  requireAdminAuth,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
  AuthenticatedRequest
} from './server/auth';
import {
  generateStudentId,
  generateReceiptNumber,
  generateAdmissionRefNumber,
  buildStudentMonthlyLedger,
  formatWhatsAppFeeReminder
} from './src/lib/school-logic';
import { FeePayment, Student } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database and local automatic backup scheduler
initDatabase();
initAutoBackupScheduler();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 25MB limit for logo and photo uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve public static assets
app.use('/assets', express.static(path.resolve(__dirname, 'public/assets')));
app.use(express.static(path.resolve(__dirname, 'public')));

// ==========================================
// 1. PUBLIC API ROUTES
// ==========================================

// Get School Profile
app.get('/api/public/profile', (_req: Request, res: Response) => {
  try {
    const row: any = db.prepare('SELECT * FROM school_profile WHERE id = 1').get();
    if (!row) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json({
      name: row.name,
      hindiName: row.hindi_name,
      tagline: row.tagline,
      motto: row.motto,
      sanskritMotto: row.sanskrit_motto,
      registrationNo: row.registration_no,
      affiliationInfo: row.affiliation_info,
      classesOffered: row.classes_offered,
      address: row.address,
      po: row.po,
      district: row.district,
      state: row.state,
      pinCode: row.pin_code,
      phone1: row.phone1,
      phone2: row.phone2,
      email: row.email,
      workingHours: row.working_hours,
      logoUrl: row.logo_url,
      bannerUrl: row.banner_url,
      admissionsOpen: Boolean(row.admissions_open),
      admissionSession: row.admission_session,
      freeAdmissionNote: row.free_admission_note
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Home Content
app.get('/api/public/home-content', (_req: Request, res: Response) => {
  try {
    const row: any = db.prepare('SELECT * FROM home_content WHERE id = 1').get();
    if (!row) {
      res.status(404).json({ error: 'Home content not found' });
      return;
    }
    res.json({
      heroHeading: row.hero_heading,
      heroSubtitle: row.hero_subtitle,
      aboutIntro: row.about_intro,
      vision: row.vision,
      mission: row.mission,
      history: row.history,
      philosophy: row.philosophy,
      principalName: row.principal_name,
      principalDesignation: row.principal_designation,
      principalMessage: row.principal_message,
      principalPhotoUrl: row.principal_photo_url
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Facilities
app.get('/api/public/facilities', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM facilities WHERE is_visible = 1 ORDER BY display_order ASC').all();
    res.json(rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      iconName: r.icon_name,
      isVisible: Boolean(r.is_visible)
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Published Teachers
app.get('/api/public/teachers', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM teachers WHERE is_published = 1 ORDER BY display_order ASC').all();
    res.json(rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      designation: r.designation,
      subject: r.subject,
      qualification: r.qualification,
      experienceYears: r.experience_years,
      bio: r.bio,
      photoUrl: r.photo_url,
      // Public view conceals personal phone and email unless explicitly published
      isPublished: Boolean(r.is_published),
      displayOrder: r.display_order
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Published Notices
app.get('/api/public/notices', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM notices WHERE is_published = 1 ORDER BY is_urgent DESC, published_date DESC').all();
    res.json(rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      publishedDate: r.published_date,
      expiryDate: r.expiry_date,
      attachmentUrl: r.attachment_url,
      imageUrl: r.image_url,
      isUrgent: Boolean(r.is_urgent),
      isPublished: Boolean(r.is_published)
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Published Gallery Photos
app.get('/api/public/gallery', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM gallery WHERE is_published = 1 ORDER BY display_order ASC, id DESC').all();
    res.json(rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      imageUrl: r.image_url,
      isPublished: Boolean(r.is_published),
      displayOrder: r.display_order
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});// Get Active School Van / Transport Routes
app.get('/api/public/transport', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM school_transport WHERE is_active = 1 ORDER BY id ASC').all();
    res.json(rows.map((r: any) => ({
      id: r.id,
      routeName: r.route_name,
      vehicleNo: r.vehicle_no,
      driverName: r.driver_name,
      driverPhone: r.driver_phone,
      areasCovered: r.areas_covered,
      morningTime: r.morning_time,
      afternoonTime: r.afternoon_time,
      monthlyCharge: r.monthly_charge,
      isActive: Boolean(r.is_active)
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Public Fee Structures
app.get('/api/public/fee-structures', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM fee_structures ORDER BY rowid ASC').all();
    res.json(rows.map((r: any) => ({
      className: r.class_name,
      monthlyTuitionFee: r.monthly_tuition_fee,
      admissionFee: r.admission_fee,
      examFee: r.exam_fee,
      computerFee: r.computer_fee
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Admission Enquiry
const handleAdmissionSubmission = (req: Request, res: Response) => {
  try {
    const {
      studentName,
      dob,
      gender,
      classApplying,
      fatherName,
      motherName,
      guardianName,
      guardianPhone,
      email,
      previousSchool,
      address,
      additionalInfo
    } = req.body;

    // Validation
    if (!studentName || !dob || !gender || !classApplying || !fatherName || !guardianPhone || !address) {
      res.status(400).json({ error: 'Please fill in all required fields (Student Name, DOB, Gender, Class, Father Name, Phone, Address).' });
      return;
    }

    // Generate unique sequence
    const countRow: any = db.prepare('SELECT COUNT(*) as c FROM admission_enquiries').get();
    const sequence = (countRow?.c || 0) + 1;
    const refNumber = generateAdmissionRefNumber(sequence);

    db.prepare(`
      INSERT INTO admission_enquiries (
        ref_number, student_name, dob, gender, class_applying, father_name,
        mother_name, guardian_name, guardian_phone, email, previous_school,
        address, additional_info, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')
    `).run(
      refNumber,
      studentName.trim(),
      dob,
      gender,
      classApplying,
      fatherName.trim(),
      motherName ? motherName.trim() : '',
      guardianName ? guardianName.trim() : fatherName.trim(),
      guardianPhone.trim(),
      email ? email.trim() : null,
      previousSchool ? previousSchool.trim() : null,
      address.trim(),
      additionalInfo ? additionalInfo.trim() : null
    );

    logAudit('NEW_ADMISSION_ENQUIRY', `Reference ${refNumber} received for ${studentName} (${classApplying})`, 'Public Visitor');

    res.json({
      success: true,
      refNumber,
      message: 'Admission enquiry submitted successfully! Please keep note of your Reference Number for tracking.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

app.post('/api/public/admissions', handleAdmissionSubmission);
app.post('/api/public/apply-admission', handleAdmissionSubmission);
app.post('/api/public/admission-application', handleAdmissionSubmission);

// Submit Contact Message
const handleContactSubmission = (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !phone || !message) {
      res.status(400).json({ error: 'Name, Phone number, and Message are required.' });
      return;
    }

    db.prepare(`
      INSERT INTO contact_enquiries (name, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(name.trim(), email ? email.trim() : '', phone.trim(), subject ? subject.trim() : 'General Enquiry', message.trim());

    res.json({ success: true, message: 'Thank you for reaching out! Our school office will contact you soon.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

app.post('/api/public/contact', handleContactSubmission);
app.post('/api/public/contact-enquiry', handleContactSubmission);
app.post('/api/public/contact-us', handleContactSubmission);

// Student Corner Lookup: Student verifies via Student ID + DOB
app.post('/api/public/student-lookup', (req: Request, res: Response) => {
  try {
    const { studentId, dob } = req.body;
    if (!studentId || !dob) {
      res.status(400).json({ error: 'Please enter both your Student ID and Date of Birth.' });
      return;
    }

    const studentRow: any = db.prepare(`
      SELECT * FROM students 
      WHERE UPPER(TRIM(student_id)) = UPPER(TRIM(?)) AND dob = ?
    `).get(studentId, dob);

    if (!studentRow) {
      res.status(404).json({ error: 'No matching student record found. Please verify your Student ID and Date of Birth.' });
      return;
    }

    // Get payments for this student
    const paymentsRows: any[] = db.prepare(`
      SELECT * FROM fee_payments 
      WHERE student_db_id = ? OR student_id = ?
      ORDER BY id DESC
    `).all(studentRow.id, studentRow.student_id);

    const payments = paymentsRows.map((p) => ({
      id: p.id,
      receiptNumber: p.receipt_number,
      studentDbId: p.student_db_id,
      studentId: p.student_id,
      studentName: p.student_name,
      classVal: p.class_val,
      section: p.section,
      academicYear: p.academic_year,
      monthsPaid: JSON.parse(p.months_paid_json || '[]'),
      totalFee: p.total_fee,
      discount: p.discount,
      amountPaid: p.amount_paid,
      remainingBalance: p.remaining_balance,
      paymentMethod: p.payment_method,
      paymentDate: p.payment_date,
      notes: p.notes,
      collectedBy: p.collected_by
    }));

    res.json({
      success: true,
      student: {
        studentId: studentRow.student_id,
        fullName: studentRow.full_name,
        classVal: studentRow.class_val,
        section: studentRow.section,
        rollNumber: studentRow.roll_number,
        admissionNumber: studentRow.admission_number,
        admissionDate: studentRow.admission_date,
        fatherName: studentRow.father_name,
        motherName: studentRow.mother_name,
        status: studentRow.status,
        previousDueBalance: studentRow.previous_due_balance
      },
      payments
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. ADMIN AUTHENTICATION ROUTES
// ==========================================

app.post('/api/admin/login', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const rateCheck = checkLoginRateLimit(ip);
  if (!rateCheck.allowed) {
    res.status(429).json({
      error: `Too many failed login attempts. Please wait ${rateCheck.waitSeconds} seconds before trying again.`
    });
    return;
  }

  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  const userRow: any = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!userRow) {
    recordFailedLogin(ip);
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  const valid = verifyPassword(password, userRow.salt, userRow.password_hash);
  if (!valid) {
    recordFailedLogin(ip);
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  resetLoginAttempts(ip);
  const token = createSession(userRow.id, userRow.username, userRow.role);

  logAudit('ADMIN_LOGIN', `Admin user ${userRow.username} logged in`, userRow.username);

  res.json({
    token,
    user: {
      id: userRow.id,
      username: userRow.username,
      name: userRow.name,
      role: userRow.role
    }
  });
});

app.post('/api/admin/logout', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const token = req.headers.authorization?.slice(7);
  if (token) removeSession(token);
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/admin/me', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

app.post('/api/admin/change-password', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userRow: any = (db.prepare('SELECT * FROM admin_users WHERE id = ?') as any).get(userId);
    if (!userRow || !verifyPassword(currentPassword, userRow.salt, userRow.password_hash)) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }

    const { salt, hash } = hashPassword(newPassword);
    (db.prepare('UPDATE admin_users SET password_hash = ?, salt = ? WHERE id = ?') as any).run(hash, salt, userId);

    logAudit('PASSWORD_CHANGED', `User ${userRow.username} updated their password`, userRow.username);

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. ADMIN MANAGEMENT ROUTES (PROTECTED)
// ==========================================

// Dashboard Statistics
app.get('/api/admin/dashboard-stats', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const studentCount = (db.prepare('SELECT COUNT(*) as c FROM students').get() as any)?.c || 0;
    const teacherCount = (db.prepare('SELECT COUNT(*) as c FROM teachers').get() as any)?.c || 0;
    const newEnquiriesCount = (db.prepare("SELECT COUNT(*) as c FROM admission_enquiries WHERE status = 'New'").get() as any)?.c || 0;
    const noticeCount = (db.prepare('SELECT COUNT(*) as c FROM notices WHERE is_published = 1').get() as any)?.c || 0;
    const galleryCount = (db.prepare('SELECT COUNT(*) as c FROM gallery WHERE is_published = 1').get() as any)?.c || 0;
    const feeSum = (db.prepare('SELECT SUM(amount_paid) as total_paid FROM fee_payments').get() as any)?.total_paid || 0;
    const contactCount = (db.prepare('SELECT COUNT(*) as c FROM contact_enquiries WHERE is_read = 0').get() as any)?.c || 0;

    // Recent payments
    const recentPayments = db.prepare('SELECT * FROM fee_payments ORDER BY id DESC LIMIT 5').all();
    // Recent enquiries
    const recentEnquiries = db.prepare('SELECT * FROM admission_enquiries ORDER BY id DESC LIMIT 5').all();

    res.json({
      counts: {
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        newAdmissionEnquiries: newEnquiriesCount,
        publishedNotices: noticeCount,
        galleryImages: galleryCount,
        totalFeeCollected: feeSum,
        unreadContactEnquiries: contactCount
      },
      recentPayments,
      recentEnquiries
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Profile Management
app.put('/api/admin/profile', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const p = req.body;
    db.prepare(`
      UPDATE school_profile SET
        name = ?, hindi_name = ?, tagline = ?, motto = ?, sanskrit_motto = ?,
        registration_no = ?, affiliation_info = ?, classes_offered = ?,
        address = ?, po = ?, district = ?, state = ?, pin_code = ?,
        phone1 = ?, phone2 = ?, email = ?, working_hours = ?,
        logo_url = ?, banner_url = ?, admissions_open = ?,
        admission_session = ?, free_admission_note = ?
      WHERE id = 1
    `).run(
      p.name, p.hindiName, p.tagline, p.motto, p.sanskritMotto,
      p.registrationNo, p.affiliationInfo, p.classesOffered,
      p.address, p.po, p.district, p.state, p.pinCode,
      p.phone1, p.phone2, p.email, p.workingHours,
      p.logoUrl, p.bannerUrl, p.admissionsOpen ? 1 : 0,
      p.admissionSession, p.freeAdmissionNote
    );

    logAudit('UPDATE_PROFILE', 'School profile details updated', req.user?.username);
    res.json({ success: true, message: 'School profile updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Home Page Content Management
app.put('/api/admin/home-content', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const c = req.body;
    db.prepare(`
      UPDATE home_content SET
        hero_heading = ?, hero_subtitle = ?, about_intro = ?,
        vision = ?, mission = ?, history = ?, philosophy = ?,
        principal_name = ?, principal_designation = ?,
        principal_message = ?, principal_photo_url = ?
      WHERE id = 1
    `).run(
      c.heroHeading, c.heroSubtitle, c.aboutIntro,
      c.vision, c.mission, c.history, c.philosophy,
      c.principalName, c.principalDesignation,
      c.principalMessage, c.principalPhotoUrl
    );

    logAudit('UPDATE_HOMEPAGE_CONTENT', 'Home page sections and principal message updated', req.user?.username);
    res.json({ success: true, message: 'Home page content updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Facilities CRUD
app.get('/api/admin/facilities', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM facilities ORDER BY display_order ASC').all();
  res.json(rows);
});

app.put('/api/admin/facilities/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, icon_name, is_visible } = req.body;
  db.prepare(`
    UPDATE facilities SET title = ?, description = ?, icon_name = ?, is_visible = ? WHERE id = ?
  `).run(title, description, icon_name, is_visible ? 1 : 0, id);
  res.json({ success: true });
});

// Teachers Management CRUD
app.get('/api/admin/teachers', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM teachers ORDER BY display_order ASC, id ASC').all();
  res.json(rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    designation: r.designation,
    subject: r.subject,
    qualification: r.qualification,
    experienceYears: r.experience_years,
    bio: r.bio,
    photoUrl: r.photo_url,
    phone: r.phone,
    email: r.email,
    isPublished: Boolean(r.is_published),
    displayOrder: r.display_order
  })));
});

app.post('/api/admin/teachers', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const t = req.body;
    const stmt = db.prepare(`
      INSERT INTO teachers (
        name, designation, subject, qualification, experience_years,
        bio, photo_url, phone, email, is_published, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      t.name, t.designation, t.subject, t.qualification, t.experienceYears || 0,
      t.bio || '', t.photoUrl || '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg',
      t.phone || '', t.email || '', t.isPublished ? 1 : 0, t.displayOrder || 0
    );
    logAudit('ADD_TEACHER', `Added teacher: ${t.name}`, req.user?.username);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/teachers/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const t = req.body;
    db.prepare(`
      UPDATE teachers SET
        name = ?, designation = ?, subject = ?, qualification = ?,
        experience_years = ?, bio = ?, photo_url = ?, phone = ?,
        email = ?, is_published = ?, display_order = ?
      WHERE id = ?
    `).run(
      t.name, t.designation, t.subject, t.qualification, t.experienceYears || 0,
      t.bio || '', t.photoUrl, t.phone, t.email, t.isPublished ? 1 : 0,
      t.displayOrder || 0, id
    );
    logAudit('UPDATE_TEACHER', `Updated teacher ID: ${id} (${t.name})`, req.user?.username);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/teachers/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM teachers WHERE id = ?').run(id);
    logAudit('DELETE_TEACHER', `Deleted teacher ID: ${id}`, req.user?.username);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Students Management CRUD
app.get('/api/admin/students', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM students ORDER BY id ASC').all();
    res.json(rows.map((r: any) => ({
      id: r.id,
      studentId: r.student_id,
      fullName: r.full_name,
      dob: r.dob,
      gender: r.gender,
      classVal: r.class_val,
      section: r.section,
      rollNumber: r.roll_number,
      admissionNumber: r.admission_number,
      admissionDate: r.admission_date,
      fatherName: r.father_name,
      motherName: r.mother_name,
      guardianName: r.guardian_name,
      guardianPhone: r.guardian_phone,
      address: r.address,
      photoUrl: r.photo_url,
      status: r.status,
      previousDueBalance: r.previous_due_balance || 0,
      monthlyFeeOverride: r.monthly_fee_override !== null && r.monthly_fee_override !== undefined ? Number(r.monthly_fee_override) : undefined,
      advanceBalance: Number(r.advance_balance || 0)
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/students', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const s = req.body;
    let studentId = s.studentId;
    if (!studentId || studentId.trim() === '') {
      const countRow: any = db.prepare('SELECT COUNT(*) as c FROM students').get();
      studentId = generateStudentId((countRow?.c || 0) + 1);
    }

    const stmt = db.prepare(`
      INSERT INTO students (
        student_id, full_name, dob, gender, class_val, section, roll_number,
        admission_number, admission_date, father_name, mother_name, guardian_name,
        guardian_phone, address, photo_url, status, previous_due_balance,
        monthly_fee_override, advance_balance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      studentId.trim(),
      s.fullName.trim(),
      s.dob,
      s.gender,
      s.classVal,
      s.section || 'A',
      s.rollNumber || '',
      s.admissionNumber || '',
      s.admissionDate || new Date().toISOString().split('T')[0],
      s.fatherName.trim(),
      s.motherName ? s.motherName.trim() : '',
      s.guardianName ? s.guardianName.trim() : s.fatherName.trim(),
      s.guardianPhone.trim(),
      s.address.trim(),
      s.photoUrl || '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg',
      s.status || 'Active',
      s.previousDueBalance || 0,
      s.monthlyFeeOverride !== undefined && s.monthlyFeeOverride !== '' ? Number(s.monthlyFeeOverride) : null,
      s.advanceBalance ? Number(s.advanceBalance) : 0
    );

    logAudit('ADD_STUDENT', `Created student ${studentId} (${s.fullName})`, req.user?.username);
    res.json({ success: true, id: result.lastInsertRowid, studentId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/students/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const s = req.body;
    db.prepare(`
      UPDATE students SET
        student_id = ?, full_name = ?, dob = ?, gender = ?, class_val = ?,
        section = ?, roll_number = ?, admission_number = ?, admission_date = ?,
        father_name = ?, mother_name = ?, guardian_name = ?, guardian_phone = ?,
        address = ?, photo_url = ?, status = ?, previous_due_balance = ?,
        monthly_fee_override = ?, advance_balance = ?
      WHERE id = ?
    `).run(
      s.studentId.trim(), s.fullName.trim(), s.dob, s.gender, s.classVal,
      s.section, s.rollNumber, s.admissionNumber, s.admissionDate,
      s.fatherName, s.motherName, s.guardianName, s.guardianPhone,
      s.address, s.photoUrl, s.status, s.previousDueBalance || 0,
      s.monthlyFeeOverride !== undefined && s.monthlyFeeOverride !== null && s.monthlyFeeOverride !== '' ? Number(s.monthlyFeeOverride) : null,
      s.advanceBalance !== undefined ? Number(s.advanceBalance) : 0,
      id
    );

    logAudit('UPDATE_STUDENT', `Updated student ID ${id} (${s.fullName})`, req.user?.username);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/students/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM students WHERE id = ?').run(id);
    logAudit('DELETE_STUDENT', `Deleted student ID: ${id}`, req.user?.username);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Student Promotion Module
app.post('/api/admin/students/promote', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fromClass, toClass, studentIds } = req.body;
    if (!fromClass || !toClass || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({ error: 'Please provide source class, destination class, and student IDs.' });
      return;
    }

    const placeholders = studentIds.map(() => '?').join(',');
    db.prepare(`
      UPDATE students SET class_val = ? WHERE id IN (${placeholders})
    `).run(toClass, ...studentIds);

    logAudit('PROMOTE_STUDENTS', `Promoted ${studentIds.length} students from ${fromClass} to ${toClass}`, req.user?.username);
    res.json({ success: true, message: `Successfully promoted ${studentIds.length} students to ${toClass}!` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. MONTHLY FEE MANAGEMENT & RECEIPTS
// ==========================================

// Fee Structures
app.get('/api/admin/fee-structures', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM fee_structures').all();
  res.json(rows.map((r: any) => ({
    className: r.class_name,
    monthlyTuitionFee: r.monthly_tuition_fee,
    admissionFee: r.admission_fee,
    examFee: r.exam_fee,
    computerFee: r.computer_fee
  })));
});

app.put('/api/admin/fee-structures', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { className, monthlyTuitionFee, admissionFee, examFee, computerFee } = req.body;
    db.prepare(`
      INSERT INTO fee_structures (class_name, monthly_tuition_fee, admission_fee, exam_fee, computer_fee)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(class_name) DO UPDATE SET
        monthly_tuition_fee = excluded.monthly_tuition_fee,
        admission_fee = excluded.admission_fee,
        exam_fee = excluded.exam_fee,
        computer_fee = excluded.computer_fee
    `).run(
      className,
      Number(monthlyTuitionFee) || 0,
      Number(admissionFee) || 0,
      Number(examFee) || 0,
      Number(computerFee) || 0
    );

    logAudit('UPDATE_FEE_STRUCTURE', `Updated monthly fee for ${className} to ₹${monthlyTuitionFee}`, req.user?.username);
    res.json({ success: true, message: `Fee structure for ${className} updated successfully!` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk update multiple class fee structures at once
app.put('/api/admin/fee-structures/batch', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { structures } = req.body;
    if (!Array.isArray(structures)) {
      res.status(400).json({ error: 'Array of fee structures required.' });
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO fee_structures (class_name, monthly_tuition_fee, admission_fee, exam_fee, computer_fee)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(class_name) DO UPDATE SET
        monthly_tuition_fee = excluded.monthly_tuition_fee,
        admission_fee = excluded.admission_fee,
        exam_fee = excluded.exam_fee,
        computer_fee = excluded.computer_fee
    `);

    for (const f of structures) {
      if (f.className) {
        stmt.run(
          f.className,
          Number(f.monthlyTuitionFee) || 0,
          Number(f.admissionFee) || 0,
          Number(f.examFee) || 0,
          Number(f.computerFee) || 0
        );
      }
    }

    logAudit('BULK_UPDATE_FEE_STRUCTURE', `Updated fee structures for ${structures.length} classes`, req.user?.username);
    res.json({ success: true, message: 'All class monthly fees updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Student 12-Month Fee Ledger
app.get('/api/admin/students/:id/fee-ledger', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const academicYear = (req.query.academicYear as string) || '2026-27';

    const studentRow: any = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!studentRow) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const student: Student = {
      id: studentRow.id,
      studentId: studentRow.student_id,
      fullName: studentRow.full_name,
      dob: studentRow.dob,
      gender: studentRow.gender,
      classVal: studentRow.class_val,
      section: studentRow.section,
      rollNumber: studentRow.roll_number,
      admissionNumber: studentRow.admission_number,
      admissionDate: studentRow.admission_date,
      fatherName: studentRow.father_name,
      motherName: studentRow.mother_name,
      guardianName: studentRow.guardian_name,
      guardianPhone: studentRow.guardian_phone,
      address: studentRow.address,
      status: studentRow.status,
      previousDueBalance: studentRow.previous_due_balance || 0,
      monthlyFeeOverride: studentRow.monthly_fee_override !== null && studentRow.monthly_fee_override !== undefined ? Number(studentRow.monthly_fee_override) : undefined,
      advanceBalance: Number(studentRow.advance_balance || 0)
    };

    // Get class fee structure
    const feeRow: any = db.prepare('SELECT monthly_tuition_fee FROM fee_structures WHERE class_name = ?').get(student.classVal);
    const standardClassMonthlyFee = feeRow ? Number(feeRow.monthly_tuition_fee) : 800;

    // Get all payments for this student
    const paymentsRows: any[] = db.prepare(`
      SELECT * FROM fee_payments WHERE student_db_id = ? AND academic_year = ? ORDER BY id ASC
    `).all(student.id, academicYear);

    const payments: FeePayment[] = paymentsRows.map((p) => ({
      id: p.id,
      receiptNumber: p.receipt_number,
      studentDbId: p.student_db_id,
      studentId: p.student_id,
      studentName: p.student_name,
      classVal: p.class_val,
      section: p.section,
      academicYear: p.academic_year,
      monthsPaid: JSON.parse(p.months_paid_json || '[]'),
      totalFee: p.total_fee,
      discount: p.discount,
      amountPaid: p.amount_paid,
      remainingBalance: p.remaining_balance,
      paymentMethod: p.payment_method,
      paymentDate: p.payment_date,
      notes: p.notes,
      collectedBy: p.collected_by
    }));

    const ledger = buildStudentMonthlyLedger(student, academicYear, standardClassMonthlyFee, payments);

    res.json({
      student,
      academicYear,
      classMonthlyFee: standardClassMonthlyFee,
      effectiveMonthlyFee: student.monthlyFeeOverride || standardClassMonthlyFee,
      previousDueBalance: student.previousDueBalance,
      advanceBalanceAvailable: ledger.advanceBalanceAvailable,
      totalAdvanceAdjusted: ledger.totalAdvanceAdjusted,
      months: ledger.months,
      totalYearlyFee: ledger.totalYearlyFee,
      totalDiscount: ledger.totalDiscount,
      totalPaid: ledger.totalPaid,
      netPendingBalance: ledger.netPendingBalance,
      payments
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Student Direct Advance Balance
app.put('/api/admin/students/:id/advance', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { advanceAmount, reason } = req.body;
    db.prepare('UPDATE students SET advance_balance = ? WHERE id = ?').run(Number(advanceAmount) || 0, id);
    logAudit('UPDATE_ADVANCE', `Adjusted advance balance for student ID ${id} to ₹${advanceAmount} (${reason || 'Manual Adjustment'})`, req.user?.username);
    res.json({ success: true, message: `Advance balance updated to ₹${advanceAmount}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Record Fee Payment & Generate Receipt
app.post('/api/admin/fees/record-payment', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      studentDbId,
      academicYear,
      monthsPaid,
      totalFee,
      discount,
      amountPaid,
      advanceAdjusted,
      paymentMethod,
      paymentDate,
      notes
    } = req.body;

    if (!studentDbId || !academicYear || !monthsPaid || !Array.isArray(monthsPaid) || monthsPaid.length === 0 || amountPaid === undefined) {
      res.status(400).json({ error: 'Student ID, Academic Year, Months, and Amount Paid are required.' });
      return;
    }

    const studentRow: any = db.prepare('SELECT * FROM students WHERE id = ?').get(studentDbId);
    if (!studentRow) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Generate unique receipt number
    const countRow: any = db.prepare('SELECT COUNT(*) as c FROM fee_payments').get();
    const receiptNumber = generateReceiptNumber((countRow?.c || 0) + 1);

    const netFee = Math.max(0, Number(totalFee) - Number(discount || 0));
    const paidNum = Number(amountPaid);
    const advanceDeducted = Number(advanceAdjusted || 0);

    // If payment exceeds net fee, calculate surplus to store as advance
    const surplusAdvance = Math.max(0, paidNum - netFee);
    const remainingBalance = Math.max(0, netFee - paidNum - advanceDeducted);

    const stmt = db.prepare(`
      INSERT INTO fee_payments (
        receipt_number, student_db_id, student_id, student_name,
        class_val, section, academic_year, months_paid_json,
        total_fee, discount, amount_paid, remaining_balance,
        payment_method, payment_date, notes, collected_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      receiptNumber,
      studentRow.id,
      studentRow.student_id,
      studentRow.full_name,
      studentRow.class_val,
      studentRow.section,
      academicYear,
      JSON.stringify(monthsPaid),
      totalFee,
      discount || 0,
      paidNum,
      remainingBalance,
      paymentMethod || 'Cash',
      paymentDate || new Date().toISOString().split('T')[0],
      notes ? `${notes} ${surplusAdvance > 0 ? `[₹${surplusAdvance} Advance surplus]` : ''}` : (surplusAdvance > 0 ? `₹${surplusAdvance} Advance surplus` : ''),
      req.user?.name || req.user?.username || 'Office Staff'
    );

    // Update student's advance_balance in DB:
    // If surplus was paid, add it to advance_balance.
    // If advance was deducted/applied, reduce advance_balance.
    if (surplusAdvance > 0) {
      db.prepare('UPDATE students SET advance_balance = COALESCE(advance_balance, 0) + ? WHERE id = ?').run(surplusAdvance, studentRow.id);
    }
    if (advanceDeducted > 0) {
      db.prepare('UPDATE students SET advance_balance = MAX(0, COALESCE(advance_balance, 0) - ?) WHERE id = ?').run(advanceDeducted, studentRow.id);
    }

    // Automatically archive receipt voucher record to Receipts folder: D:\Saraswati_School_Data\Receipts\
    try {
      if (!fs.existsSync(RECEIPTS_DIR)) {
        fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
      }
      const receiptFilePath = path.join(RECEIPTS_DIR, `Receipt_${receiptNumber}.json`);
      fs.writeFileSync(
        receiptFilePath,
        JSON.stringify(
          {
            receiptNumber,
            studentDbId: studentRow.id,
            studentId: studentRow.student_id,
            studentName: studentRow.full_name,
            classVal: studentRow.class_val,
            section: studentRow.section,
            academicYear,
            monthsPaid,
            totalFee,
            discount: discount || 0,
            amountPaid: paidNum,
            remainingBalance,
            paymentMethod: paymentMethod || 'Cash',
            paymentDate: paymentDate || new Date().toISOString().split('T')[0],
            notes,
            collectedBy: req.user?.name || req.user?.username || 'Office Staff',
            savedToFolder: RECEIPTS_DIR,
            createdAt: new Date().toISOString()
          },
          null,
          2
        ),
        'utf-8'
      );
    } catch (receiptErr) {
      console.warn('Receipt archival warning:', receiptErr);
    }

    logAudit(
      'FEE_PAYMENT',
      `Collected ₹${paidNum} for ${studentRow.student_id} (${monthsPaid.join(', ')})${surplusAdvance > 0 ? ` (₹${surplusAdvance} Advance)` : ''} - Receipt: ${receiptNumber}`,
      req.user?.username
    );

    res.json({
      success: true,
      receiptNumber,
      paymentId: result.lastInsertRowid,
      surplusAdvance,
      message: `Fee payment of ₹${paidNum} recorded with Receipt #${receiptNumber}!${surplusAdvance > 0 ? ` (₹${surplusAdvance} surplus credited to advance balance for subsequent months)` : ''}`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Fee Receipts
app.get('/api/admin/fee-receipts', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const rows: any[] = db.prepare('SELECT * FROM fee_payments ORDER BY id DESC').all();
    res.json(rows.map((p) => ({
      id: p.id,
      receiptNumber: p.receipt_number,
      studentDbId: p.student_db_id,
      studentId: p.student_id,
      studentName: p.student_name,
      classVal: p.class_val,
      section: p.section,
      academicYear: p.academic_year,
      monthsPaid: JSON.parse(p.months_paid_json || '[]'),
      totalFee: p.total_fee,
      discount: p.discount,
      amountPaid: p.amount_paid,
      remainingBalance: p.remaining_balance,
      paymentMethod: p.payment_method,
      paymentDate: p.payment_date,
      notes: p.notes,
      collectedBy: p.collected_by,
      createdAt: p.created_at
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fee Reminders / WhatsApp Reminder Payload
app.get('/api/admin/fee-reminders', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const students: any[] = db.prepare("SELECT * FROM students WHERE status = 'Active'").all();
    const feeRows: any[] = db.prepare('SELECT * FROM fee_structures').all();
    const feeMap: Record<string, number> = {};
    for (const f of feeRows) {
      feeMap[f.class_name] = f.monthly_tuition_fee;
    }

    const allPayments: any[] = db.prepare('SELECT * FROM fee_payments').all();
    const profileRow: any = db.prepare('SELECT name, phone1 FROM school_profile WHERE id = 1').get();
    const schoolName = profileRow?.name || 'Saraswati Vidya Mandir Public School, Semla';
    const schoolPhone = profileRow?.phone1 || '9973100625';

    const reminders = [];

    for (const s of students) {
      const monthlyFee = feeMap[s.class_val] || 800;
      const ledger = buildStudentMonthlyLedger(s, '2026-27', monthlyFee, allPayments.map((p: any) => ({
        id: p.id,
        receiptNumber: p.receipt_number,
        studentDbId: p.student_db_id,
        studentId: p.student_id,
        studentName: p.student_name,
        classVal: p.class_val,
        section: p.section,
        academicYear: p.academic_year,
        monthsPaid: JSON.parse(p.months_paid_json || '[]'),
        totalFee: p.total_fee,
        discount: p.discount,
        amountPaid: p.amount_paid,
        remainingBalance: p.remaining_balance,
        paymentMethod: p.payment_method,
        paymentDate: p.payment_date,
        collectedBy: p.collected_by
      })));

      // If student has pending balance
      if (ledger.netPendingBalance > 0) {
        const pendingMonths = ledger.months
          .filter((m) => m.status === 'Due' || m.status === 'Partial')
          .slice(0, 4) // Show upcoming due months
          .map((m) => m.month);

        const wa = formatWhatsAppFeeReminder({
          studentName: s.full_name,
          studentId: s.student_id,
          guardianName: s.guardian_name || s.father_name,
          guardianPhone: s.guardian_phone,
          className: `${s.class_val} (${s.section})`,
          pendingBalance: ledger.netPendingBalance,
          pendingMonths,
          schoolName,
          schoolPhone
        });

        reminders.push({
          studentId: s.student_id,
          studentDbId: s.id,
          studentName: s.full_name,
          guardianName: s.guardian_name || s.father_name,
          guardianPhone: s.guardian_phone,
          className: s.class_val,
          section: s.section,
          netPendingBalance: ledger.netPendingBalance,
          pendingMonths,
          whatsappMessage: wa.message,
          whatsappUrl: wa.waUrl
        });
      }
    }

    res.json(reminders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. ADMISSION ENQUIRIES MANAGEMENT
// ==========================================

app.get('/api/admin/admission-enquiries', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM admission_enquiries ORDER BY id DESC').all();
    res.json(rows.map((r: any) => ({
      id: r.id,
      refNumber: r.ref_number,
      studentName: r.student_name,
      dob: r.dob,
      gender: r.gender,
      classApplying: r.class_applying,
      fatherName: r.father_name,
      motherName: r.mother_name,
      guardianName: r.guardian_name,
      guardianPhone: r.guardian_phone,
      email: r.email,
      previousSchool: r.previous_school,
      address: r.address,
      additionalInfo: r.additional_info,
      status: r.status,
      internalNotes: r.internal_notes,
      createdAt: r.created_at
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/admission-enquiries/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, internalNotes } = req.body;
    db.prepare('UPDATE admission_enquiries SET status = ?, internal_notes = ? WHERE id = ?').run(status, internalNotes, id);
    logAudit('UPDATE_ADMISSION_ENQUIRY', `Updated enquiry #${id} status to ${status}`, req.user?.username);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/admission-enquiries/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM admission_enquiries WHERE id = ?').run(id);
    logAudit('DELETE_ADMISSION_ENQUIRY', `Deleted enquiry #${id}`, req.user?.username);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. NOTICES CRUD
// ==========================================

app.get('/api/admin/notices', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM notices ORDER BY id DESC').all();
  res.json(rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    publishedDate: r.published_date,
    expiryDate: r.expiry_date,
    attachmentUrl: r.attachment_url,
    imageUrl: r.image_url,
    isUrgent: Boolean(r.is_urgent),
    isPublished: Boolean(r.is_published)
  })));
});

app.post('/api/admin/notices', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const n = req.body;
    const stmt = db.prepare(`
      INSERT INTO notices (title, description, category, published_date, expiry_date, attachment_url, image_url, is_urgent, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      n.title, n.description, n.category || 'General',
      n.publishedDate || new Date().toISOString().split('T')[0],
      n.expiryDate || null, n.attachmentUrl || null, n.imageUrl || null,
      n.isUrgent ? 1 : 0, n.isPublished !== false ? 1 : 0
    );
    logAudit('ADD_NOTICE', `Created notice: ${n.title}`, req.user?.username);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/notices/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const n = req.body;
    db.prepare(`
      UPDATE notices SET
        title = ?, description = ?, category = ?, published_date = ?,
        expiry_date = ?, attachment_url = ?, image_url = ?,
        is_urgent = ?, is_published = ?
      WHERE id = ?
    `).run(
      n.title, n.description, n.category, n.publishedDate,
      n.expiryDate || null, n.attachmentUrl || null, n.imageUrl || null,
      n.isUrgent ? 1 : 0, n.isPublished ? 1 : 0, id
    );
    logAudit('UPDATE_NOTICE', `Updated notice #${id}`, req.user?.username);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/notices/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM notices WHERE id = ?').run(id);
    logAudit('DELETE_NOTICE', `Deleted notice #${id}`, req.user?.username);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. GALLERY CRUD
// ==========================================

app.get('/api/admin/gallery', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM gallery ORDER BY display_order ASC, id DESC').all();
  res.json(rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    imageUrl: r.image_url,
    isPublished: Boolean(r.is_published),
    displayOrder: r.display_order
  })));
});

app.post('/api/admin/gallery', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const g = req.body;
    const stmt = db.prepare('INSERT INTO gallery (title, category, image_url, is_published, display_order) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(g.title, g.category || 'Campus', g.imageUrl, g.isPublished !== false ? 1 : 0, g.displayOrder || 0);
    logAudit('ADD_GALLERY_PHOTO', `Added photo: ${g.title}`, req.user?.username);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/gallery/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM gallery WHERE id = ?').run(id);
    logAudit('DELETE_GALLERY_PHOTO', `Deleted photo #${id}`, req.user?.username);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. CONTACT ENQUIRIES CRUD
// ==========================================

app.get('/api/admin/contact-enquiries', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM contact_enquiries ORDER BY id DESC').all();
  res.json(rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    subject: r.subject,
    message: r.message,
    isRead: Boolean(r.is_read),
    isReplied: Boolean(r.is_replied),
    createdAt: r.created_at
  })));
});

app.put('/api/admin/contact-enquiries/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { isRead, isReplied } = req.body;
  db.prepare('UPDATE contact_enquiries SET is_read = ?, is_replied = ? WHERE id = ?').run(
    isRead ? 1 : 0, isReplied ? 1 : 0, id
  );
  res.json({ success: true });
});

app.delete('/api/admin/contact-enquiries/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM contact_enquiries WHERE id = ?').run(id);
  res.json({ success: true });
});

// ==========================================
// 8B. SCHOOL VAN & TRANSPORT MANAGEMENT
// ==========================================

app.get('/api/admin/transport', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM school_transport ORDER BY id ASC').all();
    res.json(rows.map((r: any) => ({
      id: r.id,
      routeName: r.route_name,
      vehicleNo: r.vehicle_no,
      driverName: r.driver_name,
      driverPhone: r.driver_phone,
      areasCovered: r.areas_covered,
      morningTime: r.morning_time,
      afternoonTime: r.afternoon_time,
      monthlyCharge: r.monthly_charge,
      isActive: Boolean(r.is_active)
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/transport', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const t = req.body;
    const stmt = db.prepare(`
      INSERT INTO school_transport (
        route_name, vehicle_no, driver_name, driver_phone,
        areas_covered, morning_time, afternoon_time, monthly_charge, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      t.routeName,
      t.vehicleNo,
      t.driverName,
      t.driverPhone,
      t.areasCovered,
      t.morningTime || '',
      t.afternoonTime || '',
      t.monthlyCharge || 0,
      t.isActive !== false ? 1 : 0
    );
    logAudit('ADD_TRANSPORT_ROUTE', `Added transport route: ${t.routeName}`, req.user?.username);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/transport/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const t = req.body;
    db.prepare(`
      UPDATE school_transport SET
        route_name = ?, vehicle_no = ?, driver_name = ?, driver_phone = ?,
        areas_covered = ?, morning_time = ?, afternoon_time = ?,
        monthly_charge = ?, is_active = ?
      WHERE id = ?
    `).run(
      t.routeName, t.vehicleNo, t.driverName, t.driverPhone,
      t.areasCovered, t.morningTime, t.afternoonTime,
      t.monthlyCharge, t.isActive ? 1 : 0, id
    );
    logAudit('UPDATE_TRANSPORT_ROUTE', `Updated transport route #${id}`, req.user?.username);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/transport/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM school_transport WHERE id = ?').run(id);
    logAudit('DELETE_TRANSPORT_ROUTE', `Deleted transport route #${id}`, req.user?.username);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. DATABASE BACKUP & RESTORE (LOCAL SQLITE & LOCAL AUTO-BACKUP)
// ==========================================

// Download Live SQLite Database file for 100% offline desktop & local use
app.get('/api/admin/backup/sqlite-file', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      res.status(404).json({ error: 'Local SQLite database file not found.' });
      return;
    }
    // Perform VACUUM or send current DB file
    const tempExportPath = path.join(BACKUP_DIR, `svmps_offline_school_${Date.now()}.db`);
    try {
      db.exec(`VACUUM INTO '${tempExportPath.replace(/'/g, "''")}'`);
      res.download(tempExportPath, 'svmps_school.db', (err) => {
        try {
          if (fs.existsSync(tempExportPath)) fs.unlinkSync(tempExportPath);
        } catch (_) {}
      });
    } catch (_) {
      // Fallback: direct download of DB_PATH
      res.download(DB_PATH, 'svmps_school.db');
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Automatic Local Backup status, settings, and file list
app.get('/api/admin/backup/auto-status', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const status = getAutoBackupStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Automatic Local Backup configuration (Interval & Enabled state)
app.post('/api/admin/backup/auto-config', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { enabled, intervalMinutes } = req.body;
    setAutoBackupConfig(Boolean(enabled), Number(intervalMinutes) || 60, req.user?.username);
    const updatedStatus = getAutoBackupStatus();
    res.json({ success: true, message: 'Automatic local backup configuration saved successfully!', status: updatedStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger Instant Local Backup into the local folder
app.post('/api/admin/backup/create-local', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const backupInfo = performLocalBackup('manual', req.user?.username || 'admin');
    res.json({
      success: true,
      message: `Local backup created successfully: ${backupInfo.filename} (${backupInfo.sizeFormatted}) in local folder: ${BACKUP_DIR}`,
      backup: backupInfo
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Download a specific SQLite backup file from the local folder
app.get('/api/admin/backup/download-local/:filename', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const safeFilename = path.basename(req.params.filename);
    const filePath = path.join(BACKUP_DIR, safeFilename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Requested backup file does not exist in local backup folder.' });
      return;
    }
    res.download(filePath, safeFilename);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Restore database from a chosen local backup file
app.post('/api/admin/backup/restore-local', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      res.status(400).json({ error: 'Filename of local backup is required.' });
      return;
    }
    restoreFromLocalBackup(filename, req.user?.username);
    res.json({ success: true, message: `Database successfully restored from local backup file '${filename}'!` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a local backup from the local folder
app.delete('/api/admin/backup/delete-local/:filename', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filename } = req.params;
    const ok = deleteLocalBackup(filename, req.user?.username);
    if (!ok) {
      res.status(404).json({ error: 'File not found in local backup folder.' });
      return;
    }
    res.json({ success: true, message: `Backup file '${filename}' removed from local backup folder.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// JSON Full Database Export (Existing Feature Preserved & Saved to Exports folder)
app.get('/api/admin/backup', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const backupData = exportDatabaseBackup();

    // Also archive snapshot to Exports folder: D:\Saraswati_School_Data\Exports\
    try {
      if (!fs.existsSync(EXPORTS_DIR)) {
        fs.mkdirSync(EXPORTS_DIR, { recursive: true });
      }
      const exportFile = path.join(
        EXPORTS_DIR,
        `svmps_backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`
      );
      fs.writeFileSync(exportFile, JSON.stringify(backupData, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Exports archival warning:', e);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="svmps_school_backup.json"');
    res.json(backupData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// System Folder Information & Verification Route
app.get('/api/admin/system/folders', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const status = getAutoBackupStatus();
    res.json({
      success: true,
      root: (status as any).schoolDataRoot,
      displayRoot: (status as any).displayRootPath,
      database: (status as any).databaseDir,
      displayDatabase: (status as any).displayDbPath,
      backups: (status as any).backupsDir,
      receipts: (status as any).receiptsDir,
      exports: (status as any).exportsDir,
      folders: (status as any).folders
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// JSON Full Database Restore (Existing Feature Preserved)
app.post('/api/admin/restore', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const backupData = req.body;
    restoreDatabaseBackup(backupData, req.user?.username);
    res.json({ success: true, message: 'Database backup successfully restored!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Zero Records / Reseed Database (Existing Feature Preserved)
app.post('/api/admin/zero-database', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mode } = req.body || {}; // 'all' (default), 'dues', 'reseed'
    if (mode === 'dues') {
      const updated = zeroStudentDues(req.user?.username);
      return res.json({ success: true, message: `All student dues & advance balances set to 0 (${updated} students updated).` });
    }
    if (mode === 'reseed') {
      reseedDemoStudents(req.user?.username);
      return res.json({ success: true, message: 'Demonstration student and fee records restored successfully.' });
    }
    const result = zeroDatabaseRecords(req.user?.username);
    res.json({
      success: true,
      message: `Database records successfully reset to zero (${result.studentsDeleted} students, ${result.paymentsDeleted} payments deleted). Ready for fresh school entries!`,
      data: result
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. FRONTEND VITE INTEGRATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Saraswati Vidya Mandir Public School portal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
