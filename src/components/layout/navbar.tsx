"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold text-lg">
          Sistemik Kartlar
        </Link>

        <nav className="flex items-center gap-4">
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
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    />
                  }
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/giris">
                <Button variant="ghost" size="sm">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/kayit">
                <Button size="sm">Kayıt Ol</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
