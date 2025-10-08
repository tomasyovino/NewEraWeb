'use client';

import Image from 'next/image';
import type { Locale } from '@/lib/types';
import { NEXT_PUBLIC_PAYPAL_URL } from '@/lib/constants';

export default function PaypalFab({ lang }: { lang: Locale }) {
  const href = NEXT_PUBLIC_PAYPAL_URL || '#';
  const isDisabled = !NEXT_PUBLIC_PAYPAL_URL;

  return (
    <a
      href={href}
      target={isDisabled ? undefined : '_blank'}
      rel={isDisabled ? undefined : 'noopener noreferrer'}
      className={`fab wiki-fab ${isDisabled ? 'fab-disabled' : ''}`}
      aria-label={lang === 'es' ? 'Abrir Paypal' : 'Open Paypal'}
      title={
        isDisabled
          ? (lang === 'es' ? 'Paypal: pronto' : 'Paypal: coming soon')
          : (lang === 'es' ? 'Abrir Paypal' : 'Open Paypal')
      }
      onClick={e => { if (isDisabled) e.preventDefault(); }}
    >
      {/* Asegúrate de que guide.svg use fill="currentColor" (o lo hiciste antes) */}
      <Image src="/images/guide.svg" alt="" width={22} height={22} aria-hidden />
      <span className="fab-label">{lang === 'es' ? 'Paypal' : 'Paypal'}</span>
    </a>
  );
}
