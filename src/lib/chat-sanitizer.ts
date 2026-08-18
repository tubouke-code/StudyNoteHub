/**
 * Comprehensive Chat Sanitizer & Escrow Protection Engine
 * Detects & blocks:
 * 1. 10-digit Nigerian NUBAN Bank Account numbers (with/without dashes, spaces, or bank names)
 * 2. Bank names (GTB, Kuda, Opay, Palmpay, Access, Zenith, Moniepoint, etc.) + numbers
 * 3. 11-digit Nigerian Phone numbers (080, 090, 070, 081, +234, etc.)
 * 4. Email addresses
 * 5. WhatsApp, Telegram, and external URL links
 * 6. Social media handles (@ig, @telegram, etc.)
 */

export interface SanitizeResult {
  isBlocked: boolean;
  cleanText: string;
  warningMessage?: string;
  detectedType?: 'PHONE' | 'EMAIL' | 'LINK' | 'BANK_ACCOUNT';
  blockedReasons: string[];
}

// 1. Phone number patterns (handles +234, 080, 090, 070, 081 with spaces/dashes/dots)
const PHONE_PATTERNS = [
  /(\+?234|0)[789][01][\s.-]?\d{3,4}[\s.-]?\d{4}/gi,
  /\b0[789][01]\d{8}\b/g,
  /\b\+234\d{10}\b/g,
];

// 2. Email addresses
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

// 3. WhatsApp, Telegram, Social Links, and Domains
const LINK_PATTERNS = [
  /(https?:\/\/|www\.)[^\s]+/gi,
  /\b(wa\.me|t\.me|chat\.whatsapp\.com|telegram\.me)\/[^\s]+/gi,
  /\b(whatsapp|telegram|ig|instagram|twitter|snapchat)[\s:@]+[a-zA-Z0-9_.-]+/gi,
];

// 4. Nigerian Bank Keywords
const BANK_KEYWORDS = [
  'gtb', 'gtbank', 'guaranty trust', 'zenith', 'access', 'access bank',
  'uba', 'united bank for africa', 'first bank', 'firstbank', 'kuda', 'kuda bank',
  'opay', 'palmpay', 'palm pay', 'moniepoint', 'monie point', 'wema', 'alat',
  'stanbic', 'fidelity', 'fcmb', 'sterling', 'polaris', 'union bank',
  'keystone', 'ecobank', 'jaiz', 'taj bank', 'vfd', 'rubies', 'sparkle',
  'acct', 'account', 'nuban', 'acc no', 'acc num', 'account number', 'transfer to', 'send to'
];

// 5. 10-Digit NUBAN Account Pattern (e.g. 0123456789, 012 345 6789, 012-345-6789)
const NUBAN_STANDALONE_REGEX = /\b\d{10}\b/g;
const NUBAN_FORMATTED_REGEX = /\b\d{3}[-\s.]\d{3}[-\s.]\d{4}\b|\b\d{4}[-\s.]\d{3}[-\s.]\d{3}\b|\b\d{5}[-\s.]\d{5}\b/g;

export function sanitizeChatMessage(message: string): SanitizeResult {
  let text = message;
  const blockedReasons: string[] = [];
  let detectedType: SanitizeResult['detectedType'] = undefined;
  let isBlocked = false;

  const lowerText = message.toLowerCase();

  // Check for Bank Names / Account keywords combination
  const hasBankKeyword = BANK_KEYWORDS.some((kw) => lowerText.includes(kw));

  // Check 1: 10-digit NUBAN account number (standalone or with spaces/dashes)
  if (NUBAN_STANDALONE_REGEX.test(text) || NUBAN_FORMATTED_REGEX.test(text) || hasBankKeyword) {
    // If it has a 10-digit sequence OR bank keyword + numbers
    const containsAnyNumbers = /\d{6,}/.test(text.replace(/[\s.-]/g, ''));
    if (containsAnyNumbers || hasBankKeyword) {
      isBlocked = true;
      detectedType = 'BANK_ACCOUNT';
      blockedReasons.push('Bank Account / Off-Platform Payment details detected');
      
      // Mask all 8-10 digit numbers
      text = text.replace(/\b\d{8,11}\b/g, '[🔒 BANK ACCOUNT BLOCKED]');
      text = text.replace(NUBAN_FORMATTED_REGEX, '[🔒 BANK ACCOUNT BLOCKED]');
      
      // Also mask if bank keywords are directly used
      BANK_KEYWORDS.forEach((kw) => {
        const kwRegex = new RegExp(`\\b${kw}\\b`, 'gi');
        text = text.replace(kwRegex, '[🔒 BANK]');
      });
    }
  }

  // Check 2: Phone numbers
  for (const pattern of PHONE_PATTERNS) {
    if (pattern.test(text)) {
      isBlocked = true;
      detectedType = detectedType || 'PHONE';
      blockedReasons.push('Direct phone number detected');
      text = text.replace(pattern, '[🔒 PHONE NUMBER BLOCKED]');
    }
  }

  // Check 3: Emails
  if (EMAIL_PATTERN.test(text)) {
    isBlocked = true;
    detectedType = detectedType || 'EMAIL';
    blockedReasons.push('Email address detected');
    text = text.replace(EMAIL_PATTERN, '[🔒 EMAIL ADDRESS BLOCKED]');
  }

  // Check 4: External links & Social handles
  for (const pattern of LINK_PATTERNS) {
    if (pattern.test(text)) {
      isBlocked = true;
      detectedType = detectedType || 'LINK';
      blockedReasons.push('External social link / contact handle detected');
      text = text.replace(pattern, '[🔒 EXTERNAL LINK BLOCKED]');
    }
  }

  return {
    isBlocked,
    cleanText: text,
    detectedType,
    blockedReasons,
    warningMessage: isBlocked
      ? '⚠️ SECURITY ALERT: Bank accounts, phone numbers, and external contact details are blocked to protect your 100% Escrow Money-Back Guarantee.'
      : undefined,
  };
}
