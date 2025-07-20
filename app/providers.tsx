'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}