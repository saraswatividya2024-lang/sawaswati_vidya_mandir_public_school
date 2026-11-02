import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { hashPassword } from './auth';

export const IS_WINDOWS = process.platform === 'win32';
export const REQUESTED_WINDOWS_DATA_DIR = 'D:\\Saraswati_School_Data';

export function resolveSchoolDataPaths() {
  let rootDir: string;

  if (process.env.SCHOOL_DATA_ROOT) {
    rootDir = process.env.SCHOOL_DATA_ROOT;
  } else if (IS_WINDOWS) {
    // Windows Laptop primary location
    rootDir = REQUESTED_WINDOWS_DATA_DIR;
  } else {
    // Linux/POSIX environment (e.g. AI Studio container)
    try {
      const candidate = path.resolve('D:/Saraswati_School_Data');
      if (!fs.existsSync(candidate)) {
        fs.mkdirSync(candidate, { recursive: true });
      }
      rootDir = candidate;
    } catch {
      rootDir = path.resolve(process.cwd(), 'data', 'Saraswati_School_Data');
    }
  }

  // Ensure root directory exists
  try {
    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir, { recursive: true });
    }
  } catch (err) {
    console.warn(`Could not create ${rootDir}, falling back:`, err);
    rootDir = path.resolve(process.cwd(), 'data', 'Saraswati_School_Data');
    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir, { recursive: true });
    }
  }

  // Automatically create all 4 required folders if they do not exist:
  // 1. Database: stores school.db
  // 2. Backups: stores hourly auto-backups and manual snapshots
  // 3. Receipts: stores fee payment receipt vouchers
  // 4. Exports: stores JSON, CSV, and ledger exports
  const databaseDir = path.join(rootDir, 'Database');
  const backupsDir = path.join(rootDir, 'Backups');
  const receiptsDir = path.join(rootDir, 'Receipts');
  const exportsDir = path.join(rootDir, 'Exports');

  for (const d of [databaseDir, backupsDir, receiptsDir, exportsDir]) {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  }

  const dbPath = path.join(databaseDir, 'school.db');

  // Migrate existing database from legacy data/school.db if present and target is new
  const legacyDbPath = path.resolve(process.cwd(), 'data', 'school.db');
  if (!fs.existsSync(dbPath) && fs.existsSync(legacyDbPath)) {
    try {
      fs.copyFileSync(legacyDbPath, dbPath);
      console.log(`Migrated existing school database from ${legacyDbPath} to ${dbPath}`);
    } catch (e) {
      console.warn('Migration copy warning:', e);
    }
  }

  return {
    rootDir,
    databaseDir,
    backupsDir,
    receiptsDir,
    exportsDir,
    dbPath
  };
}

export const schoolPaths = resolveSchoolDataPaths();

export const SCHOOL_DATA_ROOT = schoolPaths.rootDir;
export const DATABASE_DIR = schoolPaths.databaseDir;
export const BACKUP_DIR = schoolPaths.backupsDir;
export const RECEIPTS_DIR = schoolPaths.receiptsDir;
export const EXPORTS_DIR = schoolPaths.exportsDir;
export const DB_PATH = schoolPaths.dbPath;
export const DATA_DIR = schoolPaths.rootDir;

