"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type CardItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string;
};

export function CardGrid({
  cards,
  onRefresh,
  editable = false,
}: {
  cards: CardItem[];
  onRefresh: () => void;
  editable?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <CardGridItem
          key={card.id}
          card={card}
          editable={editable}
          onRefresh={onRefresh}
        />
      ))}
      {cards.length === 0 && (
        <p className="col-span-full text-center text-muted-foreground py-8">
          Henüz kart yok
        </p>
      )}
    </div>
  );
}

function CardGridItem({
  card,
  editable,
  onRefresh,
}: {
  card: CardItem;
  editable: boolean;
  onRefresh: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [category, setCategory] = useState(card.category);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    const res = await fetch(`/api/kartlar/${card.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category }),
    });
    if (res.ok) {
      toast.success("Kart güncellendi");
      setEditOpen(false);
      onRefresh();
    } else {
      toast.error("Güncellenemedi");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Bu kartı silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/kartlar/${card.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Kart silindi");
      onRefresh();
    } else {
      toast.error("Silinemedi");
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        <img
          src={card.imageUrl}
          alt={card.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm truncate">{card.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Badge variant="secondary" className="text-xs">
          {card.category}
        </Badge>
      </CardContent>
      {editable && (
        <CardFooter className="p-3 pt-0 gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger
              render={<Button variant="outline" size="sm" className="flex-1" />}
            >
              Düzenle
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kart Düzenle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Başlık</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <Button onClick={handleUpdate} disabled={loading}>
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={handleDelete}
          >
            Sil
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
