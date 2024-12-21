import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("redirect") || "/";
  
  // If we have a code, exchange it for a session
  if (code) {
    const supabase = await createClient();
    
    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);
      
      // Redirect to the original URL
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    } catch (error) {
      console.error("Error in auth callback:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/error?error=session-error&description=${encodeURIComponent('Failed to create session')}`
      );
    }
  }

  // If we have an error from OAuth provider
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  
  if (error) {
    console.error("OAuth error:", { error, errorDescription });
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`
    );
  }

  // If we have no code and no error, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`);
}
