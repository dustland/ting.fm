import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { UserAuthForm } from "@/components/user-auth-form";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "注册 - Ting.fm",
  description: "创建您的账户",
};

export default function RegisterPage() {
  return (
    <div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8"
        )}
      >
        返回
      </Link>
      <div className="hidden h-full flex-col bg-muted p-10 dark:border-r lg:flex">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-6">
            <Icons.logo className="mx-auto h-24 w-24" />
            <div>
              <h1 className="text-4xl font-bold">Ticos</h1>
              <p className="text-lg mt-2">Embodied AI for Humanoid Robotics</p>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">创建账户</h1>
            <p className="text-sm text-muted-foreground">
              使用您的 Google 账户注册
            </p>
          </div>
          <UserAuthForm />

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
