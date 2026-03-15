"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "TEACHER" | "USER";
  createdAt: string;
};

const roleLabels = {
  ADMIN: "Admin",
  TEACHER: "Öğretmen",
  USER: "Kullanıcı",
};

const roleColors = {
  ADMIN: "destructive" as const,
  TEACHER: "default" as const,
  USER: "secondary" as const,
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/kullanicilar");
    if (res.ok) {
      setUsers(await res.json());
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleRoleChange(userId: string, newRole: string | null) {
    if (!newRole) return;
    const res = await fetch(`/api/kullanicilar/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      toast.success("Rol güncellendi");
      loadUsers();
    } else {
      toast.error("Güncellenemedi");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Ad</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Rol</th>
              <th className="text-left p-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-3">{user.name}</td>
                <td className="p-3 text-muted-foreground">{user.email}</td>
                <td className="p-3">
                  <Badge variant={roleColors[user.role]}>
                    {roleLabels[user.role]}
                  </Badge>
                </td>
                <td className="p-3">
                  <Select
                    value={user.role}
                    onValueChange={(val: string | null) =>
                      handleRoleChange(user.id, val)
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="TEACHER">Öğretmen</SelectItem>
                      <SelectItem value="USER">Kullanıcı</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
