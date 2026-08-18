/**
 * Chat Sanitizer & Anti-Disintermediation Engine
 * Protects platform commission & escrow safety by intercepting off-platform contacts:
 * - Nigerian & International Phone numbers (080, 090, 070, 081, +234...)
 * - Emails (gmail, yahoo, outlook...)
 * - Social handles / WhatsApp / Telegram invite links
 * - Bank account numbers
 */

export interface SanitizeResult {
  isBlocked: boolean;
  cleanText: string;
  warningMessage?: string;
  detectedType?: 'PHONE' | 'EMAIL' | 'LINK' | 'BANK_ACCOUNT';
}

const PHONE_REGEX = /(\+?234|0)[789][01]\d{8}|\b\d{4}[-\s]?\d{3}[-\s]?\d{4}\b|\b\d{11}\b/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const LINK_REGEX = /(https?:\/\/|www\.)[^\s]+|wa\.me\/[^\s]+|t\.me\/[^\s]+|chat\.whatsapp\.com\/[^\s]+/gi;
const BANK_REGEX = /\b\d{10}\b(?=.*(gtb|zenith|access|uba|kuda|first\s?bank|opay|palmpay|wema|stanbic))/gi;

export function sanitizeChatMessage(message: string): SanitizeResult {
  let text = message;
  let detectedType: SanitizeResult['detectedType'] = undefined;
  let isBlocked = false;

  if (PHONE_REGEX.test(text)) {
    isBlocked = true;
    detectedType = 'PHONE';
    text = text.replace(PHONE_REGEX, '[🔒 PHONE NUMBER BLOCKED]');
  }

  if (EMAIL_REGEX.test(text)) {
    isBlocked = true;
    detectedType = 'EMAIL';
    text = text.replace(EMAIL_REGEX, '[🔒 EMAIL ADDRESS BLOCKED]');
  }

  if (LINK_REGEX.test(text)) {
    isBlocked = true;
    detectedType = 'LINK';
    text = text.replace(LINK_REGEX, '[🔒 EXTERNAL LINK BLOCKED]');
  }

  if (BANK_REGEX.test(text)) {
    isBlocked = true;
    detectedType = 'BANK_ACCOUNT';
    text = text.replace(BANK_REGEX, '[🔒 BANK ACCOUNT BLOCKED]');
  }

  return {
    isBlocked,
    cleanText: text,
    detectedType,
    warningMessage: isBlocked
      ? '⚠️ For your security and 100% Escrow Money-Back Guarantee, sharing off-platform contact or payment details is prohibited.'
      : undefined,
  };
}
