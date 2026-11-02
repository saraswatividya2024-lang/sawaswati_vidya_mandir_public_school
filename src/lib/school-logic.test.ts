import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeMonthStatus,
  generateStudentId,
  generateReceiptNumber,
  generateAdmissionRefNumber,
  buildStudentMonthlyLedger,
  formatWhatsAppFeeReminder,
  ACADEMIC_MONTHS
} from './school-logic';
import { Student, FeePayment } from '../types';

test('computeMonthStatus correctly computes Paid, Partial, and Due statuses', () => {
  // Case 1: Full payment
  assert.equal(computeMonthStatus(1000, 0, 1000), 'Paid');
  // Case 2: Full payment with discount
  assert.equal(computeMonthStatus(1000, 200, 800), 'Paid');
  // Case 3: Partial payment
  assert.equal(computeMonthStatus(1000, 0, 500), 'Partial');
  // Case 4: Unpaid past due
  assert.equal(computeMonthStatus(1000, 0, 0, true), 'Due');
  // Case 5: Unpaid not past due
  assert.equal(computeMonthStatus(1000, 0, 0, false), 'Unpaid');
});

test('ID generators create consistent branded identifiers', () => {
  assert.equal(generateStudentId(1, 2026), 'SVM-2026-001');
  assert.equal(generateStudentId(42, 2026), 'SVM-2026-042');
  assert.equal(generateReceiptNumber(15, 2026), 'SVM-REC-2026-0015');
  assert.equal(generateAdmissionRefNumber(7, 2026), 'SVM-ADM-2026-0007');
});

test('buildStudentMonthlyLedger handles 12 months, payments, and balances accurately', () => {
  const dummyStudent: Student = {
    id: 10,
    studentId: 'SVM-2026-010',
    fullName: 'Aarav Kumar',
    dob: '2016-05-12',
    gender: 'Male',
    classVal: 'V',
    section: 'A',
    rollNumber: '05',
    admissionNumber: '2162/V/05',
    admissionDate: '2024-04-01',
    fatherName: 'Rajesh Kumar',
    motherName: 'Sunita Devi',
    guardianName: 'Rajesh Kumar',
    guardianPhone: '9876543210',
    address: 'Kathig, Semla, Dumka',
    status: 'Active',
    previousDueBalance: 500
  };

  const payments: FeePayment[] = [
    {
      id: 1,
      receiptNumber: 'SVM-REC-2026-0001',
      studentDbId: 10,
      studentId: 'SVM-2026-010',
      studentName: 'Aarav Kumar',
      classVal: 'V',
      section: 'A',
      academicYear: '2026-27',
      monthsPaid: ['April'],
      totalFee: 1000,
      discount: 0,
      amountPaid: 1000,
      remainingBalance: 0,
      paymentMethod: 'Cash',
      paymentDate: '2026-04-10',
      collectedBy: 'Admin'
    },
    {
      id: 2,
      receiptNumber: 'SVM-REC-2026-0002',
      studentDbId: 10,
      studentId: 'SVM-2026-010',
      studentName: 'Aarav Kumar',
      classVal: 'V',
      section: 'A',
      academicYear: '2026-27',
      monthsPaid: ['May'],
      totalFee: 1000,
      discount: 200,
      amountPaid: 400,
      remainingBalance: 400,
      paymentMethod: 'UPI',
      paymentDate: '2026-05-08',
      collectedBy: 'Admin'
    }
  ];

  const ledger = buildStudentMonthlyLedger(dummyStudent, '2026-27', 1000, payments);

  assert.equal(ledger.months.length, 12);
  assert.equal(ledger.totalYearlyFee, 12000);

  // April check
  const april = ledger.months.find(m => m.month === 'April');
  assert.ok(april);
  assert.equal(april.amountPaid, 1000);
  assert.equal(april.balance, 0);
  assert.equal(april.status, 'Paid');

  // May check
  const may = ledger.months.find(m => m.month === 'May');
  assert.ok(may);
  assert.equal(may.amountPaid, 400);
  assert.equal(may.discount, 200);
  assert.equal(may.balance, 400);
  assert.equal(may.status, 'Partial');

  // Total paid should be 1400
  assert.equal(ledger.totalPaid, 1400);

  // June (unpaid): fee is 1000
  const june = ledger.months.find(m => m.month === 'June');
  assert.ok(june);
  assert.equal(june.balance, 1000);
  assert.equal(june.status, 'Due');

  // Net pending should include remaining 10 months (10*1000) + May balance (400) + previous dues (500) = 10900
  assert.equal(ledger.netPendingBalance, 10900);
});

