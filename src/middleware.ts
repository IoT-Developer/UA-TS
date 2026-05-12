import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Protected routes — require authentication.
// Marketing pages remain public.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/learn(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};