export const db = new DatabaseSync(DB_PATH);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase(): void {
  // 1. School Profile
  db.exec(`
    CREATE TABLE IF NOT EXISTS school_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      hindi_name TEXT,
      tagline TEXT,
      motto TEXT,
      sanskrit_motto TEXT,
      registration_no TEXT,
      affiliation_info TEXT,
      classes_offered TEXT,
      address TEXT,
      po TEXT,
      district TEXT,
      state TEXT,
      pin_code TEXT,
      phone1 TEXT,
      phone2 TEXT,
      email TEXT,
      working_hours TEXT,
      logo_url TEXT,
      banner_url TEXT,
      admissions_open INTEGER DEFAULT 1,
      admission_session TEXT,
      free_admission_note TEXT
    );
  `);

  // 2. Home Content
  db.exec(`
    CREATE TABLE IF NOT EXISTS home_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_heading TEXT,
      hero_subtitle TEXT,
      about_intro TEXT,
      vision TEXT,
      mission TEXT,
      history TEXT,
      philosophy TEXT,
      principal_name TEXT,
      principal_designation TEXT,
      principal_message TEXT,
      principal_photo_url TEXT
    );
  `);

  // 3. Facilities
  db.exec(`
    CREATE TABLE IF NOT EXISTS facilities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      is_visible INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0
    );
  `);

  // 4. Teachers & Staff
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      designation TEXT NOT NULL,
      subject TEXT NOT NULL,
      qualification TEXT NOT NULL,
      experience_years INTEGER DEFAULT 0,
      bio TEXT,
      photo_url TEXT,
      phone TEXT,
      email TEXT,
      is_published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0
    );
  `);

  // 5. Students
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      class_val TEXT NOT NULL,
      section TEXT NOT NULL DEFAULT 'A',
      roll_number TEXT,
      admission_number TEXT,
      admission_date TEXT,
      father_name TEXT NOT NULL,
      mother_name TEXT NOT NULL,
      guardian_name TEXT,
      guardian_phone TEXT NOT NULL,
      address TEXT NOT NULL,
      photo_url TEXT,
      status TEXT DEFAULT 'Active',
      previous_due_balance REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Fee Structures (Class-wise)
  db.exec(`
    CREATE TABLE IF NOT EXISTS fee_structures (
      class_name TEXT PRIMARY KEY,
      monthly_tuition_fee REAL NOT NULL,
      admission_fee REAL DEFAULT 0,
      exam_fee REAL DEFAULT 0,
      computer_fee REAL DEFAULT 0
    );
  `);

  // 7. Fee Payments (Transactions with audit trail)
  db.exec(`
    CREATE TABLE IF NOT EXISTS fee_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT UNIQUE NOT NULL,
      student_db_id INTEGER NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      class_val TEXT NOT NULL,
      section TEXT NOT NULL,
      academic_year TEXT NOT NULL,
      months_paid_json TEXT NOT NULL,
      total_fee REAL NOT NULL,
      discount REAL DEFAULT 0,
      amount_paid REAL NOT NULL,
      remaining_balance REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_date TEXT NOT NULL,
      notes TEXT,
      collected_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_db_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);

  // 8. Admission Enquiries
  db.exec(`
    CREATE TABLE IF NOT EXISTS admission_enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref_number TEXT UNIQUE NOT NULL,
      student_name TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      class_applying TEXT NOT NULL,
      father_name TEXT NOT NULL,
      mother_name TEXT NOT NULL,
      guardian_name TEXT,
      guardian_phone TEXT NOT NULL,
      email TEXT,
      previous_school TEXT,
      address TEXT NOT NULL,
      additional_info TEXT,
      status TEXT DEFAULT 'New',
      internal_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 9. Notices
  db.exec(`
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      published_date TEXT NOT NULL,
      expiry_date TEXT,
      attachment_url TEXT,
      image_url TEXT,
      is_urgent INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 10. School Gallery
  db.exec(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 11. Contact Enquiries
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      is_replied INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 12. Admin Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      name TEXT NOT NULL
    );
  `);

  // 13. School Van & Transport Details
  db.exec(`
    CREATE TABLE IF NOT EXISTS school_transport (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route_name TEXT NOT NULL,
      vehicle_no TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      driver_phone TEXT NOT NULL,
      areas_covered TEXT NOT NULL,
      morning_time TEXT,
      afternoon_time TEXT,
      monthly_charge REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );
  `);

  // 14. Audit Trail
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      details TEXT,
      performed_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 15. System Settings (Persistent flags like data zeroed / initialization flags)
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Safe migrations for student fee enhancements
  try {
    db.exec('ALTER TABLE students ADD COLUMN monthly_fee_override REAL DEFAULT NULL;');
  } catch (_) {
    // Column already exists
  }
  try {
    db.exec('ALTER TABLE students ADD COLUMN advance_balance REAL DEFAULT 0;');
  } catch (_) {
    // Column already exists
  }

  seedInitialData();
}

function seedInitialData(): void {
  // Check if school_profile exists
  const existingProfile = db.prepare('SELECT id FROM school_profile WHERE id = 1').get();
  if (!existingProfile) {
    db.prepare(`
      INSERT INTO school_profile (
        id, name, hindi_name, tagline, motto, sanskrit_motto,
        registration_no, affiliation_info, classes_offered,
        address, po, district, state, pin_code,
        phone1, phone2, email, working_hours,
        logo_url, banner_url, admissions_open, admission_session, free_admission_note
      ) VALUES (
        1,
        'Saraswati Vidya Mandir Public School, Semla',
        'Saraswati Vidya Mandir Public School, Semla',
        'Learning Today, Leading Tomorrow',
        'Educate • Empower • Excel',
        'Lead Us From Darkness To Light • Excellence Through Effort',
        '2162/07',
        'An English Medium Based on CBSE Pattern & Curriculum (NUR - X)',
        'Nursery to Class X',
        'Kathig, Jones',
        'Semla',
        'Dumka',
        'Jharkhand',
        '835027',
        '9973100625',
        '9771547720',
        'svmpssemla@gmail.com',
        'Monday to Saturday: 8:00 AM - 2:30 PM',
        '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg',
        '/assets/aistudio/file_0000000031c48208a3739793d7c419fd_fc340555.png',
        1,
        '2026-2027',
        'Free Admission Offered for Nursery to Class X'
      )
    `).run();
  } else {
    // Ensure banner_url is updated to the high-res uploaded photo and mottos are in English
    db.prepare(`
      UPDATE school_profile 
      SET banner_url = '/assets/aistudio/file_0000000031c48208a3739793d7c419fd_fc340555.png',
          hindi_name = 'Saraswati Vidya Mandir Public School, Semla',
          sanskrit_motto = 'Lead Us From Darkness To Light • Excellence Through Effort'
      WHERE id = 1
    `).run();
  }

  // Check home_content
  const existingHome = db.prepare('SELECT id FROM home_content WHERE id = 1').get();
  if (!existingHome) {
    db.prepare(`
      INSERT INTO home_content (
        id, hero_heading, hero_subtitle, about_intro, vision, mission, history,
        philosophy, principal_name, principal_designation, principal_message, principal_photo_url
      ) VALUES (
        1,
        'Welcome to Saraswati Vidya Mandir Public School',
        'Let Your Future Bright • A World Class Learning Environment in Semla, Dumka',
        'Saraswati Vidya Mandir Public School, Semla is an esteemed English Medium institution providing value-based education based on CBSE pattern and curriculum from Nursery to Class X. Nestled in a serene and lush green campus at Kathig, Jones, Semla (Dumka, Jharkhand), our school nurtures intellectual curiosity, moral integrity, physical fitness, and creative spirit.',
        'To be an exemplary center of academic excellence and holistic child development where traditional Indian values merge seamlessly with modern scientific education, producing enlightened and compassionate future citizens.',
        'To empower every student through experiential learning, personalized teacher mentorship, competitive examination coaching, and comprehensive sports and cultural activities, ensuring that no deserving child is deprived of quality education.',
        'Founded under Registration No. 2162/07 with the blessings of Maa Saraswati, the school was established to bring top-tier English Medium schooling to the children of Semla and Dumka district. Over the years, SVMPS has grown into a beacon of educational discipline, cultural vibrancy, and academic distinction.',
        'Rooted in the eternal wisdom of "Lead Us From Darkness To Light" and "Success is achieved through persistent hard work, not merely by wishing", we believe that every child holds infinite potential.',
        'Sri D. K. Sharma',
        'Principal & Educational Director',
        'Dear Parents, Guardians, and Beloved Students, It gives me profound joy to welcome you to Saraswati Vidya Mandir Public School, Semla. Our institution is not merely a place of textbooks and exams; it is a sacred temple of learning where young minds are sculpted with wisdom, character, and self-confidence. With our dedicated faculty, state-of-the-art facilities, and personalized care, we prepare our students to excel in national olympiads, board examinations, and life at large. We welcome you to join our SVMPS family.',
        '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg'
      )
    `).run();
  } else {
    db.prepare(`
      UPDATE home_content 
      SET philosophy = 'Rooted in the eternal wisdom of "Lead Us From Darkness To Light" and "Success is achieved through persistent hard work, not merely by wishing", we believe that every child holds infinite potential.'
      WHERE id = 1
    `).run();
  }

  // Check Facilities
  const facilityCount = (db.prepare('SELECT COUNT(*) as c FROM facilities').get() as { c: number }).c;
  if (facilityCount === 0) {
    const facilities = [
      { id: 'campus', title: 'Lush Green Campus', desc: 'Expansive, peaceful, eco-friendly campus with vibrant murals and clean open grounds conducive to focused learning.', icon: 'Trees', order: 1 },
      { id: 'faculty', title: 'Expert Teacher Faculty', desc: 'Highly qualified, experienced, and compassionate teachers delivering child-centric CBSE curriculum instructions.', icon: 'GraduationCap', order: 2 },
      { id: 'sports', title: 'Sports & Games Grounds', desc: 'Dedicated football pitch, cricket nets, volleyball, badminton, and specialized athletic training.', icon: 'Trophy', order: 3 },
      { id: 'cocurricular', title: 'Co-Curricular & Arts', desc: 'Music, dance, debate, drama, art & craft, and celebration of national and cultural festivals.', icon: 'Palette', order: 4 },
      { id: 'olympiad', title: 'Olympiad & Competitive Coaching', desc: 'Special guidance for International and National Science, Math, and English Olympiads alongside regular studies.', icon: 'Award', order: 5 },
      { id: 'computer', title: 'Modern Computer Lab', desc: 'Hands-on digital education, basic coding, internet research, and multimedia educational tools.', icon: 'Monitor', order: 6 },
      { id: 'hostel_bus', title: 'Hostel & Bus Facilities', desc: 'Safe school bus transport covering Semla, Kathig, Dumka and surrounding villages, plus secure hostel arrangements.', icon: 'Bus', order: 7 },
      { id: 'safety', title: 'Safe & Inspiring Environment', desc: 'Secure boundary walls, 24/7 staff supervision, clean purified drinking water, and hygienic facilities.', icon: 'ShieldCheck', order: 8 }
    ];
    const stmt = db.prepare('INSERT INTO facilities (id, title, description, icon_name, is_visible, display_order) VALUES (?, ?, ?, ?, 1, ?)');
    for (const f of facilities) {
      stmt.run(f.id, f.title, f.desc, f.icon, f.order);
    }
  }

  // Check Fee Structures
  const feeCount = (db.prepare('SELECT COUNT(*) as c FROM fee_structures').get() as { c: number }).c;
  if (feeCount === 0) {
    const classes = [
      { name: 'Nursery', fee: 500 },
      { name: 'LKG', fee: 550 },
      { name: 'UKG', fee: 600 },
      { name: 'Class I', fee: 700 },
      { name: 'Class II', fee: 750 },
      { name: 'Class III', fee: 800 },
      { name: 'Class IV', fee: 850 },
      { name: 'Class V', fee: 900 },
      { name: 'Class VI', fee: 1000 },
      { name: 'Class VII', fee: 1100 },
      { name: 'Class VIII', fee: 1200 },
      { name: 'Class IX', fee: 1400 },
      { name: 'Class X', fee: 1500 }
    ];
    const stmt = db.prepare('INSERT INTO fee_structures (class_name, monthly_tuition_fee, admission_fee, exam_fee, computer_fee) VALUES (?, ?, 0, 300, 100)');
    for (const c of classes) {
      stmt.run(c.name, c.fee);
    }
  }

  // Check Admin User
  const adminCount = (db.prepare('SELECT COUNT(*) as c FROM admin_users').get() as { c: number }).c;
  if (adminCount === 0) {
    // Default admin: username 'admin', password 'admin@svmps2026'
    const { salt, hash } = hashPassword('admin@svmps2026');
    db.prepare(`
      INSERT INTO admin_users (username, password_hash, salt, role, name)
      VALUES (?, ?, ?, 'superadmin', 'School Administrator')
    `).run('admin', hash, salt);
  }

  // Check Teachers
  const teacherCount = (db.prepare('SELECT COUNT(*) as c FROM teachers').get() as { c: number }).c;
  if (teacherCount === 0) {
    const seedTeachers = [
      { name: 'Sri Ramesh Kumar Mishra', designation: 'Senior Teacher & HOD Science', subject: 'Science & Physics', qual: 'M.Sc. (Physics), B.Ed.', exp: 12, bio: 'Inspiring young minds with practical science experiments and Olympiad preparation.', photo: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg', order: 1 },
      { name: 'Smt. Anita Kumari', designation: 'Senior Teacher & HOD Mathematics', subject: 'Mathematics', qual: 'M.Sc. (Math), B.Ed.', exp: 10, bio: 'Specialist in Vedic mathematics tricks and CBSE board examination curriculum.', photo: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg', order: 2 },
      { name: 'Sri Rajesh Soren', designation: 'TGT English & Social Science', subject: 'English & Social Studies', qual: 'M.A. (English), B.Ed.', exp: 8, bio: 'Focusing on fluent English communication, grammar foundation, and historical awareness.', photo: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg', order: 3 },
      { name: 'Smt. Manisha Murmu', designation: 'PRT Hindi & Sanskrit', subject: 'Hindi & Sanskrit', qual: 'M.A. (Hindi), B.Ed.', exp: 7, bio: 'Instilling cultural values, Sanskrit shlokas, and literary appreciation in students.', photo: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg', order: 4 },
      { name: 'Sri Bikram Kumar Singh', designation: 'Computer Instructor & Lab Head', subject: 'Computer Science', qual: 'MCA, B.Sc. IT', exp: 6, bio: 'Guiding students in digital literacy, computer hardware, and programming fundamentals.', photo: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg', order: 5 },
      { name: 'Sri Suresh Mahto', designation: 'Physical Education & Sports Coach', subject: 'Physical Education & Games', qual: 'B.P.Ed.', exp: 9, bio: 'Leading cricket coaching, football drills, morning yogasana, and annual sports events.', photo: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg', order: 6 }
    ];
    const stmt = db.prepare('INSERT INTO teachers (name, designation, subject, qualification, experience_years, bio, photo_url, is_published, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)');
    for (const t of seedTeachers) {
      stmt.run(t.name, t.designation, t.subject, t.qual, t.exp, t.bio, t.photo, t.order);
    }
  }

  // Check Students (only if not deliberately initialized or zeroed)
  const initSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'students_initialized'").get() as { value: string } | undefined;
  if (!initSetting) {
    const studentCount = (db.prepare('SELECT COUNT(*) as c FROM students').get() as { c: number }).c;
    if (studentCount === 0) {
      const seedStudents = [
        { id: 'SVM-2026-001', name: 'Aarav Kumar', dob: '2015-08-14', gender: 'Male', class: 'Class V', sec: 'A', roll: '01', admNo: '2162/V/01', admDate: '2024-04-05', father: 'Rajesh Kumar', mother: 'Sunita Devi', phone: '9973100625', addr: 'Kathig, Semla, Dumka', due: 0 },
        { id: 'SVM-2026-002', name: 'Ananya Kumari', dob: '2014-04-22', gender: 'Female', class: 'Class VI', sec: 'A', roll: '02', admNo: '2162/VI/02', admDate: '2023-04-10', father: 'Sanjay Sharma', mother: 'Pooja Devi', phone: '9771547720', addr: 'Jones, Semla, Dumka', due: 500 },
        { id: 'SVM-2026-003', name: 'Rohan Soren', dob: '2013-11-05', gender: 'Male', class: 'Class VII', sec: 'A', roll: '03', admNo: '2162/VII/03', admDate: '2022-04-12', father: 'Sunil Soren', mother: 'Malti Murmu', phone: '9973100625', addr: 'Semla Bazar, Dumka', due: 0 },
        { id: 'SVM-2026-004', name: 'Sneha Hansda', dob: '2016-02-18', gender: 'Female', class: 'Class IV', sec: 'A', roll: '04', admNo: '2162/IV/04', admDate: '2025-04-01', father: 'Manoj Hansda', mother: 'Rita Soren', phone: '9835100000', addr: 'Kathig Village, Dumka', due: 0 },
        { id: 'SVM-2026-005', name: 'Vivek Kumar Bhagat', dob: '2011-09-30', gender: 'Male', class: 'Class IX', sec: 'A', roll: '05', admNo: '2162/IX/05', admDate: '2021-04-08', father: 'Dilip Bhagat', mother: 'Kanti Devi', phone: '9431100000', addr: 'Jones P.O., Dumka', due: 1200 },
        { id: 'SVM-2026-006', name: 'Kavya Kumari', dob: '2019-06-15', gender: 'Female', class: 'Nursery', sec: 'A', roll: '01', admNo: '2162/NUR/01', admDate: '2026-04-01', father: 'Vikash Kumar', mother: 'Geeta Kumari', phone: '9973100625', addr: 'Kathig, Semla', due: 0 }
      ];

      const stmt = db.prepare(`
        INSERT INTO students (
          student_id, full_name, dob, gender, class_val, section, roll_number,
          admission_number, admission_date, father_name, mother_name, guardian_name,
          guardian_phone, address, photo_url, status, previous_due_balance
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)
      `);

      for (const s of seedStudents) {
        stmt.run(
          s.id, s.name, s.dob, s.gender, s.class, s.sec, s.roll,
          s.admNo, s.admDate, s.father, s.mother, s.father,
          s.phone, s.addr, '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg', s.due
        );
      }

      // Seed payments for student 1 (Aarav Kumar)
      db.prepare(`
        INSERT INTO fee_payments (
          receipt_number, student_db_id, student_id, student_name, class_val, section,
          academic_year, months_paid_json, total_fee, discount, amount_paid,
          remaining_balance, payment_method, payment_date, notes, collected_by
        ) VALUES (
          'SVM-REC-2026-0001', 1, 'SVM-2026-001', 'Aarav Kumar', 'Class V', 'A',
          '2026-27', '["April","May"]', 1800, 0, 1800, 0, 'Cash', '2026-04-10', 'Term 1 fee paid in full', 'Office Staff'
        )
      `).run();

      db.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('students_initialized', '1')").run();
    }
  }

  // Check Notices
  const noticeCount = (db.prepare('SELECT COUNT(*) as c FROM notices').get() as { c: number }).c;
  if (noticeCount === 0) {
    const seedNotices = [
      {
        title: 'Admissions Open for Academic Session 2026-2027 (Nursery to Class X)',
        desc: 'Registration and admission forms are now available online and at the school office. Free admission offered as per school notification. Parents are invited to visit the campus at Kathig, Jones, Semla for campus tours and interaction with teachers.',
        category: 'Academic',
        date: '2026-10-25',
        urgent: 1
      },
      {
        title: 'National & International Science Olympiad Coaching Schedule',
        desc: 'Special weekend guidance sessions for registered Olympiad participants will commence every Saturday from 10:00 AM. Study materials and practice tests will be provided by our Science & Math faculty.',
        category: 'Academic',
        date: '2026-10-20',
        urgent: 0
      },
      {
        title: 'Annual Sports & Cultural Meet Preparation Notice',
        desc: 'Trials for football, cricket, track events, and cultural folk dances for the upcoming Annual Function will be conducted next week during sports periods under the supervision of Coach Suresh Mahto.',
        category: 'Event',
        date: '2026-10-15',
        urgent: 0
      },
      {
        title: 'School Bus Route Updates for Kathig & Jones Areas',
        desc: 'New morning pickup and afternoon drop schedules for the school bus have been updated. All parents utilizing transport facilities are requested to verify timings with the transport coordinator.',
        category: 'General',
        date: '2026-10-10',
        urgent: 0
      }
    ];

    const stmt = db.prepare('INSERT INTO notices (title, description, category, published_date, is_urgent, is_published) VALUES (?, ?, ?, ?, ?, 1)');
    for (const n of seedNotices) {
      stmt.run(n.title, n.desc, n.category, n.date, n.urgent);
    }
  }

  // Check Gallery
  const galleryCount = (db.prepare('SELECT COUNT(*) as c FROM gallery').get() as { c: number }).c;
  if (galleryCount === 0) {
    const seedGallery = [
      { title: 'School Building & Artistic Heritage Mural Wall', category: 'Campus', url: '/assets/aistudio/WhatsApp_Image_2026-10-24_at_4.39.34_AM_dbbdbe61.jpeg', order: 1 },
      { title: 'Official Emblem of Maa Saraswati on Lotus', category: 'Events', url: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg', order: 2 },
      { title: 'Spacious School Entrance and Nature Surroundings', category: 'Campus', url: '/assets/aistudio/WhatsApp_Image_2026-10-24_at_4.39.34_AM_dbbdbe61.jpeg', order: 3 },
      { title: 'Saraswati Puja & Cultural Programme Celebration', category: 'Cultural', url: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg', order: 4 }
    ];
    const stmt = db.prepare('INSERT INTO gallery (title, category, image_url, is_published, display_order) VALUES (?, ?, ?, 1, ?)');
    for (const g of seedGallery) {
      stmt.run(g.title, g.category, g.url, g.order);
    }
  }

  // Check Admission Enquiries
  const enquiryCount = (db.prepare('SELECT COUNT(*) as c FROM admission_enquiries').get() as { c: number }).c;
  if (enquiryCount === 0) {
    db.prepare(`
      INSERT INTO admission_enquiries (
        ref_number, student_name, dob, gender, class_applying, father_name,
        mother_name, guardian_name, guardian_phone, email, previous_school,
        address, additional_info, status, internal_notes
      ) VALUES (
        'SVM-ADM-2026-0001', 'Aditya Raj', '2017-03-20', 'Male', 'Class III',
        'Binod Sharma', 'Meena Devi', 'Binod Sharma', '9973100625', 'binod@example.com',
        'Prathmik Vidyalaya Semla', 'Kathig, Semla, Dumka', 'Interested in school bus and computer classes',
        'New', 'Called parent on 28th Oct, invited for campus visit.'
      )
    `).run();
  }

  // Check School Transport
  const transportCount = (db.prepare('SELECT COUNT(*) as c FROM school_transport').get() as { c: number }).c;
  if (transportCount === 0) {
    const seedTransport = [
      {
        routeName: 'Route 1: Semla - Kathig - Jones Main Road',
        vehicleNo: 'JH-04-E-1824 (School Van)',
        driverName: 'Sri Santosh Yadav',
        driverPhone: '9973100625',
        areasCovered: 'Kathig Chowk, Jones P.O., Semla Bazaar, School Gate',
        morningTime: '07:20 AM - 07:50 AM',
        afternoonTime: '02:35 PM - 03:10 PM',
        monthlyCharge: 400
      },
      {
        routeName: 'Route 2: Dumka City to Semla Campus Bus',
        vehicleNo: 'JH-04-F-2162 (School Bus)',
        driverName: 'Sri Sunil Soren',
        driverPhone: '9771547720',
        areasCovered: 'Dumka Bus Stand, Tin Bazar, Kurwa, Semla Campus',
        morningTime: '06:50 AM - 07:45 AM',
        afternoonTime: '02:40 PM - 03:30 PM',
        monthlyCharge: 600
      }
    ];

    const stmt = db.prepare(`
      INSERT INTO school_transport (
        route_name, vehicle_no, driver_name, driver_phone,
        areas_covered, morning_time, afternoon_time, monthly_charge, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    for (const t of seedTransport) {
      stmt.run(t.routeName, t.vehicleNo, t.driverName, t.driverPhone, t.areasCovered, t.morningTime, t.afternoonTime, t.monthlyCharge);
    }
  }
}

