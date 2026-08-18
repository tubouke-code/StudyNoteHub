-- =========================================================
-- StudyNoteHub Supabase Database Schema
-- Supports Study Materials, Assignment Marketplace, Escrow & Payments
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
    CREATE TYPE doc_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'DISPUTED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE escrow_status AS ENUM ('UNPAID', 'HELD_IN_ESCROW', 'RELEASED_TO_WRITER', 'REFUNDED_TO_STUDENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_gateway AS ENUM ('PAYSTACK', 'FLUTTERWAVE', 'WALLET');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE txn_type AS ENUM ('WALLET_DEPOSIT', 'NOTE_PURCHASE', 'NOTE_SALE_ROYALTY', 'ESCROW_LOCK', 'ESCROW_PAYOUT', 'WITHDRAWAL');
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
    avatar_url TEXT,
    institution TEXT,
    department TEXT,
    bio TEXT,
    wallet_balance NUMERIC(12, 2) DEFAULT 0.00 CHECK (wallet_balance >= 0),
    is_verified_writer BOOLEAN DEFAULT FALSE,
    writer_skills TEXT[],
    writer_rating NUMERIC(3, 2) DEFAULT 5.00,
    total_reviews INT DEFAULT 0,
    total_completed_orders INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
    level TEXT, -- e.g. 100L, 200L, 300L, 400L, 500L, Masters, ND, HND
    file_path TEXT NOT NULL, -- Supabase Storage file key
    preview_file_path TEXT,
    file_type TEXT NOT NULL DEFAULT 'pdf', -- pdf, docx, pptx
    file_size_bytes BIGINT,
    page_count INT DEFAULT 1,
    price NUMERIC(10, 2) DEFAULT 0.00, -- 0.00 = Free
    downloads_count INT DEFAULT 0,
    status doc_status DEFAULT 'APPROVED',
    rating NUMERIC(3, 2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Document Purchases Table
CREATE TABLE IF NOT EXISTS public.document_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_paid NUMERIC(10, 2) NOT NULL,
    gateway payment_gateway NOT NULL,
    reference TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Assignment & Project Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    writer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    service_type TEXT NOT NULL, -- Assignment, Final Year Project, Essay, Thesis, Data Analysis, Coursework
    subject_area TEXT NOT NULL,
    academic_level TEXT NOT NULL, -- High School, Undergraduate, Post-Graduate, PhD
    pages_count INT DEFAULT 1,
    word_count INT,
    citation_style TEXT DEFAULT 'APA 7th', -- APA, MLA, Harvard, IEEE, Chicago, Vancouver
    deadline TIMESTAMPTZ NOT NULL,
    instructions TEXT NOT NULL,
    attachment_paths TEXT[], -- Attached guideline/rubric files
    budget NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) DEFAULT 0.00,
    status order_status DEFAULT 'OPEN',
    escrow_status escrow_status DEFAULT 'UNPAID',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Submissions / Deliverables
CREATE TABLE IF NOT EXISTS public.order_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    writer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_paths TEXT[] NOT NULL,
    plagiarism_score NUMERIC(4, 2), -- e.g. 2.5%
    ai_score NUMERIC(4, 2),
    notes TEXT,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Real-time Order Chat Messages
CREATE TABLE IF NOT EXISTS public.order_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Wallet Transactions Ledger
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

-- Auto Create Profile on Supabase Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, self update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Documents: Approved docs are viewable by everyone, uploaders can manage their docs
CREATE POLICY "Approved documents viewable by all" ON public.documents FOR SELECT USING (status = 'APPROVED' OR auth.uid() = uploader_id);
CREATE POLICY "Authenticated users can upload documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = uploader_id);
CREATE POLICY "Uploaders can update own documents" ON public.documents FOR UPDATE USING (auth.uid() = uploader_id);

-- Orders: Viewable by student creator, assigned writer, or open to verified writers
CREATE POLICY "Users can view their own orders or open orders" ON public.orders FOR SELECT USING (
    auth.uid() = student_id OR
    auth.uid() = writer_id OR
    (status = 'OPEN' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'WRITER' OR is_verified_writer = true)))
);
CREATE POLICY "Students can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Order participants can update order" ON public.orders FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = writer_id);

-- Messages: Order participants can view and send messages
CREATE POLICY "Order participants can read messages" ON public.order_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (student_id = auth.uid() OR writer_id = auth.uid()))
);
CREATE POLICY "Order participants can insert messages" ON public.order_messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (student_id = auth.uid() OR writer_id = auth.uid()))
);

-- Enable Realtime for Chat Messages and Orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
