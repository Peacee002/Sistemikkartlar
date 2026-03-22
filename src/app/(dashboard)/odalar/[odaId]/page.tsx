"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";

type Card = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
};

type RoomDetail = {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  isActive: boolean;
  members: { user: { id: string; name: string; email: string } }[];
  roomCards: { card: Card }[];
};

export default function RoomSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(
    new Set()
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const loadRoom = useCallback(async () => {
    const res = await fetch(`/api/odalar/${params.odaId}`);
    if (res.ok) {
      const data = await res.json();
      setRoom(data);
      setName(data.name);
      setDescription(data.description || "");
      setSelectedCardIds(
        new Set(data.roomCards.map((rc: { card: Card }) => rc.card.id))
      );
    }
  }, [params.odaId]);

  const loadCards = useCallback(async () => {
    const res = await fetch("/api/kartlar");
    if (res.ok) {
      setAllCards(await res.json());
    }
  }, []);

  useEffect(() => {
    loadRoom();
    loadCards();
  }, [loadRoom, loadCards]);

  async function handleSaveDetails() {
    setSaving(true);
    const res = await fetch(`/api/odalar/${params.odaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      toast.success("Oda güncellendi");
      loadRoom();
    } else {
      toast.error("Güncellenemedi");
    }
    setSaving(false);
  }

  async function handleSaveCards() {
    const res = await fetch(`/api/odalar/${params.odaId}/kartlar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardIds: Array.from(selectedCardIds) }),
    });
    if (res.ok) {
      toast.success("Kartlar güncellendi");
      loadRoom();
    } else {
      toast.error("Güncellenemedi");
    }
  }

  async function handleRegenerateInvite() {
    const res = await fetch(`/api/odalar/${params.odaId}/davet`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success("Davet linki yenilendi");
      loadRoom();
    }
  }

  async function handleDelete() {
    if (!confirm("Bu odayı silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/odalar/${params.odaId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Oda silindi");
      router.push("/odalar");
    }
  }

  function toggleCard(cardId: string) {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }

  if (!room) return <p className="text-muted-foreground">Yükleniyor...</p>;

  const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/davet/${room.inviteCode}`;

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">{room.name}</h1>
        <Link href={`/oda/${room.id}`}>
          <Button>Odaya Git</Button>
        </Link>
      </div>

      {/* Room details */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Oda Bilgileri</h2>
        <div className="space-y-2">
          <Label>Oda Adı</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Açıklama</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button onClick={handleSaveDetails} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </section>

      <Separator />

      {/* Invite link */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Davet Linki</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input value={inviteLink} readOnly className="min-w-0" />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                toast.success("Link kopyalandı");
              }}
            >
              Kopyala
            </Button>
            <Button variant="outline" onClick={handleRegenerateInvite}>
              Yenile
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* Card selection */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Kartlar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allCards.map((card) => (
            <label
              key={card.id}
              className="flex items-start gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted/50"
            >
              <Checkbox
                checked={selectedCardIds.has(card.id)}
                onCheckedChange={() => toggleCard(card.id)}
              />
              <div className="flex gap-2 min-w-0">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{card.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {card.category}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>
        <Button onClick={handleSaveCards}>Kartları Kaydet</Button>
      </section>

      <Separator />

      {/* Members */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Üyeler</h2>
        <div className="space-y-2">
          {room.members.map((m) => (
            <div key={m.user.id} className="flex items-center gap-2">
              <Badge variant="secondary">{m.user.name}</Badge>
              <span className="text-sm text-muted-foreground">
                {m.user.email}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Danger zone */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-destructive">
          Tehlikeli Bölge
        </h2>
        <Button variant="destructive" onClick={handleDelete}>
          Odayı Sil
        </Button>
      </section>
    </div>
  );
}
