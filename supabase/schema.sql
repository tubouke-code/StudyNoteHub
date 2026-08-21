-- =========================================================
-- StudyNoteHub Supabase Database Schema (Updated)
-- Supports Multi-Admin, Study Materials, Assignment Marketplace, Escrow & Payments
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Custom Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'WRITER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admin_permission AS ENUM ('SUPER_ADMIN', 'DISPUTE_MANAGER', 'CONTENT_MODERATOR', 'FINANCE_AUDITOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE doc_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW', 'DISPUTED', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE escrow_status AS ENUM ('UNPAID', 'HELD_IN_ESCROW', 'RELEASED_TO_WRITER', 'REFUNDED_TO_STUDENT', 'DISPUTE_HOLD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_gateway AS ENUM ('PAYSTACK', 'FLUTTERWAVE', 'WALLET');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE txn_type AS ENUM ('WALLET_DEPOSIT', 'NOTE_PURCHASE', 'NOTE_SALE_ROYALTY', 'ESCROW_LOCK', 'ESCROW_PAYOUT', 'PLATFORM_FEE', 'WITHDRAWAL', 'REFUND');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payout_status AS ENUM ('PENDING', 'PROCESSED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'STUDENT',
    admin_permission admin_permission DEFAULT NULL,
    avatar_url TEXT,
    institution TEXT,
    department TEXT,
    bio TEXT,
    wallet_balance NUMERIC(12, 2) DEFAULT 0.00 CHECK (wallet_balance >= 0),
    is_verified_writer BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    writer_skills TEXT[],
    writer_rating NUMERIC(3, 2) DEFAULT 5.00,
    total_reviews INT DEFAULT 0,
    total_completed_orders INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_permission admin_permission DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;

-- 3. Study Materials & Lesson Notes
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    course_code TEXT NOT NULL,
    course_title TEXT,
    institution TEXT NOT NULL,
    faculty TEXT,
    department TEXT,
    level TEXT,
    file_path TEXT NOT NULL,
    preview_file_path TEXT,
    file_type TEXT NOT NULL DEFAULT 'pdf',
    file_size_bytes BIGINT,
    page_count INT DEFAULT 1,
    price NUMERIC(10, 2) DEFAULT 0.00,
    downloads_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    status doc_status DEFAULT 'PENDING',
    plagiarism_score NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Document Purchases & Royalties (90% Creator / 10% Platform)
CREATE TABLE IF NOT EXISTS public.document_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    price_paid NUMERIC(10, 2) NOT NULL,
    creator_royalty NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL,
    payment_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Custom Escrow Orders (Assignment & Project Writing)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    writer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    academic_level TEXT NOT NULL,
    service_type TEXT NOT NULL,
    subject_area TEXT NOT NULL,
    topic TEXT NOT NULL,
    instructions TEXT,
    page_count INT DEFAULT 1,
    budget NUMERIC(12, 2) NOT NULL,
    writer_cut NUMERIC(12, 2) NOT NULL,
    platform_commission NUMERIC(12, 2) NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    status order_status DEFAULT 'OPEN',
    escrow_status escrow_status DEFAULT 'UNPAID',
    escrow_amount NUMERIC(12, 2) DEFAULT 0.00,
    turnitin_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Submissions
CREATE TABLE IF NOT EXISTS public.order_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    writer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    turnitin_report_path TEXT,
    similarity_score NUMERIC(5, 2),
    ai_score NUMERIC(5, 2),
    writer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Order Real-time Messages
CREATE TABLE IF NOT EXISTS public.order_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachment_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Platform Financial Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    fee NUMERIC(10, 2) DEFAULT 0.00,
    type txn_type NOT NULL,
    gateway payment_gateway,
    reference TEXT UNIQUE,
    metadata JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Writer Payout Requests
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    writer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    status payout_status DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Reviews & Ratings
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- Auto-Create & Auto-Sync Profile Trigger for Auth Users
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, avatar_url, is_email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN NEW.email = 'orukari878@gmail.com' THEN 'ADMIN'::user_role
            WHEN NEW.raw_user_meta_data->>'role' = 'WRITER' THEN 'WRITER'::user_role
            ELSE 'STUDENT'::user_role
        END,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', null),
        CASE
            WHEN NEW.email = 'orukari878@gmail.com' THEN true
            WHEN NEW.raw_user_meta_data->>'is_email_verified' = 'true' THEN true
            ELSE false
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- Row Level Security (RLS) Policies
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.jwt()->>'email' = 'orukari878@gmail.com'
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles viewable by all" ON public.profiles;
CREATE POLICY "Public profiles viewable by all" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Documents Policies
DROP POLICY IF EXISTS "Approved documents viewable by all" ON public.documents;
DROP POLICY IF EXISTS "Documents viewable by users and admins" ON public.documents;
CREATE POLICY "Documents viewable by users and admins" ON public.documents FOR SELECT 
    USING (status = 'APPROVED' OR auth.uid() = uploader_id OR public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can upload documents" ON public.documents;
DROP POLICY IF EXISTS "Allow user document upload" ON public.documents;
CREATE POLICY "Allow user document upload" ON public.documents FOR INSERT 
    WITH CHECK (auth.uid() = uploader_id OR auth.uid() IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "Uploaders can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Uploaders and admins can update documents" ON public.documents;
CREATE POLICY "Uploaders and admins can update documents" ON public.documents FOR UPDATE 
    USING (auth.uid() = uploader_id OR public.is_admin());

DROP POLICY IF EXISTS "Uploaders and admins can delete documents" ON public.documents;
CREATE POLICY "Uploaders and admins can delete documents" ON public.documents FOR DELETE 
    USING (auth.uid() = uploader_id OR public.is_admin());

-- Transactions Policies
DROP POLICY IF EXISTS "Users view own transactions" ON public.transactions;
CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users insert own transactions" ON public.transactions;
CREATE POLICY "Users insert own transactions" ON public.transactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Orders Policies
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT 
    USING (auth.uid() = client_id OR auth.uid() = writer_id OR public.is_admin());

DROP POLICY IF EXISTS "Users create orders" ON public.orders;
CREATE POLICY "Users create orders" ON public.orders FOR INSERT 
    WITH CHECK (auth.uid() = client_id OR public.is_admin());

DROP POLICY IF EXISTS "Users and admins update orders" ON public.orders;
CREATE POLICY "Users and admins update orders" ON public.orders FOR UPDATE 
    USING (auth.uid() = client_id OR auth.uid() = writer_id OR public.is_admin());

-- Ensure both client_id and student_id exist on orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
UPDATE public.orders SET client_id = student_id WHERE client_id IS NULL AND student_id IS NOT NULL;
UPDATE public.orders SET student_id = client_id WHERE student_id IS NULL AND client_id IS NOT NULL;

-- 11. Project Bids (Sealed / Blind Bidding System)
DO $$ BEGIN
    CREATE TYPE bid_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    writer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bid_amount NUMERIC(12, 2) NOT NULL,
    delivery_days INT NOT NULL DEFAULT 7,
    proposal_pitch TEXT NOT NULL,
    status bid_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id, writer_id)
);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- SEALED BIDDING RLS POLICIES
-- Hirer can view all bids on their project; Writers can ONLY view their own bid (blind bidding)
DROP POLICY IF EXISTS "Sealed bids viewable by order client and owner writer" ON public.bids;
CREATE POLICY "Sealed bids viewable by order client and owner writer" ON public.bids FOR SELECT
    USING (
        auth.uid() = writer_id
        OR EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = bids.order_id AND (orders.client_id = auth.uid() OR orders.student_id = auth.uid())
        )
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Writers can submit bids" ON public.bids;
CREATE POLICY "Writers can submit bids" ON public.bids FOR INSERT
    WITH CHECK (auth.uid() = writer_id);

DROP POLICY IF EXISTS "Writers and clients can update bids" ON public.bids;
CREATE POLICY "Writers and clients can update bids" ON public.bids FOR UPDATE
    USING (
        auth.uid() = writer_id
        OR EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = bids.order_id AND (orders.client_id = auth.uid() OR orders.student_id = auth.uid())
        )
        OR public.is_admin()
    );