// Database helper functions for queries
export function logAudit(action: string, details: string, performedBy: string = 'admin'): void {
  try {
    db.prepare('INSERT INTO audit_logs (action, details, performed_by) VALUES (?, ?, ?)').run(action, details, performedBy);
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

export function exportDatabaseBackup(): Record<string, unknown> {
  return {
    timestamp: new Date().toISOString(),
    profile: db.prepare('SELECT * FROM school_profile WHERE id = 1').get(),
    homeContent: db.prepare('SELECT * FROM home_content WHERE id = 1').get(),
    facilities: db.prepare('SELECT * FROM facilities').all(),
    teachers: db.prepare('SELECT * FROM teachers').all(),
    students: db.prepare('SELECT * FROM students').all(),
    feeStructures: db.prepare('SELECT * FROM fee_structures').all(),
    feePayments: db.prepare('SELECT * FROM fee_payments').all(),
    admissionEnquiries: db.prepare('SELECT * FROM admission_enquiries').all(),
    notices: db.prepare('SELECT * FROM notices').all(),
    gallery: db.prepare('SELECT * FROM gallery').all(),
    contactEnquiries: db.prepare('SELECT * FROM contact_enquiries').all(),
    auditLogs: db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100').all()
  };
}

export function restoreDatabaseBackup(data: any, restoredBy: string = 'admin'): boolean {
  if (!data || typeof data !== 'object') return false;

  const transaction = db.exec.bind(db);
  transaction('BEGIN TRANSACTION;');
  try {
    if (data.profile) {
      const p = data.profile;
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
        p.name, p.hindi_name, p.tagline, p.motto, p.sanskrit_motto,
        p.registration_no, p.affiliation_info, p.classes_offered,
        p.address, p.po, p.district, p.state, p.pin_code,
        p.phone1, p.phone2, p.email, p.working_hours,
        p.logo_url, p.banner_url, p.admissions_open,
        p.admission_session, p.free_admission_note
      );
    }
    logAudit('DATABASE_RESTORE', 'Database restored from JSON backup', restoredBy);
    transaction('COMMIT;');
    return true;
  } catch (err) {
    transaction('ROLLBACK;');
    console.error('Restore failed:', err);
    throw err;
  }
}

/**
 * Zeros out all student enrollments, fee payments, and inquiries.
 * Sets the system state to a pristine, 0-record starting point for actual school operations.
 */
export function zeroDatabaseRecords(performedBy: string = 'admin'): { studentsDeleted: number; paymentsDeleted: number } {
  const transaction = db.exec.bind(db);
  transaction('BEGIN TRANSACTION;');
  try {
    const studentCount = (db.prepare('SELECT COUNT(*) as c FROM students').get() as { c: number }).c;
    const paymentCount = (db.prepare('SELECT COUNT(*) as c FROM fee_payments').get() as { c: number }).c;

    db.exec('DELETE FROM fee_payments;');
    db.exec('DELETE FROM students;');
    db.exec('DELETE FROM admission_enquiries;');
    db.exec('DELETE FROM contact_enquiries;');

    // Reset auto-increment counters for clean numbering
    try {
      db.exec("DELETE FROM sqlite_sequence WHERE name IN ('students', 'fee_payments', 'admission_enquiries', 'contact_enquiries');");
    } catch (_) {
      // sqlite_sequence may not exist if no rows ever inserted
    }

    // Ensure system_settings table exists
    db.exec('CREATE TABLE IF NOT EXISTS system_settings (key TEXT PRIMARY KEY, value TEXT);');

    // Persist flag that demo data is explicitly cleared
    db.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('students_initialized', '1'), ('data_zeroed_at', ?)").run(new Date().toISOString());

    logAudit('ZERO_DATABASE_RECORDS', `Reset student database: deleted ${studentCount} demo students and ${paymentCount} fee payments to start clean at zero.`, performedBy);

    transaction('COMMIT;');
    return { studentsDeleted: studentCount, paymentsDeleted: paymentCount };
  } catch (err) {
    transaction('ROLLBACK;');
    console.error('Zero database failed:', err);
    throw err;
  }
}

/**
 * Sets all existing student previous dues and advance balances to 0 without deleting students.
 */
export function zeroStudentDues(performedBy: string = 'admin'): number {
  const result = db.prepare('UPDATE students SET previous_due_balance = 0, advance_balance = 0;').run();
  logAudit('ZERO_STUDENT_DUES', 'Set all student outstanding dues and advance balances to 0.', performedBy);
  return Number(result.changes || 0);
}

/**
 * Restores the sample demonstration students and initial fee receipt if desired.
 */
export function reseedDemoStudents(performedBy: string = 'admin'): void {
  const transaction = db.exec.bind(db);
  transaction('BEGIN TRANSACTION;');
  try {
    db.exec('DELETE FROM fee_payments;');
    db.exec('DELETE FROM students;');

    const seedStudents = [
      { id: 'SVM-2026-001', name: 'Aarav Kumar', dob: '2015-08-14', gender: 'Male', class: 'Class V', sec: 'A', roll: '01', admNo: '2162/V/01', admDate: '2024-04-05', father: 'Rajesh Kumar', mother: 'Sunita Devi', phone: '9973100625', addr: 'Kathig, Semla, Dumka', due: 0 },
      { id: 'SVM-2026-002', name: 'Ananya Kumari', dob: '2014-04-22', gender: 'Female', class: 'Class VI', sec: 'A', roll: '02', admNo: '2162/VI/02', admDate: '2023-04-10', father: 'Sanjay Sharma', mother: 'Pooja Devi', phone: '9771547720', addr: 'Jones, Semla, Dumka', due: 500 },
      { id: 'SVM-2026-003', name: 'Rohan Soren', dob: '2013-11-05', gender: 'Male', class: 'Class VII', sec: 'A', roll: '03', admNo: '2162/VII/03', admDate: '2022-04-12', father: 'Sunil Soren', mother: 'Malti Murmu', phone: '9973100625', addr: 'Semla Bazar, Dumka', due: 0 },
      { id: 'SVM-2026-004', name: 'Sneha Hansda', dob: '2016-02-18', gender: 'Female', class: 'Class IV', sec: 'A', roll: '04', admNo: '2162/IV/04', admDate: '2025-04-01', father: 'Manoj Hansda', mother: 'Rita Soren', phone: '9835100000', addr: 'Kathig Village, Dumka', due: 0 },
      { id: 'SVM-2026-005', name: 'Vivek Kumar Bhagat', dob: '2011-09-30', gender: 'Male', class: 'Class IX', sec: 'A', roll: '05', admNo: '2162/IX/05', admDate: '2021-04-08', father: 'Dilip Bhagat', mother: 'Kanti Devi', phone: '9431100000', addr: 'Jones P.O., Dumka', due: 1200 },
      { id: 'SVM-2026-006', name: 'Kavya Kumari', dob: '2019-06-15', gender: 'Female', class: 'Nursery', sec: 'A', roll: '01', admNo: '2162/NUR/01', admDate: '2026-04-01', father: 'Vikash Kumar', mother: 'Geeta Kumari', phone: '9973100625', addr: 'Kathig, Semla', due: 0 }
    ];

    const stmt = db.prepare(`
      INSERT INTO students (
        student_id, full_name, dob, gender, class_val, section, roll_number,
        admission_number, admission_date, father_name, mother_name, guardian_name,
        guardian_phone, address, photo_url, status, previous_due_balance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)
    `);

    for (const s of seedStudents) {
      stmt.run(
        s.id, s.name, s.dob, s.gender, s.class, s.sec, s.roll,
        s.admNo, s.admDate, s.father, s.mother, s.father,
        s.phone, s.addr, '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg', s.due
      );
    }

    db.prepare(`
      INSERT INTO fee_payments (
        receipt_number, student_db_id, student_id, student_name, class_val, section,
        academic_year, months_paid_json, total_fee, discount, amount_paid,
        remaining_balance, payment_method, payment_date, notes, collected_by
      ) VALUES (
        'SVM-REC-2026-0001', 1, 'SVM-2026-001', 'Aarav Kumar', 'Class V', 'A',
        '2026-27', '["April","May"]', 1800, 0, 1800, 0, 'Cash', '2026-04-10', 'Term 1 fee paid in full', 'Office Staff'
      )
    `).run();

    db.exec('CREATE TABLE IF NOT EXISTS system_settings (key TEXT PRIMARY KEY, value TEXT);');
    db.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('students_initialized', '1')").run();

    logAudit('RESEED_DEMO_STUDENTS', 'Restored 6 demonstration students and initial payment.', performedBy);
    transaction('COMMIT;');
  } catch (err) {
    transaction('ROLLBACK;');
    console.error('Reseed failed:', err);
    throw err;
  }
}

// ==========================================
// LOCAL SQLITE OFFLINE DATABASE & AUTOMATIC LOCAL BACKUP
// ==========================================

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export interface LocalBackupInfo {
  filename: string;
  filePath: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  type: 'sqlite' | 'json';
  isAuto: boolean;
}

/**
 * Creates an instantaneous, transactionally consistent local SQLite snapshot (.db)
 * saved exclusively in the local folder (data/backups/)
 */
export function performLocalBackup(reason: string = 'automatic', triggeredBy: string = 'system'): LocalBackupInfo {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const prefix = reason === 'automatic' ? 'auto' : 'manual';
  const filename = `school_backup_${prefix}_${dateStr}.db`;
  const backupFilePath = path.join(BACKUP_DIR, filename);

  // Use SQLite's VACUUM INTO for an atomic, compact local copy
  db.exec(`VACUUM INTO '${backupFilePath.replace(/'/g, "''")}'`);

  const stat = fs.statSync(backupFilePath);
  const sizeBytes = stat.size;

  // Companion JSON metadata file
  const metaFilename = `school_backup_${prefix}_${dateStr}.meta.json`;
  const metaPath = path.join(BACKUP_DIR, metaFilename);
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      {
        filename,
        createdAt: now.toISOString(),
        sizeBytes,
        sizeFormatted: formatBytes(sizeBytes),
        reason,
        triggeredBy,
        storage: 'local_folder_only',
        localFolderPath: BACKUP_DIR
      },
      null,
      2
    ),
    'utf-8'
  );

  // Keep the latest 30 backups in local folder
  rotateLocalBackups(30);

  // Record last backup timestamp in system_settings
  try {
    db.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('last_auto_backup_time', ?)").run(now.toISOString());
  } catch (_) {}

  logAudit(
    reason === 'automatic' ? 'AUTOMATIC_LOCAL_BACKUP' : 'MANUAL_LOCAL_BACKUP',
    `Created local SQLite backup ${filename} (${formatBytes(sizeBytes)}) in local folder ${BACKUP_DIR}`,
    triggeredBy
  );

  return {
    filename,
    filePath: backupFilePath,
    sizeBytes,
    sizeFormatted: formatBytes(sizeBytes),
    createdAt: now.toISOString(),
    type: 'sqlite',
    isAuto: reason === 'automatic'
  };
}

