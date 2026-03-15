"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [state, setState] = useState<"loading" | "joining" | "error" | "done">(
    "loading"
  );
  const [error, setError] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      // Redirect to login with callback
      router.push(`/giris?callbackUrl=/davet/${params.inviteCode}`);
      return;
    }

    setState("joining");
    fetch(`/api/davet/${params.inviteCode}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setRoomName(data.roomName);
          setRoomId(data.roomId);
          setState("done");
        } else {
          const data = await res.json();
          setError(data.error || "Bir hata oluştu");
          setState("error");
        }
      })
      .catch(() => {
        setError("Bağlantı hatası");
        setState("error");
      });
  }, [session, status, params.inviteCode, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {state === "loading" || state === "joining"
              ? "Odaya katılınıyor..."
              : state === "error"
              ? "Hata"
              : `${roomName} odasına katıldınız!`}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {state === "error" && (
            <>
              <p className="text-destructive">{error}</p>
              <Link href="/">
                <Button variant="outline">Ana Sayfa</Button>
              </Link>
            </>
          )}
          {state === "done" && (
            <Link href={`/oda/${roomId}`}>
              <Button>Odaya Git</Button>
            </Link>
          )}
          {(state === "loading" || state === "joining") && (
            <p className="text-muted-foreground">Lütfen bekleyin...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
