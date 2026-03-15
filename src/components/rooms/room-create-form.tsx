"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function RoomCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/odalar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description"),
      }),
    });

    if (res.ok) {
      const room = await res.json();
      toast.success("Oda oluşturuldu");
      router.push(`/odalar/${room.id}`);
    } else {
      toast.error("Oda oluşturulamadı");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Oda Adı</Label>
        <Input id="name" name="name" required placeholder="Oda adı" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Opsiyonel açıklama"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Oluşturuluyor..." : "Oda Oluştur"}
      </Button>
    </form>
  );
}
