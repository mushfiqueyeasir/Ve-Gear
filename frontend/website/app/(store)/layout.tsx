import Header from "@/components/Common/Header/Header";
import Footer from "@/components/Common/Footer";
import StoreScrollShell from "@/components/Common/StoreScrollShell";
import PromotionModalWrapper from "@/components/Common/PromotionModalWrapper";
import ChatPlugins from "@/components/Common/ChatPlugins";
import CursorGlow from "@/components/HomePage/CursorGlow";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { CustomSecurity } from "@/utility/security/scripts";
import { Analytics } from "@/utility/analytics/analyticsScript";
import { getPromotions } from "@/utility/getPromotion";
import { getCategories } from "@/utility/getCategory";
import { getSiteSettings } from "@/utility/getSettings";

// Catalog + CMS change constantly — never statically cache storefront pages.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [promotions, categories, settings] = await Promise.all([
    getPromotions(),
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <CurrencyProvider currencies={settings.currencies}>
      <div className="relative bg-background text-foreground">
        {settings.analytics_enabled && (
          <Analytics
            googleAnalyticsId={settings.google_analytics_id}
            metaPixelId={settings.meta_pixel_id}
            gtmId={settings.gtm_id}
          />
        )}
        {settings.security_enabled && <CustomSecurity />}

        <CursorGlow />
        <StoreScrollShell>
          <Header categories={categories} settings={settings} />
          <div className="min-h-[60vh]">{children}</div>
          <Footer settings={settings} />
        </StoreScrollShell>
        <PromotionModalWrapper promotions={promotions} />
        <ChatPlugins widgets={settings.chatWidgets} />
      </div>
    </CurrencyProvider>
  );
}
