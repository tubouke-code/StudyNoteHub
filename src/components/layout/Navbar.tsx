'use client';

import React, { useState } from 'react';
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
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    setUserDropdownOpen(false);
    router.push('/');
  };

  // Determine user dashboard link based on role
  const getDashboardHref = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'WRITER') return '/writer-dashboard';
    return '/dashboard';
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    if (user.role === 'ADMIN') return 'Admin Portal';
    if (user.role === 'WRITER') return 'Writer Hub';
    return 'My Dashboard';
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1">
                StudyNote<span className="text-primary-600">Hub</span>
              </span>
              <span className="block text-[10px] font-medium tracking-wider text-slate-500 uppercase">
                Notes & Escrow Projects
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/notes"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                pathname.startsWith('/notes') && pathname !== '/notes/upload'
                  ? 'bg-primary-50 text-primary-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <BookOpen className="w-4 h-4 text-primary-600" />
              Browse Notes
            </Link>

            <Link
              href="/hire-writer"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                pathname.startsWith('/hire-writer') && pathname !== '/hire-writer/new'
                  ? 'bg-primary-50 text-primary-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <PenTool className="w-4 h-4 text-emerald-600" />
              Hire a Writer
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                Escrow
              </span>
            </Link>

            {/* If Logged In: Show designated Role Dashboard Link */}
            {isLoggedIn && user && (
              <Link
                href={getDashboardHref()}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  pathname === getDashboardHref()
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {user.role === 'ADMIN' ? (
                  <Shield className="w-4 h-4 text-indigo-600" />
                ) : user.role === 'WRITER' ? (
                  <PenTool className="w-4 h-4 text-emerald-600" />
                ) : (
                  <LayoutDashboard className="w-4 h-4 text-primary-600" />
                )}
                {getDashboardLabel()}
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isLoggedIn && user ? (
              <>
                {/* Upload Button */}
                <Link
                  href="/notes/upload"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all shadow-xs"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                  Upload & Earn
                </Link>

                {/* Wallet Balance Pill */}
                <Link
                  href="/wallet"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all shadow-xs"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold">{formatCurrency(user.wallet_balance)}</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-1 border-l border-slate-200"
                  >
                    <img
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full ring-2 ring-primary-100 object-cover"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-700">
                          {user.role} {user.admin_permission ? `(${user.admin_permission})` : ''}
                        </span>
                      </div>
                      
                      <div className="px-2 py-1 space-y-0.5 text-xs">
                        <Link
                          href={getDashboardHref()}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-bold"
                        >
                          <LayoutDashboard className="w-4 h-4 text-primary-600" /> {getDashboardLabel()}
                        </Link>
                        <Link
                          href="/wallet"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <Wallet className="w-4 h-4 text-slate-400" /> Wallet Balance
                        </Link>
                        <Link
                          href="/notes/upload"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <UploadCloud className="w-4 h-4 text-slate-400" /> Upload Notes
                        </Link>

                        {/* If Admin: Show direct link to other portals for preview */}
                        {user.role === 'ADMIN' && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 block">
                              Admin Switcher:
                            </span>
                            <Link
                              href="/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 text-[11px]"
                            >
                              <User className="w-3.5 h-3.5 text-slate-400" /> Preview Student View
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
                      </div>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-bold"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-600/20 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            {!isLoggedIn ? (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-bold"
              >
                Sign In
              </Link>
            ) : (
              <Link
                href="/wallet"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold"
              >
                <Wallet className="w-3 h-3" />
                {user ? formatCurrency(user.wallet_balance) : '₦0'}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            href="/notes"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 p-2.5 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-semibold"
          >
            <BookOpen className="w-4 h-4 text-primary-600" /> Browse Notes
          </Link>
          <Link
            href="/hire-writer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 p-2.5 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-semibold"
          >
            <PenTool className="w-4 h-4 text-emerald-600" /> Hire a Writer
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link
                href={getDashboardHref()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-lg text-primary-700 bg-primary-50 text-sm font-bold"
              >
                <LayoutDashboard className="w-4 h-4 text-primary-600" /> {getDashboardLabel()}
              </Link>
              <Link
                href="/wallet"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-semibold"
              >
                <Wallet className="w-4 h-4 text-emerald-600" /> Wallet Balance
              </Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2.5 text-xs text-red-600 font-bold"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold text-xs"
              >
                Sign In to Account
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs shadow-md"
              >
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
