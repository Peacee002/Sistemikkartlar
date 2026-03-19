import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/50">
        <div className="text-center space-y-6 px-4 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-primary to-[oklch(0.41_0.06_255)] bg-clip-text text-transparent">
            Sistemik Kartlar
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Etkileşimli kartlarla çalışma odaları oluşturun, davet bağlantıları
            paylaşın ve gerçek zamanlı olarak birlikte çalışın.
          </p>

          {/* Animation placeholder */}
          <div className="w-full max-w-lg mx-auto aspect-video rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
            <p className="text-muted-foreground text-sm">Animasyon buraya eklenecek</p>
          </div>

          {session?.user ? (
            <div className="flex gap-3 justify-center">
              {(session.user.role === "ADMIN" ||
                session.user.role === "TEACHER") && (
                <Link href="/odalar">
                  <Button size="lg">Odalarım</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex gap-3 justify-center">
              <Link href="/kayit">
                <Button size="lg">Başla</Button>
              </Link>
              <Link href="/giris">
                <Button variant="outline" size="lg">
                  Giriş Yap
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
