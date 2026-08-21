import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAppURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    'https://study-note-hub.vercel.app';

  if (typeof window !== 'undefined' && window.location.origin) {
    url = window.location.origin;
  }

  // Ensure https:// protocol for remote domains
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Remove trailing slash
  return url.replace(/\/$/, '');
}

export function getDocumentFileUrl(filePath?: string | null): string {
  if (!filePath || filePath === '#') return '#';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zisulmxcdhrsiyqyrfpf.supabase.co';
  const cleanPath = filePath.replace(/^documents\//, '').replace(/^\//, '');
  return `${supabaseUrl}/storage/v1/object/public/documents/${cleanPath}`;
}

export function formatCurrency(amount: number, currency: string = "NGN"): string {
  if (currency === "NGN") {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount).replace("NGN", "₦");
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || isNaN(Number(bytes))) return "2.4 MB";
  const units = ["B", "KB", "MB", "GB"];
  let size = Number(bytes);
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${(Number(size) || 0).toFixed(1)} ${units[unitIndex]}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
}