test('formatWhatsAppFeeReminder generates valid url and polite message', () => {
  const result = formatWhatsAppFeeReminder({
    studentName: 'Priya Sharma',
    studentId: 'SVM-2026-018',
    guardianName: 'Manoj Sharma',
    guardianPhone: '9973100625',
    className: 'Class VII',
    pendingBalance: 2400,
    pendingMonths: ['July', 'August'],
    schoolName: 'Saraswati Vidya Mandir Public School, Semla',
    schoolPhone: '9973100625'
  });

  assert.ok(result.message.includes('Priya Sharma'));
  assert.ok(result.message.includes('2,400'));
  assert.ok(result.message.includes('July, August'));
  assert.ok(result.waUrl.startsWith('https://wa.me/919973100625?text='));
});

test('Advance fee automatically reduces next month fee and carries surplus', () => {
  const dummyStudent: Student = {
    id: 99,
    studentId: 'SVM-2026-099',
    fullName: 'Rahul Soren',
    dob: '2015-01-01',
    gender: 'Male',
    classVal: 'Class V',
    section: 'A',
    rollNumber: '10',
    admissionNumber: '2162/V/10',
    admissionDate: '2025-04-01',
    fatherName: 'Manoj Soren',
    motherName: 'Sunita Soren',
    guardianName: 'Manoj Soren',
    guardianPhone: '9973100625',
    address: 'Semla',
    status: 'Active',
    previousDueBalance: 0
  };

  // Student monthly fee is 500.
  // In April, parent pays ₹1,200 (₹500 for April + ₹700 surplus advance)
  const payments: FeePayment[] = [
    {
      id: 101,
      receiptNumber: 'SVM-REC-2026-0101',
      studentDbId: 99,
      studentId: 'SVM-2026-099',
      studentName: 'Rahul Soren',
      classVal: 'Class V',
      section: 'A',
      academicYear: '2026-27',
      monthsPaid: ['April'],
      totalFee: 500,
      discount: 0,
      amountPaid: 1200, // 700 surplus advance!
      remainingBalance: 0,
      paymentMethod: 'Cash',
      paymentDate: '2026-04-05',
      collectedBy: 'Admin'
    }
  ];

  const ledger = buildStudentMonthlyLedger(dummyStudent, '2026-27', 500, payments);

  // April check: Fully paid, no advance adjusted needed
  const april = ledger.months.find((m) => m.month === 'April');
  assert.ok(april);
  assert.equal(april.feeAmount, 500);
  assert.equal(april.amountPaid, 1200);
  assert.equal(april.balance, 0);
  assert.equal(april.status, 'Paid');

  // May check: Should be automatically covered by advance!
  const may = ledger.months.find((m) => m.month === 'May');
  assert.ok(may);
  assert.equal(may.feeAmount, 500);
  assert.equal(may.amountPaid, 0);
  assert.equal(may.advanceAdjusted, 500); // 500 deducted from the 700 advance
  assert.equal(may.effectivePaid, 500);
  assert.equal(may.balance, 0);
  assert.equal(may.status, 'Paid');

  // June check: 200 remaining advance applied, remaining balance is 300!
  const june = ledger.months.find((m) => m.month === 'June');
  assert.ok(june);
  assert.equal(june.feeAmount, 500);
  assert.equal(june.advanceAdjusted, 200);
  assert.equal(june.effectivePaid, 200);
  assert.equal(june.balance, 300);
  assert.equal(june.status, 'Partial');

  // Total advance adjusted = 500 (May) + 200 (June) = 700
  assert.equal(ledger.totalAdvanceAdjusted, 700);
  // Remaining advance pool is now 0
  assert.equal(ledger.advanceBalanceAvailable, 0);
});

