"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { userAuthSchema } from "@/lib/validations/auth";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthApiError, AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  redirect?: string;
  isSignUp?: boolean;
}
type FormData = z.infer<typeof userAuthSchema>;

export function UserAuthForm({
  className,
  redirect,
  isSignUp = false,
  ...props
}: UserAuthFormProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [isResendingVerification, setIsResendingVerification] =
    React.useState<boolean>(false);
  const [showVerificationPrompt, setShowVerificationPrompt] =
    React.useState<boolean>(false);
  const router = useRouter();

  const searchParams = React.useMemo(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  }, []);

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const { error } = await signUp(data.email, data.password);
        if (error) {
          handleAuthError(error);
        } else {
          setShowVerificationPrompt(true);
          toast({
            title: "Account created",
            description: "Please check your email to confirm your account.",
          });
        }
      } else {
        console.log("Attempting sign in...", { email: data.email }); // 添加日志
        // Sign in
        const { error, data: signInData } = await signIn(
          data.email,
          data.password
        );

        if (error) {
          console.log("Form: Sign in returned error:", error);
          handleAuthError(error as AuthError);
        } else if (signInData?.user) {
          const redirectUrl = redirect || searchParams?.get("next") || "/";
          console.log("Form: Sign in successful, user:", {
            id: signInData.user.id,
            email: signInData.user.email,
            redirectUrl,
          });

          // Wait a moment for the session to be fully established
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Force a hard navigation to trigger the middleware
          window.location.href = redirectUrl;
        } else {
          console.warn("Sign in completed but no user data returned"); // 添加日志
          toast({
            title: "Failed to sign in",
            description: "Unable to complete sign in. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Unexpected error in form submission:", error); // 添加日志
      handleAuthError(error as AuthError);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAuthError = async (error: AuthError) => {
    console.error("Auth error details:", {
      status: error.status,
      message: error.message,
      name: error.name,
    });

    if (error instanceof AuthApiError) {
      if (
        error.status === 400 &&
        (error.message.includes("Invalid Refresh Token") ||
          error.message.includes("Already Used"))
      ) {
        console.log("Handling refresh token error...");
        const supabase = await createClient();
        supabase.auth.signOut().then(() => {
          console.log("User signed out due to token error");
          router.push("/auth/login");
        });
      }
    }

    toast({
      title: "Authentication error",
      description: error.message || "An error occurred during authentication",
      variant: "destructive",
    });
  };

  const handleOAuthSignIn = async (provider: "google") => {
    try {
      setIsGoogleLoading(true);

      const supabase = await createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${
            window.location.origin
          }/auth/callback?next=${encodeURIComponent(redirect ?? "/")}`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      toast({
        title: "登录失败",
        description: `使用${
          provider === "google" ? "谷歌" : "GitHub"
        }登录失败，请重试。`,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    const supabase = await createClient();
    await supabase.auth
      .resend({
        type: "signup",
        email: getValues("email"),
      })
      .then(() => {
        toast({
          title: "Verification email sent",
          description: "Please check your email to confirm your account.",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to resend",
          description: "Failed to resend verification email. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsResendingVerification(false);
      });
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {showVerificationPrompt ? (
        <Card className="max-w-full mx-auto">
          <CardHeader className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">验证您的邮箱</h2>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-red-500 font-semibold mb-2">您的邮箱尚未验证</p>
            <p className="text-gray-600">
              我们已经发送了一封验证邮件到您的邮箱。请查收并点击链接完成验证。
            </p>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4">
            <Button onClick={handleResendVerification} variant="outline">
              {isResendingVerification && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              重新发送验证邮件
            </Button>
            <p className="text-sm text-gray-500 text-center">
              没有收到邮件？请检查垃圾邮件文件夹或点击上方按钮重新发送。
            </p>
          </CardFooter>
        </Card>
      ) : (
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="email">
                  邮箱
                </Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...register("email")}
                />
                {errors?.email && (
                  <p className="px-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="password">
                  密码
                </Label>
                <Input
                  id="password"
                  placeholder="密码"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...register("password")}
                />
                {errors?.password && (
                  <p className="px-1 text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSignUp ? "注册" : "登录"}
              </Button>
            </div>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或者使用
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}{" "}
            Google
          </Button>
        </>
      )}
    </div>
  );
}
