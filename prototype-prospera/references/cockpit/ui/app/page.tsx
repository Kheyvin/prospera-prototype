'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect client-side (funciona bajo output:'export' — sin esto un redirect()
// server-side no es viable en export estático). Única página hoy: /negocio.
export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/negocio');
  }, [router]);
  return null;
}
