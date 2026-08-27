import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const locales = ["en", "nl"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale as Locale;
  }

  // No cookie yet — a logged-in user's stored preference wins next.
  const session = await getServerSession(authOptions);
  if (session?.user?.language) {
    const stored = session.user.language.toLowerCase();
    if ((locales as readonly string[]).includes(stored)) return stored as Locale;
  }

  // Otherwise default to the browser's Accept-Language.
  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  if (acceptLanguage.toLowerCase().startsWith("nl") || acceptLanguage.toLowerCase().includes(",nl")) {
    return "nl";
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
