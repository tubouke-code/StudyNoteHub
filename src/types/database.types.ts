export type UserRole = 'STUDENT' | 'WRITER' | 'ADMIN';
export type AdminPermission = 'SUPER_ADMIN' | 'DISPUTE_MANAGER' | 'CONTENT_MODERATOR' | 'FINANCE_AUDITOR';
export type DocStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type OrderStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DISPUTED' | 'COMPLETED' | 'CANCELLED';
export type EscrowStatus = 'UNPAID' | 'HELD_IN_ESCROW' | 'RELEASED_TO_WRITER' | 'REFUNDED_TO_STUDENT' | 'DISPUTE_HOLD';
export type PaymentGateway = 'PAYSTACK' | 'FLUTTERWAVE' | 'WALLET';
export type TxnType = 'WALLET_DEPOSIT' | 'NOTE_PURCHASE' | 'NOTE_SALE_ROYALTY' | 'ESCROW_LOCK' | 'ESCROW_PAYOUT' | 'PLATFORM_FEE' | 'WITHDRAWAL' | 'REFUND';
export type PayoutStatus = 'PENDING' | 'PROCESSED' | 'REJECTED';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  permission: AdminPermission;
  avatar_url?: string;
  last_login?: string;
  is_active: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  admin_permission?: AdminPermission;
  avatar_url?: string;
  institution?: string;
  department?: string;
  bio?: string;
  wallet_balance: number;
  is_verified_writer: boolean;
  writer_skills?: string[];
  writer_rating?: number;
  total_reviews?: number;
  total_completed_orders?: number;
  created_at: string;
  updated_at?: string;
}

export interface DocumentItem {
  id: string;
  uploader_id: string;
  uploader?: Profile;
  title: string;
  description: string;
  course_code: string;
  course_title?: string;
  institution: string;
  faculty?: string;
  department?: string;
  level?: string;
  file_path: string;
  preview_file_path?: string;
  file_type: 'pdf' | 'docx' | 'pptx' | 'zip';
  file_size_bytes?: number;
  page_count: number;
  price: number; // 0 = Free
  downloads_count: number;
  status: DocStatus;
  rating: number;
  created_at: string;
}

export interface DocumentPurchase {
  id: string;
  document_id: string;
  document?: DocumentItem;
  buyer_id: string;
  amount_paid: number;
  gateway: PaymentGateway;
  reference: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  student_id: string;
  student?: Profile;
  writer_id?: string;
  writer?: Profile;
  title: string;
  service_type: string;
  subject_area: string;
  academic_level: string;
  pages_count: number;
  word_count?: number;
  citation_style: string;
  deadline: string;
  instructions: string;
  attachment_paths?: string[];
  budget: number;
  platform_fee: number;
  status: OrderStatus;
  escrow_status: EscrowStatus;
  dispute_reason?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderSubmission {
  id: string;
  order_id: string;
  writer_id: string;
  file_paths: string[];
  plagiarism_score?: number;
  ai_score?: number;
  notes?: string;
  version: number;
  created_at: string;
}

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender?: Profile;
  content: string;
  attachment_url?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  fee: number;
  type: TxnType;
  gateway?: PaymentGateway;
  reference?: string;
  metadata?: Record<string, any>;
  description: string;
  created_at: string;
}

export interface PayoutRequest {
  id: string;
  writer_id: string;
  writer?: Profile;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: PayoutStatus;
  admin_notes?: string;
  created_at: string;
}
