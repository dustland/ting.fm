"use client"

import Link from "next/link"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "首页",
    href: "/",
    icon: Icons.home,
  },
  {
    title: "创建",
    href: "/create",
    icon: Icons.create,
  },
  {
    title: "发现",
    href: "/discover",
    icon: Icons.discover,
  },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" />
            <span className="font-bold">Ting.fm</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <nav className="flex items-center">
            <Button variant="ghost" size="icon">
              <Icons.settings className="h-4 w-4" />
              <span className="sr-only">设置</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
