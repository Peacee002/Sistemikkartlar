"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { toast } from "sonner";

export function CardUploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Genel");
  const [imageUrl, setImageUrl] = useState("");
  const [imageKey, setImageKey] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Lütfen bir resim yükleyin");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/kartlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, imageUrl, imageKey, category }),
    });

    if (res.ok) {
      toast.success("Kart oluşturuldu");
      setTitle("");
      setDescription("");
      setCategory("Genel");
      setImageUrl("");
      setImageKey("");
      onSuccess();
    } else {
      toast.error("Kart oluşturulamadı");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Başlık</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Kart başlığı"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opsiyonel açıklama"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Genel"
        />
      </div>
      <div className="space-y-2">
        <Label>Resim</Label>
        {imageUrl ? (
          <div className="relative">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-md border"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setImageUrl("");
                setImageKey("");
              }}
            >
              Değiştir
            </Button>
          </div>
        ) : (
          <UploadButton<OurFileRouter, "cardImage">
            endpoint="cardImage"
            onClientUploadComplete={(res) => {
              if (res?.[0]) {
                setImageUrl(res[0].ufsUrl);
                setImageKey(res[0].key);
                toast.success("Resim yüklendi");
              }
            }}
            onUploadError={(error) => {
              toast.error(`Yükleme hatası: ${error.message}`);
            }}
          />
        )}
      </div>
      <Button type="submit" disabled={loading || !imageUrl}>
        {loading ? "Oluşturuluyor..." : "Kart Oluştur"}
      </Button>
    </form>
  );
}
