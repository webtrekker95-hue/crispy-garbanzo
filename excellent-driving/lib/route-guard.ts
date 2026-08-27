/**
 * Pure route-protection decision used by proxy.ts (Next.js 16's renamed
 * middleware convention). Extracted so the role-check logic is
 * unit-testable without spinning up a real request/response cycle.
 *
 * Returns the pathname to redirect to, or null if the request is allowed
 * to proceed as-is.
 */
export function decideRedirect(pathname: string, role: string | undefined): string | null {
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return "/login";
  }

  if (pathname.startsWith("/student") && role !== "STUDENT") {
    return "/login";
  }

  return null;
}
