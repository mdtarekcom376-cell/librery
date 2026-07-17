export interface Book {
  id: string;
  code: string;
  name: string;
  author: string;
  publisher: string;
  imageUrl: string;
  status: "Available" | "Issued";
  group?: string; // e.g., নজরুল কর্নার, রবীন্দ্রনাথ কর্নার, উপন্যাস, গল্প ইত্যাদি
  description?: string;
  pageCount?: number; // পৃষ্ঠা সংখ্যা
  price?: number; // মূল্য (৳)
}

export interface Member {
  formNumber: string;
  name: string;
  mobile: string;
  address: string;
  dob?: string; // জন্ম তারিখ (YYYY-MM-DD or string)
  educationInstitution?: string; // শিক্ষা প্রতিষ্ঠান
  className?: string; // ক্লাস
  classRoll?: string; // ক্লাস রোল
  
  // Registration custom fields
  nameEnglish?: string;
  fatherName?: string;
  motherName?: string;
  currVillage?: string;
  currPostOffice?: string;
  currUpazila?: string;
  currDistrict?: string;
  permVillage?: string;
  permPostOffice?: string;
  permUpazila?: string;
  permDistrict?: string;
  bloodGroup?: string;
  nidBirthReg?: string;
  educationQualification?: string;
  profession?: string;
  nationality?: string;
  photo?: string; // ছবি (Base64 string)

  // Payment Verification fields (Option 1)
  paymentMethod?: string; // "বিকাশ" | "নগদ" | "রকেট" | "অফলাইন কাউন্টার"
  senderNumber?: string;  // যে নম্বর থেকে পাঠানো হয়েছে
  transactionId?: string; // ট্রানজেকশন আইডি (TrxID)
  paymentStatus?: "Pending" | "Paid" | "Unpaid"; // পেমেন্ট স্ট্যাটাস
}

export interface IssueRecord {
  id: string;
  bookCode: string;
  bookName: string;
  author: string;
  publisher: string;
  memberName: string;
  formNumber: string;
  mobile: string;
  address: string;
  issueDate: string;
  returnDate: string;
  status: "Issued" | "Returned";
  extensionHistory: Array<{
    date: string;
    action: "Extended" | "Reduced";
    payload: string;
  }>;
  comments: string[];
  returnedAt?: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  author: string;
  publisher: string;
  createdAt: string;
  memberFormNumber?: string; // কোন সদস্য উইশ করেছেন
  status?: "Waiting" | "Available"; // "Waiting" বা "Available"
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface SMSAlert {
  id: string;
  bookName: string;
  memberName: string;
  returnDate: string;
  mobile: string;
  status: "Scheduled" | "Sent";
  alertText: string;
  triggerTime: string;
}

export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  issuedBooks: number;
  lateBooks: number;
  todaysTransactions: number;
  totalMembers: number;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: {
    monthlyReport: Array<{ month: string; issues: number; returns: number }>;
    popularBooks: Array<{ code: string; name: string; count: number }>;
    activeMembers: Array<{ formNumber: string; name: string; count: number }>;
    lateReportLoans: IssueRecord[];
  };
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string; // e.g. "টি-শার্ট", "প্যাড", "বই", "মগ", "অন্যান্য"
  createdAt: string;
}

export interface Review {
  id: string;
  memberFormNumber: string;
  memberName: string;
  subject: string;
  content: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
}

export interface Notice {
  id: string;
  subject: string;
  content: string;
  createdAt: string;
}

