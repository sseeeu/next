// app/components/Navbar.js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname(); // To get the current path

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold mb-2 md:mb-0">
          My Services
        </Link>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          {/* Active link class */}
          <Link href="/" className={`text-white ${pathname === "/" ? "underline" : ""}`}>
            Home
          </Link>
          <Link href="/register" className={`text-white ${pathname === "/register" ? "underline" : ""}`}>
            Register
          </Link>
          <Link href="/login" className={`text-white ${pathname === "/login" ? "underline" : ""}`}>
            Login
          </Link>
          <Link href="/dashboard" className={`text-white ${pathname === "/dashboard" ? "underline" : ""}`}>
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
