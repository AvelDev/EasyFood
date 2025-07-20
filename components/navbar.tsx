'use client';

import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { User, LogOut, Crown } from 'lucide-react';
import { useAuthContext } from '@/contexts/auth-context';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

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
            {loading ? (
              <div className="animate-pulse bg-slate-200 h-8 w-20 rounded"></div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-700">
                    {user.displayName}
                  </span>
                  {user.role === 'admin' && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleSignIn}
                className="bg-[#4285f4] hover:bg-[#3367d6] text-white"
              >
                Sign in with Google
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}