/**
 * Rotates backups in the local folder, retaining up to maxBackups files.
 */
export function rotateLocalBackups(maxBackups: number = 30): void {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return;
    const files = fs.readdirSync(BACKUP_DIR);
    const dbFiles = files
      .filter((f) => f.endsWith('.db'))
      .map((f) => {
        const p = path.join(BACKUP_DIR, f);
        const stat = fs.statSync(p);
        return { file: f, path: p, mtime: stat.mtimeMs };
      });

    dbFiles.sort((a, b) => b.mtime - a.mtime); // Newest first

    if (dbFiles.length > maxBackups) {
      const filesToDelete = dbFiles.slice(maxBackups);
      for (const item of filesToDelete) {
        fs.unlinkSync(item.path);
        const metaPath = item.path.replace(/\.db$/, '.meta.json');
        if (fs.existsSync(metaPath)) {
          fs.unlinkSync(metaPath);
        }
      }
    }
  } catch (err) {
    console.error('Backup rotation error:', err);
  }
}

/**
 * Lists all SQLite backups saved in the local backup folder.
 */
export function listLocalBackups(): LocalBackupInfo[] {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  const files = fs.readdirSync(BACKUP_DIR);
  const dbFiles = files
    .filter((f) => f.endsWith('.db'))
    .map((f) => {
      const fullPath = path.join(BACKUP_DIR, f);
      const stat = fs.statSync(fullPath);
      return {
        filename: f,
        filePath: fullPath,
        sizeBytes: stat.size,
        sizeFormatted: formatBytes(stat.size),
        createdAt: stat.mtime.toISOString(),
        type: 'sqlite' as const,
        isAuto: f.includes('_auto_')
      };
    });

  return dbFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Restores all database tables from a chosen local SQLite backup file.
 */
export function restoreFromLocalBackup(filename: string, restoredBy: string = 'admin'): boolean {
  const safeFilename = path.basename(filename);
  const backupFilePath = path.join(BACKUP_DIR, safeFilename);

  if (!fs.existsSync(backupFilePath)) {
    throw new Error(`Backup file '${safeFilename}' not found in local backup directory.`);
  }

  // Pre-restore safety snapshot
  try {
    const safetyName = `pre_restore_safety_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.db`;
    db.exec(`VACUUM INTO '${path.join(BACKUP_DIR, safetyName).replace(/'/g, "''")}'`);
  } catch (e) {
    console.warn('Pre-restore safety backup warning:', e);
  }

  const tables = [
    'school_profile',
    'home_content',
    'facilities',
    'teachers',
    'students',
    'fee_structures',
    'fee_payments',
    'admission_enquiries',
    'notices',
    'gallery',
    'contact_enquiries',
    'school_transport',
    'system_settings'
  ];

  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec(`ATTACH DATABASE '${backupFilePath.replace(/'/g, "''")}' AS backupDb;`);

  try {
    db.exec('BEGIN TRANSACTION;');
    for (const tbl of tables) {
      try {
        const exists = db
          .prepare("SELECT count(*) as c FROM backupDb.sqlite_master WHERE type='table' AND name=?")
          .get(tbl) as { c: number } | undefined;
        if (exists && exists.c > 0) {
          db.exec(`DELETE FROM main.${tbl};`);
          db.exec(`INSERT INTO main.${tbl} SELECT * FROM backupDb.${tbl};`);
        }
      } catch (tableErr) {
        console.warn(`Table restore warning for ${tbl}:`, tableErr);
      }
    }
    db.exec('COMMIT;');
    logAudit('RESTORE_LOCAL_BACKUP', `Database successfully restored from local backup file: ${safeFilename}`, restoredBy);
    return true;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  } finally {
    try {
      db.exec('DETACH DATABASE backupDb;');
    } catch (_) {}
    db.exec('PRAGMA foreign_keys = ON;');
  }
}

/**
 * Deletes a specific backup from the local backup folder.
 */
export function deleteLocalBackup(filename: string, deletedBy: string = 'admin'): boolean {
  const safeFilename = path.basename(filename);
  const filePath = path.join(BACKUP_DIR, safeFilename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    const metaPath = filePath.replace(/\.db$/, '.meta.json');
    if (fs.existsSync(metaPath)) {
      fs.unlinkSync(metaPath);
    }
    logAudit('DELETE_LOCAL_BACKUP', `Deleted local backup file: ${safeFilename}`, deletedBy);
    return true;
  }
  return false;
}

// Automatic backup background timer state
let autoBackupTimer: NodeJS.Timeout | null = null;
let autoBackupIntervalMinutes = 60; // Default: every 60 minutes
let autoBackupEnabled = true;
let nextBackupExpectedTime: Date | null = null;

export function scheduleNextAutoBackup(): void {
  if (autoBackupTimer) {
    clearInterval(autoBackupTimer);
    autoBackupTimer = null;
  }

  if (!autoBackupEnabled) {
    nextBackupExpectedTime = null;
    return;
  }

  const ms = Math.max(5, autoBackupIntervalMinutes) * 60 * 1000;
  nextBackupExpectedTime = new Date(Date.now() + ms);

  autoBackupTimer = setInterval(() => {
    try {
      performLocalBackup('automatic', 'scheduler');
      nextBackupExpectedTime = new Date(Date.now() + ms);
    } catch (err) {
      console.error('Scheduled automatic backup error:', err);
    }
  }, ms);
}

export function initAutoBackupScheduler(): void {
  try {
    const enabledSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'auto_backup_enabled'").get() as
      | { value: string }
      | undefined;
    if (enabledSetting) {
      autoBackupEnabled = enabledSetting.value === '1';
    }
    const intervalSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'auto_backup_interval_minutes'").get() as
      | { value: string }
      | undefined;
    if (intervalSetting) {
      const parsed = parseInt(intervalSetting.value, 10);
      if (!isNaN(parsed) && parsed >= 5) {
        autoBackupIntervalMinutes = parsed;
      }
    }
  } catch (_) {}

  // Run initial local backup on startup if none exists in the local folder
  try {
    const existing = listLocalBackups();
    if (existing.length === 0) {
      performLocalBackup('automatic', 'system_startup');
    }
  } catch (e) {
    console.error('Initial startup backup warning:', e);
  }

  scheduleNextAutoBackup();
}

export function setAutoBackupConfig(enabled: boolean, intervalMinutes: number, updatedBy: string = 'admin'): void {
  autoBackupEnabled = enabled;
  if (intervalMinutes >= 5) {
    autoBackupIntervalMinutes = intervalMinutes;
  }

  db.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('auto_backup_enabled', ?)").run(enabled ? '1' : '0');
  db.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('auto_backup_interval_minutes', ?)").run(
    autoBackupIntervalMinutes.toString()
  );

  scheduleNextAutoBackup();
  logAudit(
    'UPDATE_AUTO_BACKUP_CONFIG',
    `Automatic local backup ${enabled ? 'ENABLED' : 'DISABLED'} with interval of ${autoBackupIntervalMinutes} minutes (stored in local folder only)`,
    updatedBy
  );
}

