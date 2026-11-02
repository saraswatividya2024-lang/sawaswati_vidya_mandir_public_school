export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid' | 'Due';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';

export type AdmissionStatus = 'New' | 'Contacted' | 'Under Review' | 'Approved' | 'Rejected';

export interface SchoolProfile {
  name: string;
  hindiName?: string;
  tagline: string;
  motto: string;
  sanskritMotto: string;
  registrationNo: string;
  affiliationInfo: string;
  classesOffered: string;
  address: string;
  po: string;
  district: string;
  state: string;
  pinCode: string;
  phone1: string;
  phone2: string;
  email: string;
  workingHours: string;
  logoUrl: string;
  bannerUrl: string;
  admissionsOpen: boolean;
  admissionSession: string;
  freeAdmissionNote?: string;
}

export interface HomeContent {
  heroHeading: string;
  heroSubtitle: string;
  aboutIntro: string;
  vision: string;
  mission: string;
  history: string;
  philosophy: string;
  principalName: string;
  principalDesignation: string;
  principalMessage: string;
  principalPhotoUrl: string;
}

export interface Facility {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isVisible: boolean;
}

export interface Teacher {
  id: number;
  name: string;
  designation: string;
  subject: string;
  qualification: string;
  experienceYears?: number;
  bio: string;
  photoUrl: string;
  phone?: string;
  email?: string;
  isPublished: boolean;
  displayOrder: number;
}

export interface Notice {
  id: number;
  title: string;
  description: string;
  category: 'General' | 'Examination' | 'Holiday' | 'Event' | 'Urgent' | 'Academic';
  publishedDate: string;
  expiryDate?: string;
  attachmentUrl?: string;
  imageUrl?: string;
  isUrgent: boolean;
  isPublished: boolean;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: 'Campus' | 'Events' | 'Sports' | 'Cultural' | 'Celebrations';
  imageUrl: string;
  isPublished: boolean;
  displayOrder: number;
}

export interface AdmissionEnquiry {
  id: number;
  refNumber: string;
  studentName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  classApplying: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  guardianPhone: string;
  email?: string;
  previousSchool?: string;
  address: string;
  additionalInfo?: string;
  status: AdmissionStatus;
  internalNotes?: string;
  createdAt: string;
}

export interface ContactEnquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  createdAt: string;
}

export interface Student {
  id: number;
  studentId: string;
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  classVal: string;
  section: string;
  rollNumber: string;
  admissionNumber: string;
  admissionDate: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  photoUrl?: string;
  status: 'Active' | 'Inactive' | 'Passed Out';
  previousDueBalance: number;
  monthlyFeeOverride?: number;
  advanceBalance?: number;
}

export interface ClassFeeStructure {
  className: string;
  monthlyTuitionFee: number;
  admissionFee: number;
  examFee: number;
  computerFee: number;
}

export interface FeeMonthRecord {
  month: string;
  academicYear: string;
  feeAmount: number;
  discount: number;
  advanceAdjusted: number;
  amountPaid: number;
  effectivePaid: number;
  balance: number;
  status: PaymentStatus;
  paymentDate?: string;
  receiptNumber?: string;
}

export interface FeePayment {
  id: number;
  receiptNumber: string;
  studentDbId: number;
  studentId: string;
  studentName: string;
  classVal: string;
  section: string;
  academicYear: string;
  monthsPaid: string[];
  totalFee: number;
  discount: number;
  amountPaid: number;
  remainingBalance: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  notes?: string;
  collectedBy: string;
}

export interface FeeLedger {
  student: Student;
  academicYear: string;
  classMonthlyFee: number;
  previousDueBalance: number;
  advanceBalanceAvailable: number;
  totalAdvanceAdjusted: number;
  months: FeeMonthRecord[];
  totalYearlyFee: number;
  totalDiscount: number;
  totalPaid: number;
  netPendingBalance: number;
  payments: FeePayment[];
}

export interface SchoolTransport {
  id: number;
  routeName: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  areasCovered: string;
  morningTime?: string;
  afternoonTime?: string;
  monthlyCharge?: number;
  isActive: boolean;
}

export interface AdminUser {
  id: number;
  username: string;
  role: 'superadmin' | 'admin' | 'staff';
  name: string;
}
