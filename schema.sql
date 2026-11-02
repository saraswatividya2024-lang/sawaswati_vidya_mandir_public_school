-- ============================================================================
-- Saraswati Vidya Mandir Public School, Semla
-- Cloudflare D1 Database Schema & Initial Data
-- Execute via: npx wrangler d1 execute <DB_NAME> --file=./schema.sql
-- ============================================================================

-- 1. School Profile
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

-- 2. Home Content
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

-- 3. Facilities
CREATE TABLE IF NOT EXISTS facilities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  is_visible INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0
);

-- 4. Teachers & Staff
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

-- 5. Students
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
  monthly_fee_override REAL DEFAULT NULL,
  advance_balance REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 6. Fee Structures (Class-wise)
CREATE TABLE IF NOT EXISTS fee_structures (
  class_name TEXT PRIMARY KEY,
  monthly_tuition_fee REAL NOT NULL,
  admission_fee REAL DEFAULT 0,
  exam_fee REAL DEFAULT 0,
  computer_fee REAL DEFAULT 0
);

-- 7. Fee Payments (Receipts & ledger entries)
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

-- 8. Admission Enquiries
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

-- 9. Notices
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

-- 10. Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_published INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 11. Contact Enquiries
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

-- 12. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  name TEXT NOT NULL
);

-- 13. School Transport
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

-- 14. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  details TEXT,
  performed_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 15. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- ============================================================================
-- Indexes for High Performance Querying in Cloudflare D1
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_val, section);
CREATE INDEX IF NOT EXISTS idx_payments_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON fee_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_notices_published ON notices(is_published, published_date);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON admission_enquiries(status);

-- ============================================================================
-- Initial Seed Data (School Profile, Content, Facilities & Fee Structures)
-- ============================================================================
INSERT OR IGNORE INTO school_profile (
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
);

INSERT OR IGNORE INTO home_content (
  id, hero_heading, hero_subtitle, about_intro, vision, mission, history,
  philosophy, principal_name, principal_designation, principal_message, principal_photo_url
) VALUES (
  1,
  'Welcome to Saraswati Vidya Mandir Public School',
  'Let Your Future Bright • A World Class Learning Environment in Semla, Dumka',
  'Saraswati Vidya Mandir Public School, Semla is an esteemed English Medium institution providing value-based education based on CBSE pattern and curriculum from Nursery to Class X. Nestled in a serene and lush green campus at Kathig, Jones, Semla (Dumka, Jharkhand), our school nurtures intellectual curiosity, moral integrity, physical fitness, and creative spirit.',
  'To be an exemplary center of academic excellence and holistic child development where traditional Indian values merge seamlessly with modern scientific education, producing enlightened and compassionate future citizens.',
  'To empower every student through experiential learning, personalized teacher mentorship, competitive examination coaching, and comprehensive sports and cultural activities, ensuring that no deserving child is deprived of quality education.',
  'Founded under Registration No. 2162/07 with the blessings of Maa Saraswati, the school was established to bring top-tier English Medium schooling to the children of Semla and Dumka district.',
  'Rooted in the eternal wisdom of "Lead Us From Darkness To Light" and "Success is achieved through persistent hard work, not merely by wishing", we believe that every child holds infinite potential.',
  'Sri D. K. Sharma',
  'Principal & Educational Director',
  'Dear Parents, Guardians, and Beloved Students, It gives me profound joy to welcome you to Saraswati Vidya Mandir Public School, Semla. Our institution is a sacred temple of learning where young minds are sculpted with wisdom, character, and self-confidence.',
  '/assets/aistudio/WhatsApp_Image_2026-10-22_at_8.49.07_PM_b4d40a9e.jpeg'
);

-- Seed Fee Structures
INSERT OR IGNORE INTO fee_structures (class_name, monthly_tuition_fee, admission_fee, exam_fee, computer_fee) VALUES
  ('Nursery', 400, 0, 200, 0),
  ('LKG', 450, 0, 200, 0),
  ('UKG', 500, 0, 200, 0),
  ('Class 1', 550, 0, 250, 50),
  ('Class 2', 600, 0, 250, 50),
  ('Class 3', 650, 0, 250, 50),
  ('Class 4', 700, 0, 300, 100),
  ('Class 5', 750, 0, 300, 100),
  ('Class 6', 850, 0, 350, 150),
  ('Class 7', 950, 0, 350, 150),
  ('Class 8', 1050, 0, 400, 150),
  ('Class 9', 1200, 0, 500, 200),
  ('Class 10', 1400, 0, 600, 200);

-- Seed Facilities
INSERT OR IGNORE INTO facilities (id, title, description, icon_name, is_visible, display_order) VALUES
  ('campus', 'Lush Green Campus', 'Expansive, peaceful, eco-friendly campus with vibrant murals and clean open grounds conducive to focused learning.', 'Trees', 1, 1),
  ('faculty', 'Expert Teacher Faculty', 'Highly qualified, experienced, and compassionate teachers delivering child-centric CBSE curriculum instructions.', 'GraduationCap', 1, 2),
  ('sports', 'Sports & Games Grounds', 'Dedicated football pitch, cricket nets, volleyball, badminton, and specialized athletic training.', 'Trophy', 1, 3),
  ('library', 'Knowledge Resource Library', 'Extensive collection of story books, reference encyclopedias, NCERT textbooks, and periodicals.', 'BookOpen', 1, 4),
  ('transport', 'Safe School Transport', 'Dedicated school vans covering Semla, Kathig, and surrounding villages with experienced drivers and staff.', 'Bus', 1, 5),
  ('security', 'CCTV & Campus Safety', '24x7 security surveillance, perimeter fencing, pure filtered drinking water, and hygienic washrooms.', 'Shield', 1, 6);

-- Seed Transport Route
INSERT OR IGNORE INTO school_transport (id, route_name, vehicle_no, driver_name, driver_phone, areas_covered, morning_time, afternoon_time, monthly_charge, is_active) VALUES
  (1, 'Route 1: Semla - Kathig - Jones Loop', 'JH-04-AB-1234', 'Ramesh Yadav', '9876543210', 'Semla Chowk, Kathig Gate, Jones Basti, Main Road', '07:20 AM', '02:40 PM', 400, 1);
