'use client';
import { getInitialLocale } from '@/utils/translations/getInitialLocale';
import { Spinner } from '@repo/ui/components/spinner';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/[lang]', `/${getInitialLocale()}`);
  });

  return (
    <div className="ui-h-screen ui-w-full ui-flex ui-items-center ui-justify-center">
      <Spinner className="ui-h-8 ui-w-8" />
    </div>
  );
}
