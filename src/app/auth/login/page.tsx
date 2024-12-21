import { Icons } from "@/components/icons";
import { UserAuthForm } from "@/components/user-auth-form";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "登录 - Ting.fm",
  description: "登录您的账户",
};

function LoginContent() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-20 w-20" />
        <h1 className="text-2xl font-semibold tracking-tight">欢迎回来</h1>
        <p className="text-sm text-muted-foreground">
          使用您的 Google 账户登录
        </p>
      </div>
      <UserAuthForm />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Suspense>
        <LoginContent />
      </Suspense>
    </div>
  );
}
