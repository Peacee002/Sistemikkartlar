"use client";

import { useCallback, useEffect, useState } from "react";
import { CardGrid } from "@/components/cards/card-grid";
import { CardUploadForm } from "@/components/cards/card-upload-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type CardItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  imageKey: string;
  category: string;
};

export default function CardsPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [open, setOpen] = useState(false);

  const loadCards = useCallback(async () => {
    const res = await fetch("/api/kartlar");
    if (res.ok) {
      setCards(await res.json());
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kart Yönetimi</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>Yeni Kart</DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Yeni Kart Oluştur</DialogTitle>
            </DialogHeader>
            <CardUploadForm
              onSuccess={() => {
                setOpen(false);
                loadCards();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <CardGrid cards={cards} onRefresh={loadCards} editable />
    </div>
  );
}
