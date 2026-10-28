import { WHATSAPP_NUMBER } from '@/lib/env';

/** wa.me link with a prefilled, URL-encoded message (the same helper as Eclipse-Web's `lib/whatsapp.ts`). */
export function whatsappUrl(text?: string, number: string = WHATSAPP_NUMBER): string {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
