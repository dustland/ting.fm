"use client";
import { UserAuthForm } from "@/components/user-auth-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="container flex h-[calc(100vh-var(--navbar-height))] w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">创建账户</h1>
            <p className="text-sm text-muted-foreground">
              使用您的 Google 账户注册
            </p>
          </div>
          <UserAuthForm isSignUp />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              href="/auth/login"
              className="hover:text-brand underline underline-offset-4"
            >
              已有账户？立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
