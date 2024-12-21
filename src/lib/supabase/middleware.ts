import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Add public routes that don't require authentication
const publicRoutes = ['/auth', '/discover'];

export async function updateSession(request: NextRequest) {
    try {
        // Check if the route is public
        const isPublicRoute = publicRoutes.some(route => 
            request.nextUrl.pathname.startsWith(route)
        );

        // Create a response with the current request
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        });

        // Create Supabase client
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: any) {
                        // If the cookie is being deleted, get the cookie options
                        if (!value) {
                            const cookie = request.cookies.get(name);
                            if (cookie) {
                                response.cookies.set({
                                    name,
                                    value: '',
                                    ...options,
                                    maxAge: 0,
                                });
                            }
                        } else {
                            response.cookies.set({
                                name,
                                value,
                                ...options,
                            });
                        }
                    },
                    remove(name: string, options: any) {
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                            maxAge: 0,
                        });
                    },
                },
            }
        )

        // Refresh the session
        const { data: { session }, error } = await supabase.auth.getSession();

        // If there's no session and the route isn't public, redirect to login
        if (!session && !isPublicRoute) {
            const redirectUrl = new URL('/auth/login', request.nextUrl.origin);
            redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(redirectUrl);
        }

        return response;

    } catch (e) {
        console.error('Middleware error:', e);
        // On error, allow the request to continue
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }
}