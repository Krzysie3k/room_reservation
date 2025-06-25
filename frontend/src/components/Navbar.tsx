"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { FaCalendarDay, FaChartBar, FaTable } from "react-icons/fa";
import { RiAdminFill, RiLogoutCircleLine } from "react-icons/ri";
import { FaUserGraduate } from "react-icons/fa6";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.name && parsed.surname) {
        setUser({ name: `${parsed.name} ${parsed.surname}` });
      }
    } catch (e) {
      console.error("Błąd parsowania user z localStorage:", e);
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <nav className="w-full flex justify-between items-center px-4  bg-white border-b shadow-sm">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/sanspace_logo.png"
          alt="Logo SanSpace"
          width={50}
          height={50}
        />
      </Link>

      {/* Menu */}
      <div className="flex gap-8">
        <NavLink
          href="/schedule"
          active={pathname === "/schedule"}
          icon={<FaCalendarDay size={20} />}
        >
          Kalendarz
        </NavLink>
        <NavLink
          href="/dashboard"
          active={pathname === "/dashboard"}
          icon={<FaChartBar size={20} />}
        >
          Dashboard
        </NavLink>
        <NavLink
          href="/reports"
          active={pathname === "/reports"}
          icon={<FaTable size={20} />}
        >
          Raporty
        </NavLink>
        <NavLink
          href="/admin"
          active={pathname === "/admin"}
          icon={<RiAdminFill size={20} />}
        >
          Admin
        </NavLink>
      </div>

      {/* Użytkownik i wylogowanie */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-blue-950 hover:text-blue-900">
          <FaUserGraduate size={20} />
          <span className="hidden sm:inline">{user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-blue-950 hover:text-red-800"
          title="Wyloguj się"
        >
          <RiLogoutCircleLine size={20} />
        </button>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
  icon,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex flex-col items-center text-xs text-gray-200 hover:text-blue-950",
        active && " text-gray-700"
      )}
    >
      {icon}
      <span className="hidden sm:block text-[10px]">{children}</span>
    </Link>
  );
}
