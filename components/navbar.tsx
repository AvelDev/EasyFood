"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  Crown,
  Settings,
  ChevronDown,
  AppWindowMacIcon,
} from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  return (
    <nav className="bg-white border-b shadow-sm border-slate-200">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1
              className="text-2xl font-bold text-transparent cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:opacity-80 transition-opacity"
              onClick={() => router.push("/")}
            >
              EasyFood
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-20 h-8 rounded animate-pulse bg-slate-200"></div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">{user.displayName}</span>
                      {user.role === "admin" && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => router.push("/settings")}
                      className="flex items-center cursor-pointer gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Ustawienia Konta
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem
                        onClick={() => router.push("/settings/general")}
                        className="flex items-center cursor-pointer gap-2"
                      >
                        <AppWindowMacIcon className="w-4 h-4" />
                        Ustawienia Aplikacji
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center text-red-600 cursor-pointer gap-2 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Wyloguj się
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={handleSignIn}
                className="bg-[#4285f4] hover:bg-[#3367d6] text-white"
              >
                Zaloguj się
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
