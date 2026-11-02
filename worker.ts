/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Cloudflare Worker for Saraswati Vidya Mandir Public School, Semla
 * Runs on Cloudflare Workers with Cloudflare D1 (Serverless SQLite)
 */

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<{ success: boolean; meta: any }>;
  all<T = unknown>(): Promise<{ results: T[]; success: boolean; meta: any }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<any[]>;
  exec(query: string): Promise<any>;
}

export interface Fetcher {
  fetch(request: Request | string, init?: RequestInit): Promise<Response>;
}

export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
  JWT_SECRET?: string;
}

// ============================================================================
// Web Crypto Utilities (Edge-Compatible PBKDF2 & HMAC)
// ============================================================================

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export async function hashPasswordEdge(
  password: string,
  saltHex?: string
): Promise<{ salt: string; hash: string }> {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  return {
    salt: bytesToHex(salt),
    hash: bytesToHex(new Uint8Array(derivedBits))
  };
}

export async function verifyPasswordEdge(
  password: string,
  salt: string,
  storedHash: string
): Promise<boolean> {
  try {
    const { hash } = await hashPasswordEdge(password, salt);
    return hash === storedHash;
  } catch {
    return false;
  }
}

// Stateless HMAC Signed Token for Cloudflare Edge
async function createToken(payload: object, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const data = btoa(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 }));
  const message = `${header}.${data}`;

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret || 'svmps-cloudflare-d1-secure-edge-key-2026'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const sigHex = bytesToHex(new Uint8Array(signature));
  return `${message}.${sigHex}`;
}

