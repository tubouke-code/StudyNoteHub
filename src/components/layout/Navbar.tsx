'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BookOpen, 
  PenTool, 
  UploadCloud, 
  Wallet, 
  Menu, 
  X, 
  User, 
  ChevronDown,
  LayoutDashboard,
  Shield,
  LogIn,
  UserPlus,
  Gift,
  Bell,
  CheckCircle2,
  DollarSign,
  FileText,
  Search,
  PlusCircle,
  FolderCheck,
  Users,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { CommandPalette } from '@/components/layout/CommandPalette';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    desc: string;
    time: string;
    icon: string;
    unread: boolean;
  }>>([]);

  useEffect(() => {
    setMounted(true);
    
    // Listen for custom open-command-palette event
    const handleOpenCmd = () => setCommandPaletteOpen(true);
    window.addEventListener('open-command-palette', handleOpenCmd);

    async function loadLiveNotifications() {
      if (!user) {
        setNotifications([]);
        return;
      }
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: txns } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (txns && txns.length > 0) {
          const formatted = txns.map((t) => {
            let icon = '💳';
            let title = t.description || 'Transaction Update';
            if (t.type === 'WALLET_DEPOSIT') {
              icon = '💰';
              title = `Wallet Funded +${formatCurrency(t.amount)}`;
            } else if (t.type === 'NOTE_SALE_ROYALTY') {
              icon = '📚';
              title = `Royalty Credited +${formatCurrency(t.amount)}`;
            } else if (t.type === 'BANK_WITHDRAWAL') {
              icon = '🏦';
              title = `Payout Dispatched ${formatCurrency(Math.abs(t.amount))}`;
            } else if (t.type === 'ESCROW_PAYOUT') {
              icon = '🛡️';
              title = `Milestone Escrow Released +${formatCurrency(t.amount)}`;
            }
            return {
              id: t.id,
              title,
              desc: t.description || `Reference: ${t.reference}`,
              time: new Date(t.created_at).toLocaleDateString(),
              icon,
              unread: false,
            };
          });
          setNotifications(formatted);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    }

    loadLiveNotifications();
    return () => window.removeEventListener('open-command-palette', handleOpenCmd);
  }, [user]);

  const handleSignOut = async () => {
    await logout();
    setUserDropdownOpen(false);
    router.push('/');
  };

  const isAuthReady = mounted && isLoggedIn && !!user;

  const getDashboardHref = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'WRITER') return '/writer-dashboard';
    return '/dashboard';
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-slate-200/80 transition-all bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logo */}
            <Link href={isAuthReady && user?.role === 'WRITER' ? '/writer-dashboard' : isAuthReady && user?.role === 'ADMIN' ? '/admin' : '/'} className="flex items-center gap-2.5 group py-1 shrink-0">
              <img
                src="/logo.jpg"
                alt="StudyNoteHub"
                className="h-10 sm:h-12 w-auto object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform"
              />
            </Link>

            {/* Quick Search Button (Universal Ctrl+K Trigger) */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 text-slate-500 text-xs font-medium transition-all max-w-xs w-full cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">Search notes, course codes, actions...</span>
              <kbd className="ml-auto text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* Desktop Navigation - Tailored to Persona */}
            <nav className="hidden md:flex items-center gap-1.5">
              
              {/* 1. WRITER NAVIGATION */}
              {isAuthReady && user.role === 'WRITER' ? (
                <>
                  <Link
                    href="/writer-dashboard"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      pathname === '/writer-dashboard'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                    Open Job Feed
                  </Link>

                  <Link
                    href="/notes/upload"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload Study Material (90% Royalty)
                  </Link>

                  <Link
                    href="/referrals"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-500" />
                    5% Referrals
                  </Link>
                </>
              ) : isAuthReady && user.role === 'ADMIN' ? (
                /* 2. ADMIN NAVIGATION */
                <>
                  <Link
                    href="/admin"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      pathname === '/admin'
                        ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    Admin Operations
                  </Link>

                  <Link
                    href="/admin?tab=notes"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    Moderation Queue
                  </Link>

                  <Link
                    href="/admin?tab=disputes"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    Disputes & Escrow
                  </Link>

                  <Link
                    href="/notes"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Public Catalog
                  </Link>
                </>
              ) : (
                /* 3. HIRER / STUDENT & GUEST NAVIGATION */
                <>
                  <Link
                    href="/notes"
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      pathname.startsWith('/notes') && pathname !== '/notes/upload'
                        ? 'bg-primary-50 text-primary-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-primary-600" />
                    Browse Notes & Past Questions
                  </Link>

                  <Link
                    href="/hire-writer/new"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-xs transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Post Project (Get Bids)
                  </Link>

                  <Link
                    href="/referrals"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-500" />
                    Earn 5%
                  </Link>
                </>
              )}

            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Mobile Search Button */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                title="Search (Ctrl + K)"
              >
                <Search className="w-4 h-4" />
              </button>

              {isAuthReady ? (
                <>
                  {/* Notifications Bell */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setNotificationsOpen(!notificationsOpen);
                        setUserDropdownOpen(false);
                      }}
                      className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative cursor-pointer"
                    >
                      <Bell className="w-4 h-4" />
                      {notifications.length > 0 && (
                        <>
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                        </>
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in">
                        <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Notifications</span>
                          <span className="text-[10px] text-slate-400 font-medium">Live Activity</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center space-y-2">
                              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                <Bell className="w-5 h-5" />
                              </div>
                              <p className="text-xs font-bold text-slate-800">No new notifications</p>
                              <p className="text-[11px] text-slate-400 leading-tight">
                                Alerts for project bids, royalties, and escrow releases appear here.
                              </p>
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-100">
                              {notifications.map((n) => (
                                <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-3">
                                  <span className="text-lg">{n.icon}</span>
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-slate-900">{n.title}</p>
                                    <p className="text-[11px] text-slate-500 leading-tight">{n.desc}</p>
                                    <span className="text-[10px] text-slate-400 block pt-0.5">{n.time}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Role Dashboard Quick Pill */}
                  {user.role === 'STUDENT' ? (
                    <Link
                      href="/dashboard"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 border border-primary-200 text-primary-800 hover:bg-primary-100 transition-all shadow-xs"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-primary-600" />
                      <span className="text-xs font-bold">Hirer Dashboard</span>
                    </Link>
                  ) : user.role === 'WRITER' ? (
                    <Link
                      href="/writer-dashboard"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all shadow-xs"
                    >
                      <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-bold">{formatCurrency(user.wallet_balance)}</span>
                    </Link>
                  ) : (
                    <Link
                      href="/admin"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100 transition-all shadow-xs"
                    >
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-xs font-bold">Admin Center</span>
                    </Link>
                  )}

                  {/* User Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(!userDropdownOpen);
                        setNotificationsOpen(false);
                      }}
                      className="flex items-center gap-2 pl-1 border-l border-slate-200 cursor-pointer"
                    >
                      <img
                        src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                        alt={user.full_name}
                        className="w-8 h-8 rounded-full ring-2 ring-primary-100 object-cover"
                      />
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in">
                        <div className="px-4 py-2.5 border-b border-slate-100">
                          <p className="text-sm font-bold text-slate-900 truncate">{user.full_name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-700">
                            {user.role} {user.admin_permission ? `(${user.admin_permission})` : ''}
                          </span>
                        </div>
                        
                        <div className="px-2 py-1 space-y-0.5 text-xs">
                          <Link
                            href={getDashboardHref()}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-bold"
                          >
                            <LayoutDashboard className="w-4 h-4 text-primary-600" /> Dashboard & Orders
                          </Link>
                          <Link
                            href="/wallet"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <Wallet className="w-4 h-4 text-emerald-600" /> Wallet Balance ({formatCurrency(user.wallet_balance)})
                          </Link>
                          <Link
                            href="/referrals"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <Gift className="w-4 h-4 text-amber-500" /> Refer & Earn 5%
                          </Link>

                          {/* Admin Switcher */}
                          {user.role === 'ADMIN' && (
                            <div className="pt-2 border-t border-slate-100">
                              <span className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 block">
                                Admin View Switcher:
                              </span>
                              <Link
                                href="/dashboard"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 text-[11px]"
                              >
                                <User className="w-3.5 h-3.5 text-slate-400" /> Preview Hirer View
                              </Link>
                              <Link
                                href="/writer-dashboard"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 text-[11px]"
                              >
                                <PenTool className="w-3.5 h-3.5 text-slate-400" /> Preview Writer View
                              </Link>
                            </div>
                          )}

                          <div className="pt-1 border-t border-slate-100">
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
                            >
                              <LogIn className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-xs transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* Global Command Palette (Ctrl + K) */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
    </>
  );
}
