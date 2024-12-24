"use client"

import Link from "next/link"
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthButton } from "@/components/auth-button";

const navItems = [
  {
    title: "首页",
    href: "/",
    icon: Icons.home,
  },
  {
    title: "创作",
    href: "/pods",
    icon: Icons.podcast,
  },
  {
    title: "发现",
    href: "/discover",
    icon: Icons.discover,
  },
];

export function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b before:absolute before:inset-0 before:bg-background/95 before:-z-10 before:backdrop-blur supports-[backdrop-filter]:before:bg-background/60">
      <div className="container relative flex h-10 items-center justify-between px-2">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="h-5 w-5" />
            <span className="hidden font-bold sm:inline-block">Ting.fm</span>
          </Link>
          <nav className="hidden sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 w-full items-center border-b-2 justify-center gap-2 px-4 text-sm font-medium transition-colors hover:text-primary",
                  isActive(item.href)
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="flex sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Icons.menu className="h-5 w-5" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex w-full items-center gap-2 py-2",
                      isActive(item.href) && "text-primary font-medium"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Settings Button */}
        <div className="flex items-center gap-2">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
