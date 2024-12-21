'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const errorMessages: { [key: string]: string } = {
  default: 'An unexpected error occurred during authentication.',
  'session-missing': 'Your login session is missing or has expired.',
  'invalid-code': 'The authentication code is invalid or has expired.',
  'user-not-found': 'No user account was found with the provided credentials.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('error') || 'default';

  const errorMessage = errorMessages[errorType] || errorMessages.default;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[640px]">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Icons.warning className="h-12 w-12 text-destructive" />
            <CardTitle>认证错误</CardTitle>
          </div>
          <CardDescription>
            认证过程中出现错误，请重试或联系支持。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{errorMessage}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            重新登录
          </Link>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            返回首页
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
