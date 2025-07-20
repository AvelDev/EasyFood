"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Users,
  Crown,
  User as UserIcon,
  Calendar,
  Filter,
  Download,
} from "lucide-react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllUsers } from "@/lib/admin-settings";

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Loading users...");
      const usersData = await getAllUsers();
      console.log("Users loaded:", usersData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować listy użytkowników.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    let filtered = users;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.uid.toLowerCase().includes(query)
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter]);

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Nie określono";
    return new Intl.DateTimeFormat("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const exportUsers = () => {
    // Simple CSV export
    const headers = [
      "UID",
      "Nazwa",
      "Rola",
      "Data utworzenia",
      "Polityka prywatności",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredUsers.map((user) =>
        [
          user.uid,
          `"${user.name}"`,
          user.role,
          user.createdAt ? user.createdAt.toISOString() : "",
          user.privacyPolicyAccepted ? "Zaakceptowana" : "Nie zaakceptowana",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `users_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Sukces",
      description: "Lista użytkowników została wyeksportowana.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-slate-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Zarządzanie użytkownikami</h3>
          <p className="text-sm text-slate-600">
            Przegląd wszystkich użytkowników aplikacji i ich statusów.
          </p>
        </div>
        <Button onClick={exportUsers} className="gap-2">
          <Download className="w-4 h-4" />
          Eksportuj CSV
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-900">{users.length}</p>
              <p className="text-sm text-blue-700">Wszyscy użytkownicy</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {users.filter((u) => u.role === "admin").length}
              </p>
              <p className="text-sm text-purple-700">Administratorzy</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-900">
                {users.filter((u) => u.role === "user").length}
              </p>
              <p className="text-sm text-green-700">Zwykli użytkownicy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Szukaj po nazwie lub UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(value: "all" | "admin" | "user") =>
            setRoleFilter(value)
          }
        >
          <SelectTrigger className="w-48">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie role</SelectItem>
            <SelectItem value="admin">Administratorzy</SelectItem>
            <SelectItem value="user">Użytkownicy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          {users.length === 0 ? (
            <div>
              <p>Brak użytkowników w systemie</p>
              <p className="text-sm">
                Zaloguj się jako pierwszy użytkownik, aby pojawić się na liście
              </p>
            </div>
          ) : (
            <div>
              <p>Brak użytkowników spełniających kryteria</p>
              {searchQuery && (
                <p className="text-sm">Spróbuj zmienić kryteria wyszukiwania</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Użytkownik</TableHead>
                <TableHead>UID</TableHead>
                <TableHead>Rola</TableHead>
                <TableHead>Data utworzenia</TableHead>
                <TableHead>Polityka prywatności</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.role === "admin" ? (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      {user.uid}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role === "admin" ? "Administrator" : "Użytkownik"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(user.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge
                        variant={
                          user.privacyPolicyAccepted ? "default" : "destructive"
                        }
                        className="text-xs"
                      >
                        {user.privacyPolicyAccepted
                          ? "Zaakceptowana"
                          : "Nie zaakceptowana"}
                      </Badge>
                      {user.privacyPolicyAcceptedAt && (
                        <p className="text-xs text-slate-500">
                          {formatDate(user.privacyPolicyAcceptedAt)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="text-sm text-slate-500 text-center">
        Wyświetlane {filteredUsers.length} z {users.length} użytkowników
      </div>
    </div>
  );
}
