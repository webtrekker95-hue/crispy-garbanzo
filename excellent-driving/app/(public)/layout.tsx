import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import "./public-shared.css";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteNav />
      {children}
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
