'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Crown } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Restaurant Voting
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="animate-pulse bg-slate-200 h-8 w-20 rounded"></div>
            ) : session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-700">
                    {session.user?.name}
                  </span>
                  {session.user?.role === 'admin' && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => signIn('discord')}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
              >
                Sign in with Discord
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}