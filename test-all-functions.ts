import { db } from './server/db';

async function testAll() {
  const BASE = 'http://127.0.0.1:3000';
  const errors: string[] = [];
  const passed: string[] = [];

  async function check(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      passed.push(name);
      console.log(`✓ ${name}`);
    } catch (err: any) {
      errors.push(`${name}: ${err.message}`);
      console.error(`✗ ${name}:`, err.message);
    }
  }

  console.log('--- STARTING COMPREHENSIVE FUNCTION AUDIT ---');

  // 1. Public Endpoints
  await check('Public Profile', async () => {
    const res = await fetch(`${BASE}/api/public/profile`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.name) throw new Error('Missing name in profile');
  });

  await check('Public Home Content', async () => {
    const res = await fetch(`${BASE}/api/public/home-content`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.heroHeading) throw new Error('Missing heroHeading');
  });

  await check('Public Facilities', async () => {
    const res = await fetch(`${BASE}/api/public/facilities`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  await check('Public Teachers', async () => {
    const res = await fetch(`${BASE}/api/public/teachers`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  await check('Public Notices', async () => {
    const res = await fetch(`${BASE}/api/public/notices`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  await check('Public Gallery', async () => {
    const res = await fetch(`${BASE}/api/public/gallery`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  await check('Public Fee Structures', async () => {
    const res = await fetch(`${BASE}/api/public/fee-structures`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Expected non-empty fee structures');
  });

  await check('Public Transport', async () => {
    const res = await fetch(`${BASE}/api/public/transport`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  await check('Public Contact Submission', async () => {
    const res = await fetch(`${BASE}/api/public/contact-enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Parent',
        phone: '9988776655',
        email: 'test@parent.com',
        message: 'Checking admission fee structure for Class 2'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Expected success: true');
  });

  let submittedRef = '';
  await check('Public Admission Application Submission', async () => {
    const res = await fetch(`${BASE}/api/public/apply-admission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Rahul Verma',
        dob: '2018-05-10',
        gender: 'Male',
        classApplying: 'Class I',
        fatherName: 'Sanjay Verma',
        motherName: 'Meena Verma',
        guardianPhone: '9876543210',
        address: 'Semla Chowk, Dumka',
        previousSchool: 'Kindergarten Dumka'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.refNumber) throw new Error('Expected refNumber');
    submittedRef = data.refNumber;
  });

  // 2. Admin Authentication
  let adminToken = '';
  await check('Admin Login (Valid)', async () => {
    const res = await fetch(`${BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin@svmps2026' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.token) throw new Error('Missing token in response');
    adminToken = data.token;
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  };

  await check('Admin Dashboard Stats with 0 students', async () => {
    const res = await fetch(`${BASE}/api/admin/dashboard-stats`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (typeof data.counts?.totalStudents !== 'number') throw new Error('Invalid stats format');
  });

  // 3. Admission Enquiries Management
  let enquiryId: number = 0;
  await check('Admin Admission Enquiries Listing', async () => {
    const res = await fetch(`${BASE}/api/admin/admission-enquiries`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Expected at least 1 enquiry');
    enquiryId = data[0].id;
  });

  await check('Admin Admission Enquiry Status Update', async () => {
    const res = await fetch(`${BASE}/api/admin/admission-enquiries/${enquiryId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'Approved', internalNotes: 'Documents verified by Principal' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  // 4. Student Enrollment & Management
  db.exec('DELETE FROM fee_payments; DELETE FROM students;');
  let studentDbId: number = 0;
  let customStudentId = '';
  await check('Admin Student Enrollment (Add Student)', async () => {
    const res = await fetch(`${BASE}/api/admin/students`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        studentId: '', // Auto generate
        fullName: 'Aarav Test Sharma',
        dob: '2016-08-15',
        gender: 'Male',
        classVal: 'Class V',
        section: 'A',
        rollNumber: '01',
        admissionNumber: '2162/V/01',
        admissionDate: '2026-04-01',
        fatherName: 'Manoj Sharma',
        motherName: 'Suman Devi',
        guardianName: 'Manoj Sharma',
        guardianPhone: '9973100625',
        address: 'Kathig, Semla, Dumka',
        status: 'Active',
        previousDueBalance: 0,
        advanceBalance: 0,
        monthlyFeeOverride: null
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.id) throw new Error('Missing student ID in creation response');
    studentDbId = data.id;
    customStudentId = data.studentId;
  });

  await check('Admin Student Listing', async () => {
    const res = await fetch(`${BASE}/api/admin/students`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length !== 1) throw new Error(`Expected 1 student, got ${data.length}`);
  });

  // 5. Fee Ledger & Payments
  await check('Student 12-Month Fee Ledger Generation', async () => {
    const res = await fetch(`${BASE}/api/admin/students/${studentDbId}/fee-ledger?academicYear=2026-27`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.months || data.months.length !== 12) throw new Error(`Expected 12 months in ledger, got ${data.months?.length}`);
    if (data.months[0].month !== 'April') throw new Error(`First month should be April, got ${data.months[0].month}`);
    if (data.effectiveMonthlyFee !== 900) throw new Error(`Expected Class V fee to be 900, got ${data.effectiveMonthlyFee}`);
  });

  let receiptNum = '';
  await check('Record Fee Payment (April & May)', async () => {
    const res = await fetch(`${BASE}/api/admin/fees/record-payment`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        studentDbId,
        studentId: customStudentId,
        studentName: 'Aarav Test Sharma',
        classVal: 'Class V',
        section: 'A',
        academicYear: '2026-27',
        monthsPaid: ['April', 'May'],
        totalFee: 1800,
        discount: 0,
        amountPaid: 1800,
        remainingBalance: 0,
        paymentMethod: 'Cash',
        notes: 'Paid on time',
        advanceUsed: 0
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.receiptNumber) throw new Error('Missing receipt number');
    receiptNum = data.receiptNumber;
  });

  await check('Fee Receipts Listing', async () => {
    const res = await fetch(`${BASE}/api/admin/fee-receipts`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Expected at least 1 receipt');
    const match = data.find((r: any) => r.receiptNumber === receiptNum);
    if (!match) throw new Error(`Receipt ${receiptNum} not found in listing`);
  });

  await check('WhatsApp Fee Reminders Calculation', async () => {
    const res = await fetch(`${BASE}/api/admin/fee-reminders`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // 6. Advance Fee & Next Month Reduction Test
  await check('Advance Payment Handling (Payment of 2000 for 900 fee)', async () => {
    // Add second student with advance test
    const studRes = await fetch(`${BASE}/api/admin/students`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        fullName: 'Pooja Advance Test',
        dob: '2017-02-10',
        gender: 'Female',
        classVal: 'Class I',
        section: 'A',
        rollNumber: '02',
        admissionNumber: '2162/I/02',
        admissionDate: '2026-04-01',
        fatherName: 'Sunil Test',
        motherName: 'Sunita Test',
        guardianPhone: '9973100625',
        address: 'Dumka',
        status: 'Active',
        previousDueBalance: 0,
        advanceBalance: 0
      })
    });
    const s2 = await studRes.json();
    // Class I fee is 700. Pay 1500 for April (700). Surplus of 800 should become advance balance!
    const payRes = await fetch(`${BASE}/api/admin/fees/record-payment`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        studentDbId: s2.id,
        studentId: s2.studentId,
        studentName: 'Pooja Advance Test',
        classVal: 'Class I',
        section: 'A',
        academicYear: '2026-27',
        monthsPaid: ['April'],
        totalFee: 700,
        discount: 0,
        amountPaid: 1500, // 800 surplus
        remainingBalance: 0,
        paymentMethod: 'UPI',
        notes: 'Excess paid as advance for May',
        advanceUsed: 0
      })
    });
    if (!payRes.ok) throw new Error(`Pay HTTP ${payRes.status}`);
    // Verify student advance balance in DB and advance adjusted across months in ledger
    const studDbRow = db.prepare('SELECT advance_balance FROM students WHERE id = ?').get(s2.id) as any;
    if (studDbRow?.advance_balance !== 800) {
      throw new Error(`Expected student DB advance_balance 800, got ${studDbRow?.advance_balance}`);
    }
    const ledRes = await fetch(`${BASE}/api/admin/students/${s2.id}/fee-ledger?academicYear=2026-27`, { headers: authHeaders });
    const ledger = await ledRes.json();
    if (ledger.totalAdvanceAdjusted <= 0) {
      throw new Error(`Expected advance to be adjusted, got ${ledger.totalAdvanceAdjusted}`);
    }
    // Clean up test student 2
    await fetch(`${BASE}/api/admin/students/${s2.id}`, { method: 'DELETE', headers: authHeaders });
  });

  // 7. Reset / Zero All Records Check
  await check('Admin Zero Database (Reset all records to 0)', async () => {
    const res = await fetch(`${BASE}/api/admin/zero-database`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ mode: 'all' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Expected success: true');

    // Verify 0 students, 0 receipts, 0 enquiries
    const stCount = (db.prepare('SELECT COUNT(*) as c FROM students').get() as any).c;
    const rcCount = (db.prepare('SELECT COUNT(*) as c FROM fee_payments').get() as any).c;
    const enCount = (db.prepare('SELECT COUNT(*) as c FROM admission_enquiries').get() as any).c;

    if (stCount !== 0 || rcCount !== 0 || enCount !== 0) {
      throw new Error(`Expected 0 records, got students=${stCount}, receipts=${rcCount}, enquiries=${enCount}`);
    }
  });

  // 8. Offline SQLite & Automatic Local Backup Tests (D:\Saraswati_School_Data\)
  let createdLocalBackupFilename = '';

  await check('Verify D:\\Saraswati_School_Data and all 4 subfolders auto-created', async () => {
    const res = await fetch(`${BASE}/api/admin/system/folders`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.folders?.root?.exists) throw new Error(`Root folder does not exist: ${data.root}`);
    if (!data.folders?.database?.exists) throw new Error(`Database folder does not exist: ${data.database}`);
    if (!data.folders?.backups?.exists) throw new Error(`Backups folder does not exist: ${data.backups}`);
    if (!data.folders?.receipts?.exists) throw new Error(`Receipts folder does not exist: ${data.receipts}`);
    if (!data.folders?.exports?.exists) throw new Error(`Exports folder does not exist: ${data.exports}`);
  });

  await check('Verify Main SQLite Database at D:\\Saraswati_School_Data\\Database\\school.db', async () => {
    const res = await fetch(`${BASE}/api/admin/backup/auto-status`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.isOfflineReady) throw new Error('Expected isOfflineReady: true');
    if (!data.databasePath || !data.databasePath.includes('Database')) {
      throw new Error(`Expected Database path in ${data.databasePath}`);
    }
    if (typeof data.databaseSizeBytes !== 'number' || data.databaseSizeBytes <= 0) {
      throw new Error(`Invalid database file size: ${data.databaseSizeBytes}`);
    }
  });

  await check('Create Instant SQLite Snapshot in D:\\Saraswati_School_Data\\Backups\\', async () => {
    const res = await fetch(`${BASE}/api/admin/backup/create-local`, {
      method: 'POST',
      headers: authHeaders
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.backup?.filename) throw new Error('Expected successful local backup creation');
    if (!data.backup?.filePath.includes('Backups')) throw new Error(`Backup not stored in Backups folder: ${data.backup?.filePath}`);
    createdLocalBackupFilename = data.backup.filename;
  });

  await check('Download Raw SQLite Database (.db) File for Offline Use', async () => {
    const res = await fetch(`${BASE}/api/admin/backup/sqlite-file`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength < 100) throw new Error('Expected non-empty SQLite database file');
  });

  await check('Download Specific Local Backup File from Backups Folder', async () => {
    const res = await fetch(`${BASE}/api/admin/backup/download-local/${encodeURIComponent(createdLocalBackupFilename)}`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength < 100) throw new Error('Expected non-empty backup file content');
  });

  await check('Verify Export Snapshot Saved in D:\\Saraswati_School_Data\\Exports\\', async () => {
    const res = await fetch(`${BASE}/api/admin/backup`, { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.profile || !data.timestamp) throw new Error('Invalid backup export payload');
  });

  await check('Configure Automatic Hourly Local Backup Schedule (60 min)', async () => {
    const res = await fetch(`${BASE}/api/admin/backup/auto-config`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ enabled: true, intervalMinutes: 60 })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Expected success: true');
    if (data.status?.intervalMinutes !== 60) throw new Error('Expected intervalMinutes to be 60');
    if (!data.status?.enabled) throw new Error('Expected auto-backup to be enabled');
  });

  await check('Test Actual Database Restoration from Backup Snapshot', async () => {
    const res = await fetch(`${BASE}/api/admin/backup/restore-local`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ filename: createdLocalBackupFilename })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Expected success: true');
  });

  // Restore demonstration samples so demo views have data
  await check('Reseed Demonstration Students', async () => {
    const res = await fetch(`${BASE}/api/admin/zero-database`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ mode: 'reseed' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Expected success');
  });

  console.log('--- COMPREHENSIVE AUDIT SUMMARY ---');
  console.log(`Passed: ${passed.length}`);
  console.log(`Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Errors encountered:', errors);
    process.exit(1);
  }
}

testAll().catch(e => {
  console.error('Audit script fatal error:', e);
  process.exit(1);
});
