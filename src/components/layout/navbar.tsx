"use client";

import { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isTeacherOrAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="bg-primary text-primary-foreground shadow-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold text-lg">
          Sistemik Kartlar
        </Link>

        <nav className="flex items-center gap-4">
          {session?.user ? (
            <>
              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-4">
                {isTeacherOrAdmin && (
                  <Link href="/odalar">
                    <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                      Odalar
                    </Button>
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/panel/kartlar">
                    <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                      Yönetim
                    </Button>
                  </Link>
                )}
              </div>

              {/* Avatar dropdown — visible at all sizes */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full hover:bg-primary-foreground/10"
                    />
                  }
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">
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

              {/* Mobile hamburger — only when there are nav links to show */}
              {isTeacherOrAdmin && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={() => setMobileOpen(true)}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                  <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side="right">
                      <SheetHeader>
                        <SheetTitle>Menü</SheetTitle>
                      </SheetHeader>
                      <nav className="flex flex-col gap-2 px-4">
                        <Link href="/odalar" onClick={() => setMobileOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            Odalar
                          </Button>
                        </Link>
                        {isAdmin && (
                          <Link href="/panel/kartlar" onClick={() => setMobileOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">
                              Yönetim
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-destructive"
                          onClick={() => {
                            setMobileOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                        >
                          Çıkış Yap
                        </Button>
                      </nav>
                    </SheetContent>
                  </Sheet>
                </>
              )}
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/giris">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/kayit">
                <Button size="sm" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
