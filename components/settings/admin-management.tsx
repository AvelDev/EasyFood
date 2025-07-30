"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  Search,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateUserRole, getUser } from "@/lib/admin-settings";
import { User } from "@/types";

interface AdminManagementProps {
  users: User[];
  onUserUpdate: () => void;
}

export function AdminManagement({ users, onUserUpdate }: AdminManagementProps) {
  const [searchUID, setSearchUID] = useState("");
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedUID, setCopiedUID] = useState<string | null>(null);
  const { toast } = useToast();

  const admins = users.filter((user) => user.role === "admin");

  const searchUser = async () => {
    if (!searchUID.trim()) {
      toast({
        title: "Błąd",
        description: "Wprowadź UID użytkownika do wyszukania.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setFoundUser(null);

    try {
      const user = await getUser(searchUID.trim());
      if (user) {
        setFoundUser(user);
      } else {
        toast({
          title: "Nie znaleziono",
          description: "Użytkownik o podanym UID nie istnieje.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wyszukać użytkownika.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: "admin" | "user") => {
    setIsUpdating(true);

    try {
      await updateUserRole(uid, newRole);

      toast({
        title: "Sukces",
        description: `Pomyślnie ${
          newRole === "admin"
            ? "nadano rangę administratora"
            : "odebrano rangę administratora"
        }.`,
      });

      setFoundUser(null);
      setSearchUID("");
      setIsDialogOpen(false);
      onUserUpdate();
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zmienić roli użytkownika.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const copyUID = async (uid: string) => {
    try {
      await navigator.clipboard.writeText(uid);
      setCopiedUID(uid);
      toast({
        title: "Skopiowano",
        description: "UID został skopiowany do schowka.",
      });

      // Reset after 2 seconds
      setTimeout(() => setCopiedUID(null), 2000);
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się skopiować UID.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Obecni Administratorzy
          </CardTitle>
          <CardDescription>
            Lista wszystkich użytkowników z rolą administratora
          </CardDescription>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Brak administratorów w systemie</p>
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.uid}
                  className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 border-yellow-200"
                >
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-900">
                        {admin.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-yellow-100 px-2 py-1 rounded">
                          {admin.uid}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyUID(admin.uid)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedUID === admin.uid ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-yellow-500">
                      Administrator
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          <UserMinus className="w-4 h-4" />
                          Usuń rangę
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Odebrać rangę administratora?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Czy na pewno chcesz odebrać rangę administratora
                            użytkownikowi <strong>{admin.name}</strong>? Ta
                            akcja zmieni jego rolę na zwykłego użytkownika.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anuluj</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRoleChange(admin.uid, "user")}
                            disabled={isUpdating}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isUpdating ? "Usuwanie..." : "Usuń rangę"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            Nadaj rangę administratora
          </CardTitle>
          <CardDescription>
            Wyszukaj użytkownika po UID i nadaj mu rangę administratora
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Shield className="w-4 h-4" />
                Dodaj administratora
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Dodaj nowego administratora</DialogTitle>
                <DialogDescription>
                  Wprowadź UID użytkownika, któremu chcesz nadać rangę
                  administratora.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="uid">UID użytkownika</Label>
                  <div className="flex gap-2">
                    <Input
                      id="uid"
                      placeholder="Wprowadź UID użytkownika..."
                      value={searchUID}
                      onChange={(e) => setSearchUID(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchUser()}
                    />
                    <Button
                      onClick={searchUser}
                      disabled={isSearching || !searchUID.trim()}
                      variant="outline"
                      size="icon"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {foundUser && (
                  <div className="p-3 border rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{foundUser.name}</p>
                        <p className="text-sm text-slate-600">
                          Obecna rola:{" "}
                          <Badge
                            variant={
                              foundUser.role === "admin"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {foundUser.role === "admin"
                              ? "Administrator"
                              : "Użytkownik"}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setFoundUser(null);
                    setSearchUID("");
                  }}
                >
                  Anuluj
                </Button>
                {foundUser && foundUser.role !== "admin" && (
                  <Button
                    onClick={() => handleRoleChange(foundUser.uid, "admin")}
                    disabled={isUpdating}
                    className="gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    {isUpdating ? "Nadawanie..." : "Nadaj rangę admin"}
                  </Button>
                )}
                {foundUser && foundUser.role === "admin" && (
                  <Button
                    onClick={() => handleRoleChange(foundUser.uid, "user")}
                    disabled={isUpdating}
                    variant="destructive"
                    className="gap-2"
                  >
                    <UserMinus className="w-4 h-4" />
                    {isUpdating ? "Odbieranie..." : "Odbierz rangę admin"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
