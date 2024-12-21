"use client";

import { Icons } from "@/components/icons";
import { UserAuthForm } from "@/components/user-auth-form";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  return (
    <div className="container flex h-[calc(100vh-var(--navbar-height))] w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-20 w-20" />
          <h1 className="text-2xl font-semibold tracking-tight">欢迎回来</h1>
        </div>
        <UserAuthForm redirect={redirect} />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/auth/register"
            className="hover:text-brand underline underline-offset-4"
          >
            还没有账号？立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
