import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <span className="font-bold text-lg">Sistemik Kartlar</span>
          <nav className="flex gap-2">
            {session?.user ? (
              <>
                {(session.user.role === "ADMIN" ||
                  session.user.role === "TEACHER") && (
                  <Link href="/odalar">
                    <Button variant="ghost" size="sm">
                      Odalar
                    </Button>
                  </Link>
                )}
                {session.user.role === "ADMIN" && (
                  <Link href="/panel/kartlar">
                    <Button variant="ghost" size="sm">
                      Yönetim
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/giris">
                  <Button variant="ghost" size="sm">
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/kayit">
                  <Button size="sm">Kayıt Ol</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Sistemik Kartlar
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Etkileşimli kartlarla çalışma odaları oluşturun, davet bağlantıları
            paylaşın ve gerçek zamanlı olarak birlikte çalışın.
          </p>
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
