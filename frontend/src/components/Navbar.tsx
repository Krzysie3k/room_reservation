"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser({ name: `${parsed.name} ${parsed.surname}` });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <nav className="w-full flex justify-between items-center px-6 py-3 bg-purple-800 text-white shadow-md">
      <div className="font-semibold">Zalogowany: {user?.name}</div>

      <div className="flex gap-4">
        <NavLink href="/schedule" active={pathname === "/schedule"}>
          📅 Kalendarz
        </NavLink>
        <NavLink href="/dashboard" active={pathname === "/dashboard"}>
          📊 Dashboard
        </NavLink>
        <NavLink href="/reports" active={pathname === "/reports"}>
          📈 Raporty
        </NavLink>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded"
      >
        Wyloguj się
      </button>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "px-3 py-1 rounded hover:bg-purple-700",
        active && "bg-purple-700 font-bold underline"
      )}
    >
      {children}
    </Link>
  );
}