async function verifyToken(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, data, sigHex] = parts;
    const message = `${header}.${data}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret || 'svmps-cloudflare-d1-secure-edge-key-2026'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = hexToBytes(sigHex);
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes as any, enc.encode(message));
    if (!valid) return null;

    const payload = JSON.parse(atob(data));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// JSON Response Helper with strict Content-Type to prevent JSON parse errors
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

// Helper for Audit Logging in D1
async function logAuditD1(db: D1Database, action: string, details: string, performedBy = 'Admin') {
  try {
    await db
      .prepare('INSERT INTO audit_logs (action, details, performed_by) VALUES (?, ?, ?)')
      .bind(action, details, performedBy)
      .run();
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

// ============================================================================
// Main Cloudflare Worker Fetch Handler
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    try {
      // ----------------------------------------------------------------------
      // PUBLIC ROUTES
      // ----------------------------------------------------------------------
      if (url.pathname === '/api/public/profile' && method === 'GET') {
        const row: any = await env.DB.prepare('SELECT * FROM school_profile WHERE id = 1').first();
        if (!row) return jsonResponse({ error: 'Profile not found' }, 404);
        return jsonResponse({
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
      }

      if (url.pathname === '/api/public/home-content' && method === 'GET') {
        const row: any = await env.DB.prepare('SELECT * FROM home_content WHERE id = 1').first();
        if (!row) return jsonResponse({ error: 'Home content not found' }, 404);
        return jsonResponse({
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
      }

      if (url.pathname === '/api/public/facilities' && method === 'GET') {
        const { results } = await env.DB
          .prepare('SELECT * FROM facilities WHERE is_visible = 1 ORDER BY display_order ASC')
          .all();
        return jsonResponse(
          results.map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            iconName: r.icon_name,
            isVisible: Boolean(r.is_visible)
          }))
        );
      }

      if (url.pathname === '/api/public/teachers' && method === 'GET') {
        const { results } = await env.DB
          .prepare('SELECT * FROM teachers WHERE is_published = 1 ORDER BY display_order ASC')
          .all();
        return jsonResponse(
          results.map((r: any) => ({
            id: r.id,
            name: r.name,
            designation: r.designation,
            subject: r.subject,
            qualification: r.qualification,
            experienceYears: r.experience_years,
            bio: r.bio,
            photoUrl: r.photo_url,
            isPublished: Boolean(r.is_published),
            displayOrder: r.display_order
          }))
        );
      }

      if (url.pathname === '/api/public/notices' && method === 'GET') {
        const { results } = await env.DB
          .prepare('SELECT * FROM notices WHERE is_published = 1 ORDER BY is_urgent DESC, published_date DESC')
          .all();
        return jsonResponse(
          results.map((r: any) => ({
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
          }))
        );
      }

      if (url.pathname === '/api/public/gallery' && method === 'GET') {
        const { results } = await env.DB
          .prepare('SELECT * FROM gallery WHERE is_published = 1 ORDER BY display_order ASC, id DESC')
          .all();
        return jsonResponse(
          results.map((r: any) => ({
            id: r.id,
            title: r.title,
            category: r.category,
            imageUrl: r.image_url,
            isPublished: Boolean(r.is_published),
            displayOrder: r.display_order
          }))
        );
      }

      if (url.pathname === '/api/public/fee-structures' && method === 'GET') {
        const { results } = await env.DB
          .prepare('SELECT * FROM fee_structures ORDER BY monthly_tuition_fee ASC')
          .all();
        return jsonResponse(
          results.map((r: any) => ({
            className: r.class_name,
            monthlyTuitionFee: r.monthly_tuition_fee,
            admissionFee: r.admission_fee,
            examFee: r.exam_fee,
            computerFee: r.computer_fee
          }))
        );
      }

      if (url.pathname === '/api/public/transport' && method === 'GET') {
        const { results } = await env.DB
          .prepare('SELECT * FROM school_transport WHERE is_active = 1')
          .all();
        return jsonResponse(
          results.map((r: any) => ({
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
          }))
        );
      }

      // Admission Enquiry Submission
      if (
        (url.pathname === '/api/public/admissions' ||
          url.pathname === '/api/public/apply-admission' ||
          url.pathname === '/api/public/admission-application') &&
        method === 'POST'
      ) {
        const body: any = await request.json().catch(() => ({}));
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
        } = body;

        if (!studentName || !dob || !gender || !classApplying || !fatherName || !guardianPhone || !address) {
          return jsonResponse({ error: 'Please fill in all required fields.' }, 400);
        }

        const countRow: any = await env.DB.prepare('SELECT COUNT(*) as c FROM admission_enquiries').first();
        const seq = (countRow?.c || 0) + 1;
        const refNumber = `SVM-ADM-${String(seq).padStart(4, '0')}`;

        await env.DB.prepare(`
          INSERT INTO admission_enquiries (
            ref_number, student_name, dob, gender, class_applying, father_name,
            mother_name, guardian_name, guardian_phone, email, previous_school,
            address, additional_info, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')
        `).bind(
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
        ).run();

        await logAuditD1(env.DB, 'NEW_ADMISSION_ENQUIRY', `Reference ${refNumber} received for ${studentName}`, 'Public Visitor');

        return jsonResponse({
          success: true,
          refNumber,
          message: 'Admission enquiry submitted successfully!'
        });
      }

      // Contact Form Submission
      if (
        (url.pathname === '/api/public/contact' ||
          url.pathname === '/api/public/contact-enquiry' ||
          url.pathname === '/api/public/contact-us') &&
        method === 'POST'
      ) {
        const body: any = await request.json().catch(() => ({}));
        const { name, email, phone, subject, message } = body;
        if (!name || !phone || !message) {
          return jsonResponse({ error: 'Name, Phone number, and Message are required.' }, 400);
        }

        await env.DB.prepare(`
          INSERT INTO contact_enquiries (name, email, phone, subject, message)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          name.trim(),
          email ? email.trim() : '',
          phone.trim(),
          subject ? subject.trim() : 'General Enquiry',
          message.trim()
        ).run();

        return jsonResponse({ success: true, message: 'Thank you! We will contact you soon.' });
      }

      // Student Corner Lookup
      if (url.pathname === '/api/public/student-lookup' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const { studentId, dob } = body;
        if (!studentId || !dob) {
          return jsonResponse({ error: 'Student ID and Date of Birth are required.' }, 400);
        }

        const studentRow: any = await env.DB
          .prepare('SELECT * FROM students WHERE UPPER(student_id) = UPPER(?) AND dob = ?')
          .bind(studentId.trim(), dob.trim())
          .first();

        if (!studentRow) {
          return jsonResponse({ error: 'No student found matching this Student ID and Date of Birth.' }, 404);
        }

        const { results: paymentRows } = await env.DB
          .prepare('SELECT * FROM fee_payments WHERE student_db_id = ? ORDER BY payment_date DESC')
          .bind(studentRow.id)
          .all();

        return jsonResponse({
          success: true,
          student: {
            studentId: studentRow.student_id,
            fullName: studentRow.full_name,
            classVal: studentRow.class_val,
            section: studentRow.section,
            rollNumber: studentRow.roll_number,
            admissionNumber: studentRow.admission_number,
            fatherName: studentRow.father_name,
            status: studentRow.status
          },
          payments: paymentRows.map((p: any) => ({
            id: p.id,
            receiptNumber: p.receipt_number,
            academicYear: p.academic_year,
            monthsPaid: JSON.parse(p.months_paid_json || '[]'),
            totalFee: p.total_fee,
            amountPaid: p.amount_paid,
            remainingBalance: p.remaining_balance,
            paymentMethod: p.payment_method,
            paymentDate: p.payment_date
          }))
        });
      }

      // ----------------------------------------------------------------------
      // ADMIN AUTHENTICATION
      // ----------------------------------------------------------------------
      if (url.pathname === '/api/admin/login' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const { username, password } = body;

        if (!username || !password) {
          return jsonResponse({ error: 'Username and password are required.' }, 400);
        }

        const userRow: any = await env.DB
          .prepare('SELECT * FROM admin_users WHERE username = ?')
          .bind(username.trim())
          .first();

        if (!userRow) {
          return jsonResponse({ error: 'Invalid username or password.' }, 401);
        }

        const valid = await verifyPasswordEdge(password, userRow.salt, userRow.password_hash);
        if (!valid) {
          return jsonResponse({ error: 'Invalid username or password.' }, 401);
        }

        const token = await createToken(
          { id: userRow.id, username: userRow.username, role: userRow.role },
          env.JWT_SECRET || 'svmps-cloudflare-d1-secure-edge-key-2026'
        );

        await logAuditD1(env.DB, 'ADMIN_LOGIN', `Admin user ${userRow.username} logged in`, userRow.username);

        return jsonResponse({
          token,
          user: {
            id: userRow.id,
            username: userRow.username,
            name: userRow.name,
            role: userRow.role
          }
        });
      }

      // Check Admin Auth for all remaining /api/admin/* endpoints
      if (url.pathname.startsWith('/api/admin/')) {
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        const session = await verifyToken(token, env.JWT_SECRET || 'svmps-cloudflare-d1-secure-edge-key-2026');

        if (!session) {
          return jsonResponse({ error: 'Session expired or invalid. Please log in again.' }, 401);
        }

        // Logout
        if (url.pathname === '/api/admin/logout' && method === 'POST') {
          return jsonResponse({ success: true, message: 'Logged out successfully' });
        }

        // Admin Dashboard Stats
        if (url.pathname === '/api/admin/dashboard-stats' && method === 'GET') {
          const sCount: any = await env.DB.prepare('SELECT COUNT(*) as c FROM students WHERE status = "Active"').first();
          const pSum: any = await env.DB.prepare('SELECT SUM(amount_paid) as s FROM fee_payments').first();
          const admCount: any = await env.DB.prepare('SELECT COUNT(*) as c FROM admission_enquiries WHERE status = "New"').first();
          const contCount: any = await env.DB.prepare('SELECT COUNT(*) as c FROM contact_enquiries WHERE is_read = 0').first();

          return jsonResponse({
            activeStudents: sCount?.c || 0,
            totalFeeCollected: pSum?.s || 0,
            pendingAdmissions: admCount?.c || 0,
            unreadEnquiries: contCount?.c || 0
          });
        }

        // Admin Students API
        if (url.pathname === '/api/admin/students' && method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM students ORDER BY id DESC').all();
          return jsonResponse(results);
        }

        if (url.pathname === '/api/admin/students' && method === 'POST') {
          const body: any = await request.json();
          const countRow: any = await env.DB.prepare('SELECT COUNT(*) as c FROM students').first();
          const studentId = `SVM-${new Date().getFullYear()}-${String((countRow?.c || 0) + 1).padStart(4, '0')}`;

          await env.DB.prepare(`
            INSERT INTO students (
              student_id, full_name, dob, gender, class_val, section,
              roll_number, admission_number, admission_date, father_name,
              mother_name, guardian_phone, address, status, previous_due_balance,
              monthly_fee_override, advance_balance
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            studentId,
            body.fullName,
            body.dob,
            body.gender,
            body.classVal,
            body.section || 'A',
            body.rollNumber || null,
            body.admissionNumber || null,
            body.admissionDate || new Date().toISOString().split('T')[0],
            body.fatherName,
            body.motherName || '',
            body.guardianPhone,
            body.address,
            body.status || 'Active',
            body.previousDueBalance || 0,
            body.monthlyFeeOverride || null,
            body.advanceBalance || 0
          ).run();

          return jsonResponse({ success: true, studentId });
        }

        // Admin Fee Payments API
        if (url.pathname === '/api/admin/fee-payments' && method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM fee_payments ORDER BY id DESC LIMIT 500').all();
          return jsonResponse(results);
        }

        // Admin Fee Structures API
        if (url.pathname === '/api/admin/fee-structures' && method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM fee_structures').all();
          return jsonResponse(results);
        }

        // Admin Notices API
        if (url.pathname === '/api/admin/notices' && method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM notices ORDER BY id DESC').all();
          return jsonResponse(results);
        }

        // Admin Admissions API
        if (url.pathname === '/api/admin/admissions' && method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM admission_enquiries ORDER BY id DESC').all();
          return jsonResponse(results);
        }

        // Admin Contact Enquiries API
        if (url.pathname === '/api/admin/contact-enquiries' && method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM contact_enquiries ORDER BY id DESC').all();
          return jsonResponse(results);
        }

        // Admin Audit Logs API
        if (url.pathname === '/api/admin/audit-logs' && method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 200').all();
          return jsonResponse(results);
        }
      }

      // ----------------------------------------------------------------------
      // STATIC ASSET FALLBACK (Cloudflare Workers Static Assets)
      // ----------------------------------------------------------------------
      if (env.ASSETS) {
        return await env.ASSETS.fetch(request);
      }

      return new Response('Not Found', { status: 404 });
    } catch (err: any) {
      console.error('Cloudflare Worker Error:', err);
      return jsonResponse({ error: err.message || 'Internal Server Error' }, 500);
    }
  }
};
