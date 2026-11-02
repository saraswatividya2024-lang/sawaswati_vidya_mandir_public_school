import { FeeMonthRecord, FeePayment, PaymentStatus, Student } from '../types';

export const ACADEMIC_MONTHS = [
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
  'January',
  'February',
  'March'
] as const;

export type AcademicMonth = typeof ACADEMIC_MONTHS[number];

export function computeMonthStatus(
  feeAmount: number,
  discount: number,
  amountPaid: number,
  isPastDue: boolean = false
): PaymentStatus {
  const netDue = Math.max(0, feeAmount - discount);
  if (amountPaid >= netDue) {
    return 'Paid';
  }
  if (amountPaid > 0) {
    return 'Partial';
  }
  return isPastDue ? 'Due' : 'Unpaid';
}

export function generateStudentId(sequence: number, academicYearShort: number = 2026): string {
  return `SVM-${academicYearShort}-${String(sequence).padStart(3, '0')}`;
}

export function generateReceiptNumber(sequence: number, academicYearShort: number = 2026): string {
  return `SVM-REC-${academicYearShort}-${String(sequence).padStart(4, '0')}`;
}

export function generateAdmissionRefNumber(sequence: number, academicYearShort: number = 2026): string {
  return `SVM-ADM-${academicYearShort}-${String(sequence).padStart(4, '0')}`;
}

export function buildStudentMonthlyLedger(
  student: Student,
  academicYear: string,
  classMonthlyFee: number,
  payments: FeePayment[]
): {
  months: FeeMonthRecord[];
  totalYearlyFee: number;
  totalDiscount: number;
  totalPaid: number;
  totalAdvanceAdjusted: number;
  advanceBalanceAvailable: number;
  netPendingBalance: number;
} {
  // Use student monthly fee override if specified
  const effectiveMonthlyFee =
    student.monthlyFeeOverride !== undefined && student.monthlyFeeOverride !== null && Number(student.monthlyFeeOverride) > 0
      ? Number(student.monthlyFeeOverride)
      : classMonthlyFee;

  // Aggregate payments for this student and academic year
  const relevantPayments = payments.filter(
    (p) => (p.studentDbId === student.id || p.studentId === student.studentId) && p.academicYear === academicYear
  );

  const monthPaidMap: Record<string, { paid: number; discount: number; receipt?: string; date?: string }> = {};
  let unallocatedAdvancePaid = Number(student.advanceBalance || 0);

  for (const p of relevantPayments) {
    if (!p.monthsPaid || p.monthsPaid.length === 0) {
      // General advance or unallocated payment
      unallocatedAdvancePaid += Number(p.amountPaid || 0);
      continue;
    }

    const count = p.monthsPaid.length;
    const perMonthPaid = (Number(p.amountPaid) || 0) / count;
    const perMonthDiscount = (Number(p.discount) || 0) / count;

    for (const m of p.monthsPaid) {
      if (!monthPaidMap[m]) {
        monthPaidMap[m] = { paid: 0, discount: 0 };
      }
      monthPaidMap[m].paid += perMonthPaid;
      monthPaidMap[m].discount += perMonthDiscount;
      monthPaidMap[m].receipt = p.receiptNumber;
      monthPaidMap[m].date = p.paymentDate;
    }
  }

  // Sequentially process each month from April to March.
  // Any surplus advance rolls forward into the subsequent months!
  let runningAdvance = unallocatedAdvancePaid;
  let totalAdvanceAdjusted = 0;

  const months: FeeMonthRecord[] = ACADEMIC_MONTHS.map((monthName) => {
    const feeAmount = effectiveMonthlyFee;
    const paidInfo = monthPaidMap[monthName] || { paid: 0, discount: 0 };
    const discount = Math.round(paidInfo.discount || 0);
    const directPaid = Math.round(paidInfo.paid || 0);
    const grossDue = Math.max(0, feeAmount - discount);

    let advanceAdjusted = 0;
    let effectivePaid = directPaid;
    let balance = 0;
    let status: PaymentStatus = 'Unpaid';

    if (directPaid > grossDue) {
      // Direct payment covered this month and generated surplus advance!
      const surplus = directPaid - grossDue;
      runningAdvance += surplus;
      effectivePaid = directPaid;
      balance = 0;
      status = 'Paid';
    } else if (directPaid === grossDue && grossDue > 0) {
      effectivePaid = directPaid;
      balance = 0;
      status = 'Paid';
    } else {
      // directPaid < grossDue: check if we have running advance to apply
      const remainingDue = grossDue - directPaid;
      if (runningAdvance > 0) {
        advanceAdjusted = Math.min(runningAdvance, remainingDue);
        runningAdvance -= advanceAdjusted;
        totalAdvanceAdjusted += advanceAdjusted;
        effectivePaid = directPaid + advanceAdjusted;
      }

      balance = Math.max(0, grossDue - effectivePaid);
      if (balance === 0) {
        status = 'Paid';
      } else if (effectivePaid > 0) {
        status = 'Partial';
      } else {
        status = 'Due';
      }
    }

    return {
      month: monthName,
      academicYear,
      feeAmount,
      discount,
      advanceAdjusted,
      amountPaid: directPaid,
      effectivePaid,
      balance,
      status,
      paymentDate: paidInfo.date,
      receiptNumber: paidInfo.receipt
    };
  });

  const totalYearlyFee = effectiveMonthlyFee * 12;
  const totalDiscount = months.reduce((acc, m) => acc + m.discount, 0);
  const totalPaid = relevantPayments.reduce((acc, p) => acc + Number(p.amountPaid || 0), 0);
  const monthlyBalance = months.reduce((acc, m) => acc + m.balance, 0);
  const previousDue = Number(student.previousDueBalance || 0);
  const netPendingBalance = Math.max(0, monthlyBalance + previousDue - runningAdvance);

  return {
    months,
    totalYearlyFee,
    totalDiscount,
    totalPaid,
    totalAdvanceAdjusted,
    advanceBalanceAvailable: runningAdvance,
    netPendingBalance
  };
}

export function formatWhatsAppFeeReminder(params: {
  studentName: string;
  studentId: string;
  guardianName: string;
  guardianPhone: string;
  className: string;
  pendingBalance: number;
  pendingMonths: string[];
  schoolName: string;
  schoolPhone: string;
}): { message: string; waUrl: string } {
  const cleanPhone = params.guardianPhone.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const monthsText = params.pendingMonths.length > 0 
    ? params.pendingMonths.join(', ') 
    : 'Pending Monthly Fees';

  const message = `Dear ${params.guardianName},
Greetings from ${params.schoolName}.

Fee Status Notification for Student:
Name: ${params.studentName}
Student ID: ${params.studentId}
Class: ${params.className}

Pending Fee Details:
• Pending Months: ${monthsText}
• Total Pending Balance: ₹${params.pendingBalance.toLocaleString('en-IN')}

Kindly clear the pending dues at the school fee office or through online payment.
Helpline: ${params.schoolPhone}

Thank you,
${params.schoolName}`;

  const waUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;

  return { message, waUrl };
}