export function getAutoBackupStatus(): Record<string, unknown> {
  let lastBackupTime: string | null = null;
  try {
    const row = db.prepare("SELECT value FROM system_settings WHERE key = 'last_auto_backup_time'").get() as
      | { value: string }
      | undefined;
    if (row) lastBackupTime = row.value;
  } catch (_) {}

  const backups = listLocalBackups();
  if (!lastBackupTime && backups.length > 0) {
    lastBackupTime = backups[0].createdAt;
  }

  let totalSizeBytes = 0;
  for (const b of backups) {
    totalSizeBytes += b.sizeBytes;
  }

  let dbStatSize = 0;
  try {
    if (fs.existsSync(DB_PATH)) {
      dbStatSize = fs.statSync(DB_PATH).size;
    }
  } catch (_) {}

  // Count records for offline health overview
  const studentCount = (db.prepare('SELECT COUNT(*) as c FROM students').get() as any)?.c || 0;
  const paymentCount = (db.prepare('SELECT COUNT(*) as c FROM fee_payments').get() as any)?.c || 0;
  const teacherCount = (db.prepare('SELECT COUNT(*) as c FROM teachers').get() as any)?.c || 0;

  return {
    enabled: autoBackupEnabled,
    intervalMinutes: autoBackupIntervalMinutes,
    lastBackupTime,
    nextBackupTime: nextBackupExpectedTime ? nextBackupExpectedTime.toISOString() : null,
    backupFolderPath: BACKUP_DIR,
    databasePath: DB_PATH,
    schoolDataRoot: SCHOOL_DATA_ROOT,
    displayRootPath: IS_WINDOWS ? 'D:\\Saraswati_School_Data' : (SCHOOL_DATA_ROOT.includes('D:') ? 'D:\\Saraswati_School_Data' : SCHOOL_DATA_ROOT),
    displayDbPath: IS_WINDOWS ? 'D:\\Saraswati_School_Data\\Database\\school.db' : (DB_PATH.includes('D:') ? 'D:\\Saraswati_School_Data\\Database\\school.db' : DB_PATH),
    databaseDir: DATABASE_DIR,
    backupsDir: BACKUP_DIR,
    receiptsDir: RECEIPTS_DIR,
    exportsDir: EXPORTS_DIR,
    databaseSizeBytes: dbStatSize,
    databaseSizeFormatted: formatBytes(dbStatSize),
    isOfflineReady: true,
    engine: 'SQLite (Node.js Embedded)',
    storageScope: 'Local Storage Only (No Cloud / Zero External Dependency)',
    folders: {
      root: { name: 'Saraswati_School_Data', path: SCHOOL_DATA_ROOT, exists: fs.existsSync(SCHOOL_DATA_ROOT) },
      database: { name: 'Database', path: DATABASE_DIR, exists: fs.existsSync(DATABASE_DIR) },
      backups: { name: 'Backups', path: BACKUP_DIR, exists: fs.existsSync(BACKUP_DIR) },
      receipts: { name: 'Receipts', path: RECEIPTS_DIR, exists: fs.existsSync(RECEIPTS_DIR) },
      exports: { name: 'Exports', path: EXPORTS_DIR, exists: fs.existsSync(EXPORTS_DIR) }
    },
    counts: {
      students: studentCount,
      feePayments: paymentCount,
      teachers: teacherCount
    },
    totalBackupsCount: backups.length,
    totalBackupSizeBytes: totalSizeBytes,
    totalBackupSizeFormatted: formatBytes(totalSizeBytes),
    backups
  };
}

