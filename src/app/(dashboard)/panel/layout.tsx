import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex gap-2 mb-6">
        <Link href="/panel/kartlar">
          <Button variant="outline" size="sm">
            Kartlar
          </Button>
        </Link>
        <Link href="/panel/kullanicilar">
          <Button variant="outline" size="sm">
            Kullanıcılar
          </Button>
        </Link>
      </div>
      {children}
    </div>
  );
}
