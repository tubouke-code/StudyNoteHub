'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  PenTool, 
  Wallet, 
  User, 
  UploadCloud, 
  Shield, 
  Sparkles, 
  PlusCircle, 
  FolderCheck,
  Users
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isLoggedIn } = useAuth();

  // Define role-tailored navigation items
  let navItems: Array<{
    label: string;
    href: string;
    icon: any;
    isPrimaryAction?: boolean;
    isActive: boolean;
  }> = [];

  if (isLoggedIn && user?.role === 'WRITER') {
    navItems = [
      {
        label: 'Job Feed',
        href: '/writer-dashboard',
        icon: PenTool,
        isActive: pathname === '/writer-dashboard' && !pathname.includes('tab='),
      },
      {
        label: 'Active Jobs',
        href: '/writer-dashboard?tab=assigned',
        icon: FolderCheck,
        isActive: pathname === '/writer-dashboard' && pathname.includes('tab=assigned'),
      },
      {
        label: 'Upload',
        href: '/notes/upload',
        icon: UploadCloud,
        isPrimaryAction: true,
        isActive: pathname === '/notes/upload',
      },
      {
        label: 'Materials',
        href: '/writer-dashboard?tab=materials',
        icon: BookOpen,
        isActive: pathname === '/writer-dashboard' && pathname.includes('tab=materials'),
      },
      {
        label: 'Wallet',
        href: '/wallet',
        icon: Wallet,
        isActive: pathname === '/wallet',
      },
    ];
  } else if (isLoggedIn && user?.role === 'ADMIN') {
    navItems = [
      {
        label: 'Admin Hub',
        href: '/admin',
        icon: Shield,
        isActive: pathname === '/admin',
      },
      {
        label: 'Moderation',
        href: '/admin?tab=notes',
        icon: BookOpen,
        isActive: pathname.startsWith('/admin') && pathname.includes('tab=notes'),
      },
      {
        label: 'Post Task',
        href: '/hire-writer/new',
        icon: PlusCircle,
        isPrimaryAction: true,
        isActive: pathname === '/hire-writer/new',
      },
      {
        label: 'Disputes',
        href: '/admin?tab=disputes',
        icon: Users,
        isActive: pathname.startsWith('/admin') && pathname.includes('tab=disputes'),
      },
      {
        label: 'Hirer View',
        href: '/dashboard',
        icon: User,
        isActive: pathname === '/dashboard',
      },
    ];
  } else if (isLoggedIn && user?.role === 'STUDENT') {
    navItems = [
      {
        label: 'Home',
        href: '/',
        icon: Home,
        isActive: pathname === '/',
      },
      {
        label: 'Notes',
        href: '/notes',
        icon: BookOpen,
        isActive: pathname.startsWith('/notes') && pathname !== '/notes/upload',
      },
      {
        label: 'Post Project',
        href: '/hire-writer/new',
        icon: PlusCircle,
        isPrimaryAction: true,
        isActive: pathname === '/hire-writer/new',
      },
      {
        label: 'My Orders',
        href: '/dashboard',
        icon: PenTool,
        isActive: pathname === '/dashboard',
      },
      {
        label: 'Wallet',
        href: '/wallet',
        icon: Wallet,
        isActive: pathname === '/wallet',
      },
    ];
  } else {
    // Guest items
    navItems = [
      {
        label: 'Home',
        href: '/',
        icon: Home,
        isActive: pathname === '/',
      },
      {
        label: 'Notes',
        href: '/notes',
        icon: BookOpen,
        isActive: pathname.startsWith('/notes'),
      },
      {
        label: 'Post Project',
        href: '/hire-writer/new',
        icon: PlusCircle,
        isPrimaryAction: true,
        isActive: pathname === '/hire-writer/new',
      },
      {
        label: 'Earn 5%',
        href: '/referrals',
        icon: Sparkles,
        isActive: pathname === '/referrals',
      },
      {
        label: 'Sign In',
        href: '/login',
        icon: User,
        isActive: pathname === '/login',
      },
    ];
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item, idx) => {
          const Icon = item.icon;

          if (item.isPrimaryAction) {
            return (
              <Link
                key={idx}
                href={item.href}
                className="flex flex-col items-center -mt-5 group"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                  user?.role === 'WRITER'
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-primary-600 text-white shadow-primary-600/30'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-800 mt-1">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                item.isActive 
                  ? 'text-primary-600 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.isActive ? 'text-primary-600' